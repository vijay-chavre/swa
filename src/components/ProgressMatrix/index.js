import React, { Component } from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import axios from 'axios';
import moment from 'moment';
import browser from 'detect-browser';
import StudentHeader from '../StudentHeader';
import StudentNav from '../Shared/StudentNav';
import { fetchProficiencyMatrix, sliderChanged } from '../../actions/proficiencyMatrix';
import Topic from './Topic';
import Footer from '../Footer';
import config from '../../constants/config';
import Dialog from '../Shared/Dialog';
import LoadingSpinner from '../Shared/Glyphs/LoadingSpinner';
import * as Localization from '../Shared/Localization';
import * as Common from '../Shared/Common';
import * as features from '../../constants/feature';
import MMSlider from './MMSlider';


class ProgressMatrix extends Component {

  static propTypes = {
    fetchProficiencyMatrix: React.PropTypes.func,
    student: React.PropTypes.shape({
    }),
    user: React.PropTypes.shape({
    }),
    proficiencyMatrix: React.PropTypes.array,
    session: React.PropTypes.shape({
    }),
  }

  constructor(props) {
    super(props);
    const grade = this.getGrade(props.student);
    this.state = {
      selected_grade: grade,
      showDialog: false,
      dialogHTML: '',
      dialogId: '',
      cancelButtonLabel: '',
      acceptButtonLabel: '',
      concept: undefined,
      loading: false,
      sliderValue: props.testingPeriods ? props.testingPeriods.length : 0,
    };
  }

  getGrade(student) {
    if (student.locale_code === 'ZA' && student.assessment_grade === 'K') {
      return 'R';
    }
    return student.assessment_grade;
  }

  componentDidMount() {
    Raven.setUserContext({ id: this.props.student._id });
    dataLayer.push({
      uid: this.props.student._id, // i.e. 9a7db70816960ff2b7697cc14d0ecd1d
      event: 'swaViewProgressMatrix',
    });
    const { student } = this.props;
    if (Common.isPurchaseOfTypeProduct(student)) {
      this.fetchMatrix(student.grade, student.curriculum_type || '');
    } else {
      this.fetchMatrix(this.state.selected_grade, '');
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.testingPeriods != null) {
      this.setState({ sliderValue: nextProps.testingPeriods.length });
    }
  }

  onAcceptDialog = () => {
    if (this.state.dialogId === '100') {
      const { student } = this.props;
      if (Common.authorized(student, features.REQUEST_WORKSHEET)) {
        const ticket = this.supportTicketForRequestAssignment(this.state.concept);
        this.state.loading = true;
        this.sendSupportTicket(ticket).then((response) => {
          this.state.loading = false;
          this.setState({ showDialog: true, dialogMessage: 'Your request for worksheets has been received. You will receive new worksheets soon.' });
        })
        .catch((err) => {
          this.state.loading = false;
          this.setState({ showDialog: true, dialogMessage: 'Error in requesting worksheets. Please try later.' });
          console.log(err);
        });
      }
    }
    this.state.concept = undefined;
    this.setState({ showDialog: false, dialogHTML: '', dialogMessage: '', dialogId: '', acceptButtonLabel: undefined, cancelButtonLabel: undefined, dialogNoButton: false });
  }

  onCancelDialog = () => {
    this.state.concept = undefined;
    this.setState({ showDialog: false, dialogMessage: '', dialogHTML: '', dialogId: '', acceptButtonLabel: undefined, cancelButtonLabel: undefined, dialogNoButton: false });
  }

  onRequestWorksheets = (concept) => {
    this.state.concept = concept;
    this.state.dialogHTML =
    (<div>
      <h3 className="a-p(14)">
        <strong>{concept.concept_name}</strong>
      </h3>
      <p className="a-p(14)">
        {concept.concept_description}
      </p>
    </div>);
    this.setState({ showDialog: true,
      isGarbageOn: true,
      dialogId: '100',
      acceptButtonLabel: 'Request',
      cancelButtonLabel: 'Cancel',
    });
  }

  getGetOrdinal = (n) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return <span>{n}<sup>{(s[(v - 20) % 10] || s[v] || s[0])}</sup></span>;
  }

  gradeLabel = () => {
    const { student } = this.props;
    let grade = this.state.selected_grade;
    if (student.locale_code === 'GB') {
      grade = grade === 'K' ? 1 : parseInt(grade, 10) + 1;
    }
    if (grade && grade.toString().toLowerCase() === 'k') {
      if (config.isViaAfrika) {
        return 'R';
      }
      return grade;
    }
    return this.getGetOrdinal(grade);
  }


  fetchMatrix(grade, curriculumType) {
    const { student } = this.props;
    this.props.fetchProficiencyMatrix({ studentId: student._id, grade, curriculumType });
  }
  supportTicketCC = () => ['sumi@hellothinkster.com', 'kiran@hellothinkster.com', 'rupa@hellothinkster.com', 'kendra@hellothinkster.com', 'annie@hellothinkster.com']
  supportTicketForRequestAssignment = (concept) => {
    const { student, user } = this.props;
    const ticket = {};
    ticket.body = `Grade: ${this.state.selected_grade}
            Concept: ${concept.concept_name}
            Profile ID: ${student._id}
            Profile Name: ${student.first_name} ${student.last_name}
            Class: ${student.classes_assigned ? student.classes_assigned.name : ''}
            User ID: ${user._id}
            App Version: StudentWebApp/${config.appversion}
            Browser: ${browser.name} ${browser.version}
            Date: ${moment().utcOffset(0).format('YYYY-MM-DDTHH:mm:ss[Z]')}`;
    ticket.subject = `Assignment request from User ${user.first_name} ${user.last_name}`;
    ticket.name = `${user.first_name} ${user.last_name}`;
    ticket.email = user.email_address;
    ticket.cc = this.supportTicketCC();
    return ticket;
  }
  sendSupportTicket = (ticket) => {
    const { session } = this.props;
    return axios({
      method: 'post',
      baseURL: ENV.apiEndPoint,
      url: 'v1/zendesk/ticket',
      headers: { Authorization: `JWT ${session.token}` },
      data: ticket,
    });
  }

  sliderChanged(sliderValue) {
    this.setState({ sliderValue });
  }

  render() {
    const { proficiencyMatrix, student, testingPeriods } = this.props;
    let hideGrade = false;
    if (Common.isPurchaseOfTypeProduct(student)) {
      hideGrade = student.hide_grade;
    }
    return (
      <div>
        <Helmet
          title="Student Progress Matrix | Thinkster Math"
          meta={[
            { name: 'description', content: 'Student Progress Matrix and Roadmap on Thinkster Math.' },
          ]}
        />
        <StudentHeader currentNavigation={features.MASTERY_MATRIX} />
        <StudentNav currentSelectedFeature={features.MASTERY_MATRIX} />
        <Dialog
          show={this.state.showDialog}
          htmlBody={this.state.dialogHTML}
          message={this.state.dialogMessage}
          onAccept={this.onAcceptDialog}
          acceptButtonLabel={this.state.acceptButtonLabel}
          cancelButtonLabel={this.state.cancelButtonLabel}
          onCancel={this.onCancelDialog}
          noButtons={this.state.dialogNoButton}
        />
        <div className="a-appView a-appView--hasSidebar">
          <div className="a-appView__contents">
            <div className={`o-loadingScreenModal o-loadingScreenModal--${this.state.loading ? 'show' : 'hide'}`}>
              <LoadingSpinner />
            </div>
            <div className="a-container a-container--full">
              <header className="a-viewHeader o-progressMatrix__header">
                <h1 className="a-h(28)">
                  { hideGrade ? `${student.first_name}  ${Localization.localizedStringForKey('Progress Report')}` :
                    <span>{student.first_name}’s {this.gradeLabel(this.state.selected_grade)} {Localization.localizedStringForKey('Grade')} {Localization.localizedStringForKey('Progress Report')}</span>
                  }
                </h1>
              </header>
              {testingPeriods != null ?
                <div className="row">
                  <div className="col-md-12" style={{ paddingBottom: '50px', paddingTop: '20px', paddingLeft: '80px', paddingRight: '80px' }}>
                    <MMSlider onChange={this.sliderChanged.bind(this)} testingPeriods={testingPeriods} /></div>
                </div> : ''}
              { hideGrade ? '' :
              <div className="o-progressMatrix__gradeSelector">
                <select value={this.state.selected_grade} onChange={(e) => { this.setState({ selected_grade: e.currentTarget.value }); this.fetchMatrix(e.currentTarget.value, ''); }}>
                  <option value="">       {Localization.localizedStringForKey('Select')}             </option>
                  <option value={config.isViaAfrika ? 'R' : 'K'}>{config.isViaAfrika ? 'R' : student.locale_code === 'GB' ? '1' : 'K'}</option>
                  <option value="1">{student.locale_code === 'GB' ? '2' : '1'}</option>
                  <option value="2">{student.locale_code === 'GB' ? '3' : '2'}</option>
                  <option value="3">{student.locale_code === 'GB' ? '4' : '3'}</option>
                  <option value="4">{student.locale_code === 'GB' ? '5' : '4'}</option>
                  <option value="5">{student.locale_code === 'GB' ? '6' : '5'}</option>
                  <option value="6">{student.locale_code === 'GB' ? '7' : '6'}</option>
                  <option value="7">{student.locale_code === 'GB' ? '8' : '7'}</option>
                  <option value="8">{student.locale_code === 'GB' ? '9' : '8'}</option>
                </select>
              </div>
              }
              <div className="o-progressMatrix__keys">
                <div className="o-progressMatrix__key o-progressMatrix__key--high">
                  100% &ndash; 91%
                </div>
                <div className="o-progressMatrix__key o-progressMatrix__key--medium">
                  90% &ndash; 61%
                </div>
                <div className="o-progressMatrix__key o-progressMatrix__key--mediumLow">
                  60% &ndash; 31%
                </div>
                <div className="o-progressMatrix__key o-progressMatrix__key--low">
                  30% &ndash; 0%
                </div>
                <div className="o-progressMatrix__key">
                  {Localization.localizedStringForKey('Not Tested')}
                </div>
              </div>
              {proficiencyMatrix && proficiencyMatrix.map((topic) => <Topic key={topic.topic_id} topic={topic} testingPeriods={testingPeriods} sliderValue={this.state.sliderValue} onRequestWorksheets={this.onRequestWorksheets} />)}
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  student: state.student,
  user: state.user,
  proficiencyMatrix: state.proficiencyMatrix[state.student._id] ? state.proficiencyMatrix[state.student._id].masterydetail : null,
  testingPeriods: state.proficiencyMatrix[state.student._id] ? state.proficiencyMatrix[state.student._id].testingPeriods : null,
  session: state.session,
  loading: state.loading,
});

const actionCreators = {
  fetchProficiencyMatrix,
  sliderChanged,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(ProgressMatrix);

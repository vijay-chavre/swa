import React, { Component } from 'react';
import { connect } from 'react-redux';
import AssignmentNode from '../AssignmentNode';
import SubmissionNode from '../SubmissionNode';
import Tutorial from '../StudentTimeline/Tutorial';
import StudentHeader from '../StudentHeader';
import StudentNav from '../Shared/StudentNav';
import Footer from '../Footer';
import LoadingSpinner from '../Shared/Glyphs/LoadingSpinner';
import config from '../../constants/config';
import * as Localization from '../Shared/Localization';
import * as Common from '../Shared/Common';
import { workflowCompleted } from '../../actions/studentWorkflow';
import * as features from '../../constants/feature';
import Dialog from '../Shared/Dialog';

class ProductTimeline extends Component {

  static propTypes = {
    workflowCompleted: React.PropTypes.func,
    product: React.PropTypes.shape({
    }),
    user: React.PropTypes.shape({
    }),
    studentWorkflow: React.PropTypes.shape({
    }),
    session: React.PropTypes.shape({
    }),
  }

  constructor(props) {
    super(props);
    this.state = {
      showTutorial: this.showGuestFlowTutorial(),
      tabs: this.initializeTabs(),
      activeTab: undefined,
      showDialog: false,
      dialogMessage: '',
    };
  }

  componentDidMount() {
    Raven.setUserContext({ id: this.props.product._id });
  }

  onAcceptDialog = () => {
    this.setState({ showDialog: false, dialogMessage: '', dialogId: '' });
  }

  onCloseTutorial = () => {
    const workflow = {};
    workflow.key = 'guest_tutorial_shown';
    workflow.value = true;
    this.props.workflowCompleted(workflow);

    this.setState({ showTutorial: false });
  }

  onTabClick = (key) => {
    const { product } = this.props;
    if (key === 'reviewed' && !Common.authorized(product, features.TEACHER_FEEDBACK)) {
      this.setState({
        showDialog: true,
        dialogMessage: 'Your current plan is not eligible for this feature. Please upgrade to Personalized Tutor-Led program to use this feature.',
      });
    } else {
      this.setState({ activeTab: key });
    }
  }

  showGuestFlowTutorial = () => {
    const { studentWorkflow } = this.props;
    if (this.isGuestFlow()) {
      if (!studentWorkflow.guest_tutorial_shown) {
        return false; // not showing it
      }
    }
    return false;
  }

  initializeTabs = () => {
    const tabs = [];
    let timelineTab = {};

    timelineTab.key = 'assigned';
    timelineTab.name = Localization.localizedStringForKey('Assigned');
    tabs.push(timelineTab);

    timelineTab = {};
    timelineTab.key = 'submitted';
    timelineTab.name = Localization.localizedStringForKey('Submitted');
    tabs.push(timelineTab);

    timelineTab = {};
    timelineTab.key = 'reviewed';
    timelineTab.name = Localization.localizedStringForKey('Coach Feedback');
    tabs.push(timelineTab);

    return tabs;
  }

  assignedWorksheetsCount() {
    const { product } = this.props;
    let total = 0;
    if (product) {
      total += product.submissions ? product.submissions.length : 0;
      if (product.playlists) {
        product.playlists.forEach((playlist) => {
          total += playlist.worksheets.length;
        });
      }
    }
    return total;
  }

  submittedWorksheetsCount() {
    const { product } = this.props;
    if (product && product.submissions) {
      return product.submissions.length;
    }
    return 0;
  }

  tabsForTimeline = () => {
    const timelineTabs = [];
    this.state.tabs.forEach((tab) => {
      let tabClassname = '';
      if (tab.key === this.state.activeTab) {
        tabClassname = 'sessionActiveContent';
      }
      timelineTabs.push(
        <li className={tabClassname}>
          <span onClick={() => { this.onTabClick(tab.key); }}>
            {Localization.localizedStringForKey(tab.name)}
          </span>
        </li>
      );
    });
    return timelineTabs;
  }
  worksheetsCountForPlaylist = (playlist) => {
    const { product } = this.props;
    let count = 0;
    if (this.state.activeTab === 'assigned' || this.state.activeTab === 'all') {
      count = (playlist.worksheets ? playlist.worksheets.length : 0);
    } else if (this.state.activeTab === 'submitted') {
      if (product && product.submissions) {
        product.submissions.map((submission) => {
          if (submission.playlist_id === playlist.id && !submission.date_teacher_reviewed) {
            count += 1;
          }
        });
      }
    } else if (this.state.activeTab === 'reviewed') {
      if (product && product.submissions) {
        product.submissions.map((submission) => {
          if (submission.playlist_id === playlist.id && submission.date_teacher_reviewed) {
            count += 1;
          }
        });
      }
    }

    return count;
  }


  nodesForTab = (tab) => {
    const { product, studentWorkflow } = this.props;
    const nodes = [];
    if (tab === 'assigned') {
      if (product && product.playlists) {
        let maxPlaylistWorksheets = 0; // for alternate display of worksheets from each playlist
        product.playlists.map((playlist) => {
          if (playlist.worksheets.length > maxPlaylistWorksheets) {
            maxPlaylistWorksheets = playlist.worksheets.length;
          }
        });
        for (let i = 0; i < maxPlaylistWorksheets; i++) {
          product.playlists.forEach((playlist) => {
            if (playlist.worksheets.length > i) {
              const assignment = playlist.worksheets[i];
              nodes.push(<AssignmentNode key={assignment.id} locked={false} student={product} assignment={assignment} />);
            }
          });
        }
      }
      this.state.showAssignmentTimer = false;
      if (nodes.length <= 0) {
        nodes.push(<span>{Localization.localizedStringForKey('You do not have any assigned worksheets currently. Your coach is in the process of updating your study plan.')}</span>);
      }
    } else if (tab === 'submitted') {
      if (product && product.submissions) {
        product.submissions.map((submission) => {
          if (!submission.date_teacher_reviewed) {
            nodes.push(<SubmissionNode key={submission._id} student={product} submission={submission} />);
          }
        });
      }
    } else if (tab === 'reviewed') {
      if (product && product.submissions) {
        product.submissions.map((submission) => {
          if (submission.date_teacher_reviewed) {
            nodes.push(<SubmissionNode key={submission._id} student={product} submission={submission} />);
          }
        });
      }

      if (nodes.length <= 0 && this.state.defaultPlaylist === this.state.activePlaylist) {
        nodes.push(<span>{Localization.localizedStringForKey('Did you submit any work recently? If yes, your coach is currently reviewing your worksheets. Please check later.')}</span>);
      }
    }

    return nodes;
  }

  isGuestFlow = () => {
    const { user } = this.props;
    return Common.isGuest(user);
  }

  render() {
    const { product } = this.props;
    const assignedWorksheetsCount = this.assignedWorksheetsCount();
    const submittedWorksheetsCount = this.submittedWorksheetsCount();
    if (!this.state.activeTab) {
      this.state.activeTab = this.state.tabs[0].key;
    }
    return (
      <div>
        <Dialog
          show={this.state.showDialog}
          message={this.state.dialogMessage}
          onAccept={this.onAcceptDialog}
        />
        <Tutorial
          show={this.state.showTutorial}
          onCloseTutorial={this.onCloseTutorial}
        />
        <StudentHeader studentLocale={config.locale} />
        <StudentNav studentLocale={config.locale} currentSelectedFeature={features.WORKSHEET} studentType={'product'} />

        <div className="a-appView a-appView--altBG a-appView--hasSidebar">
          <div className="a-appView__contents">
            <div className={`o-loadingScreenModal o-loadingScreenModal--${this.props.loading && this.props.loading.isLoading ? 'show' : 'hide'}`}>
              <LoadingSpinner />
            </div>
            <header className="o-tabHeader">
              <h1 className="a-h(28)">
                {product.product_name} {Localization.localizedStringForKey('Workbook')}
              </h1>

              <div className="o-topicSelector">
                <ul className="sessionTabsContentLnk">
                  {this.tabsForTimeline()}
                </ul>
              </div>
            </header>
            <div className="a-container a-container--full">
              <div className="o-topicSelector o-productWorkbook">
                <div className="b-progressDisplay">
                  <div className="b-progressDisplay__readOut">
                    {assignedWorksheetsCount > 0 ? Math.floor(submittedWorksheetsCount / assignedWorksheetsCount * 100) : '-'}<span className="b-progressDisplay__percent">%</span>
                  </div>
                  <h3 className="a-h(22) b-progressDisplay__header">
                    {Localization.localizedStringForKey('Progress')}
                    <span className="a-p(14) b-progressDisplay__details">
                      {submittedWorksheetsCount} of {assignedWorksheetsCount} {Localization.localizedStringForKey('Complete')}
                    </span>
                  </h3>
                </div>
              </div>

              <section className="a-row a-justifyContent(center)">
                {this.nodesForTab(this.state.activeTab)}
              </section>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }
}
const mapStateToProps = (state) => ({
  user: state.user,
  session: state.session,
  product: state.student,
  studentWorkflow: state.studentWorkflow,
  loading: state.loading,
});

const actionCreators = {
  workflowCompleted,
};

export default connect(
  mapStateToProps,
  actionCreators
)(ProductTimeline);

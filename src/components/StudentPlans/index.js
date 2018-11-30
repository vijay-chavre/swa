import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router';
import ThinksterLogomark from '../Shared/Glyphs/ThinksterLogomark';
import ThinksterWordmark from '../Shared/Glyphs/ThinksterWordmark';
import ArrowRight from '../Shared/Glyphs/ArrowRight';
import * as Localization from '../Shared/Localization';
import * as SessionActions from '../../actions/session';
import * as StudentActions from '../../actions/student';
import lodash from 'lodash';

class StudentPlans extends Component {

  static propTypes = {
    logout: React.PropTypes.func,
    session: React.PropTypes.shape({
      user_id: React.PropTypes.string,
    }),
    user: React.PropTypes.shape({

    }),
  }

  getCurrency(studentId) {
    const { user } = this.props;

    if (user && user.students && user.students[studentId] && user.planDetails && user.planDetails[studentId] && user.planDetails[studentId].currency) { return user.planDetails[studentId].currency.symbol_native; }
    return '-';
  }
  getGrade(grade) {
    const { user } = this.props;
    if (grade && user.country_code) {
      // if(user.country_code == 'GB'){
      //   grade = grade == 8 ? (parseInt(grade, 10) + 1).toString() : grade;
      // }
      return grade;
    } else { return ''; }
  }

  getPaymentInfo(studentId) {
    const { user } = this.props;
    let amount = '-';
    let frequency = '-';

    if (user && user.students && user.students[studentId] && user.planDetails && user.planDetails[studentId]) {
      amount = this.getCurrency(studentId) + user.planDetails[studentId].amount;
      frequency = (user.planDetails[studentId].billingFrequency > 1 ? `${user.planDetails[studentId].billingFrequency} months` : ' month');
    }

    return ([<span>{amount}</span>, <span className="a-p(14) a-color(copy-2)">&nbsp;/&nbsp;{frequency}</span>]);
  }

  getSubActionText(studentId) {
    const { user } = this.props;
    if (user && user.paymentStatus && user.paymentStatus.students && user.paymentStatus.students.length > 0) {
      const index = lodash.findIndex(user.paymentStatus.students, { id: studentId });
      if (index !== -1 && (user.paymentStatus.students[index].isCanceled || !user.paymentStatus.students[index].is_active || !user.paymentStatus.students[index].isPaid)) {
        return 'Activate Account';
      }
    }
    return 'Modify Plan';
  }
  getSubAction(studentId) {
    return (<Link to={`/modify-plan/${studentId}`}>
      <span className="a-p(14)">
        {Localization.localizedStringForKey(this.getSubActionText(studentId))}
      </span>
      <ArrowRight />
    </Link>);
  }

  setNextURL(studentId, e) {
    const { saveStudentDetails } = this.props;
    const student = {
      nextURL: `/modify-plan/${studentId}`,
    };
    saveStudentDetails(student);
  }

  getPlanStatus(studentId) {
    const { user } = this.props;

    let studentIndex = -1;
    if (user.paymentStatus) {
      studentIndex = lodash.findIndex(user.paymentStatus.students, { id: studentId });
      if (studentIndex !== -1 && user.paymentStatus.students[studentIndex] &&
        user.paymentStatus.students[studentIndex].isCanceled) {
        return (<p className="o-subscription__planName a-s(12) a-allCaps">
          {Localization.localizedStringForKey('(Cancelled)')}
        </p>
        );
      }
    }
  }

  render() {
    const { user } = this.props;

    return (
      <div>

        {/*
          <SwitchModal />
        */}

        <section className="b-section">
          {/*
            BEGIN INFO FOR GOLD PLAN
          */}
          {user.students ? Object.keys(user.students).map((studentId) => (
            <div className="o-subscription o-subscription--plan(gold)">

              {/* <object className="b-avatar o-subscription__studentPortrait" data={`https://s3.amazonaws.com/${ENV.profilePictureBucket}/${user.students[studentId].student_id}.png`} name={`${user.students[studentId].student_first_name} ${user.students[studentId].student_lastname}`} type="image/png" /> */}
              <img className="b-avatar o-subscription__studentPortrait" src={`https://s3.amazonaws.com/${ENV.profilePictureBucket}/${user.students[studentId].student_id}.png`} onError="" />

              <div className="o-subscription__planInfo">
                <p className="o-subscription__student a-p(16)">
                  {`${user.students[studentId].first_name} ${user.students[studentId].last_name}`}
                  <span className="a-p(14) a-color(copy-2)">
                    {`(${Localization.localizedStringForKey('Grade')} ${this.getGrade(user.students[studentId].grade)})`}
                  </span>
                </p>
                <p className="o-subscription__planName a-s(12) a-allCaps">
                  {user.planDetails && user.planDetails[studentId] && user.planDetails[studentId].service_id ? `${user.planDetails[studentId].service_id} Plan` : (user.planDetails && user.planDetails[studentId] && user.planDetails[studentId].product_short_name ? user.planDetails[studentId].product_short_name : 'No plan selected')} {this.getPlanStatus(studentId)}
                </p>
              </div>

              <div className="o-subscription__billingInfo">
                <p className="a-p(12) a-strong a-color(copy-2)">
                  {user.students[studentId].is_active ? Localization.localizedStringForKey('Active') : Localization.localizedStringForKey('Inactive')}
                </p>
                <p className="a-p(16)" style={{ display: 'none' }}>
                  {this.getPaymentInfo(studentId)}
                </p>
              </div>

              <div className="o-subscription__actions">
                {this.getSubAction(studentId)}
              </div>

            </div>

          )) : 'No plans found'
          }
          {/*
            END INFO FOR GOLD PLAN
          */}

          {/*
            BEGIN INFO FOR NO PLAN
          */}
          {/* <div className="o-subscription o-subscription--plan(no-plan)">
            <object className="b-avatar o-subscription__studentPortrait" data='/images/glyph_user-2.svg' type="image/png">
            </object>

            <div className="o-subscription__planInfo">
              <p className="o-subscription__student a-p(16)">
                Bert
                <span className="a-p(14) a-color(copy-2)">
                  &nbsp; (Grade 1)
                </span>
              </p>
              <p className="o-subscription__planName a-s(12) a-allCaps">
                No plan selected
              </p>
            </div>

            <div className="o-subscription__billingInfo">
              <p className="a-p(12) a-strong o-subscription__planStatus">
                Pending
              </p>
              <p className="a-p(16)">
                $0
                <span className="a-p(14) a-color(copy-2)">
                  &nbsp;/&nbsp;month
                </span>
              </p>
            </div>

            <div className="o-subscription__actions">
              <Link to="">
                <span className="a-p(14) a-color(alert)">
                  Choose Plan
                </span>
                <ArrowRight />
              </Link>
            </div>
          </div>*/}
          {/*
            END INFO FOR NO PLAN
          */}

          {/*
            BEGIN INFO FOR PLATINUM PLAN
          */}
          {/* <div className="o-subscription o-subscription--plan(platinum)">
            <object className="b-avatar o-subscription__studentPortrait" data='/images/glyph_user-2.svg' type="image/png">
            </object>

            <div className="o-subscription__planInfo">
              <p className="o-subscription__student a-p(16)">
                Kermit
                <span className="a-p(14) a-color(copy-2)">
                  &nbsp; (Grade 3)
                </span>
              </p>
              <p className="o-subscription__planName a-s(12) a-allCaps">
                Platinum Plan (K-5)
              </p>
            </div>

            <div className="o-subscription__billingInfo">
              <p className="a-p(12) a-strong o-subscription__planStatus">
                Active
              </p>
              <p className="a-p(16)">
                $130
                <span className="a-p(14) a-color(copy-2)">
                  &nbsp;/&nbsp;month
                </span>
              </p>
            </div>

            <div className="o-subscription__actions">
              <Link to="">
                <span className="a-p(14)">
                  Modify Plan
                </span>
                <ArrowRight />
              </Link>
            </div>
          </div>*/}
          {/*
            END INFO FOR NO PLAN
          */}
        </section>

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  session: state.session,
  user: state.user,
});

const actionCreators = {
  logout: SessionActions.logout,
  saveStudentDetails: StudentActions.saveStudentDetails,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(StudentPlans);

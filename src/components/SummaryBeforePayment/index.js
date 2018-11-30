import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import lodash from 'lodash';
import moment from 'moment';

import ThinksterLogomark from '../Shared/Glyphs/ThinksterLogomark';
import ThinksterWordmark from '../Shared/Glyphs/ThinksterWordmark';
import Footer from '../Footer';
import config from '../../constants/config';
import * as Localization from '../Shared/Localization';
import LoadingSpinner from '../Shared/Glyphs/LoadingSpinner';

import * as StudentActions from '../../actions/student';

export class SummaryBeforePayment extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {

  }

  componentWillReceiveProps(nextProps) {

  }

  getRemainingdays(date) {
    const days = moment(date).diff(moment(), 'days') + 1;
    return (days >= 7 ? '1 week' : `${days.toString()} days`);
  }

  getPaymentDateMessage() {
    const { user, student } = this.props;
    var isLitePlan = false;
    if (this.props.user && this.props.user.userData && this.props.user.userData.data && this.props.user.userData.data.service && this.props.user.userData.data.service.toLowerCase() === 'lite') {
      isLitePlan = true;
    }
    if (user && user.paymentStatus && user.paymentStatus.inTrial && !user.paymentStatus.isCanceled) {
        if (isLitePlan) {
            return ('Your card will be charged immediately.');
        }
        else {
            return (`Thinkster Math is 100% Free for ${this.getRemainingdays(this.props.user.paymentStatus.firstBillingDate ? this.props.user.paymentStatus.firstBillingDate : this.props.user.paymentStatus.end_date)}.  Your Credit card will be charged on ${moment(this.props.user.paymentStatus.firstBillingDate ? this.props.user.paymentStatus.firstBillingDate : moment(this.props.user.paymentStatus.end_date).add(1, 'days')).format('LL')}.\n You can Cancel anytime.`);
                // return (`Your account will be charged on ${moment(user.paymentStatus.firstBillingDate ? user.paymentStatus.firstBillingDate : user.paymentStatus.end_date).format('LL')}`);
        }
        // return 'Your account will be charged immediately.';
      }
  }

  getStudentGrade(index) {
    const { user } = this.props;
    if (user && user.paymentStatus && user.paymentStatus.students && user.paymentStatus.students[index]) {
        return user.paymentStatus.students[index].grade;
      }
    return '';
  }

  getUserPlan() {
    const { user } = this.props;
    if (user && user.userData && user.userData.data && user.userData.data.service) {
        return `${user.userData.data.service} Plan`;
      }
    return 'Gold Plan';
  }

  getPlans() {
    const { user, addons } = this.props;
    let grade = (user && user.paymentStatus && user.paymentStatus.students && user.paymentStatus.students.length > 0 ? user.paymentStatus.students[0].grade : null);
    if (grade && grade.toString().toLowerCase() == 'k') {
        grade = 0;
      } else if (grade) {
          grade = parseInt(grade, 10);
        }

    if (addons.addons) {
        const gradeRange = Object.keys(addons.addons);
        let key = null;
        let plans = [];
        let planNames;
        for (let i = gradeRange.length - 1; i >= 0; i--) {
            const grades = gradeRange[i].split(' - ');
            if (grades[0].toLowerCase() == 'k') { grades[0] = 0; }
            if (parseInt(grades[1]) >= grade && parseInt(grades[0]) <= grade) {
                key = gradeRange[i];
                planNames = Object.keys(addons.addons[key]);
                for (let j = planNames.length - 1; j >= 0; j--) {
                    plans.push(addons.addons[key][planNames[j]][1]);
                  }
              }
          }

        plans = lodash.orderBy(plans, 'amount', 'desc');
        return plans;
      }
  }

  getAmount() {
    const { user } = this.props;
    const plans = this.getPlans();
    const currencyCode = (user && user.paymentStatus && user.paymentStatus.currency_code ? user.paymentStatus.currency_code : '');
    let planSelected;
    let planIndex;
    let serviceId = 'Gold';
    if (user && user.userData && user.userData.data && user.userData.data.service) {
      serviceId = user.userData.data.service;
    }

    for (let index = 0; index < plans.length; index++) {
        if (plans[index].service_id.toLowerCase() === serviceId.toLowerCase()) {
            plans[index].checked = true;
            planSelected = plans[index];
            planIndex = index;
            break;
          }
      }

    return (currencyCode + plans[planIndex].amount);
  }

  redirectToPayment(e) {
    const { saveStudentDetails } = this.props;
    const studentData = {
        nextURL: '/thank-you',
      };
    saveStudentDetails(studentData);
    browserHistory.push('/payment/5');
  }

  render() {
    const { student } = this.props;
    return (
        <div>

            <header className="o-appHeader">

                {config.isViaAfrika ?
                    <div className="o-loginBox__logo o-thinkster o-thinkster--stacked">
                        <img width="200px" src={`/images/${config.appBannerLogo}`} />
                      </div> :
                      <Link to="/" className="o-appHeader__logo o-thinkster" title="Thinkster">
                          <ThinksterLogomark />
                          <ThinksterWordmark />
                        </Link>
                    }

                <ul className="o-appHeader__actions">
                    <li className="o-appHeader__actionItem o-appHeader__profile">
                        <div className="o-appHeader__profileName" title="Parent Settings">
                            {Localization.localizedStringForKey('Parent Settings')}
                          </div>
                        <img className="b-avatar b-avatar--size(32) o-appHeader__profilePortrait" src="/images/glyph-parent-setting.svg" type="image/png" />
                      </li>
                  </ul>

              </header>
            <div className="a-appView a-appView--altBG a-appView--hasSidebar">
                <div className="a-appView__contents">
                    <div className={`o-loadingScreenModal o-loadingScreenModal--${(this.state && this.state.addingStudent) || (this.props.user && !this.props.user.fetchedPaymentStatus) ? 'show' : 'hide'}`}>
                        {/* Loading screen animation notification
                  - Use className 'o-modal--hide' to hide modal
                  - Use className 'o-modal--show' to show modal
                */}
                        <LoadingSpinner />
                      </div>
                    {/*
            BEGIN ADD STUDENT WIZARD
            */}

                    <div className="a-container">
                        <header className="a-viewHeader">
                            <h1 className="a-h(28)">
                                    Order Summary
                </h1>
                          </header>
                      </div>

                    {/*
            END ADD STUDENT WIZARD
            */}


                    <div className="a-container">
                        <div className="a-row a-justifyContent(center)">
                            <div className="a-col a-col(2-3) a-col-med-1(1-2)">
                                <p className="a-p(16) a-justify(center)">
                                        Here&rsquo;s your order summary
                          </p>
                                <p className="a-p(14) a-color(copy-2) a-justify(center) b-section__title">
                                    {this.getPaymentDateMessage()}
                                  </p>

                                {this.props.user && this.props.user.paymentStatus && this.props.user.paymentStatus.students && this.props.user.paymentStatus.students.length > 0 ? this.props.user.paymentStatus.students.map((student, index) => (
                                    <div className="o-subscription o-subscription--plan(gold)">

                                        <img className="b-avatar b-avatar--size(32) o-subscription__studentPortrait" src="/images/glyph_user-2.svg" type="image/png" />

                                        <div className="o-subscription__planInfo o-subscription__planInfo--summary">
                                            <p className="o-subscription__student a-p(16)">
                                                {student.first_name}
                                                <span className="a-p(14) a-color(copy-2)">
                                                        &nbsp; ({Localization.localizedStringForKey('Grade')} {this.getStudentGrade(index)})
                                                    </span>
                                              </p>
                                            <p className="o-subscription__planName a-s(12) a-allCaps">
                                                {this.getUserPlan()}
                                              </p>
                                          </div>

                                        <div className="o-subscription__billingInfo o-subscription__billingInfo--summary">
                                            <p className="a-p(12) a-strong a-color(copy-2)">
                                                {Localization.localizedStringForKey('Active')}
                                              </p>
                                            <p className="a-p(16)">
                                                {this.getAmount()}
                                                <span className="a-p(14) a-color(copy-2)">
                                                        &nbsp; / {Localization.localizedStringForKey('month')}
                                                  </span>
                                              </p>
                                          </div>
                                      </div>
                                    )) : ''}
                                < div className="o-subscription__actions o-subscription__actions--summary" >
                                    <button type="button" className="b-flatBtn b-flatBtn--large b-flatBtn--gradient(active-1)" onClick={this.redirectToPayment.bind(this)}>
                                            <span className="b-button__label a-allCaps">
                                                Add Credit Card Information
                              </span>
                                          </button>
                                  </div>

                              </div>
                          </div>
                      </div>


                    {/*
            BEGIN ORDER SUMMARY
            */}


                    {/*
            END ORDER SUMMARY
            */}

                  </div>
                <Footer />

              </div>


          </div>

      );
  }
}

const mapStateToProps = (state) => ({
  session: state.session,
  user: state.user,
  addons: state.addons,
  student: state.student,
});

const actionCreators = {
  saveStudentDetails: StudentActions.saveStudentDetails,
};

export default connect(
    mapStateToProps,
    actionCreators,
)(SummaryBeforePayment);

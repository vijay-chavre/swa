import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';

import lodash from 'lodash';
import moment from 'moment';

import ThinksterLogomark from '../Shared/Glyphs/ThinksterLogomark';
import ThinksterWordmark from '../Shared/Glyphs/ThinksterWordmark';
import ParentNav from '../Shared/ParentNav';
import ArrowRight from '../Shared/Glyphs/ArrowRight';
import Footer from '../Footer';
import config from '../../constants/config';
import * as Localization from '../Shared/Localization';
import LoadingSpinner from '../Shared/Glyphs/LoadingSpinner';

import * as StudentActions from '../../actions/student';
import * as MailActions from '../../actions/mail';
import * as ZendeskActions from '../../actions/zendesk';

export class CancelPlan extends Component {

  static propTypes = {
    cancelSubscription: React.PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = { showModal: 'hide' };
  }


  componentWillReceiveProps(nextProps) {
    if (this.state && this.state.cancellingSubscription && nextProps && nextProps.student && (nextProps.student.cancelledSubscription || nextProps.student.cancelSubscriptionFailed || nextProps.student.cancelSubscriptionNotified || nextProps.student.cancelSubscriptionNotificationFailed)) {
      this.setState({ cancellingSubscription: false, showCancelledModal: 'show' });
    }
  }

  cancelPlan(e) {
    const { sendCancelNotification, cancelSubscription, user, sendMail, createZendeskTicket } = this.props;
    const reasons = [];
    reasons.push({ category: 'coach_ability', reason: (this.state.coach_ability != '' && this.state.coach_ability != null ? this.state.coach_ability : 'none') });
    reasons.push({ category: 'assignment_choices', reason: (this.state.assignment_choices != '' && this.state.assignment_choices != null ? this.state.assignment_choices : 'none') });
    reasons.push({ category: 'fit_into_schedule', reason: (this.state.fit_into_schedule != '' && this.state.fit_into_schedule != null ? this.state.fit_into_schedule : 'none') });
    reasons.push({ category: 'child_lost_motivation', reason: (this.state.child_lost_motivation != '' && this.state.child_lost_motivation != null ? this.state.child_lost_motivation : 'none') });
    reasons.push({ category: 'used_summer_months_only', reason: (this.state.used_summer_months_only != '' && this.state.used_summer_months_only != null ? this.state.used_summer_months_only : 'none') });
    reasons.push({ category: 'feedback', reason: (this.state.feedback != '' && this.state.feedback != null ? this.state.feedback : 'none') });

    //this.setState({ cancellingSubscription: true });

          const parentName = `${user.first_name} ${user.last_name}`;
          let studentIndex = lodash.findIndex(user.paymentStatus.students, { id: this.props.params.studentId });
          const data = {
            subject: 'User feedback given after cancellation',
            body: `Name: ${this.props.user ? `${this.props.user.first_name} ${this.props.user.last_name}` : ''}\n` +
            `Email Address: ${this.props.user ? this.props.user.email_address : ''}\n` +
            `StudentId: ${this.props.params ? this.props.params.studentId : ''}\n` +
            `Student's Name: ${this.props.user && this.props.user.students ? this.props.user.students[this.props.params.studentId].first_name + ' ' + this.props.user.students[this.props.params.studentId].last_name : ''}\n` +
            `User Id: ${this.props.user ? this.props.user.userId : ''}\n` +
            `Next Billing Date: ${moment(user.paymentStatus.nextBillingDate).format('LL')}\n` +
            `Plan: ${this.props.user && this.props.user.students ? this.props.user.students[this.props.params.studentId].service_id : ''}\n` +
            `Status: ${studentIndex != -1 ? (user.paymentStatus.students[studentIndex].is_on_hold ? 'On-Hold' : (user.paymentStatus.students[studentIndex].is_active ? 'Active' : 'Inactive')) : ''}\n` +
            `Teacher's Name: ${this.props.student && this.props.student.teacher ? this.props.student.teacher.first_name + ' ' + this.props.student.teacher.last_name : 'Not available'}\n` + 
            `Reasons for cancellation: \n` + 
            `Coach's ability: ${(this.state.coach_ability != '' && this.state.coach_ability != null ? this.state.coach_ability : 'none')}\n` +
            `Assignment choices: ${(this.state.assignment_choices != '' && this.state.assignment_choices != null ? this.state.assignment_choices : 'none')}\n` +
            `Fits into schedule: ${(this.state.fit_into_schedule != '' && this.state.fit_into_schedule != null ? this.state.fit_into_schedule : 'none')}\n` +
            `Child lost motivation: ${(this.state.child_lost_motivation != '' && this.state.child_lost_motivation != null ? this.state.child_lost_motivation : 'none')}\n` +
            `Used during summer months only: ${(this.state.used_summer_months_only != '' && this.state.used_summer_months_only != null ? this.state.used_summer_months_only : 'none')}\n` +
            `Feedback: ${(this.state.feedback != '' && this.state.feedback != null ? this.state.feedback : 'none')}\n`,
            user: user._id,
            name: parentName,
            email: user.email_address,
            cc: ['rupa@hellothinkster.com', 'karthik@hellothinkster.com', 'kendra@hellothinkster.com'],
          };
    
          // sendMail({ user, studentID: this.props.params.studentId, data });
          createZendeskTicket({ data });

    // const data = {
    //   from: 'info@hellothinkster.com',
    //   to: ['rupa@hellothinkster.com', 'kendra@hellothinkster.com', 'manas@hellothinkster.com', 'karthik@hellothinkster.com', 'support@hellothinkster.com'], // 'kendra@hellothinkster.com,karthik@hellothinkster.com,rupa@hellothinkster.com',
    //   subject: 'User feedback',
    //   message: `Name: ${this.props.user ? `${this.props.user.first_name} ${this.props.user.last_name}` : ''}<br />` +
    //   `Email Address: ${this.props.user ? this.props.user.email_address : ''}<br />` +
    //   `StudentId: ${this.props.params ? this.props.params.studentId : ''}<br />` +
    //   `Student's Name: ${this.props.user && this.props.user.students ? this.props.user.students[this.props.params.studentId].first_name + ' ' + this.props.user.students[this.props.params.studentId].last_name : ''}<br />` +
    //   `User Id: ${this.props.user ? this.props.user.userId : ''}<br />` +
    //   `Teacher's Name: ${this.props.student && this.props.student.teacher ? this.props.student.teacher.first_name + ' ' + this.props.student.teacher.last_name : 'Not available'}<br />` + 
    //   `Reasons for cancellation: <br />` + 
    //   `Coach's ability: ${(this.state.coach_ability != '' && this.state.coach_ability != null ? this.state.coach_ability : 'none')}<br />` +
    //   `Assignment choices: ${(this.state.assignment_choices != '' && this.state.assignment_choices != null ? this.state.assignment_choices : 'none')}<br />` +
    //   `Fits into schedule: ${(this.state.fit_into_schedule != '' && this.state.fit_into_schedule != null ? this.state.fit_into_schedule : 'none')}<br />` +
    //   `Child lost motivation: ${(this.state.child_lost_motivation != '' && this.state.child_lost_motivation != null ? this.state.child_lost_motivation : 'none')}<br />` +
    //   `Used during summer months only: ${(this.state.used_summer_months_only != '' && this.state.used_summer_months_only != null ? this.state.used_summer_months_only : 'none')}<br />` +
    //   `Feedback: ${(this.state.feedback != '' && this.state.feedback != null ? this.state.feedback : 'none')}<br />`,

    // };

    // sendMail({ user, studentID: this.props.params.studentId, data });
    this.backToPlansSection(null);

    // if (user.paymentStatus && user.paymentStatus.status && user.paymentStatus.status.toLowerCase() === 'active') {
    //   sendCancelNotification({ user, reasons, studentId: this.props.params.studentId });
    // } else {
    //   cancelSubscription({ user, reasons, studentId: this.props.params.studentId });
    // }
  }

  sendMailForContactWithCEO(type) {
    const { user, sendMail } = this.props;

    if (type == 2) {
      const data = {
        from: 'info@hellothinkster.com',
        to: 'rupa@hellothinkster.com,ramachandran@hellothinkster.com', // 'kendra@hellothinkster.com,karthik@hellothinkster.com,rupa@hellothinkster.com',
        subject: 'Parent has requested to talk with CEO before cancellation',
        message: `Name: ${this.props.user ? `${this.props.user.first_name} ${this.props.user.last_name}` : ''}<br />` +
        `Email Address: ${this.props.user ? this.props.user.email_address : ''}<br />` +
        `Phone: ${this.props.user ? this.props.user.phone : ''}<br />` +
        `StudentId: ${this.props.params ? this.props.params.studentId : ''}<br />` +
        `Student's Name: ${this.props.user && this.props.user.students ? this.props.user.students[this.props.params.studentId].first_name + ' ' + this.props.user.students[this.props.params.studentId].last_name : ''}<br />` +
        `User Id: ${this.props.user ? this.props.user.userId : ''}<br />` +
        `Next Billing Date: ${moment(user.paymentStatus.nextBillingDate).format('LL')}<br />` +
        `Teacher's Name: ${this.props.student && this.props.student.teacher ? this.props.student.teacher.first_name + ' ' + this.props.student.teacher.last_name : 'Not available'}<br />`,


      };

      sendMail({ user, studentID: this.props.params.studentId, data });
    }

    if (type == 1) {
      const data = {
        from: 'info@hellothinkster.com',
        to: 'rupa@hellothinkster.com,ramachandran@hellothinkster.com', // 'kendra@hellothinkster.com,karthik@hellothinkster.com,rupa@hellothinkster.com',
        subject: 'Parent has requested to cancel subscription but talk with CEO',
        message: `Name: ${this.props.user ? `${this.props.user.first_name} ${this.props.user.last_name}` : ''}<br />` +
        `Email Address: ${this.props.user ? this.props.user.email_address : ''}<br />` +
        `Phone: ${this.props.user ? this.props.user.phone : ''}<br />` +
        `StudentId: ${this.props.params ? this.props.params.studentId : ''}<br />` +
        `Student's Name: ${this.props.user && this.props.user.students ? this.props.user.students[this.props.params.studentId].first_name + ' ' + this.props.user.students[this.props.params.studentId].last_name : ''}<br />` +
        `User Id: ${this.props.user ? this.props.user.userId : ''}<br />` +
        `Next Billing Date: ${moment(user.paymentStatus.nextBillingDate).format('LL')}<br />` +
        `Teacher's Name: ${this.props.student && this.props.student.teacher ? this.props.student.teacher.first_name + ' ' + this.props.student.teacher.last_name : 'Not available'}<br />`,


      };

      sendMail({ user, studentID: this.props.params.studentId, data });
    }

  }

  updateFeedback(e) {
    this.setState({ feedback: e.target.value });
  }

  backToPlansSection(e) {
    browserHistory.push('/plans');
  }

  getStudentsName() {
    const { user } = this.props;
    const studentId = this.props.params.studentId;
    if (user && user.students && user.students[studentId]) {
      if (user.students[studentId].first_name != '' && user.students[studentId].first_name != null) { return (<span>{user.students[studentId].first_name}&rsquo;s {Localization.localizedStringForKey('Plan')}</span>); }
      return (<span>{user.students[studentId].student_first_name}&rsquo;s {Localization.localizedStringForKey('Plan')}</span>);
    }
  }

  goToStep(step, e) {
    switch (step) {
      case 1: browserHistory.push('/plans');
        break;
    }
  }

  getCancelMessage() {
    const { student } = this.props;
    if (this.props.student && this.props.student.cancelledSubscription) {
      return (<p className="a-p(14)">
        {Localization.localizedStringForKey('Your plan has been cancelled.')}
      </p>);
    } else if (this.props.student && this.props.student.cancelSubscriptionFailed) {
      return (<p className="a-p(14)">
        {Localization.localizedStringForKey('An error occured. Your plan could not be cancelled. Please try again later.')}
      </p>);
    } else if (this.props.student && this.props.student.cancelSubscriptionNotified) {
      return (<p className="a-p(14)">
        {Localization.localizedStringForKey('Your cancellation request has been sent to the support team. We will get in touch with you very soon.')}
      </p>);
    } else if (this.props.student && this.props.student.cancelSubscriptionNotificationFailed) {
      return (<p className="a-p(14)">
        {Localization.localizedStringForKey('An error occured. Request for cancellation could not be sent. Please try again later.')}
      </p>);
    }
  }

  render() {
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

          <div className="o-appHeader__breadcrumb">
            : &nbsp;
            <Link to="/plans" title="Manage Plans" className="a-color(copy-1)">
              {Localization.localizedStringForKey('Manage Plans')}
            </Link>
            &nbsp; : &nbsp;
            <span className="a-strong a-color(copy-1)">
              {this.getStudentsName()}
            </span>
          </div>

          <ul className="o-appHeader__actions">
            <li className="o-appHeader__actionItem o-appHeader__profile">
              <div className="o-appHeader__profileName" title="Parent Settings">
                {Localization.localizedStringForKey('Parent Settings')}
              </div>
              <img className="b-avatar b-avatar--size(32) o-appHeader__profilePortrait" src="/images/glyph-parent-setting.svg" type="image/png" />
            </li>
          </ul>

        </header>

        <ParentNav />

        <div className="a-appView a-appView--altBG a-appView--hasSidebar">
          <div className="a-appView__contents">

            <div className={`o-loadingScreenModal o-loadingScreenModal--${(this.props.loading && this.props.loading.isLoading) || (this.state && this.state.cancellingSubscription)? 'show' : 'hide'}`}>
              {/* Loading screen animation notification
                        - Use className 'o-modal--hide' to hide modal
                        - Use className 'o-modal--show' to show modal
                      */}
              <LoadingSpinner />
            </div>
            <div className="a-container">

              {/*
              BEGIN SELECT PLAN WIZARD
              */}
              <div className="o-planWizard ">
                <Link className="o-planWizard__step" to={'/plans'}>
                  <span className="b-circleBox b-circleBox--size(32) b-circleBox--size(24) b-circleBox--color(copy-2)">
                    1
                  </span>
                  <span className="o-planWizard__stepName">
                    Student Info
                  </span>
                </Link>
                <div className="o-planWizard__next">
                  <ArrowRight />
                </div>
                <Link className="o-planWizard__step o-planWizard__step" to={`/modify-plan/${this.props.params.studentId}`}>
                  <span className="b-circleBox b-circleBox--size(32) b-circleBox--size(24)">
                    2
                  </span>
                  <span className="o-planWizard__stepName">
                    Thinkster Plan
                  </span>
                </Link>
                <Link className="o-planWizard__step o-planWizard__step--current">
                  <span className="b-circleBox b-circleBox--size(32) b-circleBox--size(24)">
                    2
                  </span>
                  <span className="o-planWizard__stepName">
                    Cancel Your Account
                  </span>
                </Link>
              </div>
              {/*
              END SELECT PLAN WIZARD
              */}

              {/*
                  BEGIN MODAL FOR cancel SUBSCRIPTION DIALOG
                */}
              <div className={`o-modal o-modal--${this.state && this.state.showCancelledModal ? this.state.showCancelledModal : 'hide'}`}>
                <div className="o-modal__box o-modal__box--dialog">
                  {this.getCancelMessage()}

                  <div className="o-modal__actions">
                    <button type="button" className="b-flatBtn b-flatBtn--gradient(active-3) b-flatBtn--w(120)" onClick={this.backToPlansSection.bind(this)}>
                      <span className="b-button__label">
                        {Localization.localizedStringForKey('OK')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              {/*
                END MODAL FOR cancel SUBSCRIPTION DIALOG
                */}

              {this.state.cancellingSubscription ? 'Cancelling plan...' :
                <div className="a-row a-justifyContent(center)">
                  <div className="a-col a-col(2-3) a-col-med-1(1-2)">
                    <div className="o-cancellationForm">
                      <h3 className="a-h(22) a-justify(center)">
                        <strong>{Localization.localizedStringForKey('Share feedback')}</strong>
                      </h3>
                      <p className="a-p(14) a-color(copy-2) a-mTop(8)">
                        {Localization.localizedStringForKey('We\'re sorry to see you go. Please give us some feedback so that we can improve our products and services.')}
                      </p>
                      <div className="o-cancellationForm__questions">
                        <div className="o-cancellationForm__question">
                          <p className="a-p(14)">
                            {Localization.localizedStringForKey('1. How would you rate your coach\'s ability to meet your expectations and understand your needs?')}
                          </p>
                          <div className="o-cancellationForm__options">
                            <label className="b-radioSelector">
                              <input type="radio" className="b-radioSelector__radioInput" name="Q1" value="" onClick={(e) => { this.setState({ coach_ability: 'Poor' }); }} />
                              <div className="b-radioSelector__display">
                                <div className="b-radioSelector__button" />
                              </div>
                              <p className="b-radioSelector__name a-p(14)">
                                {Localization.localizedStringForKey('Poor')}
                              </p>
                            </label>

                            <label className="b-radioSelector">
                              <input type="radio" className="b-radioSelector__radioInput" name="Q1" value="" onClick={(e) => { this.setState({ coach_ability: 'Below Avg' }); }} />
                              <div className="b-radioSelector__display">
                                <div className="b-radioSelector__button" />
                              </div>
                              <p className="b-radioSelector__name a-p(14)">
                                {Localization.localizedStringForKey('Below Avg')}
                              </p>
                            </label>

                            <label className="b-radioSelector">
                              <input type="radio" className="b-radioSelector__radioInput" name="Q1" value="" onClick={(e) => { this.setState({ coach_ability: 'Average' }); }} />
                              <div className="b-radioSelector__display">
                                <div className="b-radioSelector__button" />
                              </div>
                              <p className="b-radioSelector__name a-p(14)">
                                {Localization.localizedStringForKey('Average')}
                              </p>
                            </label>

                            <label className="b-radioSelector">
                              <input type="radio" className="b-radioSelector__radioInput" name="Q1" value="" onClick={(e) => { this.setState({ coach_ability: 'Above Avg' }); }} />
                              <div className="b-radioSelector__display">
                                <div className="b-radioSelector__button" />
                              </div>
                              <p className="b-radioSelector__name a-p(14)">
                                {Localization.localizedStringForKey('Above Avg')}
                              </p>
                            </label>

                            <label className="b-radioSelector">
                              <input type="radio" className="b-radioSelector__radioInput" name="Q1" value="" onClick={(e) => { this.setState({ coach_ability: 'Great' }); }} />
                              <div className="b-radioSelector__display">
                                <div className="b-radioSelector__button" />
                              </div>
                              <p className="b-radioSelector__name a-p(14)">
                                {Localization.localizedStringForKey('Great')}
                              </p>
                            </label>
                          </div>
                        </div>

                        <div className="o-cancellationForm__question">
                          <p className="a-p(14)">
                            2. How would you rate the quality and relevance of the assignment choices?
                  </p>
                          <div className="o-cancellationForm__options">
                            <label className="b-radioSelector">
                              <input type="radio" className="b-radioSelector__radioInput" name="Q2" value="" onClick={(e) => { this.setState({ assignment_choices: 'Poor' }); }} />
                              <div className="b-radioSelector__display">
                                <div className="b-radioSelector__button" />
                              </div>
                              <p className="b-radioSelector__name a-p(14)">
                                {Localization.localizedStringForKey('Poor')}
                              </p>
                            </label>

                            <label className="b-radioSelector">
                              <input type="radio" className="b-radioSelector__radioInput" name="Q2" value="" onClick={(e) => { this.setState({ assignment_choices: 'Below Avg' }); }} />
                              <div className="b-radioSelector__display">
                                <div className="b-radioSelector__button" />
                              </div>
                              <p className="b-radioSelector__name a-p(14)">
                                {Localization.localizedStringForKey('Below Avg')}
                              </p>
                            </label>

                            <label className="b-radioSelector">
                              <input type="radio" className="b-radioSelector__radioInput" name="Q2" value="" onClick={(e) => { this.setState({ assignment_choices: 'Average' }); }} />
                              <div className="b-radioSelector__display">
                                <div className="b-radioSelector__button" />
                              </div>
                              <p className="b-radioSelector__name a-p(14)">
                                {Localization.localizedStringForKey('Average')}
                              </p>
                            </label>

                            <label className="b-radioSelector">
                              <input type="radio" className="b-radioSelector__radioInput" name="Q2" value="" onClick={(e) => { this.setState({ assignment_choices: 'Above avg' }); }} />
                              <div className="b-radioSelector__display">
                                <div className="b-radioSelector__button" />
                              </div>
                              <p className="b-radioSelector__name a-p(14)">
                                {Localization.localizedStringForKey('Above Avg')}
                              </p>
                            </label>

                            <label className="b-radioSelector">
                              <input type="radio" className="b-radioSelector__radioInput" name="Q2" value="" onClick={(e) => { this.setState({ assignment_choices: 'Great' }); }} />
                              <div className="b-radioSelector__display">
                                <div className="b-radioSelector__button" />
                              </div>
                              <p className="b-radioSelector__name a-p(14)">
                                {Localization.localizedStringForKey('Great')}
                              </p>
                            </label>
                          </div>
                        </div>

                        <div className="o-cancellationForm__question">
                          <p className="a-p(14)">
                            {Localization.localizedStringForKey('3. How easy was it to fit Thinkster Math into your routine and adjust it to your or your child\'s schedule?')}
                          </p>
                          <div className="o-cancellationForm__options">
                            <label className="b-radioSelector">
                              <input type="radio" className="b-radioSelector__radioInput" name="Q3" value="" onClick={(e) => { this.setState({ fit_into_schedule: 'Poor' }); }} />
                              <div className="b-radioSelector__display">
                                <div className="b-radioSelector__button" />
                              </div>
                              <p className="b-radioSelector__name a-p(14)">
                                {Localization.localizedStringForKey('Poor')}
                              </p>
                            </label>

                            <label className="b-radioSelector">
                              <input type="radio" className="b-radioSelector__radioInput" name="Q3" value="" onClick={(e) => { this.setState({ fit_into_schedule: 'Below Avg' }); }} />
                              <div className="b-radioSelector__display">
                                <div className="b-radioSelector__button" />
                              </div>
                              <p className="b-radioSelector__name a-p(14)">
                                {Localization.localizedStringForKey('Below Avg')}
                              </p>
                            </label>

                            <label className="b-radioSelector">
                              <input type="radio" className="b-radioSelector__radioInput" name="Q3" value="" onClick={(e) => { this.setState({ fit_into_schedule: 'Average' }); }} />
                              <div className="b-radioSelector__display">
                                <div className="b-radioSelector__button" />
                              </div>
                              <p className="b-radioSelector__name a-p(14)">
                                {Localization.localizedStringForKey('Average')}
                              </p>
                            </label>

                            <label className="b-radioSelector">
                              <input type="radio" className="b-radioSelector__radioInput" name="Q3" value="" onClick={(e) => { this.setState({ fit_into_schedule: 'Above Avg' }); }} />
                              <div className="b-radioSelector__display">
                                <div className="b-radioSelector__button" />
                              </div>
                              <p className="b-radioSelector__name a-p(14)">
                                {Localization.localizedStringForKey('Above Avg')}
                              </p>
                            </label>

                            <label className="b-radioSelector">
                              <input type="radio" className="b-radioSelector__radioInput" name="Q3" value="" onClick={(e) => { this.setState({ fit_into_schedule: 'Great' }); }} />
                              <div className="b-radioSelector__display">
                                <div className="b-radioSelector__button" />
                              </div>
                              <p className="b-radioSelector__name a-p(14)">
                                {Localization.localizedStringForKey('Great')}
                              </p>
                            </label>
                          </div>
                        </div>

                        <div className="o-cancellationForm__question">
                          <p className="a-p(14)">
                            {Localization.localizedStringForKey('4. Did your child lose motivation?')}
                          </p>
                          <div className="o-cancellationForm__options o-cancellationForm__options--side">
                            <label className="b-radioSelector b-radioSelector--side">
                              <input type="radio" className="b-radioSelector__radioInput" name="Q4" value="" onClick={(e) => { this.setState({ child_lost_motivation: 'Yes' }); }} />
                              <div className="b-radioSelector__display">
                                <div className="b-radioSelector__button" />
                              </div>
                              <p className="b-radioSelector__name a-p(14)">
                                {Localization.localizedStringForKey('Yes')}
                              </p>
                            </label>

                            <label className="b-radioSelector b-radioSelector--side">
                              <input type="radio" className="b-radioSelector__radioInput" name="Q4" value="" onClick={(e) => { this.setState({ child_lost_motivation: 'No' }); }} />
                              <div className="b-radioSelector__display">
                                <div className="b-radioSelector__button" />
                              </div>
                              <p className="b-radioSelector__name a-p(14)">
                                {Localization.localizedStringForKey('No')}
                              </p>
                            </label>
                          </div>
                        </div>

                        <div className="o-cancellationForm__question">
                          <p className="a-p(14)">
                            {Localization.localizedStringForKey('5. Did you only want to use Thinkster Math for the summer months?')}
                          </p>
                          <div className="o-cancellationForm__options o-cancellationForm__options--side">
                            <label className="b-radioSelector b-radioSelector--side">
                              <input type="radio" className="b-radioSelector__radioInput" name="Q5" value="" onClick={(e) => { this.setState({ used_summer_months_only: 'Yes' }); }} />
                              <div className="b-radioSelector__display">
                                <div className="b-radioSelector__button" />
                              </div>
                              <p className="b-radioSelector__name a-p(14)">
                                {Localization.localizedStringForKey('Yes')}
                              </p>
                            </label>

                            <label className="b-radioSelector b-radioSelector--side">
                              <input type="radio" className="b-radioSelector__radioInput" name="Q5" value="" onClick={(e) => { this.setState({ used_summer_months_only: 'No' }); }} />
                              <div className="b-radioSelector__display">
                                <div className="b-radioSelector__button" />
                              </div>
                              <p className="b-radioSelector__name a-p(14)">
                                {Localization.localizedStringForKey('No')}
                              </p>
                            </label>
                          </div>
                        </div>

                        <div className="o-cancellationForm__question">
                          <p className="a-p(14)">
                            {Localization.localizedStringForKey('6. Please leave any other feedback.')}
                          </p>
                          <textarea className="b-textarea a-mTop(8)" placeholder="Feedback" onChange={this.updateFeedback.bind(this)} />
                        </div>

                        <div className="o-cancellationForm__action">
                          <button type="button" className="b-flatBtn b-flatBtn--large b-flatBtn--gradient(active-2)" onClick={this.cancelPlan.bind(this)}>
                            <span className="b-button__label">
                              {Localization.localizedStringForKey('Share feedback')}
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>}

            </div>
          </div>
        </div>
        <Footer />
      </div>


    );
  }
}

const mapStateToProps = (state) => ({
  session: state.session,
  user: state.user,
  student: state.student,
  loading: state.loading,
});

const actionCreators = {
  cancelSubscription: StudentActions.cancelSubscription,
  sendCancelNotification: StudentActions.sendCancelNotification,
  sendMail: MailActions.sendMail,
  createZendeskTicket: ZendeskActions.createZendeskTicket,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(CancelPlan);

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import lodash from 'lodash';
import moment from 'moment';

import ThinksterLogomark from '../Shared/Glyphs/ThinksterLogomark';
import ThinksterWordmark from '../Shared/Glyphs/ThinksterWordmark';
import ArrowRight from '../Shared/Glyphs/ArrowRight';
import Close from '../Shared/Glyphs/Close';
import ParentNav from '../Shared/ParentNav';
import Footer from '../Footer';
import config from '../../constants/config';
import * as Localization from '../Shared/Localization';

import * as UserActions from '../../actions/user';
import * as StudentActions from '../../actions/student';
import * as AddonActions from '../../actions/addon';
import * as ZendeskActions from '../../actions/zendesk';
import * as MailActions from '../../actions/mail';

import * as SessionActions from '../../actions/session';
import LoadingSpinner from '../Shared/Glyphs/LoadingSpinner';

export class ModifyPlan extends Component {

  static propTypes = {
    logout: React.PropTypes.func,
    session: React.PropTypes.shape({
      user_id: React.PropTypes.string,
    }),
    user: React.PropTypes.shape({

    }),
    fetchAddons: React.PropTypes.func,
    fetchTeachersDetails: React.PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      popupMsg:
        <p className="a-p(14)">
          We&rsquo;re sorry to see you go!<br /><br /> Would you be interested in setting up a 10 minute phone call with Raj Valli (CEO of Thinkster)? He&rsquo;d like to hear more on what worked or didn&rsquo;t work for your child. Your feedback helps us understand what our team needs to do to improve, and we&rsquo;d like to see if there’s anything we can do on our end to keep you with us.
      </p>,
      justCancel: false,
      cancelAndTalk: false,
      talkToCEO: false,
      showPaymentDialog: false,

    };
  }


  componentDidMount() {
    const { fetchAddons, user, student, fetchTeachersDetails } = this.props;
    if (student && student.newStudentDetails && student.newStudentDetails.paymentCompleted) {
      this.updatePlan(null);
    } else {
      fetchAddons({ user });
      fetchTeachersDetails({ student_id: this.props.params.studentId, user });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { fetchAddons, user } = this.props;
    this.getPlans();
    if (this.state && this.state.updatingPlan && !this.state.fetchedNewAddons && ((nextProps && nextProps.zendesk && (nextProps.zendesk.createdTicket || nextProps.zendesk.createTicketFailed)) || (nextProps && nextProps.student && !nextProps.student.updatingStudentPlan && nextProps.user && nextProps.user.fetchedUser))) {
      if (this.state.firstTimeCC) {
        if (nextProps.student.updatedStudentPlan) {
          this.setState({ firstTimeCC: false, updatingPlan: false, fetchedNewAddons: true, showUpdatedModal: 'hide' });
          browserHistory.push('/thank-you');
        } else {
          this.setState({ updatingPlan: false, fetchedNewAddons: true, showUpdatedModal: 'show' });
        }
      } else {
        this.setState({ updatingPlan: false, fetchedNewAddons: true, showUpdatedModal: 'show' });
      }
      // fetchAddons({ user });
    }

    if (this.state && this.state.pausingSubscription && nextProps && nextProps.student && nextProps.student.pausedSubscription) {
      this.setState({ pausingSubscription: false, showPausedModal: 'show' });
    }

    if (this.state && this.state.cancellingSubscription && nextProps && nextProps.student && (nextProps.student.cancelledSubscription || nextProps.student.cancelSubscriptionFailed || nextProps.student.cancelSubscriptionNotified || nextProps.student.cancelSubscriptionNotificationFailed)) {
      this.setState({ cancellingSubscription: false, showCancellationModal: 'show' });
    }

    if (this.state.justCancel && nextProps) {
      if (nextProps.student.cancelledSubscription) {
        if (nextProps.user && nextProps.user.paymentStatus && nextProps.user.paymentStatus.inTrial) {
          this.setState({
            popupMsg:
              <p className="a-p(14)">
                Thank you for being a Thinkster parent. <br /><br /> We are sorry to see you go. Your plan will be cancelled with immediate effect. If you have any questions, please email support <a href="mailto:support@hellothinkster.com" title="support@hellothinkster.com">support@hellothinkster.com</a> or call us at 888-204-7484. We&rsquo;d appreciate if you could take a few minutes and provide us your feedback.
            </p>,
          });
        } else {
          this.setState({
            popupMsg:
              <p className="a-p(14)">
                Thank you for being a Thinkster parent.<br /><br /> An email has been sent to the support team with your cancelation request. If you have any questions, please email support@hellothinkster.com or call us at 888-204-7484. We’d appreciate if you could take a few minutes and provide us your feedback.
            </p>,
            cancellingSubscription: false,
          });
        }
      } else if (nextProps.student.cancelSubscriptionFailed) {
        this.setState({
          popupMsg:
            <p className="a-p(14)">
              Due to some errors, your plan could not be cancelled at the moment. Sorry for the inconveinience caused, Please try again after some time.
          </p>,
          cancellingSubscription: false,
        });
      } else if (nextProps.student.cancelSubscriptionNotified || (nextProps.zendesk && nextProps.zendesk.createdTicket)) {
        this.setState({
          popupMsg:
            <p className="a-p(14)">
              Thank you for being a Thinkster parent.<br /><br /> An email has been sent to the support team with your cancelation request. If you have any questions, please email support@hellothinkster.com or call us at 888-204-7484. We’d appreciate if you could take a few minutes and provide us your feedback.
          </p>,
          cancellingSubscription: false,
        });
      } else if (nextProps.student.cancelSubscriptionNotificationFailed || (nextProps.zendesk && nextProps.zendesk.createTicketFailed)) {
        this.setState({
          popupMsg:
            <p className="a-p(14)">
              Due to some errors, your cancellation request could not be sent to our support team. Sorry for the inconveinience caused, Please try again after some time.
          </p>,
          cancellingSubscription: false,
        });
      }
    }

    if (this.state.cancelAndTalk && nextProps) {
      if (nextProps.student.cancelledSubscription) {
        if (nextProps.user && nextProps.user.paymentStatus && nextProps.user.paymentStatus.inTrial) {
          this.setState({
            popupMsg:
              <p className="a-p(14)">
                Thank you for being a Thinkster parent. <br /><br /> We are sorry to see you go. Your plan will be canceled with immediate effect. Customer satisfaction is very important to us as a company and to me personally. I apologize that our program did not meet your academic needs and look forward to speaking with you.  I will request Kendra Straley, our Academic Coordinator to contact you to schedule a call.<br /><br />Have a terrific day!<br /><br />Best Regards,<br />Raj Valli, CEO
            </p>,
            cancellingSubscription: false,
          });
        } else {
          this.setState({
            popupMsg:
              <p className="a-p(14)">
                Thank you for being a Thinkster parent. <br /><br /> We are sorry to see you go. A message has been sent to the support team with your request for cancellation, they will get in touch with you soon. Customer satisfaction is very important to us as a company and to me personally. I apologize that our program did not meet your academic needs and look forward to speaking with you.  I will request Kendra Straley, our Academic Coordinator to contact you to schedule a call.<br /><br />Have a terrific day!<br /><br />Best Regards,<br />Raj Valli, CEO
            </p>,
            cancellingSubscription: false,
          });
        }
      } else if (nextProps.student.cancelSubscriptionFailed) {
        this.setState({
          popupMsg:
            <p className="a-p(14)">
              Due to an error, your plan could not be cancelled at the moment. Sorry for the inconveinience caused, Please try again after some time.
          </p>,
          cancellingSubscription: false,
        });
      } else if (nextProps.student.cancelSubscriptionNotified) {
        this.setState({
          popupMsg:
            <p className="a-p(14)">
              Thank you for being a Thinkster parent. An email has been sent to the support team with your cancelation request.<br /><br /> Customer satisfaction is very important to us as a company and to me personally. I’m sorry that our program did not meet your academic needs and look forward to speaking with you. Our Academic Advisor, Kendra, will reach out to you to schedule a call.<br /><br />I look forward to speaking with you soon! <br /><br />Best Regards,<br />Raj Valli, CEO
          </p>,
          cancellingSubscription: false,
        });
      } else if (nextProps.student.cancelSubscriptionNotificationFailed) {
        this.setState({
          popupMsg:
            <p className="a-p(14)">
              Due to an error, your cancellation request could not be sent to our support team. Sorry for the inconveinience caused, Please try again after some time.
          </p>,
          cancellingSubscription: false,
        });
      }
    }
  }

  billingFrequency(user) {
    let billingFrequency = 1;
    for (var key in user.planDetails) {
      if (user.planDetails.hasOwnProperty(key)) {
        var val = user.planDetails[key];
        if (val && val.service_id && val.service_id !== 'Lite' && val.billingFrequency) {
          billingFrequency = parseInt(val.billingFrequency, 10);
          break;
        }
      }
    }
    return billingFrequency;
  }

  billingMonthlyAmount(plan) {
    let monthlyAmount = '';
    let billingFrequency = 1;
    if (plan.billingFrequency) {
      billingFrequency = plan.billingFrequency
    }
    if (plan && plan.currency && plan.currency.symbol_native && plan.amount) {
      monthlyAmount = Math.round((plan.amount / billingFrequency));
      return plan.currency.symbol_native + ' ' + monthlyAmount;
    } else {
      return '';
    }
  }

  getSavingsMessage(plan) {
    const { addons } = this.props;
    // if biling frequency 1 there is not any savings
    let billingFrequency = 1;
    if (plan.billingFrequency) {
      billingFrequency = plan.billingFrequency;
    }

    if (billingFrequency == 1) { return ''; }
    // check for addons
    if (addons && addons.addons && addons.addons[plan.grade_range]) {
      const monthlyCost = addons.addons[plan.grade_range][plan.service_id][1].amount;
      let discountedCost = monthlyCost;

      if (addons.addons[plan.grade_range][plan.service_id] && addons.addons[plan.grade_range][plan.service_id][3]) {
        discountedCost = Math.round((addons.addons[plan.grade_range][plan.service_id][3].amount / billingFrequency));
      }

      const savings = monthlyCost - discountedCost || 0;
      const currency = plan.currency.symbol;
      const textStyle = { 'font-size': '0.9375rem', 'color': '#748084' };
      const currencyStyle = { 'color': '#14C81F' };
      if (savings > 0) {
        return (<p style={textStyle}> <strong style={currencyStyle}>{currency}{savings} off</strong> when billed every {billingFrequency} months. </p>);
      }
      return '';
    }
    else {
      return '';
    }
  }

  getGradeRange(plan) {
    const { user, addons } = this.props;
    let grade_range = '';
    if (plan && plan.grade_range) {
      if (user.country_code == 'GB') {
        let grade = user.students[this.props.params.studentId].grade;
        grade_range = grade ? (grade.toString().toLowerCase() !== 'k' && grade > 6 ? '7 - 9' : '1 - 6') : grade_range;
      }
      else {
        grade_range = plan.grade_range;
      }
    }
    return grade_range;
  }

  getPlans() {
    const { user, addons } = this.props;
    let grade = user.students[this.props.params.studentId].grade;
    if (grade && grade.toString().toLowerCase() === 'k') {
      grade = 0;
    } else {
      grade = parseInt(grade, 10);
    }
    if (user.country_code == 'GB' && grade !== 0) {
      grade = grade - 1;
    }
    //Get billing frequency
    let billingFrequency = this.billingFrequency(user);
    if (addons.addons) {
      const gradeRange = Object.keys(addons.addons);
      let key = null;
      let plans = [];
      let planNames;
      for (let i = gradeRange.length - 1; i >= 0; i--) {
        const grades = gradeRange[i].split(' - ');
        if (grades[0].toLowerCase() === 'k') { grades[0] = 0; }
        if (parseInt(grades[1]) >= grade && parseInt(grades[0]) <= grade) {
          key = gradeRange[i];
          planNames = Object.keys(addons.addons[key]);
          for (let j = planNames.length - 1; j >= 0; j--) {
            if (planNames[j] === 'Lite') {
              if (billingFrequency == 1) {
                plans.push(addons.addons[key][planNames[j]][1]);
              }
            } else {
              plans.push(addons.addons[key][planNames[j]][billingFrequency]);
            }
          }
        }
      }
      plans = lodash.orderBy(plans, (e) => parseInt(e.amount, 10), 'asc');
      this.setState({ plans });
    }
  }

  onPlanSelection(planIndex, e) {
    const { user } = this.props;
    const plans = (this.state ? this.state.plans : null);
    if (plans && planIndex != -1 && plans[planIndex]) {
      for (let i = plans.length - 1; i >= 0; i--) {
        plans[i].checked = false;
      }

      plans[planIndex].checked = !plans[planIndex].checked;
      const planSelected = plans[planIndex].checked;
      this.setState({ plans, planSelected });
    }

    e.stopPropagation();

    let studentIndex = -1;
    if (user && user.paymentStatus && user.paymentStatus.students && user.paymentStatus.students.length > 0) {
      studentIndex = lodash.findIndex(user.paymentStatus.students, { id: this.props.params.studentId });
    }

    if (user && user.paymentStatus && user.paymentStatus.isPaid && studentIndex !== -1 && user.paymentStatus.students[studentIndex].isPaid && user.paymentStatus.modeOfPayment && user.paymentStatus.modeOfPayment.toLowerCase() !== 'inapppurchase' && user.paymentStatus.inTrial) {
      this.confirmedUpdateStudentPlan();
    } else if (user && user.paymentStatus && user.paymentStatus.isPaid && studentIndex !== -1 && user.paymentStatus.students[studentIndex].isPaid && user.paymentStatus.modeOfPayment && user.paymentStatus.modeOfPayment.toLowerCase() !== 'inapppurchase') {
      this.createTicket(null);
    } else if (user && user.paymentStatus) {
      if ((user.paymentStatus.modeOfPayment && user.paymentStatus.modeOfPayment.toLowerCase() === 'inapppurchase') ||
        (studentIndex !== -1 && user.paymentStatus.students && user.paymentStatus.students[studentIndex] && user.paymentStatus.students[studentIndex].isCanceled) ||
        (studentIndex !== -1 && user.paymentStatus.students && user.paymentStatus.students[studentIndex] && !user.paymentStatus.students[studentIndex].isPaid)
      ) {
        this.updatePlan(null);
      } else {
        this.createTicket(null);
      }
    }
  }

  getStudentsName() {
    const { user } = this.props;
    const studentId = this.props.params.studentId;
    if (user && user.students && user.students[studentId]) {
      if (user.students[studentId].first_name != '' && user.students[studentId].first_name != null) { return (<span>{user.students[studentId].first_name}&rsquo;s {Localization.localizedStringForKey('Plan')}</span>); }
      return (<span>{user.students[studentId].student_first_name}&rsquo;s {Localization.localizedStringForKey('Plan')}</span>);
    }
  }

  createTicket(e) {
    const { user, createZendeskTicket, student } = this.props;
    const parentName = `${user.first_name} ${user.last_name}`;
    const plans = (this.state ? this.state.plans : null);
    const studentId = this.props.params.studentId;
    const studentName = this.getStudentName(studentId);
    const nextBillingDate = (user && user.paymentStatus && user.paymentStatus.nextBillingDate ? moment(user.paymentStatus.nextBillingDate).format('LL') : " ");
    const currentServiceId = (user.students && user.students[studentId] ? user.students[studentId].service_id : null);
    const planSelectedIndex = lodash.findIndex(plans, { checked: true });
    if (planSelectedIndex != -1) {
      const service_id = plans[planSelectedIndex].service_id;
      const data = {
        subject: 'Modify Plan Request',
        body: `Modify Plan Request\nName: ${parentName}\nEmail Address: ${user.email_address}\n Student Name: ${studentName}\nStudent ID: ${studentId}\nNext billing date: ${nextBillingDate}\nCurrent Plan: ${currentServiceId}\nNext Plan: ${service_id}\nParent TWA Link: https://tutor-beta.tabtor.com/parent/${user._id}/modifysubscription\nSubscription ID: https://www.braintreegateway.com/merchants/bgn7nd3mzgnw2krs/subscriptions/${user.subscription_id}`,
        user: user._id,
        name: parentName,
        email: user.email_address,
        cc: `sumi@hellothinkster.com,kendra@hellothinkster.com,karthik@hellothinkster.com,${student && student.teacher ? student.teacher.email_address : ''}`,
      };
      this.setState({ planSelected: false, updatingPlan: true, fetchedNewAddons: false });

      createZendeskTicket({ data });
    }
  }

  getStudentName = (studentId) => {
    const { user } = this.props;
    var studentName = " ";
    if (user && user.students && user.students[studentId]) {
      studentName = user.students[studentId].first_name + " " + user.students[studentId].last_name;
    }
    return studentName;
  }
  checkPaidStatus() {
    const { user } = this.props;
    if (user && user.paymentStatus) {
      if (user.paymentStatus.isPaid && !user.paymentStatus.isCanceled && user.paymentStatus.modeOfPayment && user.paymentStatus.modeOfPayment.toLowerCase() !== 'inapppurchase') {
        return true;
      }

      if (user.paymentStatus.creditcard && !user.paymentStatus.creditcard.expired && user.paymentStatus.isPaid && !user.paymentStatus.isCanceled) {
        return true;
      }
    }
    return false;
  }

  confirmedUpdateStudentPlan(e) {
    const { updateStudentPlan, user, student } = this.props;
    const studentId = this.props.params.studentId;
    const plans = (this.state ? this.state.plans : null);
    if (plans) {
      const planSelectedIndex = lodash.findIndex(plans, { checked: true });
      if (planSelectedIndex != -1) {
        const service_id = plans[planSelectedIndex].service_id;
        const studentId = this.props.params.studentId;
        updateStudentPlan({ user, studentId, service_id });
        this.setState({ plans, planSelected: false, updatingPlan: true, fetchedNewAddons: false });
      }
    }
    this.setState({ showPaymentDialog: false });
  }

  updatePlan(e) {
    const { removeNewStudentDetails, saveStudentDetails, fetchUserServiceLevels, fetchUserPlans, updateStudentPlan, user, student } = this.props;
    if (student && student.newStudentDetails) {
      this.setState({ plans: student.newStudentDetails.plans, planSelected: false, updatingPlan: true, fetchedNewAddons: false });
      updateStudentPlan({ user, studentId: student.newStudentDetails.studentId, service_id: student.newStudentDetails.service_id, createSubscription: true });
      if (student.newStudentDetails.firstTimeCC) {
        this.setState({ firstTimeCC: true });
      }
      removeNewStudentDetails();
    } else {
      const plans = (this.state ? this.state.plans : null);
      if (plans) {
        const planSelectedIndex = lodash.findIndex(plans, { checked: true });
        if (planSelectedIndex != -1) {
          const service_id = plans[planSelectedIndex].service_id;
          const studentId = this.props.params.studentId;

          if (user && user.paymentStatus) {
            if (this.checkPaidStatus()) {
              this.setState({ showPaymentDialog: true });
              return;
            }

            let firstTimeCC = false;
            if (!user.paymentStatus.creditcard) {
              firstTimeCC = true;
            }

            const student = {
              nextURL: `/modify-plan/${studentId}`,
              service_id,
              studentId,
              plans,
              firstTimeCC,
            };
            saveStudentDetails(student);
            if (user && user.paymentStatus) {
              const studentIndex = lodash.findIndex(user.paymentStatus.students, { id: studentId });
              if (studentIndex !== -1 && !user.paymentStatus.inTrial) {
                browserHistory.push('/payment/1');
              } else {
                browserHistory.push('/payment/2');
              }
            } else {
              browserHistory.push('/payment/2');
            }
          }


          for (let i = plans.length - 1; i >= 0; i--) {
            plans[i].checked = false;
          }
          this.setState({ plans, planSelected: false, updatingPlan: true, fetchedNewAddons: false });
        }
      }
    }
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

  getStudentPlanUI(studentId) {
    const { user } = this.props;

    let planSelectedIndex;
    let service_id;

    if (this.state.planSelected) {
      planSelectedIndex = lodash.findIndex(plans, { checked: true });
      service_id = plans[planSelectedIndex].service_id;
    }

    if (user && user.students && user.students[studentId]) {
      return (<div className="o-subscription o-subscription--plan(gold)">

        <img className="b-avatar o-subscription__studentPortrait" src={`https://s3.amazonaws.com/${ENV.profilePictureBucket}/${user.students[studentId].student_id}.png`} name={`${user.students[studentId].student_first_name} ${user.students[studentId].student_lastname}`} type="image/png" />

        <div className="o-subscription__planInfo">
          <p className="o-subscription__student a-p(16)">
            {`${user.students[studentId].first_name} ${user.students[studentId].last_name}`}
            <span className="a-p(14) a-color(copy-2)">
              &nbsp; {`(Grade ${user.students[studentId].grade})`}
            </span>
          </p>
          <p className="o-subscription__planName a-s(12) a-allCaps">
            {
              this.state.planSelected ?
                (`${service_id} Plan`) :
                (user.planDetails && user.planDetails[studentId] ? `${user.planDetails[studentId].service_id} Plan` : '')

            }
          </p>
        </div>

        <div className="o-subscription__billingInfo">
          <p className="a-p(12) a-strong a-color(copy-2)">
            {user.students[studentId].is_active ? Localization.localizedStringForKey('Active') : Localization.localizedStringForKey('Inactive')}
          </p>
          <p className="a-p(16)">
            {this.getPaymentInfo(studentId)}
          </p>
        </div>


        <div className="o-subscription__actions">
          {
            this.state && this.state.planSelected ?

              <button className="b-flatBtn b-flatBtn--active-3" onClick={this.updatePlan.bind(this)}>
                <span className="b-button__label">
                  Update Plan
                  </span>
              </button>
              :
              <button className="b-flatBtn b-flatBtn--active-3" disabled>
                <span className="b-button__label">
                  Update Plan
                  </span>
              </button>

          }

        </div>

      </div>);
    }
  }

  getCurrency(studentId) {
    const { user } = this.props;
    if (studentId) {
      if (user && user.students && user.students[studentId] && user.planDetails && user.planDetails[studentId] && user.planDetails[studentId].currency) {
        return user.planDetails[studentId].currency.symbol_native;
      }
    } else if (user && user.students) {
      const students = Object.keys(user.students);
      if (user && user.students && user.students[students[0]] && user.planDetails && user.planDetails[students[0]] && user.planDetails[students[0]].currency) {
        return user.planDetails[students[0]].currency.symbol_native;
      }
    }
    return '';
  }

  backToPlansSection(e) {
    this.setState({ showUpdatedModal: 'hide' });
    browserHistory.push('/plans');
  }

  pauseSubscriptionConfirmation(e) {
    this.setState({ showPauseSubscriptionModal: 'show' });
  }

  pauseSubscription(e) {
    const { pauseSubscription, user } = this.props;

    this.setState({ showPauseSubscriptionModal: 'hide', pausingSubscription: true });

    pauseSubscription({ studentId: this.props.params.studentId, user, duration: this.state.selected_duration });
  }

  cancelPauseSubscription(e) {
    this.setState({ showPauseSubscriptionModal: 'hide' });
  }

  setDuration(e) {
    this.setState({ selected_duration: e.currentTarget.value });
  }

  showCancelPlan(e) {
    // browserHistory.push(`/${this.props.params.studentId}/cancel`);
    this.setState({ showCancellationModal: true });
  }

  showFeedback(e) {
    browserHistory.push(`/${this.props.params.studentId}/cancel`);
  }

  checkSubscriptionId() {
    const { user } = this.props;
    if (user && user.paymentStatus) {
      const studentIndex = lodash.findIndex(user.paymentStatus.students, { id: this.props.params.studentId });
      if (studentIndex != -1 && user.paymentStatus.subscription_id != '' && user.paymentStatus.subscription_id != null) {
        if (user.paymentStatus.students[studentIndex] && user.paymentStatus.students[studentIndex].isPaid && !user.paymentStatus.students[studentIndex].isCanceled) {
          return '';
        }
      }
    }

    return 'none';
  }

  checkStudentPlan(plan) {
    const { user } = this.props;
    const studentIndex = lodash.findIndex(user.paymentStatus.students, { id: this.props.params.studentId });
    const studentsPlan = (user && user.paymentStatus && user.paymentStatus.students && (((user.paymentStatus.students[studentIndex].state && user.paymentStatus.students[studentIndex].state.toLowerCase() !== 'canceled')) && user.paymentStatus.students[studentIndex].isPaid && !user.paymentStatus.students[studentIndex].isCanceled) ? user.paymentStatus.students[studentIndex].addon_id : '');
    if (studentsPlan === plan._id) {
      console.log('plan ', studentsPlan, plan._id);
      return true;
    }

    return false;
  }
  isStudentInLitePlan() {
    const { user } = this.props;
    const studentIndex = lodash.findIndex(user.paymentStatus.students, { id: this.props.params.studentId });
    const studentsPlan = (user && user.paymentStatus && user.paymentStatus.students && (!user.paymentStatus.students[studentIndex].isCanceled && !user.paymentStatus.students[studentIndex].enrollment_end_date) ? user.paymentStatus.students[studentIndex].service_id : '');
    if (studentsPlan === 'Lite') {
      return true;
    }

    return false;
  }

  isStudentPlanLite(plan) {
    const { user } = this.props;
    const studentIndex = lodash.findIndex(user.paymentStatus.students, { id: this.props.params.studentId });
    if (studentIndex === -1) { return true; }

    if (studentIndex !== -1 && user && user.paymentStatus && user.paymentStatus.students && (user.paymentStatus.students[studentIndex].isCanceled || !user.paymentStatus.students[studentIndex].isPaid || user.paymentStatus.students[studentIndex].enrollment_end_date)) {
      return true;
    }

    const studentsPlan = (user && user.paymentStatus && user.paymentStatus.students && (!user.paymentStatus.students[studentIndex].isCanceled && !user.paymentStatus.students[studentIndex].enrollment_end_date) ? user.paymentStatus.students[studentIndex].addon_id : '');
    if (studentsPlan === plan._id) {
      console.log('plan ', studentsPlan, plan._id);
      return true;
    }

    return false;
  }


  getPopupMessage() {
    if (this.props.student && this.props.student.updatedStudentPlan) {
      return 'Your plan has been successfully updated. Your changes will show up in the next billing cycle.';
    } else if (this.props.student.updateStudentPlanFailed) {
      return 'Could not update plan at the moment. Please try after some time.';
    }
    if (this.props.student && this.props.zendesk.createdTicket) {
      return 'Your request for plan change has been sent to our support team. They will get in touch with you soon.';
    } else if (this.props.zendesk.createTicketFailed) {
      return 'Request for plan change could not be sent at the moment. Please try again after some time.';
    }

    return '';
  }

  sendMailForContactWithCEO(type) {
    const { user, createZendeskTicket } = this.props;

    const studentIndex = lodash.findIndex(user.paymentStatus.students, { id: this.props.params.studentId });

    if (type == 2) {
      const parentName = `${user.first_name} ${user.last_name}`;
      const data = {
        subject: 'Parent has requested to talk with CEO before cancellation',
        body: `Name: ${this.props.user ? `${this.props.user.first_name} ${this.props.user.last_name}` : ''}\n` +
          `Email Address: ${this.props.user ? this.props.user.email_address : ''}\n` +
          `Phone: ${this.props.user ? this.props.user.phone : ''}\n` +
          `StudentId: ${this.props.params ? this.props.params.studentId : ''}\n` +
          `Student's Name: ${this.props.user && this.props.user.students ? `${this.props.user.students[this.props.params.studentId].first_name} ${this.props.user.students[this.props.params.studentId].last_name}` : ''}\n` +
          `User Id: ${this.props.user ? this.props.user.userId : ''}\n` +
          `Next Billing Date: ${moment(user.paymentStatus.nextBillingDate).format('LL')}\n` +
          `Plan: ${this.props.user && this.props.user.students ? this.props.user.students[this.props.params.studentId].service_id : ''}\n` +
          `Status: ${studentIndex != -1 ? (user.paymentStatus.students[studentIndex].is_on_hold ? 'On-Hold' : (user.paymentStatus.students[studentIndex].is_active ? 'Active' : 'Inactive')) : ''}\n` +
          `Teacher's Name: ${this.props.student && this.props.student.teacher ? `${this.props.student.teacher.first_name} ${this.props.student.teacher.last_name}` : 'Not available'}\n`,
        user: user._id,
        name: parentName,
        email: user.email_address,
        cc: ['rupa@hellothinkster.com', 'karthik@hellothinkster.com', 'kendra@hellothinkster.com'],
      };

      // sendMail({ user, studentID: this.props.params.studentId, data });
      createZendeskTicket({ data });
    }

    if (type == 1) {
      const data = {
        subject: 'Parent has requested to cancel subscription but talk with CEO',
        body: `Name: ${this.props.user ? `${this.props.user.first_name} ${this.props.user.last_name}` : ''}\n` +
          `Email Address: ${this.props.user ? this.props.user.email_address : ''}\n` +
          `Phone: ${this.props.user ? this.props.user.phone : ''}\n` +
          `StudentId: ${this.props.params ? this.props.params.studentId : ''}\n` +
          `Student's Name: ${this.props.user && this.props.user.students ? `${this.props.user.students[this.props.params.studentId].first_name} ${this.props.user.students[this.props.params.studentId].last_name}` : ''}\n` +
          `User Id: ${this.props.user ? this.props.user.userId : ''}\n` +
          `Next Billing Date: ${moment(user.paymentStatus.nextBillingDate).format('LL')}\n` +
          `Plan: ${this.props.user && this.props.user.students ? this.props.user.students[this.props.params.studentId].service_id : ''}\n` +
          `Status: ${studentIndex != -1 ? (user.paymentStatus.students[studentIndex].is_on_hold ? 'On-Hold' : (user.paymentStatus.students[studentIndex].is_active ? 'Active' : 'Inactive')) : ''}\n` +
          `Teacher's Name: ${this.props.student && this.props.student.teacher ? `${this.props.student.teacher.first_name} ${this.props.student.teacher.last_name}` : 'Not available'}\n`,
        user: user._id,
        name: parentName,
        email: user.email_address,
        cc: ['rupa@hellothinkster.com', 'karthik@hellothinkster.com', 'kendra@hellothinkster.com'],
      };

      // sendMail({ user, studentID: this.props.params.studentId, data });
      createZendeskTicket({ data });
    }
  }


  cancelPlan(e) {
    const { sendCancelNotification, createZendeskTicket, cancelSubscription, user, sendMail, student } = this.props;
    const reasons = [];
    reasons.push({ category: 'coach_ability', reason: (this.state.coach_ability != '' && this.state.coach_ability != null ? this.state.coach_ability : 'none') });
    reasons.push({ category: 'assignment_choices', reason: (this.state.assignment_choices != '' && this.state.assignment_choices != null ? this.state.assignment_choices : 'none') });
    reasons.push({ category: 'fit_into_schedule', reason: (this.state.fit_into_schedule != '' && this.state.fit_into_schedule != null ? this.state.fit_into_schedule : 'none') });
    reasons.push({ category: 'child_lost_motivation', reason: (this.state.child_lost_motivation != '' && this.state.child_lost_motivation != null ? this.state.child_lost_motivation : 'none') });
    reasons.push({ category: 'used_summer_months_only', reason: (this.state.used_summer_months_only != '' && this.state.used_summer_months_only != null ? this.state.used_summer_months_only : 'none') });
    reasons.push({ category: 'feedback', reason: (this.state.feedback != '' && this.state.feedback != null ? this.state.feedback : 'none') });

    const parentName = `${user.first_name} ${user.last_name}`;
    const studentId = this.props.params.studentId;
    const currentServiceId = (user.students && user.students[studentId] ? user.students[studentId].service_id : null);

    this.setState({ cancellingSubscription: true });

    if (user.paymentStatus && user.paymentStatus.status && user.paymentStatus.status.toLowerCase() === 'active') {
      const data = {
        subject: `Cancel Student's Plan Request for Student Id: ${this.props.params.studentId}, Student Name : ${user.students[this.props.params.studentId].first_name} ${user.students[this.props.params.studentId].last_name}`,
        body: `Cancel Student's Plan Request\nParents Name: ${parentName}\nEmail Address: ${user.email_address}\nStudent ID: ${studentId}\nStudent Name : ${(`${user.students[this.props.params.studentId].first_name} ${user.students[this.props.params.studentId].last_name}`)}\nNext Billing Date: ${user.paymentStatus.subscription ? moment(user.paymentStatus.subscription.nextBillingDate).format('LL') : 'Next billing date not available'}\nCurrent Plan: ${currentServiceId}\n\nParent TWA Link: https://tutor-beta.tabtor.com/parent/${user._id}/modifysubscription\nSubscription ID: https://www.braintreegateway.com/merchants/bgn7nd3mzgnw2krs/subscriptions/${user.subscription_id}`,
        user: user._id,
        name: parentName,
        email: user.email_address,
        cc: `sumi@hellothinkster.com,${student && student.teacher ? student.teacher.email_address : ''}`,
      };
      createZendeskTicket({ data });
      // sendCancelNotification({ user, reasons, studentId: this.props.params.studentId });
    } else {
      cancelSubscription({ user, reasons, studentId: this.props.params.studentId });
    }
  }

  justCancel(e) {
    if (!this.state.cancellingSubscription) {
      this.setState({ justCancel: true });
      this.cancelPlan();
    }
  }

  cancelAndTalk(e) {
    if (!this.state.cancellingSubscription) {
      this.setState({ cancelAndTalk: true });
      this.cancelPlan();
      this.sendMailForContactWithCEO(1);
    }
  }

  talkToCEO(e) {
    this.sendMailForContactWithCEO(2);
    this.setState({
      popupMsg:
        <p className="a-p(14)">
          Thank you for being a Thinkster parent.<br /><br /> Customer satisfaction is very important to us as a company and to me personally. I’m sorry that our program did not meet your academic needs and look forward to speaking with you.  Our Academic Advisor, Kendra, will reach out to you to schedule a call.<br /><br />I look forward to speaking with you soon! <br /><br />Best Regards,<br />Raj Valli, CEO
      </p>,
      talkToCEO: true,
    });
  }

  closeModal(e) {
    this.setState({ showCancellationModal: false });
  }

  redirectToPaymentPage(e) {
    const { user, saveStudentDetails } = this.props;

    const plans = (this.state ? this.state.plans : null);
    if (plans) {
      const planSelectedIndex = lodash.findIndex(plans, { checked: true });
      if (planSelectedIndex != -1) {
        const service_id = plans[planSelectedIndex].service_id;
        const studentId = this.props.params.studentId;
        const student = {
          nextURL: `/modify-plan/${studentId}`,
          service_id,
          studentId,
          plans,
        };
        saveStudentDetails(student);
        browserHistory.push('payment/2');
      }
    }
    e.stopPropagation();
  }

  render() {
    return (
      <div>

        <div className={`o-modal o-modal--${this.state && this.state.showPaymentDialog ? 'show' : 'hide'}`}>
          <div className="o-modal__box">
            <p className="a-p(16) a-justify(center)">
              Existing Payment method
            </p>
            <div className="o-subscription">
              <div className="o-subscription__planInfo o-subscription__planInfo--summary">
                <p className="o-subscription__student a-p(16)">
                  <span> <strong>{this.props.user && this.props.user.paymentStatus && this.props.user.paymentStatus.creditcard ? this.props.user.paymentStatus.creditcard.cardType : ''}</strong> {Localization.localizedStringForKey('ending in')} <strong>{this.props.user && this.props.user.paymentStatus && this.props.user.paymentStatus.creditcard ? this.props.user.paymentStatus.creditcard.last4 : ''}</strong></span>
                </p>
              </div>
              <div style={{ cursor: 'pointer', textAlign: 'right' }} className="o-subscription__billingInfo o-subscription__billingInfo--summary">
                <a className="a-p(12) a-strong" onClick={this.redirectToPaymentPage.bind(this)}>
                  Change
                </a>
              </div>
            </div>
            <p>Please confirm if you would like to use the existing payment method?</p>
            <div className="o-subscription__actions o-subscription__actions--summary">
              <button type="button" className="b-flatBtn b-flatBtn--medium b-flatBtn--gradient(active-1)" onClick={this.confirmedUpdateStudentPlan.bind(this)}>
                <span className="b-button__label a-allCaps">
                  CONFIRM
                </span>
              </button>
            </div>
          </div>
        </div>
        <div className={`o-modal o-modal--${this.state && this.state.showCancellationModal ? 'show' : 'hide'}`}>
          <div className="o-modal__box o-modal__box--maximized">
            <button className="o-modal__closeBtn" onClick={this.closeModal.bind(this)}>
              <Close />
            </button>
            <p className="a-p(14)">
              {this.state.popupMsg}
            </p>

            <div className="o-modal__actions" style={{ whiteSpace: 'nowrap' }}>
              {(!this.state.cancelAndTalk && !this.state.justCancel && !this.state.talkToCEO) ?
                [<button type="button" className="b-flatBtn b-flatBtn--gradient(active-1)" onClick={this.talkToCEO.bind(this)}>
                  <span className="b-button__label">
                    I would like to talk to the CEO
                  </span>
                </button>, <br />,
                //   <button type="button" className="b-flatBtn b-flatBtn--gradient(active-2)" onClick={this.cancelAndTalk.bind(this)}>
                //   <span className="b-button__label">
                //     Cancel the plan but I would like to talk to the CEO
                // </span>
                // </button>, <br />,
                <button type="button" className="a-p(14) a-color(active-1) o-modal__linkBtn" onClick={this.justCancel.bind(this)}>
                  <span>
                    No thanks, I want to cancel my plan
                  </span>
                </button>]
                :
                [<button type="button" className="b-flatBtn b-flatBtn--gradient(active-3)" onClick={this.backToPlansSection.bind(this)}>
                  <span className="b-button__label">
                    Back to plans
                </span>
                </button>, <br />,
                <button style={{ display: (this.state.justCancel ? '' : 'none') }} type="button" className="b-flatBtn b-flatBtn--gradient(active-2)" onClick={this.showFeedback.bind(this)}>
                  <span className="b-button__label">
                    Share feedback
              </span>
                </button>]
              }
            </div>
          </div>
        </div>

        {/*
          BEGIN MODAL FOR CHANGE PLAN SUCCESS DIALOG
        */}
        <div className={`o-modal o-modal--${this.state && this.state.showUpdatedModal ? this.state.showUpdatedModal : 'hide'}`}>
          {/* Dialog notification
            - Use className 'o-modal--hide' to hide modal
            - Use className 'o-modal--show' to show modal
          */}

          <div className="o-modal__box o-modal__box--dialog">
            <p className="a-p(14)">
              {this.getPopupMessage()}
            </p>

            <div className="o-modal__actions">
              <button type="button" className="b-flatBtn b-flatBtn--gradient(active-3) b-flatBtn--w(120)" onClick={this.backToPlansSection.bind(this)}>
                <span className="b-button__label">
                  OK
                </span>
              </button>
            </div>
          </div>
        </div>
        {/*
        END MODAL FOR SWITCH PLAN SUCCESS DIALOG
        */}

        {/*
          BEGIN MODAL FOR PAUSE SUBSCRIPTION DIALOG
        */}
        <div className={`o-modal o-modal--${this.state && this.state.showPausedModal ? this.state.showPausedModal : 'hide'}`}>
          {/* Dialog notification
            - Use className 'o-modal--hide' to hide modal
            - Use className 'o-modal--show' to show modal
          */}

          <div className="o-modal__box">
            <p className="a-p(14)" style={{ textAlign: 'center' }}>
              Your request for pausing subscription has been sent. Our support team will reach out to you soon.
            </p>

            <div className="o-modal__actions" style={{ marginLeft: '40%' }}>
              <button type="button" className="b-flatBtn b-flatBtn--gradient(active-3) b-flatBtn--w(120)" onClick={this.backToPlansSection.bind(this)}>
                <span className="b-button__label">
                  OK
                </span>
              </button>
            </div>
          </div>
        </div>
        {/*
        END MODAL FOR PAUSE SUBSCRIPTION DIALOG
        */}

        {/*
          BEGIN MODAL FOR confirming subscription pause
        */}
        <div className={`o-modal o-modal--${this.state && this.state.showPauseSubscriptionModal ? this.state.showPauseSubscriptionModal : 'hide'}`}>
          {/* Dialog notification
            - Use className 'o-modal--hide' to hide modal
            - Use className 'o-modal--show' to show modal
          */}

          <div className="o-modal__box o-modal__box--dialog">
            <p className="a-p(14)">
              Please select the duration for pausing the subscription
            </p>
            <div className="o-progressMatrix__gradeSelector">
              <select onChange={this.setDuration.bind(this)} style={{width:'200px'}}>
                <option value="" selected>{Localization.localizedStringForKey('Select duration')}</option>
                <option value={1}>1 month</option>
                <option value={2}>2 months</option>
                <option value={3}>3 months</option>
              </select>
            </div>

            <div className="o-modal__actions">
              {
                this.state.selected_duration && this.state.selected_duration !== "" ? <button type="button" className="b-flatBtn b-flatBtn--gradient(active-3) b-flatBtn--w(120)" onClick={this.pauseSubscription.bind(this)}>
                  <span className="b-button__label">
                    OK
              </span>
                </button> : ''
              }

            </div>

            <div className="o-modal__actions">
              <button type="button" className="b-flatBtn b-flatBtn--gradient(active-1) b-flatBtn--w(120)" onClick={this.cancelPauseSubscription.bind(this)}>
                <span className="b-button__label">
                  CANCEL
                </span>
              </button>
            </div>
          </div>
        </div>
        {/*
        END MODAL FOR SWITCH PLAN SUCCESS DIALOG
        */}

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
            <div className={`o-loadingScreenModal o-loadingScreenModal--${(this.props.loading && this.props.loading.isLoading) || this.state.cancellingSubscription || this.props.student.updatingStudentPlan ? 'show' : 'hide'}`}>
              {/* Loading screen animation notification
                - Use className 'o-modal--hide' to hide modal
                - Use className 'o-modal--show' to show modal
              */}
              <LoadingSpinner />
            </div>
            <div className="a-container">
              <header className="a-viewHeader">
                <h1 className="a-h(28)">
                  {this.getStudentsName()}
                </h1>
              </header>

              {/*
              BEGIN SELECT PLAN WIZARD
              */}
              <div className="o-planWizard ">
                <Link className="o-planWizard__step" to={'/plans'}>
                  <span className="b-circleBox b-circleBox--size(32) b-circleBox--size(24) b-circleBox--color(copy-2)">
                    1
                  </span>
                  <span className="o-planWizard__stepName">
                    Manage Plans
                  </span>
                </Link>
                <div className="o-planWizard__next">
                  <ArrowRight />
                </div>
                <Link className="o-planWizard__step o-planWizard__step--current">
                  <span className="b-circleBox b-circleBox--size(32) b-circleBox--size(24)">
                    2
                  </span>
                  <span className="o-planWizard__stepName">
                    Thinkster Plan
                  </span>
                </Link>
              </div>
              {/*
              END SELECT PLAN WIZARD
              */}

              {/* this.getStudentPlanUI(this.props.params.studentId)*/}

              <div className="a-p(16) a-justify(center) b-section__title">
                Choose a plan from the options below.
              </div>

              <div className="a-row o-planSelector a-justifyContent(center)">
                {
                  (this.state && this.state.plans && this.state.plans.length > 0 ? this.state.plans.map((plan, i) => (
                    (this.checkStudentPlan(plan) ?
                      <div className="a-col a-col(1-3) a-col-tablet(1-2) o-planSelector__col">
                        <div style={{ border: '1px solid orange' }} className={`o-planOption a-justify(center) o-planOption--${plan && plan.service_id ? plan.service_id.toLowerCase() : ''} o-planOption--plan(current)`}>
                          <h2 className="o-planOption__name a-s(14) a-allCaps" style={{ color: (plan.service_id === 'Lite' ? '#d5a809' : '') }}>
                            {plan && plan.service_id ? plan.service_id : ''}&nbsp;{this.getGradeRange(plan)}
                          </h2>
                          <h3 className="o-planOption__price">
                            {this.billingMonthlyAmount(plan)}
                            <span className="a-p(14) a-color(copy-2)"> / month</span>
                          </h3>
                          {this.getSavingsMessage(plan)}
                          <ul className="o-planOption__features">
                            <li className="o-planOption__feature">
                              <p className="a-p(16)">
                                {plan.service_id === 'Silver' ? 'Up to 2 Phone Calls' : ''}
                                {plan.service_id === 'Gold' ? '2 Sessions' : ''}
                                {plan.service_id === 'Platinum' ? '4 Sessions' : ''}
                              </p>
                            </li>
                            <li>
                              <p className="a-p(14) a-color(copy-2)">

                                {plan.service_id === 'Lite' ?
                                  <p className="a-strike">
                                    Daily grading and feedback from your dedicated coach
                                  </p> : ''}

                                {plan.service_id === 'Silver' ?
                                  <p>
                                    Parent-coach progress discussions
                                  <br />
                                    (10-15 minutes each)
                                </p> : ''}

                                {plan.service_id === 'Gold' || plan.service_id === 'Platinum' ?
                                  <p>
                                    One-on-one, online coaching
                                  <br />
                                    (30 minutes each)</p> : ''}
                              </p>
                            </li>
                            <li className="o-planOption__feature">
                              {plan.service_id === 'Lite' ?
                                <p className="a-p(16)">
                                  Max of 10 worksheets / week
                                </p> : ''
                              }
                              {plan.service_id === 'Silver' ?
                                <p className="a-p(16) a-strike a-color(copy-3)">
                                  Homework Help
                            </p> : ''}

                              {plan.service_id === 'Gold' || plan.service_id === 'Platinum' ?
                                <p className="a-p(16)">
                                  Homework Help
                              </p> : ''
                              }
                            </li>
                            <li className="o-planOption__feature">


                              {plan.service_id === 'Silver' || plan.service_id === 'Lite' ?
                                <p className="a-p(16) a-strike a-color(copy-3)">
                                  Test Prep
                            </p> : ''}

                              {plan.service_id === 'Gold' || plan.service_id === 'Platinum' ?
                                <p className="a-p(16)">
                                  Test Prep
                              </p> : ''
                              }
                            </li>
                            <li className="o-planOption__feature">
                              {plan.service_id === 'Lite' ?
                                <p className="a-p(16)">
                                  Ability to request 3 specific concepts per month
                              </p> : ''}
                              {plan.service_id === 'Lite' ?
                                <p className="a-p(16)">
                                  Available across all devices
                              </p> : ''}
                            </li>
                          </ul>
                          <div className="o-planOption__action">
                            <span className="b-button__label" style={{ color: 'grey' }}>
                              Current Plan
                            </span>
                          </div>
                        </div>
                      </div>
                      :
                      <div className="a-col a-col(1-3) a-col-tablet(1-2) o-planSelector__col" style={{ display: (plan.service_id === 'Lite' ? (this.isStudentPlanLite(plan) ? '' : 'none') : '') }}>
                        <div className={`o-planOption a-justify(center) o-planOption--${plan && plan.service_id ? plan.service_id.toLowerCase() : ''}`}>
                          <h2 className="o-planOption__name a-s(14) a-allCaps" style={{ color: (plan.service_id === 'Lite' ? '#d5a809' : '') }}>
                            {plan && plan.service_id ? plan.service_id : ''}&nbsp;{this.getGradeRange(plan)}
                          </h2>
                          <h3 className="o-planOption__price">
                            {this.billingMonthlyAmount(plan)}
                            <span className="a-p(14) a-color(copy-2)"> / month</span>
                          </h3>
                          {this.getSavingsMessage(plan)}
                          <ul className="o-planOption__features">
                            <li className="o-planOption__feature">
                              <p className="a-p(16)">
                                {plan.service_id === 'Silver' ? 'Up to 2 Phone Calls' : ''}
                                {plan.service_id === 'Gold' ? '2 Sessions' : ''}
                                {plan.service_id === 'Platinum' ? '4 Sessions' : ''}
                              </p>
                            </li>
                            <li>
                              <p className="a-p(14) a-color(copy-2)">

                                {plan.service_id === 'Lite' ?
                                  <p>
                                    Free Skills Assessment ($100 value)
                              <br />
                                    10 worksheets / week
                            </p> : ''}

                                {plan.service_id === 'Silver' ?
                                  <p>
                                    Parent-coach progress discussions
                                  <br />
                                    (10-15 minutes each)
                                </p> : ''}

                                {plan.service_id === 'Gold' || plan.service_id === 'Platinum' ?
                                  <p>
                                    One-on-one, online coaching
                                  <br />
                                    (30 minutes each)</p> : ''}
                              </p>
                            </li>
                            <li className="o-planOption__feature">

                              {plan.service_id === 'Lite' ?
                                <p className="a-p(16)">
                                  Ability to request work from specific concepts from the Progress Matrix.
                                </p> : ''
                              }

                              {plan.service_id === 'Silver' ?
                                <p className="a-p(16) a-strike a-color(copy-3)">
                                  Homework Help
                            </p> : ''}

                              {plan.service_id === 'Gold' || plan.service_id === 'Platinum' ?
                                <p className="a-p(16)">
                                  Homework Help
                              </p> : ''
                              }
                            </li>
                            <li className="o-planOption__feature">
                              {plan.service_id === 'Lite' ?
                                <p className="a-p(16)">
                                  Active Replay Technology (ART)
                                </p> : ''
                              }

                              {plan.service_id === 'Silver' ?
                                <p className="a-p(16) a-strike a-color(copy-3)">
                                  Test Prep
                            </p> : ''}

                              {plan.service_id === 'Gold' || plan.service_id === 'Platinum' ?
                                <p className="a-p(16)">
                                  Test Prep
                              </p> : ''
                              }

                            </li>
                          </ul>
                          <div className="o-planOption__action">
                            <button type="button" className="b-flatBtn b-flatBtn--w(180)" onClick={this.onPlanSelection.bind(this, i)} style={{ background: (plan.service_id === 'Lite' ? '#d5a809' : '') }}>
                              <span className="b-button__label">
                                Choose {plan && plan.service_id ? plan.service_id : ''}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>)
                  )) : '')


                }
                <br />
                <div className="a-col a-col(1-3) a-col-tablet(1-2) o-planSelector__col" style={{ display: (this.checkSubscriptionId()) }}>
                  <div className="o-planOption a-justify(center) o-planOption--pause">
                    <h2 className="o-planOption__name a-s(14) a-allCaps">
                      Pause Plan
                    </h2>

                    <ul className="o-planOption__features">
                      <li className="o-planOption__feature">
                        <p className="a-p(16)">
                          Puts your account on hold.
                        </p>
                      </li>
                      <li>
                        <p className="a-p(14) a-color(copy-2)">
                          You will be billed {this.getCurrency()}1 per month during this time. Re-activate your plan any time you want.
                        </p>
                      </li>
                      <li className="o-planOption__feature">
                        <p className="a-p(16)">
                          Your data will be saved.
                        </p>
                      </li>
                      <li className="o-planOption__feature">
                        <p className="a-p(16)">
                          Your spot is reserved with your coach.
                          &nbsp;
                        </p>
                      </li>
                    </ul>
                    <div className="o-planOption__action">
                      <button type="button" className="b-flatBtn b-flatBtn--w(180)" onClick={this.pauseSubscriptionConfirmation.bind(this)}>
                        <span className="b-button__label">
                          Pause Plan
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
                {/*
                END PAUSE PLAN
                */}

                {/*
                BEGIN CANCEL PLAN
                */}
                <div className="a-col a-col(1-3) a-col-tablet(1-2) o-planSelector__col" style={{ display: (this.checkSubscriptionId()) }}>
                  <div className="o-planOption a-justify(center) o-planOption--cancel">
                    <h2 className="o-planOption__name a-s(14) a-allCaps">
                      Cancel {this.props.user.students[this.props.params.studentId].first_name && this.props.user.students[this.props.params.studentId].first_name != '' ? `${this.props.user.students[this.props.params.studentId].first_name}'s` : 'this student\'s'} Plan
                    </h2>

                    <ul className="o-planOption__features">
                      <li className="o-planOption__feature">
                        <p className="a-p(16)">
                          Removes student from your account.
                        </p>
                      </li>
                      <li>
                        <p className="a-p(14) a-color(copy-2)">
                          You will no longer be billed for this student.
                        </p>
                      </li>
                      <li className="o-planOption__feature">
                        <p className="a-p(16)">
                          Your data may be lost.
                        </p>
                      </li>
                      <li className="o-planOption__feature">
                        <p className="a-p(16)">
                          Your spot with your coach will be given to another student.
                        </p>
                      </li>
                    </ul>
                    <div className="o-planOption__action" style={{ marginTop: '45px' }}>
                      <button type="button" className="b-flatBtn b-flatBtn--w(180)" style={{ width: '100%' }} onClick={this.showCancelPlan.bind(this)}>
                        <span className="b-button__label">
                          Cancel {this.props.user.students[this.props.params.studentId].first_name && this.props.user.students[this.props.params.studentId].first_name != '' ? `${this.props.user.students[this.props.params.studentId].first_name}'s` : 'this student\'s'} Plan
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
                {/*
                END CANCEL PLAN
                */}
              </div>

              {(!this.isStudentInLitePlan()) ?
                <div>
                  <p className="a-p(14) a-color(copy-2)" style={{ marginTop: '45px' }}>
                    *If in our coach-led programs, you can upgrade and downgrade between Silver, Gold and Platinum. Have a busy schedule or need to take a break? Consider pausing your subscription to keep all progress and stay in the teacher’s class.
                  </p>
                </div> : ''}
            </div>


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
  loading: state.loading,
  zendesk: state.zendesk,
  mail: state.mail,
});

const actionCreators = {
  logout: SessionActions.logout,
  fetchAddons: AddonActions.fetchAddons,
  updateStudentPlan: StudentActions.updateStudentPlan,
  saveStudentDetails: StudentActions.saveStudentDetails,
  removeNewStudentDetails: StudentActions.removeNewStudentDetails,
  fetchUserPlans: UserActions.fetchUserPlans,
  fetchUserServiceLevels: UserActions.fetchUserServiceLevels,
  pauseSubscription: StudentActions.pauseSubscription,
  createZendeskTicket: ZendeskActions.createZendeskTicket,
  fetchTeachersDetails: StudentActions.fetchTeachersDetails,
  sendMail: MailActions.sendMail,
  cancelSubscription: StudentActions.cancelSubscription,
  sendCancelNotification: StudentActions.sendCancelNotification,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(ModifyPlan);

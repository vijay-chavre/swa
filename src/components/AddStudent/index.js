import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import lodash from 'lodash';
import moment from 'moment';
import ParentNav from '../Shared/ParentNav';
import ThinksterLogomark from '../Shared/Glyphs/ThinksterLogomark';
import ThinksterWordmark from '../Shared/Glyphs/ThinksterWordmark';
import ArrowRight from '../Shared/Glyphs/ArrowRight';
import Footer from '../Footer';
import config from '../../constants/config';
import * as Localization from '../Shared/Localization';
import LoadingSpinner from '../Shared/Glyphs/LoadingSpinner';

import * as AddonActions from '../../actions/addon';
import * as StudentActions from '../../actions/student';
import * as CommonActions from '../../actions/common';

export class AddStudent extends Component {

  constructor(props) {
    super(props);
    this.state = { step1: true, step2: false, step3: false };
  }

  componentDidMount() {
    const { fetchAddons, fetchGradesForCountry, user, student } = this.props;
    fetchGradesForCountry({ countryCode: user.country_code });
    fetchAddons({ user });
  }

  componentWillReceiveProps(nextProps) {
    const { student } = this.props;
    this.getPlans();
    if (this.state && this.state.addingStudent && nextProps && nextProps.student && nextProps.user && ((nextProps.student.addedNewSubscription && nextProps.student.addedNewStudent && nextProps.user.fetchedUser && nextProps.user.fetchedPaymentStatus) || nextProps.student.addNewStudentFailed)) {
      if (student && student.newStudentDetails && student.newStudentDetails.firstTimeCC) {
        if (nextProps.student.addedNewStudent) {
          this.setState({ addingStudent: false, showAddStudentModal: 'hide' });
          browserHistory.push('/thank-you');
        } else {
          this.setState({ addingStudent: false, showAddStudentModal: 'show' });
        }
      } else {
        this.setState({ addingStudent: false, showAddStudentModal: 'show' });
      }
    }
  }

  redirectToPaymentPage(e) {
    const { user, saveStudentDetails, student } = this.props;

    if (this.props.params.continuous === '1') {
      const studentData = {
        plans: (student.newStudentDetails ? student.newStudentDetails.plans : null),
        planSelected: (student.newStudentDetails ? student.newStudentDetails.planSelected : null),
        selectedPlan: (student.newStudentDetails ? student.newStudentDetails.selectedPlan : null),
        step2: false,
        step1: false,
        step3: true,
        state: (student.newStudentDetails ? student.newStudentDetails.state : this.state),
        nextURL: `/${user.userId}/addstudent/1`,
        planIndex: (student.newStudentDetails ? student.newStudentDetails.planIndex : null)
      };
      this.setState({ step2: false, step1: false, step3: true });
      saveStudentDetails(studentData);
      browserHistory.push('/payment/5');
    } else {
      const student = {
        plans: this.state.plans,
        planSelected: this.state.planSelected,
        selectedPlan: this.state.selectedPlan,
        step2: false,
        step1: false,
        step3: true,
        state: this.state,
        nextURL: `/${user.userId}/addstudent`,
        planIndex: this.state.planIndex,
      };
      saveStudentDetails(student);
      browserHistory.push('/payment/2');
    }
    e.stopPropagation();
  }

  addStudent(e) {
    const { fetchAddons, user, student, saveStudentDetails } = this.props;
    if (!this.checkAllRequiredFields()) {
      if (this.props.params.continuous === '1') {
        const plans = this.getPlans();
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

        const studentData = {
          plans,
          planSelected,
          selectedPlan: plans[planIndex],
          step2: false,
          step1: false,
          step3: true,
          state: (student.newStudentDetails && !student.newStudentDetails.paymentCompleted ? student.newStudentDetails.state : this.state),
          nextURL: `/${user.userId}/addstudent/1`,
          planIndex,
          firstTimeCC: true,
        };
        this.setState({ step2: false, step1: false, step3: true });
        saveStudentDetails(studentData);
        browserHistory.push('/payment/5');
      } else {
        this.setState({ step2: true, step1: false, step3: false });
        fetchAddons({ user });
      }
    }
  }

  checkAllRequiredFields() {
    let foundError = false;
    if (this.state.firstName == '' || this.state.firstName == null) {
      this.setState({ firstNameMissing: true });
      foundError = true;
    } else {
      this.setState({ firstNameMissing: false });
    }

    if (this.state.lastName == '' || this.state.lastName == null) {
      this.setState({ lastNameMissing: true });
      foundError = true;
    } else {
      this.setState({ lastNameMissing: false });
    }

    if (this.state.gender == '' || this.state.gender == null) {
      this.setState({ genderMissing: true });
      foundError = true;
    } else {
      this.setState({ genderMissing: false });
    }

    if (this.state.month == '' || this.state.month == null) {
      this.setState({ monthMissing: true });
      foundError = true;
    } else {
      this.setState({ monthMissing: false });
    }

    if (this.state.year == '' || this.state.year == null) {
      this.setState({ yearMissing: true });
      foundError = true;
    } else {
      this.setState({ yearMissing: false });
    }

    if (this.state.grade == '' || this.state.grade == null) {
      this.setState({ gradeMissing: true });
      foundError = true;
    } else {
      this.setState({ gradeMissing: false });
    }

    return foundError;
  }

  updatePlan(fromPayment, e) {
    if (fromPayment) {
      const { student, user, addNewStudent } = this.props;

      const studentData = {
        first_name: student.newStudentDetails.state.firstName,
        last_name: student.newStudentDetails.state.lastName,
        gender: student.newStudentDetails.state.gender,
        grade: student.newStudentDetails.state.grade,
        grade_year: new Date().getFullYear(),
        date_of_birth: `${student.newStudentDetails.state.year}-${student.newStudentDetails.state.month}-01`,
        school_name: '',
        comment: (student.newStudentDetails.state.comments ? student.newStudentDetails.state.comments : ''),
        programname: '',
        otherprogram: '',
        braintree: {
          addon_id: student.newStudentDetails.selectedPlan._id,
          billingFrequency: 1,
          gradeRange: student.newStudentDetails.selectedPlan.grade_range,
        },
        service_id: student.newStudentDetails.selectedPlan.service_id,
        fromPayment: true,
      };

      this.setState({ addingStudent: true });

      addNewStudent({ user, student: studentData });
    } else {
      const { addNewStudent, user } = this.props;
      const plans = (this.state ? this.state.plans : null);

      if (plans) {
        const planSelectedIndex = lodash.findIndex(plans, { checked: true });
        if (planSelectedIndex != -1) {
          const service_id = plans[planSelectedIndex].service_id;

          const student = {
            first_name: this.state.firstName,
            last_name: this.state.lastName,
            gender: this.state.gender,
            grade: this.state.grade,
            grade_year: new Date().getFullYear(),
            date_of_birth: `${this.state.year}-${this.state.month}-01`,
            school_name: '',
            comment: (this.state.comments ? this.state.comments : ''),
            programname: '',
            otherprogram: '',
            braintree: {
              addon_id: plans[planSelectedIndex]._id,
              billingFrequency: 1,
              gradeRange: plans[planSelectedIndex].grade_range,
            },
            service_id: plans[planSelectedIndex].service_id,
          };

          this.setState({ addingStudent: true });

          addNewStudent({ user, student });
        }
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
    this.state.billingFrequency = billingFrequency;
    return billingFrequency;
  }

  billingMonthlyAmount(plan) {
    let monthlyAmount = '';
    if (plan && plan.currency && plan.currency.symbol_native && plan.amount) {
      monthlyAmount = Math.round((plan.amount / plan.billingFrequency));
      return plan.currency.symbol_native + ' ' + monthlyAmount;
    }
    else {
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
      const textStyle = { 'font-size': '0.9375rem', color: '#748084' };
      const currencyStyle = { color: '#14C81F' };
      if (savings > 0) {
        return (<p style={textStyle}> <strong style={currencyStyle}>{currency}{savings} off</strong> when billed every {plan.billingFrequency} months. </p>);
      }
      return '';
    } else {
      return '';
    }
  }

  getGradeRange(plan) {
    const { user, addons } = this.props;
    let grade_range = '';
    if (plan && plan.grade_range) {
      if (user.country_code === 'GB') {
        const grade = this.state.grade;
        // increment grade
        //grade = grade && grade.toString().toLowerCase() != 'k' ? (parseInt(grade, 10) + 1) : 1;
        grade_range = grade > 6 ? '7 - 9' : '1 - 6';
      } else {
        grade_range = plan.grade_range;
      }
    }
    return grade_range;
  }

  getGrade(grade) {
    if (grade) {
      // if (user.country_code == 'GB') {
      //   grade = grade.toString().toLowerCase() != 'k' ? (parseInt(grade, 10) + 1) : 1;
      // }
      return grade;
    } else { return ''; }
  }

  getPlans() {
    const { user, addons } = this.props;
    let grade = this.state.grade;
    if (grade && grade.toString().toLowerCase() == 'k') {
      grade = 0;
    } else if (grade) {
      grade = parseInt(grade, 10);
    }
    //Get Billing Frequency
    let billingFrequency = this.billingFrequency(user);

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
            if (planNames[j] == 'Lite') {
              if (billingFrequency == 1) {
                plans.push(addons.addons[key][planNames[j]][1]);
              }
            }
            else {
              plans.push(addons.addons[key][planNames[j]][billingFrequency]);
            }
          }
        }
      }

      plans = lodash.orderBy(plans, (e) => parseInt(e.amount, 10), 'asc');
      this.setState({ plans });
      return plans;
    }
  }

  checkPaidStatus() {
    const { user } = this.props;

    if (user && user.paymentStatus && user.paymentStatus.isPaid && !user.paymentStatus.isCanceled && user.paymentStatus.modeOfPayment && user.paymentStatus.modeOfPayment.toLowerCase() !== 'inapppurchase') {
      return true;
    }

    if (user && user.paymentStatus && user.paymentStatus.creditcard && !user.paymentStatus.creditcard.expired && user.paymentStatus.isPaid && !user.paymentStatus.isCanceled) {
      return true;
    }

    return false;
  }

  onPlanSelection(planIndex, e) {
    const { user, saveStudentDetails, student } = this.props;
    const plans = (this.state && this.state.plans && this.state.plans.length > 0 ? this.state.plans : (student.newStudentDetails && !student.newStudentDetails.paymentCompleted ? student.newStudentDetails.plans : null));
    if (plans && planIndex != -1 && plans[planIndex]) {
      for (let i = plans.length - 1; i >= 0; i--) {
        plans[i].checked = false;
      }

      plans[planIndex].checked = !plans[planIndex].checked;
      const planSelected = plans[planIndex].checked;

      if (this.checkPaidStatus()) {
        this.setState({ plans, planSelected, selectedPlan: plans[planIndex], planIndex, step2: false, step1: false, step3: true });
      } else {
        this.setState({ step2: false, step1: false, step3: true });

        let firstTimeCC = false;
        if (user && user.paymentStatus && !user.paymentStatus.creditcard) {
          firstTimeCC = true;
        }
        if (student.newStudentDetails && !student.newStudentDetails.paymentCompleted) {
          for (let index = 0; index < plans.length; index++) {
            plans[index].checked = false;
          }
        }
        const studentData = {
          plans,
          planSelected,
          selectedPlan: plans[planIndex],
          step2: false,
          step1: false,
          step3: true,
          state: (student.newStudentDetails && !student.newStudentDetails.paymentCompleted ? student.newStudentDetails.state : this.state),
          nextURL: `/${user.userId}/addstudent`,
          planIndex,
          firstTimeCC,
        };
        saveStudentDetails(studentData);
        browserHistory.push('/payment/2');
      }
    }
    e.stopPropagation();
  }

  backToPlansSection(e) {
    this.setState({ showUpdatedModal: 'hide' });
    browserHistory.push('/plans');
  }

  goToStep(step, e) {
    const { user } = this.props;
    switch (step) {
      case 1: (!this.state.step1 ? this.setState({ step1: true, step2: false, step3: false }) : '');
        break;
      case 2: (!this.state.step2 && this.state.step3 ? this.setState({ step2: true, step1: false, step3: false }) : '');
        break;
    }
  }

  getStudentPlanUI() {
    const { user } = this.props;
    if (this.state) {
      return (<div className={'o-subscription o-subscription--plan(gold)'}>
        <img className="b-avatar o-subscription__studentPortrait" src={'https://s3.amazonaws.com/tabtor-profile-pictures/undefined.png'} />
        <div className="o-subscription__planInfo">
          <p className="o-subscription__student a-p(16)">
            {this.state.firstName + ' ' + this.state.lastName}
            <span className="a-p(14) a-color(copy-2)">
              &nbsp; {`(Grade ${this.state.grade})`}
            </span>
          </p>
        </div>


        <div className="o-subscription__billingInfo" />

        <div className="o-subscription__actions" style={{ float: 'right' }}>
          {
            this.state && this.state.planSelected ?

              <button className="b-flatBtn b-flatBtn--active-3" onClick={this.updatePlan.bind(this, false)}>
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

  getRemainingdays(date) {
    const days = moment(date).diff(moment(), 'days') + 1;
    return (days >= 7 ? '1 week' : `${days.toString()} days`);
  }

  getPaymentDateMessage() {
    const { user, student } = this.props;

    var isLitePlan = false;

    if (user && user.paymentStatus && user.paymentStatus.inTrial && !user.paymentStatus.isCanceled) {
      if (student && student.newStudentDetails && student.newStudentDetails.selectedPlan && student.newStudentDetails.selectedPlan.service_id && student.newStudentDetails.selectedPlan.service_id.toLowerCase() === 'lite') {
        isLitePlan = true;
      }
      if (isLitePlan) {
        return ('Your card will be charged immediately.');
      } else {
        return (`Thinkster Math is 100% Free for ${this.getRemainingdays(user.paymentStatus.firstBillingDate ? user.paymentStatus.firstBillingDate : user.paymentStatus.firstChargeDate)}.  Your Credit card will be charged on ${moment(user.paymentStatus.firstBillingDate ? user.paymentStatus.firstBillingDate : moment(user.paymentStatus.firstChargeDate).add(1, 'days')).format('LL')}.\n You can Cancel anytime.`);
      }
    }

    return 'Your account will be charged starting today.';
  }

  render() {
    const { student } = this.props;
    return (
      <div>
        {/*
          BEGIN MODAL FOR SUCCESS DIALOG
        */}
        <div className={`o-modal o-modal--${this.state.showAddStudentModal ? this.state.showAddStudentModal : 'hide'}`}>
          {/* Dialog notification
            - Use className 'o-modal--hide' to hide modal
            - Use className 'o-modal--show' to show modal
          */}

          <div className="o-modal__box o-modal__box--dialog">
            <p className="a-p(14)">
              {this.props.student && this.props.student.addedNewStudent && this.state && !this.state.addingStudent ?
                Localization.localizedStringForKey('Student has been added successfully.') : Localization.localizedStringForKey('An error occured. Student could not be added. Please try again later.')
              }

            </p>

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
        END MODAL FOR SUCCESS DIALOG
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
              {Localization.localizedStringForKey('Add New Student')}
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
        {this.props.params.continuous !== '1' ? <ParentNav /> : ''}

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
                  Add New Student
                </h1>
              </header>

              <div className="o-planWizard ">
                <div className="o-planWizard__steps">
                  <Link style={{ cursor: 'pointer' }} className={`o-planWizard__step ${this.state.step1 && !(student && student.newStudentDetails) ? 'o-planWizard__step--current' : ''}`} onClick={this.goToStep.bind(this, 1)}>
                    <span className="b-circleBox b-circleBox--size(32) b-circleBox--size(24) b-circleBox--color(copy-2)">
                      1
                    </span>
                    <span className="o-planWizard__stepName">
                      Student Info
                    </span>
                  </Link>
                  <span className="o-planWizard__next">
                    <ArrowRight />
                  </span>

                  <Link style={{ cursor: 'pointer' }} className={`o-planWizard__step ${this.state.step2 && !(student && student.newStudentDetails) ? 'o-planWizard__step--current' : ''}`} onClick={this.goToStep.bind(this, 2)}>
                    <span className="b-circleBox b-circleBox--size(32) b-circleBox--size(24)">
                      2
                    </span>
                    <span className="o-planWizard__stepName">
                      Thinkster Plan
                    </span>
                  </Link>
                  <span className="o-planWizard__next">
                    <ArrowRight />
                  </span>
                  <Link style={{ cursor: 'pointer' }} className={`o-planWizard__step ${this.state.step3 || (student && student.newStudentDetails) ? 'o-planWizard__step--current' : ''}`} onClick={this.goToStep.bind(this, 3)}>
                    <span className="b-circleBox b-circleBox--size(32) b-circleBox--size(24)">
                      3
                    </span>
                    <span className="o-planWizard__stepName">
                      Summary
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/*
            END ADD STUDENT WIZARD
            */}


            {student && student.newStudentDetails && student.newStudentDetails.paymentCompleted ?
              (
                <div className="a-container">
                  <div className="a-row a-justifyContent(center)">
                    <div className="a-col a-col(2-3) a-col-med-1(1-2)">
                      <p className="a-p(16) a-justify(center)">
                        Here&rsquo;s your order summary
                          </p>
                      <p className="a-p(14) a-color(copy-2) a-justify(center) b-section__title">
                        {this.getPaymentDateMessage()}
                      </p>
                      <div className="o-subscription o-subscription--plan(gold)">

                        <img className="b-avatar b-avatar--size(32) o-subscription__studentPortrait" src="/images/glyph_user-2.svg" type="image/png" />

                        <div className="o-subscription__planInfo o-subscription__planInfo--summary">
                          <p className="o-subscription__student a-p(16)">
                            {student.newStudentDetails.state.firstName}
                            <span className="a-p(14) a-color(copy-2)">
                              &nbsp; ({Localization.localizedStringForKey('Grade')}
                              &nbsp;{this.getGrade(student.newStudentDetails.state.grade)})
                          </span>
                          </p>
                          <p className="o-subscription__planName a-s(12) a-allCaps">
                            {student.newStudentDetails.selectedPlan ? student.newStudentDetails.selectedPlan.service_id : 'No '} Plan ({this.getGradeRange(student.newStudentDetails.selectedPlan)})
                          </p>
                        </div>

                        <div className="o-subscription__billingInfo o-subscription__billingInfo--summary">
                          <p className="a-p(12) a-strong a-color(copy-2)">
                            {Localization.localizedStringForKey('Active')}
                          </p>
                          <p className="a-p(16)">
                            {student.newStudentDetails.selectedPlan ? (student.newStudentDetails.selectedPlan.currency ? student.newStudentDetails.selectedPlan.currency.symbol_native : '') : ''}{student.newStudentDetails.selectedPlan ? student.newStudentDetails.selectedPlan.amount : ''}
                            <span className="a-p(14) a-color(copy-2)">
                              &nbsp; / {this.state.billingFrequency == 1 ? Localization.localizedStringForKey('month') : Localization.localizedStringForKey('3 months')}
                            </span>
                          </p>
                        </div>
                      </div>

                      <p className="a-p(16) a-justify(center)">
                        Payment method
                        </p>
                      <div className="o-subscription">

                        <div className="o-subscription__planInfo o-subscription__planInfo--summary">
                          <p className="o-subscription__student a-p(16)">
                            {this.props.user && this.props.user.paymentStatus && this.props.user.paymentStatus.creditcard ?
                              <span><strong>{this.props.user && this.props.user.paymentStatus && this.props.user.paymentStatus.creditcard ? this.props.user.paymentStatus.creditcard.cardType : ''}</strong> {Localization.localizedStringForKey('ending in')} <strong>{this.props.user && this.props.user.paymentStatus && this.props.user.paymentStatus.creditcard ? this.props.user.paymentStatus.creditcard.last4 : ''}</strong></span>
                              : <span><strong>PayPal </strong></span>}
                          </p>
                        </div>

                        <div style={{ cursor: 'pointer', textAlign: 'right' }} className="o-subscription__billingInfo o-subscription__billingInfo--summary">
                          <a className="a-p(12) a-strong" onClick={this.redirectToPaymentPage.bind(this)}>
                            Change
                            </a>
                        </div>
                      </div>


                      <div className="o-subscription__actions o-subscription__actions--summary">
                        <button type="button" className="b-flatBtn b-flatBtn--large b-flatBtn--gradient(active-1)" onClick={this.updatePlan.bind(this, true)}>
                          <span className="b-button__label a-allCaps">
                            CONFIRM
                          </span>
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              )

              :
              (this.state.step2 || (student.newStudentDetails && !student.newStudentDetails.paymentCompleted && this.props.params.continuous === null) ?
                <div className="a-container">

                  {/* this.getStudentPlanUI()*/}

                  <div className="a-p(16) a-justify(center) b-section__title">
                    Choose a plan from the options below.
                  </div>

                  <div className="a-row o-planSelector a-justifyContent(center)">
                    {
                      (this.state && this.state.plans && this.state.plans.length > 0 ? this.state.plans.map((plan, i) => (
                        <div className="a-col a-col(1-3) a-col-tablet(1-2) o-planSelector__col">
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
                                {plan.service_id === 'Silver' ?
                                  <p className="a-p(16) a-strike a-color(copy-3)">
                                    Homework Help
                                </p> : ''}

                                {plan.service_id === 'Lite' ?
                                  <p className="a-p(16)">
                                    Max of 10 worksheets / week
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
                              <button type="button" className="b-flatBtn b-flatBtn--w(180)" onClick={this.onPlanSelection.bind(this, i)} style={{ background: (plan.service_id === 'Lite' ? '#d5a809' : '') }}>
                                <span className="b-button__label">
                                  Choose {plan && plan.service_id ? plan.service_id : ''}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )) : (student.newStudentDetails && student.newStudentDetails.plans && student.newStudentDetails.plans.length > 0 ? student.newStudentDetails.plans.map((plan, i) => (
                        <div className="a-col a-col(1-3) a-col-tablet(1-2) o-planSelector__col">
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
                                {plan.service_id === 'Silver' ?
                                  <p className="a-p(16) a-strike a-color(copy-3)">
                                    Homework Help
                                </p> : ''}

                                {plan.service_id === 'Lite' ?
                                  <p className="a-p(16)">
                                    Max of 10 worksheets / week
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
                              <button type="button" className="b-flatBtn b-flatBtn--w(180)" onClick={this.onPlanSelection.bind(this, i)} style={{ background: (plan.service_id === 'Lite' ? '#d5a809' : '') }}>
                                <span className="b-button__label">
                                  Choose {plan && plan.service_id ? plan.service_id : ''}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )) : ''))


                    }
                  </div>
                </div>
                :
                (this.state.step3 ?
                  <div className="a-container">
                    <div className="a-row a-justifyContent(center)">
                      <div className="a-col a-col(2-3) a-col-med-1(1-2)">
                        <p className="a-p(16) a-justify(center)">
                          Here&rsquo;s your order summary
                          </p>
                        <p className="a-p(14) a-color(copy-2) a-justify(center) b-section__title">
                          {this.getPaymentDateMessage()}
                        </p>
                        <div className="o-subscription o-subscription--plan(gold)">

                          <img className="b-avatar b-avatar--size(32) o-subscription__studentPortrait" src="/images/glyph_user-2.svg" type="image/png" />

                          <div className="o-subscription__planInfo o-subscription__planInfo--summary">
                            <p className="o-subscription__student a-p(16)">
                              {this.state.firstName}
                              <span className="a-p(14) a-color(copy-2)">
                                &nbsp; ({Localization.localizedStringForKey('Grade')}
                                &nbsp;{this.getGrade(this.state.grade)})
                          </span>
                            </p>
                            <p className="o-subscription__planName a-s(12) a-allCaps">
                              {this.state.selectedPlan ? this.state.selectedPlan.service_id : 'No '} Plan ({this.getGradeRange(this.state.selectedPlan)})
                            </p>
                          </div>

                          <div className="o-subscription__billingInfo o-subscription__billingInfo--summary">
                            <p className="a-p(12) a-strong a-color(copy-2)">
                              {Localization.localizedStringForKey('Active')}
                            </p>
                            <p className="a-p(16)">
                              {this.state.selectedPlan ? (this.state.selectedPlan.currency ? this.state.selectedPlan.currency.symbol_native : '') : ''}{this.state.selectedPlan ? this.state.selectedPlan.amount : ''}
                              <span className="a-p(14) a-color(copy-2)">
                                &nbsp; / {this.state.billingFrequency == 1 ? Localization.localizedStringForKey('month') : Localization.localizedStringForKey('3 months')}
                              </span>
                            </p>
                          </div>
                        </div>

                        <p className="a-p(16) a-justify(center)" style={{ display: (this.props.user && this.props.user.paymentStatus && this.props.user.paymentStatus.creditcard ? '' : 'none') }}>
                          Payment method
                        </p>
                        <div className="o-subscription" style={{ display: (this.props.user && this.props.user.paymentStatus && this.props.user.paymentStatus.creditcard ? '' : 'none') }}>

                          <div className="o-subscription__planInfo o-subscription__planInfo--summary">
                            <p className="o-subscription__student a-p(16)">
                              {this.props.user && this.props.user.paymentStatus && this.props.user.paymentStatus.creditcard ?
                                <span> <strong>{this.props.user && this.props.user.paymentStatus && this.props.user.paymentStatus.creditcard ? this.props.user.paymentStatus.creditcard.cardType : ''}</strong> {Localization.localizedStringForKey('ending in')} <strong>{this.props.user && this.props.user.paymentStatus && this.props.user.paymentStatus.creditcard ? this.props.user.paymentStatus.creditcard.last4 : ''}</strong></span>
                                : <span><strong>PayPal</strong></span>}
                            </p>
                          </div>

                          <div style={{ cursor: 'pointer', textAlign: 'right' }} className="o-subscription__billingInfo o-subscription__billingInfo--summary">
                            <a className="a-p(12) a-strong" onClick={this.redirectToPaymentPage.bind(this)}>
                              Change
                            </a>
                          </div>
                        </div>


                        <div className="o-subscription__actions o-subscription__actions--summary">
                          <button type="button" className="b-flatBtn b-flatBtn--large b-flatBtn--gradient(active-1)" onClick={this.updatePlan.bind(this, false)}>
                            <span className="b-button__label a-allCaps">
                              CONFIRM
                              </span>
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>
                  :
                  <div className="a-container">
                    <div className="a-row a-justifyContent(center)">
                      <div className="a-col a-col(2-3) a-col-med-1(1-2)">
                        <p className="a-p(16) a-justify(center) b-section__title">
                          Tell us about your student.
                          </p>
                        <div className="o-studentForm">
                          <div className="o-studentForm__field">
                            <label className="b-formTextInput">
                              <span className="b-formTextInput__label a-color(copy-1)">
                                First Name <span className="a-color(alert)"> * </span>
                              </span>
                              <input defaultValue={this.state.firstName} name="" type="text" label="First Name" className="b-formTextInput__input " onChange={(e) => { this.setState({ firstName: e.target.value }); }} />
                            </label>
                            <label style={{ display: (this.state.firstNameMissing ? '' : 'none'), color: 'red', marginLeft: '160px' }}>
                              Please enter a first name
                              </label>
                          </div>

                          <div className="o-studentForm__field">
                            <label className="b-formTextInput">
                              <span className="b-formTextInput__label a-color(copy-1)">
                                Last Name <span className="a-color(alert)"> * </span>
                              </span>
                              <input defaultValue={this.state.lastName} name="" type="text" label="Last Name" className="b-formTextInput__input " onChange={(e) => { this.setState({ lastName: e.target.value }); }} />
                            </label>
                            <label style={{ display: (this.state.lastNameMissing ? '' : 'none'), color: 'red', marginLeft: '160px' }}>
                              Please enter a last name
                              </label>
                          </div>

                          <div className="o-studentForm__field">
                            <label className="b-formTextInput">
                              <span className="b-formTextInput__label a-color(copy-1)">
                                Additional Comments
                            </span>
                              <textarea defaultValue={this.state.comments} className="b-textarea" placeholder="Any helpful information to understand your child’s learning needs." onChange={(e) => { this.setState({ comments: e.target.value }); }} />
                            </label>
                          </div>

                          <div className="o-studentForm__field">
                            <label className="b-formTextInput b-dropDownSelector">
                              <span className="b-formTextInput__label a-color(copy-1)">
                                Gender <span className="a-color(alert)"> * </span>
                              </span>
                              <select className="b-dropDownSelector__select b-dropDownSelector__selectArrow" onChange={(e) => { this.setState({ gender: e.target.value }); }}>
                                <option value="" />
                                <option value="Male" selected={(this.state.gender === 'Male' ? 'selected' : '')}>Boy</option>
                                <option value="Female" selected={(this.state.gender === 'Female' ? 'selected' : '')}>Girl</option>
                              </select>
                            </label>
                            <label style={{ display: (this.state.genderMissing ? '' : 'none'), color: 'red', marginLeft: '160px' }}>
                              Please select a gender
                              </label>
                          </div>

                          <div className="o-studentForm__field">
                            <span className="b-dropDownSelector">
                              <span className="b-formTextInput__label a-color(copy-1)">
                                Birth Month &amp; Year <span className="a-color(alert)"> * </span>
                              </span>
                              <div className="b-formTextInput__col">
                                <select className="b-dropDownSelector__select b-dropDownSelector__selectArrow" onChange={(e) => { this.setState({ month: e.target.value }); }}>
                                  <option value="" />
                                  <option value="January" selected={(this.state.month === 'January' ? 'selected' : '')}>January</option>
                                  <option value="February" selected={(this.state.month === 'February' ? 'selected' : '')}>February</option>
                                  <option value="March" selected={(this.state.month === 'March' ? 'selected' : '')}>March</option>
                                  <option value="April" selected={(this.state.month === 'April' ? 'selected' : '')}>April</option>
                                  <option value="May" selected={(this.state.month === 'May' ? 'selected' : '')}>May</option>
                                  <option value="June" selected={(this.state.month === 'June' ? 'selected' : '')}>June</option>
                                  <option value="July" selected={(this.state.month === 'July' ? 'selected' : '')}>July</option>
                                  <option value="August" selected={(this.state.month === 'August' ? 'selected' : '')}>August</option>
                                  <option value="September" selected={(this.state.month === 'September' ? 'selected' : '')}>September</option>
                                  <option value="October" selected={(this.state.month === 'October' ? 'selected' : '')}>October</option>
                                  <option value="November" selected={(this.state.month === 'November' ? 'selected' : '')}>November</option>
                                  <option value="December" selected={(this.state.month === 'December' ? 'selected' : '')}>December</option>
                                </select>
                                <select className="b-dropDownSelector__select b-dropDownSelector__selectArrow" onChange={(e) => { this.setState({ year: e.target.value }); }}>
                                  <option value="" />
                                  <option value="2017" selected={(this.state.year === '2017' ? 'selected' : '')}>2017</option>
                                  <option value="2016" selected={(this.state.year === '2016' ? 'selected' : '')}>2016</option>
                                  <option value="2015" selected={(this.state.year === '2015' ? 'selected' : '')}>2015</option>
                                  <option value="2014" selected={(this.state.year === '2014' ? 'selected' : '')}>2014</option>
                                  <option value="2013" selected={(this.state.year === '2013' ? 'selected' : '')}>2013</option>
                                  <option value="2012" selected={(this.state.year === '2012' ? 'selected' : '')}>2012</option>
                                  <option value="2011" selected={(this.state.year === '2011' ? 'selected' : '')}>2011</option>
                                  <option value="2010" selected={(this.state.year === '2010' ? 'selected' : '')}>2010</option>
                                  <option value="2009" selected={(this.state.year === '2009' ? 'selected' : '')}>2009</option>
                                  <option value="2008" selected={(this.state.year === '2008' ? 'selected' : '')}>2008</option>
                                  <option value="2007" selected={(this.state.year === '2007' ? 'selected' : '')}>2007</option>
                                  <option value="2006" selected={(this.state.year === '2006' ? 'selected' : '')}>2006</option>
                                  <option value="2005" selected={(this.state.year === '2005' ? 'selected' : '')}>2005</option>
                                  <option value="2004" selected={(this.state.year === '2004' ? 'selected' : '')}>2004</option>
                                  <option value="2003" selected={(this.state.year === '2003' ? 'selected' : '')}>2003</option>
                                  <option value="2002" selected={(this.state.year === '2002' ? 'selected' : '')}>2002</option>
                                  <option value="2001" selected={(this.state.year === '2001' ? 'selected' : '')}>2001</option>
                                  <option value="2000" selected={(this.state.year === '2000' ? 'selected' : '')}>2000</option>
                                </select>

                              </div>
                            </span>
                            <label style={{ display: (this.state.yearMissing || this.state.monthMissing ? '' : 'none'), color: 'red', marginLeft: '160px' }}>
                              Please select a month and year
                              </label>
                          </div>

                          <div className="o-studentForm__field">
                            <label className="b-dropDownSelector">
                              <span className="b-formTextInput__label a-color(copy-1)">
                                Grade <span className="a-color(alert)"> * </span>
                              </span>
                              <div className="b-formTextInput__col">
                                <select className="b-dropDownSelector__select b-dropDownSelector__selectArrow" onChange={(e) => { this.setState({ grade: e.target.value }); }}>
                                  <option value="">Select a grade</option>
                                  {this.props.common && this.props.common.grades ? this.props.common.grades.keys.map((key, index) => (
                                    <option value={this.props.common.grades.labels[index]} selected={(this.state.grade === this.props.common.grades.labels[index] ? 'selected' : '')}>{`${this.props.common.grades.label} ${key}`}</option>
                                  )) : <option value={-1}>{'Unable to fetch data'}</option>
                                  }
                                </select>
                                {/* <option value="" />
                                    <option value="K" selected={(this.state.grade === 'K' ? 'selected' : '')}>Kindergarten</option>
                                    <option value="1" selected={(this.state.grade === '1' ? 'selected' : '')}>Grade 1</option>
                                    <option value="2" selected={(this.state.grade === '2' ? 'selected' : '')}>Grade 2</option>
                                    <option value="3" selected={(this.state.grade === '3' ? 'selected' : '')}>Grade 3</option>
                                    <option value="4" selected={(this.state.grade === '4' ? 'selected' : '')}>Grade 4</option>
                                    <option value="5" selected={(this.state.grade === '5' ? 'selected' : '')}>Grade 5</option>
                                    <option value="6" selected={(this.state.grade === '6' ? 'selected' : '')}>Grade 6</option>
                                    <option value="7" selected={(this.state.grade === '7' ? 'selected' : '')}>Grade 7</option>
                                    <option value="8" selected={(this.state.grade === '8' ? 'selected' : '')}>Grade 8</option>
                                  </select> */}
                                <span className="b-formTextInput__help  a-color(copy-2)">
                                  {this.props.common && this.props.common.grades ? this.props.common.grades.gradeAsOfYearText : ''}
                                </span>
                              </div>

                            </label>
                            <label style={{ display: (this.state.gradeMissing ? '' : 'none'), color: 'red', marginLeft: '160px' }}>
                              Please select a grade
                              </label>
                          </div>

                          <div className="o-studentForm__action">
                            <button type="button" className="b-flatBtn b-flatBtn--w(180) b-flatBtn--gradient(active-1)" onClick={this.addStudent.bind(this)}>
                              <span className="b-button__label">
                                Create Student
                                </span>
                            </button>
                          </div>

                        </div>
                      </div>

                    </div>
                  </div>
                )
              )


            }


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
  loading: state.loading,
  common: state.common,
});

const actionCreators = {
  fetchAddons: AddonActions.fetchAddons,
  addNewStudent: StudentActions.addNewStudent,
  saveStudentDetails: StudentActions.saveStudentDetails,
  fetchGradesForCountry: CommonActions.fetchGradesForCountry,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(AddStudent);

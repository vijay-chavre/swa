import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link, browserHistory } from 'react-router';
import Helmet from 'react-helmet';
import moment from 'moment';
import lodash from 'lodash';
import ThinksterLogomark from '../Shared/Glyphs/ThinksterLogomark';
import ThinksterWordmark from '../Shared/Glyphs/ThinksterWordmark';
import ParentNav from '../Shared/ParentNav';
import Footer from '../Footer';
import SwitchModal from './SwitchModal';
import config from '../../constants/config';
import * as Common from '../Shared/Common';
import * as Localization from '../Shared/Localization';
import StudentPlans from '../StudentPlans';
import UserProducts from '../UserProducts';
import UserSessions from '../UserSessions';
import * as UserActions from '../../actions/user';
import * as ZendeskActions from '../../actions/zendesk';
import * as StudentActions from '../../actions/student';
import * as BraintreeActions from '../../actions/setBraintreeClientToken';
import * as SessionActions from '../../actions/session';
import LoadingSpinner from '../Shared/Glyphs/LoadingSpinner';

class ManagePlans extends Component {

  constructor(props) {
    super(props);
    this.state = {};
    if (Common && Common.isGuest(this.props.user)) {
      browserHistory.push('/students');
    }
  }

  static propTypes = {
    logout: React.PropTypes.func,
    session: React.PropTypes.shape({
      user_id: React.PropTypes.string,
    }),
    user: React.PropTypes.shape({

    }),
    fetchUserPlans: React.PropTypes.func,
    fetchUserServiceLevels: React.PropTypes.func,
    fetchUserPaymentStatus: React.PropTypes.func,
    resetZendeskData: React.PropTypes.func,
  }

  componentDidMount() {
    const { fetchUser, removeNewStudentDetails, fetchUserPaymentStatus, fetchUserServiceLevels, fetchUserPlans, user, session, resetZendeskData, getBraintreeClientToken } = this.props;
    if (user && user._id) {
      fetchUserPlans({ user });
      fetchUserServiceLevels({ user });
      fetchUserPaymentStatus({ userId: user._id, fetchSynchronously: true });
    } else if (session && session.user_id) {
      fetchUser({ userId: session.user_id, fetchAllPlanDetails: true });
    }

    resetZendeskData();
    removeNewStudentDetails();
  }

  switchToBillingSubject() {
    const { user } = this.props;
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
    if (billingFrequency === 3) {
      this.state.switchToBillingSubject = 'Switch to 1 month billing';
      this.state.billingType = 1;
    } else {
      this.state.switchToBillingSubject = 'Switch to 3 month billing';
      this.state.billingType = 3;
    }
  }

  getCurrency(studentId) {
    const { user } = this.props;

    if (user && user.students && user.students[studentId] && user.planDetails && user.planDetails[studentId].currency) { return user.planDetails[studentId].currency.symbol_native; }
    return '-';
  }

  getSubscriptionTotal() {
    const { user } = this.props;
    let amount = 0;
    let currency;
    let discount = 0;
    const studentIds = Object.keys(user.students);

    for (let i = studentIds.length - 1; i >= 0; i--) {
      if (user.students[studentIds[i]] && !this.getCancelledStatus(studentIds[i]) && user.planDetails && user.planDetails[studentIds[i]]) {
        amount += user.planDetails[studentIds[i]].amount;
        currency = user.planDetails[studentIds[i]].currency.symbol_native;
      }
    }
    if (user && user.students && user.students[studentIds[0]] && user.students[studentIds[0]].serviceLevel && user.students[studentIds[0]].serviceLevel.subscription && user.students[studentIds[0]].serviceLevel.subscription.discounts) {
      for (let i = user.students[studentIds[0]].serviceLevel.subscription.discounts.length - 1; i >= 0; i--) {
        discount += Number.parseFloat(user.students[studentIds[0]].serviceLevel.subscription.discounts[i].amount) * user.students[studentIds[0]].serviceLevel.subscription.discounts[i].quantity;
      }
    }

    amount -= discount;

    if (amount <= 0) { return 0; }
    return currency + amount;
  }

  getSubscriptionDetails() {
    const { user } = this.props;
    if (user && user.students) {
      const studentIds = Object.keys(user.students);
      const studentId_0 = studentIds[0];
      return (
        <div className="a-col a-col(1-3)">
          {/* Hiding subscription temporary*/}
          <section className="b-section" style={{ display: (this.getSubscriptionTotal() === 0 ? 'none' : 'none') }}>
            <header className="b-sectionHeader">
              <h2 className="a-h(22) b-sectionHeader__title">
                {Localization.localizedStringForKey('Subscription Details')}
              </h2>
            </header>
            <ul className="o-subscriptionDetails">
              {user && user.students ? studentIds.map((studentId) => (
                (user.students[studentId] && user.planDetails && user.planDetails[studentId] && !this.getCancelledStatus(studentId) ?
                  <li className="o-subscriptionDetails__item o-subscriptionDetails__item--divider">
                    <div className="o-subscriptionDetails__itemName a-p(14) a-allCaps">
                      {user.planDetails[studentId].name} &ndash; <em>{user.planDetails[studentId].billingFrequency ? user.planDetails[studentId].billingFrequency : 1} {((!user.planDetails[studentId].billingFrequency || user.planDetails[studentId].billingFrequency === 1) ? ' month' : ' months')}</em>
                    </div>
                    <div className="o-subscriptionDetails__itemPrice a-p(14) a-color(copy-2)">
                      {this.getCurrency(studentId) + user.planDetails[studentId].amount}
                      {/* Free*/}
                    </div>
                  </li> : '')
              )) : 'No plans found'
              }
              {user && user.students && user.students[studentId_0] && user.students[studentId_0].serviceLevel && user.students[studentId_0].serviceLevel.subscription && user.students[studentId_0].serviceLevel.subscription.discounts ?
                (user.students[studentId_0].serviceLevel.subscription.discounts.map((discount) => (
                  <li className="o-subscriptionDetails__item a-mTop(8)">
                    <div className="o-subscriptionDetails__itemName a-p(14)">
                      {discount.name}
                    </div>
                    <div className="o-subscriptionDetails__itemPrice a-p(14) a-color(copy-2)">
                      -{this.getCurrency(studentId_0)}{ Number.parseFloat(discount.amount) * discount.quantity}
                    </div>
                  </li>
                ))) : ''
              }

              {/* <li className="o-subscriptionDetails__item">
                <div className="o-subscriptionDetails__itemName a-p(14)">
                  Subtotal
                </div>
                <div className="o-subscriptionDetails__itemPrice a-p(14) a-color(copy-2)">
                  $270.00
                </div>
              </li>
              <li className="o-subscriptionDetails__item a-mTop(8)">
                <div className="o-subscriptionDetails__itemName a-p(14)">
                  Referral Code: Sam1121
                </div>
                <div className="o-subscriptionDetails__itemPrice a-p(14) a-color(copy-2)">
                  -$20.00
                </div>
              </li>
              <li className="o-subscriptionDetails__item a-mTop(8)">
                <div className="o-subscriptionDetails__itemName a-p(14)">
                  Promo Code: Accelerate2017
                </div>
                <div className="o-subscriptionDetails__itemPrice a-p(14) a-color(copy-2)">
                  -$20.00
                </div>
              </li>*/}
              {/*
                <li className="o-subscriptionDetails__item a-mTop(8)">
                  <div className="o-subscriptionDetails__itemName a-p(14)">
                    3 Month Billing Savings
                  </div>
                  <div className="o-subscriptionDetails__itemPrice a-p(14) a-color(copy-2)">
                    -$20.00
                  </div>
                </li>
              */}
              {/* <li className="o-subscriptionDetails__item a-mTop(8)">
                <div className="o-subscriptionDetails__itemName a-p(14)">
                  Total Savings
                </div>
                <div className="o-subscriptionDetails__itemPrice a-p(14) a-color(active-3)">
                  $40.00
                </div>
              </li>*/}
            </ul>
            <div className="o-subscriptionDetails__item o-subscriptionDetails__item--total">
              <div className="o-subscriptionDetails__itemName a-p(16)">
                {Localization.localizedStringForKey('Subscription Total')}
              </div>
              <div className="o-subscriptionDetails__itemPrice a-p(16) a-color(copy-1)">
                {this.getSubscriptionTotal()}
              </div>
            </div>
          </section>

        </div>);
    }
  }

  getCancelledStatus(studentId) {
    const { user } = this.props;
    if (user && user.paymentStatus && user.paymentStatus.students) {
      const studentIndex = lodash.findIndex(user.paymentStatus.students, { id: studentId });
      if (studentIndex != -1) {
        if (user.paymentStatus.students[studentIndex].isCanceled || user.paymentStatus.students[studentIndex].enrollment_end_date) {
          return true;
        }
      }
    }

    return false;
  }

  getPaymentDetails() {
    const { user } = this.props;

    return (user.paymentStatus && !user.paymentStatus.isCanceled ?
      <p className="a-p(14)">
        {user.paymentStatus.nextBillingDate && user.paymentStatus.currency_code && user.paymentStatus.nextBillAmount != 0 && user.paymentStatus.nextBillingDate ?
          <span>{Localization.localizedStringForKey('Your next payment of')} <strong>{user.paymentStatus.currency_code + user.paymentStatus.nextBillAmount}</strong> {Localization.localizedStringForKey('will be processed on')} <strong>{moment(user.paymentStatus.nextBillingDate).format('LL')}</strong>.</span>
          : `${Localization.localizedStringForKey('No upcoming payments.')}`
        }
        <br />
        {user.paymentStatus.nextBillingDate && user.paymentStatus.currency_code && user.paymentStatus.nextBillAmount != 0 && user.paymentStatus.nextBillingDate && user.paymentStatus.creditcard ?
          <span>{Localization.localizedStringForKey('Your')} {user.paymentStatus.creditcard.cardType} {Localization.localizedStringForKey('ending in')} <strong>{user.paymentStatus.creditcard.last4}</strong> {Localization.localizedStringForKey('will be charged automatically.')}</span>
          : ''
        }
      </p>
      : <p className="a-p(14)">{Localization.localizedStringForKey('No upcoming payments.')}</p>);
  }

  addNewStudent(e) {
    const { user, saveStudentDetails } = this.props;
    saveStudentDetails(null);
    browserHistory.push(`${this.props.user._id}/addstudent`);
  }

  hide3MonthBillingModal(e) {
    this.setState({ show3MonthModal: false });
  }

  show3MonthBillingModal(e) {
    this.setState({ show3MonthModal: true });
  }

  getCancelledStatusOfParent() {
    const { user } = this.props;
    return (user.paymentStatus && !user.paymentStatus.isCanceled && user.paymentStatus.isPaid);
  }

  buyProduct(e) {
    window.open(ENV.purchaseProductURL, '_blank');
  }

  buySessions(e) {
    window.open(ENV.purchaseSessionURL, '_blank');
  }

  render() {
    this.switchToBillingSubject();
    return (
      <div>

        <SwitchModal 
        showModal={this.state.show3MonthModal} 
        hide3MonthBillingModal={this.hide3MonthBillingModal.bind(this)} 
        switchToBillingSubject={this.state.switchToBillingSubject}
        billingType={this.state.billingType}
        />
        <Helmet
          title="Thinkster Math | Parent Portal and Settings"
          meta={[
            { name: 'description', content: 'Modify your Thinkster Math settings and subscription details.' },
          ]}
        />

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
            <span className="a-strong a-color(copy-1)">
              Manage Plans
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

        <ParentNav activeLink={2} />


        <div className="a-appView a-appView--altBG a-appView--hasSidebar">
          <div className="a-appView__contents">
            <div className={`o-loadingScreenModal o-loadingScreenModal--${this.props.loading && this.props.loading.isLoading ? 'show' : 'hide'}`}>
              {/* Loading screen animation notification
                - Use className 'o-modal--hide' to hide modal
                - Use className 'o-modal--show' to show modal
              */}
              <LoadingSpinner />
            </div>
            <div className="a-container">
              <header className="a-viewHeader a-viewHeader--mBottom(24)">
                <h1 className="a-h(28)">
                  {Localization.localizedStringForKey('Manage Your Plans')}
                </h1>
              </header>

              <div className="a-row">
                <div className="a-col a-col(2-3)">

                  <section className="b-section">
                    <header className="b-sectionHeader">
                      <button className="b-flatBtn" onClick={this.addNewStudent.bind(this)}>
                        <span className="b-button__label">
                          {Localization.localizedStringForKey('Add New Student')}
                        </span>
                      </button>
                    </header>
                    <p className="a-p(14)" style={{ marginBottom: '25px', display: (this.props.user && this.props.user.students && Object.keys(this.props.user.students).length === 0 || ((!this.props.user) || (this.props.user && !this.props.user.students)) ? '' : 'none') }}>Did you know Thinkster Math has tutor-led services with unlimited worksheets, whiteboard tutoring sessions, and a video library? Click <a style={{ cursor: 'pointer' }} target="_blank" href={ENV.enrollURLToPricing}>here</a> to learn more about our online programs available for grades K-8 OR click <a style={{ cursor: 'pointer' }} target="_blank" href={ENV.productTourURL}>here</a> to try our interactive demo.</p>

                    {/* <div className="o-subscription o-subscription--plan(gold)">

                      <div className="o-subscription__studentPortrait">
                        <img src="http://4.bp.blogspot.com/-MfUFLRoe3XA/Vpqo4XC578I/AAAAAAAAKXI/qdc2L3zXFtA/s1600/elmo.png" alt="Elmo" className="o-subscription__studentImg" ></img>
                      </div>

                      <div className="o-subscription__planInfo">
                        <p className="o-subscription__planName a-s(12) a-allCaps">
                          Gold Plan (K-5)
                        </p>
                        <p className="o-subscription__student a-p(16)">
                          Elmo
                          <span className="a-p(14) a-color(copy-2)">
                            &nbsp; ({Localization.localizedStringForKey('Grade')} 1)
                          </span>
                        </p>
                      </div>

                      <div className="o-subscription__billingInfo">
                        <p className="a-p(12) a-strong a-color(active-3)">
                          {Localization.localizedStringForKey('Active')}
                        </p>
                        <p className="a-p(16)">
                          $130
                          <span className="a-p(14) a-color(copy-2)">
                            &nbsp; / {Localization.localizedStringForKey('month')}
                          </span>
                        </p>
                      </div>

                      <div className="o-subscription__actions">
                        <Link to="/modify-plan" className="b-button">
                          <span className="b-button__label">
                            {Localization.localizedStringForKey('Modify Plan')}
                          </span>
                        </Link>
                      </div>

                    </div>

                    <div className="o-subscription o-subscription--plan(gold)">

                      <div className="o-subscription__studentPortrait">
                        <img src="http://www.popjoust.com/images/jousters/bigbird.png" alt="Elmo" className="o-subscription__studentImg" ></img>
                      </div>

                      <div className="o-subscription__planInfo">
                        <p className="o-subscription__planName a-s(12) a-allCaps">
                          {Localization.localizedStringForKey('Gold Plan (K-5)')}
                        </p>
                        <p className="o-subscription__student a-p(16)">
                          {Localization.localizedStringForKey('Big Bird')}
                          <span className="a-p(14) a-color(copy-2)">
                            &nbsp; ({Localization.localizedStringForKey('Grade')} 1)
                          </span>
                        </p>
                      </div>

                      <div className="o-subscription__billingInfo">
                        <p className="a-p(12) a-strong a-color(active-3)">
                          {Localization.localizedStringForKey('Active')}
                        </p>
                        <p className="a-p(16)">
                          $130
                          <span className="a-p(14) a-color(copy-2)">
                            &nbsp; / {Localization.localizedStringForKey('month')}
                          </span>
                        </p>
                      </div>

                      <div className="o-subscription__actions">
                        <Link to="/modify-plan" className="b-button">
                          <span className="b-button__label">
                            {Localization.localizedStringForKey('Modify Plan')}
                          </span>
                        </Link>
                      </div>

                    </div>*/}
                    <StudentPlans />
                  </section>


                  <section className="b-section b-borderBox b-borderBox--active1" style={{ display: (this.getCancelledStatusOfParent() ? '' : 'none') }}>
                    {/* <h2 className="a-h(22)">
                      {Localization.localizedStringForKey('Monthly Billing Summary')}
                      {/* {Localization.localizedStringForKey('3 Month Billing Summary')}}
                    </h2>
                    {this.getPaymentDetails()}*/}
                    <div className="b-tintBox__actions" style={{ display: (this.getCancelledStatusOfParent() ? '' : 'none') }}>
                      <button className="b-flatBtn" onClick={this.show3MonthBillingModal.bind(this)}>
                        <span className="b-button__label">
                          {Localization.localizedStringForKey(this.state.switchToBillingSubject)}
                          {/* {Localization.localizedStringForKey('Switch to Monthly Billing')}*/}
                        </span>
                      </button>
                    </div>
                  </section>

                  <div className="a-viewHeader a-viewHeader--mBottom(24)">
                    <h1 className="a-h(28)">
                      {Localization.localizedStringForKey('My Workbooks')}
                    </h1>
                  </div>
                  <section className="b-section">
                    <div className="b-sectionHeader">
                      <a onClick={this.buyProduct.bind(this)} className="b-flatBtn b-flatBtn--active-4" title="Thinkster Store" style={{ cursor: 'pointer' }}>
                        <span className="b-button__label">
                          {Localization.localizedStringForKey('Buy Workbooks')}
                        </span>
                      </a>
                    </div>
                    <p className="a-p(14)" style={{ marginBottom: '25px', display: (this.props.user && this.props.user.products && this.props.user.products.length > 0 ? '' : 'none') }}>Ready to purchase another workbook? Click Buy Workbooks to view more.</p>
                    <UserProducts />
                  </section>
                  <div className="a-viewHeader a-viewHeader--mBottom(24)">
                    <h1 className="a-h(28)">
                      {Localization.localizedStringForKey('My Sessions')}
                    </h1>
                  </div>
                  <section className="b-section">
                    <div className="b-sectionHeader">
                      <a onClick={this.buySessions.bind(this)} className="b-flatBtn b-flatBtn--active-4" title="Thinkster Store" style={{ cursor: 'pointer' }}>
                        <span className="b-button__label">
                          {Localization.localizedStringForKey('Buy Sessions')}
                        </span>
                      </a>
                    </div>
                    <p className="a-p(14)" style={{ marginBottom: '25px', display: (this.props.user && this.props.user.products && this.props.user.products.length > 0 ? '' : 'none') }}>Need additional sessions? Click Buy Sessions to view more.</p>
                    <UserSessions />
                  </section>

                </div>

                {this.getSubscriptionDetails()}
              </div>
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
  loading: state.loading,
  zendesk: state.zendesk,
});

const actionCreators = {
  logout: SessionActions.logout,
  fetchUser: UserActions.fetchUser,
  fetchUserPlans: UserActions.fetchUserPlans,
  fetchUserServiceLevels: UserActions.fetchUserServiceLevels,
  fetchUserPaymentStatus: UserActions.fetchUserPaymentStatus,
  createZendeskTicket: ZendeskActions.createZendeskTicket,
  saveStudentDetails: StudentActions.saveStudentDetails,
  resetZendeskData: ZendeskActions.resetZendeskData,
  getBraintreeClientToken: BraintreeActions.getBraintreeClientToken,
  removeNewStudentDetails: StudentActions.removeNewStudentDetails,
};

export default connect(
  mapStateToProps,
  actionCreators,
)(ManagePlans);

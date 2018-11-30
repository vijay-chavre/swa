// NOTE: max-len lint rule is disabled since this page has copy as single-line
// string literals.
/* eslint-disable max-len */
import React, { Component } from 'react';
import { reduxForm, Field, reset } from 'redux-form';
import { Link, browserHistory } from 'react-router';
import ThinksterLogomark from '../../../Shared/Glyphs/ThinksterLogomark';
import ThinksterWordmark from '../../../Shared/Glyphs/ThinksterWordmark';
import ParentNav from '../../../Shared/ParentNav';
import LoadingSpinner from '../../../Shared/Glyphs/LoadingSpinner';
import config from '../../../../constants/config';
import ThinksterTextInput from '../../../ThinksterTextInput';
import ThinksterSelectInput from '../../../ThinksterSelectInput';
import getCountryPickerOptions from '../../../Shared/getCountryPickerOptions';
import syncValidate from './syncValidate';
import DropIn from "braintree-web-drop-in-react";
import constants from '../../../../constants/defaultRegistrationFlow';

import * as BraintreeActions from '../../../../actions/setBraintreeClientToken';

import * as Localization from '../../../Shared/Localization';

const baseURL = ENV.apiEndPoint;

var clientToken;

const groupStyle =  { display: 'table', width: '100%' }
const itemStyle = { display: 'table-cell' }
const textStyle = { display: 'table-cell', whiteSpace: 'nowrap', width: '1%', padding: '0 10px' }
const lineStyle = { display: 'table-cell', borderBottom: '1px solid #cccccc', position: 'relative', top: '-.5em' }


class PaymentDetails extends Component {
  instance;
  constructor(props) {
    super(props);
    const { dispatch } = props;
    this.state = { showCvvHelp: false, showUpdatedModal: false, checkingCode: false };
    dispatch(reset('PaymentInformationForm'));
    
  }

  componentDidMount() {
    const { session } = this.props;
    this.props.getBraintreeClientToken({ session });
    this.props.resetUpdateCodeState(); // internal reducer state
    this.props.resetPayment(); // internal reducer state
    
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps && nextProps.payment.updatedSub) {
      this.setState({ showUpdatedModal: 'show' });
    }
  }

  getBillingMessage() {
    if (this.props.params && this.props.params.ver == '1') {
      return 'Billing will start today after you submit payment. Cancel at anytime. All existing subscriptions if any, will be charged on this Credit Card / PayPal.';
    }
    if (this.props.params && this.props.params.ver == '4') {
        // check if paypal payment option available
        if(this.props.user.country_code && (this.props.user.country_code == "US" || this.props.user.country_code == "GB")){   
              return 'Use this form to update the Credit Card / PayPal details on file. All future transactions will be charged on this Credit Card / PayPal.';
        }
        else{
             return 'Use this form to update the Credit Card details on file. All future transactions will be charged on this Credit Card.';
        }
    }
    // check if paypal payment option available
    if(this.props.user.country_code && (this.props.user.country_code == "US" || this.props.user.country_code == "GB")){
          return 'Billing will start one week from today after you submit payment. Cancel at anytime. All existing subscriptions if any, will be charged on this Credit Card / PayPal.';
    }
    else{
          return 'Billing will start one week from today after you submit payment. Cancel at anytime. All existing subscriptions if any, will be charged on this Credit Card.';
    }
  }

  backToPlansSection(e) {
    const { dispatch } = this.props;

    this.props.resetPayment();

    if (this.props.params && this.props.params.ver == 5) {
      browserHistory.push('/students');
      return;
    }

    if (this.props.user && this.props.user.userId) {
      browserHistory.push('/plans');
    } else {
      browserHistory.push('/students');
    }
  }

  checkReferralCode(e) {
    if (e && e.target && e.target.value && e.target.value !== '') {
      this.setState({ checkingCode: true, verifyCodeMsg: false });
      this.props.verifyReferralCode({ code: e.target.value });
    }
  }

  checkReferralCodeAndSubmit(e) {
    this.setState({ submitAfterVerify: true, checkingCode: true, verifyCodeMsg: false });
    if (this.state.codeValue != '' && this.state.codeValue) {
      this.props.verifyReferralCode({ code: this.state.codeValue });
    }
    // else {
    //   const formElement = document.getElementById('submitCCForm');
    //   formElement.click();
    // }
  }

  submitPaymentForm(e) {
    if (this.state.codeValue != '' && this.state.codeValue) {
      if (this.props.payment.verifiedCode && this.props.payment.data && this.props.payment.data.code && this.state.codeValue && this.props.payment.data.code.toLowerCase() === this.state.codeValue.toLowerCase()) {
        this.props.handleSubmit();
      } else {
        this.setState({ verifyCodeMsg: true });
      }
    } else {
      this.props.handleSubmit();
    }
  }

  getCodeVerificationResult() {
    if (this.props.payment) {
      if (this.props.payment.verifiedCode) {
        if (this.props.payment.data && this.props.payment.data.code === 'WB2018') {
          return '25% special discount for the first month';
        }

        if (this.props.payment.data.discountMessage) {
          return `Valid code. ${this.props.payment.data.discountMessage}`;
        }
        return `Valid code. ${this.props.payment.data.name}`;
      } else if (this.props.payment.verifyCodeFailed) {
        return `${this.props.payment.data && this.props.payment.data.response && this.props.payment.data.response.data && this.props.payment.data.response.data.message ? this.props.payment.data.response.data.message : 'Invalid code.'  } Please enter a valid code and submit or leave the referral code field blank.`;
      }
    }
  }

  enteringReferralCode(e) {
    this.setState({ enteringCode: true });
  }

  saveCode(e) {
    this.setState({ codeValue: e.target.value, verifyCodeMsg: false, checkingCode: false });
  }

  checkIfUserIsCanceled() {
    if (this.props.params && (this.props.params.ver === '2' || this.props.params.ver === '1') && this.props.user && this.props.user.paymentStatus && this.props.user.paymentStatus.status && (this.props.user.paymentStatus.status.toLowerCase() === 'canceled' || this.props.user.paymentStatus.status.toLowerCase() === 'cancelled')) {
      return true;
    }

    if (this.props.params && (this.props.params.ver === '2' || this.props.params.ver === '1') && this.props.user && this.props.user.paymentStatus && (!this.props.user.paymentStatus.isPaid || this.props.user.paymentStatus.isCanceled)) {
      return true;
    }

    return false;
  }


  async submitPaypal() {
    // Send the nonce to Server
    const { nonce } = await this.instance.requestPaymentMethod();
    this.props.setNonce(nonce);
    console.log('set nonce');
    this.props.onPaypalSubmit();
    console.log('submit');
  }

  onNoPaymentMethodRequestable(){
    if (this.instance) {
      this.instance.clearSelectedPaymentMethod();
      console.log("onNoPaymentMethodRequestable");
    }
  }

  async onPaymentMethodRequestable(event){
    console.log("onPaymentMethodRequestable");
    this.setState({ showPaypalSubmit: true });
  }

  onPaymentOptionSelected(event) {
    // Send the nonce to Server
    console.log("onPaymentOptionSelected"); 
    console.log(event); 
  }

  
  paymentSuccessMessage(){

    if(this.props.params && this.props.params.ver == '5'){
       return 'Thank you! Your account has been successfully activated. Click below to have your child start their personalized experience.'
    }
    else{
      if(this.state.showPaypalSubmit){
        return 'Thank you! Your subscription has been successfully updated with PayPal account .'
      }
      else{
        return 'Thank you! Your subscription has been successfully updated with new Credit Card.'
      }
      
    }

  }

  paymentTitleMessage(){

    if(this.props.user && this.props.user.userData && this.props.user.userData.data && this.props.user.userData.data.service && this.props.user.userData.data.service.toLowerCase() === 'lite'){

        if(this.props.user.country_code && (this.props.user.country_code == "US" || this.props.user.country_code == "GB")){
            return 'Enter your Credit Card / PayPal information for access to our Lite Plan. Your Credit Card / PayPal account will be charged immediately.';
        }
        else{
            return 'Enter your Credit Card information for access to our Lite Plan. Your Credit Card will be charged immediately.';
        }
       
    }
    else{
       if(this.props.user.country_code && (this.props.user.country_code == "US" || this.props.user.country_code == "GB")){
           return 'Enter your Credit Card / PayPal information for access to our Gold Plan. Billing will start 7 days after you submit payment. Change your plan or cancel at anytime.';
       }
       else{
           return 'Enter your Credit Card information for access to our Gold Plan. Billing will start 7 days after you submit payment. Change your plan or cancel at anytime.';
       }
      
    }

  }


onCreditcardOption = () => {
  if (this.instance) {
    this.setState({ showPaypalSubmit: false });
    this.instance.clearSelectedPaymentMethod();
  }
}

  render() {

    const { session,clientToken,selectedService,geoLocation } = this.props;
    //const service = selectedService[0].selectedService;
    // const { selectedService } = this.props;

    // // Get Assigned Service
    // const service = (selectedService && selectedService[0] ? selectedService[0].selectedService : null);

    return (
      <div>
        <div className={`o-modal o-modal--${this.props.payment && this.props.payment.updatedSub && this.state && this.state.showUpdatedModal ? 'show' : 'hide'}`}>
          {/* Dialog notification
            - Use className 'o-modal--hide' to hide modal
            - Use className 'o-modal--show' to show modal
          */}

          <div className="o-modal__box o-modal__box--dialog">
            <p className="a-p(14)">
              {  this.paymentSuccessMessage()  }
            </p>

            <div className="o-modal__actions" style={{ marginTop: '30px' }}>
              <button type="button" className="b-flatBtn b-flatBtn--gradient(active-3) b-flatBtn--w(200)" onClick={this.backToPlansSection.bind(this)}>
                <span className="b-button__label">
                  {this.props.params && this.props.params.ver == '5' ?
                    'Start Skills Assessment' : 'View My Account'
                  }
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="a-appView a-appView--altBG a-appView--hasSidebar">
          <div className="a-appView__contents">

            <div className={`o-loadingScreenModal o-loadingScreenModal--${this.props.loading && this.props.loading.isLoading ? 'show' : 'hide'}`}>
              {/* Loading screen animation notification
                  - Use className 'o-modal--hide' to hide modal
                  - Use className 'o-modal--show' to show modal
                */}
              <LoadingSpinner />
            </div>

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
                  Payment Information
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
            {(this.props.user && this.props.user.userId && this.props.params && this.props.params.ver != '5') ?
              <ParentNav activeLink={3} /> : ''
            }

            <div className="a-container">
              <div className="a-row a-justifyContent(center)">
                <div className="a-col a-col(2-3)">
                  <div className="o-paymentForm">
                    
                    <header className="b-formHeader">
                      {(this.props.params && this.props.params.ver == '5') ?
                      [<h1 className="a-h(28)">
                          Start your Free Trial to Thinkster
                        </h1>,
                        <p className="a-p(14)">
                          { this.paymentTitleMessage() }
                        </p>] :
                      [<div className="b-formBlock__insetHeader">
                        {clientToken && this.props.user && this.props.user.country_code && (this.props.user.country_code == "US" || this.props.user.country_code == "GB") ?
                          <h2 className="a-h(22)"> Enter your Credit Card / PayPal information </h2>
                        : <h2 className="a-h(22)"> Enter your Credit Card information </h2>
                        }
                      </div>,
                        <p className="a-p(14) a-color(copy-2)">
                          {this.getBillingMessage()}
                        </p>]
                      }

                    </header>


                     { 
                          clientToken && this.props.user && this.props.user.country_code && (this.props.user.country_code == "US" || this.props.user.country_code == "GB") ?

                        <div className="b-formBlock__insetHeader">
                          {this.props.payment && this.props.payment.paypalError ? <div className="b-formBlock__error">
                          <p className="a-p(17) a-color(alert)">
                          We are unable to process payment on your PayPal account, Please check your PayPal account details and try again.
                          </p>
                          </div> : ''}

                          <DropIn
                            options={{ authorization: clientToken,
                                        paypal: { flow: 'vault' },
                                        preselectVaultedPaymentMethod: false,
                                        paymentOptionPriority: ['paypal']
                                    }}
                            onInstance={instance => (this.instance = instance)}
                            onNoPaymentMethodRequestable={this.onNoPaymentMethodRequestable}
                            onPaymentMethodRequestable={() => this.onPaymentMethodRequestable(event)}
                            onPaymentOptionSelected={this.onPaymentOptionSelected}
                          />
                          { 
                            this.state.showPaypalSubmit ?
                              <div>
                                <p className="a-p(14) a-justify(center)">By clicking Submit, you agree to our <a href="https://www.hellothinkster.com/terms.html" target="_blank" title="Terms of Service">terms of service</a> and our <a href="https://www.hellothinkster.com/privacy.html" target="_blank" title="Privacy Policy">privacy policy</a>.</p>
                                <button name="submit" className="a-mTop(8) b-button b-button--active3 b-button--large b-blocker__trigger" type="submit" title="Submit" onClick={this.submitPaypal.bind(this)}>
                                  <span className="b-button__label">Submit</span>
                                </button>
                              </div>
                            : <div></div>

                           }

                          <div><br /></div>
                          <div style={groupStyle}>
                            <div style={lineStyle}></div>
                            <div style={textStyle}>OR</div>
                            <div style={lineStyle}></div>
                          </div>
                        </div>
                        : <div></div>
                        }




                    <form onSubmit={this.props.handleSubmit} id="reg-payment-details" autoComplete="off">
                      {this.props.payment && this.props.payment.error ? <div className="b-formBlock__error">
                        <p className="a-p(17) a-color(alert)">
                          {this.state.codeValue != '' && this.props.payment.verifyCodeFailed ? this.getCodeVerificationResult() : 'We are unable to verify your card, Please check your card details and try again.'}
                        </p>
                      </div> : ''}
                      <div className="b-formBlock">
                        <div className="b-formBlock__set">
                          <div className="b-formBlock__item" onClick={() => this.onCreditcardOption()}>
                            <Field
                              component={ThinksterSelectInput}
                              name="fullName"
                              placeholder="Select Your Credit Card Type"
                              type="text"
                              data={
                                this.props.user && this.props.user.country_code && this.props.user.country_code == "US" ? 
                                  [
                                  '',
                                  'VISA',
                                  'MASTERCARD',
                                  'AMEX',
                                  'DISCOVER',
                                  'DINERS_CLUB',
                                  'JCB',
                                  ]
                                : [
                                  '',
                                  'VISA',
                                  'MASTERCARD',
                                  'DISCOVER',
                                  'DINERS_CLUB',
                                  'JCB',
                                  ]  

                            }
                            />
                          </div>
                        </div>

                        <div className="b-formBlock__set">
                          <div className="b-formBlock__item b-formBlock__item--2-3">
                            <Field
                              component={ThinksterTextInput}
                              name="creditCard[number]"
                              placeholder="Card Number"
                              maxLength="16"
                              type="text"
                            />
                          </div>

                          <div className="b-formBlock__item b-formBlock__item--1-3">
                            <Field
                              component={ThinksterTextInput}
                              name="creditCard[cvv]"
                              placeholder="CVV"
                              maxLength="4"
                              type="text"
                            />
                            <button
                              className="b-formBlock__itemHelp"
                              type="button" title="?"
                              onMouseEnter={() => this.setState({ showCvvHelp: true })}
                              onMouseLeave={() => this.setState({ showCvvHelp: false })}

                            >
                              ?
                            </button>
                            <div className={`b-formBlock__helpDisplay ${this.state.showCvvHelp ? 'b-formBlock__helpDisplay--on' : ''}`}>
                              Credit Card Verification Value. The CVV is a 3 or 4 digit code embossed or imprinted on the signature panel on the reverse side of Visa, MasterCard and Discover cards and on the front of American Express cards.
                            </div>
                          </div>
                        </div>

                        <div className="b-formBlock__set">
                          <div className="b-formBlock__item b-formBlock__item--1-2">
                            <Field
                              component={ThinksterSelectInput}
                              name="creditCard[expirationMonth]"
                              placeholder="Expiration Month"
                              type="text"
                              data={[
                                '',
                                '01',
                                '02',
                                '03',
                                '04',
                                '05',
                                '06',
                                '07',
                                '08',
                                '09',
                                '10',
                                '11',
                                '12',
                              ]}
                            />
                          </div>

                          <div className="b-formBlock__item b-formBlock__item--1-2">
                            <Field
                              component={ThinksterSelectInput}
                              name="creditCard[expirationYear]"
                              placeholder="Expiration Year"
                              type="text"
                              data={[
                                '',
                                '2017',
                                '2018',
                                '2019',
                                '2020',
                                '2021',
                                '2022',
                                '2023',
                                '2024',
                                '2025',
                              ]}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="b-formBlock">

                        <h2 className="b-formBlock__h1 a-s(20)">
                          Billing Information
                        </h2>

                        <div className="b-formBlock__set">
                          <div className="b-formBlock__item b-formBlock__item--1-2">
                            <Field
                              component={ThinksterTextInput}
                              name="creditCard[billingAddress][firstName]"
                              placeholder="First Name"
                              type="text"
                            />
                          </div>

                          <div className="b-formBlock__item b-formBlock__item--1-2">
                            <Field
                              component={ThinksterTextInput}
                              name="creditCard[billingAddress][lastName]"
                              placeholder="Last Name"
                              type="text"
                            />
                          </div>
                        </div>

                        <div className="b-formBlock__set">
                          <div className="b-formBlock__item">
                            <Field
                              component={ThinksterTextInput}
                              name="creditCard[billingAddress][streetAddress]"
                              placeholder="Address"
                              type="text"
                            />
                          </div>
                        </div>

                        <div className="b-formBlock__set">
                          <div className="b-formBlock__item b-formBlock__item--1-2">
                            <Field
                              component={ThinksterTextInput}
                              name="creditCard[billingAddress][city]"
                              placeholder="City"
                              type="text"
                            />
                          </div>

                          <div className="b-formBlock__item b-formBlock__item--1-2">
                            <Field
                              component={ThinksterTextInput}
                              name="creditCard[billingAddress][postalCode]"
                              placeholder="Postal Code"
                              type="text"
                            />
                          </div>
                        </div>

                        <div className="b-formBlock__set">
                          <div className="b-formBlock__item">
                            <Field
                              component={ThinksterSelectInput}
                              data={getCountryPickerOptions()}
                              name="creditCard[countryCode]"
                              value={getCountryPickerOptions()[0]}
                              placeholder="Country"
                              textField="text"
                              valueField="value"
                            />
                          </div>
                        </div>

                        <div className="b-formBlock" style={{ display: (this.props.params && this.props.params.ver === '5' || (this.checkIfUserIsCanceled()) ? '' : 'none') }}>
                          <h2 className="b-formBlock__h1 a-s(20)">
                            Have a referral code?
                          </h2>
                          <div className="b-formBlock__set" style={{ display: 'inline-block' }}>
                            <div className="b-formBlock__item" style={{ display: 'inline-block' }}>
                              <Field
                                component={ThinksterTextInput}
                                name="referralCode"
                                placeholder="Referral Code"
                                type="text"
                                onChange={this.saveCode.bind(this)}
                              />
                            </div>
                            <div className="b-formBlock__item" style={{ display: 'inline-block' }}>
                              <button className="b-flatBtn b-flatBtn--small b-flatBtn--w(90) b-flatBtn--gradient(active-2)" title="Check" onClick={this.checkReferralCodeAndSubmit.bind(this)} type="button">
                                <span className="b-button__label">
                                  Check
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                        <label style={{ display: (this.state.codeValue != '' && this.state.checkingCode ? '' : 'none'), color: (this.props.payment.verifiedCode ? 'green' : 'red') }}>
                          {this.getCodeVerificationResult()}
                        </label>
                        <br />
                        <label style={{ display: (this.props.user && this.props.user.updateReferralCodeFailed ? '' : 'none'), color: 'red' }}>
                          Unable to update code, please try submitting again.
                        </label>
                        <br />
                        <label style={{ display: (this.state.codeValue !== '' && this.state.verifyCodeMsg ? '' : 'none'), color: 'red' }}>
                          Please click Check button to verify your referral code before submitting.
                        </label>


                      </div>
                      
                      <p className="a-p(14) a-justify(center)">By clicking Submit, you agree to our <a href="https://www.hellothinkster.com/terms.html" target="_blank" title="Terms of Service">terms of service</a> and our <a href="https://www.hellothinkster.com/privacy.html" target="_blank" title="Privacy Policy">privacy policy</a>.</p>
                      <div className="o-paymentForm__action">
                        <button className="b-flatBtn b-flatBtn--large b-flatBtn--w(180) b-flatBtn--gradient(active-1)" title="Submit" onClick={this.submitPaymentForm.bind(this)} type="button">
                          <span className="b-button__label">
                            Submit
                          </span>
                        </button>
                      </div>
                    </form>

                  </div>
                </div>

                <div className="a-col a-col(2-3)">
                  <div className="o-faq" id="faq">
                    <h1 className="a-h(28) a-h(28)--lineHr a-justify(center)">
                      Frequently Asked Questions
                    </h1>
                    <ul className="o-faq__list">
                      <li className="o-faq__item">
                        <h2 className="a-h(20)">
                          Why do you need my Credit Card / PayPal information?
                        </h2>
                        <p className="a-p(14)">
                          We ask for your Credit Card / PayPal information to verify your identity and to make sure an adult is approving enrollment. (We also want to make sure that we comply with The Children's Online Privacy Protection Act (COPPA).) You will automatically be charged after your 1-week free trial ends. There are no registration or hidden fees!
                        </p>
                      </li>
                      <li className="o-faq__item">
                        <h2 className="a-h(20)">
                          Does the free trial limit my access to any features of the programs?
                        </h2>
                        <p className="a-p(14)">
                          If registering for a tutor-led program (Silver, Gold, Platinum), you will have access to the Gold package during the trial.
                        </p>
                      </li>
                      <li className="o-faq__item">
                        <h2 className="a-h(20)">
                          Can I cancel anytime?
                        </h2>
                        <p className="a-p(14)">
                          Yes, you can cancel your subscription whenever you'd like and continue to use Thinkster Math for the remainder of your billing cycle.
                        </p>
                      </li>
                      <li className="o-faq__item">
                        <h2 className="a-h(20)">
                          Am I agreeing to a contract when I take a free trial?
                        </h2>
                        <p className="a-p(14)">
                          No. We don&rsquo;t have any contracts obliging you to stay subscribed. You can cancel your subscription at any time.
                        </p>
                      </li>
                      <li className="o-faq__item">
                        <h2 className="a-h(20)">
                          Can I change my plan level later?
                        </h2>
                        <p className="a-p(14)">
                          Yes. In our tutor-led programs, you can upgrade and downgrade between Silver, Gold and Platinum or cancel at any time. If you cancel within the trial period, you will not be charged.
                        </p>
                      </li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export const formName = 'PaymentInformationForm';

const mapStateToProps = (state) => ({
  loading: state.loading,
});

export default reduxForm({
  destroyOnUnmount: false,
  enableReinitialize: true,
  form: formName,
  validate: syncValidate,
  mapStateToProps,
})(PaymentDetails);

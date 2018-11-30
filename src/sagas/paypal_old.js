/* global window, document */
/* eslint-disable no-constant-condition */
import axios from 'axios';
import {
  select,
  take,
  put,
} from 'redux-saga/effects';
import { startSubmit, stopSubmit } from 'redux-form';
import cookie from 'cookie';
import { create as callbackCreateBraintreeClient } from 'braintree-web/client';
import { PAYPAL } from '../actions/paypal';
import loadingAction from '../actions/loading';
import selectBraintreeClientToken from '../selectors/braintreeClientToken';
import selectPaymentInformationFormValues from '../selectors/paymentInformationFormValues';
import selectSession from '../selectors/session';
import selectSelectedPlans from '../selectors/selectedPlans';
import selectSelectedService from '../selectors/selectedService';
import selectSelectedBillingCycle from '../selectors/selectedBillingCycle';
import selectPlans from '../selectors/plans';
import selectStudents from '../selectors/students';
import selectParent from '../selectors/parentInfo';
import selectNonce from '../selectors/nonce';
//import selectGeoLocation from '../selectors/geoLocation';
import routerHistory from '../constants/routerHistory';
import selectCart from '../selectors/cart';
import errorAction from '../actions/error';
import studentInfo from '../selectors/studentInfo';
import * as PaymentActions from '../actions/payment';
import { IntercomAPI } from 'react-intercom';
import constants from '../constants/defaultRegistrationFlow';

//const baseURL = process.env.API_BASE_URL || 'https://data.tabtor.com';
const baseURL = 'https://data-sandbox.tabtor.com';
const defaultServiceId = process.env.DEFAULT_SERVICE_ID || 'Gold';
const paypalFormName = 'PaypalInformationForm';

export default function* submitPaypalSaga() {
  while (true) {
    yield take(PAYPAL);
    try {
      const cart = yield select(selectCart);
      const selectedPlans = yield select(selectSelectedPlans);
      const plans = yield select(selectPlans);
      const selectedService = yield select(selectSelectedService);
      const selectedBillingCycle = yield select(selectSelectedBillingCycle);
      const session = yield select(selectSession);
      const students = yield select(selectStudents);
      const sessionToken = session.token;
      const sessionUserId = session.userId;
      const nonce = yield select(selectNonce);
      // const geoLocation = yield select(selectGeoLocation);

      let service = selectedService && selectedService[0].selectedService ? selectedService[0].selectedService : 'Gold';

      yield put(loadingAction(true));
      yield put(PaymentActions.paypalRequesting());
      yield put(startSubmit(paypalFormName));

      const paymentMethodsResponse = yield axios({
        method: 'post',
        baseURL,
        url: '/v1/paymentmethods',
        data: {"userId":session.userId,"nonceFromTheClient":nonce},
        headers: { Authorization: `JWT ${session.token}` }
      });

      
      const savedStudents = yield select(studentInfo);
      console.log(savedStudents);
      console.log(students);
      
      var studentIds = [];
      
      savedStudents.map((student) => {
        studentIds.push(student.id)
      });

      // Get Current URL
      let url = window.location.href;
      let registrationFlowId = 'Regular';
      if(url.indexOf(constants.REGISTRATION_FLOW_ID) !== -1){
        registrationFlowId = constants.REGISTRATION_FLOW_ID;
      }

      if (paymentMethodsResponse && paymentMethodsResponse.data.paymentMethod.token) {
        yield axios({
          method: 'post',
          baseURL,
          url: '/v1/subscriptions',
          headers: { Authorization: `JWT ${sessionToken}` },
          data: {
            userId: sessionUserId,
            paymentMethodToken: paymentMethodsResponse.data.paymentMethod.token,
            students: studentIds,
            registrationFlowId: registrationFlowId
          },
        });
      }

      yield put(stopSubmit(paypalFormName));
      yield put(loadingAction(false));

      // IntercomAPI('update', {"Subscription Plan": "Gold", "Paid": true});
      // IntercomAPI('trackEvent', 'Enrollment Step-3 Completed');
      const cookies = cookie.parse(document.cookie);
      const experimentId = cookies.utm_expid;
      dataLayer.push({
        event: 'payment_completed',
        sessionUserId,
        students,
        selectedPlans,
        selectedBillingCycle,
      });
      try {
        pushPurchaseToDataLayer(cart, selectedPlans, plans, sessionUserId);
      } catch(err) {
        console.log(err);
      }

      // Check if Registration Flow is present
      if(service == 'Lite'){
        routerHistory.replace('/thank-you-lite');
      } else {
        routerHistory.replace('/thank-you-web-sa');
      }

    } catch (error) {
      console.log('error in payment');
      const session = yield select(selectSession);
      const sessionToken = session.token;
      const sessionUserId = session.userId;
      const parent = yield select(selectParent);
      let parentEmail;
      if (parent) {
        parentEmail = parent.email_address;
      }
      let data = {
        subject: 'Registration flow - Payment failed Notification!!!',
        body: `User ID: ${sessionUserId}\n` +
              `User Email-ID: ${parentEmail}\n` +
              `error: ${JSON.stringify(error)}\n`,
        user: sessionUserId,
        email: 'info@hellothinkster.com',
        error: JSON.stringify(error),
        cc: ['rupa@hellothinkster.com', 'kendra@hellothinkster.com', 'karthik@hellothinkster.com', 'kiran@hellothinkster.com'],
      };
      const ticketCreationResult = yield axios({
        method: 'post',
        baseURL,
        url: 'v1/zendesk/ticket',
        headers: { Authorization: `JWT ${sessionToken}` },
        data,
      });

      if (window !== undefined) {
        window.scrollTo(0, 0);
      }
      yield put(loadingAction(false));
      yield put(stopSubmit(paypalFormName));
      yield put(PaymentActions.paypalError(error));
    }
  }
}

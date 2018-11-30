/* global window, document */
/* eslint-disable no-constant-condition */
import axios from 'axios';
import {
  select,
  take,
  put,
} from 'redux-saga/effects';
import { startSubmit, stopSubmit } from 'redux-form';
import { browserHistory } from 'react-router';
import cookie from 'cookie';
import { create as callbackCreateBraintreeClient } from 'braintree-web/client';
import { ENROLL } from '../actions/enroll';
import { PAYMENT_SUBMIT } from '../actions/payment';
import selectBraintreeClientToken from '../selectors/braintreeClientToken';
import selectPaymentInformationFormValues from '../selectors/paymentInformationFormValues';
import selectSession from '../selectors/session';
import selectSelectedPlans from '../selectors/selectedPlans';
import selectSelectedService from '../selectors/selectedService';
import selectPlans from '../selectors/plans';
import selectStudents from '../selectors/students';
import routerHistory from '../constants/routerHistory';
import selectCart from '../selectors/cart';
import student from '../selectors/students';
import user from '../selectors/user';
import errorAction from '../actions/error';
import * as PaymentActions from '../actions/payment';
import * as Common from '../components/Shared/Common';
import * as UserActions from '../actions/user';
import * as StudentActions from '../actions/student';


const baseURL = ENV.apiEndPoint;
const defaultServiceId = process.env.DEFAULT_SERVICE_ID || 'Plus';
const paymentFormName = 'PaymentInformationForm';

function createBraintreeClient(braintreeClientToken) {
  return new Promise((resolve, reject) => {
    callbackCreateBraintreeClient({
      authorization: braintreeClientToken,
    }, (error, client) => {
      if (error) {
        return reject(error);
      }

      return resolve(client);
    });
  });
}

function sendBraintreeRequest(braintreeClient, braintreeRequestBody, sessionToken) {
  return new Promise((resolve, reject) => {
    braintreeClient.request({
      endpoint: 'payment_methods/credit_cards',
      method: 'post',
      data: braintreeRequestBody,
    }, (error, response) => {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
}

export default function* submitPaymentInformationFormSaga() {
  while (true) {
    yield take(ENROLL);
    try {
      const cart = yield select(selectCart);
      const selectedPlans = yield select(selectSelectedPlans);
      const plans = yield select(selectPlans);
      const selectedService = yield select(selectSelectedService);
      const session = yield select(selectSession);
      const studentData = yield select(student);
      const userData = yield select(user);
      const sessionToken = session.token;
      const sessionUserId = session.user_id;

      // console.log('student reducer info : ', JSON.stringify(studentData));

      const service = selectedService && selectedService[0].selectedService ? selectedService[0].selectedService : 'Gold';

      let paymentMethodsResponse = null;

      const braintreeClientToken = yield select(selectBraintreeClientToken);
      const paymentInformationFormValues = yield select(selectPaymentInformationFormValues);

      console.log('braintreeClientToken:', braintreeClientToken);
      console.log('paymentInformationFormValues:', paymentInformationFormValues);
      console.log('sessionToken:', sessionToken);
      console.log('selectedService', service);
      console.log('sessionUserId:', sessionUserId);

      const creditCardValues = paymentInformationFormValues.creditCard || {};
      const billingAddressValues = creditCardValues.billingAddress || {};
      const braintreeRequestBody = {
        creditCard: {
          number: creditCardValues.number,
          cvv: creditCardValues.cvv,
          expirationDate: `${creditCardValues.expirationMonth}/${creditCardValues.expirationYear}`,
          billingAddress: {
            firstName: billingAddressValues.firstName,
            lastName: billingAddressValues.lastName,
            streetAddress: billingAddressValues.streetAddress,
            locality: billingAddressValues.city,
            postalCode: billingAddressValues.postalCode,
            countryCodeAlpha2: creditCardValues.countryCode,
          },
        },
      };

      yield put({ type: 'SET_LOADING', isLoading: true });
      yield put({ type: 'SET_LOADING_FOR_PAYMENT', isLoading: true });
      yield put(PaymentActions.paymentRequesting());
      yield put(startSubmit(paymentFormName));

      // updating referral code
      console.log('updating referral code');
      const referralCode = paymentInformationFormValues.referralCode;
      const referralCodeError = false;
      if (referralCode && referralCode.length > 0) {
        // try {
        //   const result = yield axios({
        //     method: 'get',
        //     baseURL: ENV.apiEndPoint,
        //     url: `/v1/codes/${referralCode}`,
        //     headers: { Authorization: `JWT ${session.token}` },
        //   });
        //   yield put(PaymentActions.verifiedReferralCode(result.data));
        // } catch (error) {
        //   referralCodeError = true;
        //   yield put(stopSubmit(paymentFormName));
        //   yield put(PaymentActions.verifyReferralCodeFailed(error));
        //   yield put(PaymentActions.paymentError(error));
        //   yield put({ type: 'SET_LOADING', isLoading: false });
        //   yield put({ type: 'SET_LOADING_FOR_PAYMENT', isLoading: false });
        // }

        // if (!referralCodeError) {
        try {
          const response = yield axios({
            method: 'put',
            baseURL: ENV.apiEndPoint,
            url: `/v1/parents/${sessionUserId}`,
            headers: { Authorization: `JWT ${session.token}` },
            data: {
              coupon_code: referralCode,
            },
          });
          yield put(UserActions.updateReferralCodeComplete(response.data));
        } catch (error) {
          // referralCodeError = true;
          // yield put(stopSubmit(paymentFormName));
          yield put(UserActions.updateReferralCodeFailed(error));
          // yield put(PaymentActions.paymentError(error));
          // yield put({ type: 'SET_LOADING', isLoading: false });
          // yield put({ type: 'SET_LOADING_FOR_PAYMENT', isLoading: false });
        }
        // }
      }

      console.log('creating braintree client');
      const braintreeClient = yield createBraintreeClient(braintreeClientToken);
      console.log('creating braintree client 1');
      const braintreeResponse = yield sendBraintreeRequest(braintreeClient, braintreeRequestBody, sessionToken);
      console.log('creating braintree client 2');
      yield put(PaymentActions.paymentSuccess(braintreeResponse.creditCards));
      console.log('creating braintree client 3');

      const creditCards = braintreeResponse.creditCards || [];
      const creditCard = creditCards[0] || {};
      console.log(braintreeResponse);

      // Create payment method...
      paymentMethodsResponse = yield axios({
        method: 'post',
        baseURL,
        url: '/v1/paymentmethods',
        headers: { Authorization: `JWT ${sessionToken}` },
        data: {
          nonceFromTheClient: creditCard.nonce,
          userId: sessionUserId,
        },
      });

      console.log('Got Payment Response', paymentMethodsResponse);
      if (paymentMethodsResponse && paymentMethodsResponse.data && paymentMethodsResponse.data.paymentMethod && paymentMethodsResponse.data.paymentMethod.token) {
        yield put(UserActions.fetchUserPaymentStatus({ userId: sessionUserId, fetchSynchronously: true }));

        // updating intercom
        const intercomProp = Common.userIntercomProp(user);
        intercomProp.hide_default_launcher = true;
        intercomProp.Paid = true; // overriding the is paid to true
        window.Intercom('update', intercomProp);
      }

      yield put(stopSubmit(paymentFormName));

      /* Call Create Subscription */
      if (!referralCodeError) {
        if (studentData && studentData.newStudentDetails &&
          studentData.newStudentDetails.nextURL) {
          if (paymentMethodsResponse && paymentMethodsResponse.data && paymentMethodsResponse.data.paymentMethod && paymentMethodsResponse.data.paymentMethod.token) {
            let paymentStatus = (userData ? userData.paymentStatus : null);
            if (!paymentStatus) {
              console.log('fetching payment status...');
              const paymentStatusResponse = yield axios({
                method: 'get',
                baseURL: ENV.apiEndPoint,
                url: `/v1/parents/${sessionUserId}/status`,
                headers: { Authorization: `JWT ${session.token}` },
              });

              if (paymentStatusResponse && paymentStatusResponse.data) {
                paymentStatus = paymentMethodsResponse.data;
              }
            }

            if (paymentStatus && paymentStatus.subscription_id && paymentStatus.subscription_id !== '') {
              console.log('getting subscription id data...');
              const subscriptionResponse = yield axios({
                method: 'get',
                baseURL,
                url: `/v1/subscriptions/${paymentStatus.subscription_id}`,
                headers: { Authorization: `JWT ${sessionToken}` },
              });
              console.log('Got subs Response', subscriptionResponse);
              if (subscriptionResponse && subscriptionResponse.data && subscriptionResponse.data.status !== 'Canceled') {
                console.log('updating subscription with new payment token...');
                console.log('updating subs', subscriptionResponse.status);
                const token = paymentMethodsResponse.data.paymentMethod.token;
                const subscriptionUpdateResponse = yield axios({
                  method: 'put',
                  baseURL,
                  url: `/v1/subscriptions/${paymentStatus.subscription_id}`,
                  headers: { Authorization: `JWT ${sessionToken}` },
                  data: {
                    paymentMethodToken: token,
                  },
                });

                console.log('Got update subs Response', subscriptionUpdateResponse);
              }
            } else if (studentData.newStudentDetails.nextURL.indexOf('thank') != -1) {
                const token = paymentMethodsResponse.data.paymentMethod.token;
                console.log('In create subscription part...');
                const students = [];
                if (userData.students) {
                  const studentIds = Object.keys(userData.students);
                  for (let i = 0; i < studentIds.length; i++) {
                      const studentId = studentIds[i];
                      if (userData.students[studentId].service_id && userData.students[studentId].service_id != '' &&
                        ((!paymentStatus.modeOfPayment) || (paymentStatus.modeOfPayment && paymentStatus.modeOfPayment.toLowerCase() !== 'inapppurchase') || (paymentStatus.modeOfPayment && paymentStatus.modeOfPayment.toLowerCase() === 'inapppurchase' && userData.students[studentId].is_active))) {
                        students.push(userData.students[studentId]._id);
                      }
                    }
                }

                if (students && students.length > 0) {
                  console.log('Creating new subscription for students...');

                  if (students.length == 1) {
                      const createSubscriptionResult = yield axios({
                        method: 'post',
                        baseURL: ENV.apiEndPoint,
                        url: '/v1/subscriptions',
                        headers: { Authorization: `JWT ${sessionToken}` },
                        data: {
                          studentId: students[0],
                          userId: sessionUserId,
                          paymentMethodToken: token,
                        },

                      });
                    } else {
                      const createSubscriptionResult = yield axios({
                        method: 'post',
                        baseURL: ENV.apiEndPoint,
                        url: '/v1/subscriptions',
                        headers: { Authorization: `JWT ${sessionToken}` },
                        data: {
                          students,
                          userId: sessionUserId,
                          paymentMethodToken: token,
                        },

                      });
                    }
                }
            }
          }
          yield put(StudentActions.updatePaymentCompletedInNewStudentDetails());
          yield put({ type: 'SET_LOADING_FOR_PAYMENT', isLoading: false });
          yield put({ type: 'SET_LOADING', isLoading: false });
          routerHistory.push(studentData.newStudentDetails.nextURL);
        } else {
          if (paymentMethodsResponse && paymentMethodsResponse.data && paymentMethodsResponse.data.paymentMethod && paymentMethodsResponse.data.paymentMethod.token) {
            let paymentStatus = (userData ? userData.paymentStatus : null);
            if (!paymentStatus) {
              console.log('fetching payment status...');
              const paymentStatusResponse = yield axios({
                method: 'get',
                baseURL: ENV.apiEndPoint,
                url: `/v1/parents/${sessionUserId}/status`,
                headers: { Authorization: `JWT ${session.token}` },
              });

              if (paymentStatusResponse && paymentStatusResponse.data) {
                paymentStatus = paymentMethodsResponse.data;
              }
            }

            if (paymentStatus && paymentStatus.subscription_id && paymentStatus.subscription_id !== '') {
              console.log('getting subscription id data...');
              const subscriptionResponse = yield axios({
                method: 'get',
                baseURL,
                url: `/v1/subscriptions/${paymentStatus.subscription_id}`,
                headers: { Authorization: `JWT ${sessionToken}` },
              });
              console.log('Got subs Response', subscriptionResponse);
              if (subscriptionResponse && subscriptionResponse.data && subscriptionResponse.data.status !== 'Canceled') {
                console.log('updating subscription with new payment token...');
                console.log('updating subs', subscriptionResponse.status);
                const token = paymentMethodsResponse.data.paymentMethod.token;
                const subscriptionUpdateResponse = yield axios({
                  method: 'put',
                  baseURL,
                  url: `/v1/subscriptions/${paymentStatus.subscription_id}`,
                  headers: { Authorization: `JWT ${sessionToken}` },
                  data: {
                    paymentMethodToken: token,
                  },
                });

                console.log('Got update subs Response', subscriptionUpdateResponse);
              }
            } else {
              const token = paymentMethodsResponse.data.paymentMethod.token;
              console.log('In create subscription part...');
              const students = [];
              if (userData.students) {
                const studentIds = Object.keys(userData.students);
                for (let i = 0; i < studentIds.length; i++) {
                  const studentId = studentIds[i];
                  if (userData.students[studentId].service_id && userData.students[studentId].service_id != '' &&
                    ((!paymentStatus.modeOfPayment) || (paymentStatus.modeOfPayment && paymentStatus.modeOfPayment.toLowerCase() !== 'inapppurchase') || (paymentStatus.modeOfPayment && paymentStatus.modeOfPayment.toLowerCase() === 'inapppurchase' && userData.students[studentId].is_active))) {
                    students.push(userData.students[studentId]._id);
                  }
                }
              }

              if (students && students.length > 0) {
                console.log('Creating new subscription for students...');

                if (students.length == 1) {
                  const createSubscriptionResult = yield axios({
                    method: 'post',
                    baseURL: ENV.apiEndPoint,
                    url: '/v1/subscriptions',
                    headers: { Authorization: `JWT ${sessionToken}` },
                    data: {
                      studentId: students[0],
                      userId: sessionUserId,
                      paymentMethodToken: token,
                    },

                  });
                } else {
                  const createSubscriptionResult = yield axios({
                    method: 'post',
                    baseURL: ENV.apiEndPoint,
                    url: '/v1/subscriptions',
                    headers: { Authorization: `JWT ${sessionToken}` },
                    data: {
                      students,
                      userId: sessionUserId,
                      paymentMethodToken: token,
                    },

                  });
                }
              }
            }
          }

          yield put(UserActions.fetchUserPaymentStatus({ userId: sessionUserId }));
          yield put(PaymentActions.updatedSubscription());
          yield put({ type: 'SET_LOADING_FOR_PAYMENT', isLoading: false });
          yield put({ type: 'SET_LOADING', isLoading: false });
        }
      }
    } catch (error) {
      console.log('error in payment');
      const session = yield select(selectSession);
      const sessionToken = session.token;
      const userData = yield select(user);
      const studentData = yield select(student);
      let data;
      if (studentData && studentData.newStudentDetails &&
        studentData.newStudentDetails.nextURL) {
        data = {
          subject: 'Payment failed Notification !!!',
          body: `Name: ${userData ? `${userData.first_name} ${userData.last_name}` : ''}\n` +
            `Email Address: ${userData ? userData.email_address : ''}\n` +
            `Phone: ${userData ? userData.phone : ''}\n` +
            `Parent Id: ${userData ? userData.userId : ''}\n` +
            'Flow: Add Student or Modify Plan\n' +
            `error: ${JSON.stringify(error)}\n`,
          user: userData._id,
          name: (userData.first_name || userData.last_name ? userData.first_name + userData.last_name : 'No name found'),
          email: 'info@hellothinkster.com',
          error: JSON.stringify(error),
          cc: ['rupa@hellothinkster.com', 'karthik@hellothinkster.com', 'kendra@hellothinkster.com'],
        };
      } else {
        data = {
          subject: 'Payment failed Notification!!!',
          body: `Name: ${userData ? `${userData.first_name} ${userData.last_name}` : ''}\n` +
            `Email Address: ${userData ? userData.email_address : ''}\n` +
            `Phone: ${userData ? userData.phone : ''}\n` +
            `Parent Id: ${userData ? userData.userId : ''}\n` +
            'Flow: Updating payment method\n' +
            `error: ${JSON.stringify(error)}\n`,
          user: userData._id,
          name: (userData.first_name || userData.last_name ? userData.first_name + userData.last_name : 'No name found'),
          email: 'info@hellothinkster.com',

          cc: ['rupa@hellothinkster.com', 'karthik@hellothinkster.com', 'kendra@hellothinkster.com'],
        };
      }
      console.log('error in payment : ', JSON.stringify(error));
      const ticketCreationResult = yield axios({
        method: 'post',
        baseURL: ENV.apiEndPoint,
        url: 'v1/zendesk/ticket',
        headers: { Authorization: `JWT ${sessionToken}` },
        data,
      });

      if (window !== undefined) {
        window.scrollTo(0, 0);
      }
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(stopSubmit(paymentFormName));
      yield put(PaymentActions.paymentError(error));
    }
  }
}

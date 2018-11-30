/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as PaymentActions from '../actions/payment';
import selectSession from '../selectors/session';
var client = require('braintree-web/client');

export default function* updatePaymentInfo() {
  while (true) {
    const fetchAction = yield take(PaymentActions.UPDATE_PAYMENT_INFO);
    const session = yield select(selectSession);
    const user = fetchAction.payload.user;
    const data = fetchAction.payload.data;
    
    try {

      yield put({ type: 'SET_LOADING', isLoading: true });
      const token = yield axios({
        method: 'post',
        baseURL: ENV.apiEndPoint,
        url: 'v1/paymentmethods/client_token',
        data: {"userId":user._id},
        headers: { Authorization: `JWT ${session.token}` }
      });
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(PaymentActions.updatedPaymentInfo(token));

      client.create({
        authorization: token.data.clientToken
      }, function (err, client) {
        client.request({
          endpoint: 'payment_methods/credit_cards',
          method: 'post',
          data: {
            creditCard: {
              number: data.cardNumber,
              expirationDate: data.expirationMonth + "/" + data.expirationYear,
              cvv: data.cvv,
              cctype: data.paymentMethod,
              billingAddress: {
                postalCode: data.zip,
                firstName: data.firstName,
                lastName: data.lastName,
                countryName: data.countrySelected,
                region: data.city,
                streetAddress: data.address
              }
            }
          }
        }, function (err, response) {
          // Send response.creditCards[0].nonce to your server
          console.log("response");
        });
      });

    } catch (error) {
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(PaymentActions.updatePaymentInfoFailed(error));
    }
  }
}

/* eslint-disable no-constant-condition */
import { select, put, take } from 'redux-saga/effects';
import axios from 'axios';
import { SET_SESSION } from '../actions/setSession';
import errorAction from '../actions/error';
import selectSession from '../selectors/session';
import setBraintreeClientToken from '../actions/setBraintreeClientToken';

const baseURL = ENV.apiEndPoint;
export default function* setBrainTreeToken() {
  while (true) {
    yield take(SET_SESSION);
    const session = yield select(selectSession);
    const sessionToken = session.token;
    const sessionUserId = session.userId;
    
    try {
      const braintreeClientTokenResponse = yield axios({
        method: 'post',
        baseURL,
        url: '/v1/paymentmethods/client_token',
        headers: { Authorization: `JWT ${sessionToken}` },
        data: { userId: sessionUserId },
      });
      const braintreeClientTokenResult = braintreeClientTokenResponse.data;
      const braintreeClientToken = braintreeClientTokenResult.clientToken;
      // Set app braintree client token...
      yield put(setBraintreeClientToken(braintreeClientToken));
    } catch (error) {
      yield put(errorAction({
        error,
        title: 'Error fetching products',
      }));
    }
  }
}

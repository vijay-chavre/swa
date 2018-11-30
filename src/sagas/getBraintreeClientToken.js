/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take } from 'redux-saga/effects';
import axios from 'axios';
import selectSession from '../selectors/session';
import * as BraintreeActions from '../actions/setBraintreeClientToken';

export default function* getBraintreeClientToken() {
  while (true) {
    const fetchAction = yield take(BraintreeActions.GET_BRAINTREE_CLIENT_TOKEN);
    const session = fetchAction.payload.session;
    try {
      const sessionToken = session.token;
      const sessionUserId = session.user_id;
      if (sessionToken) {
        yield put({ type: 'SET_LOADING', isLoading: true });
        // Fetch braintree client token
        const braintreeClientTokenResponse = yield axios({
          method: 'post',
          baseURL: ENV.apiEndPoint,
          url: '/v1/paymentmethods/client_token',
          headers: { Authorization: `JWT ${sessionToken}` },
          data: { userId: sessionUserId },
        });
        const braintreeClientTokenResult = braintreeClientTokenResponse.data;
        const braintreeClientToken = braintreeClientTokenResult.clientToken;
                // Set app braintree client token...
        yield put(BraintreeActions.setBraintreeClientToken(braintreeClientToken));
        yield put({ type: 'SET_LOADING', isLoading: false });
      }
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
    }
  }
}


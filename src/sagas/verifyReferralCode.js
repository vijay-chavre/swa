/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as PaymentActions from '../actions/payment';
import selectSession from '../selectors/session';

export default function* verifyReferralCode() {
  while (true) {
    const verifyCodeAction = yield take(PaymentActions.VERIFY_CODE);
    const code = verifyCodeAction.payload.code;
    const session = yield select(selectSession);
    try {
      yield put({ type: 'SET_LOADING', isLoading: true });
      const result = yield axios({
        method: 'get',
        baseURL: ENV.apiEndPoint,
        url: `/v1/codes/${code}`,
        params: {
          auth_token: `${session.token}`,
        },
      });
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(PaymentActions.verifiedReferralCode(result.data));
    } catch (error) {
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(PaymentActions.verifyReferralCodeFailed(error));
    }
  }
}

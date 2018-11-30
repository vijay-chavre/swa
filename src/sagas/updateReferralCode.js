/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as UserActions from '../actions/user';
import selectSession from '../selectors/session';
import selectUser from '../selectors/user';

export default function* updateReferralCode() {
  while (true) {
    const fetchAction = yield take(UserActions.UPDATE_REFERRAL_CODE);
    const session = yield select(selectSession);
    const code = fetchAction.payload.referral_code;
    try {
      //yield put({ type: 'SET_LOADING', isLoading: true });
      const response = yield axios({
        method: 'put',
        baseURL: ENV.apiEndPoint,
        url: `/v1/parents/${session.user_id}`,
        headers: { Authorization: `JWT ${session.token}` },
        data: {
          coupon_code: code,
        },
      });
      yield put(UserActions.updateReferralCodeComplete(response.data));
      //yield put({ type: 'SET_LOADING', isLoading: false });
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(UserActions.updateReferralCodeFailed(error));
    }
  }
}

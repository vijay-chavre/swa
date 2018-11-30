/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as UserActions from '../actions/user';
import selectSession from '../selectors/session';
import selectUser from '../selectors/user';

export default function* fetchReferrals() {
  while (true) {
    const fetchAction = yield take(UserActions.FETCH_REFERRALS);
    const session = yield select(selectSession);
    const user = yield select(selectUser);

    try {
      yield put({ type: 'SET_LOADING', isLoading: true });
      const referrals = yield axios({
        method: 'get',
        baseURL: ENV.apiEndPoint,
        url: `v1/parents?where={\"referrer_id\": \"${user.userId }\"}`,
        headers: { Authorization: `JWT ${session.token}` },
      });

      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(UserActions.fetchReferralsComplete(referrals.data));
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(UserActions.fetchReferralsFailed(error));
    }
  }
}

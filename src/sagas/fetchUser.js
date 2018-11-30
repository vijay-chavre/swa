/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as UserActions from '../actions/user';
import * as SessionActions from '../actions/session';
import selectSession from '../selectors/session';

export default function* fetchUser() {
  while (true) {
    const fetchAction = yield take(UserActions.FETCH_USER);
    const userId = fetchAction.payload.userId;
    const session = yield select(selectSession);
    try {
      yield put({ type: 'SET_LOADING', isLoading: true });
      const userDataResponse = yield axios({
        method: 'get',
        baseURL: ENV.apiEndPoint,
        url: `/v1/users/${userId}`,
        params: {
          auth_token: `${session.token}`,
        },
      });
      const userResponse = yield axios({
        method: 'get',
        baseURL: ENV.apiEndPoint,
        url: `/v1/users/${userId}/purchases`,
        params: {
          auth_token: `${session.token}`,
        },
      });
      Object.keys(userResponse.data.students).forEach((studentKey) => {
        const student = userResponse.data.students[studentKey];
        if (student.country_code === 'GB') {
          student.grade = student.grade !== 'K' ? (parseInt(student.grade, 10) + 1).toString() : '1';
        }
      });
      if (userResponse) {
        userResponse.data.userData = userDataResponse;
      }
      yield put(SessionActions.setUserName(userResponse.data));
      yield put(UserActions.userFetched(userResponse.data));
      if (fetchAction.payload.fetchAllPlanDetails) {
        yield put(UserActions.fetchUserPlans({ user: userResponse.data }));
        yield put(UserActions.fetchUserServiceLevels({ user: userResponse.data }));
        yield put(UserActions.fetchUserPaymentStatus({ userId }));
      }
      yield put({ type: 'SET_LOADING', isLoading: false });
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(UserActions.fetchUserFailed());
    }
  }
}



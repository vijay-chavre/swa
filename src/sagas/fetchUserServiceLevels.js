/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as UserActions from '../actions/user';
import selectSession from '../selectors/session';

export default function* fetchUserServiceLevels() {
  while (true) {
    const fetchAction = yield take(UserActions.FETCH_SERVICE_LEVELS_FOR_USER);
    const session = yield select(selectSession);
    const user = fetchAction.payload.user;
    try {
      let students = Object.keys(user.students);
      let responses = [];
      yield put({ type: 'SET_LOADING', isLoading: true });

      for (let i = students.length - 1; i >= 0; i--) {
        const usersServiceLevelResponse = yield axios({
          method: 'get',
          baseURL: ENV.apiEndPoint,
          url: `/v1/servicelevels/${students[i]}`,
          params: {
            auth_token: `${session.token}`,
          },
        });
        responses.push(usersServiceLevelResponse.data);
      }

      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(UserActions.userServiceLevelsFetched(responses));
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(UserActions.fetchUserServiceLevelsFailed(error));
    }
  }
}

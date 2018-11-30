/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as UserActions from '../actions/user';
import selectSession from '../selectors/session';

export default function* fetchUserPlans() {
  while (true) {
    const fetchAction = yield take(UserActions.FETCH_PLANS_FOR_USER);
    const session = yield select(selectSession);
    const user = fetchAction.payload.user;
    try {
      let keys = Object.keys(user.students);
      let plans = [];
      var country_code;
      if (keys) {
        for (let i = keys.length - 1; i >= 0; i--) {
          if (user.students[keys[i]].braintree)          {
            plans.push(user.students[keys[i]].braintree.addon_id);
            country_code = user.students[keys[i]].country_code;
          }
        }
      }

      yield put({ type: 'SET_LOADING', isLoading: true });
      const userPlansResponse = yield axios({
        method: 'get',
        baseURL: ENV.apiEndPoint,
        url: `/v1/addons?where={\"_id\" :${  JSON.stringify(plans)  }}&country=${  country_code}`,
        headers: { Authorization: `JWT ${session.token}` },
      });
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(UserActions.userPlansFetched(userPlansResponse));
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(UserActions.fetchUserPlansFailed(error));
    }
  }
}

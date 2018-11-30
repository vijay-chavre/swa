/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as CommonActions from '../actions/common';
import selectSession from '../selectors/session';

export default function* fetchGradesForCountry() {
  while (true) {
    const fetchAction = yield take(CommonActions.FETCH_GRADES_FOR_COUNTRY);
    const countryCode = fetchAction.payload.countryCode;
    const session = yield select(selectSession);

    try {
      yield put({ type: 'SET_LOADING', isLoading: true });
      const gradeResponse = yield axios({
        method: 'get',
        baseURL: ENV.apiEndPoint,
        url: `/v1/grade/${countryCode}`,
        params: {
          auth_token: `${session.token}`,
        },
      });
      yield put(CommonActions.fetchedGradesForCountry(gradeResponse));
      yield put({ type: 'SET_LOADING', isLoading: false });
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(CommonActions.fetchGradesForCountryFailed(error));
    }
  }
}

/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as configurationActions from '../actions/configuration';
import selectSession from '../selectors/session';

export default function* fetchConfiguration() {
  while (true) {
    const fetchAction = yield take(configurationActions.FETCH_CONFIGURATION);
    const configurationType = fetchAction.payload.type;
    const session = yield select(selectSession);
    try {
      yield put({ type: 'SET_LOADING', isLoading: true });
      const configurationResponse = yield axios({
        method: 'GET',
        baseURL: ENV.apiEndPoint,
        url: `/v1/configuration/${configurationType}`,
        params: {
          auth_token: `${session.token}`,
        },
      });
      yield put({ type: 'SET_LOADING', isLoading: false });
      const configuration = {};
      configuration.reward_redemption = configurationResponse.data.result;
      yield put(configurationActions.fetchedConfiguration(configuration));
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(configurationActions.fetchConfigurationFailed(error));
    }
  }
}

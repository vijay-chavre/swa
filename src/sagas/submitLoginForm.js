/* global window, document */
/* eslint-disable no-constant-condition */
import { put, select, take } from 'redux-saga/effects';
import axios from 'axios';
import { startSubmit, stopSubmit } from 'redux-form';
import { formName as loginFormName } from '../components/Login/LoginForm';
import selectLoginFormValues from '../selectors/loginFormValues';
import * as SessionActions from '../actions/session';
import config from '../constants/config';

export default function* submitLoginForm() {
  while (true) {
    yield take(SessionActions.SUBMIT_LOGIN_FORM);
    const loginFormValues = yield select(selectLoginFormValues);
    if (!(loginFormValues && loginFormValues.username && loginFormValues.password)) {
      yield put(stopSubmit(loginFormName));
      yield put(SessionActions.loginFailed({ error: true }));
      return;
    }
    try {
      yield put(startSubmit(loginFormName));
      yield put({ type: 'SET_LOADING', isLoading: true });
      const createSessionResponse = yield axios({
        method: 'post',
        baseURL: ENV.apiEndPoint,
        url: '/v1/sessions',
        headers: { 'X-User-Agent': `StudentWebApp/${config.appversion}` },
        data: {
          username: loginFormValues.username.toLowerCase(),
          password: loginFormValues.password,
        },
      });
      // to save username for accessing settings
      createSessionResponse.data.username = loginFormValues.username;
      yield put({ type: 'SET_LOADING', isLoading: false });
      createSessionResponse.data.error = false;
      yield put(SessionActions.createSession(createSessionResponse.data));
      yield put(stopSubmit(loginFormName));
      dataLayer.push({
        uid: createSessionResponse.data.user_id, // i.e. 9a7db70816960ff2b7697cc14d0ecd1d
        event: 'swaLogin',
        email: loginFormValues.username.toLowerCase(),
      });
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(stopSubmit(loginFormName));
      yield put(SessionActions.loginFailed({ error: true }));
    }
  }
}

/* global window, document */
/* eslint-disable no-constant-condition */
import { fork, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as CommonActions from '../actions/common';
import selectSession from '../selectors/session';

function* dispatchLog(wbSession, session, studentId) {
  try {
    const logResponse = yield axios({
      method: 'put',
      baseURL: ENV.apiEndPoint,
      url: `/v1/students/${studentId}/whiteboardSession/log`,
      headers: { Authorization: `JWT ${session.token}` },
      data: wbSession,
    });
    return logResponse;
  } catch (error) {
    return error;
  }
}

export default function* logWhiteboardSession() {
  while (true) {
    const fetchAction = yield take(CommonActions.WHITEBORD_SESSION_LOG);
    const wbSession = fetchAction.payload.wbSession;
    const studentId = fetchAction.payload.studentId;
    const session = yield select(selectSession);

    try {
      yield fork(dispatchLog, wbSession, session, studentId); // async dispatch
    } catch (error) {
      Raven.captureException(error);
    }
  }
}

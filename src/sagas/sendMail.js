/* global window, document */
/* eslint-disable no-constant-condition */
/*

*/
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as MailActions from '../actions/mail';
import selectSession from '../selectors/session';

export default function* sendMail() {
  while (true) {
    const fetchAction = yield take(MailActions.MAIL_SEND);
    const session = yield select(selectSession);
    const user = fetchAction.payload.user;
    const studentID = fetchAction.payload.studentID;
    const data = fetchAction.payload.data;

    try {
      yield put({ type: 'SET_LOADING', isLoading: true });
      const mailResult = yield axios({
          method: 'post',
          baseURL: ENV.apiEndPoint,
          url: 'v1/notifications/sendsesemail',
          headers: { Authorization: `JWT ${session.token}` },
          data: data,
        });
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(MailActions.mailSent());
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(MailActions.mailSendFailed());
    }
  }
}

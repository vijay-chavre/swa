/* global window, document */
/* eslint-disable no-constant-condition */
import { take, fork, select } from 'redux-saga/effects';
import axios from 'axios';
import selectSession from '../selectors/session';
import * as EventActions from '../actions/event';

function* dispatchEvent(session, event) {
  try {
    const eventResponse = yield axios({
      method: 'post',
      baseURL: ENV.apiEndPoint,
      headers: { Authorization: `JWT ${session.token}` },
      url: '/v1/polas',
      data: event,
    });
    return eventResponse;
  } catch (error) {
    return error;
  }
}

export default function* createPolaEvent() {
  while (true) {
    const eventAction = yield take(EventActions.POLA_EVENT_CREATE);
    const event = {};
    event.uuid = eventAction.payload.submissionId;
    event.questionNumber = eventAction.payload.questionNumber;
    event.type = eventAction.payload.eventType;
    event.studentId = eventAction.payload.studentId;

    // Get Session
    const session = yield select(selectSession);
    try {
      yield fork(dispatchEvent, session, event); // async dispatch
    } catch (error) {
      Raven.captureException(error);
      console.log('error', error);
    }
  }
}

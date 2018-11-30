import { fork, take, select } from 'redux-saga/effects';
import axios from 'axios';
import selectSession from '../selectors/session';
import * as EventActions from '../actions/event';

function* dispatchEvent(session, eventProperties, userId) {
  try {
    const eventResponse = yield axios({
      method: 'put',
      baseURL: ENV.apiEndPoint,
      headers: { Authorization: `JWT ${session.token}` },
      url: `/v1/student/${userId}/summary`,
      data: eventProperties,
    });
    return eventResponse;
  } catch (error) {
    return undefined;
  }
}

export default function* createTrackingEvent() {
  while (true) {
    const eventAction = yield take(EventActions.TRACKING_EVENT_CREATE);
    // Get Session
    const session = yield select(selectSession);
    const eventProperties = eventAction.payload.properties;
    const userId = eventAction.payload.id;

    try {
      yield fork(dispatchEvent, session, eventProperties, userId); // async dispatch
    } catch (error) {
      Raven.captureException(error);
      console.log('error', error);
    }
  }
}

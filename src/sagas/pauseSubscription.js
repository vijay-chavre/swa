/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as StudentActions from '../actions/student';
import selectSession from '../selectors/session';

export default function* pauseSubscription() {
  while (true) {
    const fetchAction = yield take(StudentActions.PAUSE_SUBSCRIPTION);
    const session = yield select(selectSession);
    const user = fetchAction.payload.user;
    const studentId = fetchAction.payload.studentId;
    const duration = fetchAction.payload.duration;
    const parentName = `${user.first_name } ${ user.last_name}`;
    const studentName = `${user.students[studentId].first_name } ${ user.students[studentId].last_name}`;
    
    
    try {

      yield put({ type: 'SET_LOADING', isLoading: true });

      const pauseSubscriptionResult = yield axios({
        method: 'post',
        baseURL: ENV.apiEndPoint,
        url: 'v1/zendesk/ticket',
        headers: { Authorization: `JWT ${session.token}` },
        data: {
                'subject': 'Pause subscription request',
                'body': `Pause subscription\n Name: ${ parentName }\nEmail Address: ${ user.email_address }\nStudent's name : ${ studentName }\nStudent Id: ${ studentId }\nFor ${ duration } month/s` ,
                'name': parentName,
                'studentName': studentName,
                'email': user.email_address,
              },

      });

      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(StudentActions.pausedSubscription(pauseSubscriptionResult));
    } catch (error) {
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(StudentActions.pauseSubscriptionFailed(error));
    }
  }
}

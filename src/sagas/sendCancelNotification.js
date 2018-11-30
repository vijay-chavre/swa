/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as StudentActions from '../actions/student';
import selectSession from '../selectors/session';

export default function* sendCancelNotification() {
  while (true) {
    const fetchAction = yield take(StudentActions.CANCEL_SUBSCRIPTION_NOTIFICATION);
    const session = yield select(selectSession);
    const user = fetchAction.payload.user;
    const studentId = fetchAction.payload.studentId;
    const reasons = fetchAction.payload.reasons;
    reasons.title = `Student plan cancellation for ${  studentId}`;
    reasons.push({ studentId: studentId });
    reasons.push({ name: user.students[studentId].first_name + user.students[studentId].last_name });

    try {
      yield put({ type: 'SET_LOADING', isLoading: true });

      const cancelSubscriptionNotificationResponse = yield axios({
        method: 'post',
        baseURL: ENV.apiEndPoint,
        url: `v1/notifications/${user._id}/cancel`,
        headers: { Authorization: `JWT ${session.token}` },
        data: reasons,

      });

      cancelSubscriptionNotificationResponse.doNotShowPopup = fetchAction.payload.doNotShowPopup;

      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(StudentActions.cancelSubscriptionNotified(cancelSubscriptionNotificationResponse));
    } catch (error) {
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(StudentActions.cancelSubscriptionNotificationFailed(error));
    }
  }
}

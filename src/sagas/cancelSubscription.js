/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as StudentActions from '../actions/student';
import selectSession from '../selectors/session';
import lodash from 'lodash';

export default function* cancelSubscription() {
  while (true) {
    const fetchAction = yield take(StudentActions.CANCEL_SUBSCRIPTION);
    const session = yield select(selectSession);
    const user = fetchAction.payload.user;
    let paymentStatus = user.paymentStatus;
    const studentId = fetchAction.payload.studentId;
    const reasons = fetchAction.payload.reasons;
    let studentIndex = lodash.findIndex(paymentStatus.students, {"id" : studentId });
    let addonId;

    if(studentIndex != -1)
      addonId = paymentStatus.students[studentIndex].addon_id;
    
    try {

      yield put({ type: 'SET_LOADING', isLoading: true });

      const cancelSubscriptionResult = yield axios({
        method: 'delete',
        baseURL: ENV.apiEndPoint,
        url: 'v1/subscriptions/' + user.paymentStatus.subscription_id + '/addons',
        headers: { Authorization: `JWT ${session.token}` },
        data: { "reasons": reasons, 
                "studentId": studentId, "addonId": addonId, "requestOrigin" : "StudentWebApp"}

      });

      const cancelSubscriptionNotificationResponse = yield axios({
        method: 'post',
        baseURL: ENV.apiEndPoint,
        url: `v1/notifications/${user._id}/cancel`,
        headers: { Authorization: `JWT ${session.token}` },
        data: reasons,
      });

      Raven.captureBreadcrumb({
        message: 'Cancel Subscription',
        category: 'account',
        data: {
          user_id: user._id,
          reasons,
        },
      });

      yield put(StudentActions.cancelledSubscription(cancelSubscriptionResult));
      
      yield put({ type: 'SET_LOADING', isLoading: false });
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(StudentActions.cancelSubscriptionFailed(error));
    }
  }
}

/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import lodash from 'lodash';
import * as StudentActions from '../actions/student';
import * as UserActions from '../actions/user';
import selectSession from '../selectors/session';

export default function* updateStudentPlan() {
  while (true) {
    const fetchAction = yield take(StudentActions.UPDATE_STUDENT_PLAN);
    const session = yield select(selectSession);
    const user = fetchAction.payload.user;
    const studentID = fetchAction.payload.studentId;
    const service_id = fetchAction.payload.service_id;
    let billingFrequency = 1;
    if (user && user.students && user.students[studentID] && user.planDetails && user.planDetails[studentID]) {
      billingFrequency = user.planDetails[studentID].billingFrequency;
    }
    
    try {
      yield put({ type: 'SET_LOADING', isLoading: true });

      const updatePlansResult = yield axios({
        method: 'put',
        baseURL: ENV.apiEndPoint,
        url: `v1/parents/${user._id}`,
        headers: { Authorization: `JWT ${session.token}` },
        data: { students: [{ id: studentID, billingFrequency, service_id }] },
      });
      let studentIndex = -1;
      if (user && user.paymentStatus && user.paymentStatus.students && user.paymentStatus.students.length > 0) {
        studentIndex = lodash.findIndex(user.paymentStatus.students, { id: studentID });
      }

      if (user && user.paymentStatus && user.paymentStatus.isPaid && studentIndex !== -1 && user.paymentStatus.students[studentIndex].isPaid) {
          // put addon - not yet
        yield put(UserActions.fetchUser({ userId: user._id, fetchAllPlanDetails: true }));
        yield put(StudentActions.updatedStudentPlan(updatePlansResult));
        yield put({ type: 'SET_LOADING', isLoading: false });
      } else {
        try {
            const createSubscriptionResult = yield axios({
                method: 'post',
                baseURL: ENV.apiEndPoint,
                url: '/v1/subscriptions',
                headers: { Authorization: `JWT ${session.token}` },
                data: {
                  studentId: studentID,
                  userId: user._id,
                },

              });

            yield put(UserActions.fetchUser({ userId: user._id, fetchAllPlanDetails: true }));
            yield put(StudentActions.updatedStudentPlan(null));
            yield put({ type: 'SET_LOADING', isLoading: false });
          } catch (error) {
            yield put({ type: 'SET_LOADING', isLoading: false });
            yield put(StudentActions.updateStudentPlanFailed(error));
          }
      }
    } catch (error) {
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(StudentActions.updateStudentPlanFailed(error));
    }
  }
}

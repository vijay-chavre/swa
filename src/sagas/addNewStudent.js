/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as StudentActions from '../actions/student';
import * as UserActions from '../actions/user';
import selectSession from '../selectors/session';

export default function* updateStudentPlan() {
  while (true) {
    const fetchAction = yield take(StudentActions.ADD_NEW_STUDENT);
    const session = yield select(selectSession);
    const user = fetchAction.payload.user;
    const studentData = fetchAction.payload.student;
    const fromPayment = fetchAction.payload.fromPayment;

    try {
      yield put({ type: 'SET_LOADING', isLoading: true });

      const addStudentResult = yield axios({
        method: 'post',
        baseURL: ENV.apiEndPoint,
        url: `/v1/parents/${user._id }/students`,
        headers: { Authorization: `JWT ${session.token}` },
        data: studentData,
      });

      

      yield put(UserActions.fetchUser({ userId: user._id, fetchAllPlanDetails: true }));
      yield put(StudentActions.addedNewStudent(addStudentResult));
      
      try {
        const createSubscriptionResult = yield axios({
          method: 'post',
          baseURL: ENV.apiEndPoint,
          url: '/v1/subscriptions',
          headers: { Authorization: `JWT ${session.token}` },
          data: {
            studentId: addStudentResult.data.id,
            userId: user._id,
          },

        });
        Raven.captureBreadcrumb({
          message: 'Add new student',
          category: 'account',
          data: {
            user_id: user._id,
            studentId: addStudentResult.data.id,
          },
        });
        yield put(StudentActions.addedNewSubscription(createSubscriptionResult));
      } catch (error) {
        yield put({ type: 'SET_LOADING', isLoading: false });
        yield put(StudentActions.addNewStudentFailed(error));
      }
      yield put(StudentActions.removeNewStudentDetails());
      yield put(UserActions.fetchUser({ userId: user._id }));
      yield put({ type: 'SET_LOADING', isLoading: false });
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(StudentActions.addNewStudentFailed(error));
    }
  }
}

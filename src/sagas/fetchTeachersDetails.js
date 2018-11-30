/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as StudentActions from '../actions/student';
import selectSession from '../selectors/session';

export default function* fetchTeachersDetails() {
  while (true) {
    const fetchAction = yield take(StudentActions.FETCH_TEACHER_DETAILS);
    const studentID = fetchAction.payload.student_id;
    const user = fetchAction.payload.user;
    const classID = user.students[studentID].class_assigned;
    const session = yield select(selectSession);
    if (classID) {
      try {
        yield put({ type: 'SET_LOADING', isLoading: true });
        const classResponse = yield axios({
          method: 'get',
          baseURL: ENV.apiEndPoint,
          url: `v1/classes/${classID}`,
          params: {
            auth_token: `${session.token}`,
          },
  
        });
        
        const teacherId = (classResponse && classResponse.data ? classResponse.data.tutor : null);
        if (teacherId) {
          const teacherResponse = yield axios({
            method: 'get',
            baseURL: ENV.apiEndPoint,
            url: `v1/tutors/${teacherId}`,
            params: {
              auth_token: `${session.token}`,
            },
    
          });
          yield put(StudentActions.fetchedTeacherDetails(teacherResponse));
        }

        yield put({ type: 'SET_LOADING', isLoading: false });
      } catch (error) {
        Raven.captureException(error);
        yield put({ type: 'SET_LOADING', isLoading: false });
        yield put(StudentActions.fetchTeacherDetailsFailed(error));
      }
    }
  }
}

/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import moment from 'moment';
import selectSession from '../selectors/session';
import selectStudent from '../selectors/students';
import selectUser from '../selectors/user';
import * as StudentActions from '../actions/student';
import * as SubscriptionState from '../constants/subscriptionState';
import * as Common from '../components/Shared/Common';

export default function* fetchUser() {
  while (true) {
    const fetchAction = yield take(StudentActions.FETCH_STUDENT);
    const studentId = fetchAction.payload.studentId;
    const session = yield select(selectSession);
    const student = yield select(selectStudent);
    const user = yield select(selectUser);

    try {
      let showLoading = true;
      if (student && student._id === studentId && student.playlists && student.playlists.length > 0) {
        showLoading = false;
      }
      if (showLoading) {
        yield put({ type: 'SET_LOADING', isLoading: true });
      }

      const userResponse = yield axios({
        method: 'get',
        baseURL: ENV.apiEndPoint,
        url: `/v1/students/${studentId}/timeline`,
        params: {
          auth_token: `${session.token}`,
        },

      });
      yield put({ type: 'SET_LOADING', isLoading: false });

      // remove worksheets without learnosity id
      // remove the assignment if it is already submitted
      const timeline = userResponse.data;
      const subscriptionState = Common.stateOfStudent(student, user);
      if (timeline.country_code === 'GB') {
        timeline.grade = timeline.grade !== 'K' ? (parseInt(timeline.grade, 10) + 1).toString() : '1';
      }
      timeline._id = timeline.id; // assigning id to _id backword compatibility
      delete timeline.id; // id not required anymore
      if (timeline.playlists && timeline.playlists.length > 0) {
        timeline.playlists.forEach((playlist) => {
          let index = playlist.worksheets.length - 1;
          while (index >= 0) {
            const item = playlist.worksheets[index];
            let shouldRemoveItem = false;
            let matchingSubmission;
            if (item.state && item.state.toUpperCase() === 'COMPLETED') { // Removing already submitted worksheets
              shouldRemoveItem = true;
              // TODO: add logic to push the submission to server
            }
            if (timeline.submissions) {
              matchingSubmission = timeline.submissions.filter((submission) => {
                return submission._id === item.id;
              });
              if (matchingSubmission && matchingSubmission.length > 0) {
                shouldRemoveItem = true;
              }
            }
            if (!shouldRemoveItem) {
              if (!(item && item.meta && item.meta.learnosity_activity_id)) {
                shouldRemoveItem = true;
              }
            }

            if (!shouldRemoveItem) {
              // Removing worksheets for cancelled user assigned before purchasing the sessions
              if (subscriptionState.toLowerCase() === SubscriptionState.TUTORING_SESSIONS) {
                if (item && item.assigned_date) {
                  const dateAssigned = moment(item.assigned_date);
                  const recentPurchaseDate = Common.recentTutoringSessionPurchseDate(user);
                  if (recentPurchaseDate) {
                    const dateDiff = moment(recentPurchaseDate).diff(dateAssigned, 'days');
                    if (dateDiff > 0) {
                      shouldRemoveItem = true;
                    }
                  }
                }
              }
            }
            if (shouldRemoveItem) {
              playlist.worksheets.splice(index, 1);
            }

            index -= 1;
          }
        });
      }
      if (timeline && timeline.submissions && timeline.submissions.length > 0) {
        let index = timeline.submissions.length - 1;
        while (index >= 0) {
          let shouldRemoveItem = false;
          const submission = timeline.submissions[index];

          if (submission && submission.worksheet_meta && !submission.worksheet_meta.learnosity_activity_id) {
            shouldRemoveItem = true;
          }
          if (shouldRemoveItem) {
            timeline.submissions.splice(index, 1);
          }

          index -= 1;
        }
      }
      yield put(StudentActions.studentFetched(timeline));
      Raven.captureBreadcrumb({
        message: 'Fetch student timeline',
        category: 'attempt',
        data: {
          studentId,
        },
      });
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(StudentActions.fetchStudentFailed(error));
    }
  }
}

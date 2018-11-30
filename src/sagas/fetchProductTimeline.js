/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import selectSession from '../selectors/session';
import * as ProductActions from '../actions/product';

export default function* fetchProductTimeline() {
  while (true) {
    const fetchAction = yield take(ProductActions.FETCH_PRODUCT_TIMELINE);
    const productId = fetchAction.payload.id;
    const session = yield select(selectSession);
    try {
      yield put({ type: 'SET_LOADING', isLoading: true });
      const userResponse = yield axios({
        method: 'get',
        baseURL: ENV.apiEndPoint,
        url: `/v1/purchases/${productId}/timeline`,
        params: {
          auth_token: `${session.token}`,
        },

      });
      yield put({ type: 'SET_LOADING', isLoading: false });

      // remove worksheets without learnosity id
      // remove the assignment if it is already submitted
      const timeline = userResponse.data;
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

      // Comaptibility with Student Structure
      // timeline.first_name = timeline.product_name;
      // timeline.grade = timeline.product_grade;
      yield put(ProductActions.productTimelineFetched(timeline));
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(ProductActions.fetchProductTimelineFailed(error));
    }
  }
}

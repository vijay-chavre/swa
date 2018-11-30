import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as StudentActions from '../actions/submission';
import selectSession from '../selectors/session';

export default function* updateStudentReviewedDate() {
  while (true) {
    const fetchAction = yield take(StudentActions.UPDATE_STUDENT_REVIEWED_DATE);
    const submissionDict = fetchAction.payload.submissionDict;
    const session = yield select(selectSession);
    try {
      const updateResult = yield axios({
        method: 'put',
        baseURL: ENV.apiEndPoint,
        url: `/v1/submissions/${submissionDict._id}/update`,
        data: submissionDict,
        params: {
          auth_token: `${session.token}`,
        },
      });
      if (updateResult) {
        yield put(StudentActions.studentReviewedDateUpdated(updateResult));
      }
    } catch (error) {
      console.log(error);
    }
  }
}

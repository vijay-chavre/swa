import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import selectSession from '../selectors/session';
import * as TutoringSessionActions from '../actions/tutoringSessions';

export default function* fetchTutoringSessions() {
   while(true) {
    try {
    const fetchAction = yield take(TutoringSessionActions.FETCH_TUTORING_SESSIONS);
    const userId = fetchAction.payload.userId;
    const session = yield select(selectSession);
    const tutoringSessions = yield axios({
      method: 'get',
      baseURL: ENV.tutoringSessionsAPIEndPoint,
      url: `/v1/user/${session.user_id}/sessions`,
      params: {
        auth_token: `${session.token}`,
      },
    })
    yield put(TutoringSessionActions.sessionsFetched(tutoringSessions.data));
    } catch(error) {
        console.log(error);
        Raven.captureException(error);
        yield put({ type: 'SET_LOADING', isLoading: false });
        yield put(TutoringSessionActions.fetchSessionsFailed());
    }
   } 
}
/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as VideoActions from '../actions/video';
import selectSession from '../selectors/session';

export default function* fetchConceptVideos() {
  while (true) {
    const fetchAction = yield take(VideoActions.FETCH_CONCEPT_VIDEOS);
    const session = yield select(selectSession);

    const conceptId = fetchAction.payload;
    
    try {

      yield put({ type: 'SET_LOADING', isLoading: true });

      
        const conceptVideosResult = yield axios({
          method: 'get',
          baseURL: ENV.apiEndPoint,
          url: 'v1/videos/concept/' + conceptId,
          headers: { Authorization: `JWT ${session.token}` },
        });

        const conceptVideos = conceptVideosResult.data;

      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(VideoActions.conceptVideosFetched(conceptVideos));
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(VideoActions.fetchVideosFailed(error));
    }
  }
}

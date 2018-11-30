import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import _ from 'lodash';
import selectSession from '../selectors/session';
import * as VideoActions from '../actions/video';

export default function* fetchVideosRequest() {
  while (true) {
    const fetchAction = yield take(VideoActions.FETCH_VIDEOS);
    const session = yield select(selectSession);
    const params = fetchAction.payload;
    try {
      yield put({ type: 'SET_LOADING', isLoading: true });
      const videos = yield axios({
        method: 'get',
        baseURL: ENV.apiEndPoint,
        url: `/v1/videos/grade/${params.grade}`,
        headers: { Authorization: `JWT ${session.token}` },
      })
      .then(response => response.data)
      .then(responseData => responseData.map(video => ({
        ...video,
        concept: video.worksheets[0].concept,
        grade: video.worksheets[0].grade,
        topic: video.worksheets[0].topic,
      })))
      .then(responseData => {
        const filteredVideos = responseData.filter((video) => { return (video.id.indexOf('ZAESample') === -1 && video.id.indexOf('AF_ZA') === -1 && video.id.indexOf('EN_ZA') === -1) });
        return filteredVideos;
      });
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(VideoActions.videosFetched(videos));
      Raven.captureBreadcrumb({
        message: 'Fetch videos',
        category: 'videos',
        data: {
          grade: params.grade,
        },
      });
    } catch (error) {
      yield put(VideoActions.fetchVideosFailed(error));
    }
  }
}


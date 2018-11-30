import { put, take, call } from 'redux-saga/effects';
import axios from 'axios';
import * as UserActions from '../actions/leaders';


export default function* fetchUser() {
  while (true) {
    const fetchAction = yield take(UserActions.FETCH_LEADERS_FOR_GUEST);
    const skip = fetchAction.payload.skip;
    const url = `/leaderboards/${ENV.leaderboardName}/documents?limit=30&skip=0&sort%5BrewardPoints.lifetime%5D=desc`;
    try {
      yield put({ type: 'SET_LOADING', isLoading: true });
      const userResponse = yield axios({
        method: 'get',
        baseURL: ENV.leaderboardAPIEndPoint,
        url: url,
      });
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(UserActions.guestLeadersFetched(userResponse));         
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(UserActions.fetchGuestLeadersFailed(error));
    }
  }
}

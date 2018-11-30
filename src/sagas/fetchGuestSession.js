/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take } from 'redux-saga/effects';
import axios from 'axios';
import * as GuestSessionActions from '../actions/guestSession';
import config from '../constants/config';
import requestJSONP from '../utils/requestJSONP';

const freeGeoIPJSONURL = process.env.FREE_GEO_IP_JSON_URL || 'https://api.ipstack.com/check?access_key=566719b19a463dd643e82d2301e777d3&output=json&legacy=1';

export default function* fetchGuestToken() {
  while (true) {
    const fetchAction = yield take(GuestSessionActions.FETCH_GUEST_TOKEN);
    const geoLocation = yield requestJSONP(freeGeoIPJSONURL);
    const countryCode = geoLocation.country_code || 'US';

    try {
      yield put({ type: 'SET_LOADING', isLoading: true });

      const userResponse = yield axios({
        method: 'get',
        baseURL: ENV.apiEndPoint,
        url: `/v1/guestSSOToken/${countryCode.toUpperCase()}`,
        headers: { 'X-User-Agent': `StudentWebApp/${config.appversion}` },
      });
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(GuestSessionActions.guestTokenFetched(userResponse.data));
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(GuestSessionActions.fetchGuestTokenFailed(error));
    }
  }
}

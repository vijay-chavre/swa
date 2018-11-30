import { put } from 'redux-saga/effects';
import errorAction from '../actions/error';
import setGeoLocation from '../actions/setGeoLocation';
import requestJSONP from '../utils/requestJSONP';

const freeGeoIPJSONURL = process.env.FREE_GEO_IP_JSON_URL || 'https://api.ipstack.com/check?access_key=566719b19a463dd643e82d2301e777d3&output=json&legacy=1';

export default function* fetchGeoLocationSaga() {
  try {
    const geoLocationData = yield requestJSONP(freeGeoIPJSONURL);

    yield put(setGeoLocation(geoLocationData));
  } catch (error) {
    yield put(errorAction({
      error,
      title: 'Error fetching IP address geo location',
    }));
  }
}

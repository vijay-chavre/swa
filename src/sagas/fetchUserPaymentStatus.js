/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import cookie from 'cookie';
import * as UserActions from '../actions/user';
import selectSession from '../selectors/session';


export default function* fetchUserPaymentStatus() {
  while (true) {
    const fetchAction = yield take(UserActions.FETCH_PAYMENT_STATUS_FOR_USER);
    const session = yield select(selectSession);
    const userId = fetchAction.payload.userId;
    try {
      yield put({ type: 'SET_LOADING', isLoading: true });

      const paymentStatusResponse = yield axios({
        method: 'get',
        baseURL: ENV.apiEndPoint,
        url: `/v1/parents/${userId}/status`,
        params: {
          auth_token: `${session.token}`,
        },
      });

      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(UserActions.fetchedUserPaymentStatus(paymentStatusResponse ? paymentStatusResponse.data : null));
      if (paymentStatusResponse.data && paymentStatusResponse.data.status) {
        const cookies = cookie.parse(document.cookie);
        if (cookies.__tm__pm__status__ !== paymentStatusResponse.data.status) {
          logAchievedLevelEvent(paymentStatusResponse.data.status);
          document.cookie = cookie.serialize('__tm__p__status__', paymentStatusResponse.data.status, {
            maxAge: 60 * 60 * 24 * 365,
          });
          if (paymentStatusResponse.data.status.toLowerCase() === 'active') {
            logPaidAfterTrialEvent();
          }
        }
      }
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(UserActions.fetchFailedUserPaymentStatus());
    }
  }
}

/**
 * This function will log AchievedLevel App Event
 * @param {string} level
 */
function logAchievedLevelEvent(level) {
  try {
    const params = {};
    params[FB.AppEvents.ParameterNames.LEVEL] = level;
    FB.AppEvents.logEvent(FB.AppEvents.EventNames.ACHIEVED_LEVEL, null, params);
  } catch (err) {
    console.log(err);
  }
}

/**
 * This function will log PaidAfterTrial App Event
 */
function logPaidAfterTrialEvent() {
  FB.AppEvents.logEvent('PaidAfterTrial');
}

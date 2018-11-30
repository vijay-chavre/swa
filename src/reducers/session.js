import moment from 'moment';
import LogRocket from 'logrocket';

import { REHYDRATE } from 'redux-persist/constants';
import { SET_SESSION, LOGIN_FAILED, LOG_OUT, CHECK_PASSWORD, 
         RE_LOGIN_VALID, RE_LOGIN_INVALID, RESET_RE_LOGIN_DATA, SET_USER_NAME } from '../actions/session';

const initalState = {
  token: null,
  user_id: null,
  error: null,
  username: null,
  lastLoggedInDate: null,
};

export default function session(
  state = initalState,
  action
) {
  switch (action.type) {

    case SET_USER_NAME:
      state.username = action.payload.login_id;
      return {...state};

    case SET_SESSION:
      Raven.setUserContext({ id: action.payload.user_id });
      Raven.captureBreadcrumb({
        message: 'User logged in',
        category: 'account',
        data: {
          id: action.payload.user_id,
        },
      });
      LogRocket.identify(action.payload.user_id, {
      });
      state.lastLoggedInDate = moment().utc().valueOf();
      state.error = false;
      return { ...state, ...action.payload };

    case LOGIN_FAILED:
      state.token = null;
      state.error = true;
      return { ...state };

    case CHECK_PASSWORD:
      state.reloginValid = null;
      state.checkingPassword = true;
      state.checkedPassword = false;
      return { ...state };

    case RE_LOGIN_VALID:
      state.reloginValid = true;
      state.checkedPassword = true;
      state.checkingPassword = false;
      return { ...state };

    case RE_LOGIN_INVALID:
      state.reloginValid = false;
      state.checkedPassword = true;
      state.checkingPassword = false;
      return { ...state };

    case RESET_RE_LOGIN_DATA:
      
      state.reloginValid = null;
      state.checkingPassword = false;
      state.checkedPassword = false;
      return { ...state };


    case REHYDRATE:
      if (action.key === 'session') {
          // restore immutable data
        return { ...state, ...action.payload, error: null };
      }
      return state;
    case LOG_OUT:
      return {
        token: null,
        user_id: null,
        error: null,
        username: null,
        lastLoggedInDate: null,
      };
    default:
      return state;
  }
}

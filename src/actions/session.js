import { createAction } from 'redux-actions';

export const SET_SESSION = 'SET_SESSION';
export const SUBMIT_LOGIN_FORM = 'SUBMIT_LOGIN_FORM';
export const LOGIN_FAILED = 'LOGIN_FAILED';
export const LOG_OUT = 'LOG_OUT';
export const VALIDATE_TOKEN = 'VALIDATE_TOKEN';
export const CHECK_PASSWORD = 'CHECK_PASSWORD';
export const RE_LOGIN_VALID = 'RE_LOGIN_VALID';
export const RE_LOGIN_INVALID = 'RE_LOGIN_INVALID';
export const RESET_RE_LOGIN_DATA = 'RESET_RE_LOGIN_DATA';
export const SET_USER_NAME = 'SET_USER_NAME';

export const createSession = createAction(SET_SESSION);
export const submitLoginForm = createAction(SUBMIT_LOGIN_FORM);
export const checkPassword = createAction(CHECK_PASSWORD);
export const loginFailed = createAction(LOGIN_FAILED);
export const logout = createAction(LOG_OUT);
export const validateToken = createAction(VALIDATE_TOKEN);
export const reloginValid = createAction(RE_LOGIN_VALID);
export const reloginInvalid = createAction(RE_LOGIN_INVALID);
export const resetReloginData = createAction(RESET_RE_LOGIN_DATA);
export const setUserName = createAction(SET_USER_NAME);

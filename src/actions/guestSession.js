import { createAction } from 'redux-actions';

export const FETCH_GUEST_TOKEN = 'FETCH_GUEST_TOKEN';
export const GUEST_TOKEN_FETCHED = 'GUEST_TOKEN_FETCHED';
export const FETCH_GUEST_TOKEN_FAILED = 'FETCH_GUEST_TOKEN_FAILED';
export const CLEAR_GUEST_TOKEN = 'CLEAR_GUEST_TOKEN';

export const fetchGuestToken = createAction(FETCH_GUEST_TOKEN);
export const guestTokenFetched = createAction(GUEST_TOKEN_FETCHED);
export const fetchGuestTokenFailed = createAction(FETCH_GUEST_TOKEN_FAILED);
export const clearGuestToken = createAction(CLEAR_GUEST_TOKEN);

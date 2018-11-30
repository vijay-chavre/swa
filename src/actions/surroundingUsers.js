import { createAction } from 'redux-actions';

export const FETCH_SURROUNDING_USERS = 'FETCH_SURROUNDING_USERS';
export const SURROUNDING_USERS_FETCHED = 'SURROUNDING_USERS_FETCHED';
export const FETCH_SURROUNDING_USERS_FAILED = 'FETCH_SURROUNDINGUSERS_FAILED';

export const fetchSurroundingUsers = createAction(FETCH_SURROUNDING_USERS);
export const surroundingUsersFetched = createAction(SURROUNDING_USERS_FETCHED);
export const fetchSurroundingUsersFailed = createAction(FETCH_SURROUNDING_USERS_FAILED);

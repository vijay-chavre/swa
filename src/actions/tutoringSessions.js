import { createAction } from 'redux-actions';

export const FETCH_TUTORING_SESSIONS = 'FETCH_TUTORING_SESSIONS';
export const FETCHED_TUTORING_SESSIONS = 'FETCHED_TUTORING_SESSIONS';
export const FETCH_TUTORING_SESSIONS_FAILED = 'FETCH_TUTORING_SESSIONS_FAILED';

export const fetchTutoringSessions = createAction(FETCH_TUTORING_SESSIONS);
export const sessionsFetched = createAction(FETCHED_TUTORING_SESSIONS);
export const fetchSessionsFailed = createAction(FETCH_TUTORING_SESSIONS_FAILED);
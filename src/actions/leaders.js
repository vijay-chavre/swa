import { createAction } from 'redux-actions';

export const FETCH_LEADERS = 'FETCH_LEADERS';
export const LEADER_FETCHED = 'LEADER_FETCHED';
export const FETCH_LEADERS_FAILED = 'FETCH_LEADERS_FAILED';

export const FETCH_LEADERS_FOR_GUEST = 'FETCH_LEADERS_FOR_GUEST';
export const GUEST_LEADERS_FETCHED = 'GUEST_LEADERS_FETCHED';
export const FETCH_GUEST_LEADERS_FAILED = 'FETCH_LEADERS_FAILED';

export const fetchLeaders = createAction(FETCH_LEADERS);
export const leadersFetched = createAction(LEADER_FETCHED);
export const fetchLeadersFailed = createAction(FETCH_LEADERS_FAILED);
export const fetchLeadersForGuestUser = createAction(FETCH_LEADERS_FOR_GUEST);
export const guestLeadersFetched = createAction(GUEST_LEADERS_FETCHED);
export const fetchGuestLeadersFailed = createAction(FETCH_GUEST_LEADERS_FAILED);

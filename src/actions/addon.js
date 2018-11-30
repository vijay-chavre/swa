import { createAction } from 'redux-actions';


//to fetch user addons

export const FETCH_ADDONS = 'FETCH_ADDONS';
export const FETCHED_ADDONS = 'FETCHED_ADDONS';
export const FETCH_FAILED_ADDONS = 'FETCH_FAILED_ADDONS';

export const fetchAddons = createAction(FETCH_ADDONS);
export const fetchedAddons = createAction(FETCHED_ADDONS);
export const fetchFailedAddons = createAction(FETCH_FAILED_ADDONS);
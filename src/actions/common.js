import { createAction } from 'redux-actions';


// to fetch grades

export const FETCH_GRADES_FOR_COUNTRY = 'FETCH_GRADES_FOR_COUNTRY';
export const FETCHED_GRADES_FOR_COUNTRY = 'FETCHED_GRADES_FOR_COUNTRY';
export const FETCH_GRADES_FOR_COUNTRY_FAILED = 'FETCH_GRADES_FOR_COUNTRY_FAILED';

export const fetchGradesForCountry = createAction(FETCH_GRADES_FOR_COUNTRY);
export const fetchedGradesForCountry = createAction(FETCHED_GRADES_FOR_COUNTRY);
export const fetchGradesForCountryFailed = createAction(FETCH_GRADES_FOR_COUNTRY_FAILED);

// push whiteboarding logs
export const WHITEBORD_SESSION_LOG = 'WHITEBORD_SESSION_LOG';
export const logWhiteboardSession = createAction(WHITEBORD_SESSION_LOG);

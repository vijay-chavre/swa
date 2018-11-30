import { createAction } from 'redux-actions';

export const FETCH_CONFIGURATION = 'FETCH_CONFIGURATION';
export const FETCHED_CONFIGURATION = 'FETCHED_CONFIGURATION';
export const FETCH_CONFIGURATION_FAILED = 'FETCH_FAILED_CONFIGURATION';

export const fetchConfiguration = createAction(FETCH_CONFIGURATION);
export const fetchedConfiguration = createAction(FETCHED_CONFIGURATION);
export const fetchConfigurationFailed = createAction(FETCH_CONFIGURATION_FAILED);

import { createAction } from 'redux-actions';

export const POLA_EVENT_CREATE = 'POLA_EVENT_CREATE';
export const TRACKING_EVENT_CREATE = 'TRACKING_EVENT_CREATE';

export const createPolaEvent = createAction(POLA_EVENT_CREATE);
export const createTrackingEvent = createAction(TRACKING_EVENT_CREATE);

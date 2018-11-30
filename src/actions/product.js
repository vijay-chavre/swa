import { createAction } from 'redux-actions';

export const FETCH_PRODUCT_TIMELINE = 'FETCH_PRODUCT_TIMELINE';
export const PRODUCT_TIMELINE_FETCHED = 'PRODUCT_TIMELINE_FETCHED';
export const FETCH_PRODUCT_TIMELINE_FAILED = 'FETCH_PRODUCT_TIMELINE_FAILED';

export const fetchProductTimeline = createAction(FETCH_PRODUCT_TIMELINE);
export const productTimelineFetched = createAction(PRODUCT_TIMELINE_FETCHED);
export const fetchProductTimelineFailed = createAction(FETCH_PRODUCT_TIMELINE_FAILED);

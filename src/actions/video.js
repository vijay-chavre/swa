import { createAction } from 'redux-actions';

export const FETCH_VIDEOS = 'FETCH_VIDEOS';
export const VIDEOS_FETCHED = 'VIDEOS_FETCHED';
export const FETCH_VIDEOS_FAILED = 'FETCH_VIDEOS_FAILED';
export const FETCH_CONCEPT_VIDEOS = 'FETCH_CONCEPT_VIDEOS';
export const CONCEPT_VIDEOS_FETCHED = 'CONCEPT_VIDEOS_FETCHED';


export const fetchVideos = createAction(FETCH_VIDEOS);
export const fetchConceptVideos = createAction(FETCH_CONCEPT_VIDEOS);
export const videosFetched = createAction(VIDEOS_FETCHED);
export const conceptVideosFetched = createAction(CONCEPT_VIDEOS_FETCHED);
export const fetchVideosFailed = createAction(FETCH_VIDEOS_FAILED);

export const SAVE_WATCHED_VIDEOS = 'SAVE_WATCHED_VIDEOS';
export const REMOVE_WATCHED_VIDEOS = 'REMOVE_WATCHED_VIDEOS';

export const saveWatchedVideos = createAction(SAVE_WATCHED_VIDEOS);
export const removeWatchedVideos = createAction(REMOVE_WATCHED_VIDEOS);

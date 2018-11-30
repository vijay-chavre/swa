import { createAction } from 'redux-actions';

export const FETCH_PROFICIENCY_MATRIX = 'FETCH_PROFICIENCY_MATRIX';

export const fetchProficiencyMatrix = createAction(FETCH_PROFICIENCY_MATRIX);

export const PROFICIENCY_FETCHED = 'PROFICIENCY_FETCHED';

export const proficiencyFetched = createAction(PROFICIENCY_FETCHED);

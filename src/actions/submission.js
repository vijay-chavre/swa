import { createAction } from 'redux-actions';

export const FETCH_SUBMISSION = 'FETCH_SUBMISSION';
export const SUBMISSION_FETCHED = 'SUBMISSION_FETCHED';
export const FETCH_SUBMISSION_FAILED = 'FETCH_SUBMISSION_FAILED';
export const SUBMIT_WORKSHEET = 'SUBMIT_WORKSHEET';
export const WORKSHEET_SUBMITTED = 'WORKSHEET_SUBMITTED';
export const UPDATE_STUDENT_REVIEWED_DATE = 'UPDATE_STUDENT_REVIEWED_DATE';
export const STUDENT_REVIEWED_DATE_UPDATED = 'STUDENT_REVIEWED_DATE_UPDATED';

export const fetchSubmission = createAction(FETCH_SUBMISSION);
export const submissionFetched = createAction(SUBMISSION_FETCHED);
export const fetchSubmissionFailed = createAction(FETCH_SUBMISSION_FAILED);
export const submitWorksheet = createAction(SUBMIT_WORKSHEET);
export const worksheetSubmitted = createAction(WORKSHEET_SUBMITTED);
export const updateStudentReviewedDate = createAction(UPDATE_STUDENT_REVIEWED_DATE);
export const studentReviewedDateUpdated = createAction(STUDENT_REVIEWED_DATE_UPDATED);

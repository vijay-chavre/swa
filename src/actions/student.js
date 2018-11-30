import { createAction } from 'redux-actions';

export const FETCH_STUDENT = 'FETCH_STUDENT';
export const STUDENT_FETCHED = 'STUDENT_FETCHED';
export const FETCH_STUDENT_FAILED = 'FETCH_STUDENT_FAILED';

export const fetchStudent = createAction(FETCH_STUDENT);
export const studentFetched = createAction(STUDENT_FETCHED);
export const fetchStudentFailed = createAction(FETCH_STUDENT_FAILED);

export const UPDATE_STUDENT_PLAN = 'UPDATE_STUDENT_PLAN';
export const UPDATED_STUDENT_PLAN = 'UPDATED_STUDENT_PLAN';
export const UPDATE_STUDENT_PLAN_FAILED = 'UPDATE_STUDENT_PLAN_FAILED';

export const updateStudentPlan = createAction(UPDATE_STUDENT_PLAN);
export const updatedStudentPlan = createAction(UPDATED_STUDENT_PLAN);
export const updateStudentPlanFailed = createAction(UPDATE_STUDENT_PLAN_FAILED);

export const PAUSE_SUBSCRIPTION = 'PAUSE_SUBSCRIPTION';
export const PAUSED_SUBSCRIPTION = 'PAUSED_SUBSCRIPTION';
export const PAUSE_SUBSCRIPTION_FAILED = 'PAUSE_SUBSCRIPTION_FAILED';

export const pauseSubscription = createAction(PAUSE_SUBSCRIPTION);
export const pausedSubscription = createAction(PAUSED_SUBSCRIPTION);
export const pauseSubscriptionFailed = createAction(PAUSE_SUBSCRIPTION_FAILED);

export const CANCEL_SUBSCRIPTION = 'CANCEL_SUBSCRIPTION';
export const CANCELLED_SUBSCRIPTION = 'CANCELLED_SUBSCRIPTION';
export const CANCEL_SUBSCRIPTION_FAILED = 'CANCEL_SUBSCRIPTION_FAILED';

export const cancelSubscription = createAction(CANCEL_SUBSCRIPTION);
export const cancelledSubscription = createAction(CANCELLED_SUBSCRIPTION);
export const cancelSubscriptionFailed = createAction(CANCEL_SUBSCRIPTION_FAILED);

export const CANCEL_SUBSCRIPTION_NOTIFICATION = 'CANCEL_SUBSCRIPTION_NOTIFICATION';
export const CANCEL_SUBSCRIPTION_NOTIFICATION_FAILED = 'CANCEL_SUBSCRIPTION_NOTIFICATION_FAILED';
export const CANCEL_SUBSCRIPTION_NOTIFIED = 'CANCEL_SUBSCRIPTION_NOTIFIED';

export const sendCancelNotification = createAction(CANCEL_SUBSCRIPTION_NOTIFICATION);
export const cancelSubscriptionNotified = createAction(CANCEL_SUBSCRIPTION_NOTIFIED);
export const cancelSubscriptionNotificationFailed = createAction(CANCEL_SUBSCRIPTION_NOTIFICATION_FAILED);


export const ADD_NEW_STUDENT = 'ADD_NEW_STUDENT';
export const ADDED_NEW_STUDENT = 'ADDED_NEW_STUDENT';
export const ADD_NEW_STUDENT_FAILED = 'ADD_NEW_STUDENT_FAILED';

export const addNewStudent = createAction(ADD_NEW_STUDENT);
export const addedNewStudent = createAction(ADDED_NEW_STUDENT);
export const addNewStudentFailed = createAction(ADD_NEW_STUDENT_FAILED);

export const ADDED_NEW_SUBSCRIPTION = 'ADDED_NEW_SUBSCRIPTION';
export const addedNewSubscription = createAction(ADDED_NEW_SUBSCRIPTION);

export const SAVE_STUDENT_DETAILS = 'SAVE_STUDENT_DETAILS';
export const saveStudentDetails = createAction(SAVE_STUDENT_DETAILS);

export const REMOVE_NEW_STUDENT_DETAILS = 'REMOVE_NEW_STUDENT_DETAILS';
export const removeNewStudentDetails = createAction(REMOVE_NEW_STUDENT_DETAILS);

export const FETCH_TEACHER_DETAILS = 'FETCH_TEACHER_DETAILS';
export const FETCHED_TEACHER_DETAILS = 'FETCHED_TEACHER_DETAILS';
export const FETCH_TEACHER_DETAILS_FAILED = 'FETCH_TEACHER_DETAILS_FAILED';

export const fetchTeachersDetails = createAction(FETCH_TEACHER_DETAILS);
export const fetchedTeacherDetails = createAction(FETCHED_TEACHER_DETAILS);
export const fetchTeacherDetailsFailed = createAction(FETCH_TEACHER_DETAILS_FAILED);

export const UPDATE_PAYMENT_COMPLETED_IN_NEW_STUDENT_DETAILS = 'UPDATE_PAYMENT_COMPLETED_IN_NEW_STUDENT_DETAILS';
export const updatePaymentCompletedInNewStudentDetails = createAction(UPDATE_PAYMENT_COMPLETED_IN_NEW_STUDENT_DETAILS);


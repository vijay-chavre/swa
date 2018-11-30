import { FETCH_STUDENT_FAILED, STUDENT_FETCHED,
          UPDATE_STUDENT_PLAN, UPDATED_STUDENT_PLAN, UPDATE_STUDENT_PLAN_FAILED,
          PAUSE_SUBSCRIPTION, PAUSED_SUBSCRIPTION, PAUSE_SUBSCRIPTION_FAILED,
          ADD_NEW_STUDENT, ADDED_NEW_STUDENT, ADD_NEW_STUDENT_FAILED,
          CANCEL_SUBSCRIPTION, CANCELLED_SUBSCRIPTION, CANCEL_SUBSCRIPTION_FAILED,
          ADDED_NEW_SUBSCRIPTION,
          CANCEL_SUBSCRIPTION_NOTIFICATION, CANCEL_SUBSCRIPTION_NOTIFIED,
          CANCEL_SUBSCRIPTION_NOTIFICATION_FAILED,
          SAVE_STUDENT_DETAILS, REMOVE_NEW_STUDENT_DETAILS, UPDATE_PAYMENT_COMPLETED_IN_NEW_STUDENT_DETAILS,
          FETCH_TEACHER_DETAILS, FETCHED_TEACHER_DETAILS, FETCH_TEACHER_DETAILS_FAILED,
       } from '../actions/student';
import { PRODUCT_TIMELINE_FETCHED, FETCH_PRODUCT_TIMELINE_FAILED } from '../actions/product';
import { LOG_OUT } from '../actions/session';

const initalState = {
  error: null,

  updatingStudentPlan: false,
  updatedStudentPlan: false,
  updateStudentPlanFailed: false,

  pausingSubscription: false,
  pausedSubscription: false,
  pauseSubscriptionFailed: false,

  addNewStudent: false,
  addedNewStudent: false,
  addNewStudentFailed: false,
  addedNewSubscription: false,

  cancelSubscription: false,
  cancelledSubscription: false,
  cancelSubscriptionFailed: false,

  cancelSubscriptionNotification: false,
  cancelSubscriptionNotified: false,
  cancelSubscriptionNotificationFailed: false,

  newStudentDetails: null,

  fetchTeacherDetails: false,
  fetchedTeacherDetails: false,
  fetchTeacherDetailsFailed: false,
  teacher: null,

};

export default function session(
  state = initalState,
  action
) {
  switch (action.type) {


    case FETCH_TEACHER_DETAILS:
      return {
        fetchTeacherDetails: true,
        fetchedTeacherDetails: false,
        fetchTeacherDetailsFailed: false,
        teacher: null,
      };

    case FETCHED_TEACHER_DETAILS:
      return {
        fetchTeacherDetails: false,
        fetchedTeacherDetails: true,
        fetchTeacherDetailsFailed: false,
        teacher: action.payload.data,
      };

    case FETCH_TEACHER_DETAILS_FAILED:
      return {
        fetchTeacherDetails: false,
        fetchedTeacherDetails: false,
        fetchTeacherDetailsFailed: true,
        teacher: null,
      };

    case REMOVE_NEW_STUDENT_DETAILS:
      state.newStudentDetails = null;
      return { ...state };

    case SAVE_STUDENT_DETAILS:
      state.newStudentDetails = action.payload;
      if (state.newStudentDetails) {
        state.newStudentDetails.paymentCompleted = false;
      }
      return { ...state };

    case UPDATE_PAYMENT_COMPLETED_IN_NEW_STUDENT_DETAILS:
      if (state.newStudentDetails) {
        state.newStudentDetails.paymentCompleted = true;
      }
      return { ...state };

    case STUDENT_FETCHED:
      return { ...action.payload };

    case FETCH_STUDENT_FAILED:
      return { ...state, error: action.payload };

    case PRODUCT_TIMELINE_FETCHED:
      return { ...action.payload };
    case FETCH_PRODUCT_TIMELINE_FAILED:
      return { ...state, error: action.payload };

    case UPDATE_STUDENT_PLAN:
      state.updatingStudentPlan = true;
      state.updatedStudentPlan = false;
      state.updateStudentPlanFailed = false;
      return { ...state };

    case UPDATED_STUDENT_PLAN:
      state.updatingStudentPlan = false;
      state.updatedStudentPlan = true;
      state.updateStudentPlanFailed = false;
      return { ...state };

    case UPDATE_STUDENT_PLAN_FAILED:
      state.updatingStudentPlan = false;
      state.updatedStudentPlan = false;
      state.updateStudentPlanFailed = true;
      return { ...state, error: action.payload };

    case PAUSE_SUBSCRIPTION:
      return {
        ...state,
        pausingSubscription: true,
        pausedSubscription: false,
        pauseSubscriptionFailed: false,
      };

    case PAUSED_SUBSCRIPTION:
      return {
        ...state,
        pausingSubscription: false,
        pausedSubscription: true,
        pauseSubscriptionFailed: false,
      };

    case PAUSE_SUBSCRIPTION_FAILED:
      return {
        ...state,
        pausingSubscription: false,
        pausedSubscription: false,
        pauseSubscriptionFailed: true,
      };

    case ADD_NEW_STUDENT:
      return {
        ...state,
        addNewStudent: true,
        addedNewStudent: false,
        addNewStudentFailed: false,
        addedNewSubscription: false,
      };

    case ADDED_NEW_STUDENT:
      return {
        ...state,
        addNewStudent: false,
        addedNewStudent: true,
        addNewStudentFailed: false,
      };

    case ADD_NEW_STUDENT_FAILED:
      return {
        ...state,
        addNewStudent: false,
        addedNewStudent: false,
        addNewStudentFailed: true,
        error: action.payload,
      };

    case ADDED_NEW_SUBSCRIPTION:
      return {
        ...state,
        addedNewSubscription: true,
      };

    case CANCEL_SUBSCRIPTION:
      return {
        ...state,
        cancelSubscription: true,
        cancelledSubscription: false,
        cancelSubscriptionFailed: false,
        cancelSubscriptionNotification: false,
        cancelSubscriptionNotified: false,
        cancelSubscriptionNotificationFailed: false,
      };

    case CANCEL_SUBSCRIPTION_FAILED:
      return {
        ...state,
        cancelSubscription: false,
        cancelledSubscription: false,
        cancelSubscriptionFailed: true,
        cancelSubscriptionNotification: false,
        cancelSubscriptionNotified: false,
        cancelSubscriptionNotificationFailed: false,
      };

    case CANCELLED_SUBSCRIPTION:
      return {
        ...state,
        cancelSubscription: false,
        cancelledSubscription: true,
        cancelSubscriptionFailed: false,
        cancelSubscriptionNotification: false,
        cancelSubscriptionNotified: false,
        cancelSubscriptionNotificationFailed: false,
      };

    case CANCEL_SUBSCRIPTION_NOTIFICATION:
      return {
        ...state,
        cancelSubscriptionNotification: true,
        cancelSubscriptionNotified: false,
        cancelSubscriptionNotificationFailed: false,
        cancelSubscription: false,
        cancelledSubscription: false,
        cancelSubscriptionFailed: false,
      };

    case CANCEL_SUBSCRIPTION_NOTIFICATION_FAILED:
      return {
        ...state,
        cancelSubscriptionNotification: false,
        cancelSubscriptionNotified: false,
        cancelSubscriptionNotificationFailed: true,
        cancelSubscription: false,
        cancelledSubscription: false,
        cancelSubscriptionFailed: false,
      };

    case CANCEL_SUBSCRIPTION_NOTIFIED:
      state.doNotShowPopup = action.payload.doNotShowPopup;
      return {
        ...state,
        cancelSubscriptionNotification: false,
        cancelSubscriptionNotified: true,
        cancelSubscriptionNotificationFailed: false,
        cancelSubscription: false,
        cancelledSubscription: false,
        cancelSubscriptionFailed: false,
      };

    case LOG_OUT:
      return initalState;

    default:
      return state;
  }
}

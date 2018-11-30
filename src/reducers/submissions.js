import { SUBMISSION_FETCHED, STUDENT_REVIEWED_DATE_UPDATED } from '../actions/submission';
import { LOG_OUT } from '../actions/session';

const initalState = {
};

export default function session(
  state = initalState,
  action
) {
  switch (action.type) {
    case SUBMISSION_FETCHED: {
      const newSubmission = {};
      newSubmission[action.payload._id] = action.payload;
      return { ...state, ...newSubmission };
    }

    case STUDENT_REVIEWED_DATE_UPDATED: {
      return { ...state, ...action.payload };
    }

    case LOG_OUT:
      return initalState;

    default:
      return state;
  }
}

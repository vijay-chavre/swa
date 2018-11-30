import { FETCHED_TUTORING_SESSIONS } from '../actions/tutoringSessions';
import { LOG_OUT } from '../actions/session';

const initalState = [];

export default function session(
  state = initalState,
  action
) {
  switch (action.type) {
    case FETCHED_TUTORING_SESSIONS:
      return action.payload;

    case LOG_OUT:
      return initalState;
    default:
      return state;
  }
}

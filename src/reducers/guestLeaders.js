import { GUEST_LEADERS_FETCHED, FETCH_GUEST_LEADERS_FAILED } from '../actions/leaders';
import { LOG_OUT } from '../actions/session';

const initalState = {
  error: null,
};

export default function session(
  state = initalState,
  action
) {
  switch (action.type) {
    case GUEST_LEADERS_FETCHED:
      return { ...state, ...action.payload };

    case FETCH_GUEST_LEADERS_FAILED:
      return { ...state, error: action.payload };

    case LOG_OUT:
      return initalState;

    default:
      return state;
  }
}
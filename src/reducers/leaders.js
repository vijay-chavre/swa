import { FETCH_LEADERS_FAILED, LEADER_FETCHED } from '../actions/leaders';
import { LOG_OUT } from '../actions/session';

const initalState = {
  error: null,
};

export default function session(
  state = initalState,
  action
) {
  switch (action.type) {
    case LEADER_FETCHED:
      return { ...state, ...action.payload };

    case FETCH_LEADERS_FAILED:
      return { ...state, error: action.payload };

    case LOG_OUT:
      return initalState;

    default:
      return state;
  }
}
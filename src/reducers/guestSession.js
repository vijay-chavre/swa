import { GUEST_TOKEN_FETCHED, FETCH_GUEST_TOKEN_FAILED, CLEAR_GUEST_TOKEN } from '../actions/guestSession';
import { LOG_OUT } from '../actions/session';

const initalState = {
  error: null,
};

export default function session(
  state = initalState,
  action
) {
  switch (action.type) {
    case GUEST_TOKEN_FETCHED: {
      return { ...state, ...action.payload };
    }

    case FETCH_GUEST_TOKEN_FAILED: {
      return { ...state, error: action.payload };
    }
    case CLEAR_GUEST_TOKEN: {
      return initalState;
    }
    case LOG_OUT:
      return initalState;

    default:
      return state;
  }
}

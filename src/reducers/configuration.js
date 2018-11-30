import { FETCHED_CONFIGURATION, FETCH_CONFIGURATION_FAILED } from '../actions/configuration';
import { LOG_OUT } from '../actions/session';

const initalState = {
  error: null,
};

export default function session(
  state = initalState,
  action
) {
  switch (action.type) {
    case FETCHED_CONFIGURATION: {
      return { ...state, ...action.payload };
    }
    case FETCH_CONFIGURATION_FAILED:
      return { ...state, error: action.payload };

    case LOG_OUT:
      return initalState;

    default:
      return state;
  }
}

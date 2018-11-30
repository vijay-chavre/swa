import { FETCH_ADDONS, FETCHED_ADDONS, FETCH_FAILED_ADDONS } from '../actions/addon';
import { LOG_OUT } from '../actions/session';

const initalState = {
  error: null,
};

export default function session(
  state = initalState,
  action
) {
  switch (action.type) {

    case FETCHED_ADDONS:
      
      var addons = state;
      addons.addons = action.payload;
      
      return { ...state };

    case FETCH_FAILED_ADDONS:
      return { ...state, error: action.payload };

    case LOG_OUT:
      return initalState;

    default:
      return state;
  }
}

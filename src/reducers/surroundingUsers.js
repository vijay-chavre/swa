import { FETCH_SURROUNDING_USERS_FAILED, SURROUNDING_USERS_FETCHED } from '../actions/surroundingUsers';
import { LOG_OUT } from '../actions/session';

const initalState = {
  error: null,
  imageUrl:'',
};

export default function session(
  state = initalState,
  action
) {
  switch (action.type) {
    case SURROUNDING_USERS_FETCHED:
      return { ...state, ...action.payload };

    case FETCH_SURROUNDING_USERS_FAILED:
      return { ...state, error: action.payload };

    case LOG_OUT:
      return initalState;

    default:
      return state;
  }
}
/* Event Actions */
import { POLA_EVENT_CREATE, TRACKING_EVENT_CREATE } from '../actions/event';
import { LOG_OUT } from '../actions/session';

/* Initial State */
const initalState = {
};

/* Process Events */
export default function event(
  state = initalState,
  action
) {
  switch (action.type) {
    case POLA_EVENT_CREATE: {
      return { ...state, ...action.payload };
    }
    case TRACKING_EVENT_CREATE: {
      return { ...state, ...action.payload };
    }
    case LOG_OUT:
      return initalState;

    default:
      return state;
  }
}

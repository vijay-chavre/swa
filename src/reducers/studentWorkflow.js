import { WORKFLOW_COMPLETED } from '../actions/studentWorkflow';
import { LOG_OUT } from '../actions/session';

const initalState = {
  error: null,
};

export default function session(
  state = initalState,
  action
) {
  switch (action.type) {
    case WORKFLOW_COMPLETED: {
      const newWorkflow = {};
      newWorkflow[action.payload.key] = action.payload.value;
      return { ...state, ...newWorkflow };
    }
    case LOG_OUT:
      return initalState;

    default:
      return state;
  }
}

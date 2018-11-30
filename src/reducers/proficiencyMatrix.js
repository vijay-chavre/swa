import { PROFICIENCY_FETCHED } from '../actions/proficiencyMatrix';
import { LOG_OUT } from '../actions/session';

const initalState = {
};

const reducer = (state = initalState, action) => {
  switch (action.type) {
    case PROFICIENCY_FETCHED: {
      const proficiency = {};
      proficiency[action.payload.studentId] = action.payload.data;
      return { ...state, ...proficiency };
    }
    case LOG_OUT:
      return initalState;
    default:
      return state;
  }
};

export default reducer;

/* Event Actions */
import { FETCHED_GRADES_FOR_COUNTRY, FETCH_GRADES_FOR_COUNTRY_FAILED } from '../actions/common';
import { LOG_OUT } from '../actions/session';

/* Initial State */
const initalState = {
  grades: null,
};

/* Process Events */
export default function event(
  state = initalState,
  action
) {
  switch (action.type) {
    case FETCHED_GRADES_FOR_COUNTRY: {
      state.grades = action.payload.data;

      if (state.grades && state.grades.grades) {
          let keys = [];
          let labels = [];
          for (let i = state.grades.grades.length - 1; i >= 0; i--) {
              let obj = state.grades.grades[i];
              let key = Object.keys(obj)[0];
              keys.push(key);
              labels.push(state.grades.grades[i][key]);
            }
            state.grades.keys = keys;
          state.grades.labels = labels;
        }

      return { ...state };
    }
    case FETCH_GRADES_FOR_COUNTRY_FAILED: {
      state.grades = null;
      return { ...state };
    }
    case LOG_OUT:
      return initalState;

    default:
      return state;
  }
}

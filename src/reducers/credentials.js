import {
    UPDATE_PASSWORD, UPDATE_PASSWORD_FAILED, UPDATED_PASSWORD,
    RESET_PASSWORD, RESET_PASSWORD_COMPLETE, RESET_PASSWORD_FAILED,
} from '../actions/credentials';
import { LOG_OUT } from '../actions/session';

const initalState = {
  updatePassword: false,
  updatedPassword: false,
  updatePasswordFailed: false,

  resetPassword: false,
  resetPasswordComplete: false,
  resetPasswordFailed: false,

  error: null,
};

export default function session(
    state = initalState,
    action
) {
  switch (action.type) {

    case UPDATED_PASSWORD:
      return {
        ...state,
        updatePassword: false,
        updatedPassword: true,
        updatePasswordFailed: false,
      };
    case UPDATE_PASSWORD:
      return {
        ...state,
        updatePassword: true,
        updatedPassword: false,
        updatePasswordFailed: false,
      };

    case UPDATE_PASSWORD_FAILED:
      const data = action.payload;
      return {
        ...state,
        updatePassword: false,
        updatedPassword: false,
        updatePasswordFailed: true,
        error: (data ? data.error : 'An error occured. Password could not be reset. Please try again later.'),
      };

    case RESET_PASSWORD:
      return {
        ...state,
        resetPassword: true,
        resetPasswordComplete: false,
        resetPasswordFailed: false,
      };

    case RESET_PASSWORD_COMPLETE:
      return {
        ...state,
        resetPassword: false,
        resetPasswordComplete: true,
        resetPasswordFailed: false,
      };

    case RESET_PASSWORD_FAILED:
      return {
        ...state,
        resetPassword: false,
        resetPasswordComplete: false,
        resetPasswordFailed: true,
      };

    case LOG_OUT:
      return initalState;

    default:
      return state;
  }
}

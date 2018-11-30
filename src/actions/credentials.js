import { createAction } from 'redux-actions';


// to update pwd

export const UPDATE_PASSWORD = 'UPDATE_PASSWORD';
export const UPDATED_PASSWORD = 'UPDATED_PASSWORD';
export const UPDATE_PASSWORD_FAILED = 'UPDATE_PASSWORD_FAILED';

export const updatePassword = createAction(UPDATE_PASSWORD);
export const updatedPassword = createAction(UPDATED_PASSWORD);
export const updatePasswordFailed = createAction(UPDATE_PASSWORD_FAILED);

// to request reset pwd

export const RESET_PASSWORD = 'RESET_PASSWORD';
export const RESET_PASSWORD_COMPLETE = 'RESET_PASSWORD_COMPLETE';
export const RESET_PASSWORD_FAILED = 'RESET_PASSWORD_FAILED';

export const resetPassword = createAction(RESET_PASSWORD);
export const resetPasswordComplete = createAction(RESET_PASSWORD_COMPLETE);
export const resetPasswordFailed = createAction(RESET_PASSWORD_FAILED);

import { createAction } from 'redux-actions';


//to create client token

export const UPDATE_PAYMENT_INFO = 'UPDATE_PAYMENT_INFO';
export const UPDATED_PAYMENT_INFO = 'UPDATED_PAYMENT_INFO';
export const UPDATE_PAYMENT_INFO_FAILED = 'UPDATE_PAYMENT_INFO_FAILED';

export const updatePaymentInfo = createAction(UPDATE_PAYMENT_INFO);
export const updatedPaymentInfo = createAction(UPDATED_PAYMENT_INFO);
export const updatePaymentInfoFailed = createAction(UPDATE_PAYMENT_INFO_FAILED);
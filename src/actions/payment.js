import { createAction } from 'redux-actions';

export const PAYMENT_REQUESTING = 'PAYMENT_REQUESTING';
export const PAYMENT_ERROR = 'PAYMENT_ERROR';
export const PAYMENT_SUCCESS = 'PAYMENT_SUCCESS';

export const paymentRequesting = createAction(PAYMENT_REQUESTING);
export const paymentError = createAction(PAYMENT_ERROR);
export const paymentSuccess = createAction(PAYMENT_SUCCESS);

export const UPDATED_SUBSCRIPTION = 'UPDATED_SUBSCRIPTION';
export const updatedSubscription = createAction(UPDATED_SUBSCRIPTION);

export const VERIFY_CODE = 'VERIFY_CODE';
export const VERIFIED_CODE = 'VERIFIED_CODE';
export const VERIFY_CODE_FAILED = 'VERIFY_CODE_FAILED';

export const verifyReferralCode = createAction(VERIFY_CODE);
export const verifiedReferralCode = createAction(VERIFIED_CODE);
export const verifyReferralCodeFailed = createAction(VERIFY_CODE_FAILED);

export const PAYMENT_SUBMIT = 'PAYMENT_SUBMIT';
export const submitPayment = createAction(PAYMENT_SUBMIT);

export const RESET_DATA = 'RESET_DATA';
export const resetPayment = createAction(RESET_DATA);

export const SET_LOADING_FOR_PAYMENT = 'SET_LOADING_FOR_PAYMENT';
export const setLoadingForPayment = createAction(SET_LOADING_FOR_PAYMENT);

export const PAYPAL_REQUESTING = 'PAYPAL_REQUESTING';
export const PAYPAL_ERROR = 'PAYPAL_ERROR';
export const PAYPAL_SUCCESS = 'PAYPAL_SUCCESS';

export const paypalRequesting = createAction(PAYPAL_REQUESTING);
export const paypalError = createAction(PAYPAL_ERROR);
export const paypalSuccess = createAction(PAYPAL_SUCCESS);


import { PAYMENT_ERROR, PAYMENT_REQUESTING, PAYMENT_SUCCESS, UPDATED_SUBSCRIPTION, RESET_DATA,
         SET_LOADING_FOR_PAYMENT, VERIFIED_CODE, VERIFY_CODE, VERIFY_CODE_FAILED,
         PAYPAL_ERROR, PAYPAL_REQUESTING, PAYPAL_SUCCESS
       } from '../actions/payment';

import { LOG_OUT } from '../actions/session';

const defaultState = {
  error: null,
  creditCards: null,
  requesting: false,
  paymentSuccess: false,
  updatedSub: false,
  isLoading: false,
};

export default function payment(
  state = defaultState,
  action
) {
  switch (action.type) {

    case SET_LOADING_FOR_PAYMENT:
      return {
        ...state,
        isLoading: action.isLoading,
      };
    case VERIFY_CODE:
      return {
        ...state,
        verifyCode: true,
        verifyCodeFailed: false,
        verifiedCode: false,
        data: null,
      };

    case VERIFY_CODE_FAILED:
      return {
        ...state,
        verifyCode: false,
        verifyCodeFailed: true,
        verifiedCode: false,
        data: action.payload,
      };

    case VERIFIED_CODE:
      return {
        ...state,
        verifyCode: false,
        verifyCodeFailed: false,
        verifiedCode: true,
        data: action.payload,
      };

    case PAYMENT_ERROR:
      return { ...state, error: action.payload, requesting: false, updatedSub: false };

    case PAYMENT_REQUESTING:
      return { ...state, error: null, requesting: true, paymentSuccess: false, updatedSub: false };

    case PAYMENT_SUCCESS:
      return { ...state, creditCards: action.payload, error: null, requesting: false, paymentSuccess: true };

    case PAYPAL_ERROR:
      return { ...state, paypalError: action.payload, paypalRequesting: false };

    case PAYPAL_REQUESTING:
      return { ...state, paypalError: null, paypalRequesting: true };

    case PAYPAL_SUCCESS:
      return { ...state, paypals: action.payload, error: null, paypalRequesting: false };


    case UPDATED_SUBSCRIPTION:
      return { ...state, updatedSub: true };
    
    case RESET_DATA:
      return defaultState;
    
    case LOG_OUT:
      return defaultState;

    default:
      return state;
  }
}

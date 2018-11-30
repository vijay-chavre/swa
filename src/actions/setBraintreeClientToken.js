import { createAction } from 'redux-actions';

export const SET_BRAINTREE_CLIENT_TOKEN = 'SET_BRAINTREE_CLIENT_TOKEN';

export const setBraintreeClientToken = createAction(SET_BRAINTREE_CLIENT_TOKEN);

export const GET_BRAINTREE_CLIENT_TOKEN = 'GET_BRAINTREE_CLIENT_TOKEN';

export const getBraintreeClientToken = createAction(GET_BRAINTREE_CLIENT_TOKEN);

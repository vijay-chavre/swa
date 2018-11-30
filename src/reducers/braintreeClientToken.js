import { SET_BRAINTREE_CLIENT_TOKEN } from '../actions/setBraintreeClientToken';

type BraintreeClientTokenState = ?string;

export default function sessionToken(
  state: ?BraintreeClientTokenState = null,
  action
) {
  switch (action.type) {
    case SET_BRAINTREE_CLIENT_TOKEN:
      return action.payload;

    default:
      return state;
  }
}

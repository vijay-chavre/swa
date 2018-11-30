import { SET_NONCE } from '../actions/setNonce';

export default function nonce(
  state = null,
  action
) {
  switch (action.type) {
    case SET_NONCE:
      return action.payload;
    default:
      return state;
  }
}
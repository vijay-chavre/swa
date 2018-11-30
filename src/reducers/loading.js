const initalState = {
  isLoading: false,
};

export default function session(
  state = initalState,
  action
) {
  switch (action.type) {
    case 'SET_LOADING':
      return { isLoading: action.isLoading };

    default:
      return state;
  }
}

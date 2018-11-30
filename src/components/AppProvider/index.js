import React, { Component } from 'react';
import { persistStore } from 'redux-persist';
import { Provider } from 'react-redux';
import Router from '../Router';
import configureStore from '../../store';

const store = window.store = configureStore();

export default class AppProvider extends Component {

  constructor() {
    super();
    this.state = { rehydrated: false };
  }

  componentWillMount() {
    persistStore(store, {}, () => {
      this.setState({ rehydrated: true });
    });
  }

  render() {
    if (!this.state.rehydrated) {
      return (<div>Loading...</div>);
    }
    return (
      <Provider store={store}>
        <Router store={store} />
      </Provider>
    );
  }
}

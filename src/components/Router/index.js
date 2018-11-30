import React from 'react';
import { Router, browserHistory } from 'react-router';
import getRoutes from './routes';

export default (props) => (
  <Router history={browserHistory}>
    {getRoutes(props.store)}
  </Router>
);

/* global document */
import React from 'react';
import ReactDOM from 'react-dom';
import LogRocket from 'logrocket';
import AppProvider from './components/AppProvider';

LogRocket.init('xp2t4w/student-web-app', {
  network: {
    requestSanitizer(request) {
      // if the url contains 'ignore'
      if (request.url.toLowerCase().indexOf('braintree') !== -1) {
        // scrub out the body
        request.body = null;
      }
      return request;
    },
  },
});

require('babel-core/register');

ReactDOM.render(
  <AppProvider />,
  document.getElementById('root'),
);


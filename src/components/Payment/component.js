import React from 'react';
import ThinksterFormPage from '../ThinksterFormPage';
import PaymentDetails from './components/PaymentDetails';

export default (props) => (
  <div>
    <ThinksterFormPage
      mainItem={(
        <PaymentDetails {...props} />
      )}
      title="Enroll in Thinkster Math"
    />
  </div>
);

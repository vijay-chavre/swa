import React from 'react';
import { Field, reduxForm } from 'redux-form';
import * as Localization from '../Shared/Localization';

/**
 * Login Redux form component
 */

export const formName = 'resetForm';

// Initialize with material ui components
const renderTextField = ({ input, label, meta: { touched, error }, ...custom }) => (
  <input
    placeholder={label}
    errorText={touched && error}
    {...input}
    {...custom}
  />
);
const ResetForm = props => {
  const { handleSubmit, reset, submitting, session } = props;
  return (
    <form autoComplete="off" onSubmit={handleSubmit} className="o-loginBox__form">

    <p className="a-p(14) o-loginBox__instructions">
        {Localization.localizedStringForKey('Use the form below to reset your password.')}
      </p>
      <div className="o-loginBox__formFields o-loginBox__formFields--reset">
        <label className="b-textInput b-textInput--hasValue">
          <Field name="email" autoComplete="off" component={renderTextField} type="text" label="Email" className="b-textInput__input" />
          <span className="b-textInput__label">
            {Localization.localizedStringForKey('Email Address')}
          </span>
        </label>
      </div>
      <div className="o-loginBox__actions">
        <button className="b-flatBtn b-flatBtn--fullWidth b-flatBtn--large" title="Reset My Password">
          <span className="b-button__label">
            {Localization.localizedStringForKey('Reset Password')}
          </span>
        </button>
      </div>

    </form>
  );
};

// Decorate the form component
export default reduxForm({
  form: formName, // a unique name for this form
})(ResetForm);

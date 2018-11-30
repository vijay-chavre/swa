import React from 'react';
import { Link } from 'react-router';
import { Field, reduxForm } from 'redux-form';
import * as Localization from '../Shared/Localization';

/**
 * Login Redux form component
 */

export const formName = 'loginForm';

// Initialize with material ui components
const renderTextField = ({ input, label, askPasswordOnly, username, meta: { touched, error }, ...custom }) => (
  <input
    placeholder={label}
    value={askPasswordOnly ? username : ""}
    {...input}
    {...custom}
  />
);
const LoginForm = props => {
  const { handleSubmit, reset, submitting, session, askPasswordOnly, username, authenticationError } = props;
  return (
    <form autoComplete="off" onSubmit={handleSubmit} className="o-loginBox__form">

      <div className="o-loginBox__formFields">
        <label className="b-textInput b-textInput--hasValue">
          <Field name="username" autocapitalize="off" autocorrect="off" autoComplete="off" component={renderTextField} type="text" label="Email" className="b-textInput__input " askPasswordOnly={askPasswordOnly} username={username} />
          <span className="b-textInput__label">
            {Localization.localizedStringForKey('User Name / Email')}
          </span>
        </label>
        <label className="b-textInput b-textInput--hasValue">
          <Field name="password" autoComplete="off" component={renderTextField} type="password" label="Password" className="b-textInput__input" />
          <span className="b-textInput__label">
            {Localization.localizedStringForKey('Password')}
          </span>
        </label>
      </div>
      {authenticationError ? <div className="o-loginBox__msg a-p(12) a-color(alert)">
        {Localization.localizedStringForKey('The username or password is incorrect. Please check the information you entered.')}
      </div> : ''}
      <div className="o-loginBox__actions">

        <button className="b-button--fullWidth" title={(askPasswordOnly ? 'Ok' : 'Log In')} type="submit" disabled={submitting}>
          <span className="b-flatBtn b-flatBtn--gradient(active-1) b-flexBtn--large">
            <span className="b-button__label">
              {Localization.localizedStringForKey(askPasswordOnly ? 'Ok' : 'Log In')}
            </span>
          </span>
        </button>
      </div>

    </form>
  );
};

// Decorate the form component
export default reduxForm({
  form: formName, // a unique name for this form
})(LoginForm);

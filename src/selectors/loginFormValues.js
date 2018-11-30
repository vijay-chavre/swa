import { getFormValues } from 'redux-form';
import { formName as loginFormName } from '../components/Login/LoginForm';

export default function loginFormValues(state) {
  return getFormValues(loginFormName)(state);
}

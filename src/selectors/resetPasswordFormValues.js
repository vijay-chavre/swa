import { getFormValues } from 'redux-form';
import { formName as resetFormName } from '../components/PWReset/ResetForm';

export default function resetPasswordFormValues(state) {
  return getFormValues(resetFormName)(state);
}

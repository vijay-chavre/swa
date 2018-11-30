import { getFormValues } from 'redux-form';
import { formName as paymentInformationFormName } from '../components/Payment/components/PaymentDetails';

export default function paymentInformationFormValues(state) {
  return getFormValues(paymentInformationFormName)(state);
}

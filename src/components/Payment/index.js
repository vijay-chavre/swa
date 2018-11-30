import { connect } from 'react-redux';
import Component from './component';
import enroll from '../../actions/enroll';
import * as BraintreeActions from '../../actions/setBraintreeClientToken';
import * as PaymentActions from '../../actions/payment';
import * as UserActions from '../../actions/user';
import paypal from '../../actions/paypal';
import selectGeoLocation from '../../selectors/geoLocation';
import setNonce from '../../actions/setNonce';

const mapStateToProps = (state) => ({
  selectedPlans: state.selectedPlans,
  selectedService: state.selectedService,
  students: state.students,
  cart: state.cart,
  plans: state.plans,
  totals: state.totals,
  payment: state.payment,
  loading: state.loading,
  session: state.session,
  user: state.user,
  clientToken: state.braintreeClientToken,
  geoLocation: selectGeoLocation(state)
});

const actionCreators = {
  onSubmit: enroll,
  getBraintreeClientToken: BraintreeActions.getBraintreeClientToken,
  resetPayment: PaymentActions.resetPayment,
  verifyReferralCode: PaymentActions.verifyReferralCode,
  updateReferralCode: UserActions.updateReferralCode,
  resetUpdateCodeState: UserActions.resetUpdateCodeState,
  onPaypalSubmit: paypal,
  setNonce: setNonce
};

export default connect(
  mapStateToProps,
  actionCreators,
)(Component);

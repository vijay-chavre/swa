import { effects } from 'redux-saga';
import handleError from './handleError';
import logActions from './logActions';
import submitLoginForm from './submitLoginForm';
import fetchUser from './fetchUser';
import fetchVideos from './fetchVideos';
import fetchConfiguration from './fetchConfiguration';
import fetchUserPlans from './fetchUserPlans';
import fetchStudentTimeline from './fetchStudentTimeline';
import fetchProductTimeline from './fetchProductTimeline';
import fetchSubmission from './fetchSubmission';
import submitWorksheet from './submitWorksheet';
import fetchProficiencyMatrix from './fetchProficiencyMatrix';
import leaders from './fetchLeaders';
import surroudingUsers from './fetchSurroundingUsers';
import validateToken from './validateToken';
import fetchLeadersForGuestUser from './fetchLeadersForGuestUser';
import fetchUserServiceLevels from './fetchUserServiceLevels';
import fetchUserPaymentStatus from './fetchUserPaymentStatus';
import fetchAddons from './fetchAddons';
import updateStudentPlan from './updateStudentPlan';
import createPolaEvent from './createPolaEvent';
import createTrackingEvent from './createTrackingEvent';
import pauseSubscription from './pauseSubscription';
import cancelSubscription from './cancelSubscription';
import addNewStudent from './addNewStudent';
import checkPassword from './checkPassword';
import fetchGradesForCountry from './fetchGradesForCountry';
import sendCancelNotification from './sendCancelNotification';
import submitPayment from './submitPayment';
import logWhiteboardSession from './logWhiteboardSession';
import createZendeskTicket from './createZendeskTicket';
import fetchTeachersDetails from './fetchTeachersDetails';
import fetchGuestSession from './fetchGuestSession';
import fetchGeoLocation from './fetchGeoLocation';
import getBraintreeClientToken from './getBraintreeClientToken';
import sendMail from './sendMail';
import updatePassword from './updatePassword';
import resetPassword from './resetPassword';
import verifyReferralCode from './verifyReferralCode';
import updateReferralCode from './updateReferralCode';
import updateStudentReviewedDate from './updateStudentReviewedDate';
import fetchReferrals from './fetchReferrals';
import setBrainTreeToken from './setBrainTreeToken';
import paypal from './paypal';
import fetchConceptVideos from './fetchConceptVideos';
import fetchTutoringSessions from './fetchTutoringSessions';


// Removed logActions, - Nikhil, Add if needed after handleError
//import updatePaymentInfo from './updatePaymentInfo';

const allSagas = [
  handleError,
  logActions,
  submitLoginForm,
  fetchUser,
  fetchVideos,
  fetchConfiguration,
  fetchUserPlans,
  fetchStudentTimeline,
  fetchProductTimeline,
  fetchSubmission,
  submitWorksheet,
  fetchProficiencyMatrix,
  leaders,
  surroudingUsers,
  validateToken,
  fetchLeadersForGuestUser,
  fetchUserServiceLevels,
  fetchUserPaymentStatus,
  fetchAddons,
  updateStudentPlan,
  createPolaEvent,
  createTrackingEvent,
  //updatePaymentInfo,
  pauseSubscription,
  cancelSubscription,
  addNewStudent,
  checkPassword,
  fetchGradesForCountry,
  sendCancelNotification,
  submitPayment,
  logWhiteboardSession,
  createZendeskTicket,
  fetchTeachersDetails,
  fetchGuestSession,
  fetchGeoLocation,
  getBraintreeClientToken,
  sendMail,
  updatePassword,
  resetPassword,
  verifyReferralCode,
  updateReferralCode,
  updateStudentReviewedDate,
  fetchReferrals,
  setBrainTreeToken,
  paypal,
  fetchConceptVideos,
  fetchTutoringSessions,
];

export default function* rootSaga() {
  yield allSagas.map(saga => effects.fork(saga));
}

import { combineReducers } from 'redux';
import { reducer as form } from 'redux-form';
import session from './session';
import loading from './loading';
import user from './user';
import video from './video';
import configuration from './configuration';
import student from './student';
import submissions from './submissions';
import proficiencyMatrix from './proficiencyMatrix';
import leaders from './leaders';
import surroudingUsers from './surroundingUsers';
import guestLeaders from './guestLeaders';
import addons from './addons';
import studentWorkflow from './studentWorkflow';
import event from './event';
import common from './common';
import braintreeClientToken from './braintreeClientToken';
import zendesk from './zendesk';
import payment from './payment';
import guestSession from './guestSession';
import geoLocation from './geoLocation';
import mail from './mail';
import credentials from './credentials';
import nonce from './nonce';
import tutoringSessions from './tutoringSessions';

export default combineReducers({
  form,
  session,
  loading,
  user,
  student,
  submissions,
  proficiencyMatrix,
  leaders,
  surroudingUsers,
  video,
  guestLeaders,
  addons,
  studentWorkflow,
  event,
  configuration,
  common,
  braintreeClientToken,
  zendesk,
  payment,
  guestSession,
  geoLocation,
  mail,
  credentials,
  nonce,
  tutoringSessions,
});

import LogRocket from 'logrocket';

import {
  FETCH_USER, FETCH_USER_FAILED, USER_FETCHED, USER_PLANS_FETCHED, USER_PLANS_FETCH_FAILED,
  USER_SERVICE_LEVELS_FETCHED, USER_SERVICE_LEVELS_FETCH_FAILED,
  FETCHED_PAYMENT_STATUS_FOR_USER, FETCH_PAYMENT_STATUS_FOR_USER, FETCH_FAILED_PAYMENT_STATUS_FOR_USER,
  UPDATE_REFERRAL_CODE, UPDATE_REFERRAL_CODE_COMPLETE, UPDATE_REFERRAL_CODE_FAILED, RESET_UPDATE_CODE_ERRORS,
  FETCH_REFERRALS, FETCH_REFERRALS_FAILED, FETCH_REFERRALS_COMPLETE,
} from '../actions/user';
import { LOG_OUT } from '../actions/session';

const initalState = {
  error: null,

  fetchUserFailed: false,
  fetchUserPaymentStatusFailed: false,

  updateReferralCode: false,
  updatedReferralCode: false,
  updateReferralCodeFailed: false,

  fetchingReferrals: false,
  fetchingReferralsFailed: false,
  fetchingReferralsComplete: false,
  referrals: null,
};

export default function session(
  state = initalState,
  action
) {
  switch (action.type) {

    case FETCH_REFERRALS:
      return {
        ...state,
        fetchingReferrals: true,
        fetchingReferralsFailed: false,
        fetchingReferralsComplete: false,
        referrals: null,
      };
    case FETCH_REFERRALS_FAILED:
      return {
        ...state,
        fetchingReferrals: false,
        fetchingReferralsFailed: true,
        fetchingReferralsComplete: false,
        referrals: null,
      };
    case FETCH_REFERRALS_COMPLETE:
      return {
        ...state,
        fetchingReferrals: false,
        fetchingReferralsFailed: false,
        fetchingReferralsComplete: true,
        referrals: action.payload,
      };

    case UPDATE_REFERRAL_CODE:
      return {
        ...state,
        updateReferralCode: true,
        updatedReferralCode: false,
        updateReferralCodeFailed: false,

      };
    case UPDATE_REFERRAL_CODE_COMPLETE:
      return {
        ...state,
        updateReferralCode: false,
        updatedReferralCode: true,
        updateReferralCodeFailed: false,

      };
    case UPDATE_REFERRAL_CODE_FAILED:
      return {
        ...state,
        updateReferralCode: false,
        updatedReferralCode: false,
        updateReferralCodeFailed: true,

      };

    case RESET_UPDATE_CODE_ERRORS:
      return {
        ...state,
        updateReferralCode: false,
        updatedReferralCode: false,
        updateReferralCodeFailed: false,

      };

    case FETCH_USER:
      return { ...state, ...action.payload };

    case USER_FETCHED:
      try {
        // LogRocket.identify(action.payload.id, {
        //   ...action.payload,
        //   email: action.payload.email_address,
        //   name: `${action.payload.first_name} ${action.payload.last_name}`,
        // });
        // This is an example script - don't forget to change it!
        // if (typeof FS !== 'undefined') {
        //   FS.identify(action.payload.id, {
        //     displayName: `${action.payload.first_name} ${action.payload.last_name}`,
        //     email: action.payload.email_address,
        //     registrationSource_str: action.payload.registration_source,
        //     registrationIp_str: action.payload.registration_ip,
        //     phone_str: action.payload.phone,
        //     role_str: action.payload.role,
        //     type_str: action.payload.type,
        //     isActive_bool: action.payload.is_active,
        //     dateCreated_date: new Date(action.payload.date_created),
        //     startDate_date: new Date(action.payload.start_date),
        //     endDate_date: new Date(action.payload.end_date),
        //     trialUsed_str: action.payload.trial_used,
        //     createdFromUserAgent_str: action.payload.created_from_user_agent,
        //     registrationFlowId_str: action.payload.registration_flow_id,
        //     countryCode_str: action.payload.country_code,
        //     cityName_str: action.payload.city_name,
        //     deviceInfo_str: action.payload.device_info,
        //     paymentSetupDate_date: new Date(action.payload.payment_setup_date),
        //     paymentStartDate_date: new Date(action.payload.payment_start_date),
        //     subscriptionStatus_str: action.payload.subscription_status,
        //     subscriptionId_str: action.payload.subscription_id,
        //   });
        // }
        if (typeof mixpanel !== 'undefined') {
          mixpanel.identify(action.payload.email_address);
          mixpanel.people.set({
            $email: action.payload.email_address,
            $created: action.payload.date_created,
            $first_name: action.payload.first_name,
            $last_name: action.payload.last_name,
            $phone: action.payload.phone,
            $last_login: new Date(),
            'Last Login Device': 'Web',
          });
        }
      } catch (e) {
        console.log(e);
      }
      state.fetchedUser = true;
      state.fetchUserFailed = false;
      return { ...state, ...action.payload };

    case FETCH_USER_FAILED:
      state.fetchedUser = false;
      state.fetchUserFailed = true;
      return { ...state, error: action.payload };

    case USER_PLANS_FETCHED:
      var user = state;
      var students = Object.keys(user.students);
      state.planDetails = {};
      for (var i = students.length - 1; i >= 0; i--) {
        if (user.students[students[i]].braintree) {
          const addon = user.students[students[i]].braintree.addon_id;
          for (var j = action.payload.data.length - 1; j >= 0; j--) {
            if (action.payload.data[j]._id == addon) {
              state.planDetails[students[i]] = action.payload.data[j];
            }
          }
        }
      }
      console.log('Plan details');
      console.log(JSON.stringify(state.planDetails));
      return { ...state };

    case USER_PLANS_FETCH_FAILED:
      return { ...state, error: action.payload };

    case USER_SERVICE_LEVELS_FETCHED:
      var user = state;
      var students = Object.keys(user.students);

      for (var i = students.length - 1; i >= 0; i--) {
        for (var j = action.payload.length - 1; j >= 0; j--) {
          if (action.payload[j].id == students[i]) {
            user.students[students[i]].serviceLevel = action.payload[j];
          }
        }
      }
      return { ...state };

    case USER_SERVICE_LEVELS_FETCH_FAILED:
      return { ...state, error: action.payload };
    case FETCH_PAYMENT_STATUS_FOR_USER:
      if (action.payload && action.payload.fetchSynchronously) {
        state.fetchedPaymentStatus = false;
      }

      state.fetchUserPaymentStatusFailed = false;
      return { ...state };
    case FETCHED_PAYMENT_STATUS_FOR_USER:
      try {
        if (typeof mixpanel !== 'undefined') {
          mixpanel.identify(action.payload.email_address);
          mixpanel.people.set({
            State: action.payload.state,
          });
        }

        if (typeof FS !== 'undefined') {
          FS.identify(action.payload.id, {
            displayName: `${action.payload.first_name} ${action.payload.last_name}`,
            email: action.payload.email_address,
            phone_str: action.payload.phone,
            isActive_bool: action.payload.is_active,
            isPaid_bool: action.payload.isPaid,
            inTrial_bool: action.payload.inTrial,
            isCanceled_bool: action.payload.isCanceled,
            startDate_date: new Date(action.payload.start_date),
            endDate_date: new Date(action.payload.end_date),
            countryCode_str: action.payload.country_code,
            modeOfPayment_str: action.payload.modeOfPayment,
            registrationSource_str: action.payload.registration_source,
            state_str: action.payload.state,
            paymentSetupDate_date: new Date(action.payload.payment_setup_date),
            paymentStartDate_date: new Date(action.payload.payment_start_date),
            subscriptionStatus_str: action.payload.subscription_status,
            subscriptionId_str: action.payload.subscription_id,
          });
        }
      } catch (e) {
        console.log(e);
      }
      return {
        ...state,
        paymentStatus: action.payload,
        fetchedPaymentStatus: true,
        fetchUserPaymentStatusFailed: false,
      };

    case FETCH_FAILED_PAYMENT_STATUS_FOR_USER:
      return { ...state, error: action.payload, fetchedPaymentStatus: false, fetchUserPaymentStatusFailed: true };

    case LOG_OUT:
      return initalState;

    default:
      return state;
  }
}

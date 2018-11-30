import { createAction } from 'redux-actions';

export const FETCH_USER = 'FETCH_USER';
export const USER_FETCHED = 'USER_FETCHED';
export const FETCH_USER_FAILED = 'FETCH_USER_FAILED';

export const fetchUser = createAction(FETCH_USER);
export const userFetched = createAction(USER_FETCHED);
export const fetchUserFailed = createAction(FETCH_USER_FAILED);

// to fetch addon details
export const FETCH_PLANS_FOR_USER = 'FETCH_PLANS_FOR_USER';
export const USER_PLANS_FETCHED = 'USER_PLANS_FETCHED';
export const USER_PLANS_FETCH_FAILED = 'USER_PLANS_FETCH_FAILED';

export const fetchUserPlans = createAction(FETCH_PLANS_FOR_USER);
export const userPlansFetched = createAction(USER_PLANS_FETCHED);
export const fetchUserPlansFailed = createAction(USER_PLANS_FETCH_FAILED);

// to fetch service level details
export const FETCH_SERVICE_LEVELS_FOR_USER = 'FETCH_SERVICE_LEVELS_FOR_USER';
export const USER_SERVICE_LEVELS_FETCHED = 'USER_SERVICE_LEVELS_FETCHED';
export const USER_SERVICE_LEVELS_FETCH_FAILED = 'USER_SERVICE_LEVELS_FETCH_FAILED';

export const fetchUserServiceLevels = createAction(FETCH_SERVICE_LEVELS_FOR_USER);
export const userServiceLevelsFetched = createAction(USER_SERVICE_LEVELS_FETCHED);
export const fetchUserServiceLevelsFailed = createAction(USER_SERVICE_LEVELS_FETCH_FAILED);

// to fetch payment status of a user

export const FETCH_PAYMENT_STATUS_FOR_USER = 'FETCH_PAYMENT_STATUS_FOR_USER';
export const FETCHED_PAYMENT_STATUS_FOR_USER = 'FETCHED_PAYMENT_STATUS_FOR_USER';
export const FETCH_FAILED_PAYMENT_STATUS_FOR_USER = 'FETCH_FAILED_PAYMENT_STATUS_FOR_USER';

export const fetchUserPaymentStatus = createAction(FETCH_PAYMENT_STATUS_FOR_USER);
export const fetchedUserPaymentStatus = createAction(FETCHED_PAYMENT_STATUS_FOR_USER);
export const fetchFailedUserPaymentStatus = createAction(FETCH_FAILED_PAYMENT_STATUS_FOR_USER);

// to update referral code

export const UPDATE_REFERRAL_CODE = 'UPDATE_REFERRAL_CODE';
export const UPDATE_REFERRAL_CODE_FAILED = 'UPDATE_REFERRAL_CODE_FAILED';
export const UPDATE_REFERRAL_CODE_COMPLETE = 'UPDATE_REFERRAL_CODE_COMPLETE';

export const updateReferralCode = createAction(UPDATE_REFERRAL_CODE);
export const updateReferralCodeFailed = createAction(UPDATE_REFERRAL_CODE_FAILED);
export const updateReferralCodeComplete = createAction(UPDATE_REFERRAL_CODE_COMPLETE);

export const RESET_UPDATE_CODE_ERRORS = 'RESET_UPDATE_CODE_ERRORS';
export const resetUpdateCodeState = createAction(RESET_UPDATE_CODE_ERRORS);

//to fetch referred users of a user

export const FETCH_REFERRALS = 'FETCH_REFERRALS';
export const FETCH_REFERRALS_FAILED = 'FETCH_REFERRALS_FAILED';
export const FETCH_REFERRALS_COMPLETE = 'FETCH_REFERRALS_COMPLETE';

export const fetchReferrals = createAction(FETCH_REFERRALS);
export const fetchReferralsFailed = createAction(FETCH_REFERRALS_FAILED);
export const fetchReferralsComplete = createAction(FETCH_REFERRALS_COMPLETE);

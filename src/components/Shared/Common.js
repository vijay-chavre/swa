import moment from 'moment';
import _ from 'lodash';
import * as features from '../../constants/feature';
import * as SubscriptionState from '../../constants/subscriptionState';

export function isGuest(user) {
  if (user && user.login_id && user.login_id.startsWith('guest_') && user.login_id.endsWith('@hellothinkster.com')) {
    return true;
  }
  return false;
}

export function recentTutoringSessionPurchseDate(user) {
  if (user && user.products) {
    const sessions = user.products.filter(product => product.product_type === 'SESSIONS');
    if (sessions.length > 0) {
      return sessions[0].purchase_date;
    }
  }
  return undefined;
}

export function hasTutoringSessions(user) {
  if (user && user.products) {
    const sessions = user.products.filter(product => product.product_type === 'SESSIONS');
    if (sessions.length > 0) {
      return true;
    }
  }
  return false;
}

export function stateOfStudent(student, user) {
  let state = SubscriptionState.ONGOING;
  if (this.isGuest(user)) {
    return state;
  }

  if (user && user.paymentStatus) {
    const parentSubscription = user.paymentStatus;
    if (parentSubscription.students) {
      const filteredSubscriptions = parentSubscription.students.filter((subscription) => {
        return (subscription.id === student._id);
      });
      if (filteredSubscriptions && filteredSubscriptions.length > 0) {
        const studentSubscription = filteredSubscriptions[0];
        state = studentSubscription.state;
      }
    }
  }

  if (state.toLowerCase() === SubscriptionState.CANCELED && this.hasTutoringSessions(user)) {
    state = SubscriptionState.TUTORING_SESSIONS;
  }

  return state;
}

export function isTrialUser(user) {
  if (user && user.paymentStatus && user.paymentStatus.inTrial) {
    return user.paymentStatus.inTrial;
  }

  return false;
}

export function isLiteStudent(student) {
  if (student && student.service_id && (student.service_id.toLowerCase() === 'lite' || student.service_id.toLowerCase() === 'basic')) {
    return true;
  }
  return false;
}

export function isSilverStudent(student) {
  if (student && student.service_id) {
    const serviceId = student.service_id.toLowerCase();
    if (serviceId === 'silver' || serviceId === 'plus' || serviceId === 'plusn' || serviceId === 'ae_plus' || serviceId === 'au_basic' ||
      serviceId === 'ca_plus' || serviceId === 'diy' || serviceId === 'gb_plus' || serviceId === 'primeplus' || serviceId === 'tabtor' ||
      serviceId === 'sbschool_Plus' || serviceId === 'silve'
      ) {
      return true;
    }
  }
  return false;
}

export function showChatBot(user) {
  if (this.isGuest(user)) {
    return false;
  }
  if (user && user.paymentStatus && user.paymentStatus.inTrial) {
    if (user.paymentStatus.trialDaysRemained < 5 && user.paymentStatus.trialDaysRemained > 2) { // In case of 7 days if trial period, show chat bot after 3 days till 5th day.
      return user.paymentStatus.inTrial;
    }
  }

  return false;
}
export function isPurchaseOfTypeProduct(purchase) {
  if (purchase && purchase.type && purchase.type.toLowerCase() === 'workbook') {
    return true;
  }
  return false;
}

export function isPurchaseIdOfProduct(purchaseId, user) {
  if (user.products && _.find(user.products, { id: purchaseId })) {
    return true;
  }
  return false;
}
export function fetchedPaymentStatus(user) {
  if (user && user.type && user.type.toLowerCase() === 'parent') {
    return user.fetchedPaymentStatus;
  }
  return true;
}
export function fetchUserPaymentStatusFailed(user) {
  if (user && user.type && user.type.toLowerCase() === 'parent') {
    return user.fetchUserPaymentStatusFailed;
  }
  return false;
}

export function eligibleForGiftCards(user, student) {
  // TODO: Move this code to Timeline API
  if (student.segment && student.segment.toLowerCase() === 'b2c') {
    let country = user.country_code;
    if (user.reward_country_code) {
      country = user.reward_country_code;
    }
    if (country && (country.toLowerCase() === 'us' || country.toLowerCase() === 'gb' || country.toLowerCase() === 'ca')) {
      return true;
    }
  }
  return false;
}
export function authorized(purchase, feature) {
  if (this.isPurchaseOfTypeProduct(purchase)) {
    if (feature === features.FLAG) {
      return false;
    } else if (feature === features.WHITEBOARD) {
      if (purchase.enable_whiteboard) {
        return true;
      }
      return false;
    } else if (feature === features.TEACHER_FEEDBACK) {
      if (purchase.enable_whiteboard) {
        return true;
      }
      return false;
    } else if (feature === features.REWARD_GIFT) {
      return false;
    } else if (feature === features.ACADEMIC_ADVISOR_CTA) {
      return false;
    } else if (feature === features.REQUEST_WORKSHEET) {
      return false;
    } else if (feature === features.REWARD) {
      return false;
    } else if (feature === features.VIDEO_LIBRARY) {
      return false;
    } else if (feature === features.MASTERY_MATRIX) {
      if (purchase.enable_mastery_matrix) {
        return true;
      }
      return false;
    } else if (feature === features.LEADERBOARD) {
      return false;
    }
  } else if (purchase && purchase.service_id && this.isLiteStudent(purchase)) {
    if (feature === features.FLAG) {
      return false;
    } else if (feature === features.WHITEBOARD) {
      return false;
    } else if (feature === features.TEACHER_FEEDBACK) {
      return true;
    } else if (feature === features.REWARD_GIFT) {
      return false;
    } else if (feature === features.ACADEMIC_ADVISOR_CTA) {
      return false;
    } else if (feature === features.REQUEST_WORKSHEET) {
      return true;
    }
  } else if (purchase && purchase.service_id && this.isSilverStudent(purchase)) {
    if (feature === features.REQUEST_WORKSHEET) {
      return true;
    }
  } else if (purchase && purchase.service_id && (purchase.service_id.toLowerCase() === 'starter')) {
    if (feature === features.FLAG) {
      return true;
    } else if (feature === features.WHITEBOARD) {
      return true;
    } else if (feature === features.TEACHER_FEEDBACK) {
      return true;
    } else if (feature === features.REWARD_GIFT) {
      return false;
    } else if (feature === features.LEADERBOARD) {
      return false;
    } else if (feature === features.ACADEMIC_ADVISOR_CTA) {
      return false;
    } else if (feature === features.REQUEST_WORKSHEET) {
      return false;
    }
  } else {
    if (feature === features.REQUEST_WORKSHEET) {
      return false;
    }
  }
  return true;
}

export function userIntercomProp(user) {
  const intercomProp = {};
  intercomProp.app_id = ENV.intercom_app_id;
  if (this.isGuest(user)) {
    intercomProp.email = '';
    intercomProp.user_id = '';
    intercomProp.Paid = true;
    intercomProp.name = '';
  } else {
    intercomProp.email = user.email_address ? user.email_address.toLowerCase() : '';
    intercomProp.user_id = user._id;
    intercomProp.Paid = user.paymentStatus ? user.paymentStatus.isPaid : false;
    intercomProp.name = `${user.first_name || ''} ${user.last_name || ''}`;
  }
  
  

  return intercomProp;
}

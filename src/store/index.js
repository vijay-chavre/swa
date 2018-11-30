import { applyMiddleware, createStore, compose } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { persistStore, autoRehydrate } from 'redux-persist';
import LogRocket from 'logrocket';
import saga from '../sagas';
import reducer from '../reducers';

const _ = require('lodash');

const crashReporter = store => next => action => {
  try {
    Raven.captureBreadcrumb({
      category: 'redux-action',
      message: action.type,
      data: action.payload || {},
    });
    return next(action); // dispatch
  } catch (err) {
    console.error('Caught an exception!', err);
    const { student, session, loading, addons, zendesk, payment, geoLocation } = store.getState();
    Raven.captureException(err, { // send to crash reporting tool
      extra: {
        action,
        state: { student, session, loading, addons, zendesk, payment, geoLocation }, // dump application state
      },
    });
    throw err; // re-throw error
  }
};

/* GTM Analytics */
const analytics = () => next => action => {
  const payload = {};
  const event = action.type;

  // Skip Redux Form Actions
  if (action.type.indexOf('redux') > 0) {
    return next(action);
  }

  // Skip Loading/Unloading Actions
  if (action.type === 'SET_LOADING') {
    return next(action);
  }

  // Remove Persist Rehydrate
  // if(action.type==='persist/REHYDRATE'){
  //  return next(action);
  // }

  // console.log('Track Action',action.type);
  // console.log('Track Payload',action.payload);

  // User, Student
  if (action && action.payload) {
    try {
      var keys = Object.keys(action.payload);
      keys.forEach((k) => {
        if (k == '_id') {
          payload._id = action.payload[k];
        }
        if (k == 'first_name') {
          payload.first_name = action.payload[k];
        }
        if (k == 'last_name') {
          payload.last_name = action.payload[k];
        }
        if (k == 'classes_assigned') {
          payload.teacher_id = action.payload[k].owner_id;
          payload.class_assigned = action.payload[k].name;
        }
        if (k == 'service_id') {
          payload.service_id = action.payload[k];
        }
        if (k == 'type') {
          payload.type = action.payload[k];
        }
        if (k == 'country_code') {
          payload.country_code = action.payload[k];
        }

        if (k == 'worksheet_id') {
          payload.worksheet_id = action.payload[k];
        }
        if (k == 'worksheet_number') {
          payload.worksheet_number = action.payload[k];
        }
        if (k == 'status') {
          payload.status = action.payload[k];
        }
        if (k == 'user_id') {
          payload.user_id = action.payload[k];
        }
        if (k == 'eventQuestionNumber') {
          payload.question_number = action.payload[k];
        }
        // Student Id
        if (k == 'studentId') {
          payload.user_id = action.payload[k];
        }
        if (k == 'grade') {
          payload.grade = action.payload[k];
        }
        if (k == 'owner_id') {
          payload.owner_id = action.payload[k];
        }
      });


      // Submission
      if (action.payload.submission) {
        var keys = Object.keys(action.payload.submission);
        keys.forEach((k) => {
          if (k == 'worksheet_id') {
            payload.worksheet_id = action.payload.submission[k];
          }
          if (k == 'worksheet_number') {
            payload.worksheet_number = action.payload.submission[k];
          }
          if (k == 'total_score') {
            payload.total_score = action.payload.submission[k];
          }
          if (k == 'time_taken') {
            payload.time_taken = action.payload.submission[k];
          }
          if (k == 'grade') {
            payload.grade = action.payload.submission[k];
          }
          if (k == 'score_achieved') {
            payload.score_achieved = action.payload.submission[k];
          }
          if (k == 'time_grade') {
            payload.time_grade = action.payload.submission[k];
          }
          if (k == 'second_attempt') {
            payload.second_attempt = action.payload.submission[k];
          }
        });
      }
    } catch (e) {}
  }

  // Push DataLayer
  if (!_.isEmpty(payload)) {
      // console.log('Track Action Refined',event);
      // console.log('Track Payload Refined',payload);

    window.dataLayer = window.dataLayer || [];
    dataLayer.push({
      event,
      payload,
    });
  }

  // Return
  return next(action);
};
// window.Raven.config('https://46b10d08c44a4636958df0d73dc95830@sentry.io/172131').install();
const sagaMiddleware = createSagaMiddleware();
const createStoreWithMiddleware = compose(
  applyMiddleware(
    LogRocket.reduxMiddleware({
      stateSanitizer(state) {
        return {
          ...state,
          video: undefined,
          braintreeClientToken: undefined,
          form: undefined,
        };
      },
      actionSanitizer(action) {
        if (action.type.indexOf('redux-form') > -1) {
          return null;
        }
        return action;
      },
    }),
    crashReporter,
    analytics,
    sagaMiddleware,
  ),
  autoRehydrate()
)(createStore);

export default function configureStore(initialState) {
  const store = createStoreWithMiddleware(reducer, initialState);

  // Run saga via sagaMiddleware
  // NOTE: This must be done after the saga middleware is mounted on the store
  // via applyMiddleware.
  sagaMiddleware.run(saga);
  persistStore(store, { blacklist: ['rehydrateStatus', 'form'] }, () => {
    console.log(store);
  });
  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('../reducers', () => {
      const nextRootReducer = require('../reducers');
      store.replaceReducer(nextRootReducer);
    });
  }

  return store;
}

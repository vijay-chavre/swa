/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as AddonActions from '../actions/addon';
import selectSession from '../selectors/session';

export default function* fetchAddons() {
  while (true) {
    const fetchAction = yield take(AddonActions.FETCH_ADDONS);
    const session = yield select(selectSession);
    const user = fetchAction.payload.user;
    var country_code = user.country_code;
    var grade = user.grade;
    var plans;
    
    try {

      yield put({ type: 'SET_LOADING', isLoading: true });

      
        const plansResult = yield axios({
          method: 'get',
          baseURL: ENV.apiEndPoint,
          url: 'v1/addons?version=2.0&country=' + country_code,
          headers: { Authorization: `JWT ${session.token}` },
        });

        plans = plansResult.data;
        const groupedPlans = _.groupBy(plans, 'grade_range');

        plans = _.mapValues(groupedPlans, (groupedPlan) => {
          const plansGroupedByServiceId = _.groupBy(groupedPlan, 'service_id');
          Object.keys(plansGroupedByServiceId).map((serviceId) => {
            const plansGroupByFreq = _.groupBy(plansGroupedByServiceId[serviceId], 'billingFrequency');
            _.map(plansGroupByFreq, (plan, duration) => {
              plansGroupByFreq[duration] = plan[0];
            });
            plansGroupedByServiceId[serviceId] = plansGroupByFreq;
          });
          //console.log(_.groupBy(plansGroupedByServiceId.Plus, 'billingFrequency'));
          return plansGroupedByServiceId;
        });

      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(AddonActions.fetchedAddons(plans));
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(AddonActions.fetchFailedAddons(error));
    }
  }
}

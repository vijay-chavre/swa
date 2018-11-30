/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import _ from 'lodash';
import selectSession from '../selectors/session';
import * as ProficiencyMatrix from '../actions/proficiencyMatrix';

export default function* fetchProficiencyMatrix() {
  while (true) {
    const fetchAction = yield take(ProficiencyMatrix.FETCH_PROFICIENCY_MATRIX);
    const session = yield select(selectSession);
    const studentId = fetchAction.payload.studentId;
    const grade = fetchAction.payload.grade;
    const curriculumType = fetchAction.payload.curriculumType || '';
    try {
      yield put({ type: 'SET_LOADING', isLoading: true });
      const proficiencyMatrixResponse = yield axios({
        method: 'put',
        baseURL: ENV.apiEndPoint,
        headers: { Authorization: `JWT ${session.token}` },
        url: `/v2/students/${studentId}/proficiencies/${grade}?curriculumType=${curriculumType}`,
      });
      const curriculum = proficiencyMatrixResponse.data;
      const testingPeriods = {};
      for (const topic in curriculum) {
        for (const conceptIndex in curriculum[topic].concepts) {
          if (curriculum[topic].concepts[conceptIndex].result) {
            curriculum[topic].concepts[conceptIndex].result.forEach((result) => {
              if (testingPeriods[result.testing_period_id] === undefined) {
                testingPeriods[result.testing_period_id] =
                  { startDate: result.start_date, endDate: result.end_date, submissions: result.submissions };
              }
            });
          }
        }
      }
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(ProficiencyMatrix.proficiencyFetched({ studentId,
        data: {
          masterydetail: curriculum,
          testingPeriods: _.sortBy(testingPeriods, 'endDate'),
          sliderValue: Object.keys(testingPeriods).length,
        },
      }));
      Raven.captureBreadcrumb({
        message: 'Fetch mastery matrix',
        category: 'report',
        data: {
          studentId,
          grade,
          curriculumType,
        },
      });
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
    }
  }
}

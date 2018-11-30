

/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, call } from 'redux-saga/effects';
import axios from 'axios';
import * as UserActions from '../actions/surroundingUsers';



export default function* fetchUser() {
  while (true) {
    const fetchAction = yield take(UserActions.FETCH_SURROUNDING_USERS);
    const student = fetchAction.payload.student;
    var grade;
    if(student.grade === 'k'){
        grade = 0;
    } else {
        grade = student.grade;
    }
     var url= `/leaderboards/${ENV.leaderboardName}/documents?`;   
        if (fetchAction.payload.isThisMonth === 'true') { // for outstanding
            if (fetchAction.payload.isMyCountry === 'true') {
                url += `filter%5Bcountry%5D%5B%3D%5D=${student.country_code}&`;
                if (fetchAction.payload.isMyGrade === 'true') {
                    url += `filter%5Bgrade%5D%5B%3D%5D=${grade}&`;
                }
                url += `focalDocumentId=${student._id}&limit=5&sort%5BrewardPoints.outstanding%5D=desc`;
            }
            else if (fetchAction.payload.isMyGrade === 'true') {
                url += `filter%5Bgrade%5D%5B%3D%5D=${grade}&focalDocumentId=${student._id}&limit=5&sort%5BrewardPoints.outstanding%5D=desc`;
            }
            else {
                url += `focalDocumentId=${student._id}&limit=5&sort%5BrewardPoints.outstanding%5D=desc`;
            }
            console.log("url="+url);
        }
        else {// for lifetime
            if (fetchAction.payload.isMyCountry === 'true'){
                url += `filter%5Bcountry%5D%5B%3D%5D=${student.country_code}&`;
                if (fetchAction.payload.isMyGrade === 'true') {
                    url += `filter%5Bgrade%5D%5B%3D%5D=${grade}&`;
                }
                url += `focalDocumentId=${student._id}&limit=5&sort%5BrewardPoints.lifetime%5D=desc`;
            }
            else if (fetchAction.payload.isMyGrade === 'true') {
                url += `filter%5Bgrade%5D%5B%3D%5D=${grade}&focalDocumentId=${student._id}&limit=5&sort%5BrewardPoints.lifetime%5D=desc`;
            }
            else {
                url += `focalDocumentId=${student._id}&limit=5&sort%5BrewardPoints.lifetime%5D=desc`;
            }
            console.log("url lifetime="+url);
        }

    try {
      const userResponse = yield axios({
         method: 'get',
         baseURL: ENV.leaderboardAPIEndPoint,
         url: url,
      });
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(UserActions.surroundingUsersFetched(userResponse));
      console.log("userResponse =" + userResponse);
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(UserActions.fetchSurroundingUsersFailed(error));
    }
  }
}

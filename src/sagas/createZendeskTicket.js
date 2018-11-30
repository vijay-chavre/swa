/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as ZendeskActions from '../actions/zendesk';
import selectSession from '../selectors/session';

export default function* createZendeskTicket() {
  while (true) {
    const fetchAction = yield take(ZendeskActions.CREATE_ZENDESK_TICKET);
    const session = yield select(selectSession);
    const data = fetchAction.payload.data;
    
    try {

      yield put({ type: 'SET_LOADING', isLoading: true });

      const ticketCreationResult = yield axios({
        method: 'post',
        baseURL: ENV.apiEndPoint,
        url: 'v1/zendesk/ticket',
        headers: { Authorization: `JWT ${session.token}` },
        data: data,

      });

      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(ZendeskActions.createdZendeskTicket(ticketCreationResult));
    } catch (error) {
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(ZendeskActions.createZendeskTicketFailed(error));
    }
  }
}

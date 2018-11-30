import { createAction } from 'redux-actions';


//to create zendesk ticket

export const CREATE_ZENDESK_TICKET = 'CREATE_ZENDESK_TICKET';
export const CREATED_ZENDESK_TICKET = 'CREATED_ZENDESK_TICKET';
export const CREATE_ZENDESK_TICKET_FAILED = 'CREATE_ZENDESK_TICKET_FAILED';
export const RESET_ZENDESK_DATA = 'RESET_ZENDESK_DATA';

export const resetZendeskData = createAction(RESET_ZENDESK_DATA);
export const createZendeskTicket = createAction(CREATE_ZENDESK_TICKET);
export const createdZendeskTicket = createAction(CREATED_ZENDESK_TICKET);
export const createZendeskTicketFailed = createAction(CREATE_ZENDESK_TICKET_FAILED);
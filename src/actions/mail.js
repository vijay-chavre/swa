import { createAction } from 'redux-actions';


//to fetch user addons

export const MAIL_SEND = 'MAIL_SEND';
export const MAIL_SENT = 'MAIL_SENT';
export const MAIL_SEND_FAILED = 'MAIL_SEND_FAILED';

export const sendMail = createAction(MAIL_SEND);
export const mailSent = createAction(MAIL_SENT);
export const mailSendFailed = createAction(MAIL_SEND_FAILED);
import { MAIL_SEND, MAIL_SENT, MAIL_SEND_FAILED } from '../actions/addon';
import { LOG_OUT } from '../actions/session';

const initalState = {
    error: null,

    mailSending: false,
    mailSent: false,
    mailSendFailed: false,
};

export default function session(
    state = initalState,
    action
) {
    switch (action.type) {

        case MAIL_SEND:

        return {
            ...state,
            mailSending : true,
            mailSent : false,
            mailSendFailed : false,
        };

        case MAIL_SENT:
        return {
            ...state,
            mailSend : false,
            mailSent : true,
            mailSendFailed : false,
        };

        case MAIL_SEND_FAILED:
            return {
                ...state,
                mailSend : false,
                mailSent : false,
                mailSendFailed : true,
            };

        case LOG_OUT:
            return initalState;

        default:
            return state;
    }
}

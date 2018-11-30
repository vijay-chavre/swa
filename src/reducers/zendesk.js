import { CREATE_ZENDESK_TICKET, CREATED_ZENDESK_TICKET, CREATE_ZENDESK_TICKET_FAILED, RESET_ZENDESK_DATA } from '../actions/zendesk';
import { LOG_OUT } from '../actions/session';

const initalState = {
  createTicket: false,
  createdTicket: false,
  createTicketFailed: false,

};

export default function session(
  state = initalState,
  action
) {
  switch (action.type) {

    case RESET_ZENDESK_DATA:
      return {
        ...state,
        createTicket: false,
        createdTicket: false,
        createTicketFailed: false,
      };

    case CREATE_ZENDESK_TICKET:
      return {
        ...state,
        createTicket: true,
        createdTicket: false,
        createTicketFailed: false,
      };

    case CREATED_ZENDESK_TICKET:
      return { ...state,
        createTicket: false,
        createdTicket: true,
        createTicketFailed: false,
      };

    case CREATE_ZENDESK_TICKET_FAILED:
      return { ...state,
        createTicket: false,
        createdTicket: false,
        createTicketFailed: true };

    case LOG_OUT:
      return initalState;

    default:
      return state;
  }
}

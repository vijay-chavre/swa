import { createAction } from 'redux-actions';

export const WORKFLOW_COMPLETED = 'WORKFLOW_COMPLETED';

export const workflowCompleted = createAction(WORKFLOW_COMPLETED);

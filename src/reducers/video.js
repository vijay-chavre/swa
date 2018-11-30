import { VIDEOS_FETCHED, FETCH_VIDEOS_FAILED, SAVE_WATCHED_VIDEOS, REMOVE_WATCHED_VIDEOS, CONCEPT_VIDEOS_FETCHED } from '../actions/video';
import { LOG_OUT } from '../actions/session';

const initalState = {
  error: null,
  video_feedback: {},
  concept_videos: {},
};

export default function video(
  state = initalState,
  action
) {
  switch (action.type) {

    case SAVE_WATCHED_VIDEOS:
      const data = action.payload;
      if (!state.video_feedback[data.assignmentId]) {
        state.video_feedback[data.assignmentId] = [];
      }
      state.video_feedback[data.assignmentId].push(data.data);
      return {
        ...state,
      };
    
    case REMOVE_WATCHED_VIDEOS:
      const payload = action.payload;
      if (state.video_feedback[payload.assignmentId]) {
        state.video_feedback[payload.assignmentId] = null;
      }
      return {
        ...state,
      };

    case FETCH_VIDEOS_FAILED:
      return { ...state, error: action.payload };

    case VIDEOS_FETCHED:
      return { ...action.payload };

    case CONCEPT_VIDEOS_FETCHED:
      return { ...state, ...action.payload };

    case LOG_OUT:
      return initalState;

    default:
      return state;
  }
}

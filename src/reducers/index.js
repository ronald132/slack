import { combineReducers } from "redux";

import * as actionTypes from "../actions/types";

const initialStateUser = {
  currentUser: null,
  isLoading: true
};

const user_reducer = (state = initialStateUser, action) => {
  switch (action.type) {
    case actionTypes.SET_USER:
      return {
        ...initialStateUser,
        currentUser: action.payload.currentUser,
        isLoading: false
      };
    case actionTypes.CLEAR_USER:
      return {
        ...initialStateUser,
        isLoading: false
      };
    default:
      return state;
  }
};

const initialStateChannel = {
  currentChannel: null
};

const channel_reducer = (state = initialStateChannel, action) => {
  switch (action.type) {
    case actionTypes.SET_CURRENT_CHANNEL:
      return {
        ...initialStateChannel,
        currentChannel: action.payload
      };
    default:
      return state;
  }
};

const rootReducer = combineReducers({
  user: user_reducer,
  channel: channel_reducer
});

export default rootReducer;

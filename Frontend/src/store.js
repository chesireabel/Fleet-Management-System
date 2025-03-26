import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';
import sidebarReducer from './reducers/sidebarReducers';
import themeReducer from './reducers/themeReducer';
import notificationReducer from './reducers/notif';


const rootReducer = combineReducers({
  sidebar: sidebarReducer,
  theme: themeReducer,
  notifications: notificationReducer,
});


const store = configureStore({
  reducer: rootReducer,
  // Redux Toolkit automatically includes thunk middleware
});

export default store;
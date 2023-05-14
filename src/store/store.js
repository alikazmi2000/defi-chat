import { configureStore } from '@reduxjs/toolkit';
import counterReducer from './slice/counterSlice';
import authReducer from './slice/authSlice';

export default configureStore({
  reducer: {
    counter: counterReducer,
    auth:authReducer
  },
});
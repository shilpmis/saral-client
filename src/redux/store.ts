import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/Auth/slices/authSlice';
// import dashboardReducer from '../features/Dashboard/slices/dashboardSlice';
// import sidebarReducer from '../features/Sidebar/slices/sidebarSlice';
// import studentReducer from '../features/Students/slices/studentSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    // dashboard: dashboardReducer,
    // sidebar: sidebarReducer,
    // students: studentReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(), // Add middlewares here
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;

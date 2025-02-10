import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import academicReducer from "./slices/academicSlice";
import roleReducer from "./slices/roleSlice";
import userManagementReducer from "./slices/userManagementSlice";
import { Authapi } from "@/services/AuthService";


const store = configureStore({
  reducer: {
    auth: authReducer,
    academic : academicReducer,
    role: roleReducer,
    userManagement: userManagementReducer,
    [Authapi.reducerPath]: Authapi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(Authapi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store


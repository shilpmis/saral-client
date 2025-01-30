import { configureStore } from "@reduxjs/toolkit"
import authReducer from "./slices/authSlice"
import ApiService from "@/services/ApiService"
import { api } from "../services/Api"

// Initialize the API service
ApiService.init()

const store = configureStore({
  reducer: {
    auth: authReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store


import { configureStore } from '@reduxjs/toolkit'
import expenseReducer from '../slice/expenseSlice'
import authReducer from '../slice/authSlice'
//This is custom middleware. Its job is presumably to persist Redux state somewhere, such as localStorage.
import { persistMiddleware } from './persistMiddleware'

export const store = configureStore({
  reducer: {
    //the Redux store has a piece of state called expenses, and expenseReducer is responsible for managing it.
    expenses: expenseReducer,
    auth: authReducer,  //authReducer is responsible for managing the auth slice of state. It handles actions related to authentication, such as login and logout.
    // auth: authReducer,  <- added in Step 5
  },
  
  //serializableCheck scans every action and the entire state tree after each dispatch, 
  //and it warns if it finds non-plain values (functions, Error objects, Dates, Promises) because tools like Redux DevTools and state persistence work best with serializable data(safely be stored or converted to JSON).
  //We’ve disabled this check because it adds some extra work on every dispatch, and if we intentionally store something non-serializable later 
  //(for example, an Error object from a failed request), those warnings would become more annoying than helpful.

  //here middleware determines how actions are processed before they reach the reducers. 
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(persistMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
})



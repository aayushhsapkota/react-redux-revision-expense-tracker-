import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import * as api from '../API/authApi'

const Status = Object.freeze({
  IDLE: 'idle',
  LOADING: 'loading',
  FAILED: 'failed',
})

function loadStoredUser() {
  try {
    const stored = window.localStorage.getItem('authUser')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const initialState = {
  user: loadStoredUser(), // restores the session across reloads
  status: Status.IDLE,
  error: null,
}

// createAsyncThunk auto-generates 'auth/login/pending', '.../fulfilled', and
// '.../rejected' action types, and dispatches the right one automatically —
// we only write the actual async work.
export const login = createAsyncThunk('auth/login', async ({ email, password }, thunkAPI) => {
  let data
  try {
    const response = await api.LoginAPI({ email, password })
    data = response.data.data
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message)
  }

  // Persistence is best-effort, and deliberately in its OWN try/catch: if
  // this fails (storage quota, privacy mode blocking storage), the login
  // itself still genuinely succeeded — that shouldn't be reported as a
  // failed login.
  try {
    window.localStorage.setItem('authUser', JSON.stringify(data.user))
    window.localStorage.setItem('authToken', data.token)
  } catch (storageError) {
    console.error('Failed to persist auth session:', storageError)
  }

  return data
})

export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => { 
  // 'auth/logout' is simply a string identifier/type prefix for this thunk.
  //_ is the first argument to the payload creator function, which we don't need here (no params for logout). 
  // thunkAPI is the second argument, giving us access to dispatch, getState, and rejectWithValue.
  try {
    await api.LogoutAPI()
  } catch (error) {
    return thunkAPI.rejectWithValue(error.message)
  }

  try {
    window.localStorage.removeItem('authUser')
    window.localStorage.removeItem('authToken')
  } catch (storageError) {
    console.error('Failed to clear auth session:', storageError)
  }

  return null //if null returned null, the logout thunk is considered fulfilled, and the state will be updated accordingly in extraReducers.
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // No plain setters here — every state change in this slice comes from
    // the two thunks above, handled below in extraReducers instead.
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = Status.LOADING
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = Status.IDLE
        state.user = action.payload.user
      })
      .addCase(login.rejected, (state, action) => {
        state.status = Status.FAILED
        state.error = action.payload // what rejectWithValue set
      })
      .addCase(logout.pending, (state) => {
        state.status = Status.LOADING
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = Status.IDLE
        state.user = null
        state.error = null
      })
      .addCase(logout.rejected, (state, action) => {
        state.status = Status.FAILED
        state.error = action.payload
      })
  },
})

export const getAuthUserSelector = (state) => state.auth.user
export const getAuthStatusSelector = (state) => state.auth.status
export const getAuthErrorSelector = (state) => state.auth.error
export const getIsAuthenticatedSelector = (state) => state.auth.user !== null

export { Status as AuthStatus }

export default authSlice.reducer

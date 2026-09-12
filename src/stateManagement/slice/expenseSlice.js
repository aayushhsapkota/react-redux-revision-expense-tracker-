// The hand-rolled thunks below use these API functions directly.
import * as api from '../API/expenseApi'

import { createSlice } from '@reduxjs/toolkit'

//locks the object so nobody can accidentally do Status.LOADING = 'oops' later
//  and quietly break every comparison against it in the whole app.
const Status = Object.freeze({
  IDLE: 'idle',
  LOADING: 'loading',
  FAILED: 'failed',
})

const initialState = {
  data: [], //// the actual array of expenses — empty at start
  status: Status.IDLE,  // nothing loading yet
  details: null, // populated by a getExpenseById thunk in Step 3 (no detail page in this app yet, but kept for convention parity)
  page: 1, // which page of results we're currently viewing
  pageCount: 1, // pagination — how many pages exist total (comes FROM the server response)
  total: 0, // grand total — now computed server-side over the FULL filtered set, not just this page
  categoryTotals: {}, // same reasoning
  filterBy: '', // same category filter we already had
  // Your template in the prompt used `sortBy: 1` — kept as a STRING here instead, since our
  // existing UI already sends values like 'date-desc' (see sortBy.split('-')
  // back in App.jsx). Matching your structure, not the literal placeholder value.
  sortBy: 'date-desc', // same sort we already had

  searchBy: { title: '', note: '' }, // Same reasoning: `searchBy: { name: '', anything: '' }` was illustrative —
  // renamed to the fields THIS app actually searches (title, note).
  newForm: { title: '', amount: '', category: 'Food', date: '', note: '' },
  editedID: null, // which expense (by id) is currently being edited — same idea as Context's editedId
  deletedID: null,  // which expense is currently pending delete confirmation — same idea as Context's deletingId
}

// --- Hand-rolled thunks -------------------------------------------------
// Plain functions returning `(dispatch) => {...}` — NOT createAsyncThunk.
// That's reserved for the auth slice (Step 5). Every one follows the same
// shape: dispatch LOADING, try the request, dispatch the results + IDLE,
// or dispatch FAILED on error.


export const getAllExpenses = ({ page, searchBy, filterBy, sortBy }) => async (dispatch) => {
  dispatch(setExpenseStatus(Status.LOADING))
  try {
    const {
      data: { data, pageCount, total, categoryTotals },
    } = await api.GetAllExpenseAPI({ page, searchBy, filterBy, sortBy })
    dispatch(setExpensePageCount(pageCount))
    dispatch(setExpenseTotal(total))
    dispatch(setExpenseCategoryTotals(categoryTotals))
    dispatch(setAllExpenses(data))
    return dispatch(setExpenseStatus(Status.IDLE))
  } catch (error) {
    console.error(error.message) // TODO: wire up a real toast library — logging for now
    return dispatch(setExpenseStatus(Status.FAILED))
  }
}

export const getExpenseById = (id) => async (dispatch) => {
  dispatch(setExpenseStatus(Status.LOADING))
  try {
    const {
      data: { data },
    } = await api.GetExpenseByIdAPI(id)
    dispatch(setExpenseDetails(data))
    return dispatch(setExpenseStatus(Status.IDLE))
  } catch (error) {
    console.error(error.message)
    return dispatch(setExpenseStatus(Status.FAILED))
  }
}

export const createExpense = (newExpense) => async (dispatch, getState) => {
  dispatch(setExpenseStatus(Status.LOADING))
  try {
    await api.CreateExpenseAPI(newExpense)
    const { page, filterBy, sortBy, searchBy } = getState().expenses
    return dispatch(getAllExpenses({ page, filterBy, sortBy, searchBy }))
  } catch (error) {
    console.error(error.message)
    dispatch(setExpenseStatus(Status.FAILED))
    throw error
  }
}

export const updateExpense = (updatedExpense) => async (dispatch, getState) => {
  dispatch(setExpenseStatus(Status.LOADING))
  try {
    await api.UpdateExpenseAPI(updatedExpense)
    dispatch(cancelEditExpense()) // clear editedID now that the save actually succeeded
    const { page, filterBy, sortBy, searchBy } = getState().expenses
    return dispatch(getAllExpenses({ page, filterBy, sortBy, searchBy }))
  } catch (error) {
    console.error(error.message)
    dispatch(setExpenseStatus(Status.FAILED))
    throw error
  }
}

export const deleteExpense = (id) => async (dispatch, getState) => {
  dispatch(setExpenseStatus(Status.LOADING))
  try {
    await api.DeleteExpenseAPI(id)
    dispatch(cancelDeleteExpense()) // clear deletedID now that the delete actually succeeded
    const { page, filterBy, sortBy, searchBy } = getState().expenses
    return dispatch(getAllExpenses({ page, filterBy, sortBy, searchBy }))
  } catch (error) {
    console.error(error.message)
    dispatch(setExpenseStatus(Status.FAILED))
    throw error
  }
}

const expenseSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    // Immer lets us write these as if mutating `state` directly — under the
    // hood, RTK intercepts that and produces a proper new immutable object.
    // This is why these look different from classic hand-written useReducer
    // (which always `return { ...state, status: action.payload }`).
    setExpenseStatus(state, action) {
      state.status = action.payload
    },
    setAllExpenses(state, action) {
      state.data = action.payload
    },
    setExpensePageCount(state, action) {
      state.pageCount = action.payload
    },
     setExpenseTotal(state, action) {
      state.total = action.payload
    },
    setExpenseCategoryTotals(state, action) {
      state.categoryTotals = action.payload
    },
    setExpenseDetails(state, action) {
      state.details = action.payload
    },
    addNewExpense(state, action) {
      state.data.unshift(action.payload) //unshift adds to the front of the array — same "newest first" ordering we've had since Phase 1.
    },
    onConfirmEditExpense(state, action) {
      //find the index of the expense that matches the edited expense id, and if found, replace it with the updated expense. 
      // Otherwise, keep the original expense.
      const index = state.data.findIndex((e) => e.id === action.payload.id)
      if (index !== -1) state.data[index] = action.payload
      state.editedID = null
    },
    onConfirmDeletedExpense(state, action) {
      //filter out the expense that matches the deleted expense id, effectively removing it from the array. 
      state.data = state.data.filter((e) => e.id !== action.payload)
      state.deletedID = null
    },
    setEditedID(state, action) {
      state.editedID = action.payload
    },
    cancelEditExpense(state) {
      state.editedID = null
    },
    setDeletedID(state, action) {
      state.deletedID = action.payload
    },
    cancelDeleteExpense(state) {
      state.deletedID = null
    },
    setFilterBy(state, action) {
      state.filterBy = action.payload
    },
    setSortBy(state, action) {
      state.sortBy = action.payload
    },
    setSearchBy(state, action) {
      //merge the existing searchBy object with the new values from action.payload, instead of replacing it outright —
      // so you could dispatch setSearchBy({ title: 'coffee' }) without wiping out whatever was in note.
      state.searchBy = { ...state.searchBy, ...action.payload }
    },
    setPage(state, action) {
      state.page = action.payload
    },
    updateNewExpenseFormField(state, action) {
      //we likely won't end up wiring this one up in practice, since our form reads via FormData rather than tracking keystrokes 
      // — it's here for convention completeness.
      state.newForm[action.payload.name] = action.payload.value
    },
    resetNewExpenseForm(state) {
      state.newForm = initialState.newForm
    },
    clearAllExpenses(state) {
      state.data = []
    },
  },
})

export const {
  setExpenseStatus,
  setAllExpenses,
  setExpensePageCount,
  setExpenseTotal,
  setExpenseCategoryTotals,
  setExpenseDetails,
  addNewExpense,
  onConfirmEditExpense,
  onConfirmDeletedExpense,
  setEditedID,
  cancelEditExpense,
  setDeletedID,
  cancelDeleteExpense,
  setFilterBy,
  setSortBy,
  setSearchBy,
  setPage,
  updateNewExpenseFormField,
  resetNewExpenseForm,
  clearAllExpenses,
} = expenseSlice.actions


export const getAllExpenseSelector = (state) => state.expenses.data
export const getExpenseStatusSelector = (state) => state.expenses.status
export const getExpenseDetailsSelector = (state) => state.expenses.details
export const getExpensePageSelector = (state) => state.expenses.page
export const getExpensePageCountSelector = (state) => state.expenses.pageCount
export const getExpenseTotalSelector = (state) => state.expenses.total
export const getExpenseCategoryTotalsSelector = (state) => state.expenses.categoryTotals
export const getExpenseFilterBySelector = (state) => state.expenses.filterBy
export const getExpenseSortBySelector = (state) => state.expenses.sortBy
export const getExpenseSearchBySelector = (state) => state.expenses.searchBy
export const getExpenseNewFormSelector = (state) => state.expenses.newForm
export const getExpenseEditedIDSelector = (state) => state.expenses.editedID
export const getExpenseDeletedIDSelector = (state) => state.expenses.deletedID

export { Status }


// exporting .reducer can look odd but:

// reducers: {...} (what you write) — many small functions, one per state change (setExpenseStatus, addNewExpense, etc.). Just configuration.
// expenseSlice.actions — auto-generated dispatchable functions, one per reducer you wrote (plural, matches your list).
// expenseSlice.reducer — ONE big function createSlice builds by combining all your small reducers into a single (state, action) => newState, 
// matching what Redux actually requires (and what configureStore's reducer: {...} map needs — one function per slice).
// Same shape as our hand-written expenseReducer.js with switch statement from ExpenseContext while using useReducer()
// — createSlice just auto-generates that switch statement instead of us writing it.
export default expenseSlice.reducer

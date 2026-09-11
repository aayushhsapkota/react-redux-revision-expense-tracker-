import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useOptimistic,
  useCallback,
  useMemo,
} from 'react'
import useLocalStorage from '../hooks/useLocalStorage'
import { fakeSaveExpense } from '../api/fakeExpenseApi'
import { expenseReducer } from './expenseReducer'

const ExpenseContext = createContext(null)

export function ExpenseProvider({ children }) {
  // storedExpenses is read ONCE here, purely to seed useReducer's initial
  // state. editedId/deletingId are transient UI state — they should NOT
  // persist across reloads, so they always start at null, never from storage.
  const [storedExpenses, setStoredExpenses] = useLocalStorage('expenses', [])
  const [state, dispatch] = useReducer(expenseReducer, {
    items: storedExpenses,
    editedId: null,
    deletingId: null,
  })

  // Sync the reducer's expenses to storedExpenses whenever expenses changes.
// setStoredExpenses is included in dependency because it is used inside the effect (React recommends including all dependencies used inside the effect). However,
// it is not necessary to include it in the dependency array because it is not what changes the effect.
   useEffect(() => {
     setStoredExpenses(state.items)
   }, [state.items, setStoredExpenses])


   // useOptimistic: shows a "hoped-for" expense immediately, tagged `pending: true`.
  // Once the real save (below) either commits `expenses` or fails, React
  // reconciles optimisticItems back to match reality automatically.
  const [optimisticItems, addOptimisticExpense] = useOptimistic(
    //the real current state
    state.items,
    //update function
    (current, newExpense) => [{ ...newExpense, pending: true }, ...current],
  );



  // useCallback: keeps this function's "identity" stable across renders, so
  // the memo() on ExpenseForm actually works — otherwise every App render
  // (e.g. from changing the filter) would hand ExpenseForm a "new" function
  // prop and force it to re-render anyway.
  const addExpense = useCallback(
    async (newExpense) => {
      addOptimisticExpense(newExpense)
      await fakeSaveExpense(newExpense) // throws ~15% of the time — see fakeExpenseApi.js
      dispatch({ type: 'ADD_EXPENSE', payload: newExpense })
    },
    [addOptimisticExpense]
  )

  const clearExpenses = useCallback(() => {
    dispatch({ type: 'CLEAR_EXPENSES' })
  }, [])

  const startEdit = useCallback((id) => {
      dispatch({ type: 'START_EDIT', payload: id })
    }, [])
  
    const cancelEdit = useCallback(() => {
      dispatch({ type: 'CANCEL_EDIT' })
    }, [])
  
    const saveEdit = useCallback((updatedExpense) => {
      dispatch({ type: 'SAVE_EDIT', payload: updatedExpense })
    }, [])
  
    const requestDelete = useCallback((id) => {
      dispatch({ type: 'REQUEST_DELETE', payload: id })
    }, [])
  
    const cancelDelete = useCallback(() => {
      dispatch({ type: 'CANCEL_DELETE' })
    }, [])
  
    const confirmDelete = useCallback((id) => {
      dispatch({ type: 'CONFIRM_DELETE', payload: id })
    }, [])
  

 
    const value = useMemo(
      () => ({
        expenses: optimisticItems,
        editedId: state.editedId,
        deletingId: state.deletingId,
        addExpense,
        clearExpenses,
        startEdit,
        cancelEdit,
        saveEdit,
        requestDelete,
        cancelDelete,
        confirmDelete,
      }),
      [
        optimisticItems,
        state.editedId,
        state.deletingId,
        addExpense,
        clearExpenses,
        startEdit,
        cancelEdit,
        saveEdit,
        requestDelete,
        cancelDelete,
        confirmDelete,
      ]
    )
  
    return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>
  }
  
  export function useExpenses() {
    const context = useContext(ExpenseContext)
    if (context === null) {
      throw new Error('useExpenses must be used inside an <ExpenseProvider>')
    }
    return context
  }
  
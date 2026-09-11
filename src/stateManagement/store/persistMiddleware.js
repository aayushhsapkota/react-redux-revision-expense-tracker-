// Middleware shape: (store) => (next) => (action) => { ... }
// store   — gives you getState()/dispatch()
// next    — // next is a function that takes the action and passes it
//            to the next step in the Redux middleware chain. Call this to let the action continue to whatever's next
//           (another middleware, or the reducers themselves)
// action  — the plain object (or thunk function) that got dispatched
//
// This mirrors how you'd write a token-expiry middleware: read something
// (here, the resulting state), react to it (persist it), then let the
// action carry on as if nothing happened.
export const persistMiddleware = (store) => (next) => (action) => {
  const result = next(action) // let the reducers run FIRST

  console.log('[redux] action:', action.type ?? '(thunk)')

  // After the reducers have updated state, mirror expenses to localStorage.
  // In a bigger app you'd only do this for action types that actually touch
  // expenses — our list is small enough that unconditional writes are fine.
  const state = store.getState()
  try {
    window.localStorage.setItem('reduxExpenses', JSON.stringify(state.expenses.data))
  } catch (error) {
    console.error('Failed to persist expenses:', error)
  }

  return result
}

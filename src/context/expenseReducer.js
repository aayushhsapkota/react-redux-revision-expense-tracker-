// A reducer is just a plain function: (current state, action) => next state.
// No side effects, no async, no reaching outside itself — that discipline is
// what makes state transitions predictable and easy to reason about.
export function expenseReducer(state, action) {
  switch (action.type) {
    case 'ADD_EXPENSE':
      return { ...state, items: [action.payload, ...state.items] }

    case 'CLEAR_EXPENSES':
      return { ...state, items: [] }

    // Edit is two steps: START_EDIT just flags WHICH item is being edited
    // (the UI uses this to swap that row into an edit form). Nothing about
    // the actual expense data changes yet.
    case 'START_EDIT':
      return { ...state, editedId: action.payload, deletingId: null }

    case 'CANCEL_EDIT':
      return { ...state, editedId: null }

    // ...and SAVE_EDIT is the second step: the real data update.
    case 'SAVE_EDIT':
      return {
        ...state,
        //if the expense id matches the edited expense id, replace it with the updated expense. Otherwise, keep the original expense.
        items: state.items.map((e) => (e.id === action.payload.id ? action.payload : e)),
        editedId: null,
      }

    // Same two-step shape for delete: REQUEST just flags intent (for the
    // "are you sure?" UI), CONFIRM is the only action that actually removes data.
    case 'REQUEST_DELETE':
      return { ...state, deletingId: action.payload, editedId: null }

    case 'CANCEL_DELETE':
      return { ...state, deletingId: null }

    case 'CONFIRM_DELETE':
      return {
        ...state,
        items: state.items.filter((e) => e.id !== action.payload),
        deletingId: null,
      }

    default:
      return state
  }
}

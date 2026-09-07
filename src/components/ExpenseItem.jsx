import { memo, useState } from 'react'
import { useExpenses } from '../context/ExpenseContext'
import { CATEGORIES } from '../constants'
import Button from './ui/Button'
import Input from './ui/Input'

function ExpenseItem({ expense }) {
  // Reading straight from context: editedId/deletingId are SHARED state, not
  // local to this component — every ExpenseItem reads the same values. (This
  // is exactly what Step 4 is going to dig into.)
  const {
    editedId,
    deletingId,
    startEdit,
    cancelEdit,
    saveEdit,
    requestDelete,
    cancelDelete,
    confirmDelete,
  } = useExpenses()

  const { id, title, amount, category, date, note, pending } = expense
  const isEditing = editedId === id //check if the current expense is being edited
  const isConfirmingDelete = deletingId === id //check if the current expense is being deleted

  // Local form state — only exists while THIS row happens to be in edit mode.
  const [editForm, setEditForm] = useState(null)

  function handleStartEdit() {
    setEditForm({ title, amount, category, date, note: note || '' }) //initialize the edit form with the current expense values
    startEdit(id) //call the startEdit function from context to set the editedId to the current expense id
  }

  // Handle changes to the edit form inputs
  function handleEditChange(e) {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  // Handle saving the edited expense
  function handleSaveEdit(e) {
    e.preventDefault()
    saveEdit({ ...expense, ...editForm, amount: parseFloat(editForm.amount) })
    //AT FIRST I WAS CONFUSED ABOUT THE SPREAD OPERATOR, BUT IT IS USED TO MERGE THE EXISTING EXPENSE OBJECT WITH THE UPDATED VALUES FROM THE EDIT FORM. THIS ENSURES THAT ANY UNCHANGED PROPERTIES OF THE EXPENSE ARE PRESERVED WHILE UPDATING ONLY THE MODIFIED FIELDS.
  }

  function handleCancelEdit() {
    cancelEdit()
    setEditForm(null)
  }

  // If the current expense is being edited, render the edit form
  //editForm is also checked to ensure that the form has been initialized with the current expense values.
  if (isEditing && editForm) {
    return (
      <li className="border-b border-slate-200 dark:border-slate-700 py-3 last:border-none">
        <form onSubmit={handleSaveEdit} className="grid gap-2 sm:grid-cols-2">
          <Input label="Title" name="title" value={editForm.title} onChange={handleEditChange} />
          <Input
            label="Amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            value={editForm.amount}
            onChange={handleEditChange}
          />
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              name="category"
              value={editForm.category}
              onChange={handleEditChange}
              className="border border-slate-300 dark:border-slate-600 rounded px-3 py-2 w-full
                bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <Input label="Date" name="date" type="date" value={editForm.date} onChange={handleEditChange} />
          <div className="sm:col-span-2">
            <Input label="Note (optional)" name="note" value={editForm.note} onChange={handleEditChange} />
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <Button type="submit" className="flex-1">
              Save
            </Button>
            <Button type="button" variant="ghost" className="flex-1" onClick={handleCancelEdit}>
              Cancel
            </Button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li
      className={`flex items-center justify-between border-b border-slate-200 dark:border-slate-700 py-3 last:border-none ${
        pending ? 'opacity-50' : ''
      }`}
    >
      <div>
        <p className="font-medium text-slate-800 dark:text-slate-100">
          {title}
          {pending && (
            <span className="ml-2 text-xs font-normal text-slate-400 dark:text-slate-500">
              Saving…
            </span>
          )}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {category} · {date}
          {note && ` · ${note}`}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <p className="font-semibold text-slate-800 dark:text-slate-100">${amount.toFixed(2)}</p>

        {/* Pending (still optimistic) items can't be edited/deleted yet —
            the reducer doesn't know about them until the fake save resolves. */}
        {!pending &&
          (isConfirmingDelete ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">Delete?</span>
              <Button
                variant="ghost"
                className="text-xs px-2 py-1 text-red-600 dark:text-red-400"
                onClick={() => confirmDelete(id)}
              >
                Yes
              </Button>
              <Button variant="ghost" className="text-xs px-2 py-1" onClick={cancelDelete}>
                No
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Button variant="ghost" className="text-xs px-2 py-1" onClick={handleStartEdit}>
                Edit
              </Button>
              <Button
                variant="ghost"
                className="text-xs px-2 py-1"
                onClick={() => requestDelete(id)}
              >
                Delete
              </Button>
            </div>
          ))}
      </div>
    </li>
  )
}

// Real use case: when filterBy/sortBy change, the array is rebuilt, but most
// individual expense OBJECTS inside it are the same reference as before —
// so memo lets React skip re-rendering rows that didn't actually change.
export default memo(ExpenseItem)

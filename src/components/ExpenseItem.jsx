import { memo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  getExpenseEditedIDSelector,
  getExpenseDeletedIDSelector,
  setEditedID,
  cancelEditExpense,
  setDeletedID,
  cancelDeleteExpense,
  // updateExpense,
  // deleteExpense,
} from '../stateManagement/slice/expenseSlice'
import { useUpdateExpenseMutation, useDeleteExpenseMutation } from '../stateManagement/slice/expenseApiSlice'

import { CATEGORIES } from '../constants'
import Button from './ui/Button'
import Input from './ui/Input'

function ExpenseItem({ expense }) {
   const dispatch = useDispatch()

   // Same idea as Context's editedId/deletingId — just Redux-shaped now.
   // Every ExpenseItem still subscribes to these two values;
   const editedID = useSelector(getExpenseEditedIDSelector)
   const deletedID = useSelector(getExpenseDeletedIDSelector)
// The actual mutations: now RTK Query hooks instead of dispatched thunks.
  const [updateExpense] = useUpdateExpenseMutation()
  const [deleteExpense] = useDeleteExpenseMutation()

  const { id, title, amount, category, date, note } = expense
  const isEditing = editedID === id //check if the current expense is being edited
  const isConfirmingDelete = deletedID === id //check if the current expense is being deleted

  // Local form state — only exists while THIS row happens to be in edit mode.
  const [editForm, setEditForm] = useState(null)

  function handleStartEdit() {
    setEditForm({ title, amount, category, date, note: note || '' }) //initialize the edit form with the current expense values
    dispatch(setEditedID(id)) //set the editedId in the Redux store to the current expense id
  }

  // Handle changes to the edit form inputs
  function handleEditChange(e) {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

    async function handleSaveEdit(e) {
      e.preventDefault()
      try {
        await updateExpense({ ...expense, ...editForm, amount: parseFloat(editForm.amount) }).unwrap()
        dispatch(cancelEditExpense()) // RTK Query doesn't know about editedID — still our job
        setEditForm(null)
      } catch (error) {
        console.error('Failed to save edit:', error.message)
      }
    }

 function handleCancelEdit() {
     dispatch(cancelEditExpense())
     setEditForm(null)
   }

  async function handleConfirmDelete() {
      try {
        await deleteExpense(id).unwrap()
        dispatch(cancelDeleteExpense())
      } catch (error) {
        console.error('Failed to delete:', error.message)
      }
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
      <li className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 py-3 last:border-none">
        <div>
          <p className="font-medium text-slate-800 dark:text-slate-100">{title}</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {category} · {date}
            {note && ` · ${note}`}
          </p>
        </div>
  
        <div className="flex items-center gap-2">
          <p className="font-semibold text-slate-800 dark:text-slate-100">${amount.toFixed(2)}</p>
  
          {isConfirmingDelete ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">Delete?</span>
              <Button
                variant="ghost"
                className="text-xs px-2 py-1 text-red-600 dark:text-red-400"
                onClick={handleConfirmDelete}
              >
                Yes
              </Button>
              <Button variant="ghost" className="text-xs px-2 py-1" onClick={() => dispatch(cancelDeleteExpense())}>
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
                onClick={() => dispatch(setDeletedID(id))}
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      </li>
    )
  }
  
  export default memo(ExpenseItem)
  
import { useRef, memo, useActionState } from 'react'
import Input from './ui/Input'
import Button from './ui/Button'
import Card from './ui/Card'
import { CATEGORIES } from '../constants'


function ExpenseForm({ onAddExpense }) {
  const titleInputRef = useRef(null) // forwarded through <Input> down to the real <input>
  const formRef = useRef(null)

  // // One handler for every field: the `name` attribute tells us which key to update.
  // function handleChange(event) {
  //   const { name, value } = event.target
  //   setForm((prev) => ({ ...prev, [name]: value }))  //the sqaure brackets are used to dynamically set the key in the object 
  //   //based on the name of the input field that triggered the change event. Dont be confused by the square brackets, they are not an array, 
  //   // they are used to compute the property name dynamically.
  // }

  // function handleSubmit(event) {
  //   event.preventDefault()
  //   if (!form.title || !form.amount || !form.date) return

  //   onAddExpense({
  //     ...form,
  //     id: crypto.randomUUID(),
  //     amount: parseFloat(form.amount),
  //   })

  //   setForm(emptyForm)
  //   titleInputRef.current.focus() // imperative DOM call — useState alone can't do this
  // }

   //React 19: introducing a new hook called useActionState, 
   // which is designed to simplify the management of form state and actions.

  // React calls this on submit with (previousState, formData). We don't need
    // previousState here, but the signature is fixed by useActionState.
    const [state, formAction, isPending] = useActionState(
      async (previousState, formData) => {
        const title = formData.get('title')?.trim()
        const amount = parseFloat(formData.get('amount'))
        const date = formData.get('date')
  
        if (!title || !amount || !date) {
          return { error: 'Title, amount, and date are required.' }
        }
  
         const newExpense = {
        id: crypto.randomUUID(),
        title,
        amount,
        category: formData.get('category'),
        date,
        note: formData.get('note') || '',
      }

    try {

        await onAddExpense(newExpense) // may reject — see fakeExpenseApi.js

      } catch (err) {

        return { error: 'Could not save the expense — please try again.' }

      }

        formRef.current.reset() // uncontrolled fields: reset via the real DOM form API
        titleInputRef.current.focus()
  
        return { error: null }
      },
      { error: null } // initial state, before any submit has happened
    )

  return (
      <Card>
        <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-2">
          <Input ref={titleInputRef} label="Title" name="title" placeholder="e.g. Groceries" />
          <Input label="Amount" name="amount" type="number" step="0.01" min="0" placeholder="0.00" />
  
          <div>
            <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">
              Category
            </label>
            <select
              name="category"
              defaultValue={CATEGORIES[0]}
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
  
          <Input label="Date" name="date" type="date" />
  
          <div className="sm:col-span-2">
            <Input label="Note (optional)" name="note" placeholder="Optional details" />
          </div>
  
          {state.error && (
            <p className="text-red-600 dark:text-red-400 text-sm sm:col-span-2">{state.error}</p>
          )}
  
          <Button type="submit" disabled={isPending} className="sm:col-span-2">
            {isPending ? 'Adding…' : 'Add Expense'}
          </Button>
        </form>
      </Card>
    )
  }
  
  // Pairs with useCallback in App: without a stable onAddExpense reference,
  // memo here would do nothing (a "new" function prop every render still counts
  // as a changed prop).
  export default memo(ExpenseForm)
  
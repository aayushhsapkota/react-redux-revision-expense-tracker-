import { useState, useRef, memo } from 'react'
import Input from './ui/Input'
import Button from './ui/Button'
import Card from './ui/Card'

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Shopping', 'Other']

const emptyForm = {
  title: '',
  amount: '',
  category: CATEGORIES[0],
  date: '',
  note: '',
}

function ExpenseForm({ onAddExpense }) {
  const [form, setForm] = useState(emptyForm)
  const titleInputRef = useRef(null) // forwarded through <Input> down to the real <input>

  // One handler for every field: the `name` attribute tells us which key to update.
  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))  //the sqaure brackets are used to dynamically set the key in the object 
    //based on the name of the input field that triggered the change event. Dont be confused by the square brackets, they are not an array, 
    // they are used to compute the property name dynamically.
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (!form.title || !form.amount || !form.date) return

    onAddExpense({
      ...form,
      id: crypto.randomUUID(),
      amount: parseFloat(form.amount),
    })

    setForm(emptyForm)
    titleInputRef.current.focus() // imperative DOM call — useState alone can't do this
  }

  return (
    <Card>
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 sm:grid-cols-2"
    >
      <Input
                ref={titleInputRef}
                label="Title"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Groceries"
              />
              <Input
                label="Amount"
                name="amount"
                type="number"
                step="0.01"
                min="0"
                value={form.amount}
                onChange={handleChange}
                placeholder="0.00"
              />
      

       {/* Not <Input> — it's a <select>, different element; only Button/Card/Input were asked for */}
        <div>
          <label className="block text-sm text-slate-600 mb-1">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="border border-slate-300 rounded px-3 py-2 w-full bg-white text-slate-800"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

       <Input
                label="Date"
                name="date"
                type="date"
                value={form.date}
                onChange={handleChange}
              />

     <div className="sm:col-span-2">
              <Input
                label="Note (optional)"
                name="note"
                value={form.note}
                onChange={handleChange}
                placeholder="Optional details"
              />
            </div>

   
           <Button type="submit" className="sm:col-span-2">
             Add Expense
           </Button>
         </form>
       </Card>
  )
}

// Pairs with useCallback in App: without a stable onAddExpense reference,
// memo here would do nothing (a "new" function prop every render still counts
// as a changed prop).
export default memo(ExpenseForm)
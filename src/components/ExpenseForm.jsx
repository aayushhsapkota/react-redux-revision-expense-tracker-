import { useState, useRef, useId } from 'react'

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
  const titleInputRef = useRef(null) // will point at the real <input> DOM node

  // Unique per component instance — used to safely link each <label> to its <input>.
  const id = useId()

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
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 sm:grid-cols-2 bg-white p-4 rounded-lg shadow"
    >
      <div>
        <label htmlFor={`${id}-title`} className="block text-sm text-slate-600 mb-1">
          Title
        </label>
        <input
          ref={titleInputRef}
          id={`${id}-title`}
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="e.g. Groceries"
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      <div>
        <label htmlFor={`${id}-amount`} className="block text-sm text-slate-600 mb-1">
          Amount
        </label>
        <input
          id={`${id}-amount`}
          name="amount"
          type="number"
          step="0.01"
          min="0"
          value={form.amount}
          onChange={handleChange}
          placeholder="0.00"
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      <div>
        <label htmlFor={`${id}-category`} className="block text-sm text-slate-600 mb-1">
          Category
        </label>
        <select
          id={`${id}-category`}
          name="category"
          value={form.category}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor={`${id}-date`} className="block text-sm text-slate-600 mb-1">
          Date
        </label>
        <input
          id={`${id}-date`}
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor={`${id}-note`} className="block text-sm text-slate-600 mb-1">
          Note (optional)
        </label>
        <input
          id={`${id}-note`}
          name="note"
          value={form.note}
          onChange={handleChange}
          placeholder="Optional details"
          className="border rounded px-3 py-2 w-full"
        />
      </div>

      <button
        type="submit"
        className="sm:col-span-2 bg-slate-800 text-white rounded px-3 py-2 hover:bg-slate-700"
      >
        Add Expense
      </button>
    </form>
  )
}

export default ExpenseForm
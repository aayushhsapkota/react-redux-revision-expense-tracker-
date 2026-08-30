import { useState } from 'react'

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

  // One handler for every field: the `name` attribute tells us which key to update.
  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault() // stop the browser's default full-page-reload submit
    if (!form.title || !form.amount || !form.date) return

    onAddExpense({
      ...form,
      id: crypto.randomUUID(),
      amount: parseFloat(form.amount),
    })

    setForm(emptyForm) // reset the form after adding
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-3 sm:grid-cols-2 bg-white p-4 rounded-lg shadow"
    >
      <input
        name="title"
        value={form.title}
        onChange={handleChange}
        placeholder="Title"
        className="border rounded px-3 py-2"
      />
      <input
        name="amount"
        type="number"
        step="0.01"
        min="0"
        value={form.amount}
        onChange={handleChange}
        placeholder="Amount"
        className="border rounded px-3 py-2"
      />
      <select
        name="category"
        value={form.category}
        onChange={handleChange}
        className="border rounded px-3 py-2"
      >
        {CATEGORIES.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
      <input
        name="date"
        type="date"
        value={form.date}
        onChange={handleChange}
        className="border rounded px-3 py-2"
      />
      <input
        name="note"
        value={form.note}
        onChange={handleChange}
        placeholder="Note (optional)"
        className="border rounded px-3 py-2 sm:col-span-2"
      />
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

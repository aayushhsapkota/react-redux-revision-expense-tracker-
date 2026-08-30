import { useState } from 'react'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'

function App() {
  // This is the "lifted" state — the single source of truth for the whole app.
  const [expenses, setExpenses] = useState([])

  function handleAddExpense(newExpense) {
    setExpenses((prev) => [newExpense, ...prev]) // newest first
  }

  const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-slate-800">Expense Tracker</h1>

        <ExpenseForm onAddExpense={handleAddExpense} />

        <div className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
          <span className="text-slate-600">Grand Total</span>
          <span className="text-xl font-bold text-slate-800">
            ${grandTotal.toFixed(2)}
          </span>
        </div>

        <ExpenseList expenses={expenses} />
      </div>
    </div>
  )
}

export default App

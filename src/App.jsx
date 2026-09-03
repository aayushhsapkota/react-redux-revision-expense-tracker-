import { useRef, useEffect } from 'react'
import useLocalStorage from './hooks/useLocalStorage'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'

function App() {
  // This is the "lifted" state — the single source of truth for the whole app.
  // Swapped useState for our custom hook — expenses now persist across reloads.
  const [expenses, setExpenses] = useLocalStorage('expenses', [])

  function handleAddExpense(newExpense) {
    setExpenses((prev) => [newExpense, ...prev]) // newest first
  }

  const grandTotal = expenses.reduce((sum, e) => sum + e.amount, 0)

  // useRef use #2: remember the PREVIOUS grand total across renders,
  // without causing an extra re-render just to store it.
  const prevTotalRef = useRef(grandTotal)
  useEffect(() => {
    prevTotalRef.current = grandTotal // runs AFTER this render is on screen
  })
  const previousTotal = prevTotalRef.current

  //Initially, grandTotal is calculated, and when calculating previousTotal initially, it gets the same initial value from the ref. 
  // The app renders, and since these values are equal in HTML, nothing visibly changes. 
  // When new expense is added and  causes a re-render, a new grandTotal is calculated, 
  // while previousTotal still holds the value from the previous render. 
  // After the new render is committed to the screen, useEffect runs and updates the ref with the current grandTotal, 
  // preparing it to be used as previousTotal in the next render. 
  // So essentially, we're storing the current total **for comparison during the next render**. 

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-slate-800">Expense Tracker</h1>

        <ExpenseForm onAddExpense={handleAddExpense} />

        <div className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
          <div>
            <span className="text-slate-600">Grand Total</span>
            {previousTotal !== grandTotal && ( //&& is being used for conditional rendering in React.
              <p className="text-xs text-slate-400">was ${previousTotal.toFixed(2)}</p>
            )}
          </div>
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
import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import useLocalStorage from './hooks/useLocalStorage'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import ExpenseFilters from './components/ExpenseFilters'
import Card from './components/ui/Card'

function App() {
  // This is the "lifted" state — the single source of truth for the whole app.
  // Swapped useState for our custom hook — expenses now persist across reloads.
  const [expenses, setExpenses] = useLocalStorage('expenses', [])
  const [filterBy, setFilterBy] = useState('') // '' means "all categories"
  const [sortBy, setSortBy] = useState('date-desc')

    // useCallback: keeps this function's IDENTITY stable across renders, so
    // the memo() on ExpenseForm actually works — otherwise every App render
    // (e.g. from changing the filter) would hand ExpenseForm a "new" function
    // prop and force it to re-render anyway.
    const handleAddExpense = useCallback((newExpense) => {
      setExpenses((prev) => [newExpense, ...prev]) //newest first
    }, [setExpenses])

// useMemo #1 — recompute only when `expenses` itself changes.
  const grandTotal = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  )

  // useMemo #2 — per-category breakdown, same reasoning.
    const categoryTotals = useMemo(() => {
      return expenses.reduce((totals, e) => {
        totals[e.category] = (totals[e.category] || 0) + e.amount
        return totals
      }, {})
    }, [expenses])

    // useMemo #3 — the filtered + sorted list the user actually sees.
      // Note: filter/sort here build a NEW array, but reuse the SAME expense
      // object references — which is exactly what lets ExpenseItem's memo() pay off.
      const visibleExpenses = useMemo(() => {
        const filtered = filterBy
          ? expenses.filter((e) => e.category === filterBy)
          : expenses
    
        const [field, direction] = sortBy.split('-')
    
        // `a` and `b` are the two expenses being compared.
        // `a - b` gives a negative number when `a` is smaller, so `a` comes first (ascending).
        // `b - a` does the opposite, putting the larger value first (descending).
        return [...filtered].sort((a, b) => {
          if (field === 'date') {
            return direction === 'asc'
              ? new Date(a.date) - new Date(b.date)
              : new Date(b.date) - new Date(a.date)
          }
          return direction === 'asc' ? a.amount - b.amount : b.amount - a.amount
        })
      }, [expenses, filterBy, sortBy])
    

  // useRef use #2: remember the PREVIOUS grand total across renders,
  // without causing an extra re-render just to store it.

    //Initially, grandTotal is calculated, and when calculating previousTotal initially, it gets the same initial value from the ref. 
  // The app renders, and since these values are equal in HTML, nothing visibly changes. 
  // When new expense is added and  causes a re-render, a new grandTotal is calculated, 
  // while previousTotal still holds the value from the previous render. 
  // After the new render is committed to the screen, useEffect runs and updates the ref with the current grandTotal, 
  // preparing it to be used as previousTotal in the next render. 
  // So essentially, we're storing the current total **for comparison during the next render**. 
  const prevTotalRef = useRef(grandTotal)
  useEffect(() => {
    prevTotalRef.current = grandTotal // runs AFTER this render is on screen
  })
  const previousTotal = prevTotalRef.current


  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-slate-800">Expense Tracker</h1>

        <ExpenseForm onAddExpense={handleAddExpense} />

        <ExpenseFilters
                  filterBy={filterBy}
                  onFilterChange={setFilterBy}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                />

        <Card className="flex justify-between items-center">
          <div>
            <span className="text-slate-600">Grand Total</span>
            {previousTotal !== grandTotal && ( //&& is being used for conditional rendering in React.
              <p className="text-xs text-slate-400">was ${previousTotal.toFixed(2)}</p>
            )}
          </div>
          <span className="text-xl font-bold text-slate-800">
            ${grandTotal.toFixed(2)}
          </span>
        </Card>
        
  {expenses.length > 0 && (
          <Card>
            <p className="text-slate-600 mb-2 text-sm">By category</p>
            <ul className="space-y-1 text-sm">
              {Object.entries(categoryTotals).map(([category, total]) => (
                <li key={category} className="flex justify-between">
                  <span className="text-slate-500">{category}</span>
                  <span className="font-medium text-slate-700">
                    ${total.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <ExpenseList expenses={visibleExpenses} />
      </div>
    </div>
  )
}

export default App
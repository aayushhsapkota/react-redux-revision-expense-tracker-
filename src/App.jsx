import { useRef, useEffect, useState, useMemo, useCallback, useOptimistic } from 'react'
import useLocalStorage from './hooks/useLocalStorage'
import { fakeSaveExpense } from './api/fakeExpenseApi'
import ExpenseForm from './components/ExpenseForm'
import ExpenseList from './components/ExpenseList'
import ExpenseFilters from './components/ExpenseFilters'
import ThemeToggle from './components/ThemeToggle'
import Card from './components/ui/Card'

function App() {
  // This is the "lifted" state — the single source of truth for the whole app.
  // Swapped useState for our custom hook — expenses now persist across reloads.
  const [expenses, setExpenses] = useLocalStorage('expenses', [])
  const [filterBy, setFilterBy] = useState('') // '' means "all categories"
  const [sortBy, setSortBy] = useState('date-desc')
  const [theme, setTheme] = useLocalStorage('theme', 'light') // reusing our Phase 2 hook

  //Look at the <html> element. If the current theme is dark,
  // add the dark class. Otherwise, remove the dark class.
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])


  function toggleTheme() {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

   // useOptimistic: shows a "hoped-for" expense immediately, tagged `pending: true`.
    // Once the real save (below) either commits `expenses` or fails, React
    // reconciles optimisticExpenses back to match reality automatically.
    const [optimisticExpenses, addOptimisticExpense] = useOptimistic(
      //the real current state
      expenses,
      //update function
      (current, newExpense) => [{ ...newExpense, pending: true }, ...current]
    )

  // useCallback: keeps this function's "identity" stable across renders, so
  // the memo() on ExpenseForm actually works — otherwise every App render
  // (e.g. from changing the filter) would hand ExpenseForm a "new" function
  // prop and force it to re-render anyway.

   // Now async: addOptimisticExpense runs FIRST and SYNCHRONOUSLY (required —
    // it must happen inside the same transition as the form Action, before any
    // await), then we await the fake network call, then commit for real.
    const handleAddExpense = useCallback(async (newExpense) => {
      addOptimisticExpense(newExpense)
      await fakeSaveExpense(newExpense) // throws ~15% of the time — see fakeExpenseApi.js
      setExpenses((prev) => [newExpense, ...prev]) //newest first
    }, [setExpenses, addOptimisticExpense])
  

 // useMemo #1 — recompute only when `optimisticExpenses` changes. Using the
   // optimistic array (not raw `expenses`) means a pending add is reflected
   // in the total immediately, not just once the fake save resolves.
   const grandTotal = useMemo(
     () => optimisticExpenses.reduce((sum, e) => sum + e.amount, 0),
     [optimisticExpenses]
   )

 // useMemo #2 — per-category breakdown, same reasoning.
  const categoryTotals = useMemo(() => {
    return optimisticExpenses.reduce((totals, e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount
      return totals
    }, {})
  }, [optimisticExpenses])

 // useMemo #3 — the filtered + sorted list the user actually sees.
   // Note: filter/sort here build a NEW array, but reuse the SAME expense
   // object references — which is exactly what lets ExpenseItem's memo() pay off.
   const visibleExpenses = useMemo(() => {
     const filtered = filterBy
           ? optimisticExpenses.filter((e) => e.category === filterBy)
           : optimisticExpenses
     
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
   }, [optimisticExpenses, filterBy, sortBy])
     
    

  // useRef use #2: remember the PREVIOUS grand total across renders,
  // without causing an extra re-render just to store it.
  //
  // Initially, grandTotal is calculated, and when calculating previousTotal initially,
  // it gets the same initial value from the ref.
  // The app renders, and since these values are equal in HTML, nothing visibly changes.
  // When a new expense is added and causes a re-render, a new grandTotal is calculated,
  // while previousTotal still holds the value from the previous render.
  // After the new render is committed to the screen, useEffect runs and updates the ref
  // with the current grandTotal, preparing it to be used as previousTotal in the next render.
  // So essentially, we're storing the current total **for comparison during the next render**.
  const prevTotalRef = useRef(grandTotal)
  useEffect(() => {
    prevTotalRef.current = grandTotal // runs AFTER this render is on screen
  })
  const previousTotal = prevTotalRef.current


  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-10 px-4 transition-colors">
      <div className="max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
            Expense Tracker
          </h1>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>

        <ExpenseForm onAddExpense={handleAddExpense} />

        <ExpenseFilters
                  filterBy={filterBy}
                  onFilterChange={setFilterBy}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                />

        <Card className="flex justify-between items-center">
          <div>
            <span className="text-slate-600 dark:text-slate-300">Grand Total</span>
            {previousTotal !== grandTotal && ( //&& is being used for conditional rendering in React.
              <p className="text-xs text-slate-400 dark:text-slate-500">was ${previousTotal.toFixed(2)}</p>
            )}
          </div>
          <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
            ${grandTotal.toFixed(2)}
          </span>
        </Card>
        
  {optimisticExpenses.length > 0 && (
          <Card>
            <p className="text-slate-600 dark:text-slate-300 mb-2 text-sm">By category</p>
            <ul className="space-y-1 text-sm">
              {Object.entries(categoryTotals).map(([category, total]) => (
                <li key={category} className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">{category}</span>
                  <span className="font-medium text-slate-700 dark:text-slate-200">
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
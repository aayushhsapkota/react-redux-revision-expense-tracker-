import {
  // useEffect, don't need becasue of RTK
  useState,
  useTransition,
} from "react";
import { useDispatch, useSelector } from 'react-redux'

import {
  setFilterBy,
  setSortBy,
  setSearchBy,
  setPage,
  getExpensePageSelector,
  getExpenseFilterBySelector,
  getExpenseSortBySelector,
  getExpenseSearchBySelector,
} from './stateManagement/slice/expenseSlice'

import { useGetExpensesQuery, useAddExpenseMutation } from './stateManagement/slice/expenseApiSlice'
import { logout, getAuthUserSelector } from './stateManagement/slice/authSlice'
import ExpenseForm from "./components/ExpenseForm";
import ExpenseList from "./components/ExpenseList";
import ExpenseFilters from "./components/ExpenseFilters";
import ThemeToggle from "./components/ThemeToggle";
import Card from "./components/ui/Card";
import Button from "./components/ui/Button";

function App() {
    const dispatch = useDispatch()
      const user = useSelector(getAuthUserSelector)
      // useSelector: each of these is its OWN subscription. If only `status`
      // changes, a component that only selected `total` doesn't re-render —
      // this is the fine-grained subscription Context's single `value` object
      // couldn't give us (Phase 6, Step 4).
      const page = useSelector(getExpensePageSelector)
      const filterBy = useSelector(getExpenseFilterBySelector)
      const sortBy = useSelector(getExpenseSortBySelector)
      const searchBy = useSelector(getExpenseSearchBySelector)


      // (RTK)Replaces: useSelector(data/status/pageCount/total/categoryTotals) AND
        // the useEffect that manually dispatched getAllExpenses. This hook does
        // both jobs — fetches on mount, refetches automatically if the args
        // change OR if a mutation invalidates its tag.
        const { data, isFetching } = useGetExpensesQuery({ page, filterBy, sortBy, searchBy })
        const expenses = data?.data ?? []
        const pageCount = data?.pageCount ?? 1
        const grandTotal = data?.total ?? 0
        const categoryTotals = data?.categoryTotals ?? {}

  const [addExpense] = useAddExpenseMutation()

    // searchInput stays LOCAL (raw typed value — must never lag). The
  // "committed" query now lives in REDUX (searchBy), dispatched inside a
  // transition — so Redux itself is the "committed" value, no separate
  // local searchQuery state needed like the Context version had.
  const [searchInput, setSearchInput] = useState("");
  const [isSearchPending, startTransition] = useTransition(); //isSearchPending is a boolean that indicates 
  //whether the transition is still ongoing or not. It can be used to show a loading indicator or disable certain UI elements while the transition is in progress.

  function handleSearchChange(value) {
    setSearchInput(value); // urgent — keeps the input responsive
    startTransition(() => {
      dispatch(setSearchBy({ title: value, note: value })); // non-urgent — updates the committed search query in Redux
      dispatch(setPage(1)); // new search — back to page 1
    });
  }

   function handleFilterChange(value) {
      dispatch(setFilterBy(value))
      dispatch(setPage(1)) // new filter — back to page 1
    }

  function handleSortChange(value) {
      dispatch(setSortBy(value))
    }
 

 async function handleAddExpense(newExpense) {
    // .unwrap() needed for the same reason as createAsyncThunk: mutation
    // triggers always resolve, even on failure — .unwrap() is what makes
    // this actually reject so ExpenseForm's try/catch still works.
    await addExpense(newExpense).unwrap()
  }

  return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 py-10 px-4 transition-colors">
        <div className="max-w-xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              Expense Tracker
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">{user?.name}</span>
              <Button variant="ghost" onClick={() => dispatch(logout())}>
                Log out
              </Button>
              <ThemeToggle />
            </div>
          </div>
  
          <ExpenseForm onAddExpense={handleAddExpense} />
  
          <ExpenseFilters
            filterBy={filterBy}
            onFilterChange={handleFilterChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            searchInput={searchInput}
            onSearchChange={handleSearchChange}
            isSearchPending={isSearchPending}
          />
  
          <Card className="flex justify-between items-center">
            <span className="text-slate-600 dark:text-slate-300">
              Grand Total {isFetching && <span className="text-xs">(loading…)</span>}
            </span>
            <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
              ${grandTotal.toFixed(2)}
            </span>
          </Card>
  
          {Object.keys(categoryTotals).length > 0 && (
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
  
          <ExpenseList expenses={expenses} />
  
          {pageCount > 1 && (
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                disabled={page <= 1}
                onClick={() => dispatch(setPage(page - 1))}
              >
                ← Prev
              </Button>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Page {page} of {pageCount}
              </span>
              <Button
                variant="ghost"
                disabled={page >= pageCount}
                onClick={() => dispatch(setPage(page + 1))}
              >
                Next →
              </Button>
            </div>
          )}
        </div>
      </div>
    )
  }
  
  export default App
  
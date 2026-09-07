import Card from './ui/Card'
import Input from './ui/Input'

import { CATEGORIES } from '../constants'

const CATEGORY_OPTIONS = ['All', ...CATEGORIES]

function ExpenseFilters({
  filterBy,
  onFilterChange,
  sortBy,
  onSortChange,
  searchInput,
  onSearchChange,
  isSearchPending,
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div>
        {/* Controlled on purpose — unlike the add-form fields (Phase 5 Form Actions),
            we DO need to react to every keystroke here, to filter live. */}
        <Input
          label={isSearchPending ? 'Search (updating…)' : 'Search'}
          value={searchInput}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search title or note"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">
            Category
          </label>
          <select
            value={filterBy}
            onChange={(e) => onFilterChange(e.target.value)}
            className="border border-slate-300 dark:border-slate-600 rounded px-3 py-2 w-full
              bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
          >
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat === 'All' ? '' : cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm text-slate-600 dark:text-slate-300 mb-1">
            Sort by
          </label>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="border border-slate-300 dark:border-slate-600 rounded px-3 py-2 w-full
              bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100"
          >
            <option value="date-desc">Date (newest first)</option>
            <option value="date-asc">Date (oldest first)</option>
            <option value="amount-desc">Amount (high to low)</option>
            <option value="amount-asc">Amount (low to high)</option>
          </select>
        </div>
      </div>
    </Card>
  )
}

export default ExpenseFilters

const CATEGORY_OPTIONS = ['All', 'Food', 'Transport', 'Bills', 'Shopping', 'Other']

function ExpenseFilters({ filterBy, onFilterChange, sortBy, onSortChange }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-lg shadow">
      <div className="flex-1">
        <label className="block text-sm text-slate-600 mb-1">Category</label>
        <select
          value={filterBy}
          onChange={(e) => onFilterChange(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
          {CATEGORY_OPTIONS.map((cat) => (
            <option key={cat} value={cat === 'All' ? '' : cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label className="block text-sm text-slate-600 mb-1">Sort by</label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="date-desc">Date (newest first)</option>
          <option value="date-asc">Date (oldest first)</option>
          <option value="amount-desc">Amount (high to low)</option>
          <option value="amount-asc">Amount (low to high)</option>
        </select>
      </div>
    </div>
  )
}

export default ExpenseFilters

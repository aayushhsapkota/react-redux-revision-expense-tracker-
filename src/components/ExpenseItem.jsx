import { memo } from 'react'

function ExpenseItem({ expense }) {
  const { title, amount, category, date, note } = expense

  return (
    <li className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 py-3 last:border-none">
      <div>
        <p className="font-medium text-slate-800 dark:text-slate-100">{title}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {category} · {date}
          {note && ` · ${note}`}
        </p>
      </div>
      <p className="font-semibold text-slate-800 dark:text-slate-100">${amount.toFixed(2)}</p>
    </li>
  )
}

// Real use case: when filterBy/sortBy change, the array is rebuilt, but most
// individual expense OBJECTS inside it are the same reference as before —
// so memo lets React skip re-rendering rows that didn't actually change.
export default memo(ExpenseItem)

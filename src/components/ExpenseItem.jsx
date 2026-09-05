import { memo } from 'react'

function ExpenseItem({ expense }) {
  const { title, amount, category, date, note, pending } = expense

  return (
    <li
      className={`flex items-center justify-between border-b border-slate-200 dark:border-slate-700 py-3 last:border-none ${
        pending ? 'opacity-50' : ''
      }`}
    >
      <div> 
        <p className="font-medium text-slate-800 dark:text-slate-100">
          {title}
          {pending && (
            <span className="ml-2 text-xs font-normal text-slate-400 dark:text-slate-500">
              Saving…
            </span>
          )}
        </p>
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

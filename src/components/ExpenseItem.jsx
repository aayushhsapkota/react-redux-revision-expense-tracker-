function ExpenseItem({ expense }) {
  const { title, amount, category, date, note } = expense

  return (
    <li className="flex items-center justify-between border-b border-slate-200 py-3 last:border-none">
      <div>
        <p className="font-medium text-slate-800">{title}</p>
        <p className="text-sm text-slate-500">
          {category} · {date}
          {note && ` · ${note}`}
        </p>
      </div>
      <p className="font-semibold text-slate-800">${amount.toFixed(2)}</p>
    </li>
  )
}

export default ExpenseItem

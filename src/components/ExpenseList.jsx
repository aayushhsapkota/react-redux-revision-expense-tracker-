import ExpenseItem from './ExpenseItem'

function ExpenseList({ expenses }) {
  if (expenses.length === 0) {
    return <p className="text-slate-500 italic">No expenses yet. Add one above.</p>
  }

  return (
    <ul>
      {expenses.map((expense) => (
        <ExpenseItem key={expense.id} expense={expense} />
      ))}
    </ul>
  )
}

export default ExpenseList

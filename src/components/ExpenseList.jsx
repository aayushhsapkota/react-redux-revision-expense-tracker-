import ExpenseItem from './ExpenseItem'
import Card from './ui/Card'

function ExpenseList({ expenses }) {
  if (expenses.length === 0) {
    return (
      <Card>
        <p className="text-slate-500 dark:text-slate-400 italic">
          No expenses yet. Add one above.
        </p>
      </Card>
    )
  }

  return (
    <Card>
      <ul>
        {expenses.map((expense) => (
          <ExpenseItem key={expense.id} expense={expense} />
        ))}
      </ul>
    </Card>
  )
}

export default ExpenseList

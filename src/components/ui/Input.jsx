import { forwardRef, useId } from 'react'

// forwardRef: unavoidable here — ExpenseForm needs a real DOM ref to this
// input to call .focus() on it (Phase 2), and plain function components
// can't receive `ref` as a normal prop.
const Input = forwardRef(function Input({ label, className = '', ...rest }, ref) {
  const id = useId()

  return (
    <div>
      <label htmlFor={id} className="block text-sm text-slate-600 dark:text-slate-300 mb-1">
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        className={`border border-slate-300 dark:border-slate-600 rounded px-3 py-2 w-full
          bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 ${className}`}
        {...rest}
      />
    </div>
  )
})

export default Input

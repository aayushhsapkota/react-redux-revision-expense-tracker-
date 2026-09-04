const VARIANTS = {
  primary: 'bg-slate-800 text-white hover:bg-slate-700',
  ghost: 'bg-transparent text-slate-600 hover:bg-slate-200',
}

function Button({ variant = 'primary', className = '', children, ...rest }) {
  return (
    <button
      className={`rounded px-3 py-2 font-medium transition-colors ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export default Button

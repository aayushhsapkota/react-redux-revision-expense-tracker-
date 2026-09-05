function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 p-4 rounded-lg shadow ${className}`}>
      {children}
    </div>
  )
}

export default Card

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white p-4 rounded-lg shadow ${className}`}>
      {children}
    </div>
  )
}

export default Card

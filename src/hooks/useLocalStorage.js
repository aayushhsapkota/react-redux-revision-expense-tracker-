import { useState, useEffect } from 'react'

function useLocalStorage(key, initialValue) {
  // Lazy initializer: this function only runs ONCE (on first render),
  // not on every re-render — important since reading localStorage has a cost.

  //When useState receives a function, React treats that function as a lazy initializer and
  // calls it to get the initial state. (This is how react works with useState, if you call only useState(initialValue),
  //  it will run on every render, which is not what we want here.)
  const [value, setValue] = useState(() => {
    try {
      const stored = window.localStorage.getItem(key)
      return stored ? JSON.parse(stored) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Runs after every render where `value` (or `key`) changed, and writes
  // the latest value out to localStorage — this IS the "sync with the
  // outside world" job that useEffect exists for.
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(`Error writing localStorage key "${key}":`, error)
    }
  }, [key, value])

  // Same shape as useState's return value, so it's a drop-in replacement.
  return [value, setValue]
}

export default useLocalStorage
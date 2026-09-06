import { createContext, useContext, useEffect, useCallback, useMemo } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useLocalStorage('theme', 'light')

  useEffect(() => {
     //Look at the <html> element. If the current theme is dark,
  // add the dark class. Otherwise, remove the dark class.
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Stabilized with useCallback so the context value below doesn't change
  // identity on every render for no reason — more on why this matters in Step 4.
  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [setTheme])

  // Every consumer of this context re-renders whenever THIS value object's
  // reference changes. Without useMemo, {theme, toggleTheme} would be a
  // brand-new object every render, even when theme didn't actually change.
  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider> //children refers to <App />.
}

// Custom hook wrapper: gives a clear, specific error if someone forgets the
// Provider, instead of a confusing "cannot read theme of null" somewhere deep.
//This can be moved hooks folder if you want to keep code clean. 
// But it's also fine to keep it here, since it's tightly coupled to the context itself.
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === null) {
    throw new Error('useTheme() must be called by a component inside <ThemeProvider>')
  }
  return context
}

import Button from './ui/Button'
import { useTheme } from '../context/ThemeContext'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme() // reads context directly — no props needed

  return (
    <Button variant="ghost" onClick={toggleTheme}>
      {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
    </Button>
  )
}

export default ThemeToggle

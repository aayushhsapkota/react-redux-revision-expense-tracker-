import Button from './ui/Button'

function ThemeToggle({ theme, onToggle }) {
  return (
    <Button variant="ghost" onClick={onToggle}>
      {theme === 'dark' ? '☀️ Light mode' : '🌙 Dark mode'}
    </Button>
  )
}

export default ThemeToggle

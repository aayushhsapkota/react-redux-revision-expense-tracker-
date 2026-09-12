import { useSelector } from 'react-redux'
import { getIsAuthenticatedSelector } from '../stateManagement/slice/authSlice'
import LoginForm from './LoginForm'
import App from '../App'

function AuthGate() {
  const isAuthenticated = useSelector(getIsAuthenticatedSelector)
  return isAuthenticated ? <App /> : <LoginForm />
}

export default AuthGate

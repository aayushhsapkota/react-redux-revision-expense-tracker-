import { useActionState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login, getAuthErrorSelector } from '../stateManagement/slice/authSlice'
import Card from './ui/Card'
import Input from './ui/Input'
import Button from './ui/Button'

function LoginForm() {
  const dispatch = useDispatch()
  const error = useSelector(getAuthErrorSelector) // set by authSlice's extraReducers on rejection

  // Same Form Action pattern from Phase 5 — dispatching login() here instead
  // of calling a prop function. We don't need .unwrap() (a createAsyncThunk
  // thing): the form doesn't need to catch anything itself, since `error`
  // above updates reactively from the store the moment the thunk rejects.
  const [, formAction, isPending] = useActionState(async (previousState, formData) => {
    const email = formData.get('email')
    const password = formData.get('password')
    await dispatch(login({ email, password }))
    return null
  }, null)

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">
          Log in to Expense Tracker
        </h1>
        <form action={formAction} className="space-y-3">
          <Input label="Email" name="email" type="email" placeholder="demo@example.com" />
          <Input label="Password" name="password" type="password" placeholder="password123" />
          {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? 'Logging in…' : 'Log in'}
          </Button>
        </form>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
          Demo credentials: demo@example.com / password123
        </p>
      </Card>
    </div>
  )
}

export default LoginForm

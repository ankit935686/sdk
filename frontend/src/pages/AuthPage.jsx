import { Link, useNavigate } from 'react-router-dom'
import { AuthModal } from '../components/auth/AuthModal'
import { useAuth } from '../hooks/useAuth'
import { useState } from 'react'

export function AuthPage({ mode }) {
  const navigate = useNavigate()
  const { authenticate } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(credentials) {
    setError('')
    setLoading(true)
    try {
      await authenticate(mode, credentials)
      navigate('/dashboard', { replace: true })
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return <main className="min-h-screen bg-[#e6efdf] px-5 py-8"><div className="mx-auto max-w-5xl"><Link className="flex w-fit items-center gap-2 text-xl font-bold tracking-tight text-[#202d26]" to="/"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[#ed6a45] text-lg text-white">+</span>platera</Link><div className="mt-10 min-h-[650px] overflow-hidden rounded-[2rem] bg-[#fbfaf7] shadow-xl"><AuthModal mode={mode} error={error} loading={loading} onClose={() => navigate('/')} onModeChange={(nextMode) => { setError(''); navigate(`/${nextMode}`) }} onSubmit={handleSubmit} /></div></div></main>
}

import { useState } from 'react'

export function AuthModal({ mode, error, loading, onClose, onModeChange, onSubmit }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSubmit(form)
  }

  return <div className="fixed inset-0 z-30 grid place-items-center bg-[#202d26]/50 px-5" role="dialog" aria-modal="true" aria-labelledby="auth-title"><div className="relative w-full max-w-md rounded-3xl bg-[#fbfaf7] p-7 shadow-2xl"><button onClick={onClose} aria-label="Close authentication dialog" className="absolute right-5 top-5 text-2xl text-[#79857d]">×</button><p className="text-sm font-bold uppercase tracking-[.16em] text-[#ed6a45]">Welcome to platera</p><h2 id="auth-title" className="mt-3 text-3xl font-black tracking-[-.04em]">{mode === 'login' ? 'Log in to order' : 'Create your account'}</h2><p className="mt-2 text-sm text-[#79857d]">{mode === 'login' ? 'Pick up where you left off.' : 'Save your details for a faster checkout.'}</p><form onSubmit={handleSubmit} className="mt-7 space-y-4">{mode === 'signup' && <input required minLength="2" name="name" value={form.name} onChange={handleChange} placeholder="Full name" className="w-full rounded-xl border border-[#dfe4dd] bg-white px-4 py-3 outline-none focus:border-[#ed6a45]" />}<input required type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email address" className="w-full rounded-xl border border-[#dfe4dd] bg-white px-4 py-3 outline-none focus:border-[#ed6a45]" /><input required minLength="8" type="password" name="password" value={form.password} onChange={handleChange} placeholder="Password (8+ characters)" className="w-full rounded-xl border border-[#dfe4dd] bg-white px-4 py-3 outline-none focus:border-[#ed6a45]" />{error && <p className="text-sm font-semibold text-[#c84d32]">{error}</p>}<button disabled={loading} className="w-full rounded-xl bg-[#ed6a45] px-4 py-3 font-bold text-white disabled:cursor-wait disabled:opacity-60">{loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}</button></form><p className="mt-5 text-center text-sm text-[#79857d]">{mode === 'login' ? 'New to platera?' : 'Already have an account?'} <button onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')} className="font-bold text-[#ed6a45]">{mode === 'login' ? 'Sign up' : 'Log in'}</button></p></div></div>
}

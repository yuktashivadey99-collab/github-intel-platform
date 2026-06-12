import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Github, User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import './Auth.css'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page page">
      <div className="auth-bg" aria-hidden="true">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
      </div>

      <div className="container-sm auth-container">
        <div className="auth-card glass animate-fade-up">

          <div className="auth-header">
            <div className="auth-logo">
              <Github size={22} />
            </div>
            <h1 className="auth-title">Create your account</h1>
            <p className="auth-subtitle">Start analyzing repositories in seconds</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="input-group">
              <label className="input-label">Full name</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input className="input input-padded" type="text" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required autoFocus />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Email address</label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input className="input input-padded" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password <span className="text-muted text-xs">(min. 8 characters)</span></label>
              <div className="input-with-icon">
                <Lock size={16} className="input-icon" />
                <input className="input input-padded input-padded-right" type={showPass ? 'text' : 'password'} name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required minLength={8} />
                <button type="button" className="input-eye" onClick={() => setShowPass(!showPass)} tabIndex={-1}>
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
              {loading ? <span className="spinner" /> : <>Create Account <ArrowRight size={17} /></>}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login" className="auth-link">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  )
}

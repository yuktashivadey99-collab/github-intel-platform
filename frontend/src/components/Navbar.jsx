import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Github, BarChart2, LogOut, User, Menu, X, Zap } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location.pathname])

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-inner container">

        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <div className="navbar-logo-icon">
            <Github size={18} />
          </div>
          <span className="navbar-logo-text">
            Git<span className="gradient-text">Intel</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/dashboard" className={`navbar-link ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                Dashboard
              </Link>
              <Link to="/analyze" className={`navbar-link ${location.pathname === '/analyze' ? 'active' : ''}`}>
                Analyze
              </Link>
            </>
          ) : (
            <>
              <a href="#features" className="navbar-link">Features</a>
              <a href="#how-it-works" className="navbar-link">How it Works</a>
            </>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="navbar-actions">
          {user ? (
            <>
              <Link to="/analyze" className="btn btn-primary btn-sm">
                <Zap size={14} /> Analyze Repo
              </Link>
              <div className="navbar-user">
                <div className="navbar-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <button onClick={handleLogout} className="btn btn-ghost btn-sm btn-icon" title="Logout">
                  <LogOut size={15} />
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="navbar-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="navbar-mobile">
          {user ? (
            <>
              <Link to="/dashboard" className="navbar-mobile-link">Dashboard</Link>
              <Link to="/analyze" className="navbar-mobile-link">Analyze Repo</Link>
              <button onClick={handleLogout} className="navbar-mobile-link navbar-mobile-logout">
                <LogOut size={15} /> Sign Out
              </button>
            </>
          ) : (
            <>
              <a href="#features" className="navbar-mobile-link">Features</a>
              <Link to="/login" className="navbar-mobile-link">Sign In</Link>
              <Link to="/register" className="navbar-mobile-link navbar-mobile-cta">Get Started Free</Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}

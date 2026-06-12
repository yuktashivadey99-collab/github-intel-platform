import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Github, Zap, Shield, BarChart2, Brain, GitCommit,
  Users, FileText, ChevronRight, Star, ArrowRight, Code2
} from 'lucide-react'
import './Landing.css'

const FEATURES = [
  { icon: <BarChart2 size={22} />, title: 'Health Score', desc: 'Composite 0–100 score across activity, community, and maintenance dimensions.' },
  { icon: <GitCommit size={22} />, title: 'Commit Intelligence', desc: 'Commit frequency, consistency, conventional commit adoption, and peak activity patterns.' },
  { icon: <Users size={22} />, title: 'Contributor Analysis', desc: 'Bus factor risk, distribution health, and top contributor breakdown.' },
  { icon: <FileText size={22} />, title: 'Doc Quality', desc: 'README, LICENSE, CONTRIBUTING, security policy, and issue template presence scoring.' },
  { icon: <Code2 size={22} />, title: 'Tech Detection', desc: 'Automatic language, framework, and CI/CD tooling classification from repo structure.' },
  { icon: <Brain size={22} />, title: 'AI Insights', desc: 'Gemini-powered executive summary, strengths, weaknesses, and actionable recommendations.' },
]

const STATS = [
  { value: '6', label: 'Analysis Dimensions' },
  { value: 'AI', label: 'Powered Insights' },
  { value: '100', label: 'Point Health Score' },
  { value: '<30s', label: 'Analysis Time' },
]

export default function Landing() {
  const { user } = useAuth()

  return (
    <div className="landing">

      {/* ─── Hero ───────────────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg" aria-hidden="true">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-orb hero-orb-3" />
          <div className="hero-grid" />
        </div>

        <div className="container hero-content">
          <div className="hero-badge animate-fade-up">
            <Zap size={13} />
            <span>ML + AI Powered Repository Analysis</span>
          </div>

          <h1 className="hero-title animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Understand Any GitHub<br />
            <span className="gradient-text">Repository in Seconds</span>
          </h1>

          <p className="hero-subtitle animate-fade-up" style={{ animationDelay: '0.2s' }}>
            Paste a GitHub URL and get a comprehensive intelligence report — health scores,
            commit patterns, contributor insights, tech stack detection, and AI-powered
            recommendations — all in one beautiful dashboard.
          </p>

          <div className="hero-actions animate-fade-up" style={{ animationDelay: '0.3s' }}>
            {user ? (
              <Link to="/analyze" className="btn btn-primary btn-lg">
                Analyze a Repository <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary btn-lg">
                  Start for Free <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-ghost btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Mock URL Input Preview */}
          <div className="hero-demo animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <div className="hero-demo-bar">
              <Github size={16} className="hero-demo-icon" />
              <span className="hero-demo-url font-mono">https://github.com/facebook/react</span>
              <div className="hero-demo-btn">
                <Zap size={13} /> Analyze
              </div>
            </div>
            <div className="hero-demo-tags">
              {['Health: 87/100', 'JavaScript', 'React', 'MIT License', 'GitHub Actions'].map(t => (
                <span key={t} className="hero-demo-tag">{t}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ──────────────────────────────────────────────────── */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {STATS.map(({ value, label }) => (
              <div key={label} className="stat-card glass">
                <div className="stat-value gradient-text">{value}</div>
                <div className="stat-label">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────────────── */}
      <section className="features-section" id="features">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">What We Analyze</span>
            <h2 className="section-title">
              Six Dimensions of<br />
              <span className="gradient-text">Repository Intelligence</span>
            </h2>
            <p className="section-subtitle">
              Every analysis runs all six ML models plus an AI pass to give you a complete picture.
            </p>
          </div>

          <div className="features-grid">
            {FEATURES.map(({ icon, title, desc }, i) => (
              <div
                key={title}
                className="feature-card glass"
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className="feature-icon">{icon}</div>
                <h3 className="feature-title">{title}</h3>
                <p className="feature-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ───────────────────────────────────────────── */}
      <section className="how-section" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-eyebrow">How It Works</span>
            <h2 className="section-title">Three Steps to <span className="gradient-text">Deep Insights</span></h2>
          </div>

          <div className="steps-grid">
            {[
              { num: '01', title: 'Paste the URL', desc: 'Enter any public GitHub repository URL. Optionally provide your GitHub token for private repos or higher rate limits.' },
              { num: '02', title: 'ML + AI Analysis', desc: 'Our backend fetches data via GitHub API, runs 5 ML models in parallel, then calls Gemini AI for executive insights.' },
              { num: '03', title: 'View Your Report', desc: 'Get a comprehensive visual report with scores, charts, and AI recommendations you can act on immediately.' },
            ].map(({ num, title, desc }) => (
              <div key={num} className="step-card glass">
                <div className="step-num gradient-text">{num}</div>
                <h3 className="step-title">{title}</h3>
                <p className="step-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────────── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card glass">
            <div className="cta-orb" aria-hidden="true" />
            <Shield size={40} className="cta-icon" />
            <h2 className="cta-title">Ready to Understand Your Codebase?</h2>
            <p className="cta-subtitle">
              Join developers who use GitIntel to evaluate repos before contributing, auditing, or hiring.
            </p>
            {user ? (
              <Link to="/analyze" className="btn btn-primary btn-lg">
                Analyze a Repo Now <ArrowRight size={18} />
              </Link>
            ) : (
              <Link to="/register" className="btn btn-primary btn-lg">
                Get Started for Free <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <footer className="footer">
        <div className="container footer-inner">
          <div className="navbar-logo">
            <div className="navbar-logo-icon" style={{ width: 28, height: 28 }}>
              <Github size={14} />
            </div>
            <span className="navbar-logo-text" style={{ fontSize: '1rem' }}>
              Git<span className="gradient-text">Intel</span>
            </span>
          </div>
          <p className="footer-copy">© 2026 GitIntel. Repository Intelligence Platform.</p>
        </div>
      </footer>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import { Github, Zap, CheckCircle, Loader, AlertCircle, ArrowRight, Search } from 'lucide-react'
import './Analyze.css'

const STEPS = [
  { id: 'fetch',    label: 'Fetching GitHub Data',    desc: 'Pulling metadata, commits, contributors...' },
  { id: 'ml',       label: 'Running ML Analysis',      desc: 'Health score, patterns, classification...' },
  { id: 'ai',       label: 'Generating AI Insights',   desc: 'Gemini summarizing strengths & recommendations...' },
  { id: 'done',     label: 'Analysis Complete',         desc: 'Building your report...' },
]

const EXAMPLE_REPOS = [
  'https://github.com/facebook/react',
  'https://github.com/vercel/next.js',
  'https://github.com/vuejs/vue',
  'https://github.com/expressjs/express',
  'https://github.com/torvalds/linux',
]

export default function Analyze() {
  const navigate = useNavigate()
  const [repoUrl, setRepoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [analysisId, setAnalysisId] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [polling, setPolling] = useState(false)

  const isValidUrl = (url) =>
    /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/.test(url.trim())

  const handleSubmit = async (e) => {
    e.preventDefault()
    const url = repoUrl.trim()
    if (!isValidUrl(url)) {
      setError('Please enter a valid GitHub repository URL (e.g. https://github.com/owner/repo)')
      return
    }
    setError('')
    setLoading(true)
    setCurrentStep(0)

    try {
      // Submit analysis
      const res = await api.post('/repo/analyze', { repoUrl: url, includeAiInsights: true })
      const id = res.data.data.analysisId
      setAnalysisId(id)

      // Simulate step progression while polling
      setCurrentStep(1)
      setPolling(true)

      let step = 1
      const stepTimer = setInterval(() => {
        step = Math.min(step + 1, 3)
        setCurrentStep(step)
      }, 6000)

      // Poll for completion
      let attempts = 0
      const poll = setInterval(async () => {
        attempts++
        try {
          const r = await api.get(`/repo/analyses/${id}`)
          const status = r.data.data.analysis.status

          if (status === 'completed') {
            clearInterval(poll)
            clearInterval(stepTimer)
            setCurrentStep(4)
            setTimeout(() => navigate(`/analysis/${id}`), 1200)
          } else if (status === 'failed') {
            clearInterval(poll)
            clearInterval(stepTimer)
            setError('Analysis failed. Please try again.')
            setLoading(false)
            setPolling(false)
          } else if (attempts > 40) {
            clearInterval(poll)
            clearInterval(stepTimer)
            setError('Analysis is taking longer than expected. Check back in your dashboard.')
            setLoading(false)
            setPolling(false)
          }
        } catch { /* keep polling */ }
      }, 3000)

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start analysis. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="page analyze-page">
      <div className="analyze-bg" aria-hidden="true">
        <div className="analyze-orb-1" />
        <div className="analyze-orb-2" />
      </div>

      <div className="container-md">

        {/* Header */}
        <div className="analyze-header animate-fade-up">
          <div className="analyze-badge">
            <Zap size={13} /> Repository Intelligence
          </div>
          <h1 className="analyze-title">
            Analyze Any GitHub<br />
            <span className="gradient-text">Repository</span>
          </h1>
          <p className="analyze-subtitle">
            Enter a public GitHub URL below. We'll run 5 ML models and AI analysis
            to give you a complete intelligence report in under 30 seconds.
          </p>
        </div>

        {/* Input Card */}
        {!polling && (
          <div className="analyze-card glass animate-fade-up" style={{ animationDelay: '0.15s' }}>
            <form onSubmit={handleSubmit} className="analyze-form">
              <div className="analyze-input-wrap">
                <Github size={18} className="analyze-input-icon" />
                <input
                  className="analyze-input"
                  type="url"
                  value={repoUrl}
                  onChange={e => { setRepoUrl(e.target.value); setError('') }}
                  placeholder="https://github.com/owner/repository"
                  disabled={loading}
                  autoFocus
                />
                <button
                  type="submit"
                  className="btn btn-primary analyze-submit-btn"
                  disabled={loading || !repoUrl.trim()}
                >
                  {loading
                    ? <><span className="spinner" /> Starting...</>
                    : <><Zap size={16} /> Analyze <ArrowRight size={15} /></>
                  }
                </button>
              </div>

              {error && (
                <div className="analyze-error">
                  <AlertCircle size={15} /> {error}
                </div>
              )}
            </form>

            {/* Example repos */}
            <div className="analyze-examples">
              <span className="analyze-examples-label">Try an example:</span>
              <div className="analyze-examples-list">
                {EXAMPLE_REPOS.map(url => {
                  const name = url.replace('https://github.com/', '')
                  return (
                    <button
                      key={url}
                      className="analyze-example-btn"
                      onClick={() => setRepoUrl(url)}
                      disabled={loading}
                    >
                      {name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        {polling && (
          <div className="analyze-progress glass animate-fade-up">
            <div className="analyze-progress-header">
              <div className="analyze-progress-icon">
                <Loader size={22} className="spin-icon" />
              </div>
              <div>
                <h2 className="analyze-progress-title">Analysis in Progress</h2>
                <p className="text-secondary text-sm font-mono">{repoUrl}</p>
              </div>
            </div>

            <div className="analyze-steps">
              {STEPS.map((step, i) => {
                const isDone    = currentStep > i + 1
                const isActive  = currentStep === i + 1
                const isPending = currentStep < i + 1
                return (
                  <div key={step.id} className={`analyze-step ${isDone ? 'step-done' : isActive ? 'step-active' : 'step-pending'}`}>
                    <div className="analyze-step-indicator">
                      {isDone
                        ? <CheckCircle size={18} />
                        : isActive
                          ? <Loader size={18} className="spin-icon" />
                          : <div className="step-dot" />
                      }
                    </div>
                    <div className="analyze-step-content">
                      <div className="analyze-step-label">{step.label}</div>
                      {isActive && <div className="analyze-step-desc">{step.desc}</div>}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Progress bar */}
            <div className="analyze-progress-bar-wrap">
              <div
                className="analyze-progress-bar-fill"
                style={{ width: `${Math.min((currentStep / 4) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Info Cards */}
        {!polling && (
          <div className="analyze-info-grid animate-fade-up" style={{ animationDelay: '0.25s' }}>
            {[
              { icon: <Search size={16} />, title: '5 ML Models',     desc: 'Health, commits, contributors, docs, tech stack' },
              { icon: <Zap size={16} />,    title: 'AI Insights',      desc: 'Gemini generates executive summary & recommendations' },
              { icon: <Github size={16} />, title: 'GitHub API',       desc: 'Up to 5,000 requests/hr with your personal token' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="analyze-info-card glass">
                <div className="analyze-info-icon">{icon}</div>
                <div>
                  <div className="analyze-info-title">{title}</div>
                  <div className="analyze-info-desc">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

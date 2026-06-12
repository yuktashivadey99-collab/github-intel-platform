import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'
import {
  Zap, BarChart2, Clock, CheckCircle, XCircle,
  Loader, Github, ArrowRight, Plus, TrendingUp
} from 'lucide-react'
import './Dashboard.css'

const STATUS_CONFIG = {
  completed: { label: 'Completed', color: 'badge-success', icon: <CheckCircle size={11} /> },
  processing: { label: 'Processing', color: 'badge-info', icon: <Loader size={11} className="spin-icon" /> },
  pending:    { label: 'Pending',    color: 'badge-warning', icon: <Clock size={11} /> },
  failed:     { label: 'Failed',     color: 'badge-danger',  icon: <XCircle size={11} /> },
}

const getScoreClass = (score) => {
  if (score >= 80) return 'score-excellent'
  if (score >= 60) return 'score-good'
  if (score >= 40) return 'score-fair'
  return 'score-poor'
}

const formatDate = (iso) => new Date(iso).toLocaleDateString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric'
})

export default function Dashboard() {
  const { user } = useAuth()
  const [analyses, setAnalyses] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, completed: 0, avgScore: 0 })

  useEffect(() => {
    api.get('/repo/analyses?limit=20')
      .then(res => {
        const data = res.data.data.analyses || []
        setAnalyses(data)
        const completed = data.filter(a => a.status === 'completed')
        const avgScore = completed.length
          ? Math.round(completed.reduce((s, a) => s + (a.mlResults?.healthScore?.score || 0), 0) / completed.length)
          : 0
        setStats({ total: data.length, completed: completed.length, avgScore })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page dashboard">
      <div className="container">

        {/* Header */}
        <div className="dashboard-header animate-fade-up">
          <div>
            <h1 className="dashboard-title">
              Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>
            </h1>
            <p className="text-secondary">Here's an overview of your repository analyses.</p>
          </div>
          <Link to="/analyze" className="btn btn-primary">
            <Plus size={16} /> New Analysis
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="dash-stats animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="dash-stat glass">
            <div className="dash-stat-icon dash-stat-icon-primary"><BarChart2 size={20} /></div>
            <div>
              <div className="dash-stat-value">{stats.total}</div>
              <div className="dash-stat-label">Total Analyses</div>
            </div>
          </div>
          <div className="dash-stat glass">
            <div className="dash-stat-icon dash-stat-icon-success"><CheckCircle size={20} /></div>
            <div>
              <div className="dash-stat-value">{stats.completed}</div>
              <div className="dash-stat-label">Completed</div>
            </div>
          </div>
          <div className="dash-stat glass">
            <div className="dash-stat-icon dash-stat-icon-accent"><TrendingUp size={20} /></div>
            <div>
              <div className={`dash-stat-value ${getScoreClass(stats.avgScore)}`}>
                {stats.avgScore || '—'}
              </div>
              <div className="dash-stat-label">Avg Health Score</div>
            </div>
          </div>
          <div className="dash-stat glass">
            <div className="dash-stat-icon dash-stat-icon-warn"><Zap size={20} /></div>
            <div>
              <div className="dash-stat-value">{user?.analysisCount || 0}</div>
              <div className="dash-stat-label">All-time Runs</div>
            </div>
          </div>
        </div>

        {/* Analyses Table */}
        <div className="dash-table-card glass animate-fade-up" style={{ animationDelay: '0.2s' }}>
          <div className="dash-table-header">
            <h2 className="dash-table-title">Recent Analyses</h2>
            <Link to="/analyze" className="btn btn-ghost btn-sm">
              <Plus size={14} /> New
            </Link>
          </div>

          {loading ? (
            <div className="dash-loading">
              <div className="spinner" style={{ width: 32, height: 32 }} />
              <p className="text-muted">Loading analyses...</p>
            </div>
          ) : analyses.length === 0 ? (
            <div className="dash-empty">
              <Github size={48} className="dash-empty-icon" />
              <h3>No analyses yet</h3>
              <p className="text-secondary">Analyze your first GitHub repository to get started.</p>
              <Link to="/analyze" className="btn btn-primary mt-4">
                <Zap size={15} /> Analyze a Repository
              </Link>
            </div>
          ) : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Repository</th>
                    <th>Status</th>
                    <th>Health Score</th>
                    <th>Language</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {analyses.map(a => {
                    const status = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending
                    const score = a.mlResults?.healthScore?.score
                    return (
                      <tr key={a._id} className="dash-table-row">
                        <td>
                          <div className="dash-repo-name">
                            <Github size={14} className="text-muted" />
                            <span className="font-mono text-sm truncate">
                              {a.repoOwner}/{a.repoName}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${status.color}`}>
                            {status.icon} {status.label}
                          </span>
                        </td>
                        <td>
                          {score != null ? (
                            <span className={`dash-score ${getScoreClass(score)}`}>
                              {score}<span className="dash-score-max">/100</span>
                            </span>
                          ) : (
                            <span className="text-muted">—</span>
                          )}
                        </td>
                        <td>
                          <span className="text-secondary text-sm">
                            {a.repoMetadata?.language || '—'}
                          </span>
                        </td>
                        <td>
                          <span className="text-muted text-sm">{formatDate(a.createdAt)}</span>
                        </td>
                        <td>
                          {a.status === 'completed' && (
                            <Link to={`/analysis/${a._id}`} className="btn btn-ghost btn-sm">
                              View <ArrowRight size={13} />
                            </Link>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

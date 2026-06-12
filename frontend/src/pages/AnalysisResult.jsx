import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api/client'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'
import {
  Github, Star, GitFork, AlertCircle, FileText, Activity, Users,
  CheckCircle, XCircle, ArrowLeft, Brain, Cpu, BookOpen, ShieldAlert
} from 'lucide-react'
import './AnalysisResult.css'

const ScoreCircle = ({ score, size = 120 }) => {
  const radius = (size - 10) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#06b6d4' : score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <div className="score-circle-wrap" style={{ width: size, height: size }}>
      <svg className="score-svg" width={size} height={size}>
        <circle className="score-bg" cx={size/2} cy={size/2} r={radius} strokeWidth="6" />
        <circle
          className="score-progress"
          cx={size/2} cy={size/2} r={radius}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          stroke={color}
          transform={`rotate(-90 ${size/2} ${size/2})`}
        />
      </svg>
      <div className="score-text">
        <span className="score-num" style={{ color }}>{score}</span>
        <span className="score-max">/100</span>
      </div>
    </div>
  )
}

export default function AnalysisResult() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/repo/analyses/${id}`)
      .then(res => setData(res.data.data.analysis))
      .catch(err => setError(err.response?.data?.message || 'Failed to load analysis'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="page result-loading">
        <div className="spinner" style={{ width: 40, height: 40, borderTopColor: 'var(--primary)' }} />
        <p>Loading analysis results...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="page result-error">
        <AlertCircle size={40} className="text-danger mb-4" />
        <h2>Analysis Not Found</h2>
        <p className="text-secondary">{error}</p>
        <Link to="/analyze" className="btn btn-primary mt-6">Back to Analyze</Link>
      </div>
    )
  }

  const { repoOwner, repoName, repoMetadata, mlResults, aiInsights } = data

  // Prepare Radar Chart Data
  const radarData = [
    { subject: 'Maintenance', A: mlResults?.healthScore?.details?.maintenance || 0, fullMark: 100 },
    { subject: 'Community', A: mlResults?.healthScore?.details?.community || 0, fullMark: 100 },
    { subject: 'Activity', A: mlResults?.healthScore?.details?.activity || 0, fullMark: 100 },
    { subject: 'Documentation', A: mlResults?.docQuality?.overallScore || 0, fullMark: 100 },
    { subject: 'Commit Consistency', A: mlResults?.commitPatterns?.consistency || 0, fullMark: 100 },
  ]

  // Prepare Contributor Chart Data
  const topContributors = mlResults?.contributors?.topContributors || []
  const barData = topContributors.slice(0, 5).map(c => ({
    name: c.login,
    commits: c.contributions
  }))

  return (
    <div className="page result-page">
      <div className="container">
        
        {/* Top Nav */}
        <div className="result-nav animate-fade-in">
          <Link to="/dashboard" className="btn btn-ghost btn-sm">
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <span className={`badge ${data.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
            {data.status.toUpperCase()}
          </span>
        </div>

        {/* Header (Repo Meta) */}
        <div className="result-header glass animate-fade-up">
          <div className="result-title-row">
            <div className="result-repo-icon"><Github size={24} /></div>
            <div>
              <h1 className="result-repo-name">
                <a href={repoMetadata?.url} target="_blank" rel="noreferrer" className="hover-link">
                  {repoOwner} / <span className="gradient-text">{repoName}</span>
                </a>
              </h1>
              <p className="result-repo-desc text-secondary">{repoMetadata?.description || 'No description provided.'}</p>
            </div>
          </div>

          <div className="result-meta-stats">
            <div className="meta-stat"><Star size={14} className="text-warning"/> {repoMetadata?.stars || 0}</div>
            <div className="meta-stat"><GitFork size={14} className="text-muted"/> {repoMetadata?.forks || 0}</div>
            <div className="meta-stat"><AlertCircle size={14} className="text-danger"/> {repoMetadata?.openIssues || 0} Issues</div>
            {repoMetadata?.language && (
              <div className="badge badge-info">{repoMetadata.language}</div>
            )}
            {repoMetadata?.license && (
              <div className="badge badge-muted">{repoMetadata.license}</div>
            )}
          </div>
        </div>

        <div className="result-grid">
          
          {/* Main Column */}
          <div className="result-main">
            
            {/* AI Insights Card */}
            {aiInsights && (
              <div className="result-card glass animate-fade-up" style={{ animationDelay: '0.1s' }}>
                <div className="card-header border-b">
                  <div className="card-title"><Brain size={18} className="text-primary-light" /> AI Executive Summary</div>
                </div>
                <div className="card-body">
                  <p className="ai-summary">{aiInsights.summary}</p>
                  
                  <div className="ai-grid mt-6">
                    <div className="ai-box ai-strengths">
                      <h4 className="ai-box-title text-success"><CheckCircle size={14}/> Key Strengths</h4>
                      <ul className="ai-list">
                        {aiInsights.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                    <div className="ai-box ai-weaknesses">
                      <h4 className="ai-box-title text-warning"><AlertCircle size={14}/> Weaknesses</h4>
                      <ul className="ai-list">
                        {aiInsights.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  </div>

                  {aiInsights.recommendations?.length > 0 && (
                    <div className="ai-box ai-recommendations mt-4">
                      <h4 className="ai-box-title text-accent"><Activity size={14}/> Recommendations</h4>
                      <ul className="ai-list">
                        {aiInsights.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                      </ul>
                    </div>
                  )}

                  {aiInsights.securityFlags?.length > 0 && (
                    <div className="ai-box ai-security mt-4">
                      <h4 className="ai-box-title text-danger"><ShieldAlert size={14}/> Security Flags</h4>
                      <ul className="ai-list">
                        {aiInsights.securityFlags.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid-2">
              {/* Commit Patterns */}
              <div className="result-card glass animate-fade-up" style={{ animationDelay: '0.2s' }}>
                <div className="card-header border-b">
                  <div className="card-title"><Activity size={18} className="text-accent" /> Commit Patterns</div>
                </div>
                <div className="card-body">
                  <div className="metric-row">
                    <span className="text-secondary">Frequency</span>
                    <span className="font-mono">{mlResults?.commitPatterns?.frequency || 'N/A'}</span>
                  </div>
                  <div className="metric-row">
                    <span className="text-secondary">Consistency</span>
                    <span className="font-mono">{mlResults?.commitPatterns?.consistency || 0}%</span>
                  </div>
                  <div className="metric-row">
                    <span className="text-secondary">Conventional Commits</span>
                    <span className="font-mono">{mlResults?.commitPatterns?.conventionalCommits || 0}%</span>
                  </div>
                  <div className="metric-row">
                    <span className="text-secondary">Avg Commits/Week</span>
                    <span className="font-mono">{mlResults?.commitPatterns?.avgCommitsPerWeek || 0}</span>
                  </div>
                </div>
              </div>

              {/* Documentation */}
              <div className="result-card glass animate-fade-up" style={{ animationDelay: '0.25s' }}>
                <div className="card-header border-b">
                  <div className="card-title"><BookOpen size={18} className="text-success" /> Documentation Quality</div>
                  <span className={`badge ${mlResults?.docQuality?.overallScore >= 70 ? 'badge-success' : 'badge-warning'}`}>
                    {mlResults?.docQuality?.overallScore || 0}/100
                  </span>
                </div>
                <div className="card-body">
                  <div className="doc-checklist">
                    <div className="doc-item">
                      {mlResults?.docQuality?.hasReadme ? <CheckCircle size={16} className="text-success" /> : <XCircle size={16} className="text-danger" />}
                      <span>README.md</span>
                    </div>
                    <div className="doc-item">
                      {mlResults?.docQuality?.hasLicense ? <CheckCircle size={16} className="text-success" /> : <XCircle size={16} className="text-danger" />}
                      <span>LICENSE</span>
                    </div>
                    <div className="doc-item">
                      {mlResults?.docQuality?.hasContributing ? <CheckCircle size={16} className="text-success" /> : <XCircle size={16} className="text-danger" />}
                      <span>CONTRIBUTING.md</span>
                    </div>
                    <div className="doc-item">
                      {mlResults?.docQuality?.hasIssueTemplate ? <CheckCircle size={16} className="text-success" /> : <XCircle size={16} className="text-danger" />}
                      <span>Issue Templates</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Contributors Chart */}
            {barData.length > 0 && (
              <div className="result-card glass animate-fade-up" style={{ animationDelay: '0.3s' }}>
                <div className="card-header border-b">
                  <div className="card-title"><Users size={18} className="text-warning" /> Top Contributors</div>
                  <div className="text-sm text-secondary">
                    Bus Factor: <strong className={mlResults?.contributors?.busFactor <= 2 ? 'text-danger' : 'text-success'}>
                      {mlResults?.contributors?.busFactor || 1}
                    </strong>
                  </div>
                </div>
                <div className="card-body" style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                      <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{fill: '#94a3b8', fontSize: 12}} />
                      <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.3)" tick={{fill: '#94a3b8', fontSize: 12}} />
                      <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{backgroundColor: '#0f0f1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px'}}
                        itemStyle={{color: '#818cf8'}}
                      />
                      <Bar dataKey="commits" fill="var(--primary)" radius={[0, 4, 4, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="result-sidebar">
            
            {/* Health Score */}
            <div className="result-card glass animate-fade-up">
              <div className="card-header border-b justify-center">
                <div className="card-title">Overall Health Score</div>
              </div>
              <div className="card-body flex-col items-center p-6">
                <ScoreCircle score={mlResults?.healthScore?.score || 0} size={160} />
                <div className="mt-4 text-center">
                  <span className="text-secondary text-sm">Grade: </span>
                  <span className="font-mono text-lg font-bold">{mlResults?.healthScore?.grade || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="result-card glass animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <div className="card-header border-b">
                <div className="card-title">Dimension Breakdown</div>
              </div>
              <div className="card-body" style={{ height: 260, padding: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Repo Stats"
                      dataKey="A"
                      stroke="var(--primary)"
                      fill="var(--primary)"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Tech Stack */}
            <div className="result-card glass animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="card-header border-b">
                <div className="card-title"><Cpu size={18} className="text-primary-light" /> Tech Stack</div>
              </div>
              <div className="card-body">
                <div className="mb-4">
                  <div className="text-xs text-muted uppercase tracking-wide mb-2">Frameworks</div>
                  <div className="flex flex-wrap gap-2">
                    {mlResults?.techStack?.frameworks?.length > 0 
                      ? mlResults.techStack.frameworks.map(f => <span key={f} className="badge badge-muted">{f}</span>)
                      : <span className="text-secondary text-sm">None detected</span>}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted uppercase tracking-wide mb-2">CI/CD & Tools</div>
                  <div className="flex flex-wrap gap-2">
                    {mlResults?.techStack?.ciCd?.length > 0
                      ? mlResults.techStack.ciCd.map(t => <span key={t} className="badge badge-muted">{t}</span>)
                      : <span className="text-secondary text-sm">None detected</span>}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

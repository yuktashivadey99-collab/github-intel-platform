const axios = require('axios');

const ML_BASE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const ML_TIMEOUT = 30000; // 30 seconds

const mlClient = axios.create({
    baseURL: ML_BASE_URL,
    timeout: ML_TIMEOUT,
    headers: { 'Content-Type': 'application/json' },
});

/**
 * ML Microservice client — calls the Python Flask service for all analysis endpoints
 */
const mlService = {
    /**
     * Get overall repository health score (0-100) with breakdown
     */
    getHealthScore: async (payload) => {
        try {
            const { data } = await mlClient.post('/ml/health-score', payload);
            return data;
        } catch (err) {
            console.warn('[mlService] health-score failed, using fallback:', err.message);
            return _fallbackHealthScore(payload);
        }
    },

    /**
     * Analyze commit patterns — frequency, consistency, conventional commits
     */
    getCommitPatterns: async (payload) => {
        try {
            const { data } = await mlClient.post('/ml/commit-patterns', payload);
            return data;
        } catch (err) {
            console.warn('[mlService] commit-patterns failed, using fallback:', err.message);
            return _fallbackCommitPatterns(payload);
        }
    },

    /**
     * Analyze contributor distribution and bus factor
     */
    getContributorAnalysis: async (payload) => {
        try {
            const { data } = await mlClient.post('/ml/contributors', payload);
            return data;
        } catch (err) {
            console.warn('[mlService] contributors failed, using fallback:', err.message);
            return _fallbackContributors(payload);
        }
    },

    /**
     * Score documentation quality (README, CONTRIBUTING, LICENSE, etc.)
     */
    getDocQuality: async (payload) => {
        try {
            const { data } = await mlClient.post('/ml/doc-quality', payload);
            return data;
        } catch (err) {
            console.warn('[mlService] doc-quality failed, using fallback:', err.message);
            return _fallbackDocQuality(payload);
        }
    },

    /**
     * Classify tech stack from languages and file tree
     */
    getTechClassifier: async (payload) => {
        try {
            const { data } = await mlClient.post('/ml/tech-classifier', payload);
            return data;
        } catch (err) {
            console.warn('[mlService] tech-classifier failed, using fallback:', err.message);
            return _fallbackTechClassifier(payload);
        }
    },

    /**
     * Health check for the ML service
     */
    ping: async () => {
        const { data } = await mlClient.get('/health');
        return data;
    },
};

// ─── Fallback Implementations (when ML service is unavailable) ────────────────

const _fallbackHealthScore = ({ repoMetadata, commitsData, contributorsData }) => {
    let score = 50;
    if (repoMetadata?.stars > 100) score += 10;
    if (repoMetadata?.openIssues < 50) score += 10;
    if (commitsData?.length > 50) score += 15;
    if (contributorsData?.length > 5) score += 15;
    score = Math.min(100, score);

    return {
        score,
        grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : 'D',
        breakdown: { activity: score * 0.4, community: score * 0.3, maintenance: score * 0.3 },
    };
};

const _fallbackCommitPatterns = ({ commitsData }) => {
    const commits = commitsData || [];
    return {
        frequency: commits.length > 20 ? 'high' : commits.length > 5 ? 'medium' : 'low',
        consistency: Math.min(100, commits.length * 2),
        conventionalCommits: 0,
        avgCommitsPerWeek: Math.round(commits.length / 4),
        peakActivityDays: [],
        summary: `${commits.length} commits analyzed`,
    };
};

const _fallbackContributors = ({ contributorsData }) => {
    const contribs = contributorsData || [];
    return {
        total: contribs.length,
        busFactor: contribs.length > 3 ? Math.min(contribs.length, 5) : 1,
        topContributors: contribs.slice(0, 5),
        distributionScore: contribs.length > 5 ? 75 : 40,
    };
};

const _fallbackDocQuality = ({ treeData }) => {
    const paths = (treeData || []).map((f) => f.path?.toLowerCase());
    return {
        hasReadme: paths.some((p) => p.startsWith('readme')),
        readmeScore: paths.some((p) => p.startsWith('readme')) ? 60 : 0,
        hasContributing: paths.some((p) => p.includes('contributing')),
        hasChangelog: paths.some((p) => p.includes('changelog')),
        hasLicense: paths.some((p) => p.includes('license')),
        hasCodeOfConduct: paths.some((p) => p.includes('code_of_conduct')),
        overallScore: 50,
    };
};

const _fallbackTechClassifier = ({ languagesData }) => {
    const langs = languagesData || {};
    const primary = Object.entries(langs).sort(([, a], [, b]) => b - a)[0]?.[0] || 'Unknown';
    return {
        languages: langs,
        frameworks: [],
        ciCd: [],
        primaryLanguage: primary,
    };
};

module.exports = { mlService };

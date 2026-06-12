const Analysis = require('../models/Analysis');
const Report = require('../models/Report');
const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/apiResponse');
const { githubService } = require('../services/github.service');
const { mlService } = require('../services/ml.service');
const { aiService } = require('../services/ai.service');

/**
 * Parse owner and repo from a GitHub URL
 * @param {string} url - e.g. https://github.com/facebook/react
 * @returns {{ owner: string, repo: string }}
 */
const parseGithubUrl = (url) => {
    const clean = url.replace(/\/$/, ''); // strip trailing slash
    const parts = clean.replace('https://github.com/', '').split('/');
    if (parts.length < 2) throw new ApiError(422, 'Invalid GitHub repository URL format.');
    return { owner: parts[0], repo: parts[1] };
};

/**
 * Compute letter grade from a numeric score (0-100)
 */
const scoreToGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C+';
    if (score >= 40) return 'C';
    if (score >= 30) return 'D';
    return 'F';
};

/**
 * @desc    Trigger full analysis of a GitHub repository
 * @route   POST /api/v1/repo/analyze
 * @access  Private
 */
const analyzeRepo = asyncHandler(async (req, res) => {
    const { repoUrl, githubToken, includeAiInsights } = req.body;
    const startTime = Date.now();

    const { owner, repo } = parseGithubUrl(repoUrl);

    // Fetch user's stored GitHub token if none provided
    const user = await User.findById(req.user._id).select('+githubToken');
    const token = githubToken || user?.githubToken || null;

    // Create analysis record with pending status
    const analysis = await Analysis.create({
        user: req.user._id,
        repoUrl,
        repoOwner: owner,
        repoName: repo,
        status: 'processing',
    });

    // Respond immediately with analysis ID (async processing)
    sendSuccess(
        res,
        { analysisId: analysis._id, status: 'processing' },
        'Analysis started. Fetch results using the analysisId.',
        202
    );

    // ─── Background Processing ────────────────────────────────────────────────
    try {
        // 1. Fetch GitHub metadata + raw data
        const [repoMetadata, commitsData, contributorsData, languagesData, treeData] =
            await Promise.all([
                githubService.getRepoMetadata(owner, repo, token),
                githubService.getCommits(owner, repo, token),
                githubService.getContributors(owner, repo, token),
                githubService.getLanguages(owner, repo, token),
                githubService.getRepoTree(owner, repo, token),
            ]);

        // 2. Run ML analysis (all in parallel)
        const [healthScore, commitPatterns, contributors, docQuality, techStack] =
            await Promise.all([
                mlService.getHealthScore({ repoMetadata, commitsData, contributorsData }),
                mlService.getCommitPatterns({ commitsData }),
                mlService.getContributorAnalysis({ contributorsData }),
                mlService.getDocQuality({ treeData, owner, repo, token }),
                mlService.getTechClassifier({ languagesData, treeData }),
            ]);

        // 3. AI insights (optional, runs last as it's slower)
        let aiInsights = null;
        if (includeAiInsights) {
            aiInsights = await aiService.generateInsights({
                repoMetadata,
                healthScore,
                commitPatterns,
                contributors,
                docQuality,
                techStack,
            });
        }

        // 4. Compute overall score (weighted average of ML scores)
        const overallScore = Math.round(
            healthScore.score * 0.35 +
            (commitPatterns.consistency || 0) * 0.20 +
            (contributors.distributionScore || 0) * 0.15 +
            (docQuality.overallScore || 0) * 0.30
        );

        const grade = scoreToGrade(overallScore);
        const processingTime = Date.now() - startTime;

        // 5. Update analysis with results
        await Analysis.findByIdAndUpdate(analysis._id, {
            repoMetadata,
            mlResults: { healthScore, commitPatterns, contributors, docQuality, techStack },
            aiInsights: aiInsights ? { ...aiInsights, generatedAt: new Date() } : undefined,
            status: 'completed',
            processingTime,
        });

        // 6. Auto-create a report
        await Report.create({
            user: req.user._id,
            analysis: analysis._id,
            title: `Analysis Report — ${owner}/${repo}`,
            repoUrl,
            summary: aiInsights?.summary || `Analysis for ${owner}/${repo}`,
            overallScore,
            grade,
            tags: techStack?.frameworks || [],
        });

        // 7. Increment user's analysis count
        await User.findByIdAndUpdate(req.user._id, { $inc: { analysisCount: 1 } });

    } catch (err) {
        console.error(`[analyzeRepo] Error for ${repoUrl}:`, err.message);
        await Analysis.findByIdAndUpdate(analysis._id, {
            status: 'failed',
            errorMessage: err.message,
        });
    }
});

/**
 * @desc    Get a specific analysis by ID
 * @route   GET /api/v1/repo/analyses/:id
 * @access  Private
 */
const getAnalysis = asyncHandler(async (req, res) => {
    const analysis = await Analysis.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!analysis) {
        throw new ApiError(404, 'Analysis not found.');
    }

    return sendSuccess(res, { analysis });
});

/**
 * @desc    Get all analyses for current user
 * @route   GET /api/v1/repo/analyses
 * @access  Private
 */
const getUserAnalyses = asyncHandler(async (req, res) => {
    const { page, limit, sortBy, order } = req.query;
    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [analyses, total] = await Promise.all([
        Analysis.find({ user: req.user._id })
            .select('-mlResults -aiInsights') // Exclude heavy fields in list view
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean(),
        Analysis.countDocuments({ user: req.user._id }),
    ]);

    return sendSuccess(res, {
        analyses,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit,
        },
    });
});

/**
 * @desc    Delete an analysis
 * @route   DELETE /api/v1/repo/analyses/:id
 * @access  Private
 */
const deleteAnalysis = asyncHandler(async (req, res) => {
    const analysis = await Analysis.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!analysis) {
        throw new ApiError(404, 'Analysis not found.');
    }

    // Also delete associated report if exists
    await Report.deleteOne({ analysis: analysis._id });

    return sendSuccess(res, null, 'Analysis deleted successfully.');
});

module.exports = { analyzeRepo, getAnalysis, getUserAnalyses, deleteAnalysis };

const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        repoUrl: {
            type: String,
            required: [true, 'Repository URL is required'],
            trim: true,
        },
        repoOwner: {
            type: String,
            required: true,
            trim: true,
        },
        repoName: {
            type: String,
            required: true,
            trim: true,
        },

        // ─── GitHub Metadata ──────────────────────────────────────────────────
        repoMetadata: {
            description: String,
            language: String,
            stars: Number,
            forks: Number,
            openIssues: Number,
            watchers: Number,
            defaultBranch: String,
            topics: [String],
            license: String,
            createdAt: Date,
            updatedAt: Date,
            isPrivate: Boolean,
        },

        // ─── ML Analysis Results ──────────────────────────────────────────────
        mlResults: {
            healthScore: {
                score: { type: Number, min: 0, max: 100 },
                breakdown: mongoose.Schema.Types.Mixed,
                grade: String, // A, B, C, D, F
            },
            commitPatterns: {
                frequency: String,
                consistency: Number,
                conventionalCommits: Number, // percentage
                avgCommitsPerWeek: Number,
                peakActivityDays: [String],
                summary: String,
            },
            contributors: {
                total: Number,
                busFactor: Number,
                topContributors: [
                    {
                        login: String,
                        contributions: Number,
                        percentage: Number,
                    },
                ],
                distributionScore: Number,
            },
            docQuality: {
                hasReadme: Boolean,
                readmeScore: Number,
                hasContributing: Boolean,
                hasChangelog: Boolean,
                hasLicense: Boolean,
                hasCodeOfConduct: Boolean,
                overallScore: Number,
            },
            techStack: {
                languages: mongoose.Schema.Types.Mixed,
                frameworks: [String],
                ciCd: [String],
                primaryLanguage: String,
            },
        },

        // ─── AI Insights ──────────────────────────────────────────────────────
        aiInsights: {
            summary: String,
            strengths: [String],
            weaknesses: [String],
            recommendations: [String],
            securityFlags: [String],
            generatedAt: Date,
        },

        // ─── Status ───────────────────────────────────────────────────────────
        status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed'],
            default: 'pending',
        },
        errorMessage: String,
        processingTime: Number, // milliseconds
    },
    {
        timestamps: true,
    }
);

// Index for fast user-based lookups
analysisSchema.index({ user: 1, createdAt: -1 });
analysisSchema.index({ repoOwner: 1, repoName: 1 });

const Analysis = mongoose.model('Analysis', analysisSchema);
module.exports = Analysis;

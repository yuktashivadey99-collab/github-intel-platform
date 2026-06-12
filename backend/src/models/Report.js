const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        analysis: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Analysis',
            required: true,
        },
        title: {
            type: String,
            required: [true, 'Report title is required'],
            trim: true,
            maxlength: [200, 'Title cannot exceed 200 characters'],
        },
        repoUrl: {
            type: String,
            required: true,
        },
        summary: {
            type: String,
            maxlength: [2000, 'Summary cannot exceed 2000 characters'],
        },
        overallScore: {
            type: Number,
            min: 0,
            max: 100,
        },
        grade: {
            type: String,
            enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
        },
        isPublic: {
            type: Boolean,
            default: false,
        },
        shareToken: {
            type: String,
            unique: true,
            sparse: true, // only indexed when not null
        },
        tags: [
            {
                type: String,
                trim: true,
            },
        ],
        exportedAt: Date,
    },
    {
        timestamps: true,
    }
);

// Indexes for efficient queries
reportSchema.index({ user: 1, createdAt: -1 });

// ─── Pre-save: Auto-generate title if not provided ────────────────────────────
reportSchema.pre('save', function (next) {
    if (!this.title && this.repoUrl) {
        const parts = this.repoUrl.replace('https://github.com/', '').split('/');
        this.title = `Analysis Report — ${parts.join('/')}`;
    }
    next();
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;

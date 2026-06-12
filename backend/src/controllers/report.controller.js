const Report = require('../models/Report');
const Analysis = require('../models/Analysis');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/apiResponse');
const crypto = require('crypto');

/**
 * @desc    Get all reports for current user (paginated)
 * @route   GET /api/v1/reports
 * @access  Private
 */
const getReports = asyncHandler(async (req, res) => {
    const { page, limit, sortBy, order } = req.query;
    const skip = (page - 1) * limit;
    const sortOrder = order === 'asc' ? 1 : -1;

    const [reports, total] = await Promise.all([
        Report.find({ user: req.user._id })
            .populate('analysis', 'repoUrl status mlResults.healthScore')
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit)
            .lean(),
        Report.countDocuments({ user: req.user._id }),
    ]);

    return sendSuccess(res, {
        reports,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalItems: total,
            itemsPerPage: limit,
        },
    });
});

/**
 * @desc    Get a single report by ID
 * @route   GET /api/v1/reports/:id
 * @access  Private
 */
const getReport = asyncHandler(async (req, res) => {
    const report = await Report.findOne({
        _id: req.params.id,
        user: req.user._id,
    }).populate('analysis');

    if (!report) {
        throw new ApiError(404, 'Report not found.');
    }

    return sendSuccess(res, { report });
});

/**
 * @desc    Get a shared report via share token (public access)
 * @route   GET /api/v1/reports/shared/:token
 * @access  Public
 */
const getSharedReport = asyncHandler(async (req, res) => {
    const report = await Report.findOne({
        shareToken: req.params.token,
        isPublic: true,
    }).populate('analysis', '-user');

    if (!report) {
        throw new ApiError(404, 'Shared report not found or is no longer public.');
    }

    return sendSuccess(res, { report });
});

/**
 * @desc    Toggle public/private visibility and generate share token
 * @route   PATCH /api/v1/reports/:id/toggle-public
 * @access  Private
 */
const togglePublic = asyncHandler(async (req, res) => {
    const report = await Report.findOne({ _id: req.params.id, user: req.user._id });

    if (!report) {
        throw new ApiError(404, 'Report not found.');
    }

    report.isPublic = !report.isPublic;

    // Generate share token when making public for the first time
    if (report.isPublic && !report.shareToken) {
        report.shareToken = crypto.randomBytes(32).toString('hex');
    }

    await report.save();

    return sendSuccess(res, {
        isPublic: report.isPublic,
        shareToken: report.isPublic ? report.shareToken : null,
        shareUrl: report.isPublic
            ? `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reports/shared/${report.shareToken}`
            : null,
    }, `Report is now ${report.isPublic ? 'public' : 'private'}`);
});

/**
 * @desc    Delete a report
 * @route   DELETE /api/v1/reports/:id
 * @access  Private
 */
const deleteReport = asyncHandler(async (req, res) => {
    const report = await Report.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!report) {
        throw new ApiError(404, 'Report not found.');
    }

    return sendSuccess(res, null, 'Report deleted successfully.');
});

module.exports = { getReports, getReport, getSharedReport, deleteReport, togglePublic };

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const { ApiError, sendSuccess } = require('../utils/apiResponse');

// ─── Helper: Generate JWT ─────────────────────────────────────────────────────
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
    const { name, email, password, githubToken } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, 'An account with this email already exists.');
    }

    // Create user
    const user = await User.create({ name, email, password, githubToken });

    const token = generateToken(user._id);

    return sendSuccess(
        res,
        { token, user: user.toSafeObject() },
        'Account created successfully',
        201
    );
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Fetch user with password (select: false by default)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        throw new ApiError(401, 'Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new ApiError(401, 'Invalid email or password.');
    }

    const token = generateToken(user._id);

    return sendSuccess(res, { token, user: user.toSafeObject() }, 'Login successful');
});

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(404, 'User not found.');
    }

    return sendSuccess(res, { user: user.toSafeObject() }, 'User profile fetched');
});

/**
 * @desc    Update user's GitHub personal access token
 * @route   PATCH /api/v1/auth/github-token
 * @access  Private
 */
const updateGithubToken = asyncHandler(async (req, res) => {
    const { githubToken } = req.body;

    if (!githubToken) {
        throw new ApiError(400, 'GitHub token is required.');
    }

    await User.findByIdAndUpdate(req.user._id, { githubToken });

    return sendSuccess(res, null, 'GitHub token updated successfully.');
});

module.exports = { register, login, getMe, updateGithubToken };

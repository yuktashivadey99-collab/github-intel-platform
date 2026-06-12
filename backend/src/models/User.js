const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
            maxlength: [100, 'Name cannot exceed 100 characters'],
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
            minlength: [8, 'Password must be at least 8 characters'],
            select: false, // Never return password in queries
        },
        githubToken: {
            type: String,
            select: false, // Sensitive — never expose in responses
        },
        role: {
            type: String,
            enum: ['user', 'admin'],
            default: 'user',
        },
        analysisCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true, // adds createdAt + updatedAt
    }
);

// ─── Pre-save Hook: Hash password before saving ───────────────────────────────
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// ─── Instance Method: Compare passwords ──────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance Method: Safe user object (no sensitive fields) ─────────────────
userSchema.methods.toSafeObject = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.githubToken;
    delete obj.__v;
    return obj;
};

const User = mongoose.model('User', userSchema);
module.exports = User;

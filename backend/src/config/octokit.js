const { Octokit } = require('@octokit/rest');

/**
 * Returns an authenticated Octokit instance.
 * Uses user-provided token if supplied, otherwise falls back to server token.
 * @param {string} [userToken] - Optional per-user GitHub PAT
 * @returns {Octokit} Authenticated Octokit client
 */
const getOctokit = (userToken = null) => {
    const token = userToken || process.env.GITHUB_TOKEN;

    if (!token) {
        console.warn('⚠️  No GitHub token provided — API rate limits will apply (60 req/hr).');
    }

    return new Octokit({
        auth: token || undefined,
        userAgent: 'github-intel-platform/1.0.0',
        timeZone: 'UTC',
        request: {
            timeout: 15000,
        },
    });
};

module.exports = { getOctokit };

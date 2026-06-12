const { getOctokit } = require('../config/octokit');

/**
 * GitHub data fetching service using Octokit REST API
 */
const githubService = {
    /**
     * Get core repository metadata
     */
    getRepoMetadata: async (owner, repo, token = null) => {
        const octokit = getOctokit(token);
        const { data } = await octokit.repos.get({ owner, repo });

        return {
            description: data.description,
            language: data.language,
            stars: data.stargazers_count,
            forks: data.forks_count,
            openIssues: data.open_issues_count,
            watchers: data.watchers_count,
            defaultBranch: data.default_branch,
            topics: data.topics || [],
            license: data.license?.name || null,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            isPrivate: data.private,
            size: data.size, // KB
            hasWiki: data.has_wiki,
            hasPages: data.has_pages,
        };
    },

    /**
     * Get recent commits (up to 100 per page, last 2 pages)
     */
    getCommits: async (owner, repo, token = null) => {
        const octokit = getOctokit(token);

        try {
            const { data } = await octokit.repos.listCommits({
                owner,
                repo,
                per_page: 100,
                page: 1,
            });

            return data.map((c) => ({
                sha: c.sha,
                message: c.commit.message,
                author: c.commit.author?.name,
                date: c.commit.author?.date,
                additions: c.stats?.additions,
                deletions: c.stats?.deletions,
            }));
        } catch (err) {
            console.warn(`[githubService] Commits fetch failed: ${err.message}`);
            return [];
        }
    },

    /**
     * Get contributor statistics
     */
    getContributors: async (owner, repo, token = null) => {
        const octokit = getOctokit(token);

        try {
            const { data } = await octokit.repos.listContributors({
                owner,
                repo,
                per_page: 100,
            });

            const total = data.reduce((sum, c) => sum + c.contributions, 0);

            return data.map((c) => ({
                login: c.login,
                contributions: c.contributions,
                percentage: total > 0 ? Math.round((c.contributions / total) * 100 * 10) / 10 : 0,
                avatarUrl: c.avatar_url,
            }));
        } catch (err) {
            console.warn(`[githubService] Contributors fetch failed: ${err.message}`);
            return [];
        }
    },

    /**
     * Get language breakdown (bytes per language)
     */
    getLanguages: async (owner, repo, token = null) => {
        const octokit = getOctokit(token);

        try {
            const { data } = await octokit.repos.listLanguages({ owner, repo });
            const total = Object.values(data).reduce((a, b) => a + b, 0);

            // Convert bytes to percentages
            const result = {};
            for (const [lang, bytes] of Object.entries(data)) {
                result[lang] = Math.round((bytes / total) * 100 * 10) / 10;
            }
            return result;
        } catch (err) {
            console.warn(`[githubService] Languages fetch failed: ${err.message}`);
            return {};
        }
    },

    /**
     * Get repository file tree (top-level for CI/doc detection)
     */
    getRepoTree: async (owner, repo, token = null) => {
        const octokit = getOctokit(token);

        try {
            const repoData = await octokit.repos.get({ owner, repo });
            const branch = repoData.data.default_branch;

            const { data } = await octokit.git.getTree({
                owner,
                repo,
                tree_sha: branch,
                recursive: '0', // Top-level only for speed
            });

            return data.tree.map((item) => ({
                path: item.path,
                type: item.type,
                size: item.size,
            }));
        } catch (err) {
            console.warn(`[githubService] Tree fetch failed: ${err.message}`);
            return [];
        }
    },

    /**
     * Get README content
     */
    getReadme: async (owner, repo, token = null) => {
        const octokit = getOctokit(token);

        try {
            const { data } = await octokit.repos.getReadme({ owner, repo });
            return Buffer.from(data.content, 'base64').toString('utf-8');
        } catch {
            return null;
        }
    },
};

module.exports = { githubService };

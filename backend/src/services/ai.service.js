const { GoogleGenerativeAI } = require('@google/generative-ai');

let client;

const getClient = () => {
    if (!client) {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set in environment variables.');
        }
        client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    }
    return client;
};

/**
 * Google Gemini AI service for generating repository intelligence insights
 */
const aiService = {
    /**
     * Generate comprehensive AI insights from analysis data
     * @param {Object} analysisData - Combined ML results and repo metadata
     * @returns {Object} AI-generated summary, strengths, weaknesses, recommendations, security flags
     */
    generateInsights: async (analysisData) => {
        const { repoMetadata, healthScore, commitPatterns, contributors, docQuality, techStack } =
            analysisData;

        const prompt = `You are an expert software engineering consultant analyzing a GitHub repository.
Based on the following analysis data, provide actionable intelligence insights.

## Repository Data
- **Description**: ${repoMetadata?.description || 'Not provided'}
- **Primary Language**: ${techStack?.primaryLanguage || 'Unknown'}
- **Stars**: ${repoMetadata?.stars || 0} | **Forks**: ${repoMetadata?.forks || 0}
- **Open Issues**: ${repoMetadata?.openIssues || 0}
- **License**: ${repoMetadata?.license || 'None'}
- **Topics**: ${(repoMetadata?.topics || []).join(', ') || 'None'}

## Health Score
- **Score**: ${healthScore?.score || 0}/100 (Grade: ${healthScore?.grade || 'N/A'})

## Commit Patterns
- **Frequency**: ${commitPatterns?.frequency || 'Unknown'}
- **Consistency**: ${commitPatterns?.consistency || 0}%
- **Conventional Commits**: ${commitPatterns?.conventionalCommits || 0}%
- **Avg Commits/Week**: ${commitPatterns?.avgCommitsPerWeek || 0}

## Contributors
- **Total**: ${contributors?.total || 0}
- **Bus Factor**: ${contributors?.busFactor || 1}
- **Distribution Score**: ${contributors?.distributionScore || 0}/100

## Documentation
- **Has README**: ${docQuality?.hasReadme || false}
- **README Score**: ${docQuality?.readmeScore || 0}/100
- **Has License**: ${docQuality?.hasLicense || false}
- **Has Contributing Guide**: ${docQuality?.hasContributing || false}
- **Overall Doc Score**: ${docQuality?.overallScore || 0}/100

## Tech Stack
- **Languages**: ${JSON.stringify(techStack?.languages || {})}
- **Frameworks**: ${(techStack?.frameworks || []).join(', ') || 'None detected'}
- **CI/CD**: ${(techStack?.ciCd || []).join(', ') || 'None detected'}

---

Respond with a JSON object (no markdown, raw JSON only) with exactly these keys:
{
  "summary": "2-3 sentence executive summary of the repository",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "recommendations": ["actionable recommendation 1", "actionable recommendation 2", "actionable recommendation 3"],
  "securityFlags": ["security concern 1"]
}`;

        try {
            const genAI = getClient();
            const model = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                generationConfig: {
                    responseMimeType: 'application/json',
                    maxOutputTokens: 1024,
                    temperature: 0.4,
                },
            });

            const result = await model.generateContent(prompt);
            const text = result.response.text();

            // Parse JSON response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Gemini response did not contain valid JSON');

            return JSON.parse(jsonMatch[0]);

        } catch (err) {
            console.warn('[aiService] Gemini API failed:', err.message);

            // Graceful fallback — no crash
            return {
                summary: `Repository analysis completed. Health score: ${healthScore?.score || 'N/A'}/100.`,
                strengths: healthScore?.score >= 70 ? ['Good overall health score'] : [],
                weaknesses: docQuality?.overallScore < 50 ? ['Documentation needs improvement'] : [],
                recommendations: [
                    'Review open issues regularly',
                    'Add comprehensive documentation',
                    'Set up CI/CD pipelines if not already present',
                ],
                securityFlags: [],
            };
        }
    },
};

module.exports = { aiService };

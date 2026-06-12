from flask import Blueprint, request, jsonify
from utils.preprocessor import safe_percentage

health_score_bp = Blueprint("health_score", __name__)


def _compute_activity_score(commits_data: list, repo_meta: dict) -> float:
    """Score based on commit volume and recency."""
    commit_count = len(commits_data)
    score = min(commit_count / 100, 1.0) * 40  # Max 40 pts for 100+ commits
    return score


def _compute_community_score(contributors_data: list, repo_meta: dict) -> float:
    """Score based on stars, forks, and contributor count."""
    stars = repo_meta.get("stars", 0)
    forks = repo_meta.get("forks", 0)
    contributor_count = len(contributors_data)

    star_score = min(stars / 1000, 1.0) * 15     # Max 15 pts for 1000+ stars
    fork_score = min(forks / 200, 1.0) * 10       # Max 10 pts for 200+ forks
    contrib_score = min(contributor_count / 20, 1.0) * 15  # Max 15 pts for 20+ contributors
    return star_score + fork_score + contrib_score


def _compute_maintenance_score(repo_meta: dict) -> float:
    """Score based on open issues, license, and topics."""
    open_issues = repo_meta.get("openIssues", 0)
    has_license = repo_meta.get("license") is not None
    topics = repo_meta.get("topics", [])

    # Fewer open issues = better maintenance (inverse, capped at 50)
    issue_score = max(0, 10 - (open_issues / 50) * 10)
    license_score = 5 if has_license else 0
    topic_score = min(len(topics) / 5, 1.0) * 5   # Max 5 pts for 5+ topics
    return issue_score + license_score + topic_score


def _score_to_grade(score: float) -> str:
    if score >= 90: return "A+"
    if score >= 80: return "A"
    if score >= 70: return "B+"
    if score >= 60: return "B"
    if score >= 50: return "C+"
    if score >= 40: return "C"
    if score >= 30: return "D"
    return "F"


@health_score_bp.route("/ml/health-score", methods=["POST"])
def compute_health_score():
    """
    Computes a composite repository health score (0-100).
    Expects: { repoMetadata: {...}, commitsData: [...], contributorsData: [...] }
    """
    body = request.get_json(silent=True) or {}
    repo_meta = body.get("repoMetadata", {})
    commits_data = body.get("commitsData", [])
    contributors_data = body.get("contributorsData", [])

    activity = _compute_activity_score(commits_data, repo_meta)
    community = _compute_community_score(contributors_data, repo_meta)
    maintenance = _compute_maintenance_score(repo_meta)

    total = activity + community + maintenance
    score = safe_percentage(total)
    grade = _score_to_grade(score)

    return jsonify({
        "score": score,
        "grade": grade,
        "breakdown": {
            "activity": round(activity, 2),
            "community": round(community, 2),
            "maintenance": round(maintenance, 2),
        },
    })

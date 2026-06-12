from flask import Blueprint, request, jsonify
from utils.preprocessor import parse_contributors, safe_percentage

contributor_bp = Blueprint("contributor", __name__)


@contributor_bp.route("/ml/contributors", methods=["POST"])
def analyze_contributors():
    """
    Analyzes contributor distribution and computes bus factor.
    Expects: { contributorsData: [...] }
    """
    body = request.get_json(silent=True) or {}
    raw = body.get("contributorsData", [])
    contributors = parse_contributors(raw)

    if not contributors:
        return jsonify({
            "total": 0,
            "busFactor": 0,
            "topContributors": [],
            "distributionScore": 0,
        })

    total_contributors = len(contributors)
    sorted_contribs = sorted(contributors, key=lambda x: x["contributions"], reverse=True)

    # ─── Bus Factor ───────────────────────────────────────────────────────────
    # Minimum number of contributors responsible for >= 50% of all commits
    total_commits = sum(c["contributions"] for c in sorted_contribs)
    cumulative = 0
    bus_factor = 0

    for c in sorted_contribs:
        cumulative += c["contributions"]
        bus_factor += 1
        if total_commits > 0 and (cumulative / total_commits) >= 0.50:
            break

    # ─── Distribution Score ───────────────────────────────────────────────────
    # Higher bus factor + more contributors = better distribution
    # Max score: bus_factor >= 5 and total >= 10
    bus_score = min(bus_factor / 5, 1.0) * 50          # 50 points max
    size_score = min(total_contributors / 10, 1.0) * 50  # 50 points max
    distribution_score = safe_percentage(bus_score + size_score)

    return jsonify({
        "total": total_contributors,
        "busFactor": bus_factor,
        "topContributors": sorted_contribs[:10],
        "distributionScore": distribution_score,
    })

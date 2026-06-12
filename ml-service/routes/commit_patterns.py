from flask import Blueprint, request, jsonify
from utils.preprocessor import parse_commits, safe_percentage
from datetime import datetime, timedelta
from collections import Counter
import re

commit_patterns_bp = Blueprint("commit_patterns", __name__)

CONVENTIONAL_PREFIXES = re.compile(
    r"^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?!?:",
    re.IGNORECASE,
)

DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


@commit_patterns_bp.route("/ml/commit-patterns", methods=["POST"])
def analyze_commit_patterns():
    """
    Analyzes GitHub commit data and returns pattern metrics.
    Expects: { commitsData: [...] }
    """
    body = request.get_json(silent=True) or {}
    raw_commits = body.get("commitsData", [])
    commits = parse_commits(raw_commits)

    if not commits:
        return jsonify({
            "frequency": "unknown",
            "consistency": 0,
            "conventionalCommits": 0,
            "avgCommitsPerWeek": 0,
            "peakActivityDays": [],
            "summary": "No commit data available",
        })

    total = len(commits)

    # ─── Conventional Commits ─────────────────────────────────────────────────
    conventional_count = sum(
        1 for c in commits if CONVENTIONAL_PREFIXES.match(c["message"])
    )
    conventional_pct = safe_percentage((conventional_count / total) * 100)

    # ─── Frequency Classification ─────────────────────────────────────────────
    frequency = "high" if total > 50 else "medium" if total > 15 else "low"

    # ─── Consistency Score ────────────────────────────────────────────────────
    # Measures how evenly spread commits are across weeks
    dates = []
    day_counts = Counter()

    for c in commits:
        date_str = c.get("date")
        if date_str:
            try:
                dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
                dates.append(dt)
                day_counts[dt.strftime("%A")] += 1
            except (ValueError, TypeError):
                continue

    consistency = 0
    avg_per_week = 0

    if dates:
        dates_sorted = sorted(dates)
        span_days = max((dates_sorted[-1] - dates_sorted[0]).days, 1)
        weeks = max(span_days / 7, 1)
        avg_per_week = round(total / weeks, 1)

        # Consistency: inverse of coefficient of variation across weeks
        week_buckets = Counter()
        for dt in dates:
            week_key = dt.strftime("%Y-W%W")
            week_buckets[week_key] += 1

        counts = list(week_buckets.values())
        if len(counts) > 1:
            mean = sum(counts) / len(counts)
            variance = sum((x - mean) ** 2 for x in counts) / len(counts)
            std_dev = variance ** 0.5
            cv = std_dev / mean if mean > 0 else 1
            consistency = safe_percentage((1 - min(cv, 1)) * 100)
        else:
            consistency = 50.0

    # ─── Peak Days ────────────────────────────────────────────────────────────
    sorted_days = sorted(day_counts.items(), key=lambda x: x[1], reverse=True)
    peak_days = [day for day, _ in sorted_days[:3]]

    # ─── Summary ─────────────────────────────────────────────────────────────
    summary = (
        f"{total} commits analyzed. "
        f"Activity frequency: {frequency}. "
        f"{conventional_pct:.0f}% follow conventional commit format."
    )

    return jsonify({
        "frequency": frequency,
        "consistency": consistency,
        "conventionalCommits": conventional_pct,
        "avgCommitsPerWeek": avg_per_week,
        "peakActivityDays": peak_days,
        "summary": summary,
    })

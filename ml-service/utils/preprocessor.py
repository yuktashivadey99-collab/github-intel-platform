from datetime import datetime, timezone


def parse_commits(commits_data: list) -> list:
    """
    Normalize raw commit data from GitHub API into consistent dicts.
    """
    parsed = []
    for c in commits_data:
        try:
            parsed.append({
                "sha": c.get("sha", ""),
                "message": c.get("message", "").strip(),
                "author": c.get("author", "unknown"),
                "date": c.get("date"),
            })
        except Exception:
            continue
    return parsed


def parse_contributors(contributors_data: list) -> list:
    """
    Normalize contributor data.
    """
    return [
        {
            "login": c.get("login", ""),
            "contributions": int(c.get("contributions", 0)),
            "percentage": float(c.get("percentage", 0.0)),
        }
        for c in contributors_data
    ]


def parse_tree(tree_data: list) -> list:
    """
    Return flat list of file paths from repo tree.
    """
    return [item.get("path", "").lower() for item in tree_data if item.get("type") == "blob"]


def safe_percentage(value: float, min_val: float = 0.0, max_val: float = 100.0) -> float:
    """
    Clamp a value to a valid percentage range.
    """
    return round(max(min_val, min(max_val, float(value))), 2)

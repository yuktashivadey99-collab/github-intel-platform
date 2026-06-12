from flask import Blueprint, request, jsonify
from utils.preprocessor import parse_tree, safe_percentage

doc_quality_bp = Blueprint("doc_quality", __name__)

# Files that indicate good documentation practices
DOC_FILES = {
    "readme": ["readme.md", "readme.rst", "readme.txt", "readme"],
    "contributing": ["contributing.md", "contributing.rst", "contributing.txt", ".github/contributing.md"],
    "changelog": ["changelog.md", "changelog.rst", "history.md", "changes.md", "releases.md"],
    "license": ["license", "license.md", "license.txt", "licence", "copying"],
    "code_of_conduct": ["code_of_conduct.md", ".github/code_of_conduct.md"],
    "security": ["security.md", ".github/security.md"],
    "issue_templates": [".github/issue_template.md", ".github/bug_report.md"],
    "pr_template": [".github/pull_request_template.md"],
}


def _check_presence(file_paths: list, targets: list) -> bool:
    return any(path in targets for path in file_paths)


@doc_quality_bp.route("/ml/doc-quality", methods=["POST"])
def analyze_doc_quality():
    """
    Scores repository documentation quality based on presence of key files.
    Expects: { treeData: [...] }
    """
    body = request.get_json(silent=True) or {}
    tree_data = body.get("treeData", [])
    file_paths = parse_tree(tree_data)

    # ─── Presence Checks ─────────────────────────────────────────────────────
    has_readme = _check_presence(file_paths, DOC_FILES["readme"])
    has_contributing = _check_presence(file_paths, DOC_FILES["contributing"])
    has_changelog = _check_presence(file_paths, DOC_FILES["changelog"])
    has_license = _check_presence(file_paths, DOC_FILES["license"])
    has_code_of_conduct = _check_presence(file_paths, DOC_FILES["code_of_conduct"])
    has_security = _check_presence(file_paths, DOC_FILES["security"])
    has_issue_template = _check_presence(file_paths, DOC_FILES["issue_templates"])
    has_pr_template = _check_presence(file_paths, DOC_FILES["pr_template"])

    # ─── README Quality Score ─────────────────────────────────────────────────
    # Based purely on presence; deep analysis would require content fetching
    readme_score = 60 if has_readme else 0  # Base score for having a README

    # ─── Weighted Overall Score ───────────────────────────────────────────────
    score = 0
    score += 30 if has_readme else 0          # Most important
    score += 15 if has_license else 0
    score += 15 if has_contributing else 0
    score += 10 if has_changelog else 0
    score += 10 if has_code_of_conduct else 0
    score += 10 if has_security else 0
    score += 5  if has_issue_template else 0
    score += 5  if has_pr_template else 0

    return jsonify({
        "hasReadme": has_readme,
        "readmeScore": readme_score,
        "hasContributing": has_contributing,
        "hasChangelog": has_changelog,
        "hasLicense": has_license,
        "hasCodeOfConduct": has_code_of_conduct,
        "hasSecurity": has_security,
        "hasIssueTemplate": has_issue_template,
        "hasPrTemplate": has_pr_template,
        "overallScore": safe_percentage(score),
    })

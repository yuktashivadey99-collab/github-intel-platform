from flask import Blueprint, request, jsonify
from utils.preprocessor import parse_tree

tech_classifier_bp = Blueprint("tech_classifier", __name__)

# Framework/tool detection by file patterns
FRAMEWORK_SIGNATURES = {
    # JavaScript / TypeScript
    "React": ["src/app.jsx", "src/app.tsx", "src/index.jsx", "src/index.tsx", "next.config.js", "next.config.ts"],
    "Next.js": ["next.config.js", "next.config.ts", "next.config.mjs", "pages/_app.js", "pages/_app.tsx"],
    "Vue.js": ["vue.config.js", "src/app.vue", "src/main.js"],
    "Angular": ["angular.json", "src/app/app.module.ts", "src/app/app.component.ts"],
    "Svelte": ["svelte.config.js", "src/app.svelte"],
    "Express": ["app.js", "server.js", "index.js"],

    # Python
    "Django": ["manage.py", "django/settings.py", "settings.py"],
    "Flask": ["app.py", "wsgi.py", "application.py"],
    "FastAPI": ["main.py"],

    # Mobile
    "React Native": ["metro.config.js", "app.json", "index.js"],
    "Flutter": ["pubspec.yaml", "lib/main.dart"],

    # Build tools / package managers
    "Webpack": ["webpack.config.js", "webpack.config.ts"],
    "Vite": ["vite.config.js", "vite.config.ts"],
}

CI_CD_SIGNATURES = {
    "GitHub Actions": [".github/workflows"],
    "GitLab CI": [".gitlab-ci.yml"],
    "CircleCI": [".circleci/config.yml"],
    "Travis CI": [".travis.yml"],
    "Jenkins": ["jenkinsfile", "Jenkinsfile"],
    "Docker": ["dockerfile", "Dockerfile", "docker-compose.yml", "docker-compose.yaml"],
    "Kubernetes": ["k8s", "kubernetes", "helm"],
}


@tech_classifier_bp.route("/ml/tech-classifier", methods=["POST"])
def classify_tech_stack():
    """
    Detects frameworks and CI/CD tools from repo file tree and language data.
    Expects: { languagesData: {...}, treeData: [...] }
    """
    body = request.get_json(silent=True) or {}
    languages_data = body.get("languagesData", {})
    tree_data = body.get("treeData", [])

    file_paths = parse_tree(tree_data)
    all_paths_str = " ".join(file_paths)

    # ─── Framework Detection ──────────────────────────────────────────────────
    detected_frameworks = []
    for framework, signatures in FRAMEWORK_SIGNATURES.items():
        if any(sig.lower() in file_paths or sig.lower() in all_paths_str for sig in signatures):
            detected_frameworks.append(framework)

    # ─── CI/CD Detection ─────────────────────────────────────────────────────
    detected_cicd = []
    for tool, signatures in CI_CD_SIGNATURES.items():
        if any(sig.lower() in all_paths_str for sig in signatures):
            detected_cicd.append(tool)

    # ─── Primary Language ─────────────────────────────────────────────────────
    primary_language = "Unknown"
    if languages_data:
        primary_language = max(languages_data, key=languages_data.get)

    return jsonify({
        "languages": languages_data,
        "frameworks": detected_frameworks,
        "ciCd": detected_cicd,
        "primaryLanguage": primary_language,
    })

from flask import Flask, jsonify
from flask_cors import CORS
from config import config

# Route blueprints
from routes.health_score import health_score_bp
from routes.commit_patterns import commit_patterns_bp
from routes.contributor import contributor_bp
from routes.doc_quality import doc_quality_bp
from routes.tech_classifier import tech_classifier_bp


def create_app():
    app = Flask(__name__)

    # ─── CORS ─────────────────────────────────────────────────────────────────
    CORS(app, origins=config.ALLOWED_ORIGINS, methods=["GET", "POST", "OPTIONS"])

    # ─── Register Blueprints ──────────────────────────────────────────────────
    app.register_blueprint(health_score_bp)
    app.register_blueprint(commit_patterns_bp)
    app.register_blueprint(contributor_bp)
    app.register_blueprint(doc_quality_bp)
    app.register_blueprint(tech_classifier_bp)

    # ─── Health Check ─────────────────────────────────────────────────────────
    @app.route("/health")
    def health():
        return jsonify({
            "success": True,
            "service": "GitHub Intel ML Service",
            "version": "1.0.0",
            "endpoints": [
                "POST /ml/health-score",
                "POST /ml/commit-patterns",
                "POST /ml/contributors",
                "POST /ml/doc-quality",
                "POST /ml/tech-classifier",
            ],
        })

    # ─── Global Error Handler ─────────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "message": "Endpoint not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"success": False, "message": "Internal server error"}), 500

    @app.errorhandler(Exception)
    def handle_exception(e):
        app.logger.error(f"Unhandled exception: {str(e)}")
        return jsonify({"success": False, "message": str(e)}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    print(f"\n🐍 GitHub Intel ML Service")
    print(f"   ├── Host : {config.HOST}")
    print(f"   ├── Port : {config.PORT}")
    print(f"   └── Debug: {config.DEBUG}\n")
    app.run(host=config.HOST, port=config.PORT, debug=config.DEBUG)

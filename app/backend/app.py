import os
from flask import Flask, jsonify, request
from flask_cors import CORS
import github3
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

genai.configure(api_key=GEMINI_API_KEY)
gh = github3.login(token=GITHUB_TOKEN)

@app.route("/")
def home():
    return jsonify({"message": "Welcome to PRism API!"})

@app.route("/repositories", methods=["POST"])
def get_repositories():
    try:
        data = request.json
        skills = data.get("skills", [])

        if not skills:
            return jsonify({"error": "No skills provided"}), 400

        repo_results = []
        for skill in skills:
            repos = gh.search_repositories(f"{skill} stars:>100", sort="stars", order="desc")

            for i, repo in enumerate(repos):
                if i >= 9:
                    break

                repo_results.append({
                    "repo": repo.name,
                    "stars": repo.stargazers_count,
                    "lang": repo.language or "Unknown",
                    "url": repo.html_url,
                    "owner": repo.owner['login'],
                    "description": repo.description,
                    "topics": repo.topics,
                    "last_updated": repo.updated_at,
                    "is_fork": repo.fork,
                    "issues": repo.open_issues_count,
                })

        return jsonify(repo_results)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/get_info", methods=["POST"])
def get_info():
    try:
        data = request.json
        owner = data.get("owner")
        repo_name = data.get("repo_name")
        repo = gh.repository(owner=owner, repository=repo_name)

        if not repo:
            return jsonify({"error": "Repository not found"}), 404

        repo_info = {
            "name": repo.name,
            "description": repo.description,
            "stars": repo.stargazers_count,
            "forks": repo.forks_count,
            "language": repo.language or "Unknown",
            "url": repo.html_url,
            "issues": repo.open_issues_count,
            "is_private": repo.private,
            "is_archived": repo.archived,
            "is_disabled": repo.disabled,
        }
                    
        return jsonify(repo_info)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
@app.route("/get_ai_recs", methods=["POST"])
def get_ai_recs():
    try:
        data = request.json
        skills = data.get("skills", [])
        repo_name = data.get("repo_name")
        repo_desc = data.get("repo_desc", "")
        user_experience = data.get("user_experience", "")
        user_interests = data.get("user_interests", "")
        user_time = data.get("user_time", "")


        if not skills or not repo_name:
            return jsonify({"error": "Skills and repository name required"}), 400

        prompt = f"""
        Based on the user's skills: {', '.join(skills)}, suggest the best way to contribute to the repository "{repo_name}".
        Repository Description: {repo_desc}

        ===CONTEXT===
        User Experience: {user_experience}
        User Interests: {user_interests}
        Time the User can spend: {user_time}
        ===END CONTEXT===

        ===RESPONSE INSTRUCTIONS===
        1. Provide a list of key technologies needed for the repository.
        2. Suggest good first issues to start with.
        3. Provide a step-by-step guide on how to contribute to the repository.
        4. Keep the response concise and relevant.
        5. Use proper formatting for the response.
        ===END RESPONSE INSTRUCTIONS===
        """

        model = genai.GenerativeModel(
            model_name='models/gemini-1.5-pro-latest',
            system_instruction = "You are an AI assistant helping users find open-source repositories to contribute to."
            " Generate insightful recommendations based on their skills and repository details."
            "Keep the generated content concise and relevant. Keep the response under 600 tokens.",
        )

        response = model.generate_content(prompt)
        ai_response = response.text if response else "No insights available."

        return jsonify({"ai_suggestions": ai_response})

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route("/ai_chat", methods=["POST"])
def ai_chat():
    data = request.json
    history = data.get("history", [])
    user_message = data.get("prompt", "")
    repo_name = data.get("repo_name", "")
    repo_info = data.get("repo_info", {})
    skills = data.get("skills", [])

    if not user_message:
        return jsonify({"error": "Prompt is required"}), 400
    
    model = genai.GenerativeModel(
        model_name='models/gemini-1.5-pro-latest',
        system_instruction = "You are an AI assistant helping users know about open-source repositories to contribute to."
        " You are designed to chat with the user about the repo.",
    )
    
    prompt = f"""
    User Message: {user_message}
    ===CONTEXT===
    Repository Name: {repo_name}
    Repository Info: {repo_info}
    User Skills: {', '.join(skills)}
    ===END CONTEXT===
    ===RESPONSE INSTRUCTIONS===
    1. Provide a detailed response to the user's message.
    2. Use the repository information and user skills to tailor your response.
    ===END RESPONSE INSTRUCTIONS===
    ===CONVERSATION HISTORY===
    {history}
    ===END CONVERSATION HISTORY===
    """
    response = model.generate_content(prompt)
    ai_response = response.text if response else "No insights available."
    history.append({"user": user_message, "ai": ai_response})
    return jsonify({"response": ai_response, "history": history})


if __name__ == "__main__":
    app.run(debug=True, port=5000)

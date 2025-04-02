# PRism – AI-Powered Open Source Contribution Platform 🚀  

PRism makes open-source contributions easier by matching developers with repositories based on their skills. With AI-powered recommendations, users get tailored guidance on how to start contributing.  

(Please don't forget to star the repo!)

---

## 🌟 Features  

- 🔍 **Smart Repository Matching** – Get matched with open-source projects based on your skills.  
- 🤖 **AI-Powered Contribution Suggestions** – AI suggests how you can contribute, including relevant issues and technologies.  
- ⚡ **Real-Time Insights** – Get repository details like stars, forks, and open issues.  
---

## 🛠 Tech Stack  

### Frontend  
- **React (Vite)** – Fast frontend with modern UI.  
- **Tailwind CSS** – Clean and customizable styling.  
- **React Router** – Seamless navigation between screens.  

### Backend  
- **Flask** – Lightweight API server.  
- **GitHub3.py** – Fetching repository data from GitHub.  
- **Google Gemini API** – AI-driven recommendations.  
- **Flask-CORS** – Handling cross-origin requests.  

---

## 🎨 Design & UX  

PRism follows a **Neobrutalist** design approach:  
- 📏 **Sharp Borders & High Contrast** – Bold UI elements for better readability.  
- 🏗 **Layered Shadows** – 3D-like effects for interactive components.  
- 🎭 **Vibrant Colors** – Eye-catching elements that enhance user engagement.  

---

## 🚀 Getting Started  

### 1️⃣ Clone the Repository  
```sh
git clone https://github.com/WakandaWebWeaver/PRism/prism.git
cd prism
```

### 2️⃣ Install Frontend Dependencies  
```sh
cd app/frontend
npm install
npm run dev
```

### 3️⃣ Setup & Run Backend  
```sh
cd ../backend
pip install -r requirements.txt
flask run
```

### 4️⃣ Environment Variables  
Create a `.env` file in the **backend** folder:  
```env
GITHUB_TOKEN=your_github_token
GEMINI_API_KEY=your_gemini_api_key
```

---

## 📡 API Endpoints  

### 🔹 Get Repository Matches  
```http
POST /repositories
{
  "skills": ["Python", "React"]
}
```

### 🔹 Get Repository Details  
```http
POST /get_info 
{
    "repo_name": "PRism",
    "repo_owner": "WakandaWebWeaver"
}
```

### 🔹 Get AI Contribution Suggestions  
```http
POST /get_ai_recs
{
  "skills": ["Python", "React"],
  "repo_name": "PRism",
  "repo_desc": "AI Tool to help you contribute"
}
```

---

## 🎯 Future Enhancements  

- 🏗 **User Authentication** – Save preferences and track contributions.  
- 📡 **Better AI Context Awareness** – More detailed suggestions based on repo history.  
- 🌐 **Multi-Language Support** – Expanding beyond English.  

---

## 💙 Contributing  

I welcome contributions! Feel free to open issues and submit PRs.  
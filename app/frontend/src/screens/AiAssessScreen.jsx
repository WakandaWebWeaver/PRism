import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

function AiAssessScreen() {
  const [loading, setLoading] = useState(true);
  const [repoInfo, setRepoInfo] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [currentRepo, setCurrentRepo] = useState(null);
  const [error, setError] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [conversation, setConversation] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);
  const streamingRef = useRef(null);

  const questions = [
    "What's your experience level with this technology?",
    "What specific areas of this project interest you most?",
    "How much time can you dedicate to contributing?"
  ];

  const [answers, setAnswers] = useState({
    experience: "",
    interests: "",
    time: ""
  });

  useEffect(() => {
    const storedSkills = localStorage.getItem('selectedSkills');
    const storedRepo = localStorage.getItem('currentRepo');
    
    if (storedSkills) {
      setSelectedSkills(JSON.parse(storedSkills));
    }
    
    if (storedRepo) {
      const repo = JSON.parse(storedRepo);
      setCurrentRepo(repo);
      
      simulateStreamingMessage(`Hi there! I'll help you assess if "${repo.repo}" is a good fit for your skills. Let's chat about your interests and experience first.`, (text) => {
        setConversation([
          { type: "ai", text }
        ]);
      });
      
      fetchRepoInfo(repo.repo, repo.owner);
    } else {
      setError("No repository selected");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [conversation, streamingMessage]);

const simulateStreamingMessage = (message, callback = null) => {
    setIsStreaming(true);
    setStreamingMessage(message);
    
    
    setTimeout(() => {
        setIsStreaming(false);
        if (callback) callback(message);
        setStreamingMessage("");
    }, 500); 
    
    return () => {}; 
};

  const fetchRepoInfo = async (repoName, repoOwner) => {
    try {
      const response = await fetch(`http://localhost:5000/get_info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repo_name: repoName,
          owner: repoOwner,
        }),
      });
      
      if (!response.ok) throw new Error("Failed to fetch repository information");
      
      const data = await response.json();
      setRepoInfo(data);
      
      setTimeout(() => {
        simulateStreamingMessage(questions[0], (text) => {
          setConversation(prev => [
            ...prev,
            { type: "ai", text }
          ]);
          setCurrentQuestion(1);
        });
      }, 1000);
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = (answer) => {
    setConversation(prev => [
      ...prev,
      { type: "user", text: answer }
    ]);
    
    if (currentQuestion === 1) {
      setAnswers(prev => ({ ...prev, experience: answer }));
    } else if (currentQuestion === 2) {
      setAnswers(prev => ({ ...prev, interests: answer }));
    } else if (currentQuestion === 3) {
      setAnswers(prev => ({ ...prev, time: answer }));
    }
    
    if (currentQuestion < questions.length) {
      setTimeout(() => {
        simulateStreamingMessage(questions[currentQuestion], (text) => {
          setConversation(prev => [
            ...prev,
            { type: "ai", text }
          ]);
          setCurrentQuestion(prev => prev + 1);
        });
      }, 800);
    } else {
      setTimeout(() => {
        simulateStreamingMessage("Thanks for sharing! I'm analyzing this repository to provide personalized recommendations based on your answers...", (text) => {
          setConversation(prev => [
            ...prev,
            { type: "ai", text }
          ]);
          getAiAssessment();
        });
      }, 800);
    }       
  };

  const getAiAssessment = async () => {
    setAiLoading(true);
    
    try {
      const response = await fetch("http://localhost:5000/get_ai_recs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          skills: selectedSkills,
          repo_name: currentRepo.repo,
          repo_desc: repoInfo?.description || "",
          user_experience: answers.experience,
          user_interests: answers.interests,
          user_time: answers.time
        }),
      });

      if (!response.ok) throw new Error("Failed to get AI recommendations");
      
      const data = await response.json();
      setAiSuggestions(data.ai_suggestions);
      
      simulateStreamingMessage(data.ai_suggestions, (text) => {
        setConversation(prev => [
          ...prev,
          { type: "ai", text }
        ]);
      });


      simulateStreamingMessage("You can now continue chatting with me about anything related to this repository.", (text) => {
        setConversation(prev => [
          ...prev,
          { type: "ai", text }
        ]);
        setCurrentQuestion(questions.length + 1); 
      });
      
    } catch (err) {
      setError(err.message);
      setConversation(prev => [
        ...prev,
        { type: "ai", text: "Sorry, I encountered an error while analyzing this repository. Please try again later." }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const continueChat = async (message) => {
    setConversation(prev => [
      ...prev,
      { type: "user", text: message }
    ]);
    
    setAiLoading(true);
    
    try {
      const response = await fetch("http://localhost:5000/ai_chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          history: conversation,
          prompt: message,
          repo_name: currentRepo.repo,
          repo_info: repoInfo,
          skills: selectedSkills
        }),
      });

      if (!response.ok) throw new Error("Failed to get AI response");
      
      const data = await response.json();
      
      simulateStreamingMessage(data.response, (text) => {
        setConversation(prev => [
          ...prev,
          { type: "ai", text }
        ]);
      });
      
    } catch (err) {
      setError(err.message);
      setConversation(prev => [
        ...prev,
        { type: "ai", text: "Sorry, I encountered an error while processing your message. Please try again later." }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const [userInput, setUserInput] = useState("");
  
  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    
    if (currentQuestion > 0 && currentQuestion <= questions.length) {
      handleAnswerSubmit(userInput);
    } else {
      continueChat(userInput);
    }
    
    setUserInput("");
  };

  const handleBack = () => {
    navigate("/results");
  };

  const getSkillColor = (skill) => {
    const relevance = Math.random();
    if (relevance > 0.7) return "border-green-400 text-green-400";
    if (relevance > 0.4) return "border-yellow-400 text-yellow-400";
    return "border-gray-400 text-gray-400";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <nav className="p-4 bg-gray-800 text-white flex justify-between items-center shadow-lg border-b-2 border-yellow-500">
        <h1 className="text-2xl font-extrabold tracking-wide">
          <span className="text-yellow-400">PR</span>ism
        </h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            Back to Results
          </button>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <p className="font-semibold">AI Assessment</p>
          </div>
        </div>
      </nav>

      <div className="flex flex-col md:flex-row flex-grow">
        <div className="w-full md:w-1/3 bg-gray-800 p-6 border-r border-gray-700 overflow-y-auto" style={{ maxHeight: "calc(100vh - 120px)" }}>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-700 rounded w-5/6"></div>
              <div className="h-20 bg-gray-700 rounded w-full"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-900/40 border-2 border-red-500 rounded-lg">
              <p className="text-red-400 font-bold">{error}</p>
            </div>
          ) : repoInfo ? (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border border-gray-700 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center text-black font-bold text-xl">
                    {repoInfo.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{repoInfo.name}</h2>
                    <p className="text-sm text-gray-400">by {repoInfo.owner}</p>
                  </div>
                </div>
                <p className="text-gray-300 mb-4 leading-relaxed">{repoInfo.description}</p>
                
                <div className="bg-gray-900/50 p-3 rounded-lg mb-4">
                  <div className="text-sm text-gray-400 mb-1">Primary Language</div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <span className="font-semibold">{repoInfo.language}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-gray-900/50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-400">{repoInfo.stars.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Stars</div>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-400">{repoInfo.forks.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Forks</div>
                  </div>
                  <div className="bg-gray-900/50 p-3 rounded-lg text-center">
                    <div className="text-2xl font-bold text-purple-400">{repoInfo.issues.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Issues</div>
                  </div>
                </div>
                
                <a 
                  href={repoInfo.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center justify-center w-full py-3 bg-yellow-500 text-gray-900 rounded-lg 
                  font-semibold hover:bg-yellow-400 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Visit Repository
                </a>
              </div>
              
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  Your Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedSkills.map(skill => (
                    <span 
                      key={skill} 
                      className={`bg-gray-800 px-3 py-1 rounded-full border text-sm ${getSkillColor(skill)}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-900/50 p-6 rounded-xl border border-gray-700">
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Contribution Tips
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Start with good first issues
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Read the contributing guidelines
                  </li>
                  <li className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Join the community discussions
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <p>No repository information available</p>
          )}
        </div>
        
        <div className="flex-grow flex flex-col p-6 bg-gradient-to-b from-gray-900 to-gray-800 max-w-5xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PRism <span className="text-yellow-400 ml-2">Assistant</span>
          </h2>
          
          <div 
            ref={chatContainerRef}
            className="flex-grow bg-gray-800/50 rounded-lg border border-gray-700 p-4 overflow-y-auto mb-4 shadow-inner"
            style={{ maxHeight: "calc(100vh - 280px)" }}
          >
            {conversation.map((message, index) => (
              <div 
                key={index} 
                className={`mb-6 ${message.type === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
              >
                <div 
                  className={`rounded-lg px-5 py-3 max-w-3/4 shadow-md ${
                    message.type === 'user' 
                      ? 'bg-yellow-500 text-gray-900' 
                      : 'bg-gray-700 text-white border border-gray-600'
                  }`}
                  style={{ maxWidth: "70%" }}
                >
                  {message.type === 'ai' ? (
                    <div className="markdown-content">
                      <ReactMarkdown>{message.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-line">{message.text}</p>
                  )}
                </div>
              </div>
            ))}
            
            {isStreaming && (
              <div className="flex justify-start mb-6">
                <div 
                  className="rounded-lg px-5 py-3 bg-gray-700 text-white border border-gray-600 shadow-md"
                  style={{ maxWidth: "75%" }}
                >
                  <div className="markdown-content">
                    <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
            
            {aiLoading && !isStreaming && (
              <div className="flex items-center gap-2 text-gray-400">
                <div className="animate-bounce h-2 w-2 bg-yellow-400 rounded-full"></div>
                <div className="animate-bounce h-2 w-2 bg-yellow-400 rounded-full" style={{ animationDelay: "0.2s" }}></div>
                <div className="animate-bounce h-2 w-2 bg-yellow-400 rounded-full" style={{ animationDelay: "0.4s" }}></div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleInputSubmit} className="flex gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full px-5 py-4 text-white bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-colors placeholder-gray-400"
                placeholder={currentQuestion > 0 && currentQuestion <= questions.length ? "Type your answer..." : "Ask follow-up questions about the repository..."}
                disabled={isStreaming || aiLoading || currentQuestion === 0}
              />
              {(isStreaming || aiLoading) && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-5 w-5 border-2 border-yellow-400 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!userInput.trim() || isStreaming || aiLoading || currentQuestion === 0}
              className="px-6 py-4 bg-yellow-500 text-gray-900 font-bold rounded-lg hover:bg-yellow-400 transition-colors disabled:bg-gray-600 disabled:text-gray-500 flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      <footer className="py-4 text-center text-gray-500 border-t border-gray-800 bg-gray-900">
        <p>Find your next open source contribution with <span className="text-yellow-400 font-bold">PRism</span></p>
      </footer>
    </div>
  );
}

export default AiAssessScreen;
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
  const [theme, setTheme] = useState("yellow"); // Added theme state
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);
  const streamingRef = useRef(null);

  const themes = {
    yellow: {
      primary: "bg-yellow-400",
      secondary: "bg-yellow-500",
      text: "text-yellow-400",
      border: "border-yellow-400",
      hover: "hover:bg-yellow-500",
      shadow: "shadow-[8px_8px_0px_0px_rgba(234,179,8,0.9)]"
    },
    pink: {
      primary: "bg-pink-400",
      secondary: "bg-pink-500",
      text: "text-pink-400",
      border: "border-pink-400",
      hover: "hover:bg-pink-500",
      shadow: "shadow-[8px_8px_0px_0px_rgba(236,72,153,0.9)]"
    },
    blue: {
      primary: "bg-blue-400",
      secondary: "bg-blue-500",
      text: "text-blue-400",
      border: "border-blue-400",
      hover: "hover:bg-blue-500",
      shadow: "shadow-[8px_8px_0px_0px_rgba(59,130,246,0.9)]"
    }
  };

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
      
      // Set random theme
      const themeKeys = Object.keys(themes);
      setTheme(themeKeys[Math.floor(Math.random() * themeKeys.length)]);
      
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

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
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

  const handleThemeChange = () => {
    const themeKeys = Object.keys(themes);
    const currentIndex = themeKeys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setTheme(themeKeys[nextIndex]);
  };

  const getSkillColor = (skill) => {
    const relevance = Math.random();
    if (relevance > 0.7) return "border-green-400 text-green-400";
    if (relevance > 0.4) return "border-yellow-400 text-yellow-400";
    return "border-gray-400 text-gray-400";
  };

  const currentTheme = themes[theme];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 text-black">
      <nav className={`p-4 ${currentTheme.primary} border-b-4 border-black flex justify-between items-center ${currentTheme.shadow}`}>
        <h1 className="text-3xl font-black tracking-wide bg-white px-4 py-2 border-4 border-black transform rotate-2">
          <span className="text-black">PR</span>ism
        </h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-white text-black rounded-none font-black border-4 border-black transform -rotate-1 hover:translate-x-1 hover:-translate-y-1 transition-transform"
          >
            ← Back to Results
          </button>
          <button
            onClick={handleThemeChange}
            className="p-3 bg-white text-black rounded-none font-bold border-4 border-black transform rotate-1 hover:rotate-3 transition-transform"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </button>
          <div className="flex items-center gap-2 bg-white px-4 py-2 border-4 border-black transform -rotate-1">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <p className="font-black">AI ASSESSMENT</p>
          </div>
        </div>
      </nav>

      <div className="flex flex-col md:flex-row flex-grow">
        <div className="w-full md:w-1/3 bg-white p-6 border-r-4 border-black overflow-y-auto" style={{ maxHeight: "calc(100vh - 120px)" }}>
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              <div className="h-20 bg-gray-300 rounded w-full"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-100 border-4 border-red-500 transform rotate-1">
              <p className="text-red-600 font-black">{error}</p>
            </div>
          ) : repoInfo ? (
            <div className="space-y-8">
              <div className="bg-white p-6 border-4 border-black transform -rotate-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-16 h-16 ${currentTheme.primary} rounded-none flex items-center justify-center text-black font-black text-2xl border-4 border-black transform rotate-6`}>
                    {repoInfo.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="transform rotate-2">
                    <h2 className="text-3xl font-black text-black bg-white inline-block px-2">{repoInfo.name}</h2>
                    <p className="text-lg font-bold">by {repoInfo.owner}</p>
                  </div>
                </div>
                <p className="text-black mb-6 leading-relaxed font-medium border-l-4 border-black pl-4 transform -rotate-1">{repoInfo.description}</p>
                
                <div className="bg-gray-100 p-4 border-4 border-black mb-5 transform rotate-1">
                  <div className="text-sm font-bold mb-1">PRIMARY LANGUAGE</div>
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded-none ${currentTheme.primary} border-2 border-black`}></div>
                    <span className="font-black text-xl">{repoInfo.language}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-gray-100 p-3 border-4 border-black text-center transform -rotate-2">
                    <div className="text-2xl font-black">{formatNumber(repoInfo.stars)}</div>
                    <div className="text-sm font-bold">STARS</div>
                  </div>
                  <div className="bg-gray-100 p-3 border-4 border-black text-center transform rotate-1">
                    <div className="text-2xl font-black">{formatNumber(repoInfo.forks)}</div>
                    <div className="text-sm font-bold">FORKS</div>
                  </div>
                  <div className="bg-gray-100 p-3 border-4 border-black text-center transform -rotate-1">
                    <div className="text-2xl font-black">{formatNumber(repoInfo.issues)}</div>
                    <div className="text-sm font-bold">ISSUES</div>
                  </div>
                </div>

                
                <a 
                  href={repoInfo.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`flex items-center justify-center w-full py-3 ${currentTheme.primary} text-black rounded-none 
                  font-black border-4 border-black hover:translate-x-1 hover:-translate-y-1 transition-transform`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  VISIT REPOSITORY
                </a>
              </div>
              
              <div className="bg-white p-6 border-4 border-black transform rotate-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xl font-black mb-4 flex items-center bg-gray-100 p-2 border-2 border-black transform -rotate-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  YOUR SKILLS
                </h3>
                <div className="flex flex-wrap gap-3">
                  {selectedSkills.map(skill => (
                    <span 
                      key={skill} 
                      className="bg-white px-3 py-1 rounded-none border-3 border-black text-base font-bold transform -rotate-1 hover:rotate-1 transition-transform"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-6 border-4 border-black transform -rotate-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xl font-black mb-4 flex items-center bg-gray-100 p-2 border-2 border-black transform rotate-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  CONTRIBUTION TIPS
                </h3>
                <ul className="space-y-4 font-medium">
                  <li className="flex items-start">
                    <div className={`h-6 w-6 mr-3 ${currentTheme.primary} border-2 border-black flex-shrink-0 transform rotate-12`}></div>
                    <span className="transform -rotate-1">Start with good first issues</span>
                  </li>
                  <li className="flex items-start">
                    <div className={`h-6 w-6 mr-3 ${currentTheme.primary} border-2 border-black flex-shrink-0 transform -rotate-12`}></div>
                    <span className="transform rotate-1">Read the contributing guidelines</span>
                  </li>
                  <li className="flex items-start">
                    <div className={`h-6 w-6 mr-3 ${currentTheme.primary} border-2 border-black flex-shrink-0 transform rotate-6`}></div>
                    <span className="transform -rotate-1">Join the community discussions</span>
                  </li>
                </ul>
                
                {/* Contribution Difficulty Meter - New Feature */}
                <div className="mt-6 border-4 border-black p-4 bg-gray-100 transform rotate-1">
                  <h4 className="font-black mb-2">CONTRIBUTION DIFFICULTY</h4>
                  <div className="h-6 bg-white border-2 border-black w-full">
                    <div className={`h-full ${currentTheme.primary} w-1/2 border-r-2 border-black relative`}>
                      <div className="absolute -top-2 right-0 transform translate-x-3 -translate-y-1">
                        <div className="w-4 h-4 bg-black transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm font-bold mt-1">
                    <span>BEGINNER</span>
                    <span>ADVANCED</span>
                  </div>
                </div>
              </div>
              
              {/* Activity Tracker - New Feature */}
              <div className="bg-white p-6 border-4 border-black transform rotate-1 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="text-xl font-black mb-4 bg-gray-100 p-2 border-2 border-black transform -rotate-1">
                  REPO ACTIVITY
                </h3>
                <div className="grid grid-cols-7 gap-2">
                  {Array.from({ length: 28 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-8 border-2 border-black ${Math.random() > 0.6 ? currentTheme.primary : 'bg-gray-100'}`}
                    ></div>
                  ))}
                </div>
                <div className="flex justify-between text-sm font-bold mt-2">
                  <span>4 WEEKS AGO</span>
                  <span>NOW</span>
                </div>
              </div>
            </div>
          ) : (
            <p>No repository information available</p>
          )}
        </div>
        
        <div className="flex-grow flex flex-col p-6 bg-gray-100 max-w-5xl">
          <h2 className="text-3xl font-black mb-6 flex items-center transform -rotate-1">
            <span className={`inline-block ${currentTheme.primary} p-3 border-4 border-black transform rotate-2`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </span>
            <span className="ml-4 bg-white p-2 border-4 border-black">PRism <span className={currentTheme.text}>ASSISTANT</span></span>
          </h2>
          
          <div 
            ref={chatContainerRef}
            className="flex-grow bg-white rounded-none border-4 border-black p-6 overflow-y-auto mb-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
            style={{ maxHeight: "calc(100vh - 280px)" }}
          >
            {conversation.map((message, index) => (
              <div 
                key={index} 
                className={`mb-6 ${message.type === 'user' ? 'flex justify-end' : 'flex justify-start'}`}
              >
                <div 
                  className={`rounded-none px-5 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                    message.type === 'user' 
                      ? `${currentTheme.primary} text-black border-4 border-black transform -rotate-1` 
                      : 'bg-gray-100 text-black border-4 border-black transform rotate-1'
                  }`}
                  style={{ maxWidth: "70%" }}
                >
                  {message.type === 'ai' ? (
                    <div className="markdown-content font-medium">
                      <ReactMarkdown>{message.text}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-line font-bold">{message.text}</p>
                  )}
                </div>
              </div>
            ))}
            
            {isStreaming && (
              <div className="flex justify-start mb-6">
                <div 
                  className="rounded-none px-5 py-3 bg-gray-100 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-1"
                  style={{ maxWidth: "75%" }}
                >
                  <div className="markdown-content font-medium">
                    <ReactMarkdown>{streamingMessage}</ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
            
            {aiLoading && !isStreaming && (
              <div className="flex items-center gap-2 p-4 border-4 border-black bg-white inline-block">
                <div className="animate-bounce h-4 w-4 bg-black rounded-none"></div>
                <div className="animate-bounce h-4 w-4 bg-black rounded-none" style={{ animationDelay: "0.2s" }}></div>
                <div className="animate-bounce h-4 w-4 bg-black rounded-none" style={{ animationDelay: "0.4s" }}></div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleInputSubmit} className="flex gap-2">
            <div className="relative flex-grow">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full px-5 py-4 bg-white text-black border-4 border-black rounded-none focus:outline-none focus:ring-4 focus:ring-black transition-shadow placeholder-gray-500 font-medium transform -rotate-1"
                placeholder={currentQuestion > 0 && currentQuestion <= questions.length ? "TYPE YOUR ANSWER..." : "ASK ABOUT THE REPOSITORY..."}
                disabled={isStreaming || aiLoading || currentQuestion === 0}
              />
              {(isStreaming || aiLoading) && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin h-6 w-6 border-4 border-black border-t-transparent"></div>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!userInput.trim() || isStreaming || aiLoading || currentQuestion === 0}
              className={`px-6 py-4 ${currentTheme.primary} border-4 border-black text-black font-black rounded-none hover:translate-x-1 hover:-translate-y-1 transition-transform disabled:bg-gray-300 disabled:text-gray-500 disabled:transform-none flex items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-1`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
              </svg>
              <span className="ml-2">SEND</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AiAssessScreen;
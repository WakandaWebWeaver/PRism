import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function WelcomeScreen() {
  const navigate = useNavigate();
  const [showAbout, setShowAbout] = useState(false);
  const [animatedElements, setAnimatedElements] = useState([]);

  useEffect(() => {
    const elements = ['title', 'subtitle', 'description', 'button', 'about'];
    
    const timer = setTimeout(() => {
      elements.forEach((element, index) => {
        setTimeout(() => {
          setAnimatedElements(prev => [...prev, element]);
        }, 200 * index);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <nav className="p-4 bg-white text-gray-900 flex justify-between items-center shadow-lg border-b-4 border-yellow-400">
        <h1 className="text-2xl font-extrabold tracking-wide">
          <span className="text-yellow-400">PR</span>ism
        </h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowAbout(!showAbout)}
            className="text-gray-700 hover:text-black font-semibold transition-colors"
          >
            Esvin Joshua
          </button>
        </div>
      </nav>

      
      <div className="flex flex-col items-center justify-center flex-grow px-6 py-12 relative">
        
        <h1 
          className={`text-5xl md:text-6xl font-extrabold mb-6 text-center transition-all duration-700 
            ${animatedElements.includes('title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          Welcome to <span className="text-yellow-400">PRism</span>
          <div className="mx-auto w-32 h-1 bg-yellow-400 mt-4"></div>
        </h1>
        
        <p 
          className={`text-2xl text-gray-300 mb-8 text-center max-w-lg transition-all duration-700 delay-200
            ${animatedElements.includes('subtitle') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          AI-powered open-source contribution made easy
        </p>
        
        <div 
          className={`bg-gray-800 border-2 border-gray-700 p-6 rounded-lg max-w-2xl mb-10 transition-all duration-700 delay-400
            ${animatedElements.includes('description') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <p className="text-lg text-gray-300 mb-4">
            <span className="text-yellow-400 font-bold">PRism</span> helps developers find the perfect open-source projects to contribute to based on their skills and interests.
          </p>
          <ul className="text-gray-300 space-y-2 mb-4">
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2">•</span> 
              <span>Select your programming skills and technologies</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2">•</span> 
              <span>Get matched with relevant GitHub repositories</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2">•</span> 
              <span>Find beginner-friendly issues and make meaningful contributions</span>
            </li>
          </ul>
        </div>
        
        <button
          onClick={() => navigate("/skills")}
          className={`px-10 py-5 bg-yellow-400 text-black text-xl font-bold rounded-lg 
            border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] 
            hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1
            transition-all duration-200 active:translate-x-2 active:translate-y-2 active:shadow-none
            ${animatedElements.includes('button') ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        >
          Get Started 🚀
        </button>

        {showAbout && (
          <div 
            className={`fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 p-6 transition-opacity duration-300
              ${animatedElements.includes('about') ? 'opacity-100' : 'opacity-0'}`}
            onClick={() => setShowAbout(false)}
          >
            <div 
              className="bg-gray-800 border-4 border-yellow-400 rounded-lg p-8 max-w-md w-full shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-yellow-400">About the Creator</h2>
                <button 
                  onClick={() => setShowAbout(false)}
                  className="text-gray-400 hover:text-white text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div className="border-2 border-gray-700 rounded-lg p-4 bg-gray-900">
                  <h3 className="text-xl font-bold mb-2">Esvin Joshua</h3>
                  <p className="text-gray-300">
                    Software developer passionate about open source and making contribution easier for newcomers.
                  </p>
                </div>
                <div className="border-2 border-gray-700 rounded-lg p-4 bg-gray-900">
                  <h3 className="text-lg font-bold mb-2">About PRism</h3>
                  <p className="text-gray-300 mb-2">
                    PRism was created to bridge the gap between developers and open-source projects.
                  </p>
                  <p className="text-gray-300">
                    The goal is to help developers find projects that match their skills and interests, making the open-source contribution process more accessible and enjoyable.
                  </p>
                </div>
                <div className="text-center mt-6">
                  <a 
                    href="https://github.com/wakandawebweaver" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg border-2 border-black hover:bg-yellow-300 transition-colors"
                  >
                    Visit GitHub Profile
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="py-4 text-center text-gray-500 border-t border-gray-800">
        <p>Find your next open source contribution with PRism</p>
      </footer>
    </div>
  );
}

export default WelcomeScreen;
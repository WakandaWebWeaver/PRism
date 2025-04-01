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
    <div className="min-h-screen flex flex-col bg-cyan-100 text-black">
      <nav className="p-4 bg-pink-500 text-white flex justify-between items-center shadow-[8px_8px_0px_rgba(0,0,0,1)] border-4 border-black">
        <h1 className="text-2xl font-extrabold tracking-wide">
          <span className="text-yellow-300 bg-blue-600 px-2 py-1 border-2 border-black rotate-1 inline-block transform">PR</span>
          <span className="bg-green-400 px-2 py-1 border-2 border-black -rotate-1 inline-block transform">ism</span>
        </h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setShowAbout(!showAbout)}
            className="bg-yellow-300 text-black font-bold px-4 py-2 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            Esvin Joshua
          </button>
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center flex-grow px-6 py-12 relative">
        <div className="absolute top-10 left-10 w-20 h-20 bg-yellow-400 rounded-full border-4 border-black z-0"></div>
        <div className="absolute bottom-20 right-10 w-16 h-16 bg-blue-500 border-4 border-black z-0 rotate-12"></div>
        <div className="absolute top-40 right-20 w-24 h-8 bg-green-400 border-4 border-black z-0 -rotate-6"></div>
        
        <h1 
          className={`text-5xl md:text-6xl font-black mb-8 text-center transition-all duration-700 bg-white p-6 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] rotate-1 transform
            ${animatedElements.includes('title') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          Welcome to <span className="text-pink-500 bg-yellow-300 px-2 border-2 border-black -rotate-2 inline-block transform">PRism</span>
        </h1>
        
        <p 
          className={`text-2xl font-bold mb-8 text-center max-w-lg transition-all duration-700 delay-200 bg-blue-400 text-white p-4 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] -rotate-1 transform
            ${animatedElements.includes('subtitle') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          AI-powered open-source contribution made easy
        </p>
        
        <div 
          className={`bg-white border-4 border-black p-6 rounded-none shadow-[8px_8px_0px_rgba(0,0,0,1)] max-w-2xl mb-12 transition-all duration-700 delay-400
            ${animatedElements.includes('description') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <p className="text-lg font-bold mb-4">
            <span className="text-pink-500 bg-yellow-300 px-2 border-2 border-black inline-block transform">PRism</span> helps developers find the perfect open-source projects to contribute to based on their skills and interests.
          </p>
          <ul className="space-y-4 mb-4">
            <li className="flex items-start bg-cyan-100 p-3 border-2 border-black">
              <span className="text-pink-500 text-2xl mr-2 font-black">→</span> 
              <span className="font-bold">Select your programming skills and technologies</span>
            </li>
            <li className="flex items-start bg-green-200 p-3 border-2 border-black">
              <span className="text-pink-500 text-2xl mr-2 font-black">→</span> 
              <span className="font-bold">Get matched with relevant GitHub repositories</span>
            </li>
            <li className="flex items-start bg-yellow-100 p-3 border-2 border-black">
              <span className="text-pink-500 text-2xl mr-2 font-black">→</span> 
              <span className="font-bold">Find beginner-friendly issues and make meaningful contributions</span>
            </li>
          </ul>
        </div>
        
        <button
          onClick={() => navigate("/skills")}
          className={`px-10 py-5 bg-pink-500 text-white text-xl font-bold 
            border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] 
            hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1
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
              className="bg-white border-4 border-black rounded-none p-8 max-w-md w-full shadow-[12px_12px_0px_rgba(0,0,0,1)] rotate-1 transform"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6 bg-pink-500 -mx-8 -mt-8 p-4 border-b-4 border-black">
                <h2 className="text-2xl font-black text-white">About the Creator</h2>
                <button 
                  onClick={() => setShowAbout(false)}
                  className="bg-yellow-300 text-black text-2xl font-bold h-10 w-10 flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                >
                  ×
                </button>
              </div>
              <div className="space-y-4">
                <div className="border-4 border-black p-4 bg-cyan-100 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-xl font-black mb-2">Esvin Joshua</h3>
                  <p className="font-bold">
                    Software developer passionate about open source and making contribution easier for newcomers.
                  </p>
                </div>
                <div className="border-4 border-black p-4 bg-yellow-100 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  <h3 className="text-lg font-black mb-2">About PRism</h3>
                  <p className="font-bold mb-2">
                    PRism was created to bridge the gap between developers and open-source projects.
                  </p>
                  <p className="font-bold">
                    The goal is to help developers find projects that match their skills and interests, making the open-source contribution process more accessible and enjoyable.
                  </p>
                </div>
                <div className="text-center mt-8">
                  <a 
                    href="https://github.com/wakandawebweaver" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-green-400 text-black font-black rounded-none border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
                  >
                    Visit GitHub Profile
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <footer className="py-4 text-center font-bold bg-black text-white border-t-4 border-pink-500">
        <p>Find your next open source contribution with <span className="text-pink-500">PRism</span> • Made with ♥ by Esvin Joshua</p>
      </footer>
    </div>
  );
}

export default WelcomeScreen;
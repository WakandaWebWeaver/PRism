import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function ResultsScreen() {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [visibleItems, setVisibleItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const navigate = useNavigate();
  const itemsPerPage = 6; 

  useEffect(() => {
    
    const storedSkills = localStorage.getItem('selectedSkills');
    const parsedSkills = storedSkills ? JSON.parse(storedSkills) : ["JavaScript", "Python", "React"];
    setSelectedSkills(parsedSkills);

    async function fetchRepos() {
      try {
        const response = await fetch("http://localhost:5000/repositories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ skills: parsedSkills }),
        });

        if (!response.ok) throw new Error("Failed to fetch repositories");
        const data = await response.json();
        setResults(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchRepos();
  }, []);

  
  const totalPages = Math.ceil(results.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedResults = results.slice(startIndex, startIndex + itemsPerPage);

  
  useEffect(() => {
    if (!loading && paginatedResults.length > 0) {
      
      setVisibleItems([]);
      
      
      const timer = setTimeout(() => {
        paginatedResults.forEach((_, index) => {
          setTimeout(() => {
            setVisibleItems(prev => [...prev, index]);
          }, 500 * index); 
        });
      }, 300); 

      return () => clearTimeout(timer);
    }
  }, [loading, currentPage, paginatedResults.length]);

  
  const handleViewRepo = (repo) => {
    
    localStorage.setItem('currentRepo', JSON.stringify(repo));
    navigate("/ai-assess");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <nav className="p-4 bg-white text-gray-900 flex justify-between items-center shadow-lg border-b-4 border-yellow-400">
        <h1 className="text-2xl font-extrabold tracking-wide">
          <span className="text-yellow-400">PR</span>ism
        </h1>
        <p className="text-gray-700 font-semibold">Open Source Matches</p>
      </nav>

      <div className="flex flex-col items-center justify-center flex-grow px-6 py-8">
        <h1 className="text-4xl font-extrabold mb-10 text-center relative">
          Your <span className="text-yellow-400">Open Source Matches</span>
          <div className="absolute w-24 h-1 bg-yellow-400 bottom-0 left-1/2 transform -translate-x-1/2 mt-2"></div>
        </h1>
        
        {selectedSkills.length > 0 && (
          <div className="mb-8 flex flex-col items-center">
            <p className="text-gray-300 mb-2">Matched projects for:</p>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
              {selectedSkills.map(skill => (
                <span 
                  key={skill} 
                  className="bg-gray-800 text-yellow-400 px-3 py-1 rounded-full border border-yellow-400"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center gap-4 w-full max-w-4xl">
            <p className="text-gray-400 text-lg mb-4">Finding your perfect matches...</p>
            <div className="w-32 h-1 bg-yellow-400 mb-4"></div>
            <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-36 bg-gray-800 rounded-lg border-2 border-gray-700 shadow-lg"
                ></div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-900 border-2 border-red-500 rounded-lg text-center">
            <p className="text-red-400 font-bold text-lg">{error}</p>
            <button 
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="w-full max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedResults.map((repo, index) => (
                <div
                  key={index}
                  className={`p-5 bg-gray-800 text-white rounded-lg border-2 border-yellow-400 
                  shadow-lg transform transition-all duration-500 hover:-translate-y-2 hover:shadow-yellow-400/20
                  ${visibleItems.includes(index) 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-8 pointer-events-none"}`}
                  style={{
                    transition: "all 0.5s ease-out",
                    visibility: "visible"
                  }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-xl font-bold truncate">{repo.repo}</h2>
                    <span className="bg-yellow-400 text-black text-xs px-2 py-1 rounded-full font-bold">
                      ⭐ {repo.stars}
                    </span>
                  </div>
                  <p className="text-gray-300 mb-3">{repo.lang}</p>
                  <div className="flex gap-2 mt-4">
                    <a 
                      href={repo.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex-1 text-center py-2 bg-gray-700 text-white rounded-lg 
                      font-semibold hover:bg-gray-600 transition-colors"
                    >
                      View on GitHub
                    </a>
                    <button
                      onClick={() => handleViewRepo(repo)}
                      className="flex-1 py-2 bg-yellow-400 text-black rounded-lg 
                      font-semibold hover:bg-yellow-300 transition-colors"
                    >
                      AI Assess
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg bg-gray-800 border-2 border-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <div className="flex items-center gap-2 mx-4">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-colors
                        ${currentPage === index + 1 
                          ? "bg-yellow-400 text-black" 
                          : "bg-gray-800 text-white border-2 border-gray-700 hover:bg-gray-700"}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg bg-gray-800 border-2 border-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="py-4 text-center text-gray-500 border-t border-gray-800">
        <p>Find your next open source contribution with PRism</p>
      </footer>
    </div>
  );
}

export default ResultsScreen;
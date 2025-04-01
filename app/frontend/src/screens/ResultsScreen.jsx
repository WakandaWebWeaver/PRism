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
          }, 300 * index);
        });
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [loading, currentPage, paginatedResults.length]);

  const handleViewRepo = (repo) => {
    localStorage.setItem('currentRepo', JSON.stringify(repo));
    navigate("/ai-assess");
  };

  // Random rotation angles for cards
  const getRandomRotation = () => {
    const angles = [-3, -2, -1, 0, 1, 2, 3];
    return angles[Math.floor(Math.random() * angles.length)];
  };

  // Random colors for neobrutalist cards
  const getCardColor = (index) => {
    const colors = [
      "bg-yellow-400 border-black", 
      "bg-blue-400 border-black",
      "bg-green-400 border-black", 
      "bg-pink-400 border-black",
      "bg-purple-400 border-black",
      "bg-orange-400 border-black"
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Neobrutalist navigation */}
      <nav className="p-4 bg-black text-white flex justify-between items-center shadow-lg border-b-8 border-yellow-400">
        <h1 className="text-3xl font-black tracking-wide">
          <span className="text-yellow-400">PR</span>ISM
        </h1>
        <div className="bg-yellow-400 text-black font-black px-6 py-3 transform rotate-1 shadow-md border-4 border-black">
          OPEN SOURCE MATCHES
        </div>
      </nav>

      <div className="flex flex-col items-center justify-center flex-grow px-6 py-8 max-w-7xl mx-auto">
        {/* Heading with neobrutalist style */}
        <h1 className="text-5xl font-black mb-12 text-center relative transform -rotate-1 bg-black text-white px-8 py-4 inline-block">
          YOUR <span className="text-yellow-400">OPEN SOURCE</span> MATCHES
        </h1>
        
        {selectedSkills.length > 0 && (
          <div className="mb-8 flex flex-col items-center">
            <p className="text-xl font-bold mb-3 transform rotate-1 bg-black text-white px-4 py-2 inline-block">MATCHED PROJECTS FOR:</p>
            <div className="flex flex-wrap justify-center gap-3 max-w-2xl">
              {selectedSkills.map((skill, idx) => (
                <span 
                  key={skill} 
                  className={`px-4 py-2 rounded-none text-black font-black text-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0)] transform ${idx % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}
                  style={{ 
                    backgroundColor: ['#ffd700', '#ff90e8', '#90e0ff', '#93ff90'][idx % 4],
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center gap-4 w-full max-w-4xl">
            <p className="text-black text-2xl font-black mb-4 transform rotate-1 bg-yellow-400 px-6 py-3 inline-block border-4 border-black">FINDING YOUR PERFECT MATCHES...</p>
            <div className="w-32 h-4 bg-black mb-8"></div>
            <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`h-48 border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0)] transform ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}
                  style={{ 
                    backgroundColor: ['#ffd700', '#ff90e8', '#90e0ff', '#93ff90', '#ff9f7f', '#b490ff'][i % 6] 
                  }}
                ></div>
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="p-8 bg-red-400 border-8 border-black text-center transform -rotate-1 shadow-[12px_12px_0px_0px_rgba(0,0,0)]">
            <p className="text-black font-black text-2xl mb-4">{error}</p>
            <button 
              className="mt-4 px-8 py-4 bg-black text-white font-black text-xl border-4 border-white hover:bg-red-600 transition-colors transform rotate-1"
              onClick={() => window.location.reload()}
            >
              TRY AGAIN
            </button>
          </div>
        ) : (
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {paginatedResults.map((repo, index) => {
                const rotation = getRandomRotation();
                const colorClass = getCardColor(index);
                
                return (
                  <div
                    key={index}
                    className={`p-6 ${colorClass} text-black rounded-none border-8 
                    shadow-[12px_12px_0px_0px_rgba(0,0,0)]
                    transform transition-all duration-300 hover:-translate-y-2 
                    ${visibleItems.includes(index) 
                      ? `opacity-100 rotate-${rotation}` 
                      : "opacity-0 translate-y-8 pointer-events-none"}`}
                    style={{
                      transition: "all 0.3s ease-out",
                      visibility: "visible"
                    }}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-2xl font-black truncate">{repo.repo}</h2>
                      <span className="bg-black text-white text-lg px-3 py-1 font-black transform rotate-3">
                        ⭐ {repo.stars}
                      </span>
                    </div>
                    <p className="text-black font-bold mb-4 text-lg">{repo.lang}</p>
                    <div className="flex flex-col gap-3 mt-6">
                      <a 
                        href={repo.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-center py-3 bg-white text-black rounded-none 
                        font-black text-lg border-4 border-black hover:bg-gray-100 
                        transition-transform hover:translate-x-1 hover:translate-y-1"
                      >
                        VIEW ON GITHUB
                      </a>
                      <button
                        onClick={() => handleViewRepo(repo)}
                        className="py-3 bg-black text-white rounded-none 
                        font-black text-lg border-4 border-black hover:bg-gray-900
                        transition-transform hover:translate-x-1 hover:translate-y-1"
                      >
                        AI ASSESS
                      </button>
                    </div>
                    
                    {/* Random decorative elements */}
                    <div 
                      className="absolute w-6 h-6 bg-black rounded-full" 
                      style={{
                        top: `${10 + Math.random() * 20}%`,
                        right: `${5 + Math.random() * 15}%`
                      }}
                    ></div>
                    <div 
                      className="absolute w-12 h-3 bg-black" 
                      style={{
                        bottom: `${10 + Math.random() * 20}%`,
                        left: `${5 + Math.random() * 10}%`,
                        transform: `rotate(${Math.random() * 45}deg)`
                      }}
                    ></div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-4 font-black text-xl bg-black text-white border-4 border-black disabled:opacity-50 transform -rotate-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]"
                >
                  ← PREV
                </button>
                <div className="flex items-center gap-3 mx-4">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`w-12 h-12 flex items-center justify-center font-black text-xl border-4 border-black
                        transform ${index % 2 === 0 ? 'rotate-2' : '-rotate-2'} shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]
                        ${currentPage === index + 1 
                          ? "bg-yellow-400 text-black" 
                          : "bg-white text-black hover:bg-gray-100"}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-6 py-4 font-black text-xl bg-black text-white border-4 border-black disabled:opacity-50 transform rotate-1 shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)]"
                >
                  NEXT →
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <footer className="py-6 text-center border-t-8 border-black">
        <p className="text-black font-bold text-xl transform -rotate-1 inline-block bg-yellow-400 px-6 py-3 border-4 border-black">
          FIND YOUR NEXT OPEN SOURCE CONTRIBUTION WITH PRism
        </p>
      </footer>
    </div>
  );
}

export default ResultsScreen;
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const skillsList = [
  "JavaScript", "Python", "C++", "React", "AI/ML", "Rust",
  "Node.js", "TypeScript", "Go", "Kotlin", "Swift", "Dart",
  "Cybersecurity", "Blockchain", "Cloud Computing", "DevOps"
];

function SkillsScreen() {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [customSkill, setCustomSkill] = useState("");
  const [animatedSkills, setAnimatedSkills] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      skillsList.forEach((_, index) => {
        setTimeout(() => {
          setAnimatedSkills(prev => [...prev, index]);
        }, 50 * index);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill)) {
      setSelectedSkills((prev) => [...prev, customSkill.trim()]);
      setCustomSkill("");
    }
  };

  const handleContinue = () => {
    localStorage.setItem('selectedSkills', JSON.stringify(selectedSkills));
    navigate("/results");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-white">
      <nav className="p-4 bg-white text-gray-900 flex justify-between items-center shadow-lg border-b-4 border-yellow-400">
        <h1 className="text-2xl font-extrabold tracking-wide">
          <span className="text-yellow-400">PR</span>ism
        </h1>
        <p className="text-gray-700 font-semibold">Select Your Skills</p>
      </nav>

      <div className="flex flex-col items-center justify-center flex-grow px-6 py-8">
        <h1 className="text-4xl font-extrabold mb-10 text-center relative">
          Choose Your <span className="text-yellow-400">Top Skills</span>
          <div className="absolute w-24 h-1 bg-yellow-400 bottom-0 left-1/2 transform -translate-x-1/2 mt-2"></div>
        </h1>
        
        <p className="text-gray-300 mb-8 text-center max-w-lg text-lg">
          Select the technologies you're comfortable with to find matching open source projects.
        </p>

        <div className="mb-6 bg-gray-800 px-6 py-3 rounded-full border-2 border-yellow-400">
          <span className="text-gray-300">Selected: </span>
          <span className="text-yellow-400 font-bold text-lg">{selectedSkills.length}</span>
          <span className="text-gray-300"> skills</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-3xl mb-8">
          {skillsList.map((skill, index) => (
            <button
              key={skill}
              className={`px-5 py-3 text-lg font-bold rounded-lg border-2 transition-all duration-300
                ${selectedSkills.includes(skill)
                  ? "bg-yellow-400 text-black border-black shadow-lg transform -translate-y-1"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700"}
                ${animatedSkills.includes(index) 
                  ? "opacity-100 translate-y-0" 
                  : "opacity-0 translate-y-4"}`}
              onClick={() => toggleSkill(skill)}
            >
              {selectedSkills.includes(skill) ? (
                <div className="flex items-center justify-between">
                  <span>{skill}</span>
                  <span className="ml-2 flex-shrink-0 bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">✓</span>
                </div>
              ) : (
                skill
              )}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center w-full max-w-lg bg-gray-800 p-6 rounded-lg border-2 border-gray-700 mb-8">
          <p className="text-gray-300 mb-4 font-medium">Not seeing your skill? Add it here:</p>
          <div className="flex w-full gap-2">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              className="flex-grow px-4 py-3 text-black bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:border-yellow-400 transition-colors"
              placeholder="Enter skill..."
              onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
            />
            <button
              onClick={addCustomSkill}
              className="px-5 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 transition-colors"
            >
              Add
            </button>
          </div>
        </div>

        {selectedSkills.length > 0 && (
          <div className="mb-8 w-full max-w-3xl">
            <p className="text-gray-300 mb-3 font-medium">Your selected skills:</p>
            <div className="flex flex-wrap gap-2">
              {selectedSkills.map((skill) => (
                <div 
                  key={skill}
                  className="bg-gray-800 text-yellow-400 px-3 py-1 rounded-full border border-yellow-400 flex items-center"
                >
                  {skill}
                  <button 
                    onClick={() => toggleSkill(skill)}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={selectedSkills.length === 0}
          className={`px-8 py-4 text-lg font-bold rounded-lg shadow-lg transition-all duration-300
            ${selectedSkills.length > 0
              ? "bg-yellow-400 text-black hover:bg-yellow-300 transform hover:-translate-y-1"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"}`}
        >
          {selectedSkills.length > 0 ? (
            <div className="flex items-center">
              Find Matching Projects
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </div>
          ) : (
            "Select at least one skill"
          )}
        </button>
      </div>

      <footer className="py-4 text-center text-gray-500 border-t border-gray-800">
        <p>Find your next open source contribution with PRism</p>
      </footer>
    </div>
  );
}

export default SkillsScreen;
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
  const [isShaking, setIsShaking] = useState(false);
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
    
    if (!selectedSkills.includes(skill)) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill)) {
      setSelectedSkills((prev) => [...prev, customSkill.trim()]);
      setCustomSkill("");
      
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleContinue = () => {
    localStorage.setItem('selectedSkills', JSON.stringify(selectedSkills));
    navigate("/results");
  };

  const getRandomRotation = (index) => {
    const rotations = [-2, -1, 0, 1, 2];
    return rotations[index % rotations.length];
  };

  return (
    <div className="min-h-screen flex flex-col bg-cyan-100 text-black">
      
      <nav className="p-4 bg-pink-500 text-white flex justify-between items-center shadow-[8px_8px_0px_rgba(0,0,0,1)] border-4 border-black">
        <h1 className="text-2xl font-extrabold tracking-wide">
          <span className="text-yellow-300 bg-blue-600 px-2 py-1 border-2 border-black rotate-1 inline-block transform">PR</span>
          <span className="bg-green-400 px-2 py-1 border-2 border-black -rotate-1 inline-block transform">ism</span>
        </h1>
        <p className="bg-yellow-300 text-black font-bold px-4 py-2 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] -rotate-1 transform">Select Your Skills</p>
      </nav>

      <div className="flex flex-col items-center justify-center flex-grow px-6 py-8 relative">
        
        <div className="absolute top-20 left-10 w-16 h-16 bg-pink-400 border-4 border-black z-0 rotate-12"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-yellow-300 border-4 border-black z-0 -rotate-6"></div>
        <div className="absolute top-1/3 right-10 w-12 h-12 bg-blue-400 border-4 border-black z-0 rotate-45"></div>
        
        <h1 className="text-4xl font-black mb-10 text-center relative bg-white p-4 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] rotate-1 transform">
          Choose Your <span className="text-pink-500 bg-yellow-300 px-2 border-2 border-black inline-block transform">Top Skills</span>
        </h1>
        
        <p className="text-gray-800 mb-8 text-center max-w-lg text-lg font-bold bg-green-200 p-4 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] -rotate-1 transform">
          Select the technologies you're comfortable with to find matching open source projects.
        </p>
        
        <div className={`mb-6 bg-yellow-300 px-6 py-3 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-all ${isShaking ? 'animate-[wiggle_0.5s_ease-in-out]' : ''}`}
          style={{animation: isShaking ? 'wiggle 0.5s ease-in-out' : 'none'}}
        >
          <span className="text-black font-bold">Selected: </span>
          <span className="text-pink-500 font-black text-2xl">{selectedSkills.length}</span>
          <span className="text-black font-bold"> skills</span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-w-3xl mb-8">
          {skillsList.map((skill, index) => (
            <button
              key={skill}
              className={`px-5 py-3 text-lg font-bold border-4 border-black transition-all duration-300
                ${selectedSkills.includes(skill)
                  ? "bg-pink-500 text-white shadow-[4px_4px_0px_rgba(0,0,0,1)]"
                  : "bg-white text-black hover:bg-blue-100 shadow-[2px_2px_0px_rgba(0,0,0,1)]"}
                ${animatedSkills.includes(index)
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"}`}
              onClick={() => toggleSkill(skill)}
              style={{transform: `rotate(${getRandomRotation(index)}deg)`}}
            >
              {selectedSkills.includes(skill) ? (
                <div className="flex items-center justify-between">
                  <span>{skill}</span>
                  <span className="ml-2 flex-shrink-0 bg-yellow-300 text-black w-6 h-6 rounded-none border-2 border-black flex items-center justify-center text-xs">✓</span>
                </div>
              ) : (
                skill
              )}
            </button>
          ))}
        </div>
        
        <div className="flex flex-col items-center w-full max-w-lg bg-white p-6 border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,1)] mb-8 rotate-1 transform">
          <p className="text-black mb-4 font-bold">Not seeing your skill? Add it here:</p>
          <div className="flex w-full gap-2">
            <input
              type="text"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              className="flex-grow px-4 py-3 text-black bg-yellow-100 border-4 border-black focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
              placeholder="Enter skill..."
              onKeyPress={(e) => e.key === 'Enter' && addCustomSkill()}
            />
            <button
              onClick={addCustomSkill}
              className="px-5 py-3 bg-green-400 text-black font-bold border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
            >
              Add
            </button>
          </div>
        </div>
        
        {selectedSkills.length > 0 && (
          <div className="mb-8 w-full max-w-3xl bg-blue-100 p-4 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] -rotate-1 transform">
            <p className="text-black mb-3 font-bold">Your selected skills:</p>
            <div className="flex flex-wrap gap-3">
              {selectedSkills.map((skill, index) => (
                <div
                  key={skill}
                  className="bg-white text-black px-3 py-2 border-2 border-black flex items-center shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                  style={{transform: `rotate(${getRandomRotation(index)}deg)`}}
                >
                  <span className="font-bold">{skill}</span>
                  <button
                    onClick={() => toggleSkill(skill)}
                    className="ml-2 bg-red-500 text-white w-5 h-5 flex items-center justify-center font-bold border border-black"
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
          className={`px-10 py-5 text-xl font-black border-4 border-black transition-all duration-300
            ${selectedSkills.length > 0
              ? "bg-pink-500 text-white shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1"
              : "bg-gray-400 text-gray-600 cursor-not-allowed"}`}
        >
          {selectedSkills.length > 0 ? (
            <div className="flex items-center">
              Find Matching Projects
              <svg className="ml-2 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </div>
          ) : (
            "Select at least one skill"
          )}
        </button>
        
        {/* Skill Selection - Should redirect to results page
        <div className="mt-10 mb-6 w-full max-w-3xl">
          <div className="bg-yellow-300 p-4 border-4 border-black shadow-[6px_6px_0px_rgba(0,0,0,1)] rotate-1 transform">
            <h3 className="text-xl font-black mb-3">Need inspiration? Try these categories:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <button className="bg-cyan-200 p-3 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold hover:bg-cyan-300 transition-colors">Frontend</button>
              <button className="bg-green-200 p-3 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold hover:bg-green-300 transition-colors">Backend</button>
              <button className="bg-pink-200 p-3 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold hover:bg-pink-300 transition-colors">Mobile</button>
              <button className="bg-blue-200 p-3 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold hover:bg-blue-300 transition-colors">Data Science</button>
              <button className="bg-purple-200 p-3 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold hover:bg-purple-300 transition-colors">Game Dev</button>
              <button className="bg-red-200 p-3 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] font-bold hover:bg-red-300 transition-colors">Security</button>
            </div>
          </div>
        </div> */}
      </div>

      <footer className="py-4 text-center font-bold bg-black text-white border-t-4 border-pink-500">
        <p>Find your next open source contribution with <span className="text-pink-500">PRism</span> • Made with ♥ by Esvin Joshua</p>
      </footer>
      
      <style jsx>{`
        @keyframes wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-2deg); }
          75% { transform: rotate(2deg); }
        }
      `}</style>
    </div>
  );
}

export default SkillsScreen;
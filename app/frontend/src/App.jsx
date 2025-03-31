import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomeScreen from "./screens/WelcomeScreen";
import SkillsScreen from "./screens/SkillsScreen";
import ResultsScreen from "./screens/ResultsScreen";
import AiAssessScreen from "./screens/AiAssessScreen";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/skills" element={<SkillsScreen />} />
        <Route path="/results" element={<ResultsScreen />} />
        <Route path="/ai-assess" element={<AiAssessScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
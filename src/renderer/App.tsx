import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

import Timer from './components/Timer/timer';
import { useEffect, useState } from 'react';
import { IProject } from './models/data/project';
import { IProjectItem } from './models/data/projectItem';

function TimersDashboard() {
  const [ projects, setProjects ] = useState<IProjectItem[]>([]);
  const [ behaviorSubject , setBehaviorSubject ] = useState( document.createElement("behaviour-subject") );

  useEffect(() => {
    window.electron.projects.getProjects().then((projects) => setProjects(projects || []));
  }, []);


  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        { projects.map((p) => <Timer key={ p.fileName } fileName={ p.fileName } projectName={ p.projectName } completed={ p.completed } behaviorSubject={ behaviorSubject }></Timer>) }
        <div>

          <button type="button" onClick={() => window.electron.projects.createProject("New Project")}> Add timer </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TimersDashboard />} />
      </Routes>
    </Router>
  );
}

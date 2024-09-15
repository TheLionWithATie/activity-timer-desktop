import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';

import './support-classes.css';
import './theme.css';
import { TimersDashboard } from './pages/TimersDashboard/TimersDashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TimersDashboard />} />
      </Routes>
    </Router>
  );
}

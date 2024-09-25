import { MemoryRouter as Router, Routes, Route, redirect, Link } from 'react-router-dom';

import './support-classes.css';
import './theme.css';
import { TimersDashboard } from './pages/TimersDashboard/TimersDashboard';
import { TimeSheetsView } from './pages/TimeSheetsView/TimeSheetsView';
import { SelectorButtonsField } from './components/fields/SelectorButtonsField';

interface IRoute {
  name: string,
  route: string
}
const routes = [ { route: "/", name: "Timers" }, { route: "/timeSheet", name: "Time Sheets" } ];

export default function App() {
  return (
    <Router>

      <div className="app-navigation-header flex-row">
        <div className="selector-buttons">
          {
            routes.map(opt =>
              <Link key={ "route-" + opt.name } className="selector-button" to={ opt.route } aria-selected={ window.location.pathname == opt.route }>
               { opt.name }
              </Link>
            )
          }
        </div>
      </div>
      <Routes>
        <Route path="/" element={<TimersDashboard />} />
        <Route path="/timeSheet" element={<TimeSheetsView />} />
      </Routes>
    </Router>
  );
}

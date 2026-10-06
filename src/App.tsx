import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthRouter from './apps/routers/AuthRouter'
import DashboardRouter from './apps/routers/DashboardRouter';

function App() {

  return (
    <Router>
        <Routes>
          <Route path="/*" element={<AuthRouter />} />
          <Route path="/dashboard" element={<DashboardRouter />} />
          

        </Routes>
      </Router>
  )
}

export default App

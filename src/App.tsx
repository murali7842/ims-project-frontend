import './App.css'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AuthRouter from './apps/routers/AuthRouter'

function App() {

  return (
    <Router>
        <Routes>
          <Route path="/*" element={<AuthRouter />} />
          

        </Routes>
      </Router>
  )
}

export default App

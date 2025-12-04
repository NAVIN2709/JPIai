import React from 'react';
import Home from './pages/Home';
import LandingPage from './pages/Landing';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/think" element={<Home />} />
      </Routes>
    </Router>
  )
}
export default App;
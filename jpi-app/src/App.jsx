import React from 'react';
import Home from './pages/Home';
import LandingPage from './pages/Landing';
import { BrowserRouter as Route, Routes } from 'react-router-dom';

const App = () => {
  return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/think" element={<Home />} />
      </Routes>
  )
}
export default App;
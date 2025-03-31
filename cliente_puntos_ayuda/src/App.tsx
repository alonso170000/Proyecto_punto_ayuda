import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './componentes/Login';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<h1>Bienvenido al Dashboard</h1>} />
      </Routes>
    </Router>
  );
};

export default App;

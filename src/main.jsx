import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Create from './pages/Create.jsx';
import Profile from './pages/Profile.jsx';
import Explore from './pages/Explore.jsx';
import Lookup from './pages/Lookup.jsx';
import NotFound from './pages/NotFound.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/new" element={<Create />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/find" element={<Lookup />} />
        <Route path="/:handle" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

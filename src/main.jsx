import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Create from './pages/Create.jsx';
import Profile from './pages/Profile.jsx';
import Explore from './pages/Explore.jsx';
import Lookup from './pages/Lookup.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';

// Studio (isolated — won't affect main site if broken)
import StudioLanding from './studio/pages/StudioLanding.jsx';
import StudioCreate from './studio/pages/StudioCreate.jsx';
import StudioProfile from './studio/pages/StudioProfile.jsx';
import StudioAnalytics from './studio/pages/StudioAnalytics.jsx';
import StudioExplore from './studio/pages/StudioExplore.jsx';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Studio routes — checked first so /studio/* never collides with /:handle */}
        <Route path="/studio" element={<StudioLanding />} />
        <Route path="/studio/new" element={<StudioCreate />} />
        <Route path="/studio/explore" element={<StudioExplore />} />
        <Route path="/studio/:handle" element={<StudioProfile />} />
        <Route path="/studio/:handle/analytics" element={<StudioAnalytics />} />

        {/* Existing main site routes — untouched */}
        <Route path="/" element={<Landing />} />
        <Route path="/new" element={<Create />} />
        <Route path="/login" element={<Login />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/find" element={<Lookup />} />
        <Route path="/:handle" element={<Profile />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);

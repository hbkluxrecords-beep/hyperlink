import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Route } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Create from './pages/Create.jsx';
import Profile from './pages/Profile.jsx';
import Edit from './pages/Edit.jsx';
import Explore from './pages/Explore.jsx';
import Lookup from './pages/Lookup.jsx';
import Login from './pages/Login.jsx';
import Upgrade from './pages/Upgrade.jsx';
import NotFound from './pages/NotFound.jsx';
import SmartProfileResolver from './components/SmartProfileResolver.jsx';
import RouteTransitions from './components/RouteTransitions.jsx';

import StudioLanding from './studio/pages/StudioLanding.jsx';
import StudioCreate from './studio/pages/StudioCreate.jsx';
import StudioProfile from './studio/pages/StudioProfile.jsx';
import StudioEdit from './studio/pages/StudioEdit.jsx';
import StudioAnalytics from './studio/pages/StudioAnalytics.jsx';
import StudioExplore from './studio/pages/StudioExplore.jsx';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <RouteTransitions>
        <Route path="/studio" element={<StudioLanding />} />
        <Route path="/studio/new" element={<StudioCreate />} />
        <Route path="/studio/explore" element={<StudioExplore />} />
        <Route path="/studio/:handle/edit" element={<StudioEdit />} />
        <Route path="/studio/:handle" element={<StudioProfile />} />
        <Route path="/studio/:handle/analytics" element={<StudioAnalytics />} />

        <Route path="/" element={<Landing />} />
        <Route path="/new" element={<Create />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upgrade" element={<Upgrade />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/find" element={<Lookup />} />
        <Route path="/:handle/edit" element={<Edit />} />
        <Route path="/:handle" element={<SmartProfileResolver />} />
        <Route path="*" element={<NotFound />} />
      </RouteTransitions>
    </BrowserRouter>
  </React.StrictMode>
);

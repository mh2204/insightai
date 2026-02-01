import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';

import Analyze from './pages/Analyze';
import Train from './pages/Train';
import Explain from './pages/Explain';
import Predict from './pages/Predict';
import Story from './pages/Story';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/train" element={<Train />} />
          <Route path="/explain" element={<Explain />} />
          <Route path="/predict" element={<Predict />} />
          <Route path="/story" element={<Story />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

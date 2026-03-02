import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Stories from "./pages/Stories";
import StoryPlayer from "./pages/StoryPlayer";
import Translate from "./pages/Translate";
import About from "./pages/About";
import "./styles/global.css";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/story/:id" element={<StoryPlayer />} />
        <Route path="/translate" element={<Translate />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Router>
  );
}

export default App;
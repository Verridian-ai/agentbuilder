import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MobileNavProvider, TabBar } from './components/MobileNavigation';
import Dashboard from './pages/Dashboard';
import Builder from './pages/Builder';
import ProjectsPage from './pages/Projects';
import TemplatesPage from './pages/Templates';
import SettingsPage from './pages/Settings';
import NetworkPage from './pages/Network';
import McpBuilderPage from './pages/McpBuilder';
import ResearchPage from './pages/Research';
import IDEPage from './pages/IDE';
import CloudIDEPage from './pages/CloudIDE';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <MobileNavProvider>
        <div className="min-h-screen bg-canvas">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/builder/:id" element={<Builder />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/mcp-builder" element={<McpBuilderPage />} />
            <Route path="/research" element={<ResearchPage />} />
            <Route path="/ide" element={<IDEPage />} />
            <Route path="/cloud-ide" element={<CloudIDEPage />} />
          </Routes>
          <TabBar />
        </div>
      </MobileNavProvider>
    </BrowserRouter>
  );
}

export default App;
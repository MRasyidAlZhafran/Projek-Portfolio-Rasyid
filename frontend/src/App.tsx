import { Routes, Route } from 'react-router-dom';
import Portfolio from './pages/Public/Portfolio';
import AdminLogin from './pages/Admin/Login';
import AdminLayout from './pages/Admin/Layout';
import Dashboard from './pages/Admin/Dashboard';
import Projects from './pages/Admin/Projects';
import Skills from './pages/Admin/Skills';
import Messages from './pages/Admin/Messages';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Portfolio />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
        <Route path="skills" element={<Skills />} />
        <Route path="messages" element={<Messages />} />
      </Route>
    </Routes>
  );
}

export default App;

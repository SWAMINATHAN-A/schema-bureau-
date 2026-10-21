import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { SchemaProvider } from './contexts/SchemaContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppShell } from './components/layout/AppShell';
import { BootLoader } from './components/layout/BootLoader';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Workspace } from './pages/Workspace';
import { Learn } from './pages/Learn';
import { Examples } from './pages/Examples';
import { History } from './pages/History';
import { Insights } from './pages/Insights';
import { Landing } from './pages/Landing';
import { Settings } from './pages/Settings';
import { VideoLibrary } from './pages/VideoLibrary';
import { GateArena } from './pages/GateArena';
import { ProjectRequirements } from './pages/ProjectRequirements';

function BootGate({ children }: { children: React.ReactNode }) {
  const [booting, setBooting] = useState(true);
  const finish = useCallback(() => setBooting(false), []);
  return <>{booting ? <BootLoader onDone={finish} /> : null}{children}</>;
}

export function App() {
  useEffect(() => { document.title = 'SCHEMA BUREAU — Relational Systems Lab'; }, []);
  return <ThemeProvider><AuthProvider><SchemaProvider><BrowserRouter><BootGate>
    <div className="min-h-full w-full bg-bg text-fg">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/app" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route index element={<Workspace />} />
          <Route path="learn" element={<Learn />} />
          <Route path="examples" element={<Examples />} />
          <Route path="history" element={<History />} />
          <Route path="insights" element={<Insights />} />
          <Route path="videos" element={<VideoLibrary />} />
          <Route path="gate-dbms" element={<GateArena />} />
          <Route path="project-companion" element={<ProjectRequirements />} />
          <Route path="settings" element={<Settings />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  </BootGate></BrowserRouter></SchemaProvider></AuthProvider></ThemeProvider>;
}

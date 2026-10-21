import React from 'react';
import { LogOutIcon, MonitorIcon, MoonIcon, SunIcon, ShieldCheckIcon, Trash2Icon, UserIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { StorageService } from '../services/storageService';
import { Button } from '../components/common/Button';

export function Settings() {
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const clearLocal = () => { StorageService.clearHistory(); StorageService.clearAnalytics(); window.location.reload(); };
  const logout = () => { signOut(); navigate('/login', { replace: true }); };

  return <div className="bureau-settings-page">
    <header>
      <div>
        <p className="foundry-overline">SYSTEM / SETTINGS</p>
        <h1>CONTROL ROOM.</h1>
        <p>Keep the workspace quiet. Change the environment without changing the work.</p>
      </div>
    </header>

    <section className="settings-grid">
      <div className="settings-card">
        <div className="settings-card-head"><span>01 / APPEARANCE</span><MonitorIcon size={18}/></div>
        <h2>LIGHT / DARK</h2>
        <p>Switch the working surface between the paper daylight and the night instrument.</p>
        <div className="settings-choice">
          <button className={theme==='light'?'active':''} onClick={()=>theme==='dark'&&toggle()}><SunIcon size={16}/> DAYLIGHT</button>
          <button className={theme==='dark'?'active':''} onClick={()=>theme==='light'&&toggle()}><MoonIcon size={16}/> NIGHT SHIFT</button>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-card-head"><span>02 / PRIVACY</span><ShieldCheckIcon size={18}/></div>
        <h2>LOCAL-FIRST</h2>
        <p>Your schemas, drafts, history and telemetry are stored in this browser. No upload is required for analysis.</p>
        <div className="settings-status"><i/> LOCAL STORAGE ACTIVE</div>
      </div>

      <div className="settings-card danger">
        <div className="settings-card-head"><span>03 / RESET</span><Trash2Icon size={18}/></div>
        <h2>CLEAR LOCAL WORK</h2>
        <p>Remove saved schemas, drafts and usage telemetry from this browser. This cannot be undone.</p>
        <Button variant="danger" onClick={clearLocal}>CLEAR LOCAL DATA</Button>
      </div>

      <div className="settings-card settings-account-card">
        <div className="settings-card-head"><span>04 / ACCOUNT</span><UserIcon size={18}/></div>
        <h2>ACTIVE OPERATOR</h2>
        <p>You are signed in locally as <strong>{user?.name || 'Operator'}</strong> ({user?.email || 'unknown'}).</p>
        <button className="settings-logout" onClick={logout}><LogOutIcon size={16}/> SIGN OUT <span>→</span></button>
      </div>
    </section>
  </div>;
}

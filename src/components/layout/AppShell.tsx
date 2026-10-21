import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BookOpenIcon, BoxesIcon, Clock3Icon, CommandIcon, DatabaseIcon, EyeIcon, LogOutIcon, MoonIcon, SettingsIcon, SunIcon, UserIcon, ClapperboardIcon, TrophyIcon, ClipboardListIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { Dropdown } from '../common/Dropdown';
import { CommandPalette } from './CommandPalette';
import { cn } from '../../utils/cn';

const NAV=[
 {to:'/app',label:'Workbench',icon:DatabaseIcon,end:true,code:'01'},
 {to:'/app/learn',label:'Learn',icon:BookOpenIcon,code:'02'},
 {to:'/app/examples',label:'Blueprints',icon:BoxesIcon,code:'03'},
 {to:'/app/history',label:'Archive',icon:Clock3Icon,code:'04'},
 {to:'/app/insights',label:'Telemetry',icon:EyeIcon,code:'05'},
 {to:'/app/videos',label:'Video Library',icon:ClapperboardIcon,code:'06'},
 {to:'/app/gate-dbms',label:'GATE DBMS Arena',icon:TrophyIcon,code:'07'},
 {to:'/app/project-companion',label:'Project Companion',icon:ClipboardListIcon,code:'08'}
];
export function AppShell(){
 const {user,signOut}=useAuth(); const {theme,toggle}=useTheme(); const navigate=useNavigate(); const location=useLocation(); const [paletteOpen,setPaletteOpen]=useState(false);
 useEffect(()=>{const onKey=(e:KeyboardEvent)=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();setPaletteOpen(true)}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[]);
 const current=NAV.find(n=>n.end?location.pathname===n.to:location.pathname.startsWith(n.to)); const initials=(user?.name??'SB').split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase();
 return <div className="bureau-app-shell">
   <aside className="bureau-rail">
    <button className="bureau-app-logo" onClick={()=>navigate('/app')} aria-label="Schema Bureau"><span className="bureau-mark"><i/><i/><i/></span><span><strong>SB</strong><small>LAB</small></span></button>
    <div className="bureau-rail-section">MODULES</div>
    <nav>{NAV.map(n=>{const I=n.icon;return <NavLink key={n.to} to={n.to} end={n.end} className={({isActive})=>cn('bureau-nav-item',isActive&&'active')}><span className="nav-code">{n.code}</span><I size={16}/><span>{n.label}</span></NavLink>})}</nav>
    <div className="bureau-rail-bottom"><button className="bureau-nav-item" onClick={()=>setPaletteOpen(true)}><span className="nav-code">⌘</span><CommandIcon size={16}/><span>Command</span></button><button className="bureau-nav-item" onClick={toggle}><span className="nav-code">09</span>{theme==='dark'?<SunIcon size={16}/>:<MoonIcon size={16}/>}<span>{theme==='dark'?'Daylight':'Night shift'}</span></button><NavLink to="/app/settings" className={({isActive})=>cn('bureau-nav-item',isActive&&'active')}><span className="nav-code">10</span><SettingsIcon size={16}/><span>Settings</span></NavLink></div>
    <Dropdown label="Account" items={[{id:'email',label:user?.email??'Signed in',icon:<UserIcon size={14}/>,onSelect:()=>undefined},{id:'signout',label:'Sign out',icon:<LogOutIcon size={14}/>,danger:true,onSelect:()=>{signOut();navigate('/login')}}]} trigger={({toggle})=><button className="bureau-account" onClick={toggle}><span>{initials}</span><div><b>{user?.name??'Operator'}</b><small>ACCOUNT</small></div></button>}/>
   </aside>
   <main className="bureau-app-main"><header className="bureau-app-top"><div><span>SCHEMA BUREAU</span><i>/</i><b>{current?.label??'Workbench'}</b></div><div><span className="status-dot"/> LOCAL-FIRST</div></header><div className="bureau-route-stage" key={location.pathname}><Outlet/></div></main>
   <CommandPalette open={paletteOpen} onClose={()=>setPaletteOpen(false)}/>
 </div>;
}

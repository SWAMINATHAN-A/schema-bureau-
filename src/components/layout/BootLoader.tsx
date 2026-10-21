import React, { useEffect, useState } from 'react';

export function BootLoader({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState('CALIBRATING INTERFACE');
  const [exit, setExit] = useState(false);
  useEffect(() => {
    const phases = ['CALIBRATING INTERFACE','READING RELATIONAL ENGINE','LOADING VISUAL LANGUAGE','OPENING BUREAU'];
    const start = performance.now(); const duration = 1900; let raf=0;
    const tick=(now:number)=>{ const p=Math.min(100,((now-start)/duration)*100); const i=Math.min(3,Math.floor(p/25)); setProgress(Math.round(p)); setPhase(phases[i]); if(p<100) raf=requestAnimationFrame(tick); else { setExit(true); window.setTimeout(onDone, 900); } };
    raf=requestAnimationFrame(tick); return ()=>cancelAnimationFrame(raf);
  },[onDone]);
  return <div className={`bureau-boot ${exit?'is-exiting':''}`} aria-label="Loading Schema Bureau">
    <div className="bureau-boot-grid"/><div className="bureau-boot-noise"/><div className="bureau-boot-scan"/>
    <div className="bureau-boot-corner"><span>SB / 01</span><span>RELATIONAL SYSTEMS LAB</span></div>
    <div className="bureau-boot-core">
      <div className="bureau-boot-top"><span>SCHEMA BUREAU</span><span>BUILD 09.07</span></div>
      <div className="bureau-boot-title"><div className="bureau-boot-mark"><i/><i/><i/><b/></div><div><div>SCHEMA</div><div>BUREAU</div></div></div>
      <div className="bureau-boot-rule"><span style={{width:`${progress}%`}}/></div>
      <div className="bureau-boot-bottom"><span>{phase}</span><strong>{String(progress).padStart(3,'0')}</strong></div>
    </div>
    <div className="bureau-boot-door left"/><div className="bureau-boot-door right"/><div className="bureau-boot-flash"/>
  </div>;
}

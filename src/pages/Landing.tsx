import React, { useEffect, useState } from 'react';
import { ArrowDownRightIcon, ArrowRightIcon, BoxIcon, BracesIcon, DatabaseIcon, GitBranchIcon, Layers3Icon, LockKeyholeIcon, PlayIcon, ScanLineIcon, SparklesIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const stages = [
  ['01', 'WRITE', 'Bring the DDL you already have.'],
  ['02', 'READ', 'The parser extracts tables, keys and constraints.'],
  ['03', 'SEE', 'Switch between modern and Chen notation.'],
  ['04', 'UNDERSTAND', 'Inspect, simulate, export and learn from the model.']
];

export function Landing() {
  const [demo, setDemo] = useState(0);
  useEffect(() => { const id = window.setInterval(() => setDemo(v => (v + 1) % 3), 2400); return () => window.clearInterval(id); }, []);
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.bureau-reveal'));
    const observer = new IntersectionObserver((entries) => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    nodes.forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.bureau-reveal'));
    const io = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); } }), { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    nodes.forEach((node) => io.observe(node));
    return () => io.disconnect();
  }, []);
  return <div className="bureau-site">
    <header className="bureau-nav">
      <Link to="/" className="bureau-logo"><span className="bureau-mark"><i/><i/><i/></span><span><strong>SCHEMA BUREAU</strong><small>RELATIONAL SYSTEMS LAB</small></span></Link>
      <nav><a href="#method">METHOD</a><a href="#notations">NOTATIONS</a><a href="#workbench">WORKBENCH</a></nav>
      <div className="bureau-nav-actions"><Link to="/login" className="bureau-link">SIGN IN</Link><Link to="/signup" className="bureau-button">ENTER LAB <ArrowRightIcon size={14}/></Link></div>
    </header>

    <main>
      <section className="bureau-hero">
        <div className="bureau-hero-grid" />
        <div className="bureau-hero-meta"><span>RELATIONAL SYSTEMS LAB / 09.07</span><span>LOCAL-FIRST / BROWSER-NATIVE</span></div>
        <div className="bureau-hero-copy">
          <p className="bureau-kicker">A VISUAL INSTRUMENT FOR DATABASE STRUCTURE</p>
          <h1>READ THE<br/><em>SHAPE</em> OF<br/>YOUR DATA.</h1>
          <p className="bureau-lead">Turn raw SQL into a system you can actually see. Parse the schema, trace its relationships, compare ER notations, inspect every field and export the result.</p>
          <div className="bureau-hero-actions"><Link to="/signup" className="bureau-button bureau-button-red">BUILD A SCHEMA <ArrowRightIcon size={15}/></Link><a href="#method" className="bureau-text-link">HOW IT WORKS <ArrowDownRightIcon size={14}/></a></div>
        </div>
        <div className="bureau-hero-art" aria-hidden>
          <div className="bureau-art-caption">LIVE MODEL / {['RELATIONAL','CONCEPTUAL','STRUCTURAL'][demo]}</div>
          <div className={`bureau-model model-${demo}`}>
            <div className="bureau-entity e1"><b>STUDENT</b><span>PK&nbsp;&nbsp;student_id</span><span>name</span><span>email</span></div>
            <div className="bureau-relation"><span>ENROLLS</span></div>
            <div className="bureau-entity e2"><b>COURSE</b><span>PK&nbsp;&nbsp;course_id</span><span>title</span><span>credits</span></div>
            <div className="bureau-attribute a1">student_id</div><div className="bureau-attribute a2">course_id</div>
          </div>
          <div className="bureau-art-footer"><span>1 : N</span><span>INTERACTIVE / SELECTABLE</span></div>
        </div>
      </section>

      <section className="bureau-manifesto bureau-reveal" id="method">
        <div className="bureau-side-label">THE METHOD / 01</div>
        <div className="bureau-manifesto-main"><p className="bureau-kicker">NO MAGIC BOX</p><h2>THE DATABASE<br/><span>IS THE SOURCE.</span></h2><p>SCHEMA BUREAU does not invent a schema from a prompt. It reads the SQL you give it, builds one internal model, then renders that model through different lenses. One source. Multiple ways to understand it.</p></div>
        <div className="bureau-facts"><div><strong>DDL</strong><span>CREATE TABLE input</span></div><div><strong>MODEL</strong><span>keys · constraints · relations</span></div><div><strong>VIEW</strong><span>modern · Chen · report</span></div></div>
      </section>

      <section className="bureau-process bureau-reveal">
        {stages.map(([n,title,desc]) => <article key={n}><span className="bureau-stage-no">{n}</span><div><h3>{title}</h3><p>{desc}</p></div><ArrowDownRightIcon size={20}/></article>)}
      </section>

      <section className="bureau-notations bureau-reveal" id="notations">
        <div className="bureau-side-label">TWO LENSES / 02</div>
        <div className="bureau-notation-copy"><p className="bureau-kicker">SAME MODEL / DIFFERENT LANGUAGE</p><h2>MODERN<br/><span>OR CHEN.</span></h2><p>Choose the notation that matches the job. Modern relational diagrams expose tables and fields. Chen diagrams expose the conceptual structure: entities, attributes and relationships.</p><Link to="/signup" className="bureau-text-link">TRY BOTH IN THE LAB <ArrowRightIcon size={14}/></Link></div>
        <div className="bureau-compare">
          <div className="notation-card"><div className="notation-head"><span>01</span><b>MODERN</b><span>RELATIONAL</span></div><div className="modern-mini"><div><b>STUDENT</b><span>PK student_id</span><span>name</span><span>email</span></div><div className="mini-line"/><div><b>DEPARTMENT</b><span>PK department_id</span><span>name</span></div></div></div>
          <div className="notation-card dark"><div className="notation-head"><span>02</span><b>CHEN</b><span>CONCEPTUAL</span></div><div className="chen-mini"><div className="cm-entity">STUDENT</div><div className="cm-rel">ENROLLS</div><div className="cm-entity">COURSE</div><div className="cm-attr ca1">student_id</div><div className="cm-attr ca2">course_id</div></div></div>
        </div>
      </section>

      <section className="bureau-workbench bureau-reveal" id="workbench">
        <div className="bureau-workbench-head"><div><p className="bureau-kicker">INSIDE THE LAB / 03</p><h2>ONE WORKSPACE.<br/><span>NO CLUTTER.</span></h2></div><p>Each tool has a job. Write on the left. See the model in the middle. Inspect the selected object on the right. Everything else lives in its own module.</p></div>
        <div className="bureau-modules">
          {[[DatabaseIcon,'WORKBENCH','Parse, generate, compare and export.'],[GitBranchIcon,'SIMULATION','Walk through relationships step by step.'],[BracesIcon,'FIELD GUIDE','Learn ER concepts without leaving the lab.'],[Layers3Icon,'BLUEPRINTS','Start from curated real-world schemas.'],[ScanLineIcon,'ARCHIVE','Reopen and manage saved work.'],[SparklesIcon,'TELEMETRY','Understand how your schema is shaped.']].map(([Icon,title,desc]) => { const I=Icon as React.ComponentType<{size?:number}>; return <div className="module-card" key={String(title)}><I size={19}/><span>{title as string}</span><p>{desc as string}</p></div>; })}
        </div>
      </section>

      <section className="bureau-local bureau-reveal"><div className="bureau-side-label">PRINCIPLE / 04</div><div><LockKeyholeIcon size={22}/><h2>YOUR SQL<br/><span>STAYS HERE.</span></h2><p>Analysis and saved history are designed around local browser storage. The interface is built to feel like an instrument, not a cloud dashboard asking for your database.</p></div></section>

      <section className="bureau-final bureau-reveal"><div className="bureau-final-top"><span>SCHEMA BUREAU / RELATIONAL SYSTEMS LAB</span><span>END OF BRIEF</span></div><h2>MAKE THE<br/><em>INVISIBLE</em><br/>VISIBLE.</h2><Link to="/signup" className="bureau-button bureau-button-red">ENTER THE LAB <ArrowRightIcon size={15}/></Link><div className="bureau-final-bottom"><span>MODERN ER / CHEN ER / SQL / INSPECTION / LEARNING</span><span>BUILT FOR PEOPLE WHO CARE ABOUT STRUCTURE.</span></div></section>
    </main>
  </div>;
}

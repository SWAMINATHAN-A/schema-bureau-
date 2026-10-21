import React from 'react';
import { ArrowLeftIcon, ArrowRightIcon, DatabaseIcon, GitBranchIcon, ScanLineIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps { title:string; subtitle:string; children:React.ReactNode; footer?:React.ReactNode; }
export function AuthLayout({title,subtitle,children,footer}:AuthLayoutProps){
 return <div className="bureau-auth">
   <section className="bureau-auth-showcase">
    <div className="bureau-auth-nav"><Link to="/" className="bureau-auth-back"><ArrowLeftIcon size={15}/> BACK TO BUREAU</Link><span>ACCESS / 09.07</span></div>
    <div className="bureau-auth-copy"><p className="bureau-kicker">RELATIONAL SYSTEMS LAB</p><h1>STRUCTURE<br/><em>WANTS</em><br/>TO BE SEEN.</h1><p>SCHEMA BUREAU turns database definitions into an inspectable visual language — without asking you to leave the data behind.</p></div>
    <div className="bureau-auth-specs"><div><DatabaseIcon size={16}/><span>PARSE<br/><b>DDL → MODEL</b></span></div><div><GitBranchIcon size={16}/><span>TRACE<br/><b>RELATIONS</b></span></div><div><ScanLineIcon size={16}/><span>COMPARE<br/><b>ER NOTATIONS</b></span></div></div>
    <div className="bureau-auth-visual"><div className="av-entity">STUDENT<span>PK student_id</span><span>name</span><span>email</span></div><div className="av-line"/><div className="av-diamond">ENROLLS</div><div className="av-line"/><div className="av-entity">COURSE<span>PK course_id</span><span>title</span><span>credits</span></div></div>
   </section>
   <section className="bureau-auth-form"><div className="bureau-auth-form-inner"><div className="bureau-auth-mobile-logo"><strong>SCHEMA BUREAU</strong><small>RELATIONAL SYSTEMS LAB</small></div><div className="bureau-auth-heading"><span>ACCESS / {title.toUpperCase()}</span><h2>{title}</h2><p>{subtitle}</p></div><div className="bureau-auth-fields">{children}</div>{footer?<div className="bureau-auth-footer">{footer}</div>:null}<Link to="/" className="bureau-auth-mark"><span>SB</span><span>SCHEMA BUREAU / RELATIONAL SYSTEMS LAB</span><ArrowRightIcon size={13}/></Link></div></section>
 </div>;
}

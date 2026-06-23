import React, { useState } from 'react';

const labelSt = {display:'block',fontSize:10,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:5};
const inpSt   = {width:'100%',padding:'10px 13px',border:'1px solid var(--border)',borderRadius:9,fontSize:13,color:'var(--text-bright)',background:'var(--bg)',outline:'none',boxSizing:'border-box',fontFamily:'var(--font)',transition:'border-color .15s, box-shadow .15s'};
const selSt   = {...inpSt, appearance:'none', cursor:'pointer'};

function FocusInput(props) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      {...props}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{...inpSt, ...(focused ? {borderColor:'var(--accent)', boxShadow:'0 0 0 3px var(--accent-l)'} : {}), ...(props.style||{})}}
    />
  );
}

export default function LoginForm({ users, onLogin, onRegister }) {
  const [regMode,    setRegMode]    = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass,  setLoginPass]  = useState('');
  const [loginErr,   setLoginErr]   = useState('');
  const [regName,    setRegName]    = useState('');
  const [regEmail,   setRegEmail]   = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regProduct, setRegProduct] = useState('CE Pro');

  const doLogin = () => {
    const u = users.find(x => x.email.toLowerCase()===loginEmail.toLowerCase());
    if (!u) { setLoginErr('Account not found. Try john@telecom.com or admin@cellular-expert.com'); return; }
    setLoginErr('');
    onLogin(u);
  };

  const doRegister = () => {
    if (!regName||!regEmail||!regCompany) { setLoginErr('Please fill in all fields.'); return; }
    onRegister({ name:regName, email:regEmail, company:regCompany, product:regProduct });
  };

  return (
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:24,position:'relative',overflow:'hidden'}}>
      {/* decorative background shape */}
      <div style={{position:'absolute',top:'-20%',right:'-10%',width:380,height:380,borderRadius:'50%',background:'radial-gradient(circle, var(--accent-l) 0%, transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:'-25%',left:'-10%',width:320,height:320,borderRadius:'50%',background:'radial-gradient(circle, var(--accent-l) 0%, transparent 70%)',pointerEvents:'none'}}/>

      <div style={{width:'100%',maxWidth:340,position:'relative'}}>
        <div style={{textAlign:'center',marginBottom:26}}>
          <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:48,height:48,borderRadius:14,background:'linear-gradient(135deg, var(--accent), var(--accent2))',marginBottom:14,boxShadow:'0 8px 20px -6px var(--accent)'}}>
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" stroke="#fff" strokeWidth="1.6"/>
              <path d="M7 14 Q14 7 21 14 Q14 21 7 14Z" fill="none" stroke="#fff" strokeWidth="1.6"/>
              <circle cx="14" cy="14" r="2.6" fill="#fff"/>
            </svg>
          </div>
          <div style={{fontFamily:'var(--font-display)',fontSize:19,fontWeight:700,color:'var(--text-bright)',letterSpacing:'.04em',marginBottom:4}}>CELLULAR <span style={{color:'var(--accent)'}}>EXPERT</span></div>
          <div style={{fontSize:12,color:'var(--text-dim)'}}>Support Portal — Sign in to continue</div>
        </div>

        <div style={{display:'flex',marginBottom:18,background:'var(--bg3)',borderRadius:11,padding:3}}>
          {[['login','Sign In'],['register','Register']].map(([id,label]) => (
            <button key={id} onClick={() => { setRegMode(id==='register'); setLoginErr(''); }}
              style={{flex:1,padding:'8px 0',borderRadius:8,background:regMode===(id==='register')?'var(--bg)':'transparent',color:regMode===(id==='register')?'var(--text-bright)':'var(--text-dim)',border:'none',cursor:'pointer',fontSize:12,fontFamily:'var(--font-mono)',letterSpacing:'.06em',fontWeight:regMode===(id==='register')?600:400,transition:'all .2s',boxShadow:regMode===(id==='register')?'var(--shadow)':'none'}}>
              {label}
            </button>
          ))}
        </div>

        {loginErr && (
          <div style={{background:'rgba(220,38,38,.08)',border:'1px solid rgba(220,38,38,.25)',borderRadius:8,padding:'8px 12px',fontSize:11,color:'#ef4444',marginBottom:12}}>
            {loginErr}
          </div>
        )}

        {!regMode ? (
          <>
            <div style={{marginBottom:11}}>
              <label style={labelSt}>Email</label>
              <FocusInput type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doLogin()} placeholder="you@company.com"/>
            </div>
            <div style={{marginBottom:16}}>
              <label style={labelSt}>Password</label>
              <FocusInput type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doLogin()} placeholder="any password in demo"/>
            </div>
            <button onClick={doLogin}
              style={{width:'100%',padding:'11px',background:'linear-gradient(135deg, var(--accent), var(--accent2))',border:'none',borderRadius:9,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'var(--font-mono)',letterSpacing:'.1em',marginBottom:14,boxShadow:'0 6px 16px -6px var(--accent)'}}>
              SIGN IN
            </button>
            <div style={{padding:'11px 13px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,fontSize:10,color:'var(--text-dim)',fontFamily:'var(--font-mono)',lineHeight:1.9}}>
              👤&nbsp; john@telecom.com — Customer<br/>
              🛡&nbsp; admin@cellular-expert.com — Admin
            </div>
          </>
        ) : (
          <>
            <div style={{marginBottom:10}}>
              <label style={labelSt}>Full Name</label>
              <FocusInput type="text" value={regName} onChange={e=>setRegName(e.target.value)} placeholder="Your full name"/>
            </div>
            <div style={{marginBottom:10}}>
              <label style={labelSt}>Work Email</label>
              <FocusInput type="email" value={regEmail} onChange={e=>setRegEmail(e.target.value)} placeholder="you@company.com"/>
            </div>
            <div style={{marginBottom:10}}>
              <label style={labelSt}>Company</label>
              <FocusInput type="text" value={regCompany} onChange={e=>setRegCompany(e.target.value)} placeholder="Your organisation"/>
            </div>
            <div style={{marginBottom:14}}>
              <label style={labelSt}>Product</label>
              <select value={regProduct} onChange={e=>setRegProduct(e.target.value)} style={selSt}>
                {['CE Pro','CE Express','Both','Inventory3D'].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <button onClick={doRegister}
              style={{width:'100%',padding:'11px',background:'linear-gradient(135deg, var(--accent), var(--accent2))',border:'none',borderRadius:9,color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'var(--font-mono)',letterSpacing:'.1em',boxShadow:'0 6px 16px -6px var(--accent)'}}>
              CREATE ACCOUNT
            </button>
          </>
        )}
      </div>
    </div>
  );
}

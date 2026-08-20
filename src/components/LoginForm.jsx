import React, { useState } from 'react';
import ceLogoFull from '../assets/ce-logo-full.png';

const labelSt = {display:'block',fontSize:10,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:5};
const inpSt   = {width:'100%',padding:'10px 13px',border:'1px solid var(--border)',borderRadius:9,fontSize:13,color:'var(--text-bright)',background:'var(--bg)',outline:'none',boxSizing:'border-box',fontFamily:'var(--font)',transition:'border-color .15s, box-shadow .15s'};
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

const Logo = () => (
  <div style={{textAlign:'center',marginBottom:26}}>
    <img
      src={ceLogoFull}
      alt="Cellular Expert"
      style={{height:54,objectFit:'contain',marginBottom:10,display:'inline-block'}}
    />
    <div style={{fontSize:12,color:'var(--text-dim)'}}>Support Portal — Sign in to continue</div>
  </div>
);

const ErrorBox = ({ msg }) => msg ? (
  <div style={{background:'rgba(220,38,38,.08)',border:'1px solid rgba(220,38,38,.25)',borderRadius:8,padding:'8px 12px',fontSize:11,color:'#ef4444',marginBottom:12}}>
    {msg}
  </div>
) : null;

const InfoBox = ({ msg }) => msg ? (
  <div style={{background:'var(--accent-l)',border:'1px solid var(--accent)',borderRadius:8,padding:'8px 12px',fontSize:11,color:'var(--text)',marginBottom:12}}>
    {msg}
  </div>
) : null;

const PrimaryButton = ({ onClick, busy, children }) => (
  <button onClick={onClick} disabled={busy}
    style={{width:'100%',padding:'11px',background:'linear-gradient(135deg, var(--accent), var(--accent2))',border:'none',borderRadius:9,color:'#fff',fontSize:12,fontWeight:700,cursor:busy?'default':'pointer',opacity:busy?0.7:1,fontFamily:'var(--font-mono)',letterSpacing:'.1em',marginBottom:10,boxShadow:'0 6px 16px -6px var(--accent)'}}>
    {children}
  </button>
);

const LinkButton = ({ onClick, children }) => (
  <button onClick={onClick} style={{background:'none',border:'none',color:'var(--accent)',fontSize:11,cursor:'pointer',textAlign:'center',width:'100%',padding:'6px 0'}}>
    {children}
  </button>
);

// All the on* props must return a Promise resolving to { ok: true } or { ok: false, error: 'message' }.
export default function LoginForm({ onLogin, onSendRegisterCode, onVerifyRegisterCode, onSendResetCode, onVerifyResetCode }) {
  // mode: 'login' | 'register' | 'register-verify' | 'forgot' | 'forgot-verify'
  const [mode,  setMode]  = useState('login');
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState('');
  const [info,  setInfo]  = useState('');

  // Sign in
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass,  setLoginPass]  = useState('');

  // Register
  const [regName,    setRegName]    = useState('');
  const [regEmail,   setRegEmail]   = useState('');
  const [regPass,    setRegPass]    = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regCode,    setRegCode]    = useState('');

  // Forgot password
  const [fpEmail,    setFpEmail]    = useState('');
  const [fpCode,     setFpCode]     = useState('');
  const [fpNewPass,  setFpNewPass]  = useState('');

  const goTo = (m) => { setMode(m); setError(''); setInfo(''); };

  const doLogin = async () => {
    if (busy) return;
    if (!loginEmail || !loginPass) { setError('Please enter your email and password.'); return; }
    setError(''); setBusy(true);
    const result = await onLogin(loginEmail.trim(), loginPass);
    setBusy(false);
    if (!result.ok) setError(result.error || 'Sign in failed.');
  };

  const doSendRegisterCode = async () => {
    if (busy) return;
    if (!regName || !regEmail || !regPass || !regCompany) { setError('Please fill in all fields.'); return; }
    if (regPass.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError(''); setBusy(true);
    const result = await onSendRegisterCode({ name:regName, email:regEmail.trim(), password:regPass, company:regCompany });
    setBusy(false);
    if (!result.ok) { setError(result.error || 'Could not send verification code.'); return; }
    setInfo(`We sent a 6-digit code to ${regEmail.trim()}. Enter it below to finish creating your account.`);
    goTo('register-verify');
  };

  const doVerifyRegisterCode = async () => {
    if (busy) return;
    if (!regCode.trim()) { setError('Please enter the code from your email.'); return; }
    setError(''); setBusy(true);
    const result = await onVerifyRegisterCode(regEmail.trim(), regCode.trim());
    setBusy(false);
    if (!result.ok) setError(result.error || 'Verification failed.');
  };

  const doSendResetCode = async () => {
    if (busy) return;
    if (!fpEmail) { setError('Please enter your email.'); return; }
    setError(''); setBusy(true);
    const result = await onSendResetCode(fpEmail.trim());
    setBusy(false);
    if (!result.ok) { setError(result.error || 'Could not send reset code.'); return; }
    setInfo(`We sent a 6-digit code to ${fpEmail.trim()}. Enter it below along with your new password.`);
    goTo('forgot-verify');
  };

  const doVerifyResetCode = async () => {
    if (busy) return;
    if (!fpCode.trim()) { setError('Please enter the code from your email.'); return; }
    if (!fpNewPass || fpNewPass.length < 6) { setError('New password must be at least 6 characters.'); return; }
    setError(''); setBusy(true);
    const result = await onVerifyResetCode(fpEmail.trim(), fpCode.trim(), fpNewPass);
    setBusy(false);
    if (!result.ok) { setError(result.error || 'Reset failed.'); return; }
    setInfo('Password reset successfully. You can now sign in with your new password.');
    setLoginEmail(fpEmail.trim());
    setLoginPass('');
    setFpEmail(''); setFpCode(''); setFpNewPass('');
    goTo('login');
  };

  return (
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:24,position:'relative',overflow:'hidden'}}>
      <div style={{position:'absolute',top:'-20%',right:'-10%',width:380,height:380,borderRadius:'50%',background:'radial-gradient(circle, var(--accent-l) 0%, transparent 70%)',pointerEvents:'none'}}/>
      <div style={{position:'absolute',bottom:'-25%',left:'-10%',width:320,height:320,borderRadius:'50%',background:'radial-gradient(circle, var(--accent-l) 0%, transparent 70%)',pointerEvents:'none'}}/>

      <div style={{width:'100%',maxWidth:340,position:'relative'}}>
        <Logo/>

        {(mode==='login' || mode==='register') && (
          <div style={{display:'flex',marginBottom:18,background:'var(--bg3)',borderRadius:11,padding:3}}>
            {[['login','Sign In'],['register','Register']].map(([id,label]) => (
              <button key={id} onClick={() => goTo(id)}
                style={{flex:1,padding:'8px 0',borderRadius:8,background:mode===id?'var(--bg)':'transparent',color:mode===id?'var(--text-bright)':'var(--text-dim)',border:'none',cursor:'pointer',fontSize:12,fontFamily:'var(--font-mono)',letterSpacing:'.06em',fontWeight:mode===id?600:400,transition:'all .2s',boxShadow:mode===id?'var(--shadow)':'none'}}>
                {label}
              </button>
            ))}
          </div>
        )}

        <ErrorBox msg={error}/>
        <InfoBox msg={info}/>

        {mode === 'login' && (
          <>
            <div style={{marginBottom:11}}>
              <label style={labelSt}>Email</label>
              <FocusInput type="email" value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doLogin()} placeholder="you@company.com"/>
            </div>
            <div style={{marginBottom:8}}>
              <label style={labelSt}>Password</label>
              <FocusInput type="password" value={loginPass} onChange={e=>setLoginPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doLogin()} placeholder="Your password"/>
            </div>
            <div style={{textAlign:'right',marginBottom:14}}>
              <button onClick={() => goTo('forgot')} style={{background:'none',border:'none',color:'var(--text-dim)',fontSize:11,cursor:'pointer'}}>Forgot password?</button>
            </div>
            <PrimaryButton onClick={doLogin} busy={busy}>{busy ? 'SIGNING IN…' : 'SIGN IN'}</PrimaryButton>
          </>
        )}

        {mode === 'register' && (
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
              <label style={labelSt}>Password</label>
              <FocusInput type="password" value={regPass} onChange={e=>setRegPass(e.target.value)} placeholder="At least 6 characters"/>
            </div>
            <div style={{marginBottom:10}}>
              <label style={labelSt}>Company</label>
              <FocusInput type="text" value={regCompany} onChange={e=>setRegCompany(e.target.value)} placeholder="Your organisation"/>
            </div>
            <PrimaryButton onClick={doSendRegisterCode} busy={busy}>{busy ? 'SENDING CODE…' : 'SEND VERIFICATION CODE'}</PrimaryButton>
          </>
        )}

        {mode === 'register-verify' && (
          <>
            <div style={{marginBottom:14}}>
              <label style={labelSt}>Verification Code</label>
              <FocusInput type="text" value={regCode} onChange={e=>setRegCode(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doVerifyRegisterCode()}
                placeholder="6-digit code" maxLength={6}
                style={{textAlign:'center',fontSize:20,letterSpacing:'8px',fontFamily:'var(--font-mono)'}}/>
            </div>
            <PrimaryButton onClick={doVerifyRegisterCode} busy={busy}>{busy ? 'VERIFYING…' : 'VERIFY & CREATE ACCOUNT'}</PrimaryButton>
            <LinkButton onClick={() => goTo('register')}>← Back to registration form</LinkButton>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <div style={{fontSize:12,color:'var(--text-dim)',marginBottom:14,lineHeight:1.6}}>
              Enter your account email — we'll send you a 6-digit code to reset your password.
            </div>
            <div style={{marginBottom:14}}>
              <label style={labelSt}>Email</label>
              <FocusInput type="email" value={fpEmail} onChange={e=>setFpEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doSendResetCode()} placeholder="you@company.com"/>
            </div>
            <PrimaryButton onClick={doSendResetCode} busy={busy}>{busy ? 'SENDING CODE…' : 'SEND RESET CODE'}</PrimaryButton>
            <LinkButton onClick={() => goTo('login')}>← Back to sign in</LinkButton>
          </>
        )}

        {mode === 'forgot-verify' && (
          <>
            <div style={{marginBottom:12}}>
              <label style={labelSt}>Verification Code</label>
              <FocusInput type="text" value={fpCode} onChange={e=>setFpCode(e.target.value)}
                placeholder="6-digit code" maxLength={6}
                style={{textAlign:'center',fontSize:20,letterSpacing:'8px',fontFamily:'var(--font-mono)'}}/>
            </div>
            <div style={{marginBottom:14}}>
              <label style={labelSt}>New Password</label>
              <FocusInput type="password" value={fpNewPass} onChange={e=>setFpNewPass(e.target.value)} onKeyDown={e=>e.key==='Enter'&&doVerifyResetCode()} placeholder="At least 6 characters"/>
            </div>
            <PrimaryButton onClick={doVerifyResetCode} busy={busy}>{busy ? 'RESETTING…' : 'RESET PASSWORD'}</PrimaryButton>
            <LinkButton onClick={() => goTo('forgot')}>← Back</LinkButton>
          </>
        )}
      </div>
    </div>
  );
}

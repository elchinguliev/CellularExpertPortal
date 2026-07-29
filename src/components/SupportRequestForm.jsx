import React, { useState } from 'react';
import { StableInput, StableTextarea } from './StableInput';

const labelSt = {display:'block',fontSize:10,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:'.12em',textTransform:'uppercase',marginBottom:5};
const inpSt   = {width:'100%',padding:'9px 12px',border:'1px solid var(--border)',borderRadius:8,fontSize:12,color:'var(--text-bright)',background:'var(--bg2)',outline:'none',boxSizing:'border-box'};

export default function SupportRequestForm({ API_BASE, currentUser, prefillDescription, onClose, onSubmitted }) {
  const [step, setStep] = useState('form'); // 'form' | 'code' | 'done'
  const [email, setEmail] = useState(currentUser?.email || '');
  const [company, setCompany] = useState(currentUser?.company || '');
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [product, setProduct] = useState(currentUser?.product || 'CE Express');
  const [description, setDescription] = useState(prefillDescription || '');
  const [screenshots, setScreenshots] = useState([]);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pickScreenshots = (files) => {
    const list = Array.from(files || []).slice(0, 5);
    for (const f of list) {
      if (!f.type.startsWith('image/')) { setError('Only image files are allowed.'); return; }
      if (f.size > 8 * 1024 * 1024) { setError('Each screenshot must be under 8MB.'); return; }
    }
    setError('');
    setScreenshots(list);
  };

  const removeScreenshot = (index) => {
    setScreenshots((prev) => prev.filter((_, i) => i !== index));
  };

  // Catches the most common typo pattern: getting the provider name right
  // but the domain ending wrong (gmail.co, gmail.cm, gmail.con, yahoo.co,
  // mail.ru misspelled, etc.) — checked against the actual, correct domain
  // for each well-known free-mail provider.
  const KNOWN_PROVIDERS = {
    gmail: 'gmail.com',
    googlemail: 'googlemail.com',
    yahoo: 'yahoo.com',
    outlook: 'outlook.com',
    hotmail: 'hotmail.com',
    icloud: 'icloud.com',
    mail: 'mail.ru',
    yandex: 'yandex.ru',
    protonmail: 'protonmail.com',
    aol: 'aol.com',
  };

  const validateEmail = (value) => {
    const trimmed = value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      return 'Please enter a valid email address.';
    }
    const domain = trimmed.split('@')[1].toLowerCase();
    const providerName = domain.split('.')[0];
    const correctDomain = KNOWN_PROVIDERS[providerName];
    if (correctDomain && domain !== correctDomain) {
      return `Did you mean "${providerName}@${correctDomain.split('.').slice(-2).join('.')}"? "${domain}" isn't a real ${providerName} domain.`;
    }
    return '';
  };

  const sendCode = async () => {
    if (!email || !fullName || !description) { setError('Email, full name, and description are required.'); return; }
    const emailError = validateEmail(email);
    if (emailError) { setError(emailError); return; }
    setBusy(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/support/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Could not send the code.'); setBusy(false); return; }
      setStep('code');
    } catch {
      setError('Could not reach the backend.');
    }
    setBusy(false);
  };

  const submitRequest = async () => {
    if (!code) { setError('Please enter the verification code.'); return; }
    setBusy(true); setError('');
    try {
      const fd = new FormData();
      fd.append('email', email);
      fd.append('code', code);
      fd.append('company', company);
      fd.append('fullName', fullName);
      fd.append('product', product);
      fd.append('description', description);
      screenshots.forEach(f => fd.append('screenshots', f));

      const res = await fetch(`${API_BASE}/support/submit`, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Could not submit the request.'); setBusy(false); return; }
      setStep('done');
      onSubmitted && onSubmitted();
    } catch {
      setError('Could not reach the backend.');
    }
    setBusy(false);
  };

  if (step === 'done') {
    return (
      <div style={{padding:16,textAlign:'center'}}>
        <div style={{fontSize:28,marginBottom:8}}>✅</div>
        <div style={{fontSize:13,fontWeight:600,color:'var(--text-bright)',marginBottom:6}}>Support request sent</div>
        <div style={{fontSize:12,color:'var(--text-dim)',marginBottom:14}}>
          Our support team will get back to you at <strong>{email}</strong> soon.
        </div>
        <button onClick={onClose} style={{padding:'8px 16px',borderRadius:8,border:'none',background:'var(--accent)',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}}>Close</button>
      </div>
    );
  }

  return (
    <div style={{padding:16}}>
      <div style={{fontSize:13,fontWeight:700,color:'var(--text-bright)',marginBottom:12}}>
        {step === 'form' ? 'Contact Support' : 'Verify Your Email'}
      </div>

      {error && <div style={{background:'#dc262614',border:'1px solid #dc262640',color:'#dc2626',fontSize:11,padding:'8px 11px',borderRadius:8,marginBottom:10}}>{error}</div>}

      {step === 'form' && (
        <>
          <div style={{marginBottom:10}}>
            <label style={labelSt}>Email</label>
            <StableInput value={email} onChange={setEmail} style={inpSt} placeholder="you@company.com" />
          </div>
          <div style={{marginBottom:10}}>
            <label style={labelSt}>Company</label>
            <StableInput value={company} onChange={setCompany} style={inpSt} placeholder="Your company" />
          </div>
          <div style={{marginBottom:10}}>
            <label style={labelSt}>Full Name</label>
            <StableInput value={fullName} onChange={setFullName} style={inpSt} placeholder="Your name" />
          </div>
          <div style={{marginBottom:10}}>
            <label style={labelSt}>Product</label>
            <select value={product} onChange={e => setProduct(e.target.value)} style={{...inpSt, cursor:'pointer'}}>
              {['CE Express','CE Pro','Inventory3D','Geodata'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div style={{marginBottom:10}}>
            <label style={labelSt}>Question / Description</label>
            <StableTextarea rows={5} value={description} onChange={setDescription} style={{...inpSt, resize:'vertical', lineHeight:1.5}} placeholder="Describe your issue in detail..." />
          </div>
          <div style={{marginBottom:14}}>
            <label style={labelSt}>Screenshots (optional, up to 5)</label>
            <input type="file" accept="image/*" multiple onChange={e => pickScreenshots(e.target.files)}
              style={{fontSize:11,color:'var(--text-dim)'}} />
            {screenshots.length > 0 && (
              <div style={{marginTop:6,display:'flex',flexDirection:'column',gap:4}}>
                {screenshots.map((f, i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,padding:'5px 9px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:6,fontSize:10.5,color:'var(--text-dim)'}}>
                    <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{f.name}</span>
                    <button type="button" onClick={() => removeScreenshot(i)}
                      style={{flexShrink:0,width:18,height:18,borderRadius:'50%',border:'none',background:'#dc262620',color:'#dc2626',fontSize:11,lineHeight:'18px',cursor:'pointer',padding:0}}
                      title="Remove">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={sendCode} disabled={busy} style={{padding:'8px 16px',borderRadius:8,border:'none',background:'var(--accent)',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}}>
              {busy ? 'Sending...' : 'Send Verification Code'}
            </button>
            <button onClick={onClose} style={{padding:'8px 16px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:'var(--text)',fontSize:12,cursor:'pointer'}}>Cancel</button>
          </div>
        </>
      )}

      {step === 'code' && (
        <>
          <div style={{fontSize:12,color:'var(--text-dim)',marginBottom:12}}>
            We sent a 6-digit code to <strong style={{color:'var(--text-bright)'}}>{email}</strong>. Enter it below to send your request.
          </div>
          <div style={{marginBottom:14}}>
            <label style={labelSt}>Verification Code</label>
            <StableInput value={code} onChange={setCode} style={{...inpSt, letterSpacing:'.3em', textAlign:'center', fontSize:16}} placeholder="000000" maxLength={6} />
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={submitRequest} disabled={busy} style={{padding:'8px 16px',borderRadius:8,border:'none',background:'var(--accent)',color:'#fff',fontSize:12,fontWeight:600,cursor:'pointer'}}>
              {busy ? 'Submitting...' : 'Submit Request'}
            </button>
            <button onClick={() => setStep('form')} style={{padding:'8px 16px',borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:'var(--text)',fontSize:12,cursor:'pointer'}}>Back</button>
          </div>
        </>
      )}
    </div>
  );
}

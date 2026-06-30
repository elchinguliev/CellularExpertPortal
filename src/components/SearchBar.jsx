import React, { useState, useRef, useEffect } from 'react';
import { searchIndex } from '../useGithubDocs';

const SUPPORT_EMAIL = 'support@cellular-expert.com';
const PC = {'CE Express':'#0077cc','CE Pro':'#059669','Both':'#d97706','Training':'#7c3aed','Inventory3D':'#0ea5e9'};

export default function SearchBar({ onSelectDoc }) {
  const [q,        setQ]        = useState('');
  const [results,  setResults]  = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (q.trim().length > 1) {
      setResults(searchIndex(q));
      setShowDrop(true);
    } else {
      setResults([]);
      setShowDrop(false);
    }
  }, [q]);

  // Re-run search periodically while open, so results improve as background
  // preload finishes filling the content cache (cheap, no-op once stable)
  useEffect(() => {
    if (!showDrop || q.trim().length <= 1) return;
    const t = setInterval(() => setResults(searchIndex(q)), 800);
    return () => clearInterval(t);
  }, [showDrop, q]);

  useEffect(() => {
    const h = (e) => { if (!wrapRef.current?.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={wrapRef} style={{width:'100%', position:'relative'}}>
      <span style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--text-dim)',fontSize:14,pointerEvents:'none'}}>🔍</span>
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        onFocus={() => q.trim().length > 1 && setShowDrop(true)}
        onKeyDown={e => e.key==='Escape' && setShowDrop(false)}
        placeholder="Search all documentation…"
        style={{width:'100%',padding:'8px 12px 8px 33px',border:'1px solid var(--border)',borderRadius:8,fontSize:13,outline:'none',background:'var(--bg2)',color:'var(--text-bright)',fontFamily:'var(--font)'}}
      />
      {showDrop && (
        <div style={{position:'absolute',top:'100%',left:0,right:0,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,marginTop:6,boxShadow:'var(--shadow-lg)',zIndex:500,maxHeight:420,overflowY:'auto'}}>
          {results.length > 0 ? results.map(d => (
            <div key={d.id}
              onClick={() => { onSelectDoc(d.id); setQ(''); setShowDrop(false); }}
              style={{padding:'11px 14px',cursor:'pointer',borderBottom:'1px solid var(--border)',transition:'background .1s'}}
              onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                <span style={{fontSize:13.5,fontWeight:600,color:'var(--text-bright)'}}>{d.title}</span>
                <span style={{fontSize:9,fontWeight:600,color:PC[d.product]||'var(--text-dim)',background:`${PC[d.product]||'#888'}18`,border:`1px solid ${PC[d.product]||'#888'}40`,padding:'1px 6px',borderRadius:10,fontFamily:'var(--font-mono)'}}>{d.product}</span>
              </div>
              <div style={{fontSize:11,color:'var(--text-dim)',marginBottom:d.snippet?4:0}}>{d.category}</div>
              {d.snippet && (
                <div style={{fontSize:11.5,color:'var(--text)',lineHeight:1.5,fontStyle:'italic'}}>{d.snippet}</div>
              )}
            </div>
          )) : (
            <div style={{padding:16,textAlign:'center',fontSize:13,color:'var(--text-dim)'}}>
              No results — <a href={`mailto:${SUPPORT_EMAIL}`} style={{color:'var(--accent)'}}>contact support</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

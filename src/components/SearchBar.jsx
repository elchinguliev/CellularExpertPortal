import React, { useState, useRef, useEffect } from 'react';
import { searchIndex } from '../useGithubDocs';

const SUPPORT_EMAIL = 'support@cellular-expert.com';

export default function SearchBar({ onSelectDoc }) {
  const [q,          setQ]          = useState('');
  const [results,    setResults]    = useState([]);
  const [showDrop,   setShowDrop]   = useState(false);
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

  useEffect(() => {
    const h = (e) => { if (!wrapRef.current?.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={wrapRef} style={{flex:1, maxWidth:420, position:'relative'}}>
      <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:'var(--text-dim)',fontSize:14,pointerEvents:'none'}}>🔍</span>
      <input
        value={q}
        onChange={e => setQ(e.target.value)}
        onFocus={() => q.trim().length > 1 && setShowDrop(true)}
        onKeyDown={e => e.key==='Escape' && setShowDrop(false)}
        placeholder="Search documentation…"
        style={{width:'100%',padding:'7px 11px 7px 32px',border:'1px solid var(--border)',borderRadius:7,fontSize:13,outline:'none',background:'var(--bg)',color:'var(--text)',fontFamily:'var(--font)'}}
      />
      {showDrop && (
        <div style={{position:'absolute',top:'100%',left:0,right:0,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,marginTop:4,boxShadow:'var(--shadow-lg)',zIndex:500,maxHeight:340,overflowY:'auto'}}>
          {results.length > 0 ? results.map(d => (
            <div key={d.id}
              onClick={() => { onSelectDoc(d.id); setQ(''); setShowDrop(false); }}
              style={{padding:'9px 13px',cursor:'pointer',borderBottom:'1px solid var(--bg3)',transition:'background .1s'}}
              onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <div style={{fontSize:13,fontWeight:500,color:'var(--text-bright)',marginBottom:2}}>{d.title}</div>
              <div style={{fontSize:11,color:'var(--text-dim)'}}>{d.product} · {d.category}</div>
            </div>
          )) : (
            <div style={{padding:14,textAlign:'center',fontSize:13,color:'var(--text-dim)'}}>
              No results — <a href={`mailto:${SUPPORT_EMAIL}`} style={{color:'var(--accent)'}}>contact support</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

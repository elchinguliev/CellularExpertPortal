import React, { useState, useRef, useEffect } from 'react';
import { searchIndex, searchAPI } from '../useGithubDocs';

const PC = {'CE Express':'#0077cc','CE Pro':'#059669','Both':'#d97706','Training':'#7c3aed','Inventory3D':'#0ea5e9'};
function cleanSearchSnippet(text = '') {
  return String(text)
    // remove markdown images, usually noisy in search previews
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    // convert markdown links to only visible label
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // convert raw html links to only visible label
    .replace(/<a\s+[^>]*>(.*?)<\/a>/gi, '$1')
    // remove remaining html tags
    .replace(/<[^>]+>/g, ' ')
    // remove markdown heading/list/table symbols
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/\|/g, ' ')
    // remove markdown emphasis/code markers
    .replace(/[*_`~]/g, '')
    // remove image/file noise
    .replace(/\b[\w-]+\.(png|jpg|jpeg|gif|svg)\b/gi, ' ')
    .replace(/\bguide-v[\w.%/-]+\b/gi, ' ')
    // remove leftover image-url / markdown punctuation noise
    .replace(/%[0-9a-f]{2}/gi, ' ')
    .replace(/^[\s%()[\]{}.,;:+\-–—]+/g, '')
    .replace(/\s+[%()[\]{}.,;:+\-–—]+\s+/g, ' ')
    // normalize spaces
    .replace(/\s+/g, ' ')
    .trim();
}

export default function SearchBar({ onSelectDoc, onSupportClick }) {
  const [q,        setQ]        = useState('');
  const [results,  setResults]  = useState([]);
  const [showDrop, setShowDrop] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const query = q.trim();
    if (query.length <= 1) {
      setResults([]);
      setShowDrop(false);
      return;
    }
    setShowDrop(true);
    // Show instant local results immediately...
    setResults(searchIndex(q));
    // ...then replace with real backend full-text results when they arrive —
    // but only for queries long enough for full-text search to be meaningful.
    // Short queries (like "tr") are better served by the local title/category
    // matching above; Postgres full-text search on a 2-3 letter token tends
    // to surface odd, loosely-related results that would otherwise stomp on
    // the more relevant local ranking.
    if (query.length < 4) return;
    let cancelled = false;
    const localResults = searchIndex(q);
    searchAPI(q).then(apiResults => {
      if (cancelled || apiResults.length === 0) return;
      // The backend only knows about whole documents, not headings — carry
      // over any heading-level match we already found locally so clicking
      // a result still jumps straight to the right section.
      const merged = apiResults.map(r => {
        const local = localResults.find(l => l.id === r.id);
        return local?.matchedHeadingId
          ? { ...r, matchedHeadingId: local.matchedHeadingId, matchedHeadingText: local.matchedHeadingText }
          : r;
      });
      setResults(merged);
    });
    return () => { cancelled = true; };
  }, [q]);

  useEffect(() => {
    const h = (e) => { if (!wrapRef.current?.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={wrapRef} style={{width:'100%', position:'relative'}}>
      <span style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',pointerEvents:'none',display:'flex'}}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-dim)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </span>
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
              onClick={() => { onSelectDoc(d.id, d.matchedHeadingId); setQ(''); setShowDrop(false); }}
              style={{padding:'11px 14px',cursor:'pointer',borderBottom:'1px solid var(--border)',transition:'background .1s'}}
              onMouseEnter={e => e.currentTarget.style.background='var(--bg3)'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                <span style={{fontSize:13.5,fontWeight:600,color:'var(--text-bright)'}}>{d.title}</span>
                <span style={{fontSize:9,fontWeight:600,color:PC[d.product]||'var(--text-dim)',background:`${PC[d.product]||'#888'}18`,border:`1px solid ${PC[d.product]||'#888'}40`,padding:'1px 6px',borderRadius:10,fontFamily:'var(--font-mono)'}}>{d.product}</span>
              </div>
              <div style={{fontSize:11,color:'var(--text-dim)',marginBottom:(d.snippet||d.matchedHeadingText)?4:0}}>{d.category}</div>
              {d.matchedHeadingText && (
                <div style={{fontSize:11,color:'var(--accent)',fontWeight:600,marginBottom:d.snippet?4:0}}>→ {d.matchedHeadingText}</div>
              )}
              {cleanSearchSnippet(d.snippet) && (
                <div style={{fontSize:11.5,color:'var(--text)',lineHeight:1.5,fontStyle:'italic'}}>{cleanSearchSnippet(d.snippet)}</div>
              )}
            </div>
          )) : (
            <div style={{padding:16,textAlign:'center',fontSize:13,color:'var(--text-dim)'}}>
              No results —{' '}
              <span
                onClick={() => { onSupportClick && onSupportClick(); setQ(''); setShowDrop(false); }}
                style={{color:'var(--accent)',cursor:'pointer',fontWeight:600}}
              >
                ask the AI assistant
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
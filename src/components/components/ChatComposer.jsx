import React, { useState } from 'react';

export default function ChatComposer({ onSend }) {
  const [text, setText] = useState('');
  const send = () => { if (!text.trim()) return; onSend(text.trim()); setText(''); };
  return (
    <div style={{padding:'10px 12px',borderTop:'1px solid var(--border)',background:'var(--bg2)',flexShrink:0}}>
      <div style={{display:'flex',gap:8,alignItems:'flex-end'}}>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Type your question… (Enter to send)"
          rows={1}
          style={{flex:1,padding:'9px 12px',border:'1px solid var(--border2)',borderRadius:10,fontSize:12,color:'var(--text-bright)',background:'var(--bg)',outline:'none',resize:'none',minHeight:38,maxHeight:90,fontFamily:'var(--font)',lineHeight:1.5}}
        />
        <button onClick={send} disabled={!text.trim()}
          style={{width:36,height:36,borderRadius:10,flexShrink:0,
            background:text.trim() ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'var(--bg3)',
            border:'none',color:text.trim()?'#fff':'var(--text-dim)',cursor:text.trim()?'pointer':'default',
            display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s'}}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text-dim)',textAlign:'right',marginTop:4,letterSpacing:'.06em'}}>SHIFT+ENTER for new line</div>
    </div>
  );
}

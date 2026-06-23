import React, { useState } from 'react';

export default function ReplyBox({ onSend }) {
  const [text, setText] = useState('');
  const send = () => { if (!text.trim()) return; onSend(text.trim()); setText(''); };
  return (
    <div style={{display:'flex',gap:7,marginTop:6}}>
      <input
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key==='Enter' && send()}
        placeholder="Add a reply…"
        style={{flex:1,padding:'8px 11px',border:'1px solid var(--border)',borderRadius:8,fontSize:12,color:'var(--text-bright)',background:'var(--bg2)',outline:'none'}}
      />
      <button onClick={send} style={{padding:'8px 15px',background:'var(--accent)',border:'none',borderRadius:8,color:'#fff',fontSize:11,cursor:'pointer',fontWeight:600}}>Send</button>
    </div>
  );
}

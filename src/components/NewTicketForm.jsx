import React, { useState } from 'react';

const labelSt = {display:'block',fontSize:10,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:4};
const inpSt   = {width:'100%',padding:'9px 12px',border:'1px solid var(--border)',borderRadius:8,fontSize:13,color:'var(--text-bright)',background:'var(--bg)',outline:'none',boxSizing:'border-box',fontFamily:'var(--font)'};
const selSt   = {...inpSt, appearance:'none', cursor:'pointer'};

export default function NewTicketForm({ onSubmit, onCancel, draft }) {
  const [title, setTitle] = useState(draft?.ticket_title || '');
  const [prod, setProd] = useState(draft?.product || 'CE Pro');
  const [version, setVersion] = useState(draft?.version || '');
  const [cat, setCat] = useState(draft?.issue_type || 'Question');
  const [pri, setPri] = useState(draft?.priority_suggestion === 'Medium' ? 'Normal' : (draft?.priority_suggestion || 'Normal'));
  const [user, setUser] = useState(draft?.user || '');
  const [ticketTime, setTicketTime] = useState(draft?.time || '');

  const defaultDescription = draft
    ? `User question:\n${draft.full_question}\n\nRetrieved documents:\n${(draft.retrieved_documents || []).map(d => `- ${d.product} ${d.version} | ${d.document} → ${d.section}`).join('\n')}\n\nConversation context:\n${(draft.conversation_context || []).map(c => `${c.role}: ${c.message}`).join('\n')}`
    : '';

  const [desc, setDesc] = useState(defaultDescription);

  const submit = () => {
    if (!title || !desc) return;
    onSubmit({
      title,
      product: prod,
      version,
      category: cat,
      priority: pri,
      user,
      time: ticketTime,
      description: desc
    });
  };

  return (
    <div style={{background:'var(--bg2)',border:'1px solid var(--border2)',borderRadius:12,padding:16,marginBottom:12,boxShadow:'var(--shadow)'}}>
      <div style={{fontWeight:700,color:'var(--text-bright)',fontSize:13,marginBottom:12,display:'flex',alignItems:'center',gap:7}}>
        <span style={{fontSize:15}}>✦</span> New Support Ticket
      </div>

      {draft && (
        <div style={{marginBottom:12,padding:10,border:'1px solid var(--accent)',borderRadius:9,background:'var(--accent-l)',fontSize:11,color:'var(--text)'}}>
          AI prepared this ticket draft. Please review and edit before submitting.
        </div>
      )}

      <div style={{marginBottom:10}}>
        <label style={labelSt}>Subject</label>
        <input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Brief description of your issue" style={inpSt}/>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:9,marginBottom:10}}>
        <div>
          <label style={labelSt}>Product</label>
          <select value={prod} onChange={e=>setProd(e.target.value)} style={selSt}>
            {['CE Pro','CE Express','Inventory3D','Both'].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>

        <div>
          <label style={labelSt}>Version</label>
          <input type="text" value={version} onChange={e=>setVersion(e.target.value)} placeholder="e.g. 7.3" style={inpSt}/>
        </div>

        <div>
          <label style={labelSt}>Issue Type</label>
          <input type="text" value={cat} onChange={e=>setCat(e.target.value)} placeholder="Issue type" style={inpSt}/>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:9,marginBottom:10}}>
        <div>
          <label style={labelSt}>Priority</label>
          <select value={pri} onChange={e=>setPri(e.target.value)} style={selSt}>
            {['Low','Normal','High','Critical'].map(o=><option key={o}>{o}</option>)}
          </select>
        </div>

        <div>
          <label style={labelSt}>User</label>
          <input type="text" value={user} onChange={e=>setUser(e.target.value)} style={inpSt}/>
        </div>

        <div>
          <label style={labelSt}>Time</label>
          <input type="text" value={ticketTime} onChange={e=>setTicketTime(e.target.value)} style={inpSt}/>
        </div>
      </div>

      <div style={{marginBottom:12}}>
        <label style={labelSt}>Description</label>
        <textarea
          value={desc}
          onChange={e=>setDesc(e.target.value)}
          placeholder="Describe your issue in detail…"
          style={{...inpSt, resize:'vertical', minHeight:120, lineHeight:1.5}}
        />
      </div>

      <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
        <button onClick={onCancel} style={{padding:'7px 14px',background:'transparent',border:'1px solid var(--border)',borderRadius:7,color:'var(--text-dim)',fontSize:11,cursor:'pointer'}}>Cancel</button>
        <button onClick={submit} style={{padding:'7px 16px',background:'var(--accent)',border:'none',borderRadius:7,color:'#fff',fontSize:11,cursor:'pointer',fontWeight:600}}>Submit Ticket</button>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useRef } from 'react';
import { KB, findAnswer, SUGGESTED, SEED_TICKETS, AGENTS, SUPPORT_EMAIL } from '../supportData';
import { API_BASE } from '../useGithubDocs';import LoginForm from './LoginForm';
import NewTicketForm from './NewTicketForm';
import ReplyBox from './ReplyBox';
import ChatComposer from './ChatComposer';

const SC   = {'Open':'#d97706','In Progress':'var(--accent)','Resolved':'var(--accent2)','Closed':'#6b7280'};
const PRIC = {'Critical':'#dc2626','High':'#d97706','Normal':'var(--accent)','Low':'#6b7280'};
const PC   = {'CE Express':'#0077cc','CE Pro':'#059669','Both':'#d97706','Training':'#7c3aed'};

const chip = (color, text) => (
  <span style={{display:'inline-block',padding:'2px 8px',border:`1px solid ${color}40`,background:`${color}14`,color,fontFamily:'var(--font-mono)',fontSize:10,borderRadius:20,whiteSpace:'nowrap',fontWeight:600,letterSpacing:'.02em'}}>{text}</span>
);
const now = () => new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
const boldify = (text) => text.split('**').map((p,i) => i%2===1 ? <strong key={i} style={{color:'var(--text-bright)'}}>{p}</strong> : p);
const cleanMarkdownLinks = (text = '') =>
  text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
export default function SupportPortal({ onViewDocs }) {
  const [currentUser, setCurrentUser] = useState(null);
const [users,       setUsers]       = useState([]);
  const [tickets,     setTickets]     = useState(SEED_TICKETS);
  const [tab,         setTab]         = useState('chat');

  // Chat state
  const [messages,  setMessages]  = useState([]);
  const [typing,    setTyping]    = useState(false);
  const [showSug,   setShowSug]   = useState(true);
  const msgEnd = useRef(null);

  // Ticket state
  const [showNewTkt, setShowNewTkt] = useState(false);
  const [activeTkt,  setActiveTkt]  = useState(null);

  // Admin state
// Admin state
  const [admFilter, setAdmFilter] = useState('All');
  const [admTkt,    setAdmTkt]    = useState(null);
  const [openFaq,   setOpenFaq]   = useState(null);

  // Admin — Documentation CRUD state
  const [docsList,    setDocsList]    = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [docsError,   setDocsError]   = useState('');
  const [docMode,     setDocMode]     = useState('list'); // 'list' | 'edit' | 'new'
  const [docDraft,    setDocDraft]    = useState(null);
  const [docSaving,   setDocSaving]   = useState(false);

  const [docImages,    setDocImages]    = useState([]);
  const [newImgFile,   setNewImgFile]   = useState(null);
  const [newImgCaption,setNewImgCaption]= useState('');
  const [newImgAnchor, setNewImgAnchor] = useState('');
  const [imgUploading, setImgUploading] = useState(false);
  const [ticketDraft, setTicketDraft] = useState(null);
  const [pageLoadStart, setPageLoadStart] = useState(null);

  const isAdmin   = currentUser?.role==='admin' || currentUser?.role==='agent';
  // Restore a saved session on page load/refresh
  useEffect(() => {
    const saved = localStorage.getItem('ce_support_user');
    if (saved) {
      try {
        const u = JSON.parse(saved);
        setCurrentUser(u);
        setTab((u.role==='admin'||u.role==='agent') ? 'adm-dashboard' : 'chat');
      } catch {}
    }
  }, []);

  // Load the real user list for the admin "Users" tab
  useEffect(() => {
    if (isAdmin) {
      fetch(`${API_BASE}/auth/users`)
        .then(r => r.json())
        .then(setUsers)
        .catch(() => {});
    }
  }, [isAdmin]);
  // Load the documents list whenever the admin opens the Documentation tab
  const loadDocsList = () => {
    setDocsLoading(true);
    setDocsError('');
    fetch(`${API_BASE}/docs`)
      .then(r => r.json())
      .then(rows => { setDocsList(rows); setDocsLoading(false); })
      .catch(() => { setDocsError('Could not load documents.'); setDocsLoading(false); });
  };
  useEffect(() => {
    if (tab === 'adm-docs' && docMode === 'list') loadDocsList();
  }, [tab, docMode]);

const openEditDoc = async (docId) => {
    setDocsError('');
    const res = await fetch(`${API_BASE}/docs/${docId}`);
    if (!res.ok) { setDocsError('Could not load this document.'); return; }
    const data = await res.json();
    setDocDraft({ doc_id: data.doc_id, title: data.title, product: data.product, category: data.category, content: data.content });
    setDocImages(data.images || []);
    setDocMode('edit');
  };
  const openNewDoc = () => {
    setDocDraft({ doc_id: '', title: '', product: 'CE Express', category: '', content: '' });
    setDocMode('new');
  };

  const saveDoc = async () => {
    if (!docDraft.title || !docDraft.category || (docMode === 'new' && !docDraft.doc_id)) {
      setDocsError('Please fill in all required fields.');
      return;
    }
    setDocSaving(true);
    setDocsError('');
    try {
      const url = docMode === 'new' ? `${API_BASE}/docs` : `${API_BASE}/docs/${docDraft.doc_id}`;
      const method = docMode === 'new' ? 'POST' : 'PUT';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(docDraft),
      });
      const data = await res.json();
      if (!res.ok) { setDocsError(data.error || 'Save failed.'); setDocSaving(false); return; }
      setDocSaving(false);
      setDocMode('list');
    } catch {
      setDocsError('Could not reach the server.');
      setDocSaving(false);
    }
  };

  const deleteDoc = async (docId) => {
    if (!window.confirm(`Delete "${docId}"? This cannot be undone.`)) return;
    const res = await fetch(`${API_BASE}/docs/${docId}`, { method: 'DELETE' });
    if (res.ok) {
      setDocsList(p => p.filter(d => d.doc_id !== docId));
    } else {
      setDocsError('Could not delete this document.');
    }
  };
  const uploadImage = async () => {
    if (!newImgFile) { setDocsError('Choose a file first.'); return; }
    setImgUploading(true);
    setDocsError('');
    try {
      const form = new FormData();
      form.append('image', newImgFile);
      form.append('caption', newImgCaption);
      form.append('section_anchor', newImgAnchor);
      const res = await fetch(`${API_BASE}/docs/${docDraft.doc_id}/images/upload`, { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) { setDocsError(data.error || 'Upload failed.'); setImgUploading(false); return; }
      setDocImages(p => [...p, data]);
      setNewImgFile(null); setNewImgCaption(''); setNewImgAnchor('');
      setImgUploading(false);
    } catch {
      setDocsError('Could not reach the server.');
      setImgUploading(false);
    }
  };

  const deleteImage = async (imageId) => {
    if (!window.confirm('Delete this image?')) return;
    const res = await fetch(`${API_BASE}/docs/${docDraft.doc_id}/images/${imageId}`, { method: 'DELETE' });
    if (res.ok) {
      setDocImages(p => p.filter(i => i.id !== imageId));
    } else {
      setDocsError('Could not delete this image.');
    }
  };
  const myTickets = currentUser ? tickets.filter(t => t.userId===currentUser.id) : [];
  const openTktCount = myTickets.filter(t => t.status==='Open' || t.status==='In Progress').length;
  const logActivity = (activityType, page, details = '') => {
    if (!currentUser) return;
    fetch('http://localhost:8000/admin/log-activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_role: currentUser.role,
        activity_type: activityType,
        page: page,
        details: details
      })
    }).catch(() => {});
  };

  useEffect(() => {
    if (!pageLoadStart || !currentUser) return;
    const duration = Math.round(performance.now() - pageLoadStart);
    logActivity('performance', tab, `Page opened in ${duration} ms`);
    setPageLoadStart(null);
  }, [tab, pageLoadStart, currentUser]);

  useEffect(() => { msgEnd.current?.scrollIntoView({behavior:'smooth'}); }, [messages, typing]);

  useEffect(() => {
    if (currentUser?.role==='user' && messages.length===0) {
      setMessages([{ from:'bot', time:now(), type:'welcome',
        text:`Hello ${currentUser.name.split(' ')[0]}! 👋 Welcome to **Cellular Expert Support**.\n\nI can answer questions about CE Express, CE Pro, RF planning, and more. Choose a question below or type your own.`
      }]);
      setShowSug(true);
    }
  }, [currentUser]);

  // ── Auth ──────────────────────────────────────────────────────────────────
// ── Auth (real backend calls) ────────────────────────────────────────────────
  const handleLogin = async (email, password) => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error || 'Sign in failed.' };
      setCurrentUser(data);
      logActivity('login', 'Support Portal', 'User logged in');
      localStorage.setItem('ce_support_user', JSON.stringify(data));
      setTab((data.role==='admin'||data.role==='agent') ? 'adm-dashboard' : 'chat');
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not reach the server. Is the backend running?' };
    }
  };

  const handleRegister = async (regData) => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.error || 'Registration failed.' };
      setCurrentUser(data);
      logActivity('register', 'Support Portal', 'New user registered');
      localStorage.setItem('ce_support_user', JSON.stringify(data));
      setTab('chat');
      return { ok: true };
    } catch {
      return { ok: false, error: 'Could not reach the server. Is the backend running?' };
    }
  };

const logout = () => {
    logActivity('logout', 'Support Portal', 'User logged out');
    setCurrentUser(null); setMessages([]); setShowSug(true); setTab('chat');
    localStorage.removeItem('ce_support_user');
  };

  // ── Chat ──────────────────────────────────────────────────────────────────
  const sendMsg = async (text) => {
    const t = text.trim();
    if (!t) return;

    setShowSug(false);
    setMessages(p => [...p, { from: 'user', text: t, time: now() }]);
    setTyping(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: t,
          user: currentUser?.name || 'Demo User',
          conversation: messages.map(m => ({
            role: m.from === 'bot' ? 'assistant' : 'user',
            message: m.text || ''
          }))
        })
      });

      const data = await response.json();
      setTyping(false);

      const shouldOpenTicket =
        data.ticket_needed ||
        data.confidence < 0.6 ||
        !data.sources ||
        data.sources.length === 0 ||
        data.answer.toLowerCase().includes("could not find") ||
        data.answer.toLowerCase().includes("couldn't find");

      if (!shouldOpenTicket) {
        setMessages(p => [...p, {
          from: 'bot',
          time: now(),
          type: 'article',
          title: 'AI Documentation Answer',
          text:
            `Answer:\n${cleanMarkdownLinks(data.answer)}\n\n` +
            `Confidence:\n${Math.round(data.confidence * 100)}%\n\n` +
            `Sources used:\n` +
            data.sources.map((s, index) =>
              `${index + 1}. ${s.document}\n   Section: ${s.section}\n   Product: ${s.product} ${s.version}`
            ).join('\n\n')
        }]);
      } else {
        const ticket = data.ticket_prefill || {
          product: data.sources?.[0]?.product || 'CE Express',
          version: data.sources?.[0]?.version || '7.3',
          ticket_title: `Question about: ${t}`,
          issue_type: 'Documentation / User Question',
          full_question: t,
          retrieved_documents: data.sources || [],
          user: currentUser?.name || 'Demo User',
          time: new Date().toISOString(),
          conversation_context: messages.map(m => ({
            role: m.from === 'bot' ? 'assistant' : 'user',
            message: m.text || ''
          })),
          priority_suggestion: 'Low'
        };

        setTicketDraft(ticket);

        setMessages(p => [...p, {
          from: 'bot',
          time: now(),
          type: 'no-answer',
          text:
            `${cleanMarkdownLinks(data.answer)}\n\n` +
            `I can prepare a support ticket for review.\n\n` +
            `**Ticket draft:**\n` +
            `Product: ${ticket.product}\n` +
            `Version: ${ticket.version}\n` +
            `Title: ${ticket.ticket_title}\n` +
            `Issue type: ${ticket.issue_type}\n` +
            `Priority suggestion: ${ticket.priority_suggestion}\n\n` +
            `**Question:**\n${ticket.full_question}`
        }]);
      }
    } catch (error) {
      setTyping(false);
      setMessages(p => [...p, {
        from: 'bot',
        time: now(),
        type: 'no-answer',
        text: 'AI backend is not reachable. Please check if FastAPI is running on http://127.0.0.1:8000.'
      }]);
    }
  };
  // ── Tickets ───────────────────────────────────────────────────────────────
  const createTicket = (data) => {
    const t = { id:'T-'+String(tickets.length+1).padStart(3,'0'), userId:currentUser.id,
      title:data.title, product:data.product, category:data.category, priority:data.priority,
      status:'Open', created:new Date().toISOString().split('T')[0],
      updated:new Date().toISOString().split('T')[0], assignedTo:'u4',
      messages:[{from:currentUser.id, text:data.description, time:new Date().toLocaleString()}] };
    setTickets(p=>[t,...p]); setShowNewTkt(false);
        setTicketDraft(null);

    setActiveTkt(t.id); setTab('tickets');
  };
  const replyTicket = (id, text) => {
    setTickets(p => p.map(t => t.id===id ? {...t, messages:[...t.messages,{from:currentUser.id,text,time:new Date().toLocaleString()}]} : t));
  };

  // ── Sidebar ───────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <div style={{width:198,flexShrink:0,background:'var(--bg2)',borderRight:'1px solid var(--border)',display:'flex',flexDirection:'column'}}>
      <div style={{padding:'14px 14px 11px',borderBottom:'1px solid var(--border)'}}>
        <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
          <div style={{width:22,height:22,borderRadius:6,background:'linear-gradient(135deg, var(--accent), var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,flexShrink:0}}>🛟</div>
          <div style={{fontFamily:'var(--font-display)',fontSize:14,fontWeight:700,color:'var(--text-bright)',letterSpacing:'.04em'}}>Support</div>
        </div>
        <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text-dim)',letterSpacing:'.1em',marginLeft:29}}>Help Portal</div>
      </div>
      <nav style={{flex:1,padding:8,display:'flex',flexDirection:'column',gap:2,overflowY:'auto'}}>
{(isAdmin ? [
          {id:'adm-dashboard',icon:'◈',label:'Dashboard'},
          {id:'adm-tickets',  icon:'◉',label:'All Tickets'},
          {id:'adm-agents',   icon:'◐',label:'Agent Stats'},
          {id:'adm-ai-insights', icon:'✦', label:'AI Insights'},
          {id:'adm-users',    icon:'◎',label:'Users'},
          {id:'adm-docs',     icon:'▤',label:'Documentation'},
        ] : [
          {id:'chat',      icon:'◈',label:'Support Chat'},
          {id:'tickets',   icon:'◉',label:'My Tickets', badge:openTktCount||null},
          {id:'docs-link', icon:'▤',label:'Documentation'},
          {id:'profile',   icon:'◎',label:'Profile'},
        ]).map(item => (
          <div key={item.id}
            onClick={() => { if (item.id==='docs-link') { onViewDocs(); return; } setTab(item.id); }}
            style={{display:'flex',alignItems:'center',gap:9,padding:'8px 10px',borderRadius:8,
              background:tab===item.id?'var(--accent-l)':'transparent',
              color:tab===item.id?'var(--accent)':'var(--text)',
              fontSize:12.5,cursor:'pointer',fontWeight:tab===item.id?600:400,transition:'all .12s'}}>
            <span style={{fontSize:13,opacity:tab===item.id?1:0.5}}>{item.icon}</span>
            <span style={{flex:1}}>{item.label}</span>
            {item.badge && <span style={{background:'var(--accent)',color:'#fff',fontSize:10,padding:'1px 6px',borderRadius:10,fontFamily:'var(--font-mono)',fontWeight:700}}>{item.badge}</span>}
          </div>
        ))}
      </nav>
      <div style={{padding:'11px 12px',borderTop:'1px solid var(--border)',display:'flex',alignItems:'center',gap:9}}>
        <div style={{width:30,height:30,borderRadius:9,background:'linear-gradient(135deg, var(--accent), var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-mono)',fontSize:10,color:'#fff',fontWeight:700,flexShrink:0}}>{currentUser?.avatar}</div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:11,color:'var(--text-bright)',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{currentUser?.name}</div>
          <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text-dim)',textTransform:'uppercase',letterSpacing:'.08em'}}>{currentUser?.role}</div>
        </div>
        <button onClick={logout} title="Sign out" style={{background:'none',border:'none',color:'var(--text-dim)',cursor:'pointer',fontSize:14,padding:2}}>⏻</button>
      </div>
    </div>
  );

  // ── Chat Tab ──────────────────────────────────────────────────────────────
  const ChatTab = () => (
    <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>
      <div style={{flex:1,overflowY:'auto',padding:14,display:'flex',flexDirection:'column',gap:11}}>
        {messages.map((m,i) => (
          <div key={i}>
            {m.from==='bot' ? (
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start',gap:3}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
                  <div style={{width:21,height:21,borderRadius:7,background:'linear-gradient(135deg, var(--accent), var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10}}>✦</div>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-dim)'}}>CE Assistant · {m.time}</span>
                </div>
                {(m.type==='text'||m.type==='welcome'||m.type==='followup'||m.type==='no-answer') && (
                  <div style={{maxWidth:'88%',padding:'10px 13px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'4px 12px 12px 12px',fontSize:12,color:'var(--text)',lineHeight:1.7,whiteSpace:'pre-line'}}>
                    {boldify(m.text)}
                    {m.type==='no-answer' && (
                      <div style={{marginTop:10,display:'flex',gap:7,flexWrap:'wrap'}}>
                        <a href={`mailto:${SUPPORT_EMAIL}`} style={{padding:'6px 12px',background:'var(--accent)',borderRadius:7,color:'#fff',fontSize:11,textDecoration:'none',fontFamily:'var(--font-mono)',letterSpacing:'.06em'}}>✉ Email Support</a>
                        <button onClick={() => setTab('tickets')} style={{padding:'6px 12px',background:'transparent',border:'1px solid var(--accent)',borderRadius:7,color:'var(--accent)',fontSize:11,cursor:'pointer',fontFamily:'var(--font-mono)',letterSpacing:'.06em'}}>◉ Open Ticket</button>
                      </div>
                    )}
                    {m.type==='followup' && (
                      <div style={{marginTop:10,display:'flex',gap:7,flexWrap:'wrap'}}>
                        <button onClick={() => setTab('tickets')} style={{padding:'5px 11px',background:'transparent',border:'1px solid var(--border2)',borderRadius:7,color:'var(--text-dim)',fontSize:11,cursor:'pointer'}}>◉ Open a ticket</button>
                        <a href={`mailto:${SUPPORT_EMAIL}`} style={{padding:'5px 11px',background:'transparent',border:'1px solid var(--border2)',borderRadius:7,color:'var(--text-dim)',fontSize:11,textDecoration:'none'}}>✉ Email support</a>
                        <button onClick={onViewDocs} style={{padding:'5px 11px',background:'transparent',border:'1px solid var(--border2)',borderRadius:7,color:'var(--text-dim)',fontSize:11,cursor:'pointer'}}>▤ View docs</button>
                      </div>
                    )}
                  </div>
                )}
                {m.type==='article' && (
                  <div style={{maxWidth:'92%'}}>
                    <div style={{padding:'8px 13px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'4px 12px 12px 4px',fontSize:12,color:'var(--text)',marginBottom:6}}>Here's what I found:</div>
                    <div style={{background:'var(--bg2)',border:'1px solid var(--accent)',borderRadius:11,overflow:'hidden',boxShadow:'var(--shadow)'}}>
                      <div style={{padding:'10px 14px',background:'var(--accent-l)',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:7}}>
                        <span style={{fontSize:13}}>✦</span>
                        <div style={{fontWeight:600,color:'var(--text-bright)',fontSize:13}}>{m.title}</div>
                      </div>
                      <div style={{padding:'12px 14px',fontSize:12,color:'var(--text)',lineHeight:1.8,whiteSpace:'pre-line',maxHeight:240,overflowY:'auto'}}>
                        {boldify(m.text)}
                      </div>
                    </div>
                    <div style={{display:'flex',gap:7,marginTop:8,flexWrap:'wrap'}}>
                      <button onClick={() => setTab('tickets')} style={{padding:'5px 11px',background:'transparent',border:'1px solid var(--border2)',borderRadius:7,color:'var(--text-dim)',fontSize:11,cursor:'pointer'}}>◉ Still need help?</button>
                      <a href={`mailto:${SUPPORT_EMAIL}`} style={{padding:'5px 11px',background:'transparent',border:'1px solid var(--border2)',borderRadius:7,color:'var(--text-dim)',fontSize:11,textDecoration:'none'}}>✉ Email support</a>
                      <button onClick={onViewDocs} style={{padding:'5px 11px',background:'transparent',border:'1px solid var(--border2)',borderRadius:7,color:'var(--text-dim)',fontSize:11,cursor:'pointer'}}>▤ Full docs</button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:2}}>
                <div style={{maxWidth:'78%',padding:'9px 13px',background:'linear-gradient(135deg, var(--accent), var(--accent2))',color:'#fff',borderRadius:'12px 4px 12px 12px',fontSize:12,lineHeight:1.6}}>{m.text}</div>
                <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-dim)'}}>{m.time}</span>
              </div>
            )}
          </div>
        ))}
        {typing && (
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <div style={{width:21,height:21,borderRadius:7,background:'linear-gradient(135deg, var(--accent), var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10}}>✦</div>
            <div style={{padding:'9px 14px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:'4px 12px 12px 12px',display:'flex',gap:4,alignItems:'center'}}>
              {[0,1,2].map(n => <span key={n} style={{width:6,height:6,borderRadius:'50%',background:'var(--accent)',display:'inline-block',animation:`tdot 1.4s ease-in-out ${n*.18}s infinite`}}/>)}
            </div>
          </div>
        )}
        {showSug && messages.length>0 && !typing && (
          <div style={{marginTop:4}}>
            <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-dim)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:8}}>Common Questions</div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {SUGGESTED.map((s,i) => (
                <button key={i} onClick={() => sendMsg(s.query)}
                  style={{textAlign:'left',padding:'9px 13px',background:'var(--bg2)',border:'1px solid var(--border2)',borderRadius:10,color:'var(--text)',fontSize:12,cursor:'pointer',transition:'all .15s',lineHeight:1.4,display:'flex',alignItems:'center',gap:8}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.background='var(--accent-l)';}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border2)';e.currentTarget.style.background='var(--bg2)';}}>
                  <span style={{color:'var(--accent)',fontSize:13,flexShrink:0}}>→</span>{s.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={msgEnd}/>
      </div>
      <ChatComposer onSend={sendMsg}/>
    </div>
  );

  // ── Tickets Tab ───────────────────────────────────────────────────────────
  const TicketsTab = () => (
    <div style={{flex:1,overflowY:'auto',padding:14}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
        <div style={{fontWeight:700,color:'var(--text-bright)',fontSize:13}}>My Tickets ({myTickets.length})</div>
        <button onClick={() => setShowNewTkt(true)} style={{padding:'7px 14px',background:'linear-gradient(135deg, var(--accent), var(--accent2))',border:'none',color:'#fff',borderRadius:8,fontSize:11,cursor:'pointer',fontFamily:'var(--font-mono)',letterSpacing:'.06em',fontWeight:600}}>+ New</button>
      </div>
{showNewTkt && <NewTicketForm onSubmit={createTicket} onCancel={() => { setShowNewTkt(false); setTicketDraft(null); }} draft={ticketDraft}/>}      {myTickets.length===0 && !showNewTkt && (
        <div style={{textAlign:'center',padding:'36px 16px',color:'var(--text-dim)'}}>
          <div style={{fontSize:30,marginBottom:8,opacity:.5}}>◉</div>
          <div style={{color:'var(--text-bright)',marginBottom:3,fontSize:13}}>No tickets yet</div>
          <div style={{fontSize:12}}>Open a ticket when you need direct help from our team.</div>
        </div>
      )}
      {myTickets.map(t => (
        <div key={t.id} style={{marginBottom:6}}>
          <div onClick={() => setActiveTkt(activeTkt===t.id?null:t.id)}
            style={{background:'var(--bg2)',border:`1px solid ${activeTkt===t.id?'var(--accent)':'var(--border)'}`,borderRadius:activeTkt===t.id?'10px 10px 0 0':10,padding:'10px 13px',cursor:'pointer',transition:'all .15s',borderLeft:`3px solid ${SC[t.status]||'var(--border)'}`}}>
            <div style={{display:'flex',gap:5,marginBottom:4,flexWrap:'wrap'}}>
              <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-dim)'}}>{t.id}</span>
              {chip(SC[t.status]||'#6b7280',t.status)}&nbsp;{chip(PRIC[t.priority]||'#6b7280',t.priority)}
            </div>
            <div style={{fontSize:12,fontWeight:500,color:'var(--text-bright)'}}>{t.title}</div>
            <div style={{fontSize:10,color:'var(--text-dim)',marginTop:3}}>{t.created} · {t.messages.length} messages</div>
          </div>
          {activeTkt===t.id && (
            <div style={{background:'var(--bg)',border:'1px solid var(--accent)',borderTop:'none',borderRadius:'0 0 10px 10px',padding:'11px 13px'}}>
              {t.messages.map((m,i) => (
                <div key={i} style={{display:'flex',flexDirection:'column',alignItems:m.from===currentUser?.id?'flex-end':'flex-start',marginBottom:8}}>
                  <div style={{maxWidth:'84%',padding:'8px 12px',background:m.from===currentUser?.id?'var(--accent)':'var(--bg2)',color:m.from===currentUser?.id?'#fff':'var(--text)',fontSize:12,lineHeight:1.6,borderRadius:m.from===currentUser?.id?'10px 4px 10px 10px':'4px 10px 10px 10px',border:m.from===currentUser?.id?'none':'1px solid var(--border)'}}>{m.text}</div>
                  <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text-dim)',marginTop:2}}>{m.time}</div>
                </div>
              ))}
              {t.status!=='Closed' && <ReplyBox onSend={(text) => replyTicket(t.id, text)}/>}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // ── Profile Tab ───────────────────────────────────────────────────────────
  const ProfileTab = () => (
    <div style={{flex:1,overflowY:'auto',padding:14}}>
      <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:14,padding:20,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-40,right:-40,width:120,height:120,borderRadius:'50%',background:'var(--accent-l)',pointerEvents:'none'}}/>
        <div style={{width:50,height:50,borderRadius:14,background:'linear-gradient(135deg, var(--accent), var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-mono)',fontSize:16,color:'#fff',fontWeight:700,marginBottom:16,position:'relative'}}>{currentUser?.avatar}</div>
        {[['Name',currentUser?.name],['Email',currentUser?.email],['Company',currentUser?.company],['Product',currentUser?.product],['Role',currentUser?.role],['Since',currentUser?.joined]].map(([l,v]) => (
          <div key={l} style={{display:'flex',gap:10,padding:'7px 0',borderBottom:'1px solid var(--border)',position:'relative'}}>
            <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-dim)',letterSpacing:'.1em',textTransform:'uppercase',width:68,flexShrink:0}}>{l}</span>
            <span style={{fontSize:12,color:'var(--text-bright)'}}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Admin Dashboard ───────────────────────────────────────────────────────
  const AdminDashboard = () => (
    <div style={{flex:1,overflowY:'auto',padding:14}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:14}}>
        {[['Open',tickets.filter(t=>t.status==='Open').length,'#d97706'],
          ['In Progress',tickets.filter(t=>t.status==='In Progress').length,'var(--accent)'],
          ['Resolved',tickets.filter(t=>t.status==='Resolved'||t.status==='Closed').length,'var(--accent2)'],
          ['Critical',tickets.filter(t=>t.priority==='Critical').length,'#dc2626'],
        ].map(([l,v,c]) => (
          <div key={l} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:11,padding:13,position:'relative',overflow:'hidden'}}>
            <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:c}}/>
            <div style={{fontFamily:'var(--font-display)',fontSize:27,fontWeight:700,color:'var(--text-bright)'}}>{v}</div>
            <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text-dim)',letterSpacing:'.1em',textTransform:'uppercase'}}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{fontWeight:700,color:'var(--text-bright)',fontSize:12,marginBottom:8}}>Recent Tickets</div>
      {tickets.slice(0,4).map(t => (
        <div key={t.id} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:9,padding:'9px 12px',marginBottom:5,display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
          <div>
            <div style={{fontSize:11,color:'var(--text-bright)',fontWeight:500}}>{t.title.slice(0,44)}{t.title.length>44?'…':''}</div>
            <div style={{display:'flex',gap:4,marginTop:4}}>{chip(SC[t.status]||'#6b7280',t.status)}&nbsp;{chip(PRIC[t.priority]||'#6b7280',t.priority)}</div>
          </div>
          <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-dim)',flexShrink:0}}>{t.updated}</span>
        </div>
      ))}
      <div style={{marginTop:14,paddingTop:12,borderTop:'1px solid var(--border)'}}>
        <div style={{fontWeight:700,color:'var(--text-bright)',fontSize:12,marginBottom:9,display:'flex',alignItems:'center',gap:6}}>
          <span style={{color:'var(--accent)'}}>✦</span> Frequently Asked Questions
        </div>
        {KB.slice(0,6).map((f,i) => (
          <div key={i} onClick={() => setOpenFaq(openFaq===i?null:i)} style={{borderBottom:'1px solid var(--border)',padding:'9px 0',cursor:'pointer'}}>
            <div style={{display:'flex',justifyContent:'space-between',gap:8,fontSize:12,fontWeight:500,color:'var(--text-bright)',alignItems:'flex-start'}}>
              <span style={{flex:1,lineHeight:1.4}}>{f.title}</span>
              <span style={{color:'var(--text-dim)',flexShrink:0,fontSize:10,transform:openFaq===i?'rotate(180deg)':'none',transition:'transform .15s'}}>▾</span>
            </div>
            {openFaq===i && <div style={{fontSize:11,color:'var(--text)',lineHeight:1.7,marginTop:7,paddingLeft:9,borderLeft:'2px solid var(--accent)',whiteSpace:'pre-line'}}>{f.answer.replace(/\*\*(.+?)\*\*/g,'$1')}</div>}
          </div>
        ))}
      </div>
    </div>
  );

  // ── Admin Tickets ─────────────────────────────────────────────────────────
  const AdminTickets = () => (
    <div style={{flex:1,overflowY:'auto',padding:14}}>
      <div style={{display:'flex',gap:5,marginBottom:10,flexWrap:'wrap'}}>
        {['All','Open','In Progress','Resolved','Closed'].map(s => (
          <button key={s} onClick={() => setAdmFilter(s)}
            style={{padding:'5px 11px',borderRadius:20,border:`1px solid ${admFilter===s?'var(--accent)':'var(--border)'}`,background:admFilter===s?'var(--accent-l)':'transparent',color:admFilter===s?'var(--accent)':'var(--text-dim)',fontFamily:'var(--font-mono)',fontSize:10,letterSpacing:'.06em',cursor:'pointer',fontWeight:600}}>{s}</button>
        ))}
      </div>
      {(admFilter==='All'?tickets:tickets.filter(t=>t.status===admFilter)).map(t => (
        <div key={t.id} style={{marginBottom:6}}>
          <div onClick={() => setAdmTkt(admTkt===t.id?null:t.id)}
            style={{background:'var(--bg2)',border:`1px solid ${admTkt===t.id?'var(--accent)':'var(--border)'}`,borderRadius:admTkt===t.id?'10px 10px 0 0':10,padding:'10px 12px',cursor:'pointer',transition:'all .15s',borderLeft:`3px solid ${SC[t.status]||'var(--border)'}`}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
              <div>
                <div style={{display:'flex',gap:4,marginBottom:4,flexWrap:'wrap'}}>
                  <span style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--accent)'}}>{t.id}</span>
                  {chip(SC[t.status]||'#6b7280',t.status)}&nbsp;{chip(PRIC[t.priority]||'#6b7280',t.priority)}
                </div>
                <div style={{fontSize:12,fontWeight:500,color:'var(--text-bright)'}}>{t.title}</div>
              </div>
              <select value={t.status} onClick={e=>e.stopPropagation()} onChange={e=>setTickets(p=>p.map(x=>x.id===t.id?{...x,status:e.target.value}:x))}
                style={{padding:'5px 8px',border:'1px solid var(--border)',borderRadius:7,fontSize:10,color:'var(--text-bright)',background:'var(--bg)',outline:'none',cursor:'pointer'}}>
                {['Open','In Progress','Resolved','Closed'].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          {admTkt===t.id && (
            <div style={{background:'var(--bg)',border:'1px solid var(--accent)',borderTop:'none',borderRadius:'0 0 10px 10px',padding:'10px 12px'}}>
              {t.messages.map((m,i) => (
                <div key={i} style={{marginBottom:8,padding:'8px 11px',background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:8}}>
                  <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--accent)',marginBottom:3}}>{m.from==='u4'?'◈ Agent':'◎ Customer'} · {m.time}</div>
                  <div style={{fontSize:11,color:'var(--text)',lineHeight:1.6}}>{m.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // ── Admin Agents ──────────────────────────────────────────────────────────
  const AdminAgents = () => (
    <div style={{flex:1,overflowY:'auto',padding:14}}>
      {AGENTS.map(a => (
        <div key={a.id} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:14,marginBottom:9}}>
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
            <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg, var(--accent), var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-mono)',fontSize:11,color:'#fff',fontWeight:700}}>{a.avatar}</div>
            <div>
              <div style={{fontWeight:700,color:'var(--text-bright)',fontSize:13}}>{a.name}</div>
              <div style={{color:'#f59e0b',fontSize:12,letterSpacing:2}}>{'★'.repeat(Math.floor(a.satisfaction))}{'☆'.repeat(5-Math.floor(a.satisfaction))}</div>
            </div>
            <div style={{marginLeft:'auto',textAlign:'right'}}>
              <div style={{fontFamily:'var(--font-display)',fontSize:20,fontWeight:700,color:'var(--accent)'}}>{a.satisfaction}</div>
              <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text-dim)'}}>SATISFACTION</div>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:7}}>
            {[['Resolved',a.resolved],['Month',a.thisMonth],['Open',a.open],['Avg',a.avgResponse]].map(([l,v]) => (
              <div key={l} style={{background:'var(--bg)',borderRadius:8,padding:8,textAlign:'center'}}>
                <div style={{fontFamily:'var(--font-display)',fontSize:17,fontWeight:700,color:'var(--text-bright)'}}>{v}</div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text-dim)',textTransform:'uppercase',letterSpacing:'.06em'}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // ── Admin Users ───────────────────────────────────────────────────────────
const changeUserRole = async (id, role) => {
    const res = await fetch(`${API_BASE}/auth/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (res.ok) {
      const updated = await res.json();
      setUsers(p => p.map(u => u.id === id ? updated : u));
    }
  };

const AdminUsers = () => (
    <div style={{flex:1,overflowY:'auto',padding:14}}>
      <div style={{fontWeight:700,color:'var(--text-bright)',fontSize:12,marginBottom:9}}>All Users ({users.length})</div>
      {users.map(u => (
        <div key={u.id} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,padding:'9px 12px',marginBottom:6,display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:28,height:28,borderRadius:8,background:'linear-gradient(135deg, var(--accent), var(--accent2))',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'var(--font-mono)',fontSize:10,color:'#fff',fontWeight:700,flexShrink:0}}>{u.avatar}</div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontSize:12,fontWeight:500,color:'var(--text-bright)'}}>{u.name}</div>
            <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-dim)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{u.email}</div>
          </div>
          {chip(PC[u.product]||'#6b7280',u.product)}&nbsp;
          {chip(u.role==='admin'?'#7c3aed':u.role==='agent'?'var(--accent2)':'var(--accent)',u.role)}
        </div>
      ))}
    </div>
  );
    const AdminAIInsights = () => {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
      fetch('http://localhost:8000/admin/ai-insights')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to load AI insights');
          }
          return response.json();
        })
        .then(data => {
          setInsights(data);
          setLoading(false);
        })
        .catch(() => {
          setError('AI insights backend is not reachable. Please check FastAPI on port 8000.');
          setLoading(false);
        });
    }, []);

    if (loading) {
      return (
        <div style={{flex:1,overflowY:'auto',padding:14}}>
          <div style={{fontWeight:700,color:'var(--text-bright)',fontSize:12,marginBottom:9}}>
            AI Insights
          </div>
          <div style={{color:'var(--text-dim)',fontSize:12}}>Loading AI analytics...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div style={{flex:1,overflowY:'auto',padding:14}}>
          <div style={{fontWeight:700,color:'var(--text-bright)',fontSize:12,marginBottom:9}}>
            AI Insights
          </div>
          <div style={{color:'#dc2626',fontSize:12}}>{error}</div>
        </div>
      );
    }

        const summary = insights?.summary || {};

    const totalQuestions = summary.total_questions || 0;
    const ticketNeededCount = summary.ticket_needed_count || 0;
    const answeredWithoutTicket = Math.max(
      totalQuestions - ticketNeededCount,
      0
    );

    const ticketRate = totalQuestions > 0
      ? Math.round((ticketNeededCount / totalQuestions) * 100)
      : 0;

    const lowConfidenceCount =
      insights?.low_confidence_questions?.length || 0;

    return (
      <div style={{flex:1,overflowY:'auto',padding:14}}>
        <div style={{marginBottom:14}}>
          <div style={{fontWeight:700,color:'var(--text-bright)',fontSize:12,marginBottom:4}}>
            AI Insights
          </div>
          <div style={{fontSize:11,color:'var(--text-dim)'}}>
            Clear overview of chatbot usage, confidence, ticket demand, and unclear topics.
          </div>
        </div>

        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(3, minmax(0, 1fr))',
          gap:10,
          marginBottom:10
        }}>
          <div style={{
            background:'var(--bg2)',
            border:'1px solid var(--border)',
            borderRadius:10,
            padding:12
          }}>
            <div style={{
              fontFamily:'var(--font-mono)',
              fontSize:9,
              color:'var(--text-dim)',
              letterSpacing:'.08em',
              marginBottom:5
            }}>
              TOTAL AI QUESTIONS
            </div>

            <div style={{
              fontSize:24,
              fontWeight:800,
              color:'var(--text-bright)'
            }}>
              {totalQuestions}
            </div>

            <div style={{
              fontSize:10,
              color:'var(--text-dim)',
              marginTop:4
            }}>
              All chatbot questions recorded
            </div>
          </div>

          <div style={{
            background:'var(--bg2)',
            border:'1px solid var(--border)',
            borderRadius:10,
            padding:12
          }}>
            <div style={{
              fontFamily:'var(--font-mono)',
              fontSize:9,
              color:'var(--text-dim)',
              letterSpacing:'.08em',
              marginBottom:5
            }}>
              TICKET NEEDED
            </div>

            <div style={{
              fontSize:24,
              fontWeight:800,
              color:'#d97706'
            }}>
              {ticketNeededCount}
            </div>

            <div style={{
              fontSize:10,
              color:'var(--text-dim)',
              marginTop:4
            }}>
              {ticketRate}% of all AI questions
            </div>
          </div>

          <div style={{
            background:'var(--bg2)',
            border:'1px solid var(--border)',
            borderRadius:10,
            padding:12
          }}>
            <div style={{
              fontFamily:'var(--font-mono)',
              fontSize:9,
              color:'var(--text-dim)',
              letterSpacing:'.08em',
              marginBottom:5
            }}>
              AVG CONFIDENCE
            </div>

            <div style={{
              fontSize:24,
              fontWeight:800,
              color:'var(--accent)'
            }}>
              {Math.round((summary.average_confidence || 0) * 100)}%
            </div>

            <div style={{
              fontSize:10,
              color:'var(--text-dim)',
              marginTop:4
            }}>
              Average confidence across responses
            </div>
          </div>
        </div>

        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(3, minmax(0, 1fr))',
          gap:10,
          marginBottom:12
        }}>
          <div style={{
            background:'var(--bg2)',
            border:'1px solid var(--border)',
            borderRadius:10,
            padding:12
          }}>
            <div style={{
              fontFamily:'var(--font-mono)',
              fontSize:9,
              color:'var(--text-dim)',
              letterSpacing:'.08em',
              marginBottom:5
            }}>
              ANSWERED WITHOUT TICKET
            </div>

            <div style={{
              fontSize:22,
              fontWeight:800,
              color:'var(--accent2)'
            }}>
              {answeredWithoutTicket}
            </div>

            <div style={{
              fontSize:10,
              color:'var(--text-dim)',
              marginTop:4
            }}>
              Questions handled directly by AI
            </div>
          </div>

          <div style={{
            background:'var(--bg2)',
            border:'1px solid var(--border)',
            borderRadius:10,
            padding:12
          }}>
            <div style={{
              fontFamily:'var(--font-mono)',
              fontSize:9,
              color:'var(--text-dim)',
              letterSpacing:'.08em',
              marginBottom:5
            }}>
              TICKET RATE
            </div>

            <div style={{
              fontSize:22,
              fontWeight:800,
              color:'#d97706'
            }}>
              {ticketRate}%
            </div>

            <div style={{
              fontSize:10,
              color:'var(--text-dim)',
              marginTop:4
            }}>
              Share of questions needing support
            </div>
          </div>

          <div style={{
            background:'var(--bg2)',
            border:'1px solid var(--border)',
            borderRadius:10,
            padding:12
          }}>
            <div style={{
              fontFamily:'var(--font-mono)',
              fontSize:9,
              color:'var(--text-dim)',
              letterSpacing:'.08em',
              marginBottom:5
            }}>
              LOW-CONFIDENCE QUESTIONS
            </div>

            <div style={{
              fontSize:22,
              fontWeight:800,
              color:'#dc2626'
            }}>
              {lowConfidenceCount}
            </div>

            <div style={{
              fontSize:10,
              color:'var(--text-dim)',
              marginTop:4
            }}>
              Possible unclear or missing documentation
            </div>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
          <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,padding:12}}>
            <div style={{fontWeight:700,color:'var(--text-bright)',fontSize:12,marginBottom:8}}>
              Questions by Product
            </div>

            {(insights?.questions_by_product || []).length === 0 ? (
              <div style={{fontSize:11,color:'var(--text-dim)'}}>No product data yet.</div>
            ) : (
              (insights?.questions_by_product || []).map(item => (
                <div key={item.product} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:'1px solid var(--border)'}}>
                  <div style={{fontSize:12,color:'var(--text-bright)'}}>{item.product}</div>
                  <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'var(--accent)'}}>
                    {item.question_count}
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,padding:12}}>
            <div style={{fontWeight:700,color:'var(--text-bright)',fontSize:12,marginBottom:8}}>
              Ticket-Needed Questions
            </div>

            {(insights?.ticket_needed_questions || []).length === 0 ? (
              <div style={{fontSize:11,color:'var(--text-dim)'}}>No ticket-needed questions yet.</div>
            ) : (
              (insights?.ticket_needed_questions || []).slice(0, 5).map(q => (
                <div key={q.id} style={{padding:'7px 0',borderBottom:'1px solid var(--border)'}}>
                  <div style={{fontSize:12,color:'var(--text-bright)',marginBottom:3}}>
                    {q.question}
                  </div>
                  <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-dim)'}}>
                    {q.product || 'Unknown'} · {Math.round((q.confidence || 0) * 100)}%
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,padding:12,marginBottom:12}}>
          <div style={{fontWeight:700,color:'var(--text-bright)',fontSize:12,marginBottom:8}}>
            Low-Confidence Questions
          </div>

          {(insights?.low_confidence_questions || []).length === 0 ? (
            <div style={{fontSize:11,color:'var(--text-dim)'}}>No low-confidence questions yet.</div>
          ) : (
            (insights?.low_confidence_questions || []).map(q => (
              <div key={q.id} style={{padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{fontSize:12,color:'var(--text-bright)',marginBottom:3}}>
                  {q.question}
                </div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-dim)'}}>
                  User: {q.user_name || 'Unknown'} · Product: {q.product || 'Unknown'} · Confidence: {Math.round((q.confidence || 0) * 100)}%
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,padding:12}}>
          <div style={{fontWeight:700,color:'var(--text-bright)',fontSize:12,marginBottom:8}}>
            Recent AI Questions
          </div>

          {(insights?.recent_questions || []).length === 0 ? (
            <div style={{fontSize:11,color:'var(--text-dim)'}}>No AI questions yet.</div>
          ) : (
            (insights?.recent_questions || []).map(q => (
              <div key={q.id} style={{padding:'8px 0',borderBottom:'1px solid var(--border)'}}>
                <div style={{fontSize:12,color:'var(--text-bright)',marginBottom:3}}>
                  {q.question}
                </div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:10,color:'var(--text-dim)'}}>
                  User: {q.user_name || 'Unknown'} · Product: {q.product || 'Unknown'} · Ticket needed: {q.ticket_needed ? 'Yes' : 'No'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // ── Admin Documentation (CRUD) ───────────────────────────────────────────────
const AdminDocs = () => {
    if (docMode === 'edit' || docMode === 'new') {
      return (
        <div style={{flex:1,overflowY:'auto',padding:14}}>
          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
            <button onClick={() => setDocMode('list')} style={{background:'none',border:'none',color:'var(--accent)',cursor:'pointer',fontSize:12,fontFamily:'var(--font-mono)'}}>← Back</button>
            <div style={{fontWeight:700,color:'var(--text-bright)',fontSize:13}}>
              {docMode === 'new' ? 'New Document' : `Editing: ${docDraft.doc_id}`}
            </div>
          </div>

          {docsError && (
            <div style={{background:'rgba(220,38,38,.08)',border:'1px solid rgba(220,38,38,.25)',borderRadius:8,padding:'8px 12px',fontSize:11,color:'#ef4444',marginBottom:12}}>
              {docsError}
            </div>
          )}

          {docMode === 'new' && (
            <div style={{marginBottom:11}}>
              <label style={{display:'block',fontSize:10,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:5}}>Doc ID (unique, no spaces)</label>
              <input value={docDraft.doc_id} onChange={e=>setDocDraft(p=>({...p, doc_id:e.target.value.trim()}))}
                placeholder="e.g. ce-express-new-feature"
                style={{width:'100%',padding:'9px 12px',border:'1px solid var(--border)',borderRadius:8,fontSize:13,color:'var(--text-bright)',background:'var(--bg)',outline:'none',boxSizing:'border-box',fontFamily:'var(--font-mono)'}}/>
            </div>
          )}

          <div style={{marginBottom:11}}>
            <label style={{display:'block',fontSize:10,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:5}}>Title</label>
            <input value={docDraft.title} onChange={e=>setDocDraft(p=>({...p, title:e.target.value}))}
              style={{width:'100%',padding:'9px 12px',border:'1px solid var(--border)',borderRadius:8,fontSize:13,color:'var(--text-bright)',background:'var(--bg)',outline:'none',boxSizing:'border-box'}}/>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:11}}>
            <div>
              <label style={{display:'block',fontSize:10,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:5}}>Product</label>
              <select value={docDraft.product} onChange={e=>setDocDraft(p=>({...p, product:e.target.value}))}
                style={{width:'100%',padding:'9px 12px',border:'1px solid var(--border)',borderRadius:8,fontSize:13,color:'var(--text-bright)',background:'var(--bg)',outline:'none',cursor:'pointer'}}>
                {['CE Express','CE Pro','Both','Inventory3D'].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label style={{display:'block',fontSize:10,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:5}}>Category</label>
              <input value={docDraft.category} onChange={e=>setDocDraft(p=>({...p, category:e.target.value}))}
                placeholder="e.g. Reference, Training, User Guides"
                style={{width:'100%',padding:'9px 12px',border:'1px solid var(--border)',borderRadius:8,fontSize:13,color:'var(--text-bright)',background:'var(--bg)',outline:'none',boxSizing:'border-box'}}/>
            </div>
          </div>

          <div style={{marginBottom:14}}>
            <label style={{display:'block',fontSize:10,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:5}}>Content (Markdown)</label>
            <textarea value={docDraft.content} onChange={e=>setDocDraft(p=>({...p, content:e.target.value}))}
              rows={16}
              style={{width:'100%',padding:'11px 12px',border:'1px solid var(--border)',borderRadius:8,fontSize:12.5,color:'var(--text-bright)',background:'var(--bg)',outline:'none',boxSizing:'border-box',fontFamily:'var(--font-mono)',lineHeight:1.6,resize:'vertical'}}/>
          </div>

          {docMode === 'edit' && (
            <div style={{marginBottom:20,padding:14,background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--text-bright)',marginBottom:10,fontFamily:'var(--font-mono)',letterSpacing:'.06em',textTransform:'uppercase'}}>
                Images ({docImages.length})
              </div>

              {docImages.map(img => (
                <div key={img.id} style={{display:'flex',alignItems:'center',gap:10,padding:'7px 0',borderBottom:'1px solid var(--border)'}}>
                  <img src={img.image_url} alt="" style={{width:36,height:36,objectFit:'contain',borderRadius:6,background:'var(--bg)',flexShrink:0}}
                    onError={e => { e.target.style.opacity = 0.2; }}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:11,color:'var(--text-bright)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{img.caption || '(no caption)'}</div>
                    <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text-dim)'}}>anchor: {img.section_anchor || '—'}</div>
                  </div>
                  <button onClick={() => deleteImage(img.id)}
                    style={{padding:'5px 10px',background:'transparent',border:'1px solid #dc2626',borderRadius:6,color:'#ef4444',fontSize:9,fontWeight:600,cursor:'pointer',fontFamily:'var(--font-mono)'}}>
                    DELETE
                  </button>
                </div>
              ))}

              <div style={{marginTop:12,paddingTop:12,borderTop:'1px solid var(--border)'}}>
                <div style={{fontSize:10,color:'var(--text-dim)',fontFamily:'var(--font-mono)',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:8}}>Upload new image</div>
                <input type="file" accept="image/*" onChange={e => setNewImgFile(e.target.files[0])}
                  style={{fontSize:11,color:'var(--text)',marginBottom:8,display:'block'}}/>
                <input value={newImgCaption} onChange={e=>setNewImgCaption(e.target.value)} placeholder="Caption (optional)"
                  style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:7,fontSize:12,color:'var(--text-bright)',background:'var(--bg)',outline:'none',boxSizing:'border-box',marginBottom:6}}/>
                <input value={newImgAnchor} onChange={e=>setNewImgAnchor(e.target.value)} placeholder="Section anchor — e.g. workspace-setup (optional)"
                  style={{width:'100%',padding:'8px 10px',border:'1px solid var(--border)',borderRadius:7,fontSize:12,color:'var(--text-bright)',background:'var(--bg)',outline:'none',boxSizing:'border-box',marginBottom:8,fontFamily:'var(--font-mono)'}}/>
                <button onClick={uploadImage} disabled={imgUploading}
                  style={{padding:'8px 16px',background:'var(--accent)',border:'none',borderRadius:7,color:'#fff',fontSize:11,fontWeight:700,cursor:imgUploading?'default':'pointer',opacity:imgUploading?0.7:1,fontFamily:'var(--font-mono)'}}>
                  {imgUploading ? 'UPLOADING…' : 'UPLOAD'}
                </button>
              </div>
            </div>
          )}

          <div style={{display:'flex',gap:8}}>
            <button onClick={saveDoc} disabled={docSaving}
              style={{padding:'10px 22px',background:'linear-gradient(135deg, var(--accent), var(--accent2))',border:'none',borderRadius:9,color:'#fff',fontSize:12,fontWeight:700,cursor:docSaving?'default':'pointer',opacity:docSaving?0.7:1,fontFamily:'var(--font-mono)',letterSpacing:'.06em'}}>
              {docSaving ? 'SAVING…' : 'SAVE'}
            </button>
            <button onClick={() => setDocMode('list')}
              style={{padding:'10px 22px',background:'transparent',border:'1px solid var(--border)',borderRadius:9,color:'var(--text-dim)',fontSize:12,fontWeight:600,cursor:'pointer',fontFamily:'var(--font-mono)',letterSpacing:'.06em'}}>
              CANCEL
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{flex:1,overflowY:'auto',padding:14}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div style={{fontWeight:700,color:'var(--text-bright)',fontSize:12}}>All Documents ({docsList.length})</div>
          <button onClick={openNewDoc}
            style={{padding:'7px 14px',background:'var(--accent)',border:'none',borderRadius:8,color:'#fff',fontSize:11,fontWeight:700,cursor:'pointer',fontFamily:'var(--font-mono)',letterSpacing:'.04em'}}>
            + NEW
          </button>
        </div>

        {docsError && (
          <div style={{background:'rgba(220,38,38,.08)',border:'1px solid rgba(220,38,38,.25)',borderRadius:8,padding:'8px 12px',fontSize:11,color:'#ef4444',marginBottom:12}}>
            {docsError}
          </div>
        )}

        {docsLoading ? (
          <div style={{fontSize:12,color:'var(--text-dim)',textAlign:'center',padding:30}}>Loading…</div>
        ) : (
          docsList.map(d => (
            <div key={d.doc_id} style={{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:10,padding:'9px 12px',marginBottom:6,display:'flex',alignItems:'center',gap:10}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:500,color:'var(--text-bright)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.title}</div>
                <div style={{fontFamily:'var(--font-mono)',fontSize:9,color:'var(--text-dim)'}}>{d.doc_id} · {d.product} · {d.category}</div>
              </div>
              <button onClick={() => openEditDoc(d.doc_id)}
                style={{padding:'6px 12px',background:'transparent',border:'1px solid var(--accent)',borderRadius:7,color:'var(--accent)',fontSize:10,fontWeight:600,cursor:'pointer',fontFamily:'var(--font-mono)'}}>
                EDIT
              </button>
              <button onClick={() => deleteDoc(d.doc_id)}
                style={{padding:'6px 12px',background:'transparent',border:'1px solid #dc2626',borderRadius:7,color:'#ef4444',fontSize:10,fontWeight:600,cursor:'pointer',fontFamily:'var(--font-mono)'}}>
                DELETE
              </button>
            </div>
          ))
        )}
      </div>
    );
  };



  // ── Render ────────────────────────────────────────────────────────────────
  const renderTab = () => {
    switch(tab) {
      case 'chat':          return <ChatTab/>;
      case 'tickets':       return <TicketsTab/>;
      case 'profile':       return <ProfileTab/>;
      case 'adm-dashboard': return <AdminDashboard/>;
      case 'adm-tickets':   return <AdminTickets/>;
      case 'adm-agents':    return <AdminAgents/>;
      case 'adm-users':     return <AdminUsers/>;
case 'adm-docs':      return AdminDocs();
case 'adm-ai-insights': return <AdminAIInsights/>;
      default:              return <ChatTab/>;
    }
  };

  return (
    <div style={{flex:1,display:'flex',background:'var(--bg)'}}>
      <style>{`@keyframes tdot{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-5px);opacity:1}}`}</style>
      {!currentUser ? (
<LoginForm onLogin={handleLogin} onRegister={handleRegister}/>      ) : (
        <>
          <Sidebar/>
          <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0}}>
            {renderTab()}
          </div>
        </>
      )}
    </div>
  );
}

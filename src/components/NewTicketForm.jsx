import React, { useState } from 'react';

const labelSt = {
  display: 'block',
  fontSize: 10,
  color: 'var(--text-dim)',
  fontFamily: 'var(--font-mono)',
  letterSpacing: '.1em',
  textTransform: 'uppercase',
  marginBottom: 4
};

const inpSt = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid var(--border)',
  borderRadius: 8,
  fontSize: 13,
  color: 'var(--text-bright)',
  background: 'var(--bg)',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'var(--font)'
};

const selSt = {
  ...inpSt,
  appearance: 'none',
  cursor: 'pointer'
};

const hintSt = {
  marginTop: 6,
  fontSize: 11,
  lineHeight: 1.5,
  color: 'var(--text-dim)'
};

const priorityHints = {
  Low: 'General question, documentation clarification, or small non-blocking request. The user can continue working normally.',
  Normal: 'Standard support issue. The user needs help, but the problem does not stop their main work.',
  High: 'Important workflow problem. The user is partially blocked, work is delayed, or an important feature is not working.',
  Critical: 'Urgent blocker. The system is down, production work is affected, there is possible data loss, or the user cannot work at all.'
};

// Accepts formats like: 7, 7.3, 7.3.1, v7.3
const VERSION_RE = /^v?\d+(\.\d+){0,2}$/i;

export default function NewTicketForm({ onSubmit, onCancel, draft, currentUserName }) {
  const [title, setTitle] = useState(draft?.ticket_title || '');
  const [prod, setProd] = useState(draft?.product || 'CE Pro');
const DEFAULT_VERSIONS = { 'CE Pro': '4.9', 'CE Express': '7.3', 'Inventory3D': '4.6', 'Both': '' };
  const [version, setVersion] = useState(draft?.version || DEFAULT_VERSIONS[draft?.product || 'CE Pro'] || '');  const [cat, setCat] = useState(draft?.issue_type || 'Question');
  const [pri, setPri] = useState(
    draft?.priority_suggestion === 'Medium'
      ? 'Normal'
      : (draft?.priority_suggestion || 'Normal')
  );
  const [user] = useState(draft?.user || currentUserName || 'Unknown User'); // auto-filled, read-only
  const [error, setError] = useState('');
  const [createdAt] = useState(() => new Date().toLocaleString()); // fixed the moment the form opens — read-only

  const defaultDescription = draft
    ? `User question:
${draft.full_question}

Retrieved documents:
${(draft.retrieved_documents || [])
  .map(d => `- ${d.product} ${d.version} | ${d.document} → ${d.section}`)
  .join('\n')}

Conversation context:
${(draft.conversation_context || [])
  .map(c => `${c.role}: ${c.message}`)
  .join('\n')}`
    : '';

  const [desc, setDesc] = useState(defaultDescription);

  const submit = () => {
    if (!title.trim()) { setError('Please enter a subject for the ticket.'); return; }
    if (!version.trim()) { setError('Please enter the product version (e.g. 7.3).'); return; }
    if (!VERSION_RE.test(version.trim())) {
      setError('Version format looks invalid. Use something like "7.3", "4.9.1", or "v7.3".');
      return;
    }
    if (!desc.trim()) { setError('Please add a description.'); return; }

    setError('');

    const finalDescription =
      `Priority selected: ${pri}\n` +
      `Priority meaning: ${priorityHints[pri]}\n\n` +
      desc;

    onSubmit({
      title: title.trim(),
      product: prod,
      version: version.trim(),
      category: cat,
      priority: pri,
      user,
      time: createdAt, // fixed at form open — read-only, never editable by the user
      description: finalDescription
    });
  };

  return (
    <div style={{
      background: 'var(--bg2)',
      border: '1px solid var(--border2)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      boxShadow: 'var(--shadow)'
    }}>
      <div style={{
        fontWeight: 700,
        color: 'var(--text-bright)',
        fontSize: 13,
        marginBottom: 12,
        display: 'flex',
        alignItems: 'center',
        gap: 7
      }}>
        <span style={{ fontSize: 15 }}>✦</span> New Support Ticket
      </div>

      {draft && (
        <div style={{
          marginBottom: 12,
          padding: 10,
          border: '1px solid var(--accent)',
          borderRadius: 9,
          background: 'var(--accent-l)',
          fontSize: 11,
          color: 'var(--text)'
        }}>
          AI prepared this ticket draft. Please review and edit before submitting.
        </div>
      )}

      {error && (
        <div style={{
          marginBottom: 12,
          padding: 10,
          border: '1px solid #dc2626',
          borderRadius: 9,
          background: 'rgba(220,38,38,.08)',
          fontSize: 11,
          color: '#ef4444'
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: 10 }}>
        <label style={labelSt}>Subject</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Brief description of your issue"
          style={inpSt}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9, marginBottom: 10 }}>
        <div>
          <label style={labelSt}>Product</label>
          <select value={prod} onChange={e => setProd(e.target.value)} style={selSt}>
            {['CE Pro', 'CE Express', 'Inventory3D', 'Both'].map(o => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={labelSt}>Version *</label>
          <input
            type="text"
            value={version}
            onChange={e => setVersion(e.target.value)}
            placeholder="e.g. 7.3"
            style={inpSt}
          />
        </div>

        <div>
          <label style={labelSt}>Issue Type</label>
          <input
            type="text"
            value={cat}
            onChange={e => setCat(e.target.value)}
            placeholder="Issue type"
            style={inpSt}
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 9, marginBottom: 10 }}>
        <div>
          <label style={labelSt}>Priority</label>
          <select value={pri} onChange={e => setPri(e.target.value)} style={selSt}>
            <option value="Low">
  Low — Question or documentation clarification; user is not blocked
</option>
<option value="Normal">
  Normal — Standard issue; user needs help but can continue working
</option>
<option value="High">
  High — Important workflow problem; user is partially blocked
</option>
<option value="Critical">
  Critical — System down, production affected, or user cannot work
</option>
          </select>

          <div style={hintSt}>
            {priorityHints[pri]}
          </div>
        </div>

        <div>
          <label style={labelSt}>User</label>
          <input
            type="text"
            value={user}
            disabled
            style={{ ...inpSt, opacity: 0.6, cursor: 'not-allowed' }}
          />
        </div>

        <div>
          <label style={labelSt}>Created</label>
          <input
            type="text"
            value={createdAt}
            disabled
            style={{ ...inpSt, opacity: 0.6, cursor: 'not-allowed' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={labelSt}>Description</label>
        <textarea
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Describe your issue in detail..."
          style={{ ...inpSt, resize: 'vertical', minHeight: 120, lineHeight: 1.5 }}
        />
      </div>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{
            padding: '7px 14px',
            background: 'transparent',
            border: '1px solid var(--border)',
            borderRadius: 7,
            color: 'var(--text-dim)',
            fontSize: 11,
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>

        <button
          onClick={submit}
          style={{
            padding: '7px 16px',
            background: 'var(--accent)',
            border: 'none',
            borderRadius: 7,
            color: '#fff',
            fontSize: 11,
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Submit Ticket
        </button>
      </div>
    </div>
  );
}

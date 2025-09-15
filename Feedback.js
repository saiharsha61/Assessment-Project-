import React, { useState } from 'react';

export default function Feedback({ token, resourceId }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/resources/${resourceId}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating, comment })
      });
      const data = await response.json();
      if (response.ok) {
        setMsg('Feedback submitted!');
        setComment('');
      } else {
        setError(data.msg || 'Failed to submit feedback');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 16 }}>
      <h4 style={{ color: '#fff' }}>Submit Feedback</h4>
      <select value={rating} onChange={e => setRating(e.target.value)} style={{ marginBottom: 8, padding: 6, borderRadius: 4, border: '1px solid #555' }}>
        {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} Star{n>1?'s':''}</option>)}
      </select>
      <br />
      <textarea placeholder="Comment" value={comment} onChange={e => setComment(e.target.value)} style={{ width: '100%', minHeight: 40, marginBottom: 8, padding: 8, borderRadius: 4, border: '1px solid #555' }} />
      <br />
      <button type="submit" style={{ padding: 8, borderRadius: 4, background: '#61dafb', color: '#222', border: 'none', fontWeight: 'bold' }}>Submit</button>
      {msg && <div style={{ color: '#0f0', marginTop: 8 }}>{msg}</div>}
      {error && <div style={{ color: '#f55', marginTop: 8 }}>{error}</div>}
    </form>
  );
}

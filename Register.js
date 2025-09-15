import React, { useState } from 'react';

export default function Register({ onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://localhost:5000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('Registration successful! You can now log in.');
        onRegister && onRegister();
      } else {
        setError(data.msg || 'Registration failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <form onSubmit={handleRegister} style={{ maxWidth: 400, margin: '40px auto', background: '#222', padding: 24, borderRadius: 8 }}>
      <h2 style={{ color: '#fff' }}>Register</h2>
      <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 4, border: '1px solid #555' }} />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 4, border: '1px solid #555' }} />
      <select value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 4, border: '1px solid #555' }}>
        <option value="student">Student</option>
        <option value="admin">Admin</option>
      </select>
      <button type="submit" style={{ width: '100%', padding: 10, borderRadius: 4, background: '#61dafb', color: '#222', border: 'none', fontWeight: 'bold' }}>Register</button>
      {success && <div style={{ color: '#0f0', marginTop: 12 }}>{success}</div>}
      {error && <div style={{ color: '#f55', marginTop: 12 }}>{error}</div>}
    </form>
  );
}
  

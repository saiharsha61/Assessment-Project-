import React, { useState } from 'react';

export default function ResourceUpload({ token, onUpload }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    if (!file) {
      setError('Please select a file.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tags', tags);
    try {
      const response = await fetch('http://localhost:5000/resources/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        setMsg('Resource uploaded successfully!');
        setTitle(''); setDescription(''); setTags(''); setFile(null);
        onUpload && onUpload();
      } else {
        setError(data.msg || 'Upload failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '40px auto', background: '#222', padding: 24, borderRadius: 8 }}>
      <h2 style={{ color: '#fff' }}>Upload Resource</h2>
      <input type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} required style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 4, border: '1px solid #555' }} />
      <input type="text" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 4, border: '1px solid #555' }} />
      <input type="text" placeholder="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} style={{ width: '100%', marginBottom: 12, padding: 8, borderRadius: 4, border: '1px solid #555' }} />
      <input type="file" onChange={e => setFile(e.target.files[0])} style={{ width: '100%', marginBottom: 12, color: '#fff' }} />
      <button type="submit" style={{ width: '100%', padding: 10, borderRadius: 4, background: '#61dafb', color: '#222', border: 'none', fontWeight: 'bold' }}>Upload</button>
      {msg && <div style={{ color: '#0f0', marginTop: 12 }}>{msg}</div>}
      {error && <div style={{ color: '#f55', marginTop: 12 }}>{error}</div>}
    </form>
  );
}

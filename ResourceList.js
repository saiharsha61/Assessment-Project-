import React, { useEffect, useState } from 'react';

export default function ResourceList({ token, onSelect }) {
  const [resources, setResources] = useState([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line
  }, []);

  const fetchResources = async (query = '') => {
    setError('');
    try {
      let url = 'http://localhost:5000/resources';
      if (query) url += `?tag=${encodeURIComponent(query)}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setResources(data);
      } else {
        setError(data.msg || 'Failed to fetch resources');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchResources(search);
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', background: '#222', padding: 24, borderRadius: 8 }}>
      <h2 style={{ color: '#fff' }}>Resources</h2>
      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <input type="text" placeholder="Search by tag/subject/semester" value={search} onChange={e => setSearch(e.target.value)} style={{ width: '70%', padding: 8, borderRadius: 4, border: '1px solid #555', marginRight: 8 }} />
        <button type="submit" style={{ padding: 8, borderRadius: 4, background: '#61dafb', color: '#222', border: 'none', fontWeight: 'bold' }}>Search</button>
      </form>
      {error && <div style={{ color: '#f55', marginBottom: 12 }}>{error}</div>}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {resources.map(r => (
          <li key={r.id} style={{ background: '#333', marginBottom: 10, padding: 12, borderRadius: 6 }}>
            <strong>{r.title}</strong> <span style={{ color: '#aaa' }}>({r.tags.join(', ')})</span><br />
            <span style={{ color: '#ccc' }}>{r.description}</span><br />
            <span style={{ color: '#aaa' }}>Downloads: {r.downloads}</span>
            <button onClick={() => onSelect && onSelect(r)} style={{ marginLeft: 16, padding: '4px 12px', borderRadius: 4, background: '#61dafb', color: '#222', border: 'none', fontWeight: 'bold' }}>Details</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

import React, { useEffect, useState } from 'react';

export default function Dashboard({ token }) {
  const [topRated, setTopRated] = useState([]);
  const [mostDownloaded, setMostDownloaded] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData('dashboard/top-rated', setTopRated);
    fetchData('dashboard/most-downloaded', setMostDownloaded);
    fetchData('dashboard/recommendations', setRecommendations);
    // eslint-disable-next-line
  }, []);

  const fetchData = async (endpoint, setter) => {
    setError('');
    try {
      const response = await fetch(`http://localhost:5000/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setter(data);
      } else {
        setError(data.msg || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', background: '#222', padding: 24, borderRadius: 8, color: '#fff' }}>
      <h2>Smart Dashboard</h2>
      {error && <div style={{ color: '#f55', marginBottom: 12 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <h4>Top Rated</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {topRated.map(r => <li key={r.id}>{r.title} ({r.avg_rating}★)</li>)}
          </ul>
        </div>
        <div style={{ flex: 1 }}>
          <h4>Most Downloaded</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {mostDownloaded.map(r => <li key={r.id}>{r.title} ({r.downloads} downloads)</li>)}
          </ul>
        </div>
        <div style={{ flex: 1 }}>
          <h4>Recommendations</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {recommendations.map(r => <li key={r.id}>{r.title} ({r.tags.join(', ')})</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
  

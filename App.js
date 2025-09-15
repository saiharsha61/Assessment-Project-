  import React, { useState } from 'react';
  import Login from './components/Login';
  import Register from './components/Register';
  import ResourceUpload from './components/ResourceUpload';
  import ResourceList from './components/ResourceList';
  import Feedback from './components/Feedback';
  import Dashboard from './components/Dashboard';

  function App() {
    const [token, setToken] = useState('');
    const [role, setRole] = useState('');
    const [page, setPage] = useState('login');
    const [selectedResource, setSelectedResource] = useState(null);

    const handleLogin = (jwt, userRole) => {
      setToken(jwt);
      setRole(userRole);
      setPage('dashboard');
    };
    const handleLogout = () => {
      setToken('');
      setRole('');
      setPage('login');
    };

    return (
      <div style={{ minHeight: '100vh', background: '#181c2f' }}>
        <nav style={{ display: 'flex', gap: 16, padding: 16, background: '#222', color: '#fff' }}>
          {token ? (
            <>
              <button onClick={() => setPage('dashboard')}>Dashboard</button>
              <button onClick={() => setPage('resources')}>Resources</button>
              <button onClick={() => setPage('upload')}>Upload</button>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => setPage('login')}>Login</button>
              <button onClick={() => setPage('register')}>Register</button>
            </>
          )}
        </nav>
        {page === 'login' && <Login onLogin={handleLogin} />}
        {page === 'register' && <Register onRegister={() => setPage('login')} />}
        {page === 'dashboard' && token && <Dashboard token={token} />}
        {page === 'upload' && token && <ResourceUpload token={token} />}
        {page === 'resources' && token && (
          <ResourceList token={token} onSelect={setSelectedResource} />
        )}
        {selectedResource && token && (
          <div style={{ maxWidth: 700, margin: '40px auto', background: '#222', padding: 24, borderRadius: 8, color: '#fff' }}>
            <h3>{selectedResource.title}</h3>
            <p>{selectedResource.description}</p>
            <p>Tags: {selectedResource.tags.join(', ')}</p>
            <a href={`http://localhost:5000/resources/${selectedResource.id}/download`} target="_blank" rel="noopener noreferrer">
              <button style={{ padding: 8, borderRadius: 4, background: '#61dafb', color: '#222', border: 'none', fontWeight: 'bold' }}>Download</button>
            </a>
            <Feedback token={token} resourceId={selectedResource.id} />
            <button onClick={() => setSelectedResource(null)} style={{ marginTop: 16 }}>Back to List</button>
          </div>
        )}
      </div>
    );
  }

  export default App;

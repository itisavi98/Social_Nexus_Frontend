import React, { useState, useEffect } from 'react';
import { API } from '../context/AuthContext';
import toast from 'react-hot-toast';
import '../styles/Connections.css'; // we'll create this

const Connections = () => {
  const [connections, setConnections] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('connections');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConnections();

    const onUpdated = () => fetchConnections();
    window.addEventListener('connectionsUpdated', onUpdated);
    return () => window.removeEventListener('connectionsUpdated', onUpdated);
  }, []);

  const fetchConnections = async () => {
    try {
      const [connRes, reqRes] = await Promise.all([
        API.get('/connections/my-connections'),
        API.get('/connections/requests')
      ]);
      setConnections(connRes.data);
      setRequests(reqRes.data);
    } catch (err) {
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (connectionId) => {
    try {
      const res = await API.post(`/connections/accept/${connectionId}`);
      toast.success('Connection accepted');

      // If backend returned the new connection and user info, update UI immediately
      const { connection, user } = res.data || {};
      if (connection && user) {
        const newConn = {
          connection_id: connection.connection_id,
          connected_user_id: user.user_id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          photo: user.photo,
          bio: user.bio
        };
        setConnections(prev => [newConn, ...prev]);
        setRequests(prev => prev.filter(r => r.connection_id !== connectionId));
        setActiveTab('connections');
        // notify other components/pages to refresh their connections list
        window.dispatchEvent(new Event('connectionsUpdated'));
        return;
      }

      // fallback: refetch lists
      fetchConnections();
      window.dispatchEvent(new Event('connectionsUpdated'));
    } catch (err) {
      toast.error('Failed to accept request');
    }
  };

  const handleReject = async (connectionId) => {
    try {
      await API.delete(`/connections/reject/${connectionId}`);
      toast.success('Request rejected');
      fetchConnections();
      window.dispatchEvent(new Event('connectionsUpdated'));
    } catch (err) {
      toast.error('Failed to reject request');
    }
  };

  const handleRemove = async (userId) => {
    if (window.confirm('Remove this connection?')) {
      try {
        await API.delete(`/connections/remove/${userId}`);
        toast.success('Connection removed');
        fetchConnections();
        window.dispatchEvent(new Event('connectionsUpdated'));
      } catch (err) {
        toast.error('Failed to remove connection');
      }
    }
  };

  if (loading) {
    return (
      <div className="feed-container">
        <div className="loading-screen" style={{ height: '50vh' }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="feed-container">
      <div className="page-header">
        <h2>Connections</h2>
        <p>Manage your network and connections</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab-btn ${activeTab === 'connections' ? 'active' : ''}`}
          onClick={() => setActiveTab('connections')}
        >
          Connections ({connections.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Requests ({requests.length})
        </button>
      </div>

      {activeTab === 'connections' && (
        <div className="connections-list">
          {connections.length === 0 ? (
            <div className="empty-state">
              <h3>No connections yet</h3>
              <p>Start connecting with other users to build your network</p>
            </div>
          ) : (
            connections.map(conn => (
              <div key={conn.connection_id} className="connection-card">
                <img 
                  src={conn.photo || 'https://via.placeholder.com/60'} 
                  alt={conn.username}
                  className="connection-avatar"
                />
                <div className="connection-info">
                  <h4>{conn.first_name} {conn.last_name}</h4>
                  <p className="username">@{conn.username}</p>
                  <p className="bio">{conn.bio}</p>
                </div>
                <button 
                  className="btn-danger"
                  onClick={() => handleRemove(conn.connected_user_id)}
                >
                  Remove
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="requests-list">
          {requests.length === 0 ? (
            <div className="empty-state">
              <h3>No pending requests</h3>
              <p>You're all caught up!</p>
            </div>
          ) : (
            requests.map(req => (
              <div key={req.connection_id} className="request-card">
                <img 
                  src={req.photo || 'https://via.placeholder.com/60'} 
                  alt={req.username}
                  className="connection-avatar"
                />
                <div className="connection-info">
                  <h4>{req.first_name} {req.last_name}</h4>
                  <p className="username">@{req.username}</p>
                </div>
                <div className="request-actions">
                  <button 
                    className="btn-primary"
                    onClick={() => handleAccept(req.connection_id)}
                  >
                    Accept
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={() => handleReject(req.connection_id)}
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Connections;

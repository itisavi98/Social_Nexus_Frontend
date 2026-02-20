import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth, API } from '../context/AuthContext';
import { FiHome, FiBookmark, FiUser, FiLogOut, FiSearch, FiUsers } from 'react-icons/fi';
import { RiRocketLine } from 'react-icons/ri';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const handleLogout = () => { logout(); navigate('/login'); };

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        try {
          const { data } = await API.get(`/users/search/${searchQuery}`);
          setSearchResults(data);
          setShowResults(true);
        } catch {}
      } else {
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = user?.username?.[0]?.toUpperCase() || '?';

  return (
    <div className="layout">
      <div className="sidebar">
        <div className="sidebar-logo"><RiRocketLine style={{display:'inline',marginRight:'8px'}} />NEXUS</div>

        <NavLink to="/feed" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <FiHome /> Feed
        </NavLink>

        <NavLink to="/connections" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <FiUsers /> Connections
        </NavLink>

        <NavLink to={`/profile/${user?.user_id}`} className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <FiUser /> Profile
        </NavLink>

        <NavLink to="/watchlist" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <FiBookmark /> Watchlist
        </NavLink>

        <div style={{ marginTop: 'auto' }}>
          <div className="sidebar-user">
            <div className="avatar" style={{ width: 38, height: 38 }}>{initials}</div>
            <div className="sidebar-user-info">
              <strong>{user?.username}</strong>
              <span>@{user?.username}</span>
            </div>
            <button className="btn-ghost btn" onClick={handleLogout} title="Logout">
              <FiLogOut />
            </button>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="search-bar" ref={searchRef}>
          <div className="search-input-wrap">
            <FiSearch />
            <input
              placeholder="Search users..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onFocus={() => searchResults.length > 0 && setShowResults(true)}
            />
          </div>
          {showResults && searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map(u => (
                <div key={u.user_id} className="search-result-item"
                  onClick={() => { navigate(`/profile/${u.user_id}`); setShowResults(false); setSearchQuery(''); }}>
                  <div className="avatar" style={{width:32, height:32, fontSize:'0.8rem'}}>
                    {u.photo ? <img src={u.photo} alt="" /> : u.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="name">{u.first_name} {u.last_name}</div>
                    <div className="handle">@{u.username}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Outlet />
      </div>
    </div>
  );
};

export default Layout;

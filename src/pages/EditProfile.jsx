import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, API } from '../context/AuthContext';
import toast from 'react-hot-toast';

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get('tab') || 'profile';

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  const [profile, setProfile] = useState({ bio: '', core_level: '', knowledge_today: '', first_name: '', last_name: '', phone_no: '', age: '', photo: '' });
  const [edu, setEdu] = useState({ virtual_gpa: '', virtual_course: '', cgpa: '', university_name: '', ssc_name: '', ssc_marks: '', hsc_name: '', hsc_marks: '' });
  const [cert, setCert] = useState({ certification_name: '', certificate_url: '', certificate_img: '' });

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await API.get(`/users/${user.user_id}`);
        setProfile({
          bio: data.bio || '', core_level: data.core_level || '',
          knowledge_today: data.knowledge_today || '', first_name: data.first_name || '',
          last_name: data.last_name || '', phone_no: data.phone_no || '',
          age: data.age || '', photo: data.photo || ''
        });
        if (data.education) {
          setEdu({
            virtual_gpa: data.education.virtual_gpa || '', virtual_course: data.education.virtual_course || '',
            cgpa: data.education.cgpa || '', university_name: data.education.university_name || '',
            ssc_name: data.education.ssc_name || '', ssc_marks: data.education.ssc_marks || '',
            hsc_name: data.education.hsc_name || '', hsc_marks: data.education.hsc_marks || ''
          });
        }
      } catch {}
      finally { setFetchLoading(false); }
    };
    fetch();
  }, [user]);

  const saveProfile = async () => {
    setLoading(true);
    try {
      await API.put('/users/profile/update', profile);
      toast.success('Profile updated!');
      navigate(`/profile/${user.user_id}`);
    } catch { toast.error('Failed to update'); }
    finally { setLoading(false); }
  };

  const saveEducation = async () => {
    setLoading(true);
    try {
      await API.post('/users/education', edu);
      toast.success('Education updated!');
    } catch { toast.error('Failed to update education'); }
    finally { setLoading(false); }
  };

  const addCert = async () => {
    if (!cert.certification_name) return toast.error('Certification name required');
    setLoading(true);
    try {
      await API.post('/users/certifications', cert);
      toast.success('Certification added!');
      setCert({ certification_name: '', certificate_url: '', certificate_img: '' });
    } catch { toast.error('Failed to add cert'); }
    finally { setLoading(false); }
  };

  const setP = k => e => setProfile({...profile, [k]: e.target.value});
  const setE = k => e => setEdu({...edu, [k]: e.target.value});
  const setC = k => e => setCert({...cert, [k]: e.target.value});

  if (fetchLoading) return <div className="feed-container"><div className="loading-screen" style={{height:'50vh'}}><div className="spinner"></div></div></div>;

  return (
    <div className="feed-container">
      <div className="page-header">
        <h2>Edit Profile</h2>
        <p>Update your information</p>
      </div>

      <div className="tabs" style={{marginBottom:'1.5rem'}}>
        <button className={`tab ${activeTab==='profile'?'active':''}`} onClick={()=>setActiveTab('profile')}>Profile</button>
        <button className={`tab ${activeTab==='education'?'active':''}`} onClick={()=>setActiveTab('education')}>Education</button>
        <button className={`tab ${activeTab==='cert'?'active':''}`} onClick={()=>setActiveTab('cert')}>Add Certification</button>
      </div>

      {activeTab === 'profile' && (
        <div className="info-card">
          <div className="two-col">
            <div className="form-group">
              <label>First Name</label>
              <input value={profile.first_name} onChange={setP('first_name')} placeholder="First name" />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input value={profile.last_name} onChange={setP('last_name')} placeholder="Last name" />
            </div>
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea value={profile.bio} onChange={setP('bio')} placeholder="Tell the world about yourself..." rows={3} />
          </div>
          <div className="two-col">
            <div className="form-group">
              <label>Core Level</label>
              <select value={profile.core_level} onChange={setP('core_level')}>
                <option value="">Select level</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option>Expert</option>
              </select>
            </div>
            <div className="form-group">
              <label>Age</label>
              <input type="number" value={profile.age} onChange={setP('age')} placeholder="Your age" />
            </div>
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={profile.phone_no} onChange={setP('phone_no')} placeholder="+1 234 567 890" />
          </div>
          <div className="form-group">
            <label>Photo URL</label>
            <input value={profile.photo} onChange={setP('photo')} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label>Today's Learning</label>
            <textarea value={profile.knowledge_today} onChange={setP('knowledge_today')} placeholder="What did you learn today?" rows={2} />
          </div>
          <button className="btn btn-primary" onClick={saveProfile} disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      )}

      {activeTab === 'education' && (
        <div className="info-card">
          <div className="two-col">
            <div className="form-group">
              <label>University Name</label>
              <input value={edu.university_name} onChange={setE('university_name')} placeholder="MIT, Harvard..." />
            </div>
            <div className="form-group">
              <label>CGPA</label>
              <input type="number" step="0.01" value={edu.cgpa} onChange={setE('cgpa')} placeholder="3.8" />
            </div>
          </div>
          <div className="two-col">
            <div className="form-group">
              <label>Course / Major</label>
              <input value={edu.virtual_course} onChange={setE('virtual_course')} placeholder="Computer Science" />
            </div>
            <div className="form-group">
              <label>Virtual GPA</label>
              <input type="number" step="0.01" value={edu.virtual_gpa} onChange={setE('virtual_gpa')} placeholder="4.0" />
            </div>
          </div>
          <div className="divider" />
          <div className="two-col">
            <div className="form-group">
              <label>HSC / 12th School</label>
              <input value={edu.hsc_name} onChange={setE('hsc_name')} placeholder="School name" />
            </div>
            <div className="form-group">
              <label>HSC Marks (%)</label>
              <input type="number" step="0.01" value={edu.hsc_marks} onChange={setE('hsc_marks')} placeholder="92.5" />
            </div>
          </div>
          <div className="two-col">
            <div className="form-group">
              <label>SSC / 10th School</label>
              <input value={edu.ssc_name} onChange={setE('ssc_name')} placeholder="School name" />
            </div>
            <div className="form-group">
              <label>SSC Marks (%)</label>
              <input type="number" step="0.01" value={edu.ssc_marks} onChange={setE('ssc_marks')} placeholder="95.0" />
            </div>
          </div>
          <button className="btn btn-primary" onClick={saveEducation} disabled={loading}>
            {loading ? 'Saving...' : 'Save Education'}
          </button>
        </div>
      )}

      {activeTab === 'cert' && (
        <div className="info-card">
          <div className="form-group">
            <label>Certification Name</label>
            <input value={cert.certification_name} onChange={setC('certification_name')} placeholder="AWS Solutions Architect, Google ML..." />
          </div>
          <div className="form-group">
            <label>Certificate URL</label>
            <input value={cert.certificate_url} onChange={setC('certificate_url')} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label>Certificate Image URL</label>
            <input value={cert.certificate_img} onChange={setC('certificate_img')} placeholder="https://..." />
          </div>
          <button className="btn btn-primary" onClick={addCert} disabled={loading}>
            {loading ? 'Adding...' : 'Add Certification'}
          </button>
        </div>
      )}
    </div>
  );
};

export default EditProfile;

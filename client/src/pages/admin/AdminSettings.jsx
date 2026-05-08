import { useState, useEffect } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineUser, HiOutlineLockClosed, HiOutlineUserGroup, HiOutlineMail } from 'react-icons/hi';

const AdminSettings = () => {
  const { user, updateProfile } = useAuth();

  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  const [admins, setAdmins] = useState([]);
  const [invite, setInvite] = useState({ name: '', email: '' });
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    api.get('/auth/admins')
      .then(r => setAdmins(r.data.data.admins))
      .catch(() => {});
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) return toast.error('Name is required');
    setSavingProfile(true);
    try {
      await updateProfile(profile);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error('Passwords do not match');
    if (passwords.newPassword.length < 8) return toast.error('Password must be at least 8 characters');
    setSavingPassword(true);
    try {
      await api.put('/auth/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password changed');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.message || 'Password change failed');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!invite.name.trim() || !invite.email.trim()) return toast.error('Name and email are required');
    setInviting(true);
    try {
      await api.post('/auth/invite-admin', invite);
      toast.success(`Invite sent to ${invite.email}`);
      setInvite({ name: '', email: '' });
      const r = await api.get('/auth/admins');
      setAdmins(r.data.data.admins);
    } catch (err) {
      toast.error(err.message || 'Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-primary-800 font-serif">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your admin account</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl shadow-tea border border-primary-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <HiOutlineUser className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-primary-800 font-serif">Profile</h2>
        </div>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={e => setProfile({ ...profile, name: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={user?.email || ''} disabled className="input-field opacity-60 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={e => setProfile({ ...profile, phone: e.target.value })}
              placeholder="+254 700 000 000"
              className="input-field"
            />
          </div>
          <button type="submit" disabled={savingProfile} className="btn-primary">
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl shadow-tea border border-primary-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <HiOutlineLockClosed className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-primary-800 font-serif">Change Password</h2>
        </div>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={passwords.confirmPassword}
              onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              className="input-field"
              required
            />
          </div>
          <button type="submit" disabled={savingPassword} className="btn-primary">
            {savingPassword ? 'Saving...' : 'Change Password'}
          </button>
        </form>
      </div>
      {/* Admin Team */}
      <div className="bg-white rounded-2xl shadow-tea border border-primary-100 p-6">
        <div className="flex items-center gap-2 mb-5">
          <HiOutlineUserGroup className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-primary-800 font-serif">Admin Team</h2>
        </div>

        {/* Current admins */}
        <div className="space-y-2 mb-6">
          {admins.map(a => (
            <div key={a._id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-800">{a.name}</p>
                <p className="text-xs text-gray-400">{a.email}</p>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(a.createdAt).toLocaleDateString('en-KE', { dateStyle: 'medium' })}
              </span>
            </div>
          ))}
          {admins.length === 0 && <p className="text-sm text-gray-400">No admins found.</p>}
        </div>

        {/* Invite form */}
        <div className="border-t border-gray-100 pt-5">
          <div className="flex items-center gap-2 mb-4">
            <HiOutlineMail className="w-4 h-4 text-primary-600" />
            <h3 className="text-sm font-semibold text-gray-700">Invite New Admin</h3>
          </div>
          <form onSubmit={handleInvite} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={invite.name}
                  onChange={e => setInvite({ ...invite, name: e.target.value })}
                  placeholder="Jane Mwangi"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={invite.email}
                  onChange={e => setInvite({ ...invite, email: e.target.value })}
                  placeholder="jane@chaiheritage.com"
                  className="input-field"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-gray-400">
              A temporary password will be generated and emailed to them. They should change it after first login.
            </p>
            <button type="submit" disabled={inviting} className="btn-primary">
              {inviting ? 'Sending invite...' : 'Send Invite'}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};

export default AdminSettings;

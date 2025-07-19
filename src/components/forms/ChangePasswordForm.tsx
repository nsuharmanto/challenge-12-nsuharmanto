import { useState } from 'react';

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://blogger-wph-api-production.up.railway.app/users/password', {
        method: 'PATCH', // PATCH sesuai Swagger
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });
      if (res.ok) {
        setSuccess('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to update password.');
      }
    } catch {
      setError('Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ open }: { open: boolean }) => (
    <svg
      className="w-5 h-5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      {open ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12zm11 3a3 3 0 100-6 3 3 0 000 6z"
        />
      ) : (
        <>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.875 18.825A10.05 10.05 0 0112 19c-7 0-11-7-11-7a21.8 21.8 0 014.22-5.94M9.88 9.88A3 3 0 0112 9c1.657 0 3 1.343 3 3 0 .512-.13.995-.36 1.41"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 15l6 6M3 3l18 18"
          />
        </>
      )}
    </svg>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="w-[538px] mt-8 space-y-5 bg-white ml-0"
      autoComplete="off"
    >
      <div>
        <label className="block text-sm font-medium mb-1 w-[538px]">Current Password</label>
        <div className="relative w-[538px]">
          <input
            type={showCurrent ? 'text' : 'password'}
            className="w-[538px] h-12 border border-neutral-300 rounded-[12px] px-3 py-2 text-sm focus:ring-0 focus:outline-none focus:border-blue-400 pr-10"
            placeholder="Enter current password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            onClick={() => setShowCurrent(v => !v)}
          >
            <EyeIcon open={showCurrent} />
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 w-[538px]">New Password</label>
        <div className="relative w-[538px]">
          <input
            type={showNew ? 'text' : 'password'}
            className="w-[538px] h-12 border border-neutral-300 rounded-[12px] px-3 py-2 text-sm focus:ring-0 focus:outline-none focus:border-blue-400 pr-10"
            placeholder="Enter new password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            onClick={() => setShowNew(v => !v)}
          >
            <EyeIcon open={showNew} />
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1 w-[538px]">Confirm New Password</label>
        <div className="relative w-[538px]">
          <input
            type={showConfirm ? 'text' : 'password'}
            className="w-[538px] h-12 border border-neutral-300 rounded-[12px] px-3 py-2 text-sm focus:ring-0 focus:outline-none focus:border-blue-400 pr-10"
            placeholder="Enter confirm new password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            tabIndex={-1}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            onClick={() => setShowConfirm(v => !v)}
          >
            <EyeIcon open={showConfirm} />
          </button>
        </div>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {success && <div className="text-green-600 text-sm">{success}</div>}
      <button
        type="submit"
        disabled={loading}
        className="w-[538px] h-11 bg-[#0093DD] text-white py-2 rounded-full font-semibold text-base hover:bg-blue-500 transition disabled:opacity-60 cursor-pointer"
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}
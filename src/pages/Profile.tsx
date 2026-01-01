import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Seo } from '../components/Seo';
import type { ProfileMetadata, UserRole } from '../types';

interface ProfileProps {
  isDark: boolean;
}

const parseSkills = (value: string) => {
  return value
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
};

export function Profile({ isDark }: ProfileProps) {
  const { user, profile, updateProfile } = useAuth();
  const [role, setRole] = useState<UserRole | ''>('');
  const [skillsInput, setSkillsInput] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const roleLocked = Boolean(profile.role);

  useEffect(() => {
    setRole(profile.role ?? '');
    setSkillsInput((profile.skills ?? []).join(', '));
    setLocation(profile.location ?? '');
  }, [profile.role, profile.skills, profile.location]);

  const previewSkills = useMemo(() => parseSkills(skillsInput), [skillsInput]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('idle');
    setMessage('');

    const updates: ProfileMetadata = {
      skills: parseSkills(skillsInput),
      location: location.trim() ? location.trim() : null,
    };

    if (!roleLocked && role) {
      updates.role = role;
    }

    const { error } = await updateProfile(updates);

    if (error) {
      setStatus('error');
      setMessage(error.message);
    } else {
      setStatus('success');
      setMessage('Profile updated successfully.');
    }

    setLoading(false);
  };

  return (
    <main className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-white'} transition-colors duration-300 flex items-center justify-center px-4 py-12`}>
      <Seo title="Profile | Shift Sorted" description="Update your role, skills, and default location." />
      <div className={`w-full max-w-2xl p-8 rounded-lg border transition-colors ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Profile</h1>
        <p className={`mb-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Update your role, skills, and default location to improve matching.
        </p>

        {status === 'error' && (
          <div className="mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg text-red-600 text-sm">
            {message}
          </div>
        )}

        {status === 'success' && (
          <div className="mb-6 p-4 bg-green-500 bg-opacity-10 border border-green-500 rounded-lg text-green-600 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Email
            </label>
            <div className={`px-4 py-2 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
              {user?.email ?? 'Unknown'}
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              disabled={roleLocked}
            >
              <option value="">Select role</option>
              <option value="worker">Worker</option>
              <option value="manager">Manager</option>
            </select>
            {roleLocked && (
              <p className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Role changes are locked after selection. Contact support to update.
              </p>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Skills (comma separated)
            </label>
            <input
              type="text"
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              placeholder="Forklift, heavy lifting, customer service"
            />
            {previewSkills.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {previewSkills.map((skill) => (
                  <span
                    key={skill}
                    className={`px-3 py-1 text-xs rounded-full ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Default location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
              placeholder="City or coordinates (37.7749,-122.4194)"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all transform hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? 'Saving...' : 'Save profile'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/dashboard" className="text-blue-500 hover:text-blue-600 font-semibold">
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}

import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Seo } from '../components/Seo';
import { useAuth } from '../lib/auth';
import { createShift } from '../lib/shifts';

interface PostShiftProps {
  isDark: boolean;
}

const parseSkills = (value: string) => {
  return value
    .split(',')
    .map((skill) => skill.trim())
    .filter(Boolean);
};

const parseCoordinates = (value: string) => {
  const cleaned = value.replace(/\s+/g, '');
  const [latRaw, lonRaw] = cleaned.split(',');
  if (!latRaw || !lonRaw) return null;

  const lat = Number(latRaw);
  const lon = Number(lonRaw);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;

  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;

  return `SRID=4326;POINT(${lon} ${lat})`;
};

export function PostShift({ isDark }: PostShiftProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const skills = useMemo(() => parseSkills(skillsInput), [skillsInput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!user?.id) {
      setError('You must be signed in to post a shift.');
      return;
    }

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    if (!startTime || !endTime) {
      setError('Start and end times are required.');
      return;
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      setError('End time must be after start time.');
      return;
    }

    const location = locationInput.trim() ? parseCoordinates(locationInput) : null;
    if (locationInput.trim() && !location) {
      setError('Location must be "lat, lon" (example: 37.7749, -122.4194).');
      return;
    }

    setLoading(true);
    const { error: createError } = await createShift({
      manager_id: user.id,
      title: title.trim(),
      description: description.trim() ? description.trim() : null,
      required_skills: skills,
      location,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      status: 'open',
    });

    if (createError) {
      setError(createError.message);
    } else {
      setSuccess(true);
      setTitle('');
      setDescription('');
      setSkillsInput('');
      setLocationInput('');
      setStartTime('');
      setEndTime('');
      setTimeout(() => {
        navigate('/dashboard');
      }, 800);
    }

    setLoading(false);
  };

  return (
    <main className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-white'} transition-colors duration-300 px-4 py-12`}>
      <Seo title="Post Shift | Shift Sorted" description="Create a new shift and find the best matches fast." />
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Post a Shift</h1>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Add shift details and publish it to qualified workers.
            </p>
          </div>
          <Link to="/dashboard" className="text-blue-500 hover:text-blue-600 font-semibold">
            Back to dashboard
          </Link>
        </div>

        <div className={`border rounded-lg p-8 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
          {error && (
            <div className="mb-6 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-500 bg-opacity-10 border border-green-500 rounded-lg text-green-600 text-sm">
              Shift created. Redirecting to dashboard...
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="Shift title"
                required
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="Describe the shift and requirements"
                rows={4}
              />
            </div>

            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Required skills (comma separated)
              </label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="Forklift, heavy lifting, customer service"
              />
              {skills.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.map((skill) => (
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
                Location (lat, lon)
              </label>
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                placeholder="37.7749, -122.4194"
              />
              <p className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                Enter latitude and longitude so we can match nearby workers.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Start time
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  End time
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className={`w-full px-4 py-2 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? 'Posting shift...' : 'Post shift'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

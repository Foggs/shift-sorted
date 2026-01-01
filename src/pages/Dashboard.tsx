import { useEffect, useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import type { Shift } from '../lib/shifts';
import { claimShift, fetchManagerShifts, fetchOpenShifts, subscribeToShiftClaims, subscribeToShifts } from '../lib/shifts';

interface DashboardProps {
  isDark: boolean;
}

export function Dashboard({ isDark }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [shiftsLoading, setShiftsLoading] = useState(true);
  const [shiftsError, setShiftsError] = useState('');
  const [focusedShiftId, setFocusedShiftId] = useState<string | null>(null);
  const [claimingShiftId, setClaimingShiftId] = useState<string | null>(null);
  const [claimMessage, setClaimMessage] = useState('');
  const navigate = useNavigate();
  const { user, profile, loading, signOut } = useAuth();

  useEffect(() => {
    if (!profile.role || !user?.id) {
      setShifts([]);
      setShiftsLoading(false);
      return;
    }

    let isMounted = true;

    const loadShifts = async () => {
      setShiftsLoading(true);
      setShiftsError('');
      const response = profile.role === 'manager'
        ? await fetchManagerShifts(user.id)
        : await fetchOpenShifts();

      if (!isMounted) return;

      if (response.error) {
        setShiftsError(response.error.message);
        setShifts([]);
      } else {
        setShifts(response.data ?? []);
      }

      setShiftsLoading(false);
    };

    loadShifts();

    const shiftsChannel = subscribeToShifts(() => {
      loadShifts();
    });

    const claimsChannel = subscribeToShiftClaims(() => {
      loadShifts();
    });

    return () => {
      isMounted = false;
      shiftsChannel.unsubscribe();
      claimsChannel.unsubscribe();
    };
  }, [profile.role, user?.id]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleClaim = async (shiftId: string) => {
    if (!user?.id) {
      setClaimMessage('You must be signed in to claim a shift.');
      return;
    }

    setClaimingShiftId(shiftId);
    setClaimMessage('');
    const { error } = await claimShift(shiftId, user.id);
    if (error) {
      setClaimMessage(error.message);
    } else {
      setClaimMessage('Shift claimed. Check your dashboard for updates.');
      setShifts((prev) => prev.filter((shift) => shift.id !== shiftId));
    }
    setClaimingShiftId(null);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'} transition-colors duration-300`}>
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-r transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && (
            <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Menu</h2>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <NavItem isDark={isDark} icon="📊" label="Overview" href="#" open={sidebarOpen} />
          <NavItem isDark={isDark} icon="📋" label={profile.role === 'manager' ? 'My Shifts' : 'Available Shifts'} href="#" open={sidebarOpen} />
          <NavItem isDark={isDark} icon="⚙️" label="Settings" href="#" open={sidebarOpen} />
        </nav>

        <button
          onClick={handleLogout}
          className={`m-4 p-3 rounded-lg flex items-center gap-3 transition-colors ${isDark ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'}`}
        >
          <LogOut size={20} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <div className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border-b px-8 py-4`}>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Welcome{user?.email ? `, ${user.email}` : ''}!
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {profile.role === 'manager' ? 'Manage your shifts and find coverage' : 'Find and claim nearby shifts'}
          </p>
        </div>

        <div className="flex-1 overflow-auto p-8">
          {!profile.role && (
            <div className={`mb-6 border rounded-lg p-4 ${isDark ? 'bg-yellow-500/10 border-yellow-600 text-yellow-300' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
              Complete your profile to unlock role-specific features.
            </div>
          )}
          <div className={`${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} border rounded-lg p-8`}>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h2 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {profile.role === 'manager' ? 'Your Shifts' : 'Open Shifts'}
                </h2>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {profile.role === 'manager'
                    ? 'Track your posted shifts and their current status.'
                    : 'Browse open shifts and watch for live updates.'}
                </p>
              </div>
              {profile.role === 'manager' && (
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    to="/post-shift"
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                  >
                    Post new shift
                  </Link>
                  <span className={`text-xs uppercase tracking-wide px-3 py-2 rounded-lg ${isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                    Matching coming soon
                  </span>
                </div>
              )}
            </div>

            {shiftsLoading && (
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                Loading shifts...
              </div>
            )}

            {shiftsError && (
              <div className="mb-4 p-4 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg text-red-600 text-sm">
                {shiftsError}
              </div>
            )}

            {claimMessage && (
              <div className={`mb-4 p-4 border rounded-lg text-sm ${isDark ? 'bg-blue-500/10 border-blue-500 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-700'}`}>
                {claimMessage}
              </div>
            )}

            {!shiftsLoading && !shiftsError && shifts.length === 0 && (
              <div className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                No shifts yet.
              </div>
            )}

            <div className="space-y-4">
              {shifts.map((shift) => (
                <div
                  key={shift.id}
                  className={`border rounded-lg p-5 transition-colors ${isDark ? 'border-gray-800 bg-gray-950/40' : 'border-gray-200 bg-gray-50'}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {shift.title}
                      </h3>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {shift.description || 'No description provided.'}
                      </p>
                    </div>
                    <span className={`text-xs uppercase tracking-wide px-3 py-1 rounded-full ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-200 text-gray-700'}`}>
                      {shift.status}
                    </span>
                  </div>
                  {profile.role === 'manager' && (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setFocusedShiftId((current) => (current === shift.id ? null : shift.id))}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-white hover:bg-gray-100 text-gray-800 border border-gray-200'}`}
                      >
                        {focusedShiftId === shift.id ? 'Hide suggestions' : 'View suggestions'}
                      </button>
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                        Quick actions will expand here.
                      </span>
                    </div>
                  )}
                  {profile.role === 'worker' && (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleClaim(shift.id)}
                        disabled={claimingShiftId === shift.id}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'} disabled:opacity-60 disabled:cursor-not-allowed`}
                      >
                        {claimingShiftId === shift.id ? 'Claiming...' : 'Claim shift'}
                      </button>
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                        Claims update live when approved or cancelled.
                      </span>
                    </div>
                  )}
                  <div className={`mt-4 flex flex-wrap gap-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <span>Start: {new Date(shift.start_time).toLocaleString()}</span>
                    <span>End: {new Date(shift.end_time).toLocaleString()}</span>
                  </div>
                  {shift.required_skills?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {shift.required_skills.map((skill) => (
                        <span
                          key={skill}
                          className={`px-3 py-1 text-xs rounded-full ${isDark ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-700'}`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  {focusedShiftId === shift.id && (
                    <div className={`mt-4 border rounded-lg p-4 ${isDark ? 'border-gray-800 bg-gray-900/60 text-gray-300' : 'border-gray-200 bg-white text-gray-700'}`}>
                      <div className="text-sm font-semibold mb-1">Matching suggestions</div>
                      <p className="text-sm">
                        Matching suggestions will appear here once Phase 4 auto-matching is implemented.
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface NavItemProps {
  isDark: boolean;
  icon: string;
  label: string;
  href: string;
  open: boolean;
}

function NavItem({ isDark, icon, label, open }: NavItemProps) {
  return (
    <a
      href="#"
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isDark ? 'hover:bg-gray-800 text-gray-300 hover:text-white' : 'hover:bg-gray-100 text-gray-700 hover:text-gray-900'}`}
    >
      <span className="text-xl">{icon}</span>
      {open && <span className="font-medium">{label}</span>}
    </a>
  );
}

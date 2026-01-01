import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Zap, Users, MapPin } from 'lucide-react';

interface HomeProps {
  isDark: boolean;
}

export function Home({ isDark }: HomeProps) {
  return (
    <main className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-white'} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <section className="text-center mb-20">
          <h1 className={`text-5xl md:text-6xl font-bold mb-6 leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Stop the Sunday <br />
            <span className="text-blue-500">Night Scramble</span>
          </h1>
          <p className={`text-xl md:text-2xl mb-8 max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Automatically match available, skilled, and nearby workers to your variable shifts. Get replacements in minutes when cancellations happen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold inline-flex items-center gap-2 transition-all transform hover:scale-105"
            >
              Get Started Free <ArrowRight size={20} />
            </Link>
            <Link
              to="/login"
              className={`px-8 py-4 rounded-lg font-semibold transition-all transform hover:scale-105 ${isDark ? 'bg-gray-800 hover:bg-gray-700 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
            >
              Sign In
            </Link>
          </div>
        </section>

        <section className="grid md:grid-cols-3 gap-8 mb-20">
          <div className={`p-8 rounded-lg border transition-colors ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <Zap className="text-white" size={24} />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Instant Matching</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Post a shift and get instant suggestions for workers matching required skills and location.
            </p>
          </div>

          <div className={`p-8 rounded-lg border transition-colors ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <Users className="text-white" size={24} />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Auto-Replacement</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              When someone cancels, we automatically find and notify replacement candidates in seconds.
            </p>
          </div>

          <div className={`p-8 rounded-lg border transition-colors ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
              <MapPin className="text-white" size={24} />
            </div>
            <h3 className={`text-xl font-bold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Location Smart</h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Filter workers by proximity and skills. Find the closest available talent for every shift.
            </p>
          </div>
        </section>

        <section className={`p-12 rounded-lg border transition-colors ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
          <h2 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>How it Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-blue-600' : 'bg-blue-500'} text-white font-bold text-lg`}>1</div>
              <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Post Shift</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Add title, skills, location & time</p>
            </div>
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-blue-600' : 'bg-blue-500'} text-white font-bold text-lg`}>2</div>
              <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Get Matches</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>See qualified, available workers</p>
            </div>
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-blue-600' : 'bg-blue-500'} text-white font-bold text-lg`}>3</div>
              <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Fill Shift</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Claim or notify your matches</p>
            </div>
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-blue-600' : 'bg-blue-500'} text-white font-bold text-lg`}>4</div>
              <h4 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Coverage</h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Or auto-replace if cancelled</p>
            </div>
          </div>
        </section>

        <section className="mt-20 text-center">
          <h2 className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>Industry Coverage</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {['Moving Companies', 'Cleaning Services', 'Catering', 'Event Staffing'].map((industry) => (
              <div key={industry} className="flex items-center justify-center gap-2">
                <CheckCircle2 className="text-blue-500" size={20} />
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{industry}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

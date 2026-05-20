import React from 'react';
import { useNavigate } from 'react-router-dom';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="font-sans text-gray-900 overflow-x-hidden">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pt-32 pb-24 px-6 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between z-10 relative">
          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
              Trade Skills. <br className="hidden md:block"/> No Money Required.
            </h1>
            <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-lg">
              Welcome to DevSwap. Teach what you know, learn what you need, and grow together in a peer-to-peer ecosystem.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => navigate('/register')}
                className="bg-white text-indigo-700 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition transform hover:-translate-y-1 text-lg"
              >
                Join for Free
              </button>
              <button 
                onClick={() => { document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' }); }}
                className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full hover:bg-white/10 transition text-lg"
              >
                See How It Works
              </button>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            {/* Abstract Graphic Representation */}
            <div className="relative w-80 h-80 bg-white/10 rounded-full blur-3xl absolute top-0 right-0"></div>
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Collaboration" className="rounded-2xl shadow-2xl z-10 w-full max-w-md object-cover transform rotate-2 hover:rotate-0 transition duration-500"/>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">A New Way to Grow Your Career</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">Stop paying for expensive courses. Exchange your expertise with passionate learners worldwide.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center text-2xl mb-6"></div>
              <h3 className="text-2xl font-bold mb-3">Direct Peer Matching</h3>
              <p className="text-gray-600 leading-relaxed">Our intelligent matching system finds exactly who needs your skills and who can teach you what you're looking for.</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center text-2xl mb-6"></div>
              <h3 className="text-2xl font-bold mb-3">Beginner Friendly</h3>
              <p className="text-gray-600 leading-relaxed">Don't have a skill yet? Turn on "Beginner Mode" to connect with patient mentors ready to help you start your journey.</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-6"></div>
              <h3 className="text-2xl font-bold mb-3">Learn Anything</h3>
              <p className="text-gray-600 leading-relaxed">From React and Python to UI Design and Marketing. Build your diverse toolkit through practical 1-on-1 sessions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How DevSwap Works</h2>
            <p className="text-xl text-gray-600">Start exchanging skills in three simple steps.</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-indigo-100 -z-10 transform -translate-y-1/2"></div>
            
            <div className="flex-1 text-center bg-white z-10 px-4">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg border-4 border-white">1</div>
              <h3 className="text-xl font-bold mb-3">Set Up Your Profile</h3>
              <p className="text-gray-600">List the skills you can offer and the skills you are desperate to learn.</p>
            </div>
            
            <div className="flex-1 text-center bg-white z-10 px-4">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg border-4 border-white">2</div>
              <h3 className="text-xl font-bold mb-3">Get Matched</h3>
              <p className="text-gray-600">Our algorithm automatically pairs you with users who have a mutual skill interest.</p>
            </div>
            
            <div className="flex-1 text-center bg-white z-10 px-4">
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg border-4 border-white">3</div>
              <h3 className="text-xl font-bold mb-3">Connect & Learn</h3>
              <p className="text-gray-600">Reach out to your matches, schedule a session, and start sharing knowledge!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits / Value Proposition Section */}
      <section className="py-24 bg-indigo-900 text-white px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="md:w-1/2">
            <h2 className="text-4xl font-bold mb-6">Why Choose Skill Exchange over Paid Courses?</h2>
            <ul className="space-y-6">
              <li className="flex items-start">
                <div>
                  <h4 className="text-xl font-bold mb-1">Interactive & Personalized</h4>
                  <p className="text-indigo-200">Pre-recorded videos can't answer your specific questions. A live human can.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div>
                  <h4 className="text-xl font-bold mb-1">Zero Financial Barrier</h4>
                  <p className="text-indigo-200">Your knowledge is your currency. Save money while upskilling aggressively.</p>
                </div>
              </li>
              <li className="flex items-start">
                <div>
                  <h4 className="text-xl font-bold mb-1">Build Real Connections</h4>
                  <p className="text-indigo-200">Expand your professional network by collaborating with developers around the world.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="md:w-1/2 bg-white/5 p-8 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-md">
            <div className="text-center mb-8">
              <p className="text-indigo-300 text-sm font-semibold uppercase tracking-wider mb-2">Real Match Example</p>
            </div>
            <div className="flex flex-col gap-4">
              <div className="bg-white/10 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold">Sarah (Frontend Developer)</p>
                  <p className="text-sm text-indigo-200">Wants: Python | Offers: React</p>
                </div>
              </div>
              <div className="flex justify-center text-indigo-300 text-2xl">↹</div>
              <div className="bg-white/10 p-4 rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-bold">David (Data Scientist)</p>
                  <p className="text-sm text-indigo-200">Wants: React | Offers: Python</p>
                </div>
              </div>
            </div>
            <p className="text-center mt-6 font-semibold text-green-400">Perfect Match! 100% Synergy.</p>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 px-6 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Ready to accelerate your learning?</h2>
          <p className="text-xl text-gray-600 mb-10">Join thousands of learners and experts who are trading skills to build the future.</p>
          <button 
            onClick={() => navigate('/register')}
            className="bg-indigo-600 text-white font-bold py-4 px-12 rounded-full shadow-xl hover:bg-indigo-700 hover:shadow-2xl transition transform hover:-translate-y-1 text-lg"
          >
            Create Your Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center">
              <img src={process.env.PUBLIC_URL + '/logo.png'} alt="DevSwap Logo" className="h-16 md:h-20 w-auto object-contain" />
            </h2>
            <p className="mt-2 text-sm">Empowering peers through knowledge exchange.</p>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition">About</a>
            <a href="#" className="hover:text-white transition">Features</a>
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 text-sm text-center md:text-left flex flex-col md:flex-row justify-between">
          <p>&copy; {new Date().getFullYear()} DevSwap. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Built for the developer community.</p>
        </div>
      </footer>
    </div>
  );
}

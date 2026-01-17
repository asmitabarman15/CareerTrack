import React, { useState } from 'react';
import { User, Users, PlayCircle } from 'lucide-react';

export default function AuthPage({ 
  authMode, setAuthMode, role, loading, tempTestResults, setView, handleAuth 
}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [studentEmail, setStudentEmail] = useState(''); // Kept state logic intact

    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${role === 'parent' ? 'bg-amber-50' : 'bg-slate-50'}`}>
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md relative overflow-hidden">
          {role === 'parent' && <div className="absolute top-0 left-0 w-full h-2 bg-amber-500"></div>}
          
          <div className="text-center mb-8">
            <div className={`inline-flex items-center justify-center h-12 w-12 rounded-full mb-4 ${role === 'parent' ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-600'}`}>
              {role === 'student' ? <User className="h-6 w-6" /> : <Users className="h-6 w-6" />}
            </div>
            <h2 className={`text-2xl font-bold ${role === 'parent' ? 'text-amber-900' : 'text-slate-900'}`}>
              {tempTestResults && role === 'student' ? 'Save Your Result' : (authMode === 'login' ? 'Welcome Back' : 'Create Account')}
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-medium tracking-wide uppercase">
              {tempTestResults && role === 'student' ? 'Create an account to see your Career Path' : (role === 'student' ? 'Student Portal' : 'Parent Portal')}
            </p>
          </div>

          <form onSubmit={(e) => handleAuth(e, email, password, name, role, studentEmail)} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input required type="text" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <input required type="email" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input required type="password" className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <button disabled={loading} className={`w-full text-white py-3 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50 ${role === 'parent' ? 'bg-amber-600' : 'bg-indigo-600'}`}>
              {loading ? 'Processing...' : (authMode === 'login' ? 'Login' : 'Sign Up')}
            </button>
          </form>

          {role === 'parent' && authMode === 'login' && (
              <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                  <button 
                    onClick={(e) => handleAuth(e, 'demo@amrata.parent', 'demo', 'Amrata Parent', 'parent')}
                    className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-amber-700 bg-amber-50 rounded-lg hover:bg-amber-100 transition"
                  >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      View Demo Dashboard (Amrata's Parent)
                  </button>
              </div>
          )}

          <div className="mt-6 text-center text-sm text-slate-600">
            {authMode === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className={`ml-2 font-semibold hover:underline ${role === 'parent' ? 'text-amber-600' : 'text-indigo-600'}`}>
              {authMode === 'login' ? 'Sign Up' : 'Login'}
            </button>
          </div>
           <div className="mt-4 text-center text-sm">
            <button onClick={() => setView('landing')} className="text-slate-400 hover:text-slate-600">Back to Home</button>
          </div>
        </div>
      </div>
    );
}

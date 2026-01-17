import React from 'react';
import { TrendingUp, User, Users, Brain, Map, Activity } from 'lucide-react';

export default function LandingPage({ setRole, setView, setAuthMode }) {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <nav className="flex justify-between items-center p-6 bg-white shadow-sm">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-8 w-8 text-indigo-600" />
          <span className="text-2xl font-bold text-slate-800">CareerTrack</span>
        </div>
        <div className="space-x-4">
          <button onClick={() => { setRole('student'); setView('test-intro'); }} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-medium hover:bg-indigo-700 transition">Get Started</button>
        </div>
      </nav>

      <main className="flex-grow flex flex-col items-center justify-center text-center px-4">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
            Discover Your Future <br/>
            <span className="text-indigo-600">Powered by AI Logic</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Standardized psychometric testing combined with smart course mapping to guide students from confusion to a clear career roadmap.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <button onClick={() => { setRole('student'); setView('test-intro'); }} className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-bold hover:bg-indigo-700 shadow-lg transform transition hover:-translate-y-1">
              <User className="h-5 w-5" />
              <span>I am a Student</span>
            </button>
            <button onClick={() => { setAuthMode('login'); setRole('parent'); setView('auth'); }} className="flex items-center justify-center space-x-2 bg-white text-slate-700 border-2 border-slate-200 px-8 py-4 rounded-lg text-lg font-bold hover:border-indigo-600 hover:text-indigo-600 shadow-sm transition">
              <Users className="h-5 w-5" />
              <span>Parent Login</span>
            </button>
          </div>
        </div>
        
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full px-4">
          {[
            { icon: Brain, title: "Psychometric Analysis", desc: "Image-based tests to uncover your true personality traits." },
            { icon: Map, title: "Career Roadmap", desc: "Step-by-step guidance from 10th grade to your first job." },
            { icon: Activity, title: "Parent Insights", desc: "Real-time progress tracking without invading student privacy." }
          ].map((feature, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
              <feature.icon className="h-10 w-10 text-indigo-500 mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">{feature.title}</h3>
              <p className="text-slate-600">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

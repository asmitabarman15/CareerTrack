import React, { useState, useEffect } from 'react';
import { Target, Map, BookOpen, Briefcase, TrendingUp, LogOut, CheckCircle, PlayCircle, XCircle, ChevronRight, School, Award, DollarSign, Info, GraduationCap } from 'lucide-react';
import { doc, onSnapshot, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, appId } from '../config/firebase'; // Import from config
import { RECOMMENDATION_ENGINE } from '../data/constants'; // Import from data
import { Loading, ProgressBar } from '../components/Shared';

export default function StudentDashboard({ user, userData, handleLogout }) {
    const [activeTab, setActiveTab] = useState('overview');
    const [data, setData] = useState(null);
    const [expandedCourse, setExpandedCourse] = useState(null);
    const [activeQuiz, setActiveQuiz] = useState(null);
    const [quizAnswers, setQuizAnswers] = useState({});

    useEffect(() => {
        if (!user) return;
        const unsub = onSnapshot(doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'testResults'), (doc) => {
            if (doc.exists()) setData(doc.data());
        });
        return () => unsub();
    }, [user]);

    const handleQuizSubmit = async (stepId, questions) => {
        let score = 0;
        let total = questions.length;
        questions.forEach((q, idx) => {
            if (quizAnswers[idx] === q.correct) score++;
        });

        if (score / total < 0.5) {
            alert(`You scored ${score}/${total}. You need at least 50% to pass. Try again!`);
            setQuizAnswers({});
            return;
        }

        const newRoadmap = data.roadmap.map(s => s.id === stepId ? {...s, completed: true} : s);
        const completedCount = newRoadmap.filter(s => s.completed).length;
        const newProgress = Math.round((completedCount / newRoadmap.length) * 100);

        await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'testResults'), {
            roadmap: newRoadmap,
            progress: newProgress
        });

        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'student_shares', user.uid), {
                progress: newProgress,
                roadmap: newRoadmap,
                updatedAt: serverTimestamp()
            });
        } catch (e) {
             await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'student_shares', user.uid), {
                name: userData.name,
                stream: data.recommendedStream,
                progress: newProgress,
                roadmap: newRoadmap,
                monthlyProgress: [20, 35, 45, 60],
                updatedAt: serverTimestamp()
            });
        }

        alert("Great job! Step completed.");
        setActiveQuiz(null);
        setQuizAnswers({});
    };

    if (!data) return <Loading />;
    const streamInfo = RECOMMENDATION_ENGINE[data.recommendedStream];

    return (
      <div className="min-h-screen bg-slate-50 flex">
        <aside className="w-20 md:w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-10">
          <div className="p-6 flex items-center space-x-3">
             <TrendingUp className="h-8 w-8 text-indigo-600 flex-shrink-0" />
             <span className="font-bold text-xl text-slate-800 hidden md:block">CareerTrack</span>
          </div>
          <nav className="flex-1 mt-6 px-4 space-y-2">
            {[
              { id: 'overview', icon: Target, label: 'Overview' },
              { id: 'roadmap', icon: Map, label: 'My Roadmap' },
              { id: 'courses', icon: BookOpen, label: 'Courses' },
              { id: 'jobs', icon: Briefcase, label: 'Careers & Jobs' }
            ].map(item => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <item.icon className="h-5 w-5" />
                <span className="hidden md:block font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-slate-100">
             <div className="flex items-center space-x-3 mb-4 px-2">
                <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">{userData?.name?.[0] || 'S'}</div>
                <div className="hidden md:block overflow-hidden">
                    <p className="text-sm font-bold truncate text-slate-900">{userData?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{data.recommendedStream.split(' ')[0]}</p>
                </div>
            </div>
            <button onClick={handleLogout} className="flex items-center space-x-3 w-full p-2 text-red-500 hover:bg-red-50 rounded-lg transition">
              <LogOut className="h-5 w-5" />
              <span className="hidden md:block font-medium">Logout</span>
            </button>
          </div>
        </aside>

        <main className="flex-1 ml-20 md:ml-64 p-8">
            {/* ... Content logic (matches original exactly, just cleaner return) ... */}
            {/* Due to length I am not repeating the inner JSX of tabs, but they go here exactly as in your original file */}
            {activeTab === 'overview' && (
                <div className="space-y-8 max-w-5xl">
                    <header>
                        <h1 className="text-3xl font-bold text-slate-900">Your Analysis Results</h1>
                        <p className="text-slate-500 mt-2">Based on your psychological profile, we found your perfect match.</p>
                    </header>
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between">
                        <div className="space-y-4 max-w-xl">
                            <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">Best Fit Detected</div>
                            <h2 className="text-4xl font-extrabold">{data.recommendedStream}</h2>
                            <p className="text-indigo-100 leading-relaxed text-lg">{streamInfo.description}</p>
                            <div className="flex gap-2 mt-4"><span className="px-3 py-1 bg-white/10 rounded text-sm">Dominant Trait: {data.dominantTrait}</span></div>
                        </div>
                        <div className="mt-6 md:mt-0 bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/20 min-w-[200px] text-center">
                            <Award className="h-12 w-12 mx-auto mb-2 text-yellow-300" />
                            <p className="text-3xl font-bold">94%</p>
                            <p className="text-sm opacity-80">Match Score</p>
                        </div>
                    </div>
                    {/* ... Traits grid ... */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Object.entries(data.traits).map(([trait, score]) => (
                            <div key={trait} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-medium text-slate-700">{trait}</span>
                                    <span className="text-sm font-bold text-indigo-600">{score} pts</span>
                                </div>
                                <ProgressBar progress={(score/20)*100} color="bg-indigo-500" />
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* ... Other Tabs (Roadmap, Courses, Jobs) - Copy paste logic here ... */}
             {activeTab === 'roadmap' && (
                <div className="max-w-4xl">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Career Roadmap</h2>
                    {/* ... Map over data.roadmap ... */}
                    <div className="relative border-l-4 border-indigo-200 ml-4 space-y-10">
                        {data.roadmap.map((step, idx) => (
                             <div key={idx} className="relative pl-8">
                                {/* ... Step UI ... */}
                                <div className={`absolute -left-[14px] top-0 h-6 w-6 rounded-full border-4 border-white ${step.completed ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div><h3 className="text-lg font-bold text-slate-800">{step.title}</h3><p className="text-slate-600 mt-1">{step.desc}</p></div>
                                        {step.completed ? <div className="flex items-center text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full"><CheckCircle className="h-5 w-5 mr-2" /> Completed</div> : <div className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-medium border border-slate-200">InProgress</div>}
                                    </div>
                                    {/* Quiz Logic UI */}
                                    {activeQuiz === step.id ? (
                                        <div className="mt-4 bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                                            {step.quiz.map((q, qIdx) => (
                                                <div key={qIdx} className="mb-4">
                                                    <p className="font-medium text-slate-800 mb-2">{qIdx + 1}. {q.q}</p>
                                                    <div className="space-y-2">
                                                        {q.options.map((opt) => (
                                                            <label key={opt} className="flex items-center space-x-2 cursor-pointer">
                                                                <input type="radio" name={`q-${step.id}-${qIdx}`} value={opt} checked={quizAnswers[qIdx] === opt} onChange={() => setQuizAnswers({...quizAnswers, [qIdx]: opt})} className="text-indigo-600 focus:ring-indigo-500"/>
                                                                <span className="text-slate-700 text-sm">{opt}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            <button onClick={() => handleQuizSubmit(step.id, step.quiz)} className="mt-2 w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition">Submit Answers</button>
                                        </div>
                                    ) : !step.completed && (
                                        <button onClick={() => setActiveQuiz(step.id)} className="mt-2 flex items-center text-indigo-600 font-medium hover:text-indigo-800 transition"><PlayCircle className="h-5 w-5 mr-2" />Take Assessment to Complete</button>
                                    )}
                                </div>
                             </div>
                        ))}
                    </div>
                </div>
            )}
            
            {activeTab === 'courses' && (
                 <div className="max-w-5xl">
                     <h2 className="text-2xl font-bold text-slate-900 mb-6">Recommended Courses</h2>
                     {/* ... Courses List ... */}
                     <div className="grid gap-4 mb-8">
                       {streamInfo.courses.map((course, idx) => (
                           <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
                               <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                                   <div>
                                       <div className="flex items-center gap-3"><h3 className="text-lg font-bold text-slate-800">{course.name}</h3>{course.suitability === 'High' && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">High Match</span>}</div>
                                       <div className="flex gap-4 mt-2 text-sm text-slate-500"><span className="flex items-center gap-1"><School className="h-4 w-4"/> {course.duration}</span><span className="flex items-center gap-1"><Award className="h-4 w-4"/> Scholarships: {course.scholarships}</span></div>
                                   </div>
                                   <button onClick={() => setExpandedCourse(expandedCourse === idx ? null : idx)} className="mt-4 md:mt-0 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-200 transition flex items-center">{expandedCourse === idx ? 'Hide Info' : 'View Details'}<ChevronRight className={`h-4 w-4 ml-1 transition-transform ${expandedCourse === idx ? 'rotate-90' : ''}`} /></button>
                               </div>
                               {expandedCourse === idx && (
                                   <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                       <div className="bg-indigo-50 p-4 rounded-lg"><div className="flex items-start gap-2"><BookOpen className="h-5 w-5 text-indigo-600 mt-0.5" /><div><h4 className="font-bold text-indigo-900 mb-1">Academic Background</h4><p className="text-sm text-indigo-700 leading-relaxed">{course.background}</p></div></div></div>
                                       <div className="bg-emerald-50 p-4 rounded-lg"><div className="flex items-start gap-2"><TrendingUp className="h-5 w-5 text-emerald-600 mt-0.5" /><div><h4 className="font-bold text-emerald-900 mb-1">Skills You'll Master</h4><p className="text-sm text-emerald-700 leading-relaxed">{course.skills}</p></div></div></div>
                                   </div>
                               )}
                           </div>
                       ))}
                   </div>
                   {/* Colleges and Scholarships */}
                   <h2 className="text-2xl font-bold text-slate-900 mb-6">Top Affordable Colleges</h2>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                       {streamInfo.colleges && streamInfo.colleges.map((college, idx) => (
                           <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-colors flex justify-between items-center"><div><h4 className="font-bold text-slate-800">{college.name}</h4><span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded mt-1 inline-block">{college.type}</span></div><div className="text-right"><p className="text-sm font-bold text-green-600">{college.fees}</p><p className="text-xs text-slate-400">Approx. Fees</p></div></div>
                       ))}
                   </div>
                 </div>
            )}
            
            {activeTab === 'jobs' && (
             <div className="max-w-5xl">
                 <h2 className="text-2xl font-bold text-slate-900 mb-6">Career Outlook & Jobs</h2>
                 <p className="text-slate-500 mb-8">Potential career paths for {data.recommendedStream}.</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {streamInfo.jobs.map((job, idx) => (
                         <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-indigo-300 transition-colors group">
                             <div className="flex justify-between items-start mb-4"><div><h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-700 transition-colors">{job.title}</h3><span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500 mt-1 inline-block">High Demand</span></div><Briefcase className="h-6 w-6 text-slate-300 group-hover:text-indigo-600 transition-colors" /></div>
                             <p className="text-slate-600 text-sm mb-4 min-h-[40px]">{job.desc}</p>
                             <div className="flex items-center justify-between pt-4 border-t border-slate-50"><div className="flex items-center gap-1.5 text-sm font-medium text-slate-700"><DollarSign className="h-4 w-4 text-green-500" />{job.salary}</div><div className="flex items-center gap-1.5 text-sm font-medium text-indigo-600"><TrendingUp className="h-4 w-4" />{job.growth}</div></div>
                         </div>
                     ))}
                 </div>
             </div>
            )}

        </main>
      </div>
    );
}

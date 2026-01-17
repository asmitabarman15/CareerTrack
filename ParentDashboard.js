import React, { useState, useEffect } from 'react';
import { Users, Search, PlayCircle, User, Brain, Target, School, Award, CheckCircle, Lock } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, appId } from '../config/firebase';
import { MOCK_AMRATA_DATA, RECOMMENDATION_ENGINE } from '../data/constants';

export default function ParentDashboard({ userData, setUserData, handleLogout, isDemoMode, setIsDemoMode, user }) {
    const [studentData, setStudentData] = useState(null);
    const [searchStatus, setSearchStatus] = useState('loading'); 
    const [linkEmail, setLinkEmail] = useState('');
    const [linking, setLinking] = useState(false);

    useEffect(() => {
        const fetchStudent = async () => {
            if (isDemoMode) {
                setStudentData(MOCK_AMRATA_DATA);
                setSearchStatus('found');
                return;
            }

            if(!userData?.linkedStudentUid) {
                setSearchStatus('not-found');
                return;
            }

            try {
                const studentShareRef = doc(db, 'artifacts', appId, 'public', 'data', 'student_shares', userData.linkedStudentUid);
                const shareSnap = await getDoc(studentShareRef);

                if (shareSnap.exists()) {
                    const rData = shareSnap.data();
                    let calculatedProgress = 0;
                    let completedSteps = 0;
                    let totalSteps = 0;

                    if (rData.roadmap && Array.isArray(rData.roadmap)) {
                        totalSteps = rData.roadmap.length;
                        completedSteps = rData.roadmap.filter(s => s.completed).length;
                        calculatedProgress = Math.round((completedSteps / totalSteps) * 100);
                    } else {
                        calculatedProgress = rData.progress || 0;
                    }
                    
                    setStudentData({
                        name: rData.name || "Student",
                        stream: rData.stream,
                        progress: calculatedProgress,
                        progressDetail: `${completedSteps} of ${totalSteps} Levels Completed`,
                        monthlyStats: rData.monthlyProgress || [0,0,0,0],
                        course: "Recommended: " + (rData.stream ? rData.stream.split(' ')[0] : "Pending"),
                        roadmap: rData.roadmap || [] 
                    });
                    setSearchStatus('found');
                } else {
                    setSearchStatus('not-found');
                }
            } catch (err) {
                console.error("Error fetching student data:", err);
                setSearchStatus('error');
            }
        };
        fetchStudent();
    }, [userData, isDemoMode]);

    const handleManualLink = async () => {
        if (!linkEmail) return;
        const targetEmail = linkEmail.trim().toLowerCase(); 
        setLinking(true);
        try {
            const lookupDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'user_map', targetEmail);
            const lookupDocSnap = await getDoc(lookupDocRef);
            
            if (lookupDocSnap.exists()) {
                const sUid = lookupDocSnap.data().uid;
                await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'), {
                    linkedStudentUid: sUid,
                    linkedStudentEmail: targetEmail
                });
                setUserData(prev => ({...prev, linkedStudentUid: sUid, linkedStudentEmail: targetEmail}));
                setLinkEmail('');
            } else {
                alert("Student email not found. Please ensure the student has created an account.");
            }
        } catch (e) {
            console.error("Link error:", e);
            alert("Error linking account. Please try again later.");
        }
        setLinking(false);
    };

    const parentCourseList = studentData && studentData.stream ? RECOMMENDATION_ENGINE[studentData.stream]?.courses : [];

    return (
      <div className="min-h-screen bg-slate-50">
             <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center">
                 <div className="flex items-center gap-2">
                     <Users className="h-6 w-6 text-indigo-600"/>
                     <span className="font-bold text-xl text-slate-800">Parent Portal</span>
                 </div>
                 <button onClick={handleLogout} className="text-slate-500 hover:text-slate-800 font-medium text-sm">Logout</button>
             </header>

             <main className="max-w-6xl mx-auto p-8">
                 <div className="mb-8">
                     <h1 className="text-2xl font-bold text-slate-900">Welcome, {userData?.name}</h1>
                     <p className="text-slate-500">Track your child's career progress and milestones.</p>
                 </div>

                 {searchStatus === 'not-found' ? (
                     <div className="bg-white p-12 rounded-xl text-center border border-dashed border-slate-300">
                         <Search className="h-12 w-12 mx-auto text-slate-300 mb-4"/>
                         <h3 className="text-lg font-medium text-slate-900">No Student Linked</h3>
                         <p className="text-slate-500 mb-6">Enter your child's student email to view their progress.</p>
                         <div className="flex justify-center items-center gap-2 max-w-md mx-auto mb-6">
                             <input type="email" placeholder="student@example.com" className="border border-slate-300 rounded-lg px-4 py-2 w-full" value={linkEmail} onChange={(e) => setLinkEmail(e.target.value)}/>
                             <button onClick={handleManualLink} disabled={linking} className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{linking ? 'Linking...' : 'Link'}</button>
                         </div>
                         <div className="mt-6 pt-6 border-t border-slate-100">
                             <p className="text-slate-400 text-sm mb-3">Testing the app?</p>
                             <button onClick={() => setIsDemoMode(true)} className="text-indigo-600 font-medium hover:text-indigo-800 flex items-center justify-center gap-2 mx-auto transition-colors"><PlayCircle className="h-4 w-4"/>Link to Demo Student (Amrata)</button>
                         </div>
                     </div>
                 ) : searchStatus === 'loading' ? (
                     <div className="text-center p-12"><div className="animate-spin h-8 w-8 border-b-2 border-indigo-600 rounded-full mx-auto"></div></div>
                 ) : searchStatus === 'error' ? (
                      <div className="text-center p-12 text-red-500">Error loading data. Please try again.</div>
                 ) : (
                     <div className="space-y-6 animate-in fade-in duration-500">
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                 <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Student Profile</h3>
                                 <div className="flex items-center gap-3"><div className="p-3 bg-indigo-50 text-indigo-700 rounded-lg"><User className="h-6 w-6" /></div><div><p className="text-xl font-bold text-slate-900">{studentData?.name}</p><p className="text-xs text-slate-500">Linked Account</p></div></div>
                             </div>
                             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                 <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Selected Stream</h3>
                                 <div className="flex items-center gap-3"><div className="p-3 bg-blue-100 text-blue-700 rounded-lg"><Brain className="h-6 w-6" /></div><div><p className="text-xl font-bold text-slate-900">{studentData?.stream}</p><p className="text-xs text-slate-500">AI Recommended</p></div></div>
                             </div>
                             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                 <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Roadmap Progress</h3>
                                 <div className="flex items-center gap-3">
                                     <div className="p-3 bg-green-100 text-green-700 rounded-lg"><Target className="h-6 w-6" /></div>
                                     <div className="flex-1"><div className="flex justify-between items-baseline"><p className="text-xl font-bold text-slate-900">{studentData?.progress}%</p><span className="text-xs font-medium text-green-600">On Track</span></div><div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 mb-2"><div className="bg-green-500 h-1.5 rounded-full" style={{width: `${studentData?.progress}%`}}></div></div><p className="text-xs text-slate-500 font-medium">{studentData?.progressDetail}</p></div>
                                 </div>
                             </div>
                         </div>
                         {/* ... Recommended Courses ... */}
                         <div className="mt-8">
                             <h2 className="text-2xl font-bold text-slate-900 mb-6">Recommended Courses for {studentData?.name}</h2>
                             <div className="grid gap-4 mb-8">
                               {parentCourseList && parentCourseList.length > 0 ? (
                                   parentCourseList.map((course, idx) => (
                                       <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                           <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                                               <div>
                                                   <div className="flex items-center gap-3"><h3 className="text-lg font-bold text-slate-800">{course.name}</h3>{course.suitability === 'High' && <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">High Match</span>}</div>
                                                   <div className="flex gap-4 mt-2 text-sm text-slate-500"><span className="flex items-center gap-1"><School className="h-4 w-4"/> {course.duration}</span><span className="flex items-center gap-1"><Award className="h-4 w-4"/> Scholarships: {course.scholarships}</span></div>
                                               </div>
                                           </div>
                                       </div>
                                   ))
                               ) : (<div className="text-slate-500 italic">No specific course recommendations available yet.</div>)}
                             </div>
                         </div>
                         {/* ... Roadmap and Activity Chart ... */}
                         <div className="mt-8">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Student's Career Roadmap</h2>
                            <div className="relative border-l-4 border-indigo-200 ml-4 space-y-10">
                            {studentData.roadmap && studentData.roadmap.map((step, idx) => (
                                <div key={idx} className="relative pl-8">
                                    <div className={`absolute -left-[14px] top-0 h-6 w-6 rounded-full border-4 border-white ${step.completed ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                        <div className="flex justify-between items-start"><div><h3 className="text-lg font-bold text-slate-800">{step.title}</h3><p className="text-slate-600 mt-1">{step.desc}</p></div>{step.completed ? (<div className="flex items-center text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full"><CheckCircle className="h-5 w-5 mr-2" /> Completed</div>) : (<div className="text-xs bg-slate-100 px-3 py-1 rounded-full text-slate-500 font-medium border border-slate-200">Pending</div>)}</div>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </div>
                        {/* Stats and Privacy Notice */}
                         <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mt-8">
                             <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-lg text-slate-800">Monthly Learning Activity</h3><div className="text-sm text-slate-500">Last 4 Months</div></div>
                             <div className="flex items-end justify-around h-64 pb-4 border-b border-slate-100">
                                 {studentData?.monthlyStats.map((height, i) => (
                                     <div key={i} className="flex flex-col items-center gap-2 group w-full">
                                         <div className="w-12 md:w-16 bg-indigo-100 rounded-t-lg transition-all duration-500 group-hover:bg-indigo-600 relative" style={{ height: `${height}%` }}><div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition">{height}%</div></div><span className="text-sm font-medium text-slate-500">Month {i+1}</span>
                                     </div>
                                 ))}
                             </div>
                         </div>
                         <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-3"><Lock className="h-5 w-5 text-yellow-600 mt-0.5" /><div><h4 className="text-sm font-bold text-yellow-800">Student Privacy Active</h4><p className="text-sm text-yellow-700 mt-1">Detailed answers to psychometric questions are hidden to encourage honest self-reflection by the student. You can only view high-level results and progress.</p></div></div>
                     </div>
                 )}
             </main>
        </div>
      );
}

import React, { useState, useEffect } from 'react';
import { 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged, 
  signOut
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

// Import our new modules
import { auth, db, appId } from './config/firebase';
import { STREAMS, ROADMAP_STEPS } from './data/constants';
import { Loading } from './components/Shared';

// Import Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import TestPage from './pages/TestPage';
import StudentDashboard from './pages/StudentDashboard';
import ParentDashboard from './pages/ParentDashboard';

export default function CareerTrackApp() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('landing');
  const [authMode, setAuthMode] = useState('login');
  const [role, setRole] = useState('student');
  const [tempTestResults, setTempTestResults] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  // Test State
  const [answers, setAnswers] = useState({});
  const [calculating, setCalculating] = useState(false);

  // Auth Initialization
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && !isDemoMode) {
        // Fetch user data from Firestore
        const userRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'info');
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          setRole(data.role);
          
          if (data.role === 'student') {
             if (data.testTaken) {
               setView('dashboard');
             } else {
               setView('test-intro');
             }
          } else {
            setView('parent-dash');
          }
        }
      } else if (!isDemoMode) {
        setUserData(null);
        setView('landing');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemoMode]);

  // --- ACTIONS ---

  const handleDemoLogin = () => {
        setIsDemoMode(true);
        setUserData({
            name: "Parent of Amrata",
            role: 'parent',
            linkedStudentUid: 'mock-amrata-uid'
        });
        setRole('parent');
        setView('parent-dash');
  };

  const handleAuth = async (e, email, password, name, targetRole, studentEmailForParent) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    // DEMO MODE LOGIN
    if (email === 'demo@amrata.parent') {
        handleDemoLogin();
        setLoading(false);
        return;
    }

    try {
      let currentUser = auth.currentUser;
      if (!currentUser) {
          const result = await signInAnonymously(auth);
          currentUser = result.user;
      }

      // Handle Linking Logic for Parents
      let linkedStudentUid = null;
      if (targetRole === 'parent' && studentEmailForParent) {
          try {
              const lookupDoc = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'user_map', studentEmailForParent));
              if (lookupDoc.exists()) {
                  linkedStudentUid = lookupDoc.data().uid;
              }
          } catch (linkError) {
              console.error("Link failed (Permissions or Network):", linkError);
          }
      }

      const userRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'profile', 'info');
      
      const profileData = {
          uid: currentUser.uid,
          email,
          name: name || email.split('@')[0],
          role: targetRole,
          lastLogin: serverTimestamp(),
          linkedStudentEmail: studentEmailForParent || null,
          linkedStudentUid: linkedStudentUid 
      };

      if (authMode === 'signup') {
         await setDoc(userRef, {
             ...profileData,
             createdAt: serverTimestamp(),
             testTaken: false
         });

         // If STUDENT, register in PUBLIC LOOKUP TABLE (Email -> UID)
         if (targetRole === 'student') {
             await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'user_map', email.toLowerCase()), {
                 email: email.toLowerCase(),
                 uid: currentUser.uid,
                 name: name || email.split('@')[0],
                 role: 'student'
             });
         }

      } else {
         await setDoc(userRef, profileData, { merge: true });
      }
      
      // Save Pending Test Results if they exist (Post-Login Hook)
      if (targetRole === 'student' && tempTestResults) {
          const rData = { ...tempTestResults, completedAt: serverTimestamp() }; 
          
          // Private Write
          await setDoc(doc(db, 'artifacts', appId, 'users', currentUser.uid, 'data', 'testResults'), rData);
          
          // Public Write (Share)
          await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'student_shares', currentUser.uid), {
               name: profileData.name,
               stream: rData.recommendedStream,
               progress: rData.progress,
               roadmap: rData.roadmap,
               monthlyProgress: rData.monthlyProgress,
               updatedAt: serverTimestamp()
          });

          // Update Profile
          await updateDoc(userRef, {
              testTaken: true,
              stream: rData.recommendedStream
          });
          
          // Clear temp
          setTempTestResults(null);
          setUserData({ ...profileData, testTaken: true, stream: rData.recommendedStream });
      } else {
          setUserData({ ...profileData, testTaken: userData?.testTaken || false });
      }
      
      setRole(targetRole);

      if (targetRole === 'student') {
          if (tempTestResults || userData?.testTaken) {
              setView('dashboard');
          } else {
              const testRef = doc(db, 'artifacts', appId, 'users', currentUser.uid, 'data', 'testResults');
              const testSnap = await getDoc(testRef);
              if (testSnap.exists()) setView('dashboard');
              else setView('test-intro');
          }
      } else {
          setView('parent-dash');
      }

    } catch (error) {
      console.error("Auth error:", error);
      setView(targetRole === 'student' ? 'test-intro' : 'parent-dash');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (role === 'student' && userData?.email) {
        localStorage.setItem('last_career_track_student', userData.email);
    }

    setIsDemoMode(false);
    await signOut(auth);
    await signInAnonymously(auth);
    
    setView('landing');
    setUserData(null);
    setAnswers({});
  };

  const submitTest = async () => {
    setCalculating(true);
    
    // 1. Calculate Traits
    const traits = { Analytical: 0, Creative: 0, Logical: 0, Emotional: 0, Confident: 0, Practical: 0 };
    Object.values(answers).forEach(trait => {
      if (traits[trait] !== undefined) traits[trait]++;
    });

    // 2. Determine Stream
    let recommendedStream = STREAMS.ARTS;
    const dominantTrait = Object.keys(traits).reduce((a, b) => traits[a] > traits[b] ? a : b);
    
    // Weighted Logic
    if (traits.Practical >= 4) recommendedStream = STREAMS.VOCATIONAL;
    else if (traits.Analytical >= 4 || traits.Logical >= 4) recommendedStream = STREAMS.SCIENCE;
    else if (traits.Confident >= 4) recommendedStream = STREAMS.COMMERCE;
    else if (traits.Creative >= 4 || traits.Emotional >= 4) recommendedStream = STREAMS.ARTS;
    else {
        if(dominantTrait === 'Practical') recommendedStream = STREAMS.VOCATIONAL;
        else if (dominantTrait === 'Analytical' || dominantTrait === 'Logical') recommendedStream = STREAMS.SCIENCE;
        else if (dominantTrait === 'Confident') recommendedStream = STREAMS.COMMERCE;
    }

    const resultData = {
        answers,
        traits,
        dominantTrait,
        recommendedStream,
        completedAt: serverTimestamp(),
        roadmap: ROADMAP_STEPS, // Initial roadmap with assessments
        progress: 0, // Initial progress
        monthlyProgress: [20, 35, 45, 60]
    };

    // If user is NOT logged in (Standard Flow), save to temp state and redirect to Auth
    if (!userData) {
        setTempTestResults(resultData);
        setTimeout(() => {
            setCalculating(false);
            setAuthMode('signup');
            setRole('student');
            setView('auth'); 
        }, 2000);
        return;
    }

    // If user IS logged in (e.g. retaking test), save directly
    if (user) {
      // PRIVATE Write
      await setDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'data', 'testResults'), resultData);
      
      // PUBLIC SHARE Write
      await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'student_shares', user.uid), {
           name: userData.name,
           stream: recommendedStream,
           progress: 0,
           roadmap: ROADMAP_STEPS, 
           monthlyProgress: [20, 35, 45, 60],
           updatedAt: serverTimestamp()
      });

      await updateDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'info'), {
        testTaken: true,
        stream: recommendedStream
      });

      setUserData(prev => ({ ...prev, testTaken: true, stream: recommendedStream }));
      
      setTimeout(() => {
        setCalculating(false);
        setView('dashboard');
      }, 2000);
    }
  };

  if (loading) return <Loading />;

  switch (view) {
    case 'landing': return <LandingPage setRole={setRole} setView={setView} setAuthMode={setAuthMode} />;
    case 'auth': return <AuthPage authMode={authMode} setAuthMode={setAuthMode} role={role} loading={loading} tempTestResults={tempTestResults} setView={setView} handleAuth={handleAuth} />;
    case 'test-intro': return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
            <div className="h-20 w-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6"><div className="h-10 w-10 text-indigo-600">🧠</div></div>
            <h1 className="text-3xl font-bold text-slate-900 mb-4">Ready to find your path?</h1>
            <p className="text-slate-600 max-w-md mb-8">This test uses image association to bypass social bias. Don't overthink it—just pick the option that feels right.</p>
            <button onClick={() => setView('test')} className="bg-indigo-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-indigo-700 transition shadow-lg">Start Analysis</button>
        </div>
    );
    case 'test': return <TestPage answers={answers} setAnswers={setAnswers} submitTest={submitTest} calculating={calculating} />;
    case 'dashboard': return <StudentDashboard user={user} userData={userData} handleLogout={handleLogout} />;
    case 'parent-dash': return <ParentDashboard userData={userData} setUserData={setUserData} handleLogout={handleLogout} isDemoMode={isDemoMode} setIsDemoMode={setIsDemoMode} user={user} />;
    default: return <LandingPage setRole={setRole} setView={setView} setAuthMode={setAuthMode} />;
  }
}

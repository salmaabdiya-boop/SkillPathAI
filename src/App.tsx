import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import TrackList from "./components/TrackList";
import AssessmentEngine from "./components/AssessmentEngine";
import ResultsPortal from "./components/ResultsPortal";
import RoadmapAdvisor from "./components/RoadmapAdvisor";
import TutorBot from "./components/TutorBot";
import SMSTerminal from "./components/SMSTerminal";
import TeacherPortal from "./components/TeacherPortal";
import LandingPage from "./components/LandingPage";
import OfflineHub from "./components/OfflineHub";
import { Track, QuizSubmission, Question, SMSLog, RoadmapRecommendation, UserRole } from "./types";
import { Wifi, Signal, AlertCircle, Database, Sparkles, CheckCircle, Smartphone, GraduationCap, LogOut, User, ShieldCheck } from "lucide-react";
import { auth, db, handleFirestoreError, OperationType } from "./lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { collection, getDocs, doc, setDoc, getDoc, query, where } from "firebase/firestore";

export default function App() {
  // Global App States
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [currentRole, setCurrentRole] = useState<UserRole>("Student");
  const [activeScreen, setActiveScreen] = useState<"tracks" | "assessment" | "results" | "roadmap">("tracks");
  const [isOffline, setIsOffline] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [studentName, setStudentName] = useState("John Doe");

  // Core Data Lists
  const [tracks, setTracks] = useState<Track[]>([]);
  const [submissions, setSubmissions] = useState<QuizSubmission[]>([]);
  const [smsLogs, setSmsLogs] = useState<SMSLog[]>([]);

  // Assessment flow variables
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<string[]>([]);
  const [accumulatedAnswers, setAccumulatedAnswers] = useState<any[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(1);
  const [isFinishingQuiz, setIsFinishingQuiz] = useState(false);

  // Active Score results & roadmap Recommendations
  const [activeResult, setActiveResult] = useState<QuizSubmission | null>(null);
  const [activeRoadmap, setActiveRoadmap] = useState<RoadmapRecommendation | null>(null);
  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);

  // Sync / Toast Feedback State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "warning" | "info" } | null>(null);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          let userDoc;
          try {
            userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
            return;
          }

          if (userDoc && userDoc.exists()) {
            const data = userDoc.data();
            setCurrentRole(data.role || "Student");
            setStudentName(data.name || firebaseUser.displayName || "KCA Student");
          } else {
            let detectedRole: UserRole = "Student";
            if (
              firebaseUser.email?.includes("dept.cs") || 
              firebaseUser.email?.includes("teacher") || 
              firebaseUser.email?.includes("admin") || 
              firebaseUser.email?.includes("mary")
            ) {
              detectedRole = "Teacher";
            }
            try {
              await setDoc(doc(db, "users", firebaseUser.uid), {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || "KCA Student",
                email: firebaseUser.email || "",
                role: detectedRole,
                learningGoals: ["Adaptive Programming", "Algorithmic Complexity", "Corporate Communication"],
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `users/${firebaseUser.uid}`);
              return;
            }
            setCurrentRole(detectedRole);
            setStudentName(firebaseUser.displayName || "KCA Student");
          }
        } catch (e) {
          console.error("Firestore loading error:", e);
        }
      } else {
        setUser(null);
      }
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch initial tracks, historical submissions, and SMS logs from the Express backend and Firestore
  useEffect(() => {
    if (user) {
      fetchInitialData();
    }
  }, [user, currentRole]);

  const fetchInitialData = async () => {
    try {
      // 1. Fetch Tracks
      let tracksData: Track[] = [];
      try {
        const tracksRes = await fetch("/api/tracks");
        if (tracksRes.ok) {
          tracksData = await tracksRes.json();
          localStorage.setItem("cached_tracks", JSON.stringify(tracksData));
        } else {
          throw new Error("HTTP connection error");
        }
      } catch (err) {
        console.warn("Using offline cached tracks:", err);
        const cached = localStorage.getItem("cached_tracks");
        if (cached) tracksData = JSON.parse(cached);
      }
      if (tracksData.length > 0) {
        setTracks(tracksData);
      }
      
      // 2. Fetch Questions to cache for offline test taking
      try {
        const questionsRes = await fetch("/api/questions");
        if (questionsRes.ok) {
          const qData = await questionsRes.json();
          localStorage.setItem("cached_questions", JSON.stringify(qData));
        }
      } catch (err) {
        console.warn("Failed retrieving questions, will fallback to local storage:", err);
      }

      // 3. Fetch Submissions from Firestore
      let subsTemp: QuizSubmission[] = [];
      try {
        let subSnap;
        if (currentRole === "Teacher") {
          subSnap = await getDocs(collection(db, "submissions"));
        } else {
          const studentIdToQuery = user?.uid || "2504796";
          const q = query(collection(db, "submissions"), where("studentId", "==", studentIdToQuery));
          subSnap = await getDocs(q);
        }

        if (subSnap && typeof subSnap.forEach === "function") {
          subSnap.forEach((doc: any) => {
            const d = doc.data();
            subsTemp.push({
              id: doc.id,
              studentId: d.studentId || "2504796",
              studentName: d.studentName || "John Doe",
              trackId: d.trackId || "webdev",
              timestamp: d.timestamp || new Date().toISOString(),
              answers: d.answers || [],
              score: d.score || 0,
              tagScores: d.tagScores || { Coding: 50, Logic: 50, "Soft Skills": 50 },
              jobReadinessScore: d.jobReadinessScore || 50,
              improvementVelocity: d.improvementVelocity || 0,
            });
          });
        }
        localStorage.setItem("cached_submissions", JSON.stringify(subsTemp));
      } catch (err) {
        console.warn("Firestore submissions loading bypassed or deferred, retrieving from local cache:", err);
        const cached = localStorage.getItem("cached_submissions");
        if (cached) {
          subsTemp = JSON.parse(cached);
        }
      }
      subsTemp.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setSubmissions(subsTemp);

      // 4. Fetch SMS logs from Firestore
      let smsTemp: SMSLog[] = [];
      try {
        let smsSnap = await getDocs(collection(db, "smsLogs"));
        if (smsSnap && typeof smsSnap.forEach === "function") {
          smsSnap.forEach((doc: any) => {
            const d = doc.data();
            smsTemp.push({
              id: doc.id,
              timestamp: d.timestamp || new Date().toISOString(),
              recipientPhone: d.recipientPhone || "",
              message: d.message || "",
              provider: d.provider || "Africa's Talking",
              status: d.status || "Delivered",
              apiPayload: d.apiPayload || "{}",
            });
          });
        }
        localStorage.setItem("cached_sms_logs", JSON.stringify(smsTemp));
      } catch (err) {
        console.warn("Firestore SMS logs loading bypassed, pulling from local cache:", err);
        const cached = localStorage.getItem("cached_sms_logs");
        if (cached) {
          smsTemp = JSON.parse(cached);
        }
      }
      smsTemp.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setSmsLogs(smsTemp);

    } catch (error) {
      console.error("Error fetching initial backend data:", error);
    }
  };

  // Toast trigger helper
  const showToast = (text: string, type: "success" | "warning" | "info") => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 5000);
  };

  // Handle Offline Simulation Toggle (Optimistic local cache triggers)
  const handleOfflineToggle = () => {
    const nextOffline = !isOffline;
    setIsOffline(nextOffline);

    if (nextOffline) {
      showToast(
        "Campus Wi-Fi disconnected (Simulation). Assessment progress is cached locally in browser Storage.",
        "warning"
      );
    } else {
      // Toggled back online: Check for pending cached submission to sync
      showToast("Campus Wi-Fi restored! Initiating optimistic sync sequence.", "info");
      triggerOfflineSync();
    }
  };

  const triggerOfflineSync = async () => {
    const cachedAnswersStr = localStorage.getItem("pending_quiz_submission");
    if (cachedAnswersStr) {
      try {
        const payload = JSON.parse(cachedAnswersStr);
        showToast("Synchronizing cached results with KCA central servers...", "info");

        const response = await fetch("/api/assessments/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const result = await response.json();
          // Remove cache link
          localStorage.removeItem("pending_quiz_submission");
          
          // Re-fetch updated submissions & SMS logs
          await fetchInitialData();
          
          showToast(
            "Central database successfully updated! Offline runs synchronized.",
            "success"
          );

          // Update actively viewable result if appropriate
          if (selectedTrackId === payload.trackId) {
            setActiveResult(result.submission);
            setActiveScreen("results");
          }
        }
      } catch (error) {
        console.error("Synchronization loop issue:", error);
        showToast("Sync failed. Local data remains safe inside secure browser cache.", "warning");
      }
    }
  };

  // Launch Assessment
  const handleSelectTrack = async (trackId: string) => {
    setSelectedTrackId(trackId);
    setAnsweredQuestionIds([]);
    setAccumulatedAnswers([]);
    setCurrentSlideIndex(1);
    setIsFinishingQuiz(false);
    setActiveResult(null);
    setActiveRoadmap(null);

    // Fetch the very first question from the Adaptive Testing server engine
    await fetchNextAdaptiveQuestion(trackId, [], null, null, null);
    setActiveScreen("assessment");
  };

  // Query server Adaptive Testing engine to decide the next question
  const fetchNextAdaptiveQuestion = async (
    trackId: string,
    historyIds: string[],
    lastCorrect: boolean | null,
    lastTag: string | null,
    lastDifficulty: string | null
  ) => {
    // Elegant client-side adaptive test simulation when offline
    if (isOffline) {
      let cachedQs: Question[] = [];
      try {
        const str = localStorage.getItem("cached_questions");
        if (str) {
          cachedQs = JSON.parse(str);
        }
      } catch (e) {
        console.error("Failed to parse cached questions", e);
      }

      // Fallback questions to prevent cold starts
      if (cachedQs.length === 0) {
        cachedQs = [
          { id: "wd-c-easy", trackId: "webdev", text: "Which HTML5 element is most semantically appropriate for wrapping a primary navigation menu?", options: ["<nav>", "<section>", "<div>", "<menu-bar>"], correctOptionIndex: 0, difficulty: "Easy", tag: "Coding", explanation: "The <nav> element represents navigation links." },
          { id: "wd-c-med", trackId: "webdev", text: "Which of the following describes how React's Virtual DOM optimizes rendering?", options: ["It re-downloads page", "It builds in-memory representation, diffs, and batch-updates DOM", "Bypasses engine", "Global variables"], correctOptionIndex: 1, difficulty: "Medium", tag: "Coding", explanation: "Lightweight representation for minimum diff pain." },
          { id: "wd-c-hard", trackId: "webdev", text: "In JavaScript, what is the exact output of: console.log(1 + '2' + 3)?", options: ["6", "15", "'123'", "NaN"], correctOptionIndex: 2, difficulty: "Hard", tag: "Coding", explanation: "String coercion concatenating values LHS to RHS." },
          { id: "wd-l-easy", trackId: "webdev", text: "If all arrays are objects, and some objects are iterable, which of the following MUST be true?", options: ["All arrays are iterable", "No arrays are iterable", "Some arrays might be objects", "All arrays are objects"], correctOptionIndex: 3, difficulty: "Easy", tag: "Logic", explanation: "Explicit premise." },
          { id: "wd-l-med", trackId: "webdev", text: "You need to retrieve an item frequently from an unsorted dataset of 1,000,000 unique records. Which structure gives O(1) average lookup complexity?", options: ["Sorted Array", "Linked List", "Hash Map / Object Lookup", "BST"], correctOptionIndex: 2, difficulty: "Medium", tag: "Logic", explanation: "Direct bucket index maps." },
          { id: "wd-l-hard", trackId: "webdev", text: "What is the worst-case space complexity of a recursively implemented Depth-First Search (DFS) on a graph with V vertices and E edges?", options: ["O(1)", "O(V)", "O(E)", "O(V * E)"], correctOptionIndex: 1, difficulty: "Hard", tag: "Logic", explanation: "Recursive stack stores linear frames." },
          { id: "wd-s-easy", trackId: "webdev", text: "A client sends an angry email stating that a font on their landing page is slightly hard to read. What is the most constructive response?", options: ["Apologize and adjust", "Ignore", "Argue", "Blame the browser"], correctOptionIndex: 0, difficulty: "Easy", tag: "Soft Skills", explanation: "Constructive response." }
        ];
      }

      const history = historyIds || [];
      const answeredQuestions = history.map((id) => cachedQs.find((q) => q.id === id)).filter(Boolean) as Question[];

      // Calculate category balance stats
      const stats = {
        Coding: answeredQuestions.filter((q) => q.tag === "Coding").length,
        Logic: answeredQuestions.filter((q) => q.tag === "Logic").length,
        "Soft Skills": answeredQuestions.filter((q) => q.tag === "Soft Skills").length,
      };

      // Determine current tag (round robin balance)
      let currentTag: "Coding" | "Logic" | "Soft Skills" = "Coding";
      if (stats.Coding <= stats.Logic && stats.Coding <= stats["Soft Skills"]) {
        currentTag = "Coding";
      } else if (stats.Logic <= stats["Soft Skills"]) {
        currentTag = "Logic";
      } else {
        currentTag = "Soft Skills";
      }

      // Adaptive difficulty logic
      let nextDifficulty: "Easy" | "Medium" | "Hard" = "Medium";
      if (lastTag && lastDifficulty) {
        if (lastCorrect) {
          if (lastDifficulty === "Easy") nextDifficulty = "Medium";
          else if (lastDifficulty === "Medium") nextDifficulty = "Hard";
          else nextDifficulty = "Hard";
        } else {
          if (lastDifficulty === "Hard") nextDifficulty = "Medium";
          else if (lastDifficulty === "Medium") nextDifficulty = "Easy";
          else nextDifficulty = "Easy";
        }
      }

      // Filter pools
      let pool = cachedQs.filter(
        (q) => q.trackId === trackId && q.tag === currentTag && !history.includes(q.id)
      );

      let targetQuestion = pool.find((q) => q.difficulty === nextDifficulty);
      if (!targetQuestion && pool.length > 0) {
        targetQuestion = pool[0];
      }
      if (!targetQuestion) {
        pool = cachedQs.filter((q) => q.trackId === trackId && !history.includes(q.id));
        targetQuestion = pool[0];
      }

      if (targetQuestion && history.length < 6) {
        setCurrentQuestion(targetQuestion);
      } else {
        // All questions done or 6 answered
        await triggerQuizSubmission();
      }
      return;
    }

    try {
      const response = await fetch("/api/assessments/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackId,
          answeredQuestionIds: historyIds,
          lastAnswerWasCorrect: lastCorrect,
          lastQuestionTag: lastTag,
          lastQuestionDifficulty: lastDifficulty,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.isFinished || !data.question) {
          // Reached peak adaptive diagnostic boundary - Submit complete payload
          await triggerQuizSubmission();
        } else {
          setCurrentQuestion(data.question);
        }
      }
    } catch (error) {
      console.error("Error retrieving next adaptive slide question:", error);
      showToast("Unable to communicate with adaptive server engine.", "warning");
    }
  };

  // Push individual choice to progress vectors
  const handleAnswerSubmit = async (questionId: string, selectedOptionIndex: number, timeTaken: number) => {
    if (!currentQuestion) return;

    const isCorrect = selectedOptionIndex === currentQuestion.correctOptionIndex;
    const currentAnswer = {
      questionId,
      selectedOptionIndex,
      isCorrect,
      timeTakenSeconds: timeTaken,
      difficulty: currentQuestion.difficulty,
      tag: currentQuestion.tag,
      text: currentQuestion.text,
      options: currentQuestion.options,
      correctOptionIndex: currentQuestion.correctOptionIndex,
      explanation: currentQuestion.explanation,
    };

    const nextAnswersList = [...accumulatedAnswers, currentAnswer];
    const nextHistoryIds = [...answeredQuestionIds, questionId];

    setAccumulatedAnswers(nextAnswersList);
    setAnsweredQuestionIds(nextHistoryIds);

    // If we have answered 6 questions, evaluate peak threshold
    if (nextAnswersList.length >= 6) {
      setIsFinishingQuiz(true);
      await triggerQuizSubmission(nextAnswersList);
    } else {
      setCurrentSlideIndex((prev) => prev + 1);
      // Determine the next question adapting difficulty to last outcome
      await fetchNextAdaptiveQuestion(
        selectedTrackId!,
        nextHistoryIds,
        isCorrect,
        currentQuestion.tag,
        currentQuestion.difficulty
      );
    }
  };

  // Submit collected diagnostic responses to compile Readiness scores and simulate SMS Africa's Talking dispatches
  const triggerQuizSubmission = async (answersToPush?: any[]) => {
    const finalAnswers = answersToPush || accumulatedAnswers;
    const recipientPhone = "+254 712 345 678"; // Simulated Kenyan student phone

    const payload = {
      studentId: user?.uid || "2504796",
      studentName: studentName,
      trackId: selectedTrackId!,
      answers: finalAnswers,
      recipientPhone,
    };

    // If offline, cache payload locally (PWA/Offline-first compliance) and construct temporary mock output
    if (isOffline) {
      localStorage.setItem("pending_quiz_submission", JSON.stringify(payload));
      showToast(
        "Diagnostic finished offline! Progress saved in local queue. Sync pending restoration of Wi-Fi.",
        "warning"
      );

      const correctCount = finalAnswers.filter((a) => a.isCorrect).length;
      const computedScore = finalAnswers.length > 0 ? Math.round((correctCount / finalAnswers.length) * 100) : 0;

      const dynamicTagScores = { Coding: 50, Logic: 50, "Soft Skills": 50 };
      const skills = ["Coding", "Logic", "Soft Skills"] as const;
      skills.forEach((sk) => {
        const answersForTag = finalAnswers.filter((a) => a.tag === sk);
        if (answersForTag.length > 0) {
          const correctForTag = answersForTag.filter((a) => a.isCorrect);
          dynamicTagScores[sk] = Math.round((correctForTag.length / answersForTag.length) * 100);
        }
      });

      const improvementVelocity = Math.round((computedScore / 10 * 0.6) * 10) / 10;

      // Construct temporary local result for student study continuation
      const mockResult: QuizSubmission = {
        id: `sub-offline-${Date.now()}`,
        studentId: user?.uid || "2504796",
        studentName: studentName,
        trackId: selectedTrackId!,
        timestamp: new Date().toISOString(),
        answers: finalAnswers,
        score: computedScore,
        tagScores: dynamicTagScores,
        jobReadinessScore: computedScore,
        improvementVelocity: improvementVelocity,
      };

      try {
        await setDoc(doc(db, "submissions", mockResult.id), mockResult);
      } catch (e) {
        console.error("Local save direct to db error (might be offline):", e);
      }

      setSubmissions((prev) => [mockResult, ...prev]);
      setActiveResult(mockResult);
      setIsFinishingQuiz(false);
      setActiveScreen("results");
      return;
    }

    // Standard Online workflow - Submit to API endpoint
    try {
      const response = await fetch("/api/assessments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Persist synchronously to Firestore (Durable Cloud DB compliance)
        try {
          await setDoc(doc(db, "submissions", data.submission.id), data.submission);
          await setDoc(doc(db, "smsLogs", data.smsLog.id), data.smsLog);
        } catch (dbErr) {
          console.error("Firebase Sync issue:", dbErr);
        }

        setSubmissions((prev) => [data.submission, ...prev]);
        setSmsLogs((prev) => [data.smsLog, ...prev]);
        setActiveResult(data.submission);
        showToast("Assessment results compiled! SMS sent via Africa's Talking Simulator.", "success");
      }
    } catch (error) {
      console.error("Submission compiled issue:", error);
      showToast("Network failure. Results temporarily loaded in client sandbox.", "warning");
    } finally {
      setIsFinishingQuiz(false);
      setActiveScreen("results");
    }
  };

  // Generate Career Roadmap utilizing Gemini API
  const handleGenerateRoadmap = async () => {
    if (!activeResult) return;
    setIsGeneratingRoadmap(true);
    showToast("AI Assistant Advisor assembling YouTube specs and local KCA Reserves shelf codes...", "info");

    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId: activeResult.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setActiveRoadmap(data);
        setActiveScreen("roadmap");
        showToast("Career roadmap successfully plotted!", "success");
      }
    } catch (error) {
      console.error("AI Advisor generation error:", error);
      showToast("Unable to reach AI advising agent. Providing offline fallback guidelines.", "warning");
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  // Teacher Custom Questions compilation
  const handleAddQuestion = async (questionPayload: any) => {
    try {
      const response = await fetch("/api/questions/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionPayload),
      });
      if (response.ok) {
        const data = await response.json();
        
        // Secure saving in Firestore
        try {
          if (data.question) {
            await setDoc(doc(db, "questions", data.question.id), data.question);
          }
        } catch (dbErr) {
          console.error("Firestore question log error:", dbErr);
        }

        showToast("Custom classroom review metric integrated!", "success");
        return true;
      }
    } catch (error) {
      console.error(error);
      showToast("Unable to log custom item.", "warning");
    }
    return false;
  };

  // Simulated Custom SMS dispatching
  const handleTriggerSimulateText = async (phone: string, text: string) => {
    const payload = {
      username: "kca_tech_hackathon",
      to: phone,
      message: text,
      from: "SKILLPATH",
    };

    const newSMS: SMSLog = {
      id: `sms-sim-${Date.now()}`,
      timestamp: new Date().toISOString(),
      recipientPhone: phone,
      message: text,
      provider: "Africa's Talking",
      status: "Delivered",
      apiPayload: JSON.stringify(payload, null, 2),
    };

    try {
      await setDoc(doc(db, "smsLogs", newSMS.id), newSMS);
    } catch (dbErr) {
      console.error("Firestore SMS log error:", dbErr);
    }

    setSmsLogs((prev) => [newSMS, ...prev]);
    showToast(`Simulation SMS successfully dispatched to ${phone}!`, "success");
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showToast("Successfully logged out of KCA Technical Portal.", "success");
    } catch (e) {
      console.error("Sign out error:", e);
    }
  };

  // Identify track helper
  const activeTrack = tracks.find((t) => t.id === selectedTrackId);

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="h-12 w-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <GraduationCap className="h-6 w-6 text-emerald-400 absolute inset-0 m-auto" />
        </div>
        <p className="text-xs font-mono tracking-widest text-[#10B981] uppercase">Synchronizing with KCA Security Nodes...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <LandingPage 
        onSignInSuccess={(signedInUser, detectedRole) => {
          setUser(signedInUser);
          setCurrentRole(detectedRole);
          setStudentName(signedInUser.name || signedInUser.displayName || "KCA Student");
        }} 
      />
    );
  }

  return (
    <div className={`min-h-screen pb-16 flex flex-col justify-between transition-colors duration-300 ${
      highContrast ? "high-contrast bg-neutral-900" : "bg-[#0A0A0A]"
    }`} id="application-root">
      
      {/* Top Navigation banner header */}
      <Header
        currentRole={currentRole}
        onRoleChange={(role) => setCurrentRole(role)}
        isOffline={isOffline}
        onOfflineToggle={handleOfflineToggle}
        highContrast={highContrast}
        onHighContrastToggle={() => setHighContrast(!highContrast)}
        studentName={studentName}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Main Core Content Container structured responsive layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full" id="curriculum-stage">
        
        {/* Dynamic sliding global feedback toast */}
        {toastMessage && (
          <div
            className={`fixed top-20 right-4 z-50 p-4 rounded-2xl shadow-2xl border flex items-center space-x-3 max-w-sm animate-fade-in ${
              toastMessage.type === "success" ? "bg-[#121212] text-emerald-400 border-emerald-500/20" :
              toastMessage.type === "warning" ? "bg-[#121212] text-amber-500 border-amber-500/20" :
              "bg-[#121212] text-teal-400 border-teal-500/20"
            }`}
            id="global-indicator-toast"
          >
            <AlertCircle className={`h-5 w-5 shrink-0 ${
              toastMessage.type === "success" ? "text-emerald-400" :
              toastMessage.type === "warning" ? "text-amber-500" :
              "text-teal-450"
            }`} />
            <p className="text-xs font-semibold leading-relaxed">{toastMessage.text}</p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8" id="layout-grid">
          {/* Active Work Portal panel (Student/Educator) */}
          <div className="xl:col-span-3 space-y-8" id="work-canvas">
            {currentRole === "Teacher" ? (
              <TeacherPortal
                submissions={submissions}
                tracks={tracks}
                onAddQuestion={handleAddQuestion}
              />
            ) : (
              /* Student screens switcher */
              <>
                {activeScreen === "tracks" && (
                  <div className="space-y-4">
                    {/* Student customizable identity config */}
                    <div className="bg-[#121212] p-4 rounded-2xl border border-white/5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-white font-sans">Student Profile Configuration</h4>
                        <p className="text-[10px] text-gray-400">Add your custom name to personalize career advice outputs.</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          className="bg-[#0F0F0F] border border-white/5 text-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-emerald-500/40"
                          placeholder="Your Name"
                          aria-label="Student name customizable input"
                        />
                      </div>
                    </div>

                    <TrackList
                      tracks={tracks}
                      onSelectTrack={handleSelectTrack}
                      studentName={studentName}
                    />
                  </div>
                )}

                {activeScreen === "assessment" && (
                  <AssessmentEngine
                    currentTrackName={activeTrack ? activeTrack.name : "Engineering Assessment"}
                    isOffline={isOffline}
                    onAnswerSubmit={handleAnswerSubmit}
                    onFinish={triggerQuizSubmission}
                    currentQuestion={currentQuestion}
                    currentIndex={currentSlideIndex}
                    totalQuestions={6}
                    isSubmitting={isFinishingQuiz}
                  />
                )}

                {activeScreen === "results" && activeResult && activeTrack && (
                  <ResultsPortal
                    submission={activeResult}
                    track={activeTrack}
                    onTakeAgain={() => setActiveScreen("tracks")}
                    onGenerateRoadmap={handleGenerateRoadmap}
                    isGeneratingRoadmap={isGeneratingRoadmap}
                    questionsList={accumulatedAnswers.length > 0 ? accumulatedAnswers.map((a: any) => ({
                      id: a.questionId,
                      text: a.text || "Verify concept answers on diagnostics review",
                      options: a.options || [],
                      correctOptionIndex: a.correctOptionIndex !== undefined ? a.correctOptionIndex : 0,
                      explanation: a.explanation || "",
                    })) : [
                      { id: "wd-c-easy", text: "Which HTML5 element is most semantically appropriate for wrapping a primary navigation menu?", options: ["<nav>", "<section>", "<div>", "<menu-bar>"], correctOptionIndex: 0, explanation: "The <nav> element represents navigation links." },
                      { id: "wd-c-med", text: "Which of the following describes how React's Virtual DOM optimizes rendering?", options: ["It re-downloads page", "It builds in-memory representation, diffs, and batch-updates DOM", "Bypasses engine", "Global variables"], correctOptionIndex: 1, explanation: "Lightweight representation for minimum diff pain." },
                      { id: "wd-c-hard", text: "In JavaScript, what is the exact output of: console.log(1 + '2' + 3)?", options: ["6", "15", "'123'", "NaN"], correctOptionIndex: 2, explanation: "String coercion concatenating values LHS to RHS." },
                      { id: "wd-l-easy", text: "If all arrays are objects, and some objects are iterable, which of the following MUST be true?", options: ["All arrays are iterable", "No arrays are iterable", "Some arrays might be objects", "All arrays are objects"], correctOptionIndex: 3, explanation: "Explicit premise." },
                      { id: "wd-l-med", text: "You need to retrieve an item frequently from an unsorted dataset of 1,000,000 unique records. Which structure gives O(1) average lookup complexity?", options: ["Sorted Array", "Linked List", "Hash Map / Object Lookup", "BST"], correctOptionIndex: 2, explanation: "Direct bucket index maps." },
                      { id: "wd-l-hard", text: "What is the worst-case space complexity of a recursively implemented Depth-First Search (DFS) on a graph with V vertices and E edges?", options: ["O(1)", "O(V)", "O(E)", "O(V * E)"], correctOptionIndex: 1, explanation: "Recursive stack stores linear frames." }
                    ]}
                  />
                )}

                {activeScreen === "roadmap" && activeRoadmap && (
                  <RoadmapAdvisor
                    roadmap={activeRoadmap}
                    onClose={() => setActiveScreen("tracks")}
                  />
                )}
              </>
            )}
          </div>

          {/* Sidebar Area: Multi-tool Sidebars */}
          <div className="space-y-6" id="contextual-complementary-tools">
            {/* Secure Session & Identity Hub (Logout Section) */}
            <div className="bg-[#121212] rounded-3xl p-5 border border-white/5 shadow-sm space-y-4" id="session-security-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <h4 className="text-xs font-extrabold text-white font-sans uppercase tracking-wider">KCA Technical Identity</h4>
                </div>
                <span className="px-2 py-0.5 text-[9px] uppercase font-mono bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                  Active
                </span>
              </div>

              <div className="space-y-2.5 bg-[#0A0A0A]/60 p-3 rounded-2xl border border-white/[0.03]">
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-white/[0.04] rounded-xl border border-white/5 text-gray-450">
                    <User className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-white truncate">
                      {user ? user.displayName || user.name : (currentRole === "Student" ? studentName : "Dr. Mary Mwangi")}
                    </p>
                    <p className="text-[10px] font-mono text-gray-500 truncate">
                      {user ? user.email : (currentRole === "Student" ? "2504796@students.kcau.ac.ke" : "dept.cs@kcau.ac.ke")}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                  <span className="text-gray-450 font-semibold">Assigned Role:</span>
                  <span className="font-extrabold text-emerald-400 font-mono tracking-wide">
                    {currentRole === "Student" ? "Student Core Dev" : "Department Educator"}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-gray-400 leading-relaxed font-medium">
                You are securely connected to the KCA-Firebase authentication service node. Log out when using shared campus lab computers.
              </p>

              <button
                onClick={handleSignOut}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold tracking-wide text-red-400 hover:text-red-300 border border-red-500/10 hover:border-red-500/35 bg-red-500/5 hover:bg-red-500/10 transition-all cursor-pointer flex items-center justify-center space-x-2 shadow-sm"
                id="sidebar-logout-button"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out Securely</span>
              </button>
            </div>

            {/* KCA University Offline Synchronizer Control Center */}
            <OfflineHub
              isOffline={isOffline}
              onOfflineToggle={handleOfflineToggle}
              onForceSync={triggerOfflineSync}
            />

            {/* Tutor bot widget siempre visible */}
            <TutorBot contextSubmissionId={activeResult?.id} />
          </div>
        </div>

      </main>

      {/* Footer copyright */}
      <footer className="bg-slate-900 text-slate-500 py-6 border-t border-slate-800 text-center text-[11px] font-medium mt-12" id="app-footer">
        <div className="max-w-7xl mx-auto px-4">
          <p>© 2026 SkillPath AI - Joint hackathon submission for KCA University Tech Club. Preserving SDG 4 & 8.</p>
          <p className="text-slate-600 mt-1">Compiled in sandbox - Express backend listening on port 3000.</p>
        </div>
      </footer>
    </div>
  );
}

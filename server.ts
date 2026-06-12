import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { QuizSubmission, SMSLog, SkillTag, RoadmapRecommendation } from "./src/types";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Shared Gemini API setup with lazy-initialization
let geminiClient: any = null;
function getGeminiClient() {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
      geminiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return geminiClient;
}

// Global Mock Database
let tracks = [
  {
    id: "webdev",
    name: "Junior Web Developer",
    description: "Build interactive client-side and full-stack web applications using modern frameworks.",
    icon: "Code",
    industryStandard: {
      Coding: 85,
      Logic: 80,
      "Soft Skills": 75,
    },
  },
  {
    id: "dataanalyst",
    name: "Python Data Analyst",
    description: "Extract insights, run statistics, and design visuals using Python, SQL, and Pandas.",
    icon: "BarChart3",
    industryStandard: {
      Coding: 75,
      Logic: 90,
      "Soft Skills": 70,
    },
  },
  {
    id: "cloudsys",
    name: "Cloud Systems Operator",
    description: "Manage servers, pipelines, and deploy secure containerized networks in the cloud.",
    icon: "Cloud",
    industryStandard: {
      Coding: 70,
      Logic: 85,
      "Soft Skills": 80,
    },
  },
];

let questions = [
  // --- WEB DEVELOPER QUESTIONS ---
  // Coding
  {
    id: "wd-c-easy",
    trackId: "webdev",
    text: "Which HTML5 element is most semantically appropriate for wrapping a primary navigation menu?",
    options: ["<nav>", "<section>", "<div>", "<menu-bar>"],
    correctOptionIndex: 0,
    difficulty: "Easy",
    tag: "Coding",
    explanation: "The <nav> element represents a section of a page whose purpose is to provide navigation links.",
  },
  {
    id: "wd-c-med",
    trackId: "webdev",
    text: "Which of the following describes how React's Virtual DOM optimizes rendering?",
    options: [
      "It re-downloads the entire page code from the server on every state change.",
      "It builds a lightweight representation of the UI in memory, diffs it with the previous state, and makes batch updates to the real DOM.",
      "It bypasses JavaScript compiler steps for raw GPU rendering.",
      "It makes all variables global to avoid closure costs.",
    ],
    correctOptionIndex: 1,
    difficulty: "Medium",
    tag: "Coding",
    explanation: "React keeps a virtual representation in memory. Diffs are compared using a heuristic algorithm, then the real DOM is surgically updated in a single pass.",
  },
  {
    id: "wd-c-hard",
    trackId: "webdev",
    text: "In JavaScript, what is the exact output of: console.log(1 + '2' + 3)?",
    options: ["6", "15", "'123'", "NaN"],
    correctOptionIndex: 2,
    difficulty: "Hard",
    tag: "Coding",
    explanation: "Evaluated from left to right: (1 + '2') results in string coercion '12', and then concatenating 3 gives the string '123'.",
  },
  // Logic
  {
    id: "wd-l-easy",
    trackId: "webdev",
    text: "If all arrays are objects, and some objects are iterable, which of the following MUST be true?",
    options: [
      "All arrays are iterable",
      "No arrays are iterable",
      "Some arrays might be objects, but some are not",
      "All arrays are objects",
    ],
    correctOptionIndex: 3,
    difficulty: "Easy",
    tag: "Logic",
    explanation: "The premise directly states 'all arrays are objects'. Therefore, if x is an array, it must be an object.",
  },
  {
    id: "wd-l-med",
    trackId: "webdev",
    text: "You need to retrieve an item frequently from an unsorted dataset of 1,000,000 unique records. Which structure gives O(1) average lookup complexity?",
    options: ["Sorted Array (Binary Search)", "Singly Linked List", "Hash Map / Object Lookup", "Binary Search Tree"],
    correctOptionIndex: 2,
    difficulty: "Medium",
    tag: "Logic",
    explanation: "A Hash Map maps keys directly to buckets via a hashing function, achieving O(1) average lookup, whereas sorted arrays require O(log N) and lists require O(N).",
  },
  {
    id: "wd-l-hard",
    trackId: "webdev",
    text: "What is the worst-case space complexity of a recursively implemented Depth-First Search (DFS) on a graph with V vertices and E edges?",
    options: ["O(1)", "O(V) due to the call stack size", "O(E)", "O(V * E)"],
    correctOptionIndex: 1,
    difficulty: "Hard",
    tag: "Logic",
    explanation: "In the worst-case scenario (a linear chain graph), the recursive call stack depth will store V frames, resulting in O(V) auxiliary space.",
  },
  // Soft Skills
  {
    id: "wd-s-easy",
    trackId: "webdev",
    text: "A client sends an angry email stating that a font on their landing page is slightly hard to read. What is the most constructive response?",
    options: [
      "Acknowledge the feedback immediately, express willingness to adjust, and provide 2 alternative legibility options.",
      "Inform the client that font choice was signed off in the wireframe phase and cannot be altered.",
      "Ignore the email until the scheduled bi-weekly sprint report.",
      "Send them an article about modern typography theory to show their feedback is incorrect.",
    ],
    correctOptionIndex: 0,
    difficulty: "Easy",
    tag: "Soft Skills",
    explanation: "Promptly showing empathy, validating stakeholder feedback, and proactively offering legible solutions maintains client trust.",
  },
  {
    id: "wd-s-med",
    trackId: "webdev",
    text: "Your team lead recommends using a state library that you know is deprecated and has performance bottlenecks. What is the best action?",
    options: [
      "Silently write the code using a secret alternative library.",
      "Complain to the department heads about the team lead's technical incompetence.",
      "Accept the choice blindly since the lead is senior to you.",
      "Prepare a brief, objective comparison showing compilation benchmarks, future maintenance risks, and a lightweight alternative.",
    ],
    correctOptionIndex: 3,
    difficulty: "Medium",
    tag: "Soft Skills",
    explanation: "Presenting objective, professional, data-centric alternatives without criticizing authority promotes healthy collaborative engineering.",
  },
  {
    id: "wd-s-hard",
    trackId: "webdev",
    text: "A critical production outage is ongoing due to an API bug in your fresh deployment. Stakeholders are flooding the team chat demanding updates. How should you act?",
    options: [
      "Mute all messaging apps to fix the bug in complete silence without interruptions.",
      "Publish a formal 'Everything is fine' message and blame a third-party cloud outage.",
      "Provide a short, direct message acknowledging the issue, state the isolated root cause, outline the rollback and hotfix step, and detail the ETA for the next status ping.",
      "Submit your immediate resignation letter.",
    ],
    correctOptionIndex: 2,
    difficulty: "Hard",
    tag: "Soft Skills",
    explanation: "Clear, transparent communication during high-severity outages is critical. Stating the known facts, fix strategy, and accurate check-in intervals lowers panic.",
  },

  // --- PYTHON DATA ANALYST QUESTIONS ---
  // Coding
  {
    id: "da-c-easy",
    trackId: "dataanalyst",
    text: "In Pandas, which method is typically used to load a comma-separated values file into a DataFrame?",
    options: ["pd.csv_load()", "pd.read_csv()", "pd.from_csv()", "pd.open_csv()"],
    correctOptionIndex: 1,
    difficulty: "Easy",
    tag: "Coding",
    explanation: "pd.read_csv() is the standard Pandas entry point function to load tabular CSV streams into a DataFrame structure.",
  },
  {
    id: "da-c-med",
    trackId: "dataanalyst",
    text: "Which SQL clause is used to filter records AFTER an aggregation operation using GROUP BY?",
    options: ["WHERE", "FILTER", "HAVING", "LIMIT"],
    correctOptionIndex: 2,
    difficulty: "Medium",
    tag: "Coding",
    explanation: "While WHERE filters rows before aggregation, HAVING is applied to filter aggregate values generated by the GROUP BY clause.",
  },
  {
    id: "da-c-hard",
    trackId: "dataanalyst",
    text: "In Pandas, what is the output of applying df.groupby('category').transform('mean') compared to df.groupby('category').mean()?",
    options: [
      "They return the exact same output shape and columns.",
      "mean() reduces the row count to match unique categories, whereas transform('mean') retains the original DataFrame index and replicates the group mean for each row.",
      "transform() is only compatible with string values, while mean() is numerical.",
      "transform() is deprecated in Pandas 2.x.",
    ],
    correctOptionIndex: 1,
    difficulty: "Medium",
    tag: "Coding",
    explanation: "transform() acts group-wise but returns a broadcasted result aligning with the original index size, ideal for centering or filling nulls.",
  },
  // Logic
  {
    id: "da-l-easy",
    trackId: "dataanalyst",
    text: "The average score of 5 hackathon groups is 80. If 4 of the groups scored 70, 75, 85, and 90, what did the 5th group score?",
    options: ["75", "80", "85", "90"],
    correctOptionIndex: 1,
    difficulty: "Easy",
    tag: "Logic",
    explanation: "Sum of scores = 5 * 80 = 400. Sum of 4 groups = 70+75+85+90 = 320. 5th score = 400 - 320 = 80.",
  },
  {
    id: "da-l-med",
    trackId: "dataanalyst",
    text: "A web store tests a discount rate (A/B testing). Group A had a 2% conversion rate on 10,000 visitors. Group B had a 2.5% conversion rate on 10,000 visitors. To verify if this is a random wobble, which statistical measure should you run?",
    options: ["P-value via Chi-Square test or T-test", "Pearson correlation coefficient", "R-squared value", "Standard Deviation"],
    correctOptionIndex: 0,
    difficulty: "Medium",
    tag: "Logic",
    explanation: "Testing proportions and frequencies for statistical significance requires computing the probability value (P-value) using a Chi-Square or two-sample Z/T-test.",
  },
  {
    id: "da-l-hard",
    trackId: "dataanalyst",
    text: "If a prediction model has a low training error but a very high test error, what symptom does it demonstrate, and how can it be fixed?",
    options: [
      "Underfitting; fix it by deleting critical columns.",
      "Overfitting; fix it by using simpler model structures, applying regularization (L1/L2), or introducing dropout and validation samples.",
      "High bias; fix it by increasing model parameters.",
      "Data leakage; fix it by copying training samples to testing sets.",
    ],
    correctOptionIndex: 1,
    difficulty: "Hard",
    tag: "Logic",
    explanation: "The model has memorized the noise of the training data. Regularization, pruning, or feeding more diverse data helps mitigate overfitting.",
  },
  // Soft Skills
  {
    id: "da-s-easy",
    trackId: "dataanalyst",
    text: "Your chart has a complicated logarithmic scale that puzzles business stakeholders. What is the most appropriate action?",
    options: [
      "Tell them that logs are fundamental and they need to read a statistics paper.",
      "Design an alternative dual-axis or split dashboard using absolute numbers alongside plain explanations of why ratios are plotted.",
      "Remove the chart entirely and present no data.",
      "Email them the exact high-dimensional matrix table without comments.",
    ],
    correctOptionIndex: 1,
    difficulty: "Easy",
    tag: "Soft Skills",
    explanation: "Data analysts translate complexities. Bridging technical concepts with intuitive visual tools ensures stakeholders make informed outcomes.",
  },
  {
    id: "da-s-med",
    trackId: "dataanalyst",
    text: "A director asks you to skew the axis of a dashboard to make the recent quarter's performance look 500% larger than it is. What do you do?",
    options: [
      "Obey immediately to secure your quarterly bonus.",
      "Explain the ethical guidelines of data integrity, and show that a skewed layout backfires during rigorous third-party audits. Offer a clean chart displaying the true growth alongside positive explanatory notes.",
      "Silently delete the database.",
      "Publicly humiliate the director on social media.",
    ],
    correctOptionIndex: 1,
    difficulty: "Medium",
    tag: "Soft Skills",
    explanation: "Honorable data practices require resisting distortion while offering constructive, factual alternatives to showcase strategic values.",
  },
  {
    id: "da-s-hard",
    trackId: "dataanalyst",
    text: "Your regression model predicted that a marketing campaign would bring in $50,000 in sales, but actual tracking shows only $5,000. stakeholder meetings are in 1 hour. How do you prepare?",
    options: [
      "Run statistical diagnostic tests to isolate the false assumption, document the learning parameters, and draft a revision plan to show how real feedback models are calibrated.",
      "Fabricate marketing analytics logs to match the $50,000 prediction.",
      "Skip the meeting entirely.",
      "Argue that the tracker is broken and blame the engineering developers.",
    ],
    correctOptionIndex: 0,
    difficulty: "Hard",
    tag: "Soft Skills",
    explanation: "Acknowledging modeling discrepancies with precise error analysis and corrective calibration steps showcases mature, high-value technical leadership.",
  },
  // --- CLOUD SYSTEMS OPERATOR QUESTIONS ---
  // Coding
  {
    id: "cs-c-easy",
    trackId: "cloudsys",
    text: "Which Docker container command is used to run a container in the background (detached mode)?",
    options: ["docker run -d <image>", "docker run -it <image>", "docker run --fg <image>", "docker run -b <image>"],
    correctOptionIndex: 0,
    difficulty: "Easy",
    tag: "Coding",
    explanation: "The '-d' or '--detach' flag runs the container in the background of your terminal, printing the container ID.",
  },
  {
    id: "cs-c-med",
    trackId: "cloudsys",
    text: "How does a multi-stage Dockerfile optimize container images?",
    options: [
      "By allowing multiple FROM statements so we can build binaries in a heavy environment but copy only compile fruits into a minimal runtime image.",
      "By multi-threading CPU nodes inside container networks.",
      "By using compressed zip archives for build logs.",
      "By bypassing local storage compilation completely.",
    ],
    correctOptionIndex: 0,
    difficulty: "Medium",
    tag: "Coding",
    explanation: "Multi-stage builds permit copying output artifacts from intermediate build layers into a pristine, tiny base image, shedding compile-time tools.",
  },
  {
    id: "cs-c-hard",
    trackId: "cloudsys",
    text: "Given a Kubernetes Deployment with a rolling update strategy, what is the effect of setting 'maxSurge' to 2 and 'maxUnavailable' to 0?",
    options: [
      "It allows 2 extra pods above the desired state during scale, ensuring zero active pods ever go offline during a rollout.",
      "It deletes all old pods immediately, then starts all new pods at once.",
      "It crashes the cluster controller because these parameters conflict.",
      "It ensures only 1 pod is updated at a time regardless of desired replicas.",
    ],
    correctOptionIndex: 0,
    difficulty: "Hard",
    tag: "Coding",
    explanation: "Max-unavailable = 0 guarantees that no pods are terminated before new variants are healthy, while maxSurge = 2 allows up to two extra pods to be provisioned during transitions.",
  },
  // Logic
  {
    id: "cs-l-easy",
    trackId: "cloudsys",
    text: "How many usable host IP directory allocations are provided by an IPv4 subnet configured with /29 CIDR notation?",
    options: ["6 usable IPs", "8 usable IPs", "14 usable IPs", "30 usable IPs"],
    correctOptionIndex: 0,
    difficulty: "Easy",
    tag: "Logic",
    explanation: "/29 CIDR represents 8 total IP coordinates, of which 1 is reserved for network naming and 1 for the broadcast channel, leaving 6 usable host addresses.",
  },
  {
    id: "cs-l-med",
    trackId: "cloudsys",
    text: "If an active-passive load balancer setup guarantees 99.9% uptime for the primary node and 99.9% uptime for the warm standby node, what is the theoretical overall availability of the network assuming independent failures?",
    options: ["99.9999%", "99.9%", "99.8%", "100%"],
    correctOptionIndex: 0,
    difficulty: "Medium",
    tag: "Logic",
    explanation: "Combined failure probability is (0.001) * (0.001) = 0.000001 (1 in a million), meaning theoretical uptimeavailability is 1 - 0.000001 = 99.9999%.",
  },
  {
    id: "cs-l-hard",
    trackId: "cloudsys",
    text: "In distributed cloud systems, what tradeoff does the PACELC theorem emphasize over the traditional CAP theorem when there is NO network partition?",
    options: [
      "The tradeoff between Latency (L) and Consistency (C).",
      "The tradeoff between Availability (A) and Partition Tolerance (P).",
      "The tradeoff between Encryption (E) and Storage (S).",
      "The tradeoff between Bandwidth (B) and Query Speed (Q).",
    ],
    correctOptionIndex: 0,
    difficulty: "Hard",
    tag: "Logic",
    explanation: "PACELC states: if there is a Partition (P), choose Availability (A) else Consistency (C); Else (E), choose Latency (L) versus Consistency (C).",
  },
  // Soft Skills
  {
    id: "cs-s-easy",
    trackId: "cloudsys",
    text: "You discover a developer accidentally committed a cloud provider API root private key inside a public GitHub repository. What should you immediately do?",
    options: [
      "Deactivate the key immediately at the provider dashboard, rotate credentials, clean git history logs, and constructively educate the team on secret-handling policies.",
      "Email the developer demanding an apology and wait for their reply before taking action.",
      "Delete the repository immediately without telling anyone.",
      "Do nothing, assuming bots won't scrape it.",
    ],
    correctOptionIndex: 0,
    difficulty: "Easy",
    tag: "Soft Skills",
    explanation: "Zero-latency mitigation of potential breaches represents elite security discipline.",
  },
  {
    id: "cs-s-med",
    trackId: "cloudsys",
    text: "You need to migrate a physical database server causing 2 hours of planned downtime. Stakeholders complain this will cause major business disruption. How should you proceed?",
    options: [
      "Present a detailed maintenance and roll-back guide, schedule the migration during off-peak hours (e.g., 2 AM), and set up pre-migration alerts with status page indicators.",
      "Conduct the migration during peak Friday hours to get it done quickly.",
      "Refuse the migration and tell stakeholders they are obstructing progress.",
      "Begin the migration silently without warning anyone to avoid discussions.",
    ],
    correctOptionIndex: 0,
    difficulty: "Medium",
    tag: "Soft Skills",
    explanation: "Proactive communication, scheduling during low-activity intervals, and maintaining fallback routes minimize friction and build operational trust.",
  },
  {
    id: "cs-s-hard",
    trackId: "cloudsys",
    text: "A production cluster suffers a critical out-of-memory cascading failure during a national hackathon event. Dozens of developers are frantically asking for updates in chat. How should you manage the crisis?",
    options: [
      "Designate one team member as the communication shield to post updates every 15 minutes, while the core engineering team concentrates on isolation, log analysis, and scale recovery.",
      "Engage in long chat debates defending the infrastructure's performance.",
      "Restart the servers randomly in a loop hoping the pressure eases.",
      "Turn off your phone and wait for the hackathon to end.",
    ],
    correctOptionIndex: 0,
    difficulty: "Hard",
    tag: "Soft Skills",
    explanation: "Establishing structured communications separates the resolution workspace from chaotic reporting, enabling engineers to isolate the failure faster.",
  },
];

// In-Memory state
let userSubmissions: QuizSubmission[] = [
  {
    id: "sub-1",
    studentId: "2504796",
    studentName: "John Doe (KCA Student)",
    trackId: "webdev",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    answers: [],
    score: 67,
    tagScores: { Coding: 70, Logic: 65, "Soft Skills": 65 },
    jobReadinessScore: 68,
    improvementVelocity: 5.2,
  },
  {
    id: "sub-2",
    studentId: "2504796",
    studentName: "John Doe (KCA Student)",
    trackId: "webdev",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    answers: [],
    score: 82,
    tagScores: { Coding: 85, Logic: 80, "Soft Skills": 80 },
    jobReadinessScore: 81,
    improvementVelocity: 7.8,
  },
];

let smsLogs: SMSLog[] = [
  {
    id: "sms-initial",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    recipientPhone: "+254 712 345 678",
    message: "SkillPath AI: Congratulations John! Your Junior Web Dev score was updated: 82%. Job Readiness: 81%. Recommended resources synced.",
    provider: "Africa's Talking",
    status: "Delivered",
    apiPayload: JSON.stringify({
      username: "kca_hackathon_agent",
      to: "+254712345678",
      message: "SkillPath AI: Congratulations John! Your Junior Web Dev score was updated: 82%...",
      from: "SKILLPATH",
    }, null, 2),
  },
];

// --- ENDPOINTS ---

// Tracks
app.get("/api/tracks", (req, res) => {
  res.json(tracks);
});

// Questions bank exposure for offline caching support
app.get("/api/questions", (req, res) => {
  res.json(questions);
});

// Get Adaptive Question Engine route
// Input: trackId (string), currentTagsAnsweredCount (object), tagDifficulties (object)
// Returns the next logical question adapting to their current states
app.post("/api/assessments/next", (req, res) => {
  const { trackId, answeredQuestionIds, lastAnswerWasCorrect, lastQuestionTag, lastQuestionDifficulty } = req.body;

  // Let's find remaining tags to test. We want to test Coding, Logic, Soft Skills.
  // We want to give a well-rounded 6 question assessment (2 of each tag).
  // Tag sequence logic: we alternate tags to keep the assessment engaging.
  const tagsOrder: SkillTag[] = ["Coding", "Logic", "Soft Skills"];
  
  // Count how many of each tag we've answered so far
  const history = answeredQuestionIds || [];
  const answeredQuestions = history.map((id: string) => questions.find((q) => q.id === id)).filter(Boolean);

  const stats = {
    Coding: answeredQuestions.filter((q: any) => q.tag === "Coding").length,
    Logic: answeredQuestions.filter((q: any) => q.tag === "Logic").length,
    "Soft Skills": answeredQuestions.filter((q: any) => q.tag === "Soft Skills").length,
  };

  // Determine current tag to ask
  let currentTag: SkillTag = "Coding";
  if (stats.Coding <= stats.Logic && stats.Coding <= stats["Soft Skills"]) {
    currentTag = "Coding";
  } else if (stats.Logic <= stats["Soft Skills"]) {
    currentTag = "Logic";
  } else {
    currentTag = "Soft Skills";
  }

  // Adaptive logic: Determine difficulty based on last answer of the *same tracking type* (or general progress)
  let nextDifficulty: "Easy" | "Medium" | "Hard" = "Medium"; // scale from Medium default

  if (lastQuestionTag && lastQuestionDifficulty) {
    if (lastAnswerWasCorrect) {
      if (lastQuestionDifficulty === "Easy") nextDifficulty = "Medium";
      else if (lastQuestionDifficulty === "Medium") nextDifficulty = "Hard";
      else nextDifficulty = "Hard";
    } else {
      if (lastQuestionDifficulty === "Hard") nextDifficulty = "Medium";
      else if (lastQuestionDifficulty === "Medium") nextDifficulty = "Easy";
      else nextDifficulty = "Easy";
    }
  }

  // Filter bank of unused questions for this track and tag
  let pool = questions.filter(
    (q) => q.trackId === trackId && q.tag === currentTag && !history.includes(q.id)
  );

  // Attempt to match difficulty
  let targetQuestion = pool.find((q) => q.difficulty === nextDifficulty);

  // Fallback 1: If target difficulty not found, pick first available in the pool
  if (!targetQuestion && pool.length > 0) {
    targetQuestion = pool[0];
  }

  // Fallback 2: If pool empty (all of this tag used), pick any unused question in this track
  if (!targetQuestion) {
    pool = questions.filter((q) => q.trackId === trackId && !history.includes(q.id));
    targetQuestion = pool[0];
  }

  if (targetQuestion) {
    res.json({
      question: {
        id: targetQuestion.id,
        trackId: targetQuestion.trackId,
        text: targetQuestion.text,
        options: targetQuestion.options,
        difficulty: targetQuestion.difficulty,
        tag: targetQuestion.tag,
        explanation: targetQuestion.explanation,
      },
      stats,
      isFinished: false,
    });
  } else {
    // Assessment is complete!
    res.json({
      question: null,
      stats,
      isFinished: true,
    });
  }
});

// Submit Quiz and calculate scores/predict ready metrics/dispatch simulated Africa's Talking SMS API
app.post("/api/assessments/submit", (req, res) => {
  const { studentId, studentName, trackId, answers, recipientPhone } = req.body;

  // Compute stats
  const totalQuestions = answers.length;
  const correctOnes = answers.filter((a: any) => a.isCorrect);
  const score = totalQuestions > 0 ? Math.round((correctOnes.length / totalQuestions) * 100) : 0;

  // Calculat Tag percentage
  const tags = ["Coding", "Logic", "Soft Skills"] as const;
  const tagScores = { Coding: 0, Logic: 0, "Soft Skills": 0 };
  
  tags.forEach((tag) => {
    const answersForTag = answers.filter((a: any) => a.tag === tag);
    if (answersForTag.length > 0) {
      const correctForTag = answersForTag.filter((a: any) => a.isCorrect);
      tagScores[tag] = Math.round((correctForTag.length / answersForTag.length) * 100);
    } else {
      tagScores[tag] = 50; // default baseline
    }
  });

  // Predict job readiness score: compared to target
  // Weighted: Coding 45%, Logic 35%, Soft Skills 20%
  const jobReadinessScore = Math.round(
    tagScores.Coding * 0.45 + tagScores.Logic * 0.35 + tagScores["Soft Skills"] * 0.2
  );

  // Simulated Improvement Velocity calculation
  const historicalScores = userSubmissions
    .filter((s) => s.studentId === studentId && s.trackId === trackId)
    .map((s) => s.jobReadinessScore);
  
  let improvementVelocity = 6.2; // default placeholder points gained/week
  if (historicalScores.length > 0) {
    const prevScore = historicalScores[historicalScores.length - 1];
    improvementVelocity = Math.max(0.5, parseFloat((jobReadinessScore - prevScore).toFixed(1)));
  }

  const newSubmission: QuizSubmission = {
    id: `sub-${Date.now()}`,
    studentId,
    studentName,
    trackId,
    timestamp: new Date().toISOString(),
    answers,
    score,
    tagScores,
    jobReadinessScore,
    improvementVelocity,
  };

  userSubmissions.push(newSubmission);

  // SMS Simulation (Africa's Talking spec logic)
  const phone = recipientPhone || "+254 712 345 678";
  const trackName = tracks.find((t) => t.id === trackId)?.name || "Tech Assessment";
  const smsBody = `SkillPath AI Check: Hi ${studentName}, your assessment results for ${trackName} are ready! Overall score: ${score}%. Job Readiness Score: ${jobReadinessScore}%. View your career roadmap in the console now!`;
  
  const smsLogPayload = {
    username: "kca_tech_hackathon",
    to: phone,
    message: smsBody,
    from: "SKILLPATH",
  };

  const newSMS: SMSLog = {
    id: `sms-${Date.now()}`,
    timestamp: new Date().toISOString(),
    recipientPhone: phone,
    message: smsBody,
    provider: "Africa's Talking",
    status: "Delivered",
    apiPayload: JSON.stringify(smsLogPayload, null, 2),
  };

  smsLogs.unshift(newSMS);

  res.json({
    submission: newSubmission,
    smsDispatched: true,
    smsLog: newSMS,
  });
});

// Teacher adds assessment question
app.post("/api/questions/add", (req, res) => {
  const { trackId, text, options, correctOptionIndex, difficulty, tag, explanation } = req.body;
  if (!text || !options || correctOptionIndex === undefined) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const newQuestion = {
    id: `q-custom-${Date.now()}`,
    trackId,
    text,
    options,
    correctOptionIndex,
    difficulty,
    tag,
    explanation: explanation || "Custom classroom review topic.",
  };

  questions.push(newQuestion);
  res.json({ success: true, question: newQuestion });
});

// Get Submissions (for analytics dashboards)
app.get("/api/submissions", (req, res) => {
  res.json(userSubmissions);
});

// Get SMS logs
app.get("/api/sms/logs", (req, res) => {
  res.json(smsLogs);
});

// AI Recommendations with Gemini API Grounding & detailed schemas
app.post("/api/recommendations", async (req, res) => {
  const { submissionId } = req.body;
  const submission = userSubmissions.find((s) => s.id === submissionId);

  if (!submission) {
    return res.status(404).json({ error: "Assessment submission not found" });
  }

  const track = tracks.find((t) => t.id === submission.trackId);
  const trackName = track ? track.name : "Custom Tech Track";

  const systemPrompt = `You are the Career & Technical Education Roadmap Advisor for KCA University (KCA Tech Club).
Analyze this student's assessment gap and output a comprehensive JSON matching the target schema.
Your response MUST be fully compliant with the following responseSchema. Do not include markdown code block characters around the raw JSON string; output pure clean JSON!

Target schema fields:
- trackName: name of the track
- jobReadinessScore: calculated prediction
- skillGapAnalysis: array of objects containing (skill: "Coding" | "Logic" | "Soft Skills", currentScore, targetScore, gapStatus: "Exceeds" | "On Track" | "Needs Improvement" | "Critical Gap", explanation: localized advice)
- curatedResources: array of objects containing (type: "YouTube Video" | "Official Documentation" | "KCA Library Resource", title, description, urlOrCallNumber)
- actionPlan: array of daily concrete diagnostic items.`;

  const userPrompt = `
Student: ${submission.studentName}
Assessment Track: ${trackName}
Computed Metrics:
- Coding: ${submission.tagScores.Coding}% (Target: ${track ? track.industryStandard.Coding : 80}%)
- Logic: ${submission.tagScores.Logic}% (Target: ${track ? track.industryStandard.Logic : 80}%)
- Soft Skills: ${submission.tagScores["Soft Skills"]}% (Target: ${track ? track.industryStandard["Soft Skills"] : 80}%)
Overall Predicted Job Readiness Score: ${submission.jobReadinessScore}%

Failed Tags and Topics logic:
Please generate 3 detailed real YouTube recommendations, official docs, and list real books from our 'KCA University Library Catalog' (e.g., 'KCA Reserve 005.13 JAV' or 'General Stack 658.4 MAN') matching the soft skills or programming deficits. Keep in mind, this is an incredibly professional academic advising system.`;

  try {
    const ai = getGeminiClient();
    if (ai) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              trackName: { type: Type.STRING },
              jobReadinessScore: { type: Type.NUMBER },
              skillGapAnalysis: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    skill: { type: Type.STRING, description: "Must be 'Coding', 'Logic', or 'Soft Skills'" },
                    currentScore: { type: Type.NUMBER },
                    targetScore: { type: Type.NUMBER },
                    gapStatus: { type: Type.STRING, description: "Must be 'Exceeds', 'On Track', 'Needs Improvement', or 'Critical Gap'" },
                    explanation: { type: Type.STRING },
                  },
                  required: ["skill", "currentScore", "targetScore", "gapStatus", "explanation"],
                },
              },
              curatedResources: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, description: "Must be 'YouTube Video', 'Official Documentation', or 'KCA Library Resource'" },
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                    urlOrCallNumber: { type: Type.STRING },
                  },
                  required: ["type", "title", "description", "urlOrCallNumber"],
                },
              },
              actionPlan: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["trackName", "jobReadinessScore", "skillGapAnalysis", "curatedResources", "actionPlan"],
          },
        },
      });

      const responseText = response.text || "";
      const cleanedText = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsedData = JSON.parse(cleanedText);
      return res.json(parsedData);
    }
  } catch (error) {
    console.error("Gemini API Recommendation error:", error);
  }

  // Safe Fallback Mock Response (if Gemini API Key is missing or query fails)
  const defaultGapCoding = submission.tagScores.Coding - (track ? track.industryStandard.Coding : 80);
  const defaultGapLogic = submission.tagScores.Logic - (track ? track.industryStandard.Logic : 80);
  const defaultGapSoft = submission.tagScores["Soft Skills"] - (track ? track.industryStandard["Soft Skills"] : 80);

  const fallbackRecommendations: RoadmapRecommendation = {
    trackName: trackName,
    jobReadinessScore: submission.jobReadinessScore,
    skillGapAnalysis: [
      {
        skill: "Coding",
        currentScore: submission.tagScores.Coding,
        targetScore: track ? track.industryStandard.Coding : 85,
        gapStatus: defaultGapCoding >= 0 ? "Exceeds" : defaultGapCoding > -15 ? "Needs Improvement" : "Critical Gap",
        explanation: defaultGapCoding >= 0 
          ? "Demonstrates robust syntactic awareness and clean software compilation structure."
          : "Struggling with advanced parameters, data types, and structural patterns. Focus on syntax.",
      },
      {
        skill: "Logic",
        currentScore: submission.tagScores.Logic,
        targetScore: track ? track.industryStandard.Logic : 80,
        gapStatus: defaultGapLogic >= 0 ? "Exceeds" : defaultGapLogic > -15 ? "Needs Improvement" : "Critical Gap",
        explanation: defaultGapLogic >= 0
          ? "Solid capability analyzing algorithmic costs, efficiency, and resource patterns."
          : "Improve understanding of logarithmic search constraints, recursion, and worst-case boundaries.",
      },
      {
        skill: "Soft Skills",
        currentScore: submission.tagScores["Soft Skills"],
        targetScore: track ? track.industryStandard["Soft Skills"] : 80,
        gapStatus: defaultGapSoft >= 0 ? "Exceeds" : defaultGapSoft > -15 ? "Needs Improvement" : "Critical Gap",
        explanation: defaultGapSoft >= 0
          ? "Clear, transparent, and empathetic communication alongside proactive leadership."
          : "Needs deeper validation parameters for conflict resolution, stakehold reporting, and crisis messaging.",
      },
    ],
    curatedResources: [
      {
        type: "YouTube Video",
        title: `${trackName} Core Mastery Concepts`,
        description: "A comprehensive guided channel breakdown with clean architectural explanations for student hackathons.",
        urlOrCallNumber: "https://youtube.com/watch?v=kca-tech-hackathon",
      },
      {
        type: "Official Documentation",
        title: `${trackName === "Junior Web Developer" ? "React Beta docs and MDN Web Specs" : "Python Standard Library Docs"}`,
        description: "Official guides and quick start specifications detailing data mapping and state optimizations.",
        urlOrCallNumber: "https://docs.microsoft.com or https://react.dev",
      },
      {
        type: "KCA Library Resource",
        title: "Modern Systems Analysis and Technical Engineering Design",
        description: "A comprehensive guide in the KCA main campus reserve shelf for design frameworks.",
        urlOrCallNumber: "KCA Campus Reserve - Call # 005.13 SYS",
      },
    ],
    actionPlan: [
      "Review the core questions missed in the assessment and walk through the solutions.",
      "Engage with KCA Tech Club mock hackathon resources on GitHub.",
      "Calibrate coding exercises daily using short sandbox environments (at least 30 minutes).",
      "Attend the upcoming university workshop on technical communication and engineering soft skills next Thursday.",
    ],
  };

  res.json(fallbackRecommendations);
});

// Tutor Chat - Sits beside the results to explain complex questions
app.post("/api/chat", async (req, res) => {
  const { messages, contextSubmissionId } = req.body;
  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: "No messages provided" });
  }

  const latestMessage = messages[messages.length - 1].text;
  
  let contextualInfo = "";
  if (contextSubmissionId) {
    const sub = userSubmissions.find((s) => s.id === contextSubmissionId);
    if (sub) {
      const track = tracks.find((t) => t.id === sub.trackId);
      contextualInfo = `The user is studying for the '${track?.name || "Tech"}' track.
Their last score was ${sub.score}%.
Their relative scores were: Coding: ${sub.tagScores.Coding}%, Logic: ${sub.tagScores.Logic}%, Soft Skills: ${sub.tagScores["Soft Skills"]}%.
Please use this student context to tutor them directly. Keep explanations structured, motivating, and friendly (representing KCA Tech Club)!`;
    }
  }

  const systemInstruction = `You are 'SkillPath Coach', a patient, friendly, and expert tech tutor for KCA University.
You help college students close their skill gaps, preparing them for technical job interviews.
${contextualInfo}
Keep answers brief, localized, highly readable, and formatted cleanly in markdown!`;

  try {
    const ai = getGeminiClient();
    if (ai) {
      const chatHistory = messages.slice(0, -1).map((m: any) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      const contents = [
        ...chatHistory,
        { role: "user", parts: [{ text: latestMessage }] }
      ];

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents as any,
        config: {
          systemInstruction,
        },
      });

      return res.json({ text: response.text || "I'm analyzing your request." });
    }
  } catch (error) {
    console.error("Gemini API Tutor Chat error:", error);
  }

  // Safe Fallback Mock Response (if API Key is missing or call fails)
  let fallbackReply = "I am a local simulation on SkillPath AI while public API keys are offline. For " + 
    (contextSubmissionId ? "this hackathon assessment" : "general questions") + 
    ", make sure you analyze variables, algorithmic lookup cost, and stakeholder communication! Let me know if you would like me to unpack a specific topic like 'React re-renders' or 'SQL JOINs'!";
  
  if (latestMessage.toLowerCase().includes("virtual dom") || latestMessage.toLowerCase().includes("react")) {
    fallbackReply = "Great question! React's **Virtual DOM** is a representation of the real DOM in JavaScript memory. \n\n1. When state changes, a new virtual subtree is constructed.\n2. React diffs this tree with the previous virtual tree (finding what actually changed).\n3. This step is extremely cheap.\n4. It batch-updates only the modified real DOM nodes, skipping costly browser paint/reflow processes. \n\nLet me know if you want to write a code snippet together!";
  } else if (latestMessage.toLowerCase().includes("coercion") || latestMessage.toLowerCase().includes("javascript")) {
    fallbackReply = "Let's unpack coercion! In JavaScript, the `+` operator has a dual purpose: numerical addition AND string concatenation.\n\nWhen we run `1 + '2' + 3`:\n1. It takes `1` (number) and `'2'` (string). Since one is a string, JS coerces `1` to `'1'` and welds them together as `'12'`.\n2. Then we do `'12'` (string) + `3` (number). Again, coercion takes place, giving the string `'123'`!\n\nIf you want mathematical addition, run `Number(1) + Number('2') + 3` which yields `6`.";
  }

  res.json({ text: fallbackReply });
});

// Setup Vite Development Middleware or serve Production bundle
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();

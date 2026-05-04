import React, { useState, useRef, useEffect } from "react";
import AIBlob from "./AIBlob";
import ZoomMeeting from "./ZoomMeeting";
import MapModule from "./MapModule";
import "./Dashboard.css";

const ipcRenderer = window.require ? window.require("electron").ipcRenderer : null;

const navItems = [
  { id: "core", label: "CORE AI" },
  { id: "map", label: "TACTICAL MAP" },
  { id: "meeting", label: "MEETING" },
  { id: "security", label: "SECURITY" },
];

const initialSecurityEntries = [
  { label: "THREAT VECTOR", value: "SYNTH WAVE", progress: 82 },
  { label: "FIREWALL INTEGRITY", value: "98.7%", progress: 97 },
  { label: "DATA LEAKAGE", value: "NO ABNORMALITY", progress: 16 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("core");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, role: "assistant", text: "Hi. I am J.A.R.V.I.S. Activate your command." },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [meetingConfig, setMeetingConfig] = useState({
    meetingNumber: "",
    password: "",
    sdkKey: "",
    sdkSecret: "",
    userName: "J.A.R.V.I.S.",
  });
  const [modelStatus, setModelStatus] = useState("STANDBY");
  const [brainReady, setBrainReady] = useState(false);
  const [securityLogs] = useState([
    "[14:32:07] HUNTING: anomaly packet burst on channel 7",
    "[14:32:20] SCAN: perimeter sensor delta +12%",
    "[14:32:48] ALERT: unauthorized access attempt blocked",
    "[14:33:14] NOTE: model heartbeat stable",
  ]);

  useEffect(() => {
    if (messages.length > 1 && !brainReady) {
      setBrainReady(true);
      setModelStatus("ONLINE");
    }
  }, [messages, brainReady]);

  useEffect(() => {
    const runId = "pre-fix-1";
    const endpoint = "http://127.0.0.1:7599/ingest/2e1bdad8-9d9f-4086-9c9a-6e7f14ee78f1";

    const sendDebugLog = (hypothesisId, location, message, data) => {
      fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "e9c6ff",
        },
        body: JSON.stringify({
          sessionId: "e9c6ff",
          runId,
          hypothesisId,
          location,
          message,
          data,
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    };

    const collectLayoutDebug = () => {
      const dashboard = document.querySelector(".dashboard-container");
      const grid = dashboard?.firstElementChild;
      const sidebar = document.querySelector(".sidebar");
      const main = document.querySelector(".main-content");
      const visualizer = document.querySelector(".visualizer");
      const viewport = {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        clientWidth: document.documentElement.clientWidth,
        clientHeight: document.documentElement.clientHeight,
      };

      // #region agent log
      sendDebugLog("H1", "App.js:layout-debug", "Viewport and container sizes", {
        viewport,
        dashboardRect: dashboard?.getBoundingClientRect(),
        gridRect: grid?.getBoundingClientRect?.(),
      });
      // #endregion

      // #region agent log
      sendDebugLog("H2", "App.js:layout-debug", "Sidebar and main region sizing", {
        sidebarRect: sidebar?.getBoundingClientRect(),
        mainRect: main?.getBoundingClientRect(),
        mainComputedPadding: main ? window.getComputedStyle(main).padding : null,
      });
      // #endregion

      // #region agent log
      sendDebugLog("H3", "App.js:layout-debug", "Visualizer sizing versus main", {
        visualizerRect: visualizer?.getBoundingClientRect(),
        visualizerScrollWidth: visualizer?.scrollWidth ?? null,
        visualizerClientWidth: visualizer?.clientWidth ?? null,
        visualizerScrollHeight: visualizer?.scrollHeight ?? null,
        visualizerClientHeight: visualizer?.clientHeight ?? null,
      });
      // #endregion

      const overlapSelectors = [".logo-text", ".status-indicator", ".stat-value", ".meta-item .value", ".nav-item", ".log-content"];
      const overlapStats = overlapSelectors.map((selector) => {
        const el = document.querySelector(selector);
        if (!el) return { selector, found: false };
        return {
          selector,
          found: true,
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
          hasHorizontalOverflow: el.scrollWidth > el.clientWidth,
          hasVerticalOverflow: el.scrollHeight > el.clientHeight,
        };
      });

      // #region agent log
      sendDebugLog("H4", "App.js:layout-debug", "Text overlap and overflow probes", {
        overlapStats,
      });
      // #endregion

      const overflowNodes = Array.from(document.querySelectorAll("*"))
        .filter((el) => el instanceof HTMLElement)
        .map((el) => {
          const node = el;
          const id = node.getAttribute("data-debug-id") || "";
          const className = typeof node.className === "string" ? node.className : "";
          return {
            tag: node.tagName.toLowerCase(),
            id,
            className,
            clientWidth: node.clientWidth,
            scrollWidth: node.scrollWidth,
            clientHeight: node.clientHeight,
            scrollHeight: node.scrollHeight,
            overflowX: node.scrollWidth - node.clientWidth,
            overflowY: node.scrollHeight - node.clientHeight,
          };
        })
        .filter(
          (node) =>
            (node.overflowX > 0 || node.overflowY > 0) &&
            node.clientWidth > 0 &&
            node.clientHeight > 0
        )
        .sort((a, b) => Math.max(b.overflowX, b.overflowY) - Math.max(a.overflowX, a.overflowY))
        .slice(0, 20);

      // #region agent log
      sendDebugLog("H11", "App.js:layout-debug", "Top DOM overflow nodes", {
        overflowNodes,
      });
      // #endregion

      const debugPanels = Array.from(document.querySelectorAll("[data-debug-id]")).map((el) => {
        const rect = el.getBoundingClientRect();
        return {
          id: el.getAttribute("data-debug-id"),
          rect,
          scrollWidth: el.scrollWidth,
          clientWidth: el.clientWidth,
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
        };
      });

      // #region agent log
      sendDebugLog("H12", "App.js:layout-debug", "Core panel dimensions", {
        debugPanels,
      });
      // #endregion

      const promptInput = document.querySelector('[data-debug-id="prompt-input"]');
      const commandHub = document.querySelector('[data-debug-id="command-hub"]');
      const promptRect = promptInput?.getBoundingClientRect?.() ?? null;
      const commandHubRect = commandHub?.getBoundingClientRect?.() ?? null;
      const isPromptVisible =
        !!promptRect &&
        promptRect.bottom > 0 &&
        promptRect.right > 0 &&
        promptRect.top < window.innerHeight &&
        promptRect.left < window.innerWidth;

      // #region agent log
      sendDebugLog("H13", "App.js:layout-debug", "Prompt input visibility and size", {
        promptRect,
        commandHubRect,
        isPromptVisible,
        promptClientHeight: promptInput?.clientHeight ?? null,
        promptScrollHeight: promptInput?.scrollHeight ?? null,
      });
      // #endregion

      const bodyStyles = window.getComputedStyle(document.body);
      // #region agent log
      sendDebugLog("H5", "App.js:layout-debug", "Body/document overflow state", {
        bodyOverflow: bodyStyles.overflow,
        bodySize: {
          width: document.body.getBoundingClientRect().width,
          height: document.body.getBoundingClientRect().height,
        },
        rootSize: document.getElementById("root")?.getBoundingClientRect?.() ?? null,
      });
      // #endregion
    };

    collectLayoutDebug();
    window.addEventListener("resize", collectLayoutDebug);
    return () => {
      window.removeEventListener("resize", collectLayoutDebug);
    };
  }, []);

  // Application Storage System
  const applications = {
    // Web Browsers
    chrome: "chrome",
    firefox: "firefox", 
    edge: "msedge",
    safari: "safari",
    
    // Communication
    discord: "discord",
    slack: "slack",
    zoom: "zoom",
    teams: "teams",
    telegram: "telegram",
    whatsapp: "whatsapp",
    
    // Productivity
    notepad: "notepad",
    word: "winword",
    excel: "excel",
    powerpoint: "powerpnt",
    vscode: "code",
    sublime: "sublime_text",
    
    // Media
    vlc: "vlc",
    spotify: "spotify",
    itunes: "itunes",
    
    // System
    calculator: "calc",
    explorer: "explorer",
    taskmanager: "taskmgr",
    cmd: "cmd",
    terminal: "wt", // Windows Terminal
    
    // Creative
    photoshop: "photoshop",
    paint: "mspaint",
    blender: "blender"
  };

  // Application Opening Intent Detection
  const detectAppIntent = (input) => {
    const trimmed = input.toLowerCase().trim();
    
    // App opening patterns
    const appPatterns = [
      { pattern: /open\s+(\w+)/i, extract: (match) => ({ app: match[1], action: 'open' }) },
      { pattern: /launch\s+(\w+)/i, extract: (match) => ({ app: match[1], action: 'launch' }) },
      { pattern: /start\s+(\w+)/i, extract: (match) => ({ app: match[1], action: 'start' }) },
      { pattern: /run\s+(\w+)/i, extract: (match) => ({ app: match[1], action: 'run' }) },
      { pattern: /(\w+)\s+(open|launch|start|run)/i, extract: (match) => ({ app: match[1], action: match[2] }) }
    ];
    
    for (const { pattern, extract } of appPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        const result = extract(match);
        const appName = result.app.toLowerCase();
        const executable = applications[appName];
        if (executable) {
          return {
            ...result,
            appName,
            executable,
            originalInput: input
          };
        }
      }
    }
    return null;
  };

  // Application Launcher - Uses backend API
  const launchApplication = async (appData) => {
    try {
      console.log('Launching application via backend:', appData);
      
      // Call the backend API
      const response = await fetch('http://localhost:3001/api/launch-app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          executable: appData.executable,
          appName: appData.appName
        })
      });
      
      const result = await response.json();
      console.log('App launch result:', result);
      return result;
    } catch (err) {
      console.error('App launch error:', err);
      return { success: false, error: err.message };
    }
  };

  // Contact Storage System - Loaded from secure backend
  const [contacts, setContacts] = useState({
    sister: "mariam.power2016@gmail.com",
    father: "faiztrical@gmail.com", 
    mother: "mother@example.com",
    brother: "brother@example.com",
    friend: "friend@example.com",
    boss: "boss@example.com",
    colleague: "colleague@example.com"
  });

  // Load contacts from backend on component mount
  useEffect(() => {
    const loadContacts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/contacts');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setContacts(data.contacts);
            console.log('Contacts loaded from backend:', data.contacts);
          }
        }
      } catch (error) {
        console.log('Backend not available, using fallback contacts');
      }
    };

    loadContacts();
  }, []);

  // Quick Knowledge Base
  const knowledgeBase = {
    mitochondria: "Mitochondria are organelles that produce energy (ATP) in cells through cellular respiration.",
    photosynthesis: "Photosynthesis is the process by which plants convert sunlight, carbon dioxide, and water into glucose and oxygen.",
    gravity: "Gravity is the fundamental force that attracts objects with mass toward each other, keeping planets in orbit.",
    dna: "DNA (Deoxyribonucleic acid) carries genetic instructions for the development, functioning, and reproduction of all living organisms.",
    atom: "An atom is the smallest unit of matter that retains the chemical properties of an element, consisting of a nucleus and electrons.",
    evolution: "Evolution is the process by which species change over generations through natural selection and genetic variation.",
    electricity: "Electricity is the flow of electrons through a conductor, creating energy that powers our modern world.",
    magnetism: "Magnetism is a force that attracts or repels certain materials, caused by the motion of electric charges.",
    light: "Light is electromagnetic radiation that travels in waves and allows us to see the world around us.",
    sound: "Sound is a mechanical wave that travels through matter as vibrations, which we perceive as hearing.",
    energy: "Energy is the capacity to do work or cause change, existing in various forms like kinetic, potential, and thermal.",
    force: "Force is any interaction that changes the motion of an object, measured in Newtons and described by Newton's laws.",
    mass: "Mass is the amount of matter in an object, measured in kilograms and determining gravitational attraction.",
    velocity: "Velocity is the speed of an object in a specific direction, combining both magnitude and direction.",
    acceleration: "Acceleration is the rate of change of velocity over time, describing how quickly an object speeds up or slows down.",
    temperature: "Temperature is a measure of the average kinetic energy of particles in a substance, determining hotness or coldness.",
    pressure: "Pressure is force applied per unit area, measured in Pascals and affecting fluid behavior and material stress.",
    density: "Density is mass per unit volume, determining whether objects float or sink and affecting material properties.",
    friction: "Friction is a force that opposes motion between surfaces in contact, converting kinetic energy into heat.",
    momentum: "Momentum is the product of an object's mass and velocity, conserved in collisions and describing motion persistence."
  };

  // Email Intent Detection
  const detectEmailIntent = (input) => {
    const trimmed = input.toLowerCase().trim();
    
    // Email detection patterns
    const emailPatterns = [
      { pattern: /email\s+(my|the)\s+(\w+)/i, extract: (match) => ({ recipient: match[2], type: 'simple' }) },
      { pattern: /send\s+an?\s+email\s+to\s+(\w+)/i, extract: (match) => ({ recipient: match[1], type: 'simple' }) },
      { pattern: /email\s+(\w+)\s+(about|regarding)\s+(.+)/i, extract: (match) => ({ recipient: match[1], subject: match[3], type: 'with_subject' }) },
      { pattern: /tell\s+(\w+)\s+(.+)/i, extract: (match) => ({ recipient: match[1], message: match[2], type: 'direct_message' }) }
    ];
    
    for (const { pattern, extract } of emailPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        const result = extract(match);
        const recipientEmail = contacts[result.recipient];
        if (recipientEmail) {
          return {
            ...result,
            recipientEmail,
            originalInput: input
          };
        }
      }
    }
    return null;
  };

  // Quick Knowledge Answers
  const getQuickKnowledge = (input) => {
    const trimmed = input.toLowerCase().trim();
    
    // Knowledge detection patterns
    const knowledgePatterns = [
      { pattern: /what\s+is\s+(\w+)/i, extract: (match) => match[1] },
      { pattern: /define\s+(\w+)/i, extract: (match) => match[1] },
      { pattern: /explain\s+(\w+)\s+briefly/i, extract: (match) => match[1] },
      { pattern: /briefly\s+explain\s+(\w+)/i, extract: (match) => match[1] },
      { pattern: /tell\s+me\s+about\s+(\w+)/i, extract: (match) => match[1] }
    ];
    
    for (const { pattern, extract } of knowledgePatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        const topic = extract(match);
        const definition = knowledgeBase[topic];
        if (definition) {
          return definition;
        }
      }
    }
    return null;
  };

  // Fast Response Layer for Instant Answers
  const getFastResponse = (input) => {
    const trimmed = input.toLowerCase().trim();
    
    // Math operations - EXPANDED PATTERNS
    const mathPatterns = [
      // Squared - more variations
      { pattern: /(\d+)\s*(squared?|to the power of 2|\^2|\*\*2)/i, calc: (match) => `${match[1]}² = ${parseInt(match[1]) ** 2}` },
      // Cubed - more variations  
      { pattern: /(\d+)\s*(cubed?|to the power of 3|\^3|\*\*3)/i, calc: (match) => `${match[1]}³ = ${parseInt(match[1]) ** 3}` },
      // Square root - more variations
      { pattern: /(square root of|sqrt|√)\s*(\d+)/i, calc: (match) => `√${match[2]} = ${Math.sqrt(parseInt(match[2])).toFixed(2)}` },
      // Basic operations - more flexible
      { pattern: /(\d+)\s*(\+|plus)\s*(\d+)/i, calc: (match) => `${match[1]} + ${match[3]} = ${parseInt(match[1]) + parseInt(match[3])}` },
      { pattern: /(\d+)\s*(-|minus)\s*(\d+)/i, calc: (match) => `${match[1]} - ${match[3]} = ${parseInt(match[1]) - parseInt(match[3])}` },
      { pattern: /(\d+)\s*(\*|x|times|multiplied by)\s*(\d+)/i, calc: (match) => `${match[1]} × ${match[3]} = ${parseInt(match[1]) * parseInt(match[3])}` },
      { pattern: /(\d+)\s*(\/|divided by)\s*(\d+)/i, calc: (match) => `${match[1]} ÷ ${match[3]} = ${(parseInt(match[1]) / parseInt(match[3])).toFixed(2)}` },
    ];
    
    // Check math patterns
    for (const { pattern, calc } of mathPatterns) {
      const match = trimmed.match(pattern);
      if (match) {
        return calc(match);
      }
    }
    
    // Basic commands - Formal JARVIS personality
    const commands = [
      { pattern: /^(hello|hi|hey)$/i, response: "Greetings. I am J.A.R.V.I.S., prepared to assist you." },
      { pattern: /^(time|what time)/i, response: `Current system time: ${new Date().toLocaleTimeString()}` },
      { pattern: /^(date|what date)/i, response: `Today's date: ${new Date().toLocaleDateString()}` },
      { pattern: /^(help|commands)/i, response: "Available functions: mathematical computations, knowledge queries, email transmission, system status, and complex analytical requests." },
      { pattern: /^(status|system status)/i, response: `System operational. Status: ${modelStatus}, Voice: ${speechEnabled ? 'ACTIVE' : 'INACTIVE'}, Security: ${brainReady ? 'IMMUNE' : 'STANDBY'}` },
      { pattern: /^(clear|reset)/i, response: "Interface reset. Awaiting your next command." },
    ];
    
    // Check command patterns
    for (const { pattern, response } of commands) {
      if (pattern.test(trimmed)) {
        return response;
      }
    }
    
    return null; // No fast response found
  };

  // Email Confirmation Handler - Opens Gmail
  const handleEmailConfirmation = async (emailData, confirmed) => {
    if (!confirmed) {
      const cancelMessage = {
        id: Date.now(),
        role: "assistant",
        text: "Email composition cancelled. Awaiting your next command."
      };
      setMessages((prev) => [...prev, cancelMessage]);
      setModelStatus("CANCELLED");
      speakText("Email cancelled.");
      return;
    }

    // Open Gmail with pre-filled email
    try {
      setModelStatus("OPENING_GMAIL");
      
      const subject = emailData.subject || "Message from J.A.R.V.I.S";
      const message = emailData.message || "Message content will be added.";
      
      // Create Gmail compose URL
      const gmailUrl = `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(emailData.recipientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      
      // Open Gmail in new tab
      window.open(gmailUrl, '_blank');
      
      const successMessage = {
        id: Date.now(),
        role: "assistant",
        text: "Gmail has been opened with your email pre-filled. Please review and click Send to transmit."
      };
      setMessages((prev) => [...prev, successMessage]);
      setModelStatus("GMAIL_OPENED");
      speakText("Gmail opened. Please click send to transmit your message.");
      
    } catch (err) {
      const errorMessage = {
        id: Date.now(),
        role: "assistant",
        text: `Failed to open Gmail: ${err.message}`
      };
      setMessages((prev) => [...prev, errorMessage]);
      setModelStatus("ERROR");
      speakText("Failed to open Gmail.");
    }
  };

  const sendMessage = async () => {
    const trimmed = prompt.trim();
    if (!trimmed) return;

    const userMessage = { id: Date.now(), role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setPrompt("");
    setLoading(true);
    setError(null);

    console.log('Input:', trimmed);

    // 0. Check for email confirmation responses first
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.metadata?.type === 'email_confirmation') {
      const confirmation = trimmed.toLowerCase();
      if (confirmation.includes('yes') || confirmation.includes('send') || confirmation.includes('confirm')) {
        await handleEmailConfirmation(lastMessage.metadata.emailData, true);
        setLoading(false);
        return;
      } else if (confirmation.includes('no') || confirmation.includes('cancel') || confirmation.includes('stop')) {
        await handleEmailConfirmation(lastMessage.metadata.emailData, false);
        setLoading(false);
        return;
      }
    }

    // 1. Check for application opening intent first
    const appIntent = detectAppIntent(trimmed);
    if (appIntent) {
      console.log('Application intent detected:', appIntent);
      
      try {
        setModelStatus("LAUNCHING");
        
        const result = await launchApplication(appIntent);
        
        if (result.success) {
          const successMessage = {
            id: Date.now() + 1,
            role: "assistant",
            text: `${appIntent.appName.charAt(0).toUpperCase() + appIntent.appName.slice(1)} has been launched successfully.`
          };
          setMessages((prev) => [...prev, successMessage]);
          setModelStatus("LAUNCHED");
          speakText(`${appIntent.appName} launched successfully.`);
        } else {
          throw new Error(result.error);
        }
      } catch (err) {
        const errorMessage = {
          id: Date.now() + 1,
          role: "assistant",
          text: `Failed to launch ${appIntent.appName}: ${err.message}`
        };
        setMessages((prev) => [...prev, errorMessage]);
        setModelStatus("ERROR");
        speakText(`Application launch failed.`);
      }
      
      setLoading(false);
      return;
    }

    // 2. Check for email intent
    const emailIntent = detectEmailIntent(trimmed);
    if (emailIntent) {
      console.log('Email intent detected:', emailIntent);
      
      // Generate email preview
      const subject = emailIntent.subject || "Message from J.A.R.V.I.S";
      const message = emailIntent.message || "[Message content will be added]";
      
      const emailPreview = `To: ${emailIntent.recipientEmail}\nSubject: ${subject}\nMessage: ${message}\n\nShall I open Gmail with this email pre-filled?`;
      
      setTimeout(() => {
        const assistantMessage = { 
          id: Date.now() + 1, 
          role: "assistant", 
          text: emailPreview,
          metadata: {
            type: 'email_confirmation',
            emailData: emailIntent
          }
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setModelStatus("EMAIL");
        setBrainReady(true);
        speakText("Email prepared for Gmail. Awaiting your confirmation.");
        setLoading(false);
      }, 50);
      return;
    }

    // 2. Check for quick knowledge
    const quickKnowledge = getQuickKnowledge(trimmed);
    if (quickKnowledge) {
      console.log('Quick knowledge found:', quickKnowledge);
      setTimeout(() => {
        const assistantMessage = { 
          id: Date.now() + 1, 
          role: "assistant", 
          text: quickKnowledge 
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setModelStatus("KNOWLEDGE");
        setBrainReady(true);
        speakText(quickKnowledge);
        setLoading(false);
      }, 50);
      return;
    }

    // 2.5. Check for knowledge pattern but not in database
    const knowledgePattern = /(what is|define|explain|tell me about)\s+(\w+)/i;
    const knowledgeMatch = trimmed.match(knowledgePattern);
    if (knowledgeMatch && !getFastResponse(trimmed)) {
      console.log('Knowledge query detected but not in database, sending to AI with instruction');
      // This will fall through to AI with special instruction for concise definition
    }

    // 3. Check for fast response (math, basic commands)
    const fastResponse = getFastResponse(trimmed);
    console.log('Fast response detected:', fastResponse);
    
    if (fastResponse) {
      console.log('Using instant response, skipping AI call');
      setTimeout(() => {
        const assistantMessage = { 
          id: Date.now() + 1, 
          role: "assistant", 
          text: fastResponse 
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setModelStatus("INSTANT");
        setBrainReady(true);
        speakText(fastResponse);
        setLoading(false);
      }, 50); // Even faster delay
      return;
    }
    
    console.log('No fast response found, calling AI...');

    if (!ipcRenderer) {
      const failResponse = {
        id: Date.now() + 1,
        role: "assistant",
        text: "Electron IPC unavailable. Run this inside the Electron app to access the local brain.",
      };
      setMessages((prev) => [...prev, failResponse]);
      setLoading(false);
      return;
    }

    try {
      console.log('Making AI call with optimized parameters...');
      const startTime = Date.now();
      
      // Add timeout for slow AI responses
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('AI response timeout')), 8000) // 8 second timeout
      );
      
      const aiPromise = ipcRenderer.invoke("chat-llm", { 
        message: `Respond formally and concisely as J.A.R.V.I.S. Maximum 2 sentences. Query: ${trimmed}`,
        maxTokens: 50, // Much shorter responses
        temperature: 0.1, // Very focused responses
        topP: 0.9, // More deterministic
        frequencyPenalty: 0.1, // Reduce repetition
        presencePenalty: 0.1, // Encourage new content
        stream: false // Disable streaming for now to test speed
      });
      
      const response = await Promise.race([aiPromise, timeoutPromise]);
      
      const endTime = Date.now();
      console.log(`AI response took: ${endTime - startTime}ms`);
      
      if (!response || !response.success) {
        throw new Error(response?.error || "AI brain did not respond.");
      }
      const assistantText = response.response || "No response returned.";
      // Limit response to 1-2 short sentences
      const limitedResponse = assistantText.split(/[.!?]/).slice(0, 2).join('. ').trim() + '.';
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", text: limitedResponse },
      ]);
      setModelStatus("ONLINE");
      setBrainReady(true);
      speakText(limitedResponse);
    } catch (err) {
      console.error('AI Error:', err.message);
      if (err.message === 'AI response timeout') {
        // Fallback response for timeout
        const fallbackResponse = "I'm processing your request. Please try a simpler query or wait a moment.";
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: "assistant", text: fallbackResponse },
        ]);
        setModelStatus("TIMEOUT");
      } else {
        setError(err.message);
        setMessages((prev) => [
          ...prev,
          { id: Date.now() + 1, role: "assistant", text: `ERROR: ${err.message}` },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const minimizeWindow = () => {
    ipcRenderer?.send?.("window-minimize");
  };

  const toggleMaximizeWindow = () => {
    ipcRenderer?.send?.("window-maximize");
  };

  const closeWindow = () => {
    ipcRenderer?.send?.("window-close");
  };

  const speakText = (text) => {
    if (!speechEnabled || typeof window === "undefined" || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.lang = "en-US";
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find((voice) => /en(-|_)?/i.test(voice.lang));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch (speechErr) {
      console.warn("Speech synthesis failed:", speechErr);
    }
  };

  const lastAssistantText = messages.filter((msg) => msg.role === "assistant").slice(-1)[0]?.text || "Awaiting your command.";
  const lastUserText = messages.filter((msg) => msg.role === "user").slice(-1)[0]?.text || "No command yet.";

  const renderCoreSection = () => (
    <div className="visualizer" style={{ 
      display: "flex",
      justifyContent: "flex-start", 
      paddingTop: "20px",
      height: "100%",
      minHeight: "calc(100vh - 120px)",
      width: "100%",
      overflow: "hidden"
    }}>
      <div style={{ 
        flex: 1,
        width: "100%", 
        height: "100%",
        display: "flex", 
        flexDirection: "column",
        gap: "28px", 
        alignItems: "stretch",
        overflow: "hidden"
      }}>
        <div className="glass" data-debug-id="core-left-column" style={{ 
          flex: 1,
          minWidth: 0, 
          padding: "28px", 
          boxSizing: "border-box", 
          display: "flex", 
          flexDirection: "column", 
          gap: "24px", 
          overflow: "auto" 
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "18px" }}>
            <div>
              <div className="status-indicator">
                <span className="core-pulse active"></span>
                <span>AI CORE</span>
              </div>
              <div style={{ marginTop: "14px", fontSize: "26px", fontWeight: 800, color: "#fff" }}>J.A.R.V.I.S Neural Command</div>
            </div>
            <button
              className={`voice-btn ${speechEnabled ? "active" : ""}`}
              onClick={() => setSpeechEnabled((value) => !value)}
            >
              {speechEnabled ? "SPEECH ON" : "SPEECH OFF"}
            </button>
          </div>

          <div style={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: "20px", 
            flex: 1,
            minHeight: 0,
            overflow: "hidden"
          }}>
            {/* AI Orb Container - FIXED */}
            <div style={{ 
              height: "300px", 
              borderRadius: "24px", 
              overflow: "hidden", 
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexShrink: 0, // IMPORTANT: Prevents orb from shrinking
              backgroundColor: "rgba(0, 7, 18, 0.3)",
              border: "1px solid rgba(0, 210, 255, 0.2)"
            }}>
              <AIBlob emotionColor="#00d2ff" isListening={false} />
            </div>

            {/* Command Hub */}
            <div className="glass" data-debug-id="command-hub" style={{ 
              padding: "24px", 
              display: "flex", 
              flexDirection: "column", 
              gap: "18px",
              flexShrink: 0, // Prevents shrinking
              width: "100%"
            }}>
              <div className="status-indicator"><span className="core-pulse"></span>COMMAND HUB</div>
              <textarea
                data-debug-id="prompt-input"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter a mission command..."
                style={{ 
                  width: "100%", 
                  minHeight: "120px", 
                  borderRadius: "20px", 
                  border: "1px solid rgba(255,255,255,0.12)", 
                  background: "rgba(0, 7, 18, 0.94)", 
                  color: "#e5f2ff", 
                  padding: "18px", 
                  outline: "none", 
                  resize: "none", 
                  fontSize: "14px" 
                }}
              />
              <div style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
                <button
                  onClick={sendMessage}
                  disabled={loading}
                  style={{ 
                    padding: "16px 28px", 
                    borderRadius: "18px", 
                    border: "none", 
                    background: "#00d2ff", 
                    color: "#020617", 
                    fontWeight: 700, 
                    cursor: loading ? "not-allowed" : "pointer" 
                  }}
                >
                  {loading ? "PROCESSING" : "EXECUTE COMMAND"}
                </button>
                {error && <span style={{ color: "#ff6b6b", fontWeight: 700 }}>{error}</span>}
              </div>
            </div>

            {/* Mission Status */}
            <div className="glass" data-debug-id="mission-status" style={{ 
              padding: "24px", 
              display: "flex", 
              flexDirection: "column", 
              gap: "20px",
              flexShrink: 0, // Prevents shrinking
              width: "100%"
            }}>
              <div className="status-indicator"><span className="core-pulse"></span>MISSION STATUS</div>
              <div className="meta-item">
                <span className="label">AI STATE</span>
                <span className="value">{modelStatus}</span>
              </div>
              <div className="meta-item">
                <span className="label">VOICE OUTPUT</span>
                <span className="value">{speechEnabled ? "ON" : "OFF"}</span>
              </div>
              <div className="meta-item">
                <span className="label">SECURITY</span>
                <span className="value">{brainReady ? "IMMUNE" : "STANDBY"}</span>
              </div>
            </div>

            {/* Conversation Section */}
            <div className="glass" style={{ 
              padding: "22px", 
              display: "flex", 
              flexDirection: "column", 
              gap: "18px",
              flex: 1, // Takes remaining space
              minHeight: "200px",
              overflow: "auto"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
                  <div>
                    <div className="status-indicator"><span className="core-pulse"></span>CONVERSATION</div>
                    <div style={{ marginTop: "10px", fontSize: "16px", color: "#cbd5e1" }}>Latest command and AI response.</div>
                  </div>
                  <div style={{ color: "#94a3b8", fontSize: "12px", letterSpacing: "1px" }}>{ipcRenderer ? "LOCAL BRAIN CONNECTED" : "NO ELECTRON IPC"}</div>
                </div>
                <div style={{ display: "grid", gap: "16px" }}>
                  <div style={{ padding: "18px", borderRadius: "18px", background: "rgba(0, 7, 18, 0.92)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff" }}>
                    <div style={{ fontSize: "12px", letterSpacing: "2px", color: "#7dd3fc", marginBottom: "10px" }}>LATEST USER INPUT</div>
                    <div style={{ fontSize: "16px", lineHeight: 1.6 }}>{lastUserText}</div>
                  </div>
                  <div style={{ padding: "18px", borderRadius: "18px", background: "rgba(0, 7, 18, 0.92)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff" }}>
                    <div style={{ fontSize: "12px", letterSpacing: "2px", color: "#7dd3fc", marginBottom: "10px" }}>J.A.R.V.I.S RESPONSE</div>
                    <div style={{ fontSize: "16px", lineHeight: 1.6 }}>{lastAssistantText}</div>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMapSection = () => (
    <div className="visualizer" style={{ 
      justifyContent: "flex-start", 
      paddingTop: "20px",
      height: "100%",
      minHeight: "calc(100vh - 120px)",
      width: "100%",
      overflow: "hidden"
    }}>
      <div className="glass" style={{ 
        width: "100%", 
        height: "100%",
        minHeight: "calc(100vh - 140px)", 
        padding: "24px", 
        boxSizing: "border-box", 
        display: "grid", 
        gridTemplateColumns: "1fr 360px", 
        gap: "24px",
        overflow: "hidden"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div className="status-indicator"><span className="core-pulse"></span>TACTICAL MAP</div>
              <div style={{ marginTop: "12px", fontSize: "24px", fontWeight: 800, color: "#fff" }}>Global threat coordinate overlay</div>
            </div>
            <div style={{ color: "#8da4c1", fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px" }}>Real-time HUD</div>
          </div>
          <div style={{ flex: 1, minHeight: "520px" }}>
            <MapModule accentColor="#00d2ff" />
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="stat-card glass">
            <div className="stat-label">PRIMARY TARGET</div>
            <div className="stat-value">ELECTRO GRID</div>
            <div className="stat-bar"><div className="fill" style={{ width: "72%" }} /></div>
          </div>
          <div className="stat-card glass">
            <div className="stat-label">SATELLITE LINK</div>
            <div className="stat-value">STARK-7</div>
            <div className="stat-bar"><div className="fill" style={{ width: "88%" }} /></div>
          </div>
          <div className="stat-card glass" style={{ paddingBottom: "26px" }}>
            <div className="stat-label">LOCATION</div>
            <div className="stat-value">Global Grid - Sector 4</div>
            <div style={{ marginTop: "14px", color: "#94a3b8", fontSize: "13px" }}>Coordinates are sourced from device geolocation and synthetic satellite overlay.</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMeetingSection = () => (
    <div className="visualizer" style={{ 
      justifyContent: "flex-start", 
      paddingTop: "20px",
      height: "100%",
      minHeight: "calc(100vh - 120px)",
      width: "100%",
      overflow: "hidden"
    }}>
      <div className="glass" style={{ 
        width: "100%", 
        height: "100%",
        minHeight: "calc(100vh - 140px)", 
        padding: "30px", 
        boxSizing: "border-box", 
        display: "grid", 
        gridTemplateColumns: "1.1fr 0.9fr", 
        gap: "24px",
        overflow: "hidden"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <div className="status-indicator"><span className="core-pulse"></span>CONFERENCE HUB</div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#fff" }}>Secure tactical briefing</div>
          <div style={{ display: "grid", gap: "18px" }}>
            {[
              { label: "Meeting ID", key: "meetingNumber" },
              { label: "Password", key: "password" },
              { label: "SDK Key", key: "sdkKey" },
              { label: "SDK Secret", key: "sdkSecret" },
            ].map(({ label, key }) => (
              <div key={key} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "12px", color: "#7dd3fc", letterSpacing: "1px" }}>{label}</label>
                <input
                  value={meetingConfig[key]}
                  onChange={(e) => setMeetingConfig((prev) => ({ ...prev, [key]: e.target.value }))}
                  style={{ width: "100%", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.12)", padding: "14px 16px", background: "rgba(0, 7, 18, 0.85)", color: "#fff", outline: "none" }}
                  placeholder={label}
                />
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "center" }}>
            <button
              onClick={() => setMeetingOpen(true)}
              style={{ padding: "16px 28px", borderRadius: "18px", border: "none", background: "#00d2ff", color: "#020617", fontWeight: 700, cursor: "pointer" }}
            >
              ACTIVATE MEETING
            </button>
            <span style={{ color: "#94a3b8", fontSize: "13px" }}>Meeting overlay opens in full screen mode.</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "16px", padding: "18px", color: "#cbd5e1", fontSize: "13px" }}>
            Tip: enter valid Zoom credentials to establish the secure channel. If SDK credentials are missing, the fallback link button will appear.
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="stat-card glass">
            <div className="stat-label">SESSION READY</div>
            <div className="stat-value">{meetingOpen ? "ENGAGED" : "STANDBY"}</div>
          </div>
          <div className="stat-card glass">
            <div className="stat-label">CONNECTION</div>
            <div className="stat-value">AES-256 GCM</div>
          </div>
          <div className="glass" style={{ padding: "22px", minHeight: "260px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ fontSize: "12px", letterSpacing: "2px", color: "#7dd3fc", marginBottom: "8px" }}>MISSION CONTROL</div>
            <div style={{ fontSize: "20px", fontWeight: 800, color: "#fff", marginBottom: "14px" }}>Zoom conference UI</div>
            <div style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.7 }}>
              The meeting panel will open as a tactical overlay. If the SDK fails, you can still join via browser fallback.
            </div>
          </div>
        </div>
      </div>
      {meetingOpen && (
        <ZoomMeeting
          meetingNumber={meetingConfig.meetingNumber}
          password={meetingConfig.password}
          sdkKey={meetingConfig.sdkKey}
          sdkSecret={meetingConfig.sdkSecret}
          userName={meetingConfig.userName}
          onLeave={() => setMeetingOpen(false)}
        />
      )}
    </div>
  );

  const renderSecuritySection = () => (
    <div className="visualizer" style={{ 
      justifyContent: "flex-start", 
      paddingTop: "20px",
      height: "100%",
      minHeight: "calc(100vh - 120px)",
      width: "100%",
      overflow: "hidden"
    }}>
      <div className="glass" style={{ 
        width: "100%", 
        height: "100%",
        minHeight: "calc(100vh - 140px)", 
        padding: "30px", 
        boxSizing: "border-box", 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "24px",
        overflow: "hidden"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="status-indicator"><span className="core-pulse active"></span>SECURITY ANALYSIS</div>
          <div style={{ fontSize: "24px", fontWeight: 800, color: "#fff" }}>Threat intelligence feed</div>
          <div style={{ display: "grid", gap: "18px" }}>
            {initialSecurityEntries.map((entry) => (
              <div key={entry.label} className="glass" style={{ padding: "20px" }}>
                <div className="stat-label">{entry.label}</div>
                <div className="stat-value">{entry.value}</div>
                <div className="stat-bar"><div className="fill" style={{ width: `${entry.progress}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="glass" style={{ padding: "24px", minHeight: "280px" }}>
            <div className="log-header">SECURITY TERMINAL</div>
            <div className="terminal-log">
              <div className="log-content">
                {securityLogs.map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
                <div className="blinking-cursor" />
              </div>
            </div>
          </div>
          <div className="glass" style={{ padding: "24px", minHeight: "280px" }}>
            <div className="status-indicator"><span className="core-pulse"></span>DEFENSE GRID</div>
            <div style={{ marginTop: "16px", color: "#cbd5e1", lineHeight: 1.7 }}>
              J.A.R.V.I.S monitors inbound and outbound channels in real time. Use the tactical map to triangulate threats while the meeting interface secures your live operator link.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeTab) {
      case "map":
        return renderMapSection();
      case "meeting":
        return renderMeetingSection();
      case "security":
        return renderSecuritySection();
      default:
        return renderCoreSection();
    }
  };

  return (
    <div className="dashboard-container" style={{ 
      background: "radial-gradient(circle at 20% 20%, rgba(0, 210, 255, 0.08), transparent 35%), radial-gradient(circle at 80% 20%, rgba(152, 94, 255, 0.08), transparent 30%), radial-gradient(circle at 50% 80%, rgba(0, 255, 150, 0.06), transparent 28%)", 
      height: "100vh", 
      width: "100vw",
      minHeight: "100vh",
      minWidth: "100vw",
      overflow: "hidden"
    }}>
      <div className="window-controls">
        <div className="drag-region" />
        <div className="control-btns">
          <button className="control-btn" onClick={minimizeWindow} title="Minimize">_</button>
          <button className="control-btn" onClick={toggleMaximizeWindow} title="Maximize">▢</button>
          <button className="control-btn close" onClick={closeWindow} title="Close">✕</button>
        </div>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "280px minmax(0, 1fr)", 
        height: "100vh", 
        width: "100vw",
        minHeight: "100vh",
        minWidth: "100vw",
        overflow: "hidden"
      }}>
        <aside className="sidebar" style={{ 
          paddingTop: "72px", 
          height: "100vh",
          minHeight: "100vh",
          width: "100%",
          overflow: "hidden"
        }}>
          <div className="logo-text" style={{ marginBottom: "28px" }}>J.A.R.V.I.S.</div>
          <div className="liquid-nav-container">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        <main className="main-content" style={{ 
          padding: "80px 40px 40px 40px", 
          height: "100vh",
          minHeight: "100vh",
          width: "100%",
          overflow: "hidden"
        }}>
          {renderSection()}
        </main>
      </div>
    </div>
  );
}

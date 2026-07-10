// J.A.R.V.I.S. Main Controller Interface
import { handleSpotifyCommand } from './spotify.js';
import { speakAndListen, speakAndStop, startListening, stopListening } from './speech.js';

const commandInput = document.getElementById('commandInput');
const consoleLog = document.getElementById('consoleLog');
const statusText = document.getElementById('statusText');
const coreGlow = document.getElementById('coreGlow');
const triggerMic = document.getElementById('triggerMic');
const coreStatus = document.getElementById('coreStatus');
const sendBtn = document.getElementById('sendBtn');
const micBtn = document.getElementById('micBtn');

// HUD log outputs
export function logToHUD(msg, type = 'init') {
  if (!consoleLog) return;
  const p = document.createElement('p');
  const classMap = { init: 'le init', command: 'le cmd', response: 'le resp', error: 'le err' };
  p.className = classMap[type] || 'le init';
  p.innerText = `> ${msg}`;
  consoleLog.appendChild(p);
  consoleLog.scrollTop = consoleLog.scrollHeight;
}

export function updateStatus(label, active) {
  if (statusText) statusText.innerText = `MIC: ${label}`;
}

export function setCoreState(state) {
  if (!coreGlow || !coreStatus) return;
  coreGlow.classList.remove('speaking', 'listening', 'thinking');
  if (state === 'speaking') {
    coreGlow.classList.add('speaking');
    coreStatus.textContent = 'SPEAKING...';
    coreStatus.style.color = '#f472b6';
  } else if (state === 'listening') {
    coreGlow.classList.add('listening');
    coreStatus.textContent = 'LISTENING...';
    coreStatus.style.color = '#10b981';
  } else if (state === 'thinking') {
    coreGlow.classList.add('thinking');
    coreStatus.textContent = 'THINKING...';
    coreStatus.style.color = '#fbbf24';
  } else {
    coreStatus.textContent = 'CLICK REACTOR TO ACTIVATE';
    coreStatus.style.color = '';
  }
}

// ─── Diagnostics Poller (real dynamic fetch) ───
const pollDiagnostics = async () => {
  try {
    const res = await window.apiRequest('/api/system/diagnostics');
    const data = await res.json();
    if (data.success && data.diagnostics) {
      const { cpuValue, memoryValue, cpu, memory } = data.diagnostics;
      
      const cpuBar = document.getElementById('cpuBar');
      const memBar = document.getElementById('memBar');
      const cpuVal = document.getElementById('cpuVal');
      const memVal = document.getElementById('memVal');
      
      if (cpuBar) cpuBar.style.width = `${cpuValue}%`;
      if (memBar) memBar.style.width = `${memoryValue}%`;
      if (cpuVal) cpuVal.textContent = cpu;
      if (memVal) memVal.textContent = memory;
    }
  } catch (err) {
    console.error("Failed to query system diagnostics:", err.message);
  }
};

// Check Ollama status through server-side helper or directly
async function checkOllama() {
  const dot = document.getElementById('ollamaDot');
  const lbl = document.getElementById('ollamaStatus');
  try {
    // Ping Ollama tags
    const r = await fetch('http://localhost:11434/api/tags', { signal: AbortSignal.timeout(3000) });
    if (r.ok) {
      if (dot) { dot.style.background='#10b981'; dot.style.boxShadow='0 0 8px #10b981'; dot.className='sys-dot dot-green'; }
      if (lbl) lbl.textContent = 'OLLAMA: ONLINE';
    } else throw new Error();
  } catch {
    if (dot) { dot.style.background='#f87171'; dot.style.boxShadow='0 0 8px #f87171'; }
    if (lbl) lbl.textContent = 'OLLAMA: OFFLINE';
  }
}

// Check Postman Mock Hosting server status
async function checkHostingStatus() {
  const dot = document.getElementById('hostingDot');
  const lbl = document.getElementById('hostingStatus');
  try {
    const r = await window.apiRequest('/api/system/hosting');
    const data = await r.json();
    if (data.success && data.status === 'Active') {
      if (dot) {
        dot.style.background = '#10b981';
        dot.style.boxShadow = '0 0 8px #10b981';
        dot.className = 'sys-dot dot-green';
      }
      if (lbl) {
        lbl.textContent = `HOSTING: ONLINE (${data.latency})`;
      }
    } else {
      throw new Error();
    }
  } catch (err) {
    if (dot) {
      dot.style.background = '#f87171';
      dot.style.boxShadow = '0 0 8px #f87171';
      dot.className = 'sys-dot';
    }
    if (lbl) {
      lbl.textContent = 'HOSTING: OFFLINE';
    }
  }
}


// Process user input commands
export async function processCommand(rawCmd) {
  const cmd = rawCmd.toLowerCase().trim();
  if (!cmd) return;

  logToHUD(`Received: "${cmd}"`, 'command');
  const wasListening = window.isListening() || window.shouldListen;

  // Temporarily halt listening state during thought processing
  window.stopListening();

  // 1. WAKE WORD
  if (cmd === 'jarvis' || cmd === 'hey jarvis' || cmd === 'hi jarvis' || cmd === 'ok jarvis') {
    speakAndListen('Hello sir, how can I help?', wasListening);
    return;
  }

  // 2. WEB LINKS & LAUNCHERS
  if (cmd.includes('open youtube') || cmd === 'youtube') {
    speakAndListen('Opening YouTube, sir.', wasListening);
    setTimeout(() => window.open('https://www.youtube.com', '_blank'), 500);
    return;
  }
  if (cmd.includes('open google') || cmd === 'google') {
    speakAndListen('Opening Google, sir.', wasListening);
    setTimeout(() => window.open('https://www.google.com', '_blank'), 500);
    return;
  }
  if (cmd.includes('open whatsapp') || cmd === 'whatsapp') {
    speakAndListen('Opening WhatsApp Desktop, sir.', wasListening);
    window.apiRequest('/api/system/launch', {
      method: 'POST',
      body: JSON.stringify({ appName: 'whatsapp' })
    })
      .then(r => r.json())
      .then(data => { if (!data.success) logToHUD(data.message, 'error'); })
      .catch(() => logToHUD('Failed to launch WhatsApp', 'error'));
    return;
  }
  if (cmd === 'spotify' || cmd === 'open spotify' || (cmd.includes('open spotify') && !cmd.startsWith('play '))) {
    speakAndListen('Opening Spotify Web Player, sir.', wasListening);
    setTimeout(() => window.open('https://open.spotify.com', '_blank'), 500);
    return;
  }
  if (cmd.includes('open instagram') || cmd === 'instagram') {
    speakAndListen('Opening Instagram, sir.', wasListening);
    setTimeout(() => window.open('https://www.instagram.com', '_blank'), 500);
    return;
  }
  if (cmd.includes('open gmail') || cmd === 'gmail' || cmd.includes('open mail') || cmd.includes('open email')) {
    speakAndListen('Opening Gmail, sir.', wasListening);
    setTimeout(() => window.open('https://mail.google.com', '_blank'), 500);
    return;
  }

  // 3. SPOTIFY CONTROLS
  if (cmd === 'pause' || cmd === 'pause music' || cmd === 'pause spotify' ||
      cmd === 'stop music' || cmd === 'stop the music' || cmd === 'stop song' ||
      cmd === 'stop playing') {
    handleSpotifyCommand('/api/spotify/pause', 'POST');
    return;
  }
  if (cmd === 'resume' || cmd === 'resume music' || cmd === 'resume spotify' ||
      cmd === 'play spotify' || cmd === 'continue music' || cmd === 'unpause') {
    handleSpotifyCommand('/api/spotify/play', 'POST');
    return;
  }
  if (cmd === 'next song' || cmd === 'next track' || cmd === 'skip song' ||
      cmd === 'skip' || cmd === 'skip track' || cmd === 'next') {
    handleSpotifyCommand('/api/spotify/next', 'POST');
    return;
  }
  if (cmd === 'previous song' || cmd === 'previous track' || cmd === 'back song' ||
      cmd === 'go back' || cmd === 'previous' || cmd === 'last song') {
    handleSpotifyCommand('/api/spotify/prev', 'POST');
    return;
  }
  if (cmd === 'what song is playing' || cmd === 'current song' || cmd === 'who is singing' ||
      cmd === 'what is playing' || cmd === 'what song' || cmd === 'which song') {
    handleSpotifyCommand('/api/spotify/current', 'GET');
    return;
  }

  // 4. SPOTIFY SPECIFIC SONG PLAYBACK
  let songQuery = null;
  if (cmd.startsWith('play ')) {
    songQuery = rawCmd.substring(5).trim();
  } else if (cmd.startsWith('put on ')) {
    songQuery = rawCmd.substring(7).trim();
  } else if (cmd.includes(' play ')) {
    const idx = cmd.indexOf(' play ');
    songQuery = rawCmd.substring(idx + 6).trim();
  }

  if (songQuery) {
    if (songQuery.toLowerCase().endsWith(' on spotify')) {
      songQuery = songQuery.substring(0, songQuery.length - 11).trim();
    }
    if (songQuery.toLowerCase().endsWith(' song')) {
      songQuery = songQuery.substring(0, songQuery.length - 5).trim();
    }
    if (songQuery.length > 1) {
      logToHUD(`Spotify: Searching for "${songQuery}"`, 'init');
      handleSpotifyCommand('/api/spotify/play', 'POST', { query: songQuery });
      return;
    }
  }

  // 5. SHUTDOWN SYSTEMS
  if (cmd.includes('shut down') || cmd.includes('shutdown') ||
      cmd === 'bye' || cmd === 'goodbye' || cmd === 'good bye') {
    speakAndStop('Goodbye, sir. Shutting down neural interface.');
    return;
  }

  // 6. GENERAL AI CHAT PROCESSING
  setCoreState('thinking');
  logToHUD('Querying neural network...', 'init');
  
  const backendSelect = document.getElementById('backendSelect');
  const selectedModel = backendSelect ? backendSelect.value : 'qwen2.5:1.5b';

  try {
    const response = await window.apiRequest('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt: rawCmd, model: selectedModel })
    });

    if (!response.ok) throw new Error('API server returned error code');

    const data = await response.json();
    const cleanResponse = data.response
      .replace(/[*_~`#]/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    speakAndListen(cleanResponse, wasListening);
  } catch (error) {
    logToHUD(`Connection Error: ${error.message}`, 'error');
    speakAndListen("Sir, I am unable to connect to the neural network gateway. Please ensure the backend is running.", wasListening);
  }
}

// Input text form submit listeners
const submitInput = () => {
  const text = commandInput.value.trim();
  if (!text) return;
  commandInput.value = '';
  processCommand(text);
};

window.addEventListener('DOMContentLoaded', () => {
  if (sendBtn) sendBtn.addEventListener('click', submitInput);
  if (commandInput) {
    commandInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submitInput();
      }
    });
  }

  // Hook reactor circle toggle mic
  if (triggerMic) {
    triggerMic.addEventListener('click', () => {
      if (window.isListening()) {
        window.stopListening();
        logToHUD('Mic deactivated.', 'init');
      } else {
        window.startListening();
        logToHUD('Mic activated. Awaiting verbal instruction.', 'init');
      }
    });
  }

  // Hook mic button
  if (micBtn) {
    micBtn.addEventListener('click', () => {
      if (window.isListening()) {
        window.stopListening();
        logToHUD('Mic deactivated.', 'init');
      } else {
        window.startListening();
        logToHUD('Mic activated. Awaiting verbal instruction.', 'init');
      }
    });
  }

  // Setup quick links around reactor
  const registerOpener = (id, url, name) => {
    const btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener('click', () => {
        speakAndListen(`Opening ${name}, sir.`, window.isListening() || window.shouldListen);
        setTimeout(() => window.open(url, '_blank'), 500);
      });
    }
  };
  
  registerOpener('btnYoutube', 'https://www.youtube.com', 'YouTube');
  registerOpener('btnGoogle', 'https://www.google.com', 'Google');
  registerOpener('btnSpotify', 'https://open.spotify.com', 'Spotify');
  registerOpener('btnInstagram', 'https://www.instagram.com', 'Instagram');
  registerOpener('btnGmail', 'https://mail.google.com', 'Gmail');

  // Launch WhatsApp via Node API
  const btnWA = document.getElementById('btnWhatsApp');
  if (btnWA) {
    btnWA.addEventListener('click', () => {
      speakAndListen('Opening WhatsApp Desktop, sir.', window.isListening() || window.shouldListen);
      window.apiRequest('/api/system/launch', {
        method: 'POST',
        body: JSON.stringify({ appName: 'whatsapp' })
      })
        .then(r => r.json())
        .then(data => { if (!data.success) logToHUD(data.message, 'error'); })
        .catch(() => logToHUD('Failed to launch WhatsApp', 'error'));
    });
  }

  // Periodic Diagnostics
  setInterval(pollDiagnostics, 5000);
  pollDiagnostics();

  // Ollama Poller
  setInterval(checkOllama, 15000);
  checkOllama();

  // Hosting Poller
  setInterval(checkHostingStatus, 15000);
  checkHostingStatus();

  // Log neural link success
  logToHUD('Neural link established. All systems online.', 'response');
});

// Set global hooks for speech.js callback delegates
window.logToHUD = logToHUD;
window.updateStatus = updateStatus;
window.setCoreState = setCoreState;
window.handleCommandInput = processCommand;

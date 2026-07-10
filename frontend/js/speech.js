// Web Speech API Interface and synthesis wrappers for J.A.R.V.I.S.

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
const synth = window.speechSynthesis;

let isListening = false;
let isSpeaking = false;
let shouldListen = false;
let speechSafetyTimer = null;
let speechRetryCount = 0;
const MAX_SPEECH_RETRIES = 2;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
} else {
    console.warn('Voice recognition not supported in this browser.');
}

export function speak(text, callback) {
    synth.cancel();
    isSpeaking = true;

    if (speechSafetyTimer) clearTimeout(speechSafetyTimer);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 1;
    utterance.rate = 0.95;
    utterance.pitch = 0.7;

    const voices = synth.getVoices();
    const preferred = voices.find(v =>
        v.name.includes('Google UK English Male') ||
        v.name.includes('Microsoft David') ||
        v.name.toLowerCase().includes('male')
    );
    if (preferred) utterance.voice = preferred;

    let callbackFired = false;
    function onDone() {
        if (callbackFired) return;
        callbackFired = true;
        isSpeaking = false;
        speechRetryCount = 0;
        window.setCoreState('idle');
        if (speechSafetyTimer) clearTimeout(speechSafetyTimer);
        if (callback) callback();
    }

    utterance.onstart = () => {
        speechRetryCount = 0;
        window.setCoreState('speaking');
        window.logToHUD(`Speaking: "${text}"`, 'response');
    };

    utterance.onend = () => onDone();

    utterance.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') {
            onDone();
            return;
        }

        if (speechRetryCount < MAX_SPEECH_RETRIES) {
            speechRetryCount++;
            window.logToHUD(`Speech error (${e.error || 'unknown'}), retrying (${speechRetryCount}/${MAX_SPEECH_RETRIES})...`, 'init');
            isSpeaking = false;
            callbackFired = false;
            setTimeout(() => speak(text, callback), 500);
            return;
        }

        window.logToHUD(`Speech failed after retries: ${e.error || 'unknown'}`, 'error');
        onDone();
    };

    synth.speak(utterance);

    // Chrome resume bug fix
    let resumeInterval = setInterval(() => {
        if (!synth.speaking) {
            clearInterval(resumeInterval);
            return;
        }
        synth.resume();
    }, 5000);

    const estimatedDuration = Math.max(3000, text.length * 80);
    speechSafetyTimer = setTimeout(() => {
        if (isSpeaking) {
            window.logToHUD('Speech timeout — resetting.', 'init');
            clearInterval(resumeInterval);
            onDone();
        }
    }, estimatedDuration);
}

export function speakAndListen(text, resume = true) {
    speak(text, () => {
        if (resume) {
            setTimeout(() => startListening(), 400);
        } else {
            stopListening();
        }
    });
}

export function speakAndStop(text) {
    speak(text, () => {
        shouldListen = false;
        window.logToHUD('Mic stopped. Awaiting manual activation.', 'init');
        window.updateStatus('IDLE', false);
        window.setCoreState('idle');
        const micBtn = document.getElementById('micBtn');
        if (micBtn) {
            micBtn.style.color = '';
            micBtn.style.borderColor = '';
            micBtn.style.boxShadow = '';
        }
    });
}

export function startListening() {
    if (!recognition || isListening) return;
    try {
        shouldListen = true;
        recognition.start();
    } catch (e) {
        console.error("Failed to start speech recognition:", e);
    }
}

export function stopListening() {
    if (!recognition || !isListening) return;
    shouldListen = false;
    recognition.stop();
}

// Hook speech recognition events
if (recognition) {
    recognition.onstart = () => {
        isListening = true;
        window.updateStatus('LISTENING', true);
        window.setCoreState('listening');
    };

    recognition.onend = () => {
        isListening = false;
        // Auto-restart if intended
        if (shouldListen && !isSpeaking) {
            setTimeout(() => {
                if (shouldListen && !isSpeaking && !isListening) {
                    try { recognition.start(); } catch(e){}
                }
            }, 300);
        } else if (!isSpeaking) {
            window.updateStatus('IDLE', false);
            window.setCoreState('idle');
        }
    };

    recognition.onerror = (e) => {
        if (e.error !== 'no-speech') {
            window.logToHUD(`Recognition error: ${e.error}`, 'error');
        }
        if (e.error === 'not-allowed') {
            shouldListen = false;
            window.updateStatus('BLOCKED', false);
        }
    };

    recognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        window.logToHUD(text, 'command');
        // Delegate parsing input to app.js
        if (window.handleCommandInput) {
            window.handleCommandInput(text);
        }
    };
}

// Global functions
window.speak = speak;
window.speakAndListen = speakAndListen;
window.speakAndStop = speakAndStop;
window.startListening = startListening;
window.stopListening = stopListening;
window.isListening = () => isListening;
window.isSpeaking = () => isSpeaking;

// Spotify Integration Module for JARVIS Operator Dashboard

let spotifyIsConnected = false;

export async function checkSpotifyStatus() {
  const connectedDiv = document.getElementById('spotifyConnected');
  const disconnectedDiv = document.getElementById('spotifyDisconnected');
  const userSpan = document.getElementById('spotifyUser');
  
  try {
    const response = await window.apiRequest('/api/spotify/status');
    const data = await response.json();
    spotifyIsConnected = data.connected;
    
    if (data.connected) {
      if (connectedDiv) connectedDiv.style.display = 'flex';
      if (disconnectedDiv) disconnectedDiv.style.display = 'none';
      if (userSpan) userSpan.textContent = data.user || 'User';
      window.logToHUD(`Spotify Link: Active (${data.user})`, 'init');
    } else {
      if (connectedDiv) connectedDiv.style.display = 'none';
      if (disconnectedDiv) disconnectedDiv.style.display = 'flex';
    }
  } catch (e) {
    if (connectedDiv) connectedDiv.style.display = 'none';
    if (disconnectedDiv) disconnectedDiv.style.display = 'flex';
  }
}

export async function handleSpotifyCommand(endpoint, method = 'POST', bodyObj = null) {
  window.setCoreState('thinking');
  window.logToHUD(`Spotify Executing: ${endpoint}`, 'init');
  
  try {
    const options = { method };
    if (bodyObj) {
      options.body = JSON.stringify(bodyObj);
    }
    
    const response = await window.apiRequest(endpoint, options);
    const data = await response.json();
    
    const wasListening = window.isListening() || window.shouldListen;
    
    if (data.error) {
      window.logToHUD(`Spotify Error: ${data.error}`, 'error');
      window.speakAndListen(`Sir, ${data.error}`, wasListening);
    } else {
      const msg = data.message || "Action completed, sir.";
      window.logToHUD(`Spotify: ${msg}`, 'response');
      window.speakAndListen(msg, wasListening);
    }
  } catch (e) {
    window.logToHUD(`Spotify request failed: ${e.message}`, 'error');
    window.speakAndListen('Sir, I could not communicate with the Spotify backend.', window.isListening() || window.shouldListen);
  }
}

// Hook load events
window.addEventListener('DOMContentLoaded', () => {
  const btnConnectSpotify = document.getElementById('btnConnectSpotify');
  if (btnConnectSpotify) {
    btnConnectSpotify.addEventListener('click', () => {
      // Direct redirect to Spotify auth route. Since /api/spotify/login will redirect to Spotify,
      // we need to pass along the jwt token, or since redirect callback will save token in session,
      // we can do standard window.location.href. To make sure the server knows who the user is,
      // the browser will redirect. Note that the callback will redirect to dashboard.html.
      window.location.href = `/api/spotify/login?token=${localStorage.getItem('token')}`;
    });
  }

  const btnDisconnectSpotify = document.getElementById('btnDisconnectSpotify');
  if (btnDisconnectSpotify) {
    btnDisconnectSpotify.addEventListener('click', async () => {
      try {
        const r = await window.apiRequest('/api/spotify/logout', { method: 'POST' });
        const data = await r.json();
        if (data.success) {
          window.logToHUD('Spotify account unlinked.', 'init');
          checkSpotifyStatus();
        }
      } catch (e) {
        window.logToHUD('Failed to unlink Spotify.', 'error');
      }
    });
  }

  // Check Spotify status on load
  checkSpotifyStatus();
});

window.handleSpotifyCommand = handleSpotifyCommand;
window.checkSpotifyStatus = checkSpotifyStatus;

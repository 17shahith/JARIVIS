// Authentication flow for J.A.R.V.I.S. Operator HUD

const checkAuth = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const res = await window.apiRequest('/api/auth/status');
    const status = await res.json();
    if (!status.authenticated) {
      localStorage.removeItem('token');
      window.location.href = 'login.html';
    }
  } catch (err) {
    console.error("Authentication handshake failed:", err.message);
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  }
};

const handleLogout = async () => {
  try {
    await window.apiRequest('/api/auth/logout', { method: 'POST' });
  } catch (err) {
    console.error("Logout request error:", err);
  } finally {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  }
};

// Protect page immediately
if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('index.html')) {
  checkAuth();
}

window.addEventListener('DOMContentLoaded', () => {
  const btnLogout = document.getElementById('btnLogoutOperator');
  if (btnLogout) {
    btnLogout.addEventListener('click', handleLogout);
  }
});

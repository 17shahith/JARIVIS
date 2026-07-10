// Weather Synchronization Module for J.A.R.V.I.S. HUD

export function updateWeather() {
  window.apiRequest('/api/weather')
    .then(r => r.json())
    .then(data => {
      if (data.success) {
        const emojiEl = document.getElementById('weatherEmoji');
        const tempEl = document.getElementById('weatherTemp');
        const cityEl = document.getElementById('weatherCity');
        const condEl = document.getElementById('weatherCond');
        
        if (emojiEl) emojiEl.textContent = data.emoji;
        if (tempEl) tempEl.textContent = data.temp;
        if (cityEl) cityEl.textContent = data.city;
        if (condEl) condEl.textContent = data.condition;

        const widget = document.getElementById('weatherWidget');
        if (widget) {
          widget.dataset.speechText = `Sir, the weather in ${data.city} is currently ${data.condition} with a temperature of ${data.temp}.`;
        }
      }
    })
    .catch(err => console.error('Weather sync error:', err));
}

// Hook load events and intervals
window.addEventListener('DOMContentLoaded', () => {
  // Sync weather every 15 minutes
  setInterval(updateWeather, 900000);
  updateWeather();

  // Make weather widget clickable to speak status
  const widget = document.getElementById('weatherWidget');
  if (widget) {
    widget.addEventListener('click', () => {
      if (widget.dataset.speechText && window.speak) {
        window.speak(widget.dataset.speechText);
      }
    });
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'play-sound') {
    playNotificationSound();
  }
});

function playNotificationSound() {
  const audioContext = new AudioContext();
  
  // Create an oscillator for the "ding" sound
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Settings for a pleasant chime
  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
  oscillator.frequency.exponentialRampToValueAtTime(1046.5, audioContext.currentTime + 0.1); // Slide up to C6

  // Box-shaped envelope to avoid clicking
  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.8);
}

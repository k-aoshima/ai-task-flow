document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const taskName = params.get('taskName');
    
    if (taskName) {
      const messageEl = document.getElementById('taskMessage');
      if (messageEl) {
        messageEl.textContent = `「${taskName}」の保留時間が終了しました。`;
      }
    }

    const closeBtn = document.getElementById('closeBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        window.close();
      });
    }
});

chrome.storage.local.get(['leetroulette_user_data'], (result) => {
  if (result.leetroulette_user_data) {
    const dataString = JSON.stringify(result.leetroulette_user_data);
    const existing = window.localStorage.getItem('leetroulette_user_data');
    
    // Only update and reload if data changed
    if (existing !== dataString) {
      window.localStorage.setItem('leetroulette_user_data', dataString);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('leetroulette-sync-update'));
      }, 100);
    }
  }
});

// Listen for live syncs while the user has the page open
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.leetroulette_user_data) {
    window.localStorage.setItem(
      'leetroulette_user_data', 
      JSON.stringify(changes.leetroulette_user_data.newValue)
    );
    window.dispatchEvent(new CustomEvent('leetroulette-sync-update'));
  }
});

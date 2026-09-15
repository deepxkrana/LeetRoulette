document.addEventListener("DOMContentLoaded", () => {
  const syncBtn = document.getElementById("sync-btn");
  const openAppBtn = document.getElementById("open-app-btn");
  const statusText = document.getElementById("status-text");
  const progressContainer = document.getElementById("progress-container");
  const progressFill = document.getElementById("progress-fill");
  const progressDetail = document.getElementById("progress-detail");

  syncBtn.addEventListener("click", () => {
    syncBtn.disabled = true;
    syncBtn.innerText = "Syncing...";
    progressContainer.classList.remove("hidden");
    statusText.classList.add("hidden");

    chrome.runtime.sendMessage({ action: "START_SYNC" });
  });

  openAppBtn.addEventListener("click", () => {
    chrome.tabs.query({}, (tabs) => {
      const existingTab = tabs.find(t => t.url && (t.url.includes("localhost:5173") || t.url.includes("leet-roulette.vercel.app") || t.url.includes("leetroulette.com")));
      if (existingTab) {
        // Just reload the tab since the background script might have already injected data, 
        // or we rely on the content script executing on reload
        chrome.tabs.reload(existingTab.id);
        chrome.tabs.update(existingTab.id, { active: true });
        chrome.windows.update(existingTab.windowId, { focused: true });
      } else {
        chrome.tabs.create({ url: "http://localhost:5173" });
      }
    });
  });

  function handleStatus(msg) {
    if (msg.type === "SYNC_PROGRESS") {
      syncBtn.disabled = true;
      syncBtn.innerText = "Syncing...";
      progressContainer.classList.remove("hidden");
      statusText.classList.add("hidden");
      
      progressFill.style.width = `${msg.percent}%`;
      progressDetail.innerText = msg.detail;
    } else if (msg.type === "SYNC_COMPLETE") {
      syncBtn.classList.add("hidden");
      openAppBtn.classList.remove("hidden");
      progressContainer.classList.add("hidden");
      statusText.classList.remove("hidden");
      statusText.innerText = `✅ Sync complete! Saved ${msg.count} solved problems.`;
      statusText.style.color = "#4ade80";
    } else if (msg.type === "SYNC_ERROR") {
      syncBtn.disabled = false;
      syncBtn.innerText = "Try Again";
      progressContainer.classList.add("hidden");
      statusText.classList.remove("hidden");
      statusText.innerText = `❌ Error: ${msg.error}. Make sure you are logged into LeetCode.com`;
      statusText.style.color = "#ef4444";
    } else if (msg.type === "IDLE") {
      // Just wait for user action
    }
  }

  // Listen for live updates
  chrome.runtime.onMessage.addListener(handleStatus);

  // Fetch initial status in case a sync is already running
  chrome.runtime.sendMessage({ action: "GET_SYNC_STATUS" }, (response) => {
    if (response) handleStatus(response);
  });
});

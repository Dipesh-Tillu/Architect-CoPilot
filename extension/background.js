const cache = new Map(); // url -> { ts, title, headings, text, url }
let backendUrl = "http://127.0.0.1:8000";
let tokenBudgetPerHour = 100000; // simulated budget
let usedTokensThisHour = 0;
let lastReset = Date.now();

function resetBudgetIfNeeded() {
  const hour = 3600 * 1000;
  if (Date.now() - lastReset > hour) {
    usedTokensThisHour = 0;
    lastReset = Date.now();
  }
}

chrome.storage.sync.get(["backendUrl", "tokenBudgetPerHour"], (res) => {
  if (res.backendUrl) backendUrl = res.backendUrl;
  if (res.tokenBudgetPerHour) tokenBudgetPerHour = res.tokenBudgetPerHour;
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.backendUrl?.newValue) backendUrl = changes.backendUrl.newValue;
  if (changes.tokenBudgetPerHour?.newValue) tokenBudgetPerHour = changes.tokenBudgetPerHour.newValue;
});

chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  }
});

console.log("[Copilot] service worker loaded");

// 1) Set behavior on install AND on browser startup
chrome.runtime.onInstalled.addListener(() => {
  console.log("[Copilot] onInstalled");
  if (chrome.sidePanel?.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  }
});
chrome.runtime.onStartup.addListener(() => {
  console.log("[Copilot] onStartup");
  if (chrome.sidePanel?.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  }
});

const hasSidePanel = !!(chrome.sidePanel && chrome.sidePanel.setOptions);

chrome.action.onClicked.addListener(async (tab) => {
  if (hasSidePanel) {
    try {
      await chrome.sidePanel.setOptions({ tabId: tab.id, path: "panel.html", enabled: true });
      if (chrome.sidePanel.open) {
        await chrome.sidePanel.open({ tabId: tab.id });
        return;
      }
    } catch (e) { /* fall through to popup */ }
  }
  openFallbackPopup();
});

function openFallbackPopup() {
  const url = chrome.runtime.getURL("panel.html");
  chrome.windows.getCurrent((win) => {
    const width = 420;
    const left = Math.max(0, (win.left || 0) + (win.width || 1280) - width - 20);
    const height = Math.max(600, win.height || 800);
    const top = win.top || 0;

    chrome.windows.create({ url, focused: true }, (created) => {
      if (chrome.runtime.lastError || !created) return;
      chrome.windows.update(created.id, {
        width,
        height,
        left,
        top,
        state: "normal"
      });
    });
  });
}

function domainFromUrl(u) {
  try { return new URL(u).hostname; } catch { return ""; }
}

async function getDomainMemory(domain) {
  return new Promise((resolve) => {
    chrome.storage.local.get([`mem:${domain}`], (res) => {
      resolve(res[`mem:${domain}`] || []);
    });
  });
}

async function appendDomainMemory(domain, record) {
  return new Promise((resolve) => {
    chrome.storage.local.get([`mem:${domain}`], (res) => {
      const arr = res[`mem:${domain}`] || [];
      arr.push({ ts: Date.now(), ...record });
      chrome.storage.local.set({ [`mem:${domain}`]: arr.slice(-50) }, () => resolve(true));
    });
  });
}

chrome.runtime.onMessage.addListener(async (msg, sender) => {
  if (msg.type === "PAGE_SNAPSHOT") {
    const { url, title, headings, text } = msg.data;
    cache.set(url, { ts: Date.now(), title, headings, text, url });
  }
  if (msg.type === "PANEL_READY") {
    const recent = Array.from(cache.values()).slice(-5);
    chrome.runtime.sendMessage({ type: "CONTEXT_SNAPSHOT", data: recent, budget: { usedTokensThisHour, tokenBudgetPerHour } });
  }
  if (msg.type === "GENERATE") {
    resetBudgetIfNeeded();
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeUrl = tabs[0]?.url || "";
    const domain = domainFromUrl(activeUrl);
    const recent = Array.from(cache.values()).slice(-8);
    const memory = await getDomainMemory(domain);
    const payload = { ask: msg.ask, context: recent, memory, domain };

    try {
      const res = await fetch(backendUrl + "/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      usedTokensThisHour += (data.token_estimate || 0);
      chrome.runtime.sendMessage({ type: "RESULT", data, budget: { usedTokensThisHour, tokenBudgetPerHour } });
      await appendDomainMemory(domain, { ask: msg.ask, answer: data.text || "", cites: data.citations || [] });
    } catch (e) {
      chrome.runtime.sendMessage({ type: "RESULT", data: { error: String(e) }, budget: { usedTokensThisHour, tokenBudgetPerHour } });
    }
  }
});

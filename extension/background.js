const cache = new Map();         // url -> { ts, url, title, headings, text }
const memory = new Map();        // domain -> [{ ask, answer, cites, ts }]
let openaiKey = "";
let openaiModel = "gpt-4o-mini";

chrome.storage.local.get(["openai_key", "openai_model"], (r) => {
  openaiKey = r.openai_key || "";
  openaiModel = r.openai_model || "gpt-4o-mini";
});
chrome.storage.onChanged.addListener((ch) => {
  if (ch.openai_key) openaiKey = ch.openai_key.newValue || "";
  if (ch.openai_model) openaiModel = ch.openai_model.newValue || "gpt-4o-mini";
});

chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel?.setPanelBehavior) {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  if (chrome.sidePanel?.setOptions) {
    try {
      await chrome.sidePanel.setOptions({ tabId: tab.id, path: "panel.html", enabled: true });
      await chrome.sidePanel.open?.({ tabId: tab.id });
      return;
    } catch (_) {}
  }
  openPopupFallback();
});

function openPopupFallback() {
  const url = chrome.runtime.getURL("panel.html");
  chrome.windows.getCurrent((win) => {
    const width = 420;
    const left = Math.max(0, (win.left || 0) + (win.width || 1280) - width - 20);
    const height = Math.max(600, win.height || 800);
    const top = win.top || 0;
    chrome.windows.create({ url, focused: true }, (created) => {
      if (!created) return;
      chrome.windows.update(created.id, { width, height, left, top, state: "normal" });
    });
  });
}

chrome.runtime.onMessage.addListener(async (msg, sender) => {
  if (msg.type === "PAGE_SNAPSHOT") {
    const { url, title, headings, text } = msg.data;
    cache.set(url, { ts: Date.now(), url, title, headings, text });
  }
  if (msg.type === "PANEL_READY") {
    const recent = Array.from(cache.values()).slice(-6);
    safeSend({ type: "CONTEXT_SNAPSHOT", data: recent });
  }
  if (msg.type === "GENERATE") {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const dom = domainOf(tabs[0]?.url || "");
    const recent = Array.from(cache.values()).slice(-8);
    const mem = memory.get(dom) || [];
    const plan = classifyIntent(msg.ask);
    const prompt = buildPrompt(msg.ask, recent, mem, plan);
    try {
      const result = await callOpenAI(prompt);
      safeSend({ type: "RESULT", data: result });
      remember(dom, { ask: msg.ask, answer: result.text, cites: result.citations || [] });
    } catch (e) {
      safeSend({ type: "RESULT", data: { error: String(e) } });
    }
  }
});

function domainOf(u) { try { return new URL(u).hostname; } catch { return ""; } }
function remember(d, rec) { const a = memory.get(d) || []; a.push({ ...rec, ts: Date.now() }); memory.set(d, a.slice(-50)); }
function classifyIntent(ask) {
  const a = (ask || "").toLowerCase();
  if (a.includes("tradeoff") || a.includes(" vs ")) return "TRADEOFF";
  if (a.includes("what if") || a.includes("simulate")) return "WHATIF";
  return "ARCH";
}
function buildPrompt(ask, ctx, mem, plan) {
  const ctxStr = ctx.map(c => `TITLE: ${c.title}\n${(c.text || "").slice(0, 1200)}`).join("\n---\n");
  const memStr = mem.slice(-4).map(m => `Q: ${m.ask}\nA: ${(m.answer || "").slice(0, 600)}`).join("\n---\n");
  return `You are an enterprise Solution Architect Copilot.
Task: ${plan}. Use CONTEXT and MEMORY when helpful. If insufficient, say so.

QUESTION:
${ask}

CONTEXT:
${ctxStr}

MEMORY:
${memStr}

Respond STRICTLY as JSON with keys: "text", "mermaid", and "citations" (array of {title,url}). Keep text under 350 words.`;
}
async function callOpenAI(prompt) {
  if (!openaiKey) throw new Error("OpenAI key not set. Open Options and save it.");
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${openaiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: openaiModel,
      temperature: 0.2,
      messages: [
        { role: "system", content: "You are a helpful solution architect copilot." },
        { role: "user", content: prompt }
      ]
    })
  });
  if (!r.ok) throw new Error(`OpenAI error ${r.status}: ${await r.text()}`);
  const data = await r.json();
  let content = data.choices?.[0]?.message?.content || "";
  let txt = content.trim();
  if (txt.startsWith("```")) txt = txt.split("\n").filter(l => !l.trim().startsWith("```")).join("\n");
  let parsed; try { parsed = JSON.parse(txt); } catch { parsed = { text: content, mermaid: "", citations: [] }; }
  parsed.text ||= ""; parsed.mermaid ||= ""; parsed.citations ||= [];
  return parsed;
}
function safeSend(msg) { try { chrome.runtime.sendMessage(msg, () => void chrome.runtime.lastError); } catch {} }

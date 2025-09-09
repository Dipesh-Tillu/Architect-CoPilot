const askEl = document.getElementById("ask");
const goEl = document.getElementById("go");
const ctxEl = document.getElementById("ctx");
const outEl = document.getElementById("out");

function renderCtx(items){
  if (!items || !items.length) { ctxEl.textContent = "No context captured yet."; return; }
  ctxEl.innerHTML = items.map(i => `<div><strong>${i.title || i.url}</strong><br><small>${i.url}</small></div>`).join("");
}
function renderResult(r){
  if (r.error) {
    outEl.innerHTML = `<pre>${r.error}</pre>`;
    return;
  }
  const cites = (r.citations || []).map(c => `<li><a href="${c.url}" target="_blank" rel="noreferrer">${c.title || c.url}</a></li>`).join("");
  outEl.innerHTML = `
    <div class="row">
      <div class="col"><h3>Answer</h3><pre>${escapeHtml(r.text || "")}</pre></div>
      <div class="col"><h3>Mermaid</h3><pre>${escapeHtml(r.mermaid || "")}</pre></div>
    </div>
    <div class="sec"><h3>Grounding</h3><ul>${cites || "<li>None</li>"}</ul></div>
  `;
}
function escapeHtml(s){ return (s||"").replace(/[&<>]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m])); }

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "CONTEXT_SNAPSHOT") renderCtx(msg.data);
  if (msg.type === "RESULT") renderResult(msg.data);
});
function ping(){ try { chrome.runtime.sendMessage({ type: "PANEL_READY" }); } catch {} }
ping();
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") ping(); });

goEl.addEventListener("click", () => {
  const q = askEl.value.trim();
  if (!q) return;
  try { chrome.runtime.sendMessage({ type: "GENERATE", ask: q }); } catch (e) { renderResult({ error: String(e) }); }
});

const form = document.getElementById("form");
const input = document.getElementById("ask");
const out = document.getElementById("out");
const ctx = document.getElementById("context");
const budget = document.getElementById("budget");
const showGrounding = document.getElementById("showGrounding");
let lastMermaid = "";
let lastGrounding = [];

function renderBudget(b) {
  if (!b) return;
  budget.textContent = `Tokens used this hour: ${b.usedTokensThisHour || 0} / ${b.tokenBudgetPerHour || 0}`;
}

function renderContext(items) {
  if (!items || !items.length) { ctx.innerHTML = ""; return; }
  const lis = items.map(i => `<li title="${i.url}">${i.title || i.url}</li>`).join("");
  ctx.innerHTML = `<strong>Using context from:</strong><ul>${lis}</ul>`;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  out.textContent = "Thinking…";
  chrome.runtime.sendMessage({ type: "GENERATE", ask: input.value });
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "CONTEXT_SNAPSHOT") { renderContext(msg.data); renderBudget(msg.budget); }
  if (msg.type === "RESULT") {
    renderBudget(msg.budget);
    if (msg.data?.error) {
      out.textContent = "Error: " + msg.data.error + "\nIs the backend running?";
      return;
    }
    const { text, mermaid, citations, grounding } = msg.data;
    lastMermaid = mermaid || "";
    lastGrounding = grounding || [];
    const cites = (citations || []).map(c => `<li><a href="${c.url}" target="_blank">${c.title || c.url}</a></li>`).join("");
    const groundHtml = (grounding && showGrounding.checked)
      ? `<div class="grounding"><strong>Grounding</strong><ul>${grounding.map(g=>`<li>${g.slice(0,240)}…</li>`).join("")}</ul></div>`
      : "";
    out.innerHTML = `<div><strong>Answer</strong></div><div>${text || ""}</div><hr/><div><strong>Mermaid</strong></div><pre>${lastMermaid}</pre><hr/><div><strong>Citations</strong></div><ul>${cites}</ul>${groundHtml}`;
  }
});

document.getElementById("copyMermaid").addEventListener("click", async () => {
  if (!lastMermaid) return;
  await navigator.clipboard.writeText(lastMermaid);
});

document.getElementById("downloadMermaid").addEventListener("click", async () => {
  if (!lastMermaid) return;
  const blob = new Blob([lastMermaid], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "diagram.mmd";
  a.click();
  URL.revokeObjectURL(url);
});

showGrounding.addEventListener("change", () => {
  chrome.runtime.sendMessage({ type: "PANEL_READY" });
});

chrome.runtime.sendMessage({ type: "PANEL_READY" });

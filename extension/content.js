let last = "";
function snapshot() {
  const title = document.title || "";
  const headings = Array.from(document.querySelectorAll("h1,h2")).map(n => n.innerText).join("\n");
  const main = document.querySelector("main") || document.body;
  const text = (main.innerText || "").replace(/\s+/g, " ").slice(0, 50000);
  const data = { url: location.href, title, headings, text };
  const s = JSON.stringify(data);
  if (s !== last) { last = s; chrome.runtime.sendMessage({ type: "PAGE_SNAPSHOT", data }); }
}
new MutationObserver(() => setTimeout(snapshot, 300)).observe(document.documentElement, { subtree: true, childList: true });
window.addEventListener("load", snapshot);
snapshot();

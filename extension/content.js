let latest = "";
function extract() {
  const title = document.title || "";
  const h1 = Array.from(document.querySelectorAll("h1,h2"))
    .map(x => x.innerText).join("\n");
  const main = document.querySelector("main") || document.body;
  const text = (main.innerText || "").replace(/\s+/g, " ").trim().slice(0, 50000);
  const payload = JSON.stringify({ url: location.href, title, headings: h1, text });
  if (payload !== latest) {
    latest = payload;
    chrome.runtime.sendMessage({ type: "PAGE_SNAPSHOT", data: JSON.parse(payload) });
  }
}
const debounced = (() => { let t; return () => { clearTimeout(t); t = setTimeout(extract, 500); }; })();
document.addEventListener("selectionchange", debounced);
document.addEventListener("DOMContentLoaded", debounced);
window.addEventListener("load", debounced);
const mo = new MutationObserver(debounced);
mo.observe(document.documentElement, { childList: true, subtree: true });
debounced();

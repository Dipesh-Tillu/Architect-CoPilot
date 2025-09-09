const keyEl = document.getElementById("key");
const modelEl = document.getElementById("model");
chrome.storage.local.get(["openai_key","openai_model"], (res) => {
  keyEl.value = res.openai_key || "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";
  modelEl.value = res.openai_model || "gpt-4o-mini";
});
document.getElementById("save").addEventListener("click", () => {
  chrome.storage.local.set({
    openai_key: keyEl.value.trim(),
    openai_model: modelEl.value.trim() || "gpt-4o-mini"
  }, () => alert("Saved"));
});


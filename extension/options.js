const iBackend = document.getElementById("backend");
const iBudget = document.getElementById("budget");
const save = document.getElementById("save");

chrome.storage.sync.get(["backendUrl", "tokenBudgetPerHour"], (res) => {
  iBackend.value = res.backendUrl || "http://127.0.0.1:8000";
  iBudget.value = res.tokenBudgetPerHour || 100000;
});

save.addEventListener("click", () => {
  const backendUrl = iBackend.value;
  const tokenBudgetPerHour = Number(iBudget.value || 100000);
  chrome.storage.sync.set({ backendUrl, tokenBudgetPerHour }, () => {
    alert("Saved");
  });
});

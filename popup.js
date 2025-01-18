// popup.js

  document.getElementById("clearproxy").addEventListener("click", () => {
    chrome.runtime.sendMessage({ action: "clear_proxy" }, (response) => {
      document.getElementById("response").textContent = response.response
    });
  });
  
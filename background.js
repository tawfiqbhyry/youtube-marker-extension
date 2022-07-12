chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("youtube.com/watch")) {
    const queryParameter = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameter);

    chrome.tabs.sendMessage(tabId, {
      type: "NEW",
      videoID: urlParameters.get("v"),
    });
  }
});

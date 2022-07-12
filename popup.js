import { getCurrentTab } from "./utils.js";

const addNewBookmark = (bookmarkEl, bookmark) => {
  const bookmarksTitleEL = document.createElement("div");
  const newBookmarkEL = document.createElement("div");
  const ControlsElement = document.createElement("div");

  bookmarksTitleEL.textContent = bookmark.desc;
  bookmarksTitleEL.className = "bookmark-title";
  ControlsElement.className = "bookmark-controls";

  setBookmarkAttributes("play", onPlay, ControlsElement);
  setBookmarkAttributes("delete", onDelete, ControlsElement);

  newBookmarkEL.id = "bookmark-" + bookmark.time;
  newBookmarkEL.className = "bookmark";
  newBookmarkEL.setAttribute("timestamp", bookmark.time);

  newBookmarkEL.appendChild(ControlsElement);
  newBookmarkEL.appendChild(bookmarksTitleEL);
  bookmarkEl.appendChild(newBookmarkEL);
};

const viewBookmarks = (currentBookmarks = []) => {
  const bookmarksElement = document.getElementById("bookmarks");
  bookmarksElement.innerHTML = "";

  if (currentBookmarks.length > 0) {
    for (let i = 0; i < currentBookmarks.length; i++) {
      const bookmark = currentBookmarks[i];
      addNewBookmark(bookmarksElement, bookmark);
    }
  } else {
    bookmarksElement.innerHTML = "<i class='row'>No bookmarks to show </i>";
  }

  return;
};

const onPlay = async (e) => {
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const activeTab = await getActiveTabURL();

  chrome.tabs.sendMessage(activeTab.id, {
    type: "PLAY",
    value: bookmarkTime,
  });
};

const onDelete = async (e) => {
  const activeTab = await getActiveTabURL();
  const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
  const bookmarkElementToDelete = document.getElementById(
    "bookmark-" + bookmarkTime
  );

  bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

  chrome.tabs.sendMessage(
    activeTab.id,
    {
      type: "DELETE",
      value: bookmarkTime,
    },
    viewBookmarks
  );
};

const setBookmarkAttributes = (src, eventListener, controlParent) => {
  const controlEL = document.createElement("img");
  controlEL.src = "assets/" + src + ".png";
  controlEL.title = src;
  controlEL.addEventListener("click", eventListener);
  controlParent.appendChild(controlEL);
};

document.addEventListener("DOMContentLoaded", async () => {
  const activeTab = await getCurrentTab();
  const queryParameters = activeTab.url.split("?")[1];
  const urlParameters = new URLSearchParams(queryParameters);

  const currentVideo = urlParameters.get("v");

  if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
    chrome.storage.sync.get([currentVideo], (data) => {
      const currentVideosBookmarks = data[currentVideo]
        ? JSON.parse(data[currentVideo])
        : [];
      viewBookmarks(currentVideosBookmarks);
    });
  } else {
    const container = document.getElementsByClassName("container")[0];
    container.innerHTML =
      '<div class="title">This is not a youtube video</div>';
  }
});

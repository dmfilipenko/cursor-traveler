chrome.browserAction.onClicked.addListener(({ id }) => chrome.tabs.sendMessage(id, 'popup_clicked'))
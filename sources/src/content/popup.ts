
chrome.runtime.onMessage.addListener((e) => {
    const div = document.createElement('div')
    div.classList.add('pizda')
    document.body.appendChild(div)
})
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.bubbleDown) {
        let fs = request.bubbleDown.fullScreen || request.bubbleDown.unFullScreen;
        if (fs) {
            console.log(`${window.location.href}`)
            if (~window.location.href.indexOf(`/mediaembed/${fs.redditId}`)) {
                console.log(`tagging body with nhm-full-screen`);
                document.body.getElementsByTagName("iframe")[0].classList.toggle('nhm-full-screen', typeof request.bubbleDown.fullScreen !== 'undefined');
            }
        }
    }
});

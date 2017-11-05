chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.bubbleDown) {
        let fs = request.bubbleDown.fullScreen || request.bubbleDown.unFullScreen;
        if (fs) {
            console.log(`${window.location.href}`)
            if (request.bubbleDown.unFullScreen || ~window.location.href.indexOf(`/mediaembed/${fs.redditId}`)) {
                console.log(`tagging body with nhm-full-screen`);
                document.body.getElementsByTagName("iframe")[0].classList.toggle('nhm-full-screen', typeof request.bubbleDown.fullScreen !== 'undefined');
            }
        }
    }
});

document.addEventListener("webkitfullscreenchange", function( event ) {
    // a user initiated full screen change -- take off our special fullscreen
    document.body.getElementsByTagName("iframe")[0].classList.toggle('nhm-full-screen', false);
});


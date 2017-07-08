$(document).ready(function() {
    var $micPerm = $('#mic_perm');

    function toggleMicPerm(enabled) {
        $micPerm.toggleClass('success', enabled);
        $micPerm.toggleClass('failure', !enabled);
        $micPerm.find('i').text(enabled ? 'check_circle': 'error');
        $micPerm.find('span').text(enabled ? 'Has microphone permission' : 'Needs microphone permission');
        $('#done').css('visibility', enabled ? 'visible' : 'hidden');
    }

    navigator.webkitGetUserMedia({
        audio: true,
    }, function(stream) {
        console.log("yes permission");
        toggleMicPerm(true);
    }, function() {
        // Aw. No permission (or no microphone available).
        console.log("no permission");
        // let rec = new webkitSpeechRecognition();
        // console.log(`rec ${rec}`);
        // rec.start();
        // recognition.onerror = function(event) {
        toggleMicPerm(false);
    });
});
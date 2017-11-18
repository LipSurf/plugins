
exports.Util = function({
	chrome,
	_,
	CT,
} = {}) {
	var pub = {};

	pub.queryActiveTab = function(cb) {
        if (CT.DEBUG) {
            chrome.tabs.query({ /*active: true, currentWindow: true,*/
                windowType: "normal"
            }, function(tabs) {
                let mostActive;
                for (let tab of tabs) {
                    if (tab.url.startsWith('http')) {
                        if (tab.active) {
                            return cb(tab);
                        }
                        mostActive = tab;
                    }
                }
                return cb(mostActive);
            });
        } else {
            chrome.tabs.query({
                active: true,
                currentWindow: true,
                windowType: "normal"
            }, function(tabs) {
                return cb(tabs[0]);
            });
        }
	};

	return pub;
};
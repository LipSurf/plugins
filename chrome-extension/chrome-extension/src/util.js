
exports.Util = function({
	chrome,
	_,
	CT,
} = {}) {
	var pub = {};

    pub.Detector = function() {
        let _intervalId;
        let _checks = 0;
        let _maxChecks;
        let _sentinelFn;
        let _detectCb;

        function _check() {
            _checks += 1;
            new Promise(_sentinelFn).then((x) => {
                console.log(`calling check ${_checks} ${new Date()}`);
                clearInterval(_intervalId);
                _detectCb(x);
            }, () => {});
            if (typeof(_maxChecks) !== 'undefined' && _checks > _maxChecks) {
                clearInterval(_intervalId);
            }
        }

        return {
            // sentinelFn -- returns true when something is detected
            // detectCb -- is run when sentinelFn returns true (once)
            // interval -- how often to run sentinelFn
            init: function(sentinelFn, detectCb, interval, maxChecks) {
                _maxChecks = maxChecks;
                _sentinelFn = sentinelFn;
                _detectCb = detectCb;
                _check();
                _intervalId = setInterval(function() {
                    _check();
                }, interval);
                return this;
            },

            destroy: function() {
                clearInterval(_intervalId);
            },
        };
    };


    function _queryActiveTab(cb) {
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
                if (tabs.length > 0) {
                    return cb(tabs[0]);
                } else {
                    // try again soon
                }
            });
        }
    }


	pub.queryActiveTab = function(cb) {
        // sometimes tab is null (perhaps when actions are done very quickly)
        pub.Detector().init(
            (resolve, reject) => {
                _queryActiveTab((tab) => {
                    if (tab) {
                        console.log(`tabs ${tab}`);
                        resolve(tab);
                    } else {
                        reject();
                    }
                });
            },
            cb,
            200,
            2
        );
	};

	return pub;
};
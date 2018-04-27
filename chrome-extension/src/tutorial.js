import riot from 'riot';
import route from 'riot-route/lib/tag';
require('./tags/tutorial.tag');
require('./tags/slide.tag');
require('./tags/pulsating-btn.tag');

riot.mount('tutorial');
riot.mount('slide');
riot.mount('pulsating-btn');

route.start(true);

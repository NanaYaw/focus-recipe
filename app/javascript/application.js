// Entry point for the build script in your package.json
import '@hotwired/turbo-rails';
import * as ActiveStorage from '@rails/activestorage';
ActiveStorage.start();
import './controllers';
import 'preline/dist/preline.js';

// import './controllers/horizontal_scroll';
import './controllers/draggable_carousel';

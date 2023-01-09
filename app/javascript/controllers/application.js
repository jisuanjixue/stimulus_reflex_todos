import { Application } from '@hotwired/stimulus';
import { definitions } from 'stimulus:./controllers';

const application = Application.start();

// Configure Stimulus development experience
application.warnings = true;
application.debug = false;
window.Stimulus = application;
application.load(definitions);

export { application };

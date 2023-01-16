// app/javascript/config/stimulus_reflex.js
import { application } from '../controllers/application';
import StimulusReflex from 'stimulus_reflex';
import controller from '../controllers/application_controller';
import consumer from '../channels/consumer';
import Radiolabel from 'radiolabel';

application.consumer = consumer;
application.register('radiolabel', Radiolabel);
StimulusReflex.debug = process.env.NODE_ENV === 'development';

window.reflexes = StimulusReflex.reflexes;

// Load and register StimulusReflex
StimulusReflex.initialize(application, { controller, isolate: true });

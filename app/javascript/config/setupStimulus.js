// app/javascript/config/stimulus_reflex.js
import { application } from '../controllers/application';
import StimulusReflex from 'stimulus_reflex';
import controller from '../controllers/application_controller';
import consumer from '../channels/consumer';

application.consumer = consumer;

// Load and register StimulusReflex
StimulusReflex.initialize(application, { controller, isolate: true });

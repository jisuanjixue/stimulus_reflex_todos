import './**/*_channel.js';
import * as Futurism from '@stimulus_reflex/futurism';
import consumer from '../channels/consumer';
// import './test_channel';
Futurism.initializeElements();
Futurism.createSubscription(consumer);

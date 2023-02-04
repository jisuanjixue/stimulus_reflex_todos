import consumer from './consumer';

consumer.subscriptions.create('TestChannel', {
  connected() {
    this.send({ message: 'Client is live' })
  },

  disconnected() {
    // Called when the subscription has been terminated by the server
  },

  received(data) {
    console.log(data)
  },
});

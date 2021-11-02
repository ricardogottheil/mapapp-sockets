const MarkerList = require('./marker-list');

class Sockets {
  constructor(io) {
    this.io = io;

    this.markers = new MarkerList();

    this.socketEvents();
  }

  socketEvents() {
    // On connection
    this.io.on('connection', (socket) => {
      socket.emit('active-markers', this.markers.actives);

      socket.on('new-marker', (marker) => {
        this.markers.addMarker(marker);
        socket.broadcast.emit('new-marker', marker);
      });

      socket.on('move-marker', (marker) => {
        this.markers.updateMarker(marker);
        socket.broadcast.emit('move-marker', marker);
      });
    });
  }
}

module.exports = Sockets;

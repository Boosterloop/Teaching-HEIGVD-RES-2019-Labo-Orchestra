/**
 * Node.js module to generate uuid
 */
const getUuid = require('uuid/v4');

/**
 * Node.js module to manipulate dates and times
 */
const moment = require('moment');

/*
 * Node.js module to work with UDP
 */
const dgram = require('dgram');

/*
 * Datagram socket
 */
const socket = dgram.createSocket('udp4');

function getSound(instrument) {
  let noise = '';
  switch (instrument) {
    case 'piano': noise = 'ti-ta-ti'; break;
    case 'trumpet': noise = 'pouet'; break;
    case 'flute': noise = 'trululu'; break;
    case 'violin': noise = 'gzi-gzi'; break;
    case 'drum': noise = 'boum-boum'; break;
    default: noise = 'Error'; break;
  }
  return noise;
}

function Musician(instrument) {
  this.instrument = instrument;
  this.uuid = getUuid();
  this.sound = getSound(this.instrument);

  Musician.prototype.update = () => {
    const musicianData = {
      uuid: this.uuid,
      instrument: this.instrument,
      sound: getSound(this.instrument),
      time: moment().format(),
    };

    const payload = JSON.stringify(musicianData);

    /*
     * Finally, let's encapsulate the payload in a UDP datagram, which we publish on
     * the multicast address. All subscribers to this address will receive the message.
     */
    const message = new Buffer(payload);
    socket.send(message, 0, message.length, 9907, '239.255.22.5', () => {
      console.log('Sending payload: ' + payload + ' via port ' + socket.address().port);
    });
  };

  /*
   * Send sound every second
   */
  setInterval(this.update.bind(this), 1000);
}

const instrument = process.argv[2];

/*
 * Create a musician
 */
const m = new Musician(instrument);

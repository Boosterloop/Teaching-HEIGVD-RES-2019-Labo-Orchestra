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

/**
 * Node.js module for tcp server
 */
const net = require('net');

socket.bind(9907, () => {
  console.log('Joining multicast group');
  socket.addMembership('239.255.22.5');
});

/**
 * Map to save active musicians
 */
const musicians = new Map();

/*
 * This call back is invoked when a new datagram has arrived.
 */
socket.on('message', (msg, source) => {
  console.log('Data has arrived: ' + msg + '. Source port: ' + source.port);
  const musician = JSON.parse(msg);

  if (musicians.has(musician.uuid)) {
    const musicianUpdate = musicians.get(musician.uuid);
    musicianUpdate.time = musician.time;
    musicians.set(musician.uuid, musicianUpdate);
  } else {
    musician.activeSince = musician.time;
    musicians.set(musician.uuid, musician);
  }
});

function updateMap(value, key) {
  const actualMoment = moment().format();
  if (moment(actualMoment).diff(value.time, 'seconds') > 5) {
    musicians.delete(key);
  }
}

function update() {
  musicians.forEach(updateMap);
}

setInterval(update, 5000);

const server = net.createServer();
server.listen(2205);
server.on('connection', (socketTcp) => {
  const payload = [];
  musicians.forEach((value, key) => {
    const item = {
      uuid: key,
      instrument: value.instrument,
      activeSince: value.activeSince,
    };
    payload.push(item);
  });

  socketTcp.write(JSON.stringify(payload));
  socketTcp.write('\r\n');
  socketTcp.end();
});

import dns from 'node:dns';

dns.setServers(['8.8.8.8']);

(async () => {
  try {
    const res = await dns.promises.resolveSrv('_mongodb._tcp.cluster0.fbfzepy.mongodb.net');
    console.log('SRV OK', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('SRV ERR', err);
    process.exit(1);
  }
})();

import WebSocket from 'ws';
import { getClusterData } from './services/services-map-ws';

export default function useWebsocketRouter() {
  const wss = new WebSocket.Server({
    port: 5013,
    perMessageDeflate: {
      zlibDeflateOptions: {
        // See zlib defaults.
        chunkSize: 1024,
        memLevel: 7,
        level: 3,
      },
      zlibInflateOptions: {
        chunkSize: 10 * 1024,
      },
      // Other options settable:
      clientNoContextTakeover: true, // Defaults to negotiated value.
      serverNoContextTakeover: true, // Defaults to negotiated value.
      serverMaxWindowBits: 10, // Defaults to negotiated value.
      // Below options specified as default values.
      concurrencyLimit: 10, // Limits zlib concurrency for perf.
      threshold: 1024, // Size (in bytes) below which messages
      // should not be compressed.
    },
  });

  wss.on('connection', function connection(ws) {
    ws.on('message', async function onIncomingMessage(message: string) {
      const payload = JSON.parse(message);
      console.log('payload:', payload);
      const data = await getClusterData(payload);
      ws.send(JSON.stringify(data));
    });
  });
}

import { Server } from "socket.io";

const SocketHandler = (req, res) => {
  const httpServer = res.socket.server;
  const { address, port } = httpServer.address();
  //const socketUrl = `http://${address}:${port}`;
  const socketUrl = `https://ludex-coinflip-6c86cdc76821.herokuapp.com:${port}`;
  const io = httpServer.io;

  if (req.body) {
    console.log("Webhook update received");
    io.emit("message", req.body);
    res.status(200).json("OK");
  } else if (io) {
    console.log("Socket is already running");
    res.json({ socketUrl });
  } else {
    console.log("Socket is initializing");
    const _io = new Server(httpServer);
    httpServer.io = _io;
    res.json({ socketUrl });
  }
};

export default SocketHandler;

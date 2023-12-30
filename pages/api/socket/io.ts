import { NextApiResponseServerIo } from "@/types";
import { NextApiRequest } from "next";
import { Server as NetServer } from "http";
import { Server as ServerIO } from "socket.io";

export const config = {
  api: {
    bodyParser: false,
  },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIo) => {
  if (!res.socket.server.io) {
    const path = "/api/socket/io";
    const httpServer: NetServer = res.socket.server as any;
    const io = new ServerIO(httpServer, {
      path: path,
      addTrailingSlash: false,
      cors: { origin: "*" },
    });
    console.log(io, "io");
    res.socket.server.io = io;

    io.on("error", (err: any) => {
      console.error("Socket.IO Error:", err);
    });
  } else {
    console.log("socket is already running");
  }

  res.end();
};

export default ioHandler;

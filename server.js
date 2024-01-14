import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join room", (room) => {
    socket.join(room);
    console.log(`Ein Spieler ist dem Raum ${room} beigetreten`);
  });
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server läuft auf http://localhost:` + (process.env.PORT || 3000));
});

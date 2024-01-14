import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { generateUsername } from "unique-username-generator";

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const generatedIds = new Set();
const roomPlayers = new Map();

io.on("connection", (socket) => {
  let currentRoomId = null;
  let currentUsername = null;

  socket.on("create room", () => {
    const roomId = generateRandomId();
    const username = generateUsername("", 0, 10);
    socket.join(roomId);
    roomPlayers.set(roomId, [{ id: socket.id, username }]);
    socket.emit("room created", roomId, roomPlayers.get(roomId), username);
    currentRoomId = roomId;
    currentUsername = username;
    console.log(`Ein Spieler hat den Raum ${roomId} erstellt`);
  });

  socket.on("join room", (roomId, callback) => {
    if (generatedIds.has(roomId)) {
      const username = generateUsername("", 0, 10);
      socket.join(roomId);
      const players = roomPlayers.get(roomId);
      players.push({ id: socket.id, username });
      roomPlayers.set(roomId, players);
      callback(undefined, players, username);
      socket.to(roomId).emit("new player", username);
      currentRoomId = roomId;
      currentUsername = username;
      console.log(`Ein Spieler ist dem Raum ${roomId} beigetreten`);
    } else {
      socket.emit("error", "Raum nicht gefunden.");
    }
  });

  socket.on("username changed", (newUsername) => {
    if (currentRoomId && currentUsername) {
      const players = roomPlayers.get(currentRoomId);
      const playerIndex = players.findIndex((player) => player.username === currentUsername);
      if (playerIndex !== -1) {
        players[playerIndex].username = newUsername;
        roomPlayers.set(currentRoomId, players);
        socket.to(currentRoomId).emit("username updated", currentUsername, newUsername);
        currentUsername = newUsername;
        socket.emit("username changed response", { error: undefined, newUsername });
        console.log(`Ein Spieler hat seinen Benutzernamen in Raum ${currentRoomId} geändert`);
      } else {
        socket.emit("username changed response", { error: "Spieler nicht gefunden." });
      }
    } else {
      socket.emit("username changed response", { error: "Sie sind in keinem Raum." });
    }
  });

  socket.on("disconnect", () => {
    if (currentRoomId && currentUsername) {
      const players = roomPlayers.get(currentRoomId);
      const newPlayers = players.filter((player) => player.username !== currentUsername);
      roomPlayers.set(currentRoomId, newPlayers);
      socket.to(currentRoomId).emit("player left", currentUsername);
      console.log(`Ein Spieler hat den Raum ${currentRoomId} verlassen`);
    }
  });

  socket.on("start game", () => {
    if (currentRoomId) {
      io.to(currentRoomId).emit("game started");
      console.log(`Das Spiel im Raum ${currentRoomId} wurde gestartet`);
    }
  });
});

function generateRandomId() {
  let id;
  do {
    id = Array.from({ length: 4 }, () => String.fromCharCode(Math.floor(Math.random() * 26) + 97)).join("");
  } while (generatedIds.has(id));
  generatedIds.add(id);
  return id;
}

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server läuft auf http://localhost:` + process.env.PORT || 3000);
});

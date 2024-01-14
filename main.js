import "./style.css";
import { Hand } from "pokersolver";
import { io } from "socket.io-client";

window.onload = function () {
  gameDiv.style.display = "none";
  lobbyDiv.style.display = "none";
};

let socketUrl = import.meta.env.URL || "http://localhost:3000";
console.log(socketUrl);

const socket = io(socketUrl);
const hostButton = document.getElementById("host-game");
const joinButton = document.getElementById("join-game");
const roomIdInput = document.getElementById("room-id");

hostButton.addEventListener("click", () => {
  socket.emit("create room");
});

let username;

joinButton.addEventListener("click", () => {
  const roomId = roomIdInput.value.toLowerCase();
  if (roomId) {
    socket.emit("join room", roomId, (error, players, myUsername) => {
      if (!error) {
        username = myUsername;
        loadLobby(players, roomId);
      }
    });
  } else {
    errorDiv.textContent = "Bitte gib eine Raum-ID ein.";
  }
});

const playersDiv = document.getElementById("players");
const gameDiv = document.getElementById("game");
const lobbyDiv = document.getElementById("lobby");
const startDiv = document.getElementById("home");
const roomIdDiv = document.getElementById("room-id-display");

socket.on("room created", (roomId, players, myUsername) => {
  username = myUsername;
  loadLobby(players, roomId);
});

socket.on("new player", (newPlayer) => {
  if (newPlayer !== username) {
    const li = document.createElement("li");
    li.textContent = newPlayer;
    playersDiv.appendChild(li);
  }
});

socket.on("player left", (username) => {
  Array.from(playersDiv.children).forEach((li) => {
    if (li.textContent === username) {
      playersDiv.removeChild(li);
    }
  });
});

function loadLobby(players, roomId) {
  startDiv.style.display = "none";
  lobbyDiv.style.display = "flex";
  gameDiv.style.display = "none";
  players = players.filter((player) => player.username !== username);
  playersDiv.innerHTML = "";
  players.forEach((player) => {
    const li = document.createElement("li");
    li.textContent = player.username;
    playersDiv.appendChild(li);
  });
  document.getElementById("username").value = username;
  roomIdDiv.textContent = roomId.toUpperCase();
}

socket.on("error", (errorMessage) => {
  errorDiv.textContent = errorMessage;
});

const errorDiv = document.getElementById("error");

document.getElementById("exit-room").addEventListener("click", () => {
  window.location.reload();
});

document.getElementById("username").addEventListener("input", (event) => {
  const newUsername = event.target.value;
  if (newUsername.length < 3) {
    errorDiv.textContent = "Der Benutzername muss mindestens 3 Zeichen lang sein.";
  } else {
    errorDiv.textContent = "";
    socket.emit("username changed", newUsername);
  }
});

socket.on("username updated", (oldUsername, newUsername) => {
  const players = Array.from(playersDiv.children);
  const playerLi = players.find((li) => li.textContent === oldUsername);
  if (playerLi) {
    playerLi.textContent = newUsername;
  }
});

socket.on("username changed response", (response) => {
  if (response.error) {
    errorDiv.textContent = response.error;
  } else {
    username = response.newUsername;
    document.getElementById("username").value = username;
    const players = Array.from(playersDiv.children);
    const playerLi = players.find((li) => li.textContent === username);
    if (playerLi) {
      playerLi.textContent = username;
    }
  }
});

/* ------------------------- */

const deck = []; // Your deck of cards
const players = []; // Array to store player hands

// Function to initialize the game
function initializeGame() {
  initializeDeck();

  // Deal cards to players
  // ...

  // Display player hands
  displayHands();

  // Determine winner
  //determineWinner();
}

function initializeDeck() {
  const suits = ["h", "d", "c", "s"]; // Herz, Karo, Kreuz, Pik
  const ranks = ["2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K", "A"]; // 2-10, Bube, Dame, König, Ass

  for (let suit of suits) {
    for (let rank of ranks) {
      deck.push(rank + suit);
    }
  }
}

// Function to display player hands
function displayHands() {
  // Display player hands in the #game-container
  // ...
}

// Function to determine the winner
function determineWinner() {
  const hands = players.map((player) => Hand.solve(player));
  const winners = Hand.winners(hands);

  console.log(winners[0].descr);
}

// Call the initializeGame function to start the game
initializeGame();

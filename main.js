import "./style.css";
import { Hand } from "pokersolver";
import { io } from "socket.io-client";

window.onload = function () {
  document.getElementById('loading-spinner').style.display = 'none';
  gameDiv.style.display = "none";
  lobbyDiv.style.display = "none";
};

let socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:3030";

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

document.getElementById("exit-room2").addEventListener("click", () => {
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

let playersArr = [];

checkPlayers();

async function checkPlayers() {
  playersArr = Array.from(playersDiv.children);
  const playButton = document.getElementById("play");
  const playLabel = document.getElementById("playLabel");

  if (playersArr.length < 1) {
    playButton.disabled = true;
    playLabel.textContent = "Warte auf Spieler...";
  } else {
    playButton.disabled = false;
    playLabel.textContent = "";
  }
}

const observer = new MutationObserver(checkPlayers);
observer.observe(playersDiv, { childList: true });

let gameStarted = false;

function startGame() {
  if (!gameStarted) {
    startDiv.style.display = "none";
    lobbyDiv.style.display = "none";
    gameDiv.style.display = "flex";
    const playersList = document.getElementById("playersList");

    playersArr.forEach((player) => {
      const li = document.createElement("li");
      li.textContent = player.textContent;
      playersList.appendChild(li);
    });

    const li = document.createElement("li");
    li.textContent = username;
    playersList.appendChild(li);

    socket.emit("start game");

    initializeGame();

    gameStarted = true;
  }
}

document.getElementById("play").addEventListener("click", startGame);

socket.on("game started", () => {
  if (!gameStarted) {
    startGame();
  }
});
/* ------------------------- */

const deck = []; // Your deck of cards
const players = []; // Array to store player hands

function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

// Funktion zum Austeilen der Karten an die Spieler
function dealCards() {
  for (let i = 0; i < 5; i++) {
    for (let player of players) {
      const card = deck.pop();
      player.push(card);
    }
  }
}

// Funktion zum Anzeigen der Spielerhände
function displayHands() {
  console.log("Community Cards: " + communityCards.join(", "));
  for (let i = 0; i < players.length; i++) {
    console.log(`Spieler ${i + 1}: ${players[i].hand.join(", ")}`);
  }
}
const communityCards = [];

function dealCommunityCards() {
  for (let i = 0; i < 5; i++) {
    const card = deck.pop();
    communityCards.push(card);
  }
}

function placeBet(playerIndex, amount) {
  // Implement logic to deduct the bet amount from the player's stack
  players[playerIndex].stack -= amount;
  // Implement logic to keep track of the total pot
  // For simplicity, you can add a global variable like 'totalPot' and update it accordingly
  totalPot += amount;
}

// Funktion zum Bestimmen des Gewinners
function determineWinner() {
  const solvedHands = players.map((playerHand, index) => {
    const hand = Hand.solve(playerHand.map((card) => card.toString()));
    hand.playerIndex = index; // Store the player index in the hand object for later reference
    return hand;
  });

  const winners = Hand.winners(solvedHands);

  for (const winner of winners) {
    console.log(`Spieler ${winner.playerIndex + 1} gewinnt mit der Hand: ${players[winner.playerIndex].join(", ")}`);
  }
}

// Funktion zum Initialisieren des Spiels
function initializeGame() {
  /* initializeDeck(); */
  shuffleDeck();
  dealCards();
  displayHands();
  determineWinner();
}

// Initialisieren Sie das Spiel
initializeGame();

import "./style.css";
import { Hand } from "pokersolver";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

const urlParams = new URLSearchParams(window.location.search);
const room = urlParams.get("=");
socket.emit("join room", room);

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
  determineWinner();
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

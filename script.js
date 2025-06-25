const messages = [
  "Happy birthday, Denise!!",
  "You’re an amazing person!!",
  "Hope your day is amazing 🎂✨"
];

const textElement = document.getElementById("typed-text");
const typingSpeed = 100;
const eraseSpeed = 60;
const delayBetween = 1500;
let messageIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeLoop() {
  const currentMessage = messages[messageIndex];

  if (!isDeleting) {
    textElement.textContent = currentMessage.substring(0, charIndex + 1);
    charIndex++;

    if (charIndex === currentMessage.length) {
      isDeleting = true;
      setTimeout(typeLoop, delayBetween);
    } else {
      setTimeout(typeLoop, typingSpeed);
    }
  } else {
    textElement.textContent = currentMessage.substring(0, charIndex - 1);
    charIndex--;

    if (charIndex === 0) {
      isDeleting = false;
      messageIndex = (messageIndex + 1) % messages.length;
      setTimeout(typeLoop, typingSpeed);
    } else {
      setTimeout(typeLoop, eraseSpeed);
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  typeLoop();

  document.getElementById("reveal-btn").addEventListener("click", function () {
    document.getElementById("surprise").classList.remove("hidden");

    confetti({
      particleCount: 200,
      spread: 70,
      origin: { y: 0.6 },
    });
  });
});

const CELL = {
  WALL: "#",
  PATH: " ",
  GOAL: "G"
};

const MAZE_WIDTH = 15;
const MAZE_HEIGHT = 15;

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function generateMaze(width, height) {
  const maze = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => CELL.WALL)
  );

  function carve(x, y) {
    const directions = shuffle([
      [0, -2], [0, 2], [-2, 0], [2, 0]
    ]);

    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;

      if (
        ny > 0 && ny < height - 1 &&
        nx > 0 && nx < width - 1 &&
        maze[ny][nx] === CELL.WALL
      ) {
        maze[ny - dy / 2][nx - dx / 2] = CELL.PATH;
        maze[ny][nx] = CELL.PATH;
        carve(nx, ny);
      }
    }
  }

  maze[1][1] = CELL.PATH;
  carve(1, 1);
  maze[height - 2][width - 2] = CELL.GOAL;

  return maze.map(row => row.join(""));
}

function initMazeGame() {
  const maze = generateMaze(MAZE_WIDTH, MAZE_HEIGHT);

  const mazeEl = document.getElementById("maze");
  const winMessage = document.getElementById("winMessage");
  let playerPos = { x: 1, y: 1 };
  let gameOver = false;

  function drawMaze() {
    mazeEl.innerHTML = "";
    for (let y = 0; y < MAZE_HEIGHT; y++) {
      for (let x = 0; x < MAZE_WIDTH; x++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");

        const char = maze[y][x];
        if (char === "#") cell.classList.add("wall");
        else if (char === "G") cell.classList.add("goal");

        if (x === playerPos.x && y === playerPos.y) {
          cell.classList.add("player");
        }

        mazeEl.appendChild(cell);
      }
    }
  }

  function move(dx, dy) {
  if (gameOver) return;

  const newX = playerPos.x + dx;
  const newY = playerPos.y + dy;
  if (newX < 0 || newY < 0 || newX >= MAZE_WIDTH || newY >= MAZE_HEIGHT) return;

  const char = maze[newY][newX];
  if (char === " " || char === "G") {
    playerPos = { x: newX, y: newY };
    drawMaze();
   if (char === "G") {
  winMessage.style.display = "block";
  gameOver = true;
  setTimeout(() => {
    if (window.parent) {
      window.parent.postMessage({ action: "closeGame" }, "*");
    }
    window.location.href = "index.html";
  }, 3000);
}
  }
}

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") move(0, -1);
    else if (e.key === "ArrowDown") move(0, 1);
    else if (e.key === "ArrowLeft") move(-1, 0);
    else if (e.key === "ArrowRight") move(1, 0);
  });

  let touchStartX = 0;
  let touchStartY = 0;

  document.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  });

  document.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 20) move(1, 0);
      else if (dx < -20) move(-1, 0);
    } else {
      if (dy > 20) move(0, 1);
      else if (dy < -20) move(0, -1);
    }
  });

  drawMaze();
}

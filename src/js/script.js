import { palavras } from "./palavras.js";

class BaseCosmicGame {
  #numRows;
  #numCols;
  #domGrid;
  #secretWord;
  #currentRow = 0;
  #currentCol = 0;
  #stateGrid;

  constructor(numRows, numCols) {
    this.#numRows = numRows;
    this.#numCols = numCols;
    this.palavras = palavras;
  }

  createHTMLElement(tag, classNames = [], content = "", children = [], src = "") {
    const element = document.createElement(tag);
    element.className = classNames.join(" ");
    if (tag.toLowerCase() === "img" && src) {
      element.src = src;
    } else {
      element.textContent = content;
    }
    for (const child of children) {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    }
    return element;
  }

  drawBox(container, row, col, letter = "") {
    const box = this.createHTMLElement("div", [
      "w-14",
      "h-14",
      "border-2",
      "rounded",
      "rounded-10",
      "border-zinc-900",
      "text-gray-800",
      "dark:text-white",
      "uppercase",
      "grid",
      "place-items-center",
      "text-4xl",
      "cursor-pointer",
      "transition-transform",
    ]);
    box.id = `box${row}${col}`;
    box.textContent = letter;
    container.appendChild(box);
    return box;
  }

  drawGrid(container) {
    this.#domGrid = this.createHTMLElement("div", [
      "grid",
      `grid-cols-${this.#numCols}`,
      `grid-rows-${this.#numRows}`,
      "p-2",
      "gap-1",
    ]);
    for (let rows = 0; rows < this.#numRows; rows++) {
      for (let cols = 0; cols < this.#numCols; cols++) {
        this.drawBox(this.#domGrid, rows, cols);
      }
    }
    container.appendChild(this.#domGrid);
  }

  showGridBox() {
    const game = document.getElementById("game");
    if (game) {
      game.classList.add("flex", "justify-center", "my-2");
      this.drawGrid(game);
    } else {
      console.error("Elemento HTML 'game' não encontrado.");
    }
  }

  clearGrid() {
    const gameContainer = document.getElementById("game");
    if (gameContainer) {
      while (gameContainer.firstChild) {
        gameContainer.removeChild(gameContainer.firstChild);
      }
    }
  }

  initializeStateGrid() {
    return Array.from({ length: this.#numRows }, () => Array(this.#numCols).fill(""));
  }

  updateStateGridBox() {
    if (Object.getPrototypeOf(this) !== BaseCosmicGame.prototype) {
      for (let row = 0; row < this.#stateGrid.length; row++) {
        for (let col = 0; col < this.#stateGrid[row].length; col++) {
          const box = document.getElementById(`box${row}${col}`);
          box.textContent = this.#stateGrid[row][col];
        }
      }
    }
  }

  getRandomWord() {
    const palavrasKeys = Object.keys(this.palavras);
    const randomKey = palavrasKeys[Math.floor(Math.random() * palavrasKeys.length)];
    return randomKey;
  }

  getSecretWord() {
    return this.#secretWord;
  }

  handleInputEvent = (event) => {
    if (this.isGameCompleted()) {
      return;
    }
    let key, source;
    if (event.target && event.target.classList.contains("letter-button")) {
      source = "button";
      key = event.target.dataset.key;
    } else {
      source = "keyboard";
      key = event.key;
    }
    if (key === "Enter") {
      this.processEnterKey();
    } else if (key === "Backspace") {
      this.removeLetter();
    } else if (this.isLetter(key)) {
      this.addLetter(key);
    }
    this.updateStateGridBox();
  };

  registerInputEvents() {
    document.body.addEventListener("keydown", this.handleInputEvent);
    const letterButtons = document.querySelectorAll(".letter-button");
    letterButtons.forEach((button) => {
      button.addEventListener("click", this.handleInputEvent);
    });
  }

  removeInputEvents() {
    document.body.removeEventListener("keydown", this.handleInputEvent);
    const letterButtons = document.querySelectorAll(".letter-button");
    letterButtons.forEach((button) => {
      button.removeEventListener("click", this.handleInputEvent);
    });
  }

  isLetter(key) {
    return key.length === 1 && key.match(/[a-z]/i);
  }

  addLetter(letter) {
    if (this.#currentCol === this.#numCols) return;
    this.#stateGrid[this.#currentRow][this.#currentCol] = letter;
    this.#currentCol++;
  }

  removeLetter() {
    if (this.#currentCol === 0) return;
    this.#stateGrid[this.#currentRow][this.#currentCol - 1] = "";
    this.#currentCol--;
  }

  isGameCompleted() {
    return this.#currentRow === this.#numRows;
  }

  getUserCurrentWord() {
    return this.#stateGrid[this.#currentRow].join("");
  }

  handleInvalidWord() {
    for (let col = 0; col < this.#numCols; col++) {
      const box = document.getElementById(`box${this.#currentRow}${col}`);
      if (box) {
        box.classList.add("shake-animation");
        setTimeout(() => {
          box.classList.remove("shake-animation");
        }, 500);
      }
    }
    this.showAlert("Minha busca por essa palavra está perdida nas vastidões do espaço.", "yellow");
  }

  isWordValid(word) {
    const palavra = this.palavras[word];
    return palavra !== undefined;
  }

  processEnterKey() {
    if (this.#currentCol === this.#numCols) {
      const guessedWord = this.getUserCurrentWord();
      if (this.isWordValid(guessedWord)) {
        const palavra = this.palavras[guessedWord];
        this.#stateGrid[this.#currentRow] = palavra !== null ? palavra.split("") : guessedWord.split("");
        this.revealWord(guessedWord);
        this.#currentRow++;
        this.#currentCol = 0;
      } else {
        this.handleInvalidWord();
      }
    }
  }

  revealWord(guess) {
    const row = this.#currentRow;
    const animationDuration = 500;
    for (let col = 0; col < this.#numCols; col++) {
      const box = document.getElementById(`box${row}${col}`);
      const letter = box.textContent;
      const button = document.querySelector(`.letter-button[data-key="${letter}`);
      if (button) {
        button.classList.remove("bg-gray-100", "dark:bg-gray-600", "text-gray-800", "dark:text-gray-100");
        setTimeout(() => {
          const isCorrect = letter.toLowerCase() === this.#secretWord[col].toLowerCase();
          const isContained = this.#secretWord.toLowerCase().includes(letter.toLowerCase());
          if (isCorrect) {
            box.classList.add("bg-[#3aa394]", "text-white");
            button.classList.add("bg-[#3aa394]", "text-white", "dark:text-white");
          } else if (isContained) {
            box.classList.add("bg-[#d3ad69]", "text-white");
            button.classList.add("bg-[#d3ad69]", "text-white", "dark:text-white");
          } else {
            box.classList.add("bg-[#312a2c]", "text-white");
            button.classList.add("bg-[#312a2c]", "text-white", "dark:text-white");
          }
        }, ((col + 1) * animationDuration) / 2);
      }
      box.classList.add("flip-animation");
      box.style.animationDelay = `${(col * animationDuration) / 2}ms`;
    }

    const isWinner = this.#secretWord === guess;
    const isGameOver = this.#currentRow === this.#numRows - 1;

    setTimeout(() => {
      if (isWinner) {
        this.showAlert("Parabéns! Você desvendou o mistério cósmico!", "green", true);
        this.pauseCountdownAndProgressBar();
      } else if (isGameOver) {
        const gameOverMessage = `Infelizmente, a galáxia está perdida. A palavra era <strong>${this.#secretWord.toUpperCase()}</strong>. Melhor sorte na próxima missão!`;
        this.showAlert(gameOverMessage, "red", true);
        this.pauseCountdownAndProgressBar();
      }
    }, 3 * animationDuration);
  }

  resetLetterButtons() {
    const letterButtons = document.querySelectorAll(".letter-button");
    letterButtons.forEach((button) => {
      button.classList.remove("bg-[#3aa394]", "bg-[#d3ad69]", "bg-[#312a2c]", "text-white", "dark:text-white");
      button.classList.add("bg-gray-100", "dark:bg-gray-600", "text-gray-800", "dark:text-gray-100");
    });
  }

  showAlert(message, color, showCloseButton = false) {
    const alertContainer = document.getElementById("alert-container");
    if (!alertContainer) {
      console.error("Elemento HTML 'alert-container' não encontrado.");
      return;
    }

    alertContainer.innerHTML = "";

    const alertElement = this.createHTMLElement("div", [
      "flex",
      "items-center",
      "justify-center",
      "p-4",
      "mb-4",
      `text-${color}-800`,
      `border-t-4`,
      `border-${color}-300`,
      `bg-${color}-50`,
      `dark:text-${color}-300`,
      "dark:bg-gray-800",
      `dark:border-${color}-800`,
    ]);

    alertElement.innerHTML = `
      <svg class="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
      </svg>
      <div class="ms-3 text-sm font-medium">
        ${message}
      </div>
    `;

    alertContainer.appendChild(alertElement);

    if (showCloseButton) {
      const closeButton = this.createHTMLElement("button", [
        "ms-auto",
        "-mx-1.5",
        "-my-1.5",
        `bg-${color}-50`,
        "rounded-lg",
        "focus:ring-2",
        `focus:ring-${color}-400`,
        "p-1.5",
        `hover:bg-${color}-200`,
        "inline-flex",
        "items-center",
        "justify-center",
        "h-8",
        "w-8",
        "dark:bg-gray-800",
        `dark:text-${color}-300`,
        "dark:hover:bg-gray-700",
      ]);
      closeButton.innerHTML = `
        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
      `;
      closeButton.addEventListener("click", () => {
        this.closeAlert();
        this.resetAndStartGame();
      });

      alertElement.appendChild(closeButton);
    }

    if (color === "yellow") {
      setTimeout(() => {
        this.closeAlert();
      }, 3000);
    }
  }

  closeAlert() {
    const alertContainer = document.getElementById("alert-container");
    if (alertContainer) {
      const alertElement = alertContainer.firstChild;
      if (alertElement) {
        alertContainer.removeChild(alertElement);
      }
    }
  }

  startGame() {
    this.#currentCol = 0;
    this.#currentRow = 0;
    this.#stateGrid = this.initializeStateGrid();
    this.showGridBox();
    this.#secretWord = this.getRandomWord();
    this.registerInputEvents();
    if (this instanceof CosmicRace || this instanceof CosmicCountDown) {
      this.setupCountdownAndProgressBarDOM();
    }
  }

  resetGame() {
    this.closeAlert();
    this.clearGrid();
    this.resetLetterButtons();
    this.removeInputEvents();
    if (this instanceof CosmicRace) {
      this.resetCountdownAndProgressBar();
      this.startCountdownAndProgressBar(3, 0);
    }
    if (this instanceof CosmicCountDown) {
      this.resetCountdownAndProgressBar();
      this.startCountdownAndProgressBar(10, 0);
    }
  }

  resetAndStartGame() {
    this.resetGame();
    this.startGame();
  }
}

class CosmicQuest extends BaseCosmicGame {
  constructor(numRows, numCols) {
    super(numRows, numCols);
  }
}

class CosmicRace extends BaseCosmicGame {
  constructor(numRows, numCols) {
    super(numRows, numCols);
    this.startCountdownAndProgressBar(5, 0);
  }

  setupCountdownAndProgressBarDOM() {
    this.countdownContainer = document.getElementById("countdown-container");
    this.progressBarContainer = document.getElementById("progressBar-container");

    // Cria elementos dos minutos para o countdown
    this.countdownDivMinutes = this.createHTMLElement("div");
    this.minutesSpan = this.createHTMLElement("span", ["countdown", "font-mono", "text-4xl"]);
    this.minutesSpanSpan = this.createHTMLElement("span");
    this.countdownDivMinutes.appendChild(this.minutesSpan);
    this.minutesSpan.appendChild(this.minutesSpanSpan);
    this.countdownDivMinutes.appendChild(document.createTextNode(" min "));
    this.countdownContainer.appendChild(this.countdownDivMinutes);

    // Cria elementos dos segundos para o countdown
    this.countdownDivSeconds = this.createHTMLElement("div");
    this.secondsSpan = this.createHTMLElement("span", ["countdown", "font-mono", "text-4xl"]);
    this.secondsSpanSpan = this.createHTMLElement("span");
    this.countdownDivSeconds.appendChild(this.secondsSpan);
    this.secondsSpan.appendChild(this.secondsSpanSpan);
    this.countdownDivSeconds.appendChild(document.createTextNode(" sec "));
    this.countdownContainer.appendChild(this.countdownDivSeconds);

    // Cria elementos da barra de progresso
    this.progressBar = this.createHTMLElement("div", [
      "w-full",
      "bg-gray-200",
      "rounded-full",
      "h-2.5",
      "mb-4",
      "dark:bg-gray-700",
      "relative",
    ]);
    this.progressBarFill = this.createHTMLElement("div", ["bg-[#FFEB64]", "h-2.5", "rounded-full", "transition-all"]);
    this.asteroidProgressBarFill = this.createHTMLElement(
      "img",
      [
        "z-20",
        "absolute",
        "-translate-x-[110%]",
        "-translate-y-[1.45rem]",
        "left-0",
        "-rotate-45",
        "w-9",
        "h-9",
        "transition-all",
      ],
      "src",
      [],
      "./img/icon-asteroid-race.svg"
    );
    this.earthProgressBarFill = this.createHTMLElement(
      "img",
      ["z-10", "absolute", "-translate-y-3", "right-0", "w-3.5", "h-3.5"],
      "src",
      [],
      "./img/icon-earth-default.svg"
    );
    this.progressBar.appendChild(this.progressBarFill);
    this.progressBar.appendChild(this.asteroidProgressBarFill);
    this.progressBar.appendChild(this.earthProgressBarFill);
    this.progressBarContainer.appendChild(this.progressBar);
  }

  updateCountdownAndProgressBar() {
    const totalTimeInSeconds = this.totalTime;
    const elapsedSeconds = totalTimeInSeconds - this.remainingTime;

    // Atualiza elementos do countdown
    const minutes = Math.floor(this.remainingTime / 60);
    const seconds = this.remainingTime % 60;
    this.minutesSpanSpan.textContent = minutes;
    this.secondsSpanSpan.textContent = seconds;
    this.minutesSpanSpan.style.setProperty("--value", minutes);
    this.secondsSpanSpan.style.setProperty("--value", seconds);

    // Atualiza elementos da barra de progresso
    const percentage = (elapsedSeconds / totalTimeInSeconds) * 100;
    this.progressBarFill.style.width = `${percentage}%`;
    this.asteroidProgressBarFill.style.left = `${percentage}%`;
  }

  startCountdownAndProgressBar(minutes, seconds) {
    this.remainingTime = minutes * 60 + seconds;
    this.totalTime = minutes * 60 + seconds;

    this.interval = setInterval(() => {
      if (this.remainingTime > 0) {
        this.remainingTime--;
        this.updateCountdownAndProgressBar();
      } else {
        this.pauseCountdownAndProgressBar();
        const gameOverMessage = `O tempo se esgotou! A galáxia está perdida. A palavra era <strong>${this.getSecretWord().toUpperCase()}</strong>.`;
        this.showAlert(gameOverMessage, "red", true);
      }
      if (this.isGameCompleted()) {
        this.pauseCountdownAndProgressBar();
        const gameOverMessage = `Infelizmente, a galáxia está perdida. A palavra era <strong>${this.getSecretWord().toUpperCase()}</strong>. Melhor sorte na próxima missão!`;
        this.showAlert(gameOverMessage, "red", true);
      }
    }, 1000);
    return this.interval;
  }

  pauseCountdownAndProgressBar() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  resetCountdownAndProgressBar() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    const countdownContainer = document.getElementById("countdown-container");
    const progressBarContainer = document.getElementById("progressBar-container");

    if (countdownContainer) {
      while (countdownContainer.firstChild) {
        countdownContainer.removeChild(countdownContainer.firstChild);
      }
    }
    if (progressBarContainer) {
      while (progressBarContainer.firstChild) {
        progressBarContainer.removeChild(progressBarContainer.firstChild);
      }
    }
  }
}

class CosmicCountDown extends BaseCosmicGame {
  constructor(numRows, numCols) {
    super(numRows, numCols);
    this.cosmicRaceInstance = new CosmicRace(numRows, numCols);
    this.startCountdownAndProgressBar(3, 0);
  }

  setupCountdownAndProgressBarDOM() {
    this.cosmicRaceInstance.setupCountdownAndProgressBarDOM();
  }

  updateCountdownAndProgressBar() {
    this.cosmicRaceInstance.updateCountdownAndProgressBar();
  }

  startCountdownAndProgressBar(minutes, seconds) {
    this.cosmicRaceInstance.startCountdownAndProgressBar(minutes, seconds);
  }

  pauseCountdownAndProgressBar() {
    if (this.cosmicRaceInstance.interval) {
      clearInterval(this.cosmicRaceInstance.interval);
    }
  }

  resetCountdownAndProgressBar() {
    this.cosmicRaceInstance.resetCountdownAndProgressBar();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  let currentCosmicGameInstance = null;

  const resetAndStartNewGame = (gameInstance) => {
    if (currentCosmicGameInstance) {
      currentCosmicGameInstance.resetGame();
    }
    currentCosmicGameInstance = gameInstance;
    if (currentCosmicGameInstance) {
      currentCosmicGameInstance.startGame();
      updateTitle(currentCosmicGameInstance.constructor.name);
      toggleButton();
    }
  };

  const initializeCosmicQuest = () => {
    resetAndStartNewGame(new CosmicQuest(6, 5));
  };

  const initializeCosmicRace = () => {
    resetAndStartNewGame(new CosmicRace(7, 5));
  };

  const initializeCosmicCountDown = () => {
    resetAndStartNewGame(new CosmicCountDown(10, 5));
  };

  const cosmicQuest = document.getElementById("cosmicQuest");
  const cosmicRace = document.getElementById("cosmicRace");
  const cosmicCountDown = document.getElementById("cosmicCountDown");

  cosmicQuest.addEventListener("click", (event) => {
    event.preventDefault();
    initializeCosmicQuest();
  });

  cosmicRace.addEventListener("click", (event) => {
    event.preventDefault();
    initializeCosmicRace();
  });

  cosmicCountDown.addEventListener("click", (event) => {
    event.preventDefault();
    initializeCosmicCountDown();
  });

  const toggleButton = () => {
    const toggleButton = document.querySelector("[data-dropdown-toggle='dropdown-menu']");
    if (toggleButton) {
      toggleButton.click();
    }
  };

  function updateTitle(modeName) {
    const titleSpan = document.getElementById("title");
    if (titleSpan) {
      titleSpan.textContent = modeName;
    }
  }
  initializeCosmicQuest();
});


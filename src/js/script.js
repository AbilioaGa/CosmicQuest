import { dictionary } from "./dicio.js";

class CosmicGame {
  #numRows;
  #numCols;
  #secretWord;
  #grid;
  #currentRow;
  #currentCol;
  #gridContainer;
  #gridElement;
  #timeRemaining;

  constructor(numRows, numCols) {
    this.#numRows = numRows;
    this.#numCols = numCols;
    this.#secretWord = this.getRandomWord();
    this.#grid = this.initializeGrid();
    this.#currentRow = 0;
    this.#currentCol = 0;
    this.showGridBox();
    this.handleInputEvent = this.handleInputEvent.bind(this);
    this.registerInputEvents();
  }

  getRandomWord() {
    if (dictionary.length === 0) {
      console.error("Dicionário está vazio. Adicione palavras ao dicionário.");
      return "";
    }
    return dictionary[Math.floor(Math.random() * dictionary.length)];
  }

  getSecretWord() {
    return this.#secretWord;
  }

  initializeGrid() {
    return Array.from({ length: this.#numRows }, () => Array(this.#numCols).fill(""));
  }

  createHTMLElement(tag, classNames = [], content = "", children = []) {
    const element = document.createElement(tag);
    element.className = classNames.join(" ");
    element.textContent = content;

    for (const child of children) {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    }

    return element;
  }

  drawBox(row, col, letter = "") {
    const box = this.createHTMLElement("div", [
      "w-14",
      "h-14",
      "border-2",
      "rounded",
      "rounded-10",
      "border-zinc-900",
      "dark:text-white",
      "uppercase",
      "grid",
      "place-items-center",
      "text-4xl",
      "cursor-pointer",
      "transition-transform",
    ]);

    box.textContent = letter;

    box.id = `box${row}${col}`;

    this.#gridElement.appendChild(box);
  }

  drawGrid() {
    this.#gridElement = this.createHTMLElement("div", [
      "grid",
      `grid-cols-${this.#numCols}`,
      `grid-rows-${this.#numRows}`,
      "p-2",
      "gap-1",
    ]);

    for (let rows = 0; rows < this.#numRows; rows++) {
      for (let cols = 0; cols < this.#numCols; cols++) {
        this.drawBox(rows, cols);
      }
    }

    this.#gridContainer.appendChild(this.#gridElement);
  }

  showGridBox() {
    const gameContainer = document.getElementById("game");

    if (!gameContainer) {
      console.error("Elemento HTML 'game' não encontrado.");
      return;
    }

    this.#gridContainer = this.createHTMLElement("div", ["flex", "justify-center", "my-2"]);
    gameContainer.appendChild(this.#gridContainer);

    this.drawGrid();
  }

  updateGridBox() {
    for (let row = 0; row < this.#grid.length; row++) {
      for (let col = 0; col < this.#grid[row].length; col++) {
        const box = document.getElementById(`box${row}${col}`);
        if (box) {
          box.textContent = this.#grid[row][col];
        }
      }
    }
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

    this.updateGridBox();
  };

  isGameCompleted() {
    return this.#currentRow === this.#numRows;
  }

  registerInputEvents() {
    this.removeInputEvents();
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

  getUserCurrentWord() {
    return this.#grid[this.#currentRow].join("");
  }

  processEnterKey() {
    if (this.#currentCol === this.#numCols) {
      const guessedWord = this.getUserCurrentWord().toLowerCase();

      if (this.isWordValid(guessedWord)) {
        this.revealWord(guessedWord);
        this.#currentRow++;
        this.#currentCol = 0;
      } else {
        this.handleInvalidWord();
      }
    }
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

  removeAccents(word) {
    return word
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/gi, "");
  }

  isWordValid(word) {
    const wordWithoutAccents = this.removeAccents(word.toLowerCase());
    return dictionary.some((entry) => this.removeAccents(entry.toLowerCase()) === wordWithoutAccents);
  }

  revealWord(guess) {
    const row = this.#currentRow;
    const animationDuration = 500;

    for (let i = 0; i < this.#numCols; i++) {
      const box = document.getElementById(`box${row}${i}`);
      const letter = box.textContent;

      const button = document.querySelector(`.letter-button[data-key="${letter.toLowerCase()}"]`);

      if (button) {
        button.classList.remove("bg-gray-100", "dark:bg-gray-600", "text-gray-800", "dark:text-gray-100");

        setTimeout(() => {
          if (letter === this.#secretWord[i]) {
            box.classList.add("bg-[#3aa394]", "text-white");
            button.classList.add("bg-[#3aa394]", "text-white", "dark:text-white");
          } else if (this.#secretWord.includes(letter)) {
            box.classList.add("bg-[#d3ad69]", "text-white");
            button.classList.add("bg-[#d3ad69]", "text-white", "dark:text-white");
          } else {
            box.classList.add("bg-[#312a2c]", "text-white");
            button.classList.add("bg-[#312a2c]", "text-white", "dark:text-white");
          }
        }, ((i + 1) * animationDuration) / 2);
      }
      box.classList.add("flip-animation");
      box.style.animationDelay = `${(i * animationDuration) / 2}ms`;
    }

    const isWinner = this.#secretWord.toLowerCase() === guess.toLowerCase();
    const isGameOver = this.#currentRow === this.#numRows - 1;

    setTimeout(() => {
      if (isWinner) {
        this.showAlert("Parabéns! Você desvendou o mistério cósmico!", "green", true);
      } else if (isGameOver) {
        const gameOverMessage = `Infelizmente, a galáxia está perdida. A palavra era <strong>${this.#secretWord.toUpperCase()}</strong>. Melhor sorte na próxima missão!`;
        this.showAlert(gameOverMessage, "red", true);
      }
    }, 3 * animationDuration);
  }

  isLetter(key) {
    return key.length === 1 && key.match(/[a-z]/i);
  }

  addLetter(letter) {
    if (this.#currentCol === this.#numCols) return;
    this.#grid[this.#currentRow][this.#currentCol] = letter;
    this.#currentCol++;
  }

  removeLetter() {
    if (this.#currentCol === 0) return;
    this.#grid[this.#currentRow][this.#currentCol - 1] = "";
    this.#currentCol--;
  }

  showAlert(message, color, showCloseButton = false) {
    const alertContainer = document.getElementById("alert-container");
    if (!alertContainer) {
      console.error("Elemento HTML 'alert-container' não encontrado.");
      return;
    }

    // Remove alertas anteriores
    alertContainer.innerHTML = "";

    // Cria o elemento de alerta
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

    // Adiciona ícone ao alerta
    alertElement.innerHTML = `
      <svg class="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
      </svg>
      <div class="ms-3 text-sm font-medium">
        ${message}
      </div>
    `;

    // Adiciona o alerta ao contêiner
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
        this.resetGame();
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

  resetGridBox() {
    const gameContainer = document.getElementById("game");

    if (gameContainer) {
      while (gameContainer.firstChild) {
        gameContainer.removeChild(gameContainer.firstChild);
      }
    }
  }

  countdown(enableCountdown = false) {
    const countdownContainer = document.getElementById("countdown-container");

    // Verifica se o container foi encontrado
    if (!countdownContainer) {
      console.error("Elemento HTML 'countdown-container' não encontrado.");
      return;
    }

    // Limpa o conteúdo anterior, se houver
    countdownContainer.innerHTML = "";

    if (enableCountdown) {
      // Cria os elementos de countdown min e sec
      const minutesElement = this.createHTMLElement("div");
      minutesElement.innerHTML = `
        <span class="min font-mono text-2xl">
          <span></span>
        </span>
        min
      `;
      const secondsElement = this.createHTMLElement("div");
      secondsElement.innerHTML = `
        <span class="sec font-mono text-2xl">
          <span></span>
        </span>
        sec
      `;

      countdownContainer.appendChild(minutesElement);
      countdownContainer.appendChild(secondsElement);

      // Inicializa o tempo restante
      this.#timeRemaining = this.constructor.INITIAL_TIME_MILLISECONDS;

      return;
    }

    // Se não for um novo countdown, definimos o tempo restante como 0
    this.#timeRemaining = 0;
  }

  updateCountdown(timeRemaining) {
    const minutes = Math.floor(timeRemaining / 60000);
    const seconds = Math.floor((timeRemaining % 60000) / 1000);

    const countdownElement = document.getElementById("countdown-container");
    if (countdownElement) {
      const minElement = countdownElement.querySelector(".min");
      const secElement = countdownElement.querySelector(".sec");
      if (minElement && secElement) {
        minElement.textContent = `${minutes}`;
        secElement.textContent = `${seconds}`;
      }
    }
  }

  progressBar(totalTime, timeRemaining, enableProgressBar = false) {
    if (enableProgressBar) {
      const progressBarContainer = document.getElementById("progressBar-container");

      if (!progressBarContainer) {
        console.error("Elemento HTML 'progressBar-container' não encontrado.");
        return;
      }

      progressBarContainer.innerHTML = "";

      const progressElement = this.createHTMLElement(
        "div",
        [
          "bg-red-600",
          "text-xs",
          "font-medium",
          "text-red-100",
          "text-center",
          "p-0.5",
          "leading-none",
          "rounded-full",
        ],
        "",
        [this.createHTMLElement("span", ["text-xs"], "0%")]
      );

      progressElement.style.width = "0%";

      progressBarContainer.appendChild(progressElement);

      this.updateProgressBar(totalTime, timeRemaining);
    }
  }

  updateProgressBar(totalTime, timeRemaining) {
    const progressBarContainer = document.getElementById("progressBar-container");

    if (!progressBarContainer) {
      console.error("Elemento HTML 'progressBar-container' não encontrado.");
      return;
    }

    const progressElement = progressBarContainer.firstChild;

    if (!progressElement) {
      console.error("Elemento HTML de progresso não encontrado.");
      return;
    }

    const percentage = ((totalTime - timeRemaining) / totalTime) * 100;

    progressElement.style.width = `${percentage}%`;

    // O elemento `span` está dentro do elemento de progresso, então encontramos ele dentro do progressElement
    const spanElement = progressElement.querySelector("span");

    if (spanElement) {
      spanElement.textContent = `${Math.round(percentage)}%`;
    }
  }

  resetCountdownAndProgressBar() {
    const countdownContainer = document.getElementById("countdown-container");
    const progressBarContainer = document.getElementById("progressBar-container");

    if (countdownContainer) {
      countdownContainer.innerHTML = "";
    }
    if (progressBarContainer) {
      progressBarContainer.innerHTML = "";
    }

    // Reinicia o tempo restante para zero
    this.#timeRemaining = 0;
  }

  resetGame() {
    this.resetGridBox();
    this.#secretWord = this.getRandomWord();
    this.#grid = this.initializeGrid();
    this.#currentRow = 0;
    this.#currentCol = 0;
    this.showGridBox();
    this.handleInputEvent = this.handleInputEvent.bind(this);
    this.registerInputEvents();
    this.removeInputEvents();
    this.closeAlert();
    this.resetCountdownAndProgressBar();
    const letterButtons = document.querySelectorAll(".letter-button");
    letterButtons.forEach((button) => {
      button.classList.remove("bg-[#3aa394]", "bg-[#d3ad69]", "bg-[#312a2c]", "text-white", "dark:text-white");
      button.classList.add("bg-gray-100", "dark:bg-gray-600", "text-gray-800", "dark:text-gray-100");
    });
  }
}

class CosmicQuest extends CosmicGame {
  constructor(numRows, numCols, enableCountdown = false, enableProgressBar = false) {
    super(numRows, numCols, enableCountdown, enableProgressBar);
    this.resetCosmicQuest();
  }

  resetCosmicQuest() {
    super.resetGame();
  }
}

class CosmicRace extends CosmicGame {
  static INITIAL_TIME_MILLISECONDS = 3 * 60 * 1000; // 3 minutos em milissegundos

  #timeRemaining;

  constructor(numRows, numCols, enableCountdown = true, enableProgressBar = true) {
    super(numRows, numCols, enableCountdown, enableProgressBar);
    this.resetCosmicRace();
    this.#timeRemaining = CosmicRace.INITIAL_TIME_MILLISECONDS;
    this.startTimer(enableCountdown, enableProgressBar);
  }

  startTimer(enableCountdown, enableProgressBar) {
    if (enableCountdown) {
      super.countdown(enableCountdown);
    }
    if (enableProgressBar) {
      super.progressBar(CosmicRace.INITIAL_TIME_MILLISECONDS, this.#timeRemaining, enableProgressBar);
    }

    const updateTimer = () => {
      const timeRemaining = (this.#timeRemaining -= 1000);

      super.updateCountdown(timeRemaining);
      super.updateProgressBar(CosmicRace.INITIAL_TIME_MILLISECONDS, timeRemaining);

      if (timeRemaining <= 0) {
        const gameOverMessage = `O tempo se esgotou! A galáxia está perdida. A palavra era <strong>${this.getSecretWord().toUpperCase()}</strong>.`;
        this.showAlert(gameOverMessage, "red", true);
      } else {
        setTimeout(updateTimer, 1000);
      }
    };

    updateTimer();
  }

  resetCosmicRace() {
    super.resetGame();
    this.#timeRemaining = CosmicRace.INITIAL_TIME_MILLISECONDS;
    this.startTimer(true, true);
  }
}

class CosmicCountDown extends CosmicGame {
  constructor(numRows, numCols, enableCountdown = false, enableProgressBar = false) {
    super(numRows, numCols, enableCountdown, enableProgressBar);
    this.resetCosmicCountDown();
  }

  resetCosmicCountDown() {
    super.resetGame();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const initializeCosmicQuest = () => {
    const cosmicQuest = new CosmicQuest(6, 5);
    updateTitle("CosmicQuest");
    toggleButton();
  };

  const initializeCosmicRace = () => {
    const cosmicRace = new CosmicRace(6, 5);
    updateTitle("CosmicRace");
    toggleButton();
  };

  const initializeCosmicCountDown = () => {
    const cosmicCountDown = new CosmicCountDown(6, 5);
    updateTitle("CosmicCountDown");

    toggleButton();
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

  // Função para acionar o botão de alternância
  const toggleButton = () => {
    const toggleButton = document.querySelector("[data-dropdown-toggle='dropdown-menu']");
    if (toggleButton) {
      toggleButton.click();
    }
  };

  initializeCosmicQuest(); // Inicializa o CosmicQuest por padrão ao carregar a página
});

function updateTitle(modeName) {
  const titleSpan = document.getElementById("title");
  if (titleSpan) {
    titleSpan.textContent = modeName;
  }
}

import { dictionary } from "./dicio.js";

class CosmicQuest {
  #numRows;
  #numCols;
  #secretWord;
  #grid;
  #currentRow;
  #currentCol;
  #gridContainer;
  #gridElement;

  constructor(numRows, numCols) {
    this.#numRows = numRows;
    this.#numCols = numCols;
    this.#secretWord = this._getRandomWord();
    this.#grid = this._initializeGrid();
    this.#currentRow = 0;
    this.#currentCol = 0;

    this._setupUI();
    this._registerKeyboardEvents();
    this._setupLetterButtons();
  }

  // Método para obter uma palavra aleatória do dicionário.
  _getRandomWord() {
    return dictionary[Math.floor(Math.random() * dictionary.length)];
  }

  // Método para inicializar a matriz do jogo com arrays vazios.
  _initializeGrid() {
    return Array.from({ length: this.#numRows }, () => Array(this.#numCols).fill(""));
  }

  // Configuração inicial da interface do usuário, criação de elementos HTML para representar o jogo.
  _setupUI() {
    const gameContainer = document.getElementById("game");
    if (!gameContainer) {
      console.error("Elemento HTML 'game' não encontrado.");
      return;
    }

    this.#gridContainer = this._createHTMLElement("div", ["flex", "justify-center", "my-2"]);
    gameContainer.appendChild(this.#gridContainer);
    this._drawGrid(); // Método para desenhar a grade na interface do usuário.
  }

  // Método auxiliar para criar elementos HTML.
  _createHTMLElement(tag, classNames = []) {
    const element = document.createElement(tag);
    element.className = classNames.join(" ");
    return element;
  }

  // Método para desenhar a grade na interface do usuário.
  _drawGrid() {
    this.#gridElement = this._createHTMLElement("div", [
      "grid",
      `grid-cols-${this.#numCols}`,
      `grid-rows-${this.#numRows}`,
      "p-2",
      "gap-1",
    ]);

    // Itera sobre as linhas e colunas da grade, desenhando cada caixa.
    for (let rows = 0; rows < this.#numRows; rows++) {
      for (let cols = 0; cols < this.#numCols; cols++) {
        this._drawBox(rows, cols); // Método para desenhar uma caixa na grade.
      }
    }

    // Adiciona a grade à interface do usuário.
    this.#gridContainer.appendChild(this.#gridElement);
  }

  // Método para desenhar uma caixa na grade.
  _drawBox(row, col, letter = "") {
    // Cria um elemento HTML para representar uma caixa.
    const box = this._createHTMLElement("div", [
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
    ]);
    box.textContent = letter; // Define o conteúdo da caixa como uma letra.
    box.id = `box${row}${col}`; // Atribui um ID único à caixa.
    this.#gridElement.appendChild(box); // Adiciona a caixa à grade.
  }

  // Método para atualizar a grade na interface do usuário com as letras inseridas pelo jogador.
  _updateGrid() {
    // Itera sobre a matriz this.#grid e atualiza cada caixa na grade.
    for (let row = 0; row < this.#grid.length; row++) {
      for (let col = 0; col < this.#grid[row].length; col++) {
        const box = document.getElementById(`box${row}${col}`);
        if (box) {
          box.textContent = this.#grid[row][col];
        }
      }
    }
  }

  // Método para registrar eventos de teclado.
  _registerKeyboardEvents() {
    // Adiciona um ouvinte de eventos de teclado ao corpo do documento.
    document.body.addEventListener("keydown", (e) => {
      const key = e.key;
      // Chama métodos correspondentes com base na tecla pressionada.
      if (key === "Enter") {
        this._processEnterKey();
      } else if (key === "Backspace") {
        this._removeLetter();
      } else if (this._isLetter(key)) {
        this._addLetter(key);
      }

      this._updateGrid(); // Atualiza a grade na interface do usuário.
    });
  }

  // Configura os eventos de clique nos botões de letra.
  _setupLetterButtons() {
    const letterButtons = document.querySelectorAll(".letter-button");

    letterButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        const clickedButton = event.target;
        const letter = clickedButton.dataset.key;
        if (letter === "Enter") {
          this._processEnterKey();
        } else if (letter === "Backspace") {
          this._removeLetter();
        } else {
          this._addLetter(letter);
        }

        this._updateGrid(); // Atualiza a grade na interface do usuário.
      });
    });
  }

  // Método chamado quando a tecla Enter é pressionada.
  _processEnterKey() {
    // Verifica se a última coluna da linha atual foi atingida.
    if (this.#currentCol === this.#numCols) {
      const guessedWord = this._getCurrentWord().toLowerCase();
      if (this._isWordValid(guessedWord)) {
        this._revealWord(guessedWord);
        this.#currentRow++;
        this.#currentCol = 0;
      } else {
        // Animação de agitação para as caixas da palavra atual.
        for (let col = 0; col < this.#numCols; col++) {
          const box = document.getElementById(`box${this.#currentRow}${col}`);
          if (box) {
            box.classList.add("shake-animation");
            setTimeout(() => {
              box.classList.remove("shake-animation");
            }, 500); // Remova a classe de shake após a duração da animação (0.5s).
          }
        }
        this._showAlert("Sua tentativa está flutuando longe da resposta certa no cosmos.", "yellow");
      }
    }
  }

  // Método para obter a palavra atual digitada pelo jogador.
  _getCurrentWord() {
    return this.#grid[this.#currentRow].join("");
  }

  // Método para remover acentos de uma palavra.
  _removeAccents(word) {
    return word
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9çÇãÃáÁàÀâÂéÉêÊíÍóÓõÕôÔúÚüÜ]/g, "");
  }

  // Método para verificar se uma palavra é válida.
  _isWordValid(word) {
    const wordWithoutAccents = this._removeAccents(word.toLowerCase());
    return dictionary.some((entry) => this._removeAccents(entry.toLowerCase()) === wordWithoutAccents);
  }

  // Método para revelar as letras corretas e incorretas na interface do usuário.
  _revealWord(guess) {
    const row = this.#currentRow;
    const animationDuration = 500;

    for (let i = 0; i < this.#numCols; i++) {
      const box = document.getElementById(`box${row}${i}`);
      const letter = box.textContent;

      // Obtém o botão correspondente à letra
      const button = document.querySelector(`.letter-button[data-key="${letter.toLowerCase()}"]`);

      // Remove as classes padrão de fundo do botão e cor da fonte
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

      box.classList.add("flip-animation");
      box.style.animationDelay = `${(i * animationDuration) / 2}ms`;
    }

    const isWinner = this.#secretWord.toLowerCase() === guess.toLowerCase();
    const isGameOver = this.#currentRow === this.#numRows - 1;

    setTimeout(() => {
      if (isWinner) {
        this._showAlert("Parabéns! Você desvendou o mistério cósmico!", "green", true);
      } else if (isGameOver) {
        const gameOverMessage = `Infelizmente, a galáxia está perdida. A palavra era <strong>${this.#secretWord.toUpperCase()}</strong>. Melhor sorte na próxima missão!`;
        this._showAlert(gameOverMessage, "red", true);
      }
    }, 3 * animationDuration);
  }

  // Método para verificar se a tecla pressionada é uma letra.
  _isLetter(key) {
    return key.length === 1 && key.match(/[a-z]/i);
  }

  // Método para adicionar uma letra à matriz this.#grid.
  _addLetter(letter) {
    if (this.#currentCol === this.#numCols) return;
    this.#grid[this.#currentRow][this.#currentCol] = letter;
    this.#currentCol++;
  }

  // Método para remover a última letra adicionada à matriz this.#grid.
  _removeLetter() {
    if (this.#currentCol === 0) return;
    this.#grid[this.#currentRow][this.#currentCol - 1] = "";
    this.#currentCol--;
  }

  _showAlert(message, color, showCloseButton = false) {
    const alertContainer = document.getElementById("alert-container");
    if (!alertContainer) {
      console.error("Elemento HTML 'alert-container' não encontrado.");
      return;
    }

    // Remove alertas anteriores
    alertContainer.innerHTML = "";

    // Cria o elemento de alerta
    const alertElement = this._createHTMLElement("div", [
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

    // Adiciona ícone ao alerta (você pode personalizar o ícone conforme necessário)
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

    // Adiciona botão de fechar se necessário
    if (showCloseButton) {
      const closeButton = this._createHTMLElement("button", [
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
        this._closeAlert();
        this._resetGame();
      });

      alertElement.appendChild(closeButton);
    }

    // Exibe o alerta (remove a classe 'hidden')
    alertContainer.classList.remove("hidden");

    // Se o alerta for amarelo, fecha após 3000ms (3 segundos)
    if (color === "yellow") {
      setTimeout(() => {
        this._closeAlert();
      }, 3000);
    }
  }

  // Método para fechar o alerta
  _closeAlert() {
    const alertContainer = document.getElementById("alert-container");
    if (alertContainer) {
      // Oculta o alerta (adiciona a classe 'hidden')
      alertContainer.classList.add("hidden");
    }
  }

  _resetGame() {
    window.location.reload();
  }
}

// Usage of the class
const game = new CosmicQuest(6, 5);

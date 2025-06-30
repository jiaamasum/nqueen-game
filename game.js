class NQueenSolver {
    constructor(N, initialQueens = []) {
      this.N = N;
      this.cols = new Set();
      this.diag1 = new Set();
      this.diag2 = new Set();
      this.queens = Array(N).fill(-1);
      this.initialQueens = initialQueens;
      if (this.initialQueens.length > 0) {
        for (const [r, c] of this.initialQueens) {
          this.placeQueen(r, c);
        }
      }
    }
  
    placeQueen(r, c) {
      this.queens[r] = c;
      this.cols.add(c);
      this.diag1.add(r - c);
      this.diag2.add(r + c);
    }
  
    removeQueen(r, c) {
      this.queens[r] = -1;
      this.cols.delete(c);
      this.diag1.delete(r - c);
      this.diag2.delete(r + c);
    }
  
    isSafe(r, c) {
      return !this.cols.has(c) && !this.diag1.has(r - c) && !this.diag2.has(r + c);
    }
  
    *solveGenerator(row = 0) {
      while (row < this.N && this.queens[row] !== -1) {
        row++;
      }
      if (row === this.N) {
        yield { type: "solution", queens: [...this.queens] };
        return;
      }
  
      for (let col = 0; col < this.N; col++) {
        if (this.isSafe(row, col)) {
          this.placeQueen(row, col);
          yield { type: "place", row, col };
          yield* this.solveGenerator(row + 1);
          this.removeQueen(row, col);
          yield { type: "remove", row, col };
        }
      }
    }
  }
  
  const canvas = document.getElementById('boardCanvas');
  const ctx = canvas.getContext('2d');
  
  let boardSize = 8;
  let queenImage = new Image();
  queenImage.src = 'queen.png';  // Make sure to place the queen image in the correct folder
  
  const NQueenApp = {
    N: boardSize,
    board: [],
    queenItems: new Map(),
    solver: null,
    solverGen: null,
    solutionCounter: 0,
    stepDelay: 200,
    init() {
      this.drawBoard(this.N);
      document.getElementById('startBtn').onclick = this.startSolver.bind(this);
      document.getElementById('nextBtn').onclick = this.nextSolution.bind(this);
      document.getElementById('resetBtn').onclick = this.resetBoard.bind(this);
      document.getElementById('boardSize').addEventListener('change', this.updateBoardSize.bind(this));
    },
    
    drawBoard(N) {
      canvas.width = N * 60;
      canvas.height = N * 60;
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          ctx.fillStyle = (r + c) % 2 === 0 ? '#f0d9b5' : '#b58863';
          ctx.fillRect(c * 60, r * 60, 60, 60);
          ctx.strokeRect(c * 60, r * 60, 60, 60);
        }
      }
    },
  
    onCellClick(r, c) {
      if (this.queenItems.has(`${r},${c}`)) {
        this.canvas.clearRect(c * 60, r * 60, 60, 60);  // Clear the queen
        this.queenItems.delete(`${r},${c}`);
      } else {
        this.queenItems.set(`${r},${c}`, true);
        ctx.drawImage(queenImage, c * 60 + 10, r * 60 + 10, 40, 40);
      }
    },
  
    startSolver() {
      const initial = [...this.queenItems.keys()].map(key => key.split(',').map(Number));
      this.solver = new NQueenSolver(this.N, initialQueens = initial);
      this.solverGen = this.solver.solveGenerator();
      this.animateStep();
    },
  
    animateStep() {
      const event = this.solverGen.next();
      if (event.done) return;
  
      const action = event.value;
      if (action.type === 'place') {
        const { row, col } = action;
        ctx.drawImage(queenImage, col * 60 + 10, row * 60 + 10, 40, 40);
      }
      else if (action.type === 'remove') {
        const { row, col } = action;
        ctx.clearRect(col * 60, row * 60, 60, 60);  // Remove the queen
      }
      else if (action.type === 'solution') {
        this.solutionCounter++;
        document.getElementById('statusLabel').textContent = `Solutions: ${this.solutionCounter}`;
        document.getElementById('nextBtn').disabled = false;
      }
      setTimeout(() => this.animateStep(), this.stepDelay);
    },
  
    nextSolution() {
      document.getElementById('nextBtn').disabled = true;
      this.animateStep();
    },
  
    resetBoard() {
      this.drawBoard(this.N);
      this.queenItems.clear();
      document.getElementById('historyList').innerHTML = '';
      document.getElementById('statusLabel').textContent = 'Solutions: 0';
      this.solutionCounter = 0;
    },
  
    updateBoardSize() {
      this.N = parseInt(document.getElementById('boardSize').value, 10);
      this.drawBoard(this.N);
      this.resetBoard();
    }
  };
  
  window.onload = () => NQueenApp.init();
  
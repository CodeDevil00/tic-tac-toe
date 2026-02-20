const root = document.documentElement;

function applyTheme(theme){
  root.setAttribute("data-theme", theme);
  localStorage.setItem("tt_theme", theme);
  const btn = document.getElementById("ttTheme");
  if (btn) btn.textContent = theme === "light" ? "Dark" : "Light";
}

applyTheme(localStorage.getItem("tt_theme") || "dark");
document.getElementById("ttTheme")?.addEventListener("click", () => {
  const cur = root.getAttribute("data-theme") || "dark";
  applyTheme(cur === "dark" ? "light" : "dark");
});

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

let board = Array(9).fill("");
let turn = "X";
let locked = false;

const score = JSON.parse(localStorage.getItem("tt_score") || '{"X":0,"O":0,"D":0}');
const xWinsEl = document.getElementById("xWins");
const oWinsEl = document.getElementById("oWins");
const drawsEl = document.getElementById("draws");

function saveScore(){
  localStorage.setItem("tt_score", JSON.stringify(score));
}
function renderScore(){
  xWinsEl.textContent = String(score.X);
  oWinsEl.textContent = String(score.O);
  drawsEl.textContent = String(score.D);
}
renderScore();

const statusEl = document.getElementById("status");
const boardEl = document.getElementById("board");

function setStatus(msg){
  statusEl.textContent = msg;
}

function checkWinner(){
  for (const line of WIN_LINES){
    const [a,b,c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]){
      return { winner: board[a], line };
    }
  }
  if (board.every(v => v)) return { winner: "D", line: [] };
  return null;
}

function renderBoard(){
  boardEl.innerHTML = "";
  board.forEach((val, idx) => {
    const btn = document.createElement("button");
    btn.className = "cell";
    btn.type = "button";
    btn.setAttribute("role","gridcell");
    btn.setAttribute("aria-label", `Cell ${idx+1} ${val ? val : "empty"}`);
    btn.dataset.idx = String(idx);
    btn.textContent = val;
    btn.disabled = locked || Boolean(val);

    btn.addEventListener("click", () => makeMove(idx));
    btn.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        makeMove(idx);
      }
    });
    boardEl.appendChild(btn);
  });
}

function highlight(line){
  if (!line?.length) return;
  const cells = [...boardEl.querySelectorAll(".cell")];
  for (const i of line){
    cells[i]?.classList.add("win");
  }
}

function makeMove(idx){
  if (locked || board[idx]) return;
  board[idx] = turn;
  const result = checkWinner();

  if (result){
    locked = true;
    if (result.winner === "D"){
      score.D += 1;
      setStatus("Draw! Press Restart to play again.");
    }else{
      score[result.winner] += 1;
      setStatus(`${result.winner} wins! Press Restart to play again.`);
    }
    saveScore();
    renderScore();
    renderBoard();
    highlight(result.line);
    return;
  }

  turn = turn === "X" ? "O" : "X";
  setStatus(`${turn}'s turn`);
  renderBoard();
}

function restart(){
  board = Array(9).fill("");
  turn = "X";
  locked = false;
  setStatus(`${turn}'s turn`);
  renderBoard();
}

document.getElementById("restart")?.addEventListener("click", restart);
document.getElementById("resetScore")?.addEventListener("click", () => {
  score.X = 0; score.O = 0; score.D = 0;
  saveScore();
  renderScore();
  restart();
});

restart();

// ==========================================
// 1. O'YIN STATE VA SOZLAMALARI
// ==========================================
let board = null;
let game = new Chess();

let isOnlineMatch = false; // Jonli raqib bilan o'yin holati
let playerRole = 'self';   // 'self' yoki 'agent'
let userTotalGames = parseInt(localStorage.getItem('aalteeer_played_games') || '0');

let autoQueen = true;
let enablePremove = true;

let whiteTime = 180;
let blackTime = 180;
let matchTimerInterval = null;
let gameActive = false;

// Realistik Online O'yinchilar
const onlineSimUsers = [
  { name: "Sardor_Tashkent", elo: 1350, avatar: "⚡", style: "e4_open", speed: [1200, 3500] },
  { name: "Magnus_Fan99", elo: 1820, avatar: "👑", style: "d4_solid", speed: [800, 2500] },
  { name: "Alisher_GM", elo: 2150, avatar: "🔥", style: "sicilian", speed: [600, 2000] },
  { name: "ChessNinja_Uz", elo: 1100, avatar: "🥷", style: "blunder_prone", speed: [1500, 4500] }
];

let currentOpponent = null;

// ==========================================
// 2. TIMERS & CLOCK
// ==========================================
function formatTimeDisplay(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

function updateClocks() {
  $('#meTimer').text(formatTimeDisplay(whiteTime));
  $('#oppTimer').text(formatTimeDisplay(blackTime));
}

function startMatchClock() {
  clearInterval(matchTimerInterval);
  gameActive = true;
  matchTimerInterval = setInterval(() => {
    if (!gameActive) return;
    if (game.turn() === 'w') {
      whiteTime--;
      if (whiteTime <= 0) endGameByTimeout('w');
    } else {
      blackTime--;
      if (blackTime <= 0) endGameByTimeout('b');
    }
    updateClocks();
  }, 1000);
}

function endGameByTimeout(loser) {
  gameActive = false;
  clearInterval(matchTimerInterval);
  const winText = loser === 'w' ? "Vaqt tugadi! Qoralar g'alaba qozondi." : "Vaqt tugadi! Siz yutdingiz! 🎉";
  alert(winText);
  $('#gameTurnStatus').text(winText);
}

// ==========================================
// 3. AI AGENT REJIMI (15 PARTIYA TALABI)
// ==========================================
function setPlayerType(type) {
  if (type === 'agent') {
    if (userTotalGames < 15) {
      alert(`🔒 AI Agent yaratish uchun kamida 15 ta to'liq partiya o'ynashingiz kerak!\nHozircha o'ynalgan partiyalar: ${userTotalGames}/15`);
      return;
    }
    playerRole = 'agent';
    $('#playAgentBtn').addClass('btn-gold');
    $('#playSelfBtn').removeClass('btn-gold');
    $('#agentStatusNotice').text("✅ Sizning o'yin uslubingizdagi AI Agent o'ynaydi.");
  } else {
    playerRole = 'self';
    $('#playSelfBtn').addClass('btn-gold');
    $('#playAgentBtn').removeClass('btn-gold');
    $('#agentStatusNotice').text("");
  }
}

// ==========================================
// 4. JONLI ONLINE VA BOT O'YINLARI
// ==========================================
function startOnlineRealMatch() {
  closeGameSelectionModal();
  isOnlineMatch = true;
  $('#undoActionBtn').prop('disabled', true).css('opacity', '0.25'); // Qaytarishni o'chirish
  $('#gameTurnStatus').text("🔍 Raqib qidirilmoqda...").css('color', 'var(--accent-gold)');

  setTimeout(() => {
    currentOpponent = onlineSimUsers[Math.floor(Math.random() * onlineSimUsers.length)];
    $('#oppName').text(currentOpponent.name);
    $('#oppElo').text(`Reyting: ${currentOpponent.elo}`);
    $('#oppAvatar').text(currentOpponent.avatar);

    restartGameSession();
    $('#gameTurnStatus').text("Partiya boshlandi!").css('color', 'var(--accent-green)');
    alert(`⚡ Raqib topildi: ${currentOpponent.name} (${currentOpponent.elo})\nJonli o'yinda yurishni qaytarish ruxsat etilmaydi.`);
  }, 1500);
}

function startStockfishDirectMatch() {
  isOnlineMatch = false;
  $('#undoActionBtn').prop('disabled', false).css('opacity', '1'); // Botda qaytarish mumkin
  window.location.href = 'alterego.html';
}

function inviteFriendModal() {
  isOnlineMatch = true;
  $('#undoActionBtn').prop('disabled', true).css('opacity', '0.25');
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.openTelegramLink("https://t.me/share/url?url=" + encodeURIComponent("https://jbekzodd.github.io/AALTEEER/") + "&text=AALTEEER'da men bilan shaxmat o'yna!");
  } else {
    navigator.clipboard.writeText("https://jbekzodd.github.io/AALTEEER/");
    alert("O'yin taklif havolasi nusxalandi!");
  }
}

// ==========================================
// 5. YURISH HARAKATLARI VA QAYTARISH QOIDASI
// ==========================================
function undoMove() {
  if (!gameActive) return;

  if (isOnlineMatch) {
    alert("⛔ Jonli raqibga qarshi o'yinda yurishni qaytarish mumkin emas!");
    return;
  }

  // Faqat botga qarshi o'yinda 2 ta qadam ortga qaytariladi
  game.undo();
  game.undo();
  board.position(game.fen());
  alert("↩️ Oxirgi yurishingiz qaytarildi.");
}

function makeSimulatedHumanMove() {
  if (game.game_over()) return handleGameOver();

  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return handleGameOver();

  const minSpeed = currentOpponent ? currentOpponent.speed[0] : 1000;
  const maxSpeed = currentOpponent ? currentOpponent.speed[1] : 3000;
  const delay = Math.floor(Math.random() * (maxSpeed - minSpeed)) + minSpeed;

  setTimeout(() => {
    let chosenMove = null;

    if (currentOpponent && currentOpponent.style === 'blunder_prone' && Math.random() < 0.25) {
      chosenMove = moves[Math.floor(Math.random() * moves.length)];
    } else {
      $.ajax({
        url: `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(game.fen())}&depth=8`,
        type: 'GET',
        dataType: 'json',
        success: function(data) {
          if (data && data.success && data.bestmove) {
            const m = data.bestmove.split(' ')[1];
            if (m) {
              const move = game.move({ from: m.substring(0,2), to: m.substring(2,4), promotion: 'q' });
              if (move) {
                board.position(game.fen());
                if (playerRole === 'agent' && !game.game_over()) triggerAgentMove();
                return;
              }
            }
          }
          fallbackMove();
        },
        error: () => fallbackMove()
      });
      return;
    }

    if (chosenMove) {
      game.move(chosenMove);
      board.position(game.fen());
      if (playerRole === 'agent' && !game.game_over()) triggerAgentMove();
    }
  }, delay);
}

function triggerAgentMove() {
  setTimeout(() => {
    const moves = game.moves();
    if (moves.length === 0) return;
    const move = moves[Math.floor(Math.random() * moves.length)];
    game.move(move);
    board.position(game.fen());
    if (!game.game_over()) makeSimulatedHumanMove();
  }, 1200);
}

function fallbackMove() {
  const moves = game.moves();
  if (moves.length === 0) return;
  game.move(moves[Math.floor(Math.random() * moves.length)]);
  board.position(game.fen());
}

function onDragStart(source, piece) {
  if (!gameActive || game.game_over() || piece.search(/^b/) !== -1 || game.turn() !== 'w') return false;
  if (playerRole === 'agent') return false;
}

function onDrop(source, target) {
  const move = game.move({ from: source, to: target, promotion: 'q' });
  if (move === null) return 'snapback';

  if (!game.game_over()) {
    makeSimulatedHumanMove();
  } else {
    handleGameOver();
  }
}

function handleGameOver() {
  gameActive = false;
  clearInterval(matchTimerInterval);
  userTotalGames++;
  localStorage.setItem('aalteeer_played_games', userTotalGames.toString());

  if (game.in_checkmate()) {
    alert(game.turn() === 'w' ? "Mot! Siz yutqazdingiz." : "Mot! G'alaba qozondingiz! 🎉");
  } else if (game.in_draw()) {
    alert("Partiya durang bilan yakunlandi!");
  }
}

function restartGameSession() {
  game.reset();
  board.start();
  whiteTime = 180;
  blackTime = 180;
  updateClocks();
  startMatchClock();
}

function resignGame() {
  if (!gameActive) return;
  if (confirm("Haqiqatan ham taslim bo'lmoqchimisiz?")) {
    gameActive = false;
    clearInterval(matchTimerInterval);
    alert("Siz taslim bo'ldingiz.");
    $('#gameTurnStatus').text("Taslim bo'lindi.");
  }
}

function offerDraw() {
  if (!gameActive) return;
  alert("Durang taklif qilindi. Raqib rad etdi va o'yin davom etadi!");
}

function openGameSelectionModal() { $('#gameSelectModal').show(); }
function closeGameSelectionModal() { $('#gameSelectModal').hide(); }
function openSettingsModal() { $('#settingsModal').show(); }
function closeSettingsModal() { $('#settingsModal').hide(); }

function saveGamePreferences() {
  autoQueen = $('#setToggleQueen').is(':checked');
  enablePremove = $('#setTogglePremove').is(':checked');
}

function toggleHandsFreeVoice() {
  alert("🎙️ Ovozli rejim faol. 'e2 e4' yoki 'ot f3' deb bevosita ovozda buyruq bering!");
}

// ==========================================
// 6. INIZIALIZATSIYA
// ==========================================
$(document).ready(function() {
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }

  const savedUser = JSON.parse(localStorage.getItem('aalteeer_user') || '{}');
  if (savedUser.name) {
    $('#userDisplayName').text(savedUser.name);
    $('#meName').text(savedUser.name);
  }

  board = Chessboard('board', {
    draggable: true,
    position: 'start',
    orientation: 'white',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: () => board.position(game.fen()),
    pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
  });

  $(window).resize(board.resize);
  updateClocks();
});

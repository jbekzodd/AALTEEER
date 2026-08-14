// ==========================================
// 1. STATE VA SOZLAMALAR
// ==========================================
let board = null;
let game = new Chess();

let isOnlineMatch = false;
let playerRole = 'self'; // 'self' yoki 'agent'
let userTotalGames = parseInt(localStorage.getItem('aalteeer_played_games') || '0');

let baseTime = 180;
let bonusIncrement = 0;
let whiteTime = 180;
let blackTime = 180;
let matchTimerInterval = null;
let gameActive = false;

// 20+ XALQARO ODAMDEK O'YNOVCHI AGENTLAR BAZASI
const globalAgentsDB = [
  { name: "Sardor_99", elo: 1320, flag: "🇺🇿", avatar: "⚡", blunders: 0.20, speed: [1200, 3000] },
  { name: "John_NYC", elo: 1450, flag: "🇺🇸", avatar: "🤠", blunders: 0.15, speed: [1000, 2500] },
  { name: "Aarav_Chess", elo: 1890, flag: "🇮🇳", avatar: "🔥", blunders: 0.08, speed: [800, 2000] },
  { name: "Dmitry_Rook", elo: 1650, flag: "🇷🇺", avatar: "🐻", blunders: 0.12, speed: [1100, 2800] },
  { name: "Hans_Berlin", elo: 2050, flag: "🇩🇪", avatar: "🛡️", blunders: 0.05, speed: [600, 1800] },
  { name: "Pierre_Paris", elo: 1280, flag: "🇫🇷", avatar: "🥐", blunders: 0.25, speed: [1500, 3500] },
  { name: "Kenji_Tokyo", elo: 1750, flag: "🇯🇵", avatar: "🥷", blunders: 0.10, speed: [900, 2200] },
  { name: "Ali_Samarkand", elo: 1510, flag: "🇺🇿", avatar: "🏹", blunders: 0.14, speed: [1000, 2600] },
  { name: "Lucas_Rio", elo: 1400, flag: "🇧🇷", avatar: "⚽", blunders: 0.18, speed: [1200, 3100] },
  { name: "Elena_Minsk", elo: 1620, flag: "🇧🇾", avatar: "🌸", blunders: 0.12, speed: [1000, 2700] },
  { name: "Mateo_Madrid", elo: 1800, flag: "🇪🇸", avatar: "🐂", blunders: 0.09, speed: [800, 2100] },
  { name: "Chen_Beijing", elo: 1950, flag: "🇨🇳", avatar: "🐉", blunders: 0.06, speed: [700, 1900] },
  { name: "Omer_Istanbul", elo: 1380, flag: "🇹🇷", avatar: "🌙", blunders: 0.19, speed: [1300, 3200] },
  { name: "Nurbek_Astana", elo: 1560, flag: "🇰🇿", avatar: "🦅", blunders: 0.13, speed: [1100, 2500] },
  { name: "Liam_London", elo: 1710, flag: "🇬🇧", avatar: "🎩", blunders: 0.11, speed: [900, 2300] },
  { name: "Viktor_Kyiv", elo: 1840, flag: "🇺🇦", avatar: "⚔️", blunders: 0.08, speed: [800, 2000] },
  { name: "Sofia_Rome", elo: 1490, flag: "🇮🇹", avatar: "🍕", blunders: 0.16, speed: [1200, 2900] },
  { name: "David_TelAviv", elo: 1910, flag: "🇮🇱", avatar: "✡️", blunders: 0.07, speed: [750, 1950] },
  { name: "Tariq_Dubai", elo: 1670, flag: "🇦🇪", avatar: "🏜️", blunders: 0.12, speed: [1000, 2600] },
  { name: "Kim_Seoul", elo: 2100, flag: "🇰🇷", avatar: "🐯", blunders: 0.04, speed: [600, 1700] }
];

let currentOpponent = null;

// ==========================================
// 2. TIMERS & CLOCKS
// ==========================================
function selectTimeFormat(sec, inc, btnEl) {
  baseTime = sec;
  bonusIncrement = inc;
  whiteTime = sec;
  blackTime = sec;
  $('.time-chip-btn').removeClass('active');
  $(btnEl).addClass('active');
  updateClocks();
}

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
  const isWin = loser === 'b';
  showCustomAlert(isWin ? "🏆 G'alaba!" : "⏳ Vaqt Tugadi", isWin ? "Raqibingiz vaqti tugadi. Siz yutdingiz!" : "Vaqtingiz tugadi. Mag'lubiyat.");
}

// ==========================================
// 3. AI AGENT REJIMI (QIZIL [AI] YORLIQ)
// ==========================================
function setPlayerType(type) {
  if (type === 'agent') {
    if (userTotalGames < 15) {
      showCustomAlert("🔒 AI Agent Qulflangan", `Sizning nomingizdan o'ynovchi AI Agentni ochish uchun kamida 15 ta partiya o'ynashingiz kerak.\nHozirda: ${userTotalGames}/15`);
      return;
    }
    playerRole = 'agent';
    $('#playAgentBtn').addClass('btn-gold');
    $('#playSelfBtn').removeClass('btn-gold');
    $('#meAiTag').show();
  } else {
    playerRole = 'self';
    $('#playSelfBtn').addClass('btn-gold');
    $('#playAgentBtn').removeClass('btn-gold');
    $('#meAiTag').hide();
  }
}

// ==========================================
// 4. JONLI ONLINE RAQIB VA STIKERLAR
// ==========================================
function startOnlineRealMatch() {
  closeGameSelectionModal();
  isOnlineMatch = true;
  $('#undoActionBtn').prop('disabled', true).css('opacity', '0.25');
  $('#gameTurnStatus').text("🔍 Raqib qidirilmoqda...").css('color', 'var(--accent-gold)');

  setTimeout(() => {
    currentOpponent = globalAgentsDB[Math.floor(Math.random() * globalAgentsDB.length)];
    $('#oppName').text(currentOpponent.name);
    $('#oppElo').text(`Reyting: ${currentOpponent.elo}`);
    $('#oppFlag').text(currentOpponent.flag);
    $('#oppAvatar').text(currentOpponent.avatar);
    $('#oppAiTag').hide();

    restartGameSession();
    showCustomAlert("⚡ Raqib Topildi!", `Raqib: ${currentOpponent.flag} ${currentOpponent.name} (${currentOpponent.elo})\nVaqt: ${formatTimeDisplay(baseTime)}`);
  }, 1400);
}

function startMatchWithBot(name, elo, flag, avatar, personality) {
  $('#eliteBotsModal').hide();
  closeGameSelectionModal();
  isOnlineMatch = false;
  $('#undoActionBtn').prop('disabled', false).css('opacity', '1');

  currentOpponent = { name, elo, flag, avatar, blunders: 0.02, speed: [800, 2000] };
  $('#oppName').text(name);
  $('#oppElo').text(`Reyting: ${elo}`);
  $('#oppFlag').text(flag);
  $('#oppAvatar').text(avatar);
  $('#oppAiTag').show();

  restartGameSession();
  showCustomAlert("👑 Elita Bot!", `${flag} ${name} bilan partiya boshlandi!`);
}

function sendStickerReaction(sticker) {
  const bubble = $('#boardStickerBubble');
  bubble.text(sticker).css({ left: '50%', top: '65%' }).show();
  setTimeout(() => bubble.hide(), 1800);

  // Raqib agent ham ba'zan stiker bilan javob qaytaradi
  if (Math.random() < 0.65) {
    const oppStickers = ['😎', '🤔', '🔥', '👏', '🤝'];
    const oppStk = oppStickers[Math.floor(Math.random() * oppStickers.length)];
    setTimeout(() => {
      bubble.text(oppStk).css({ left: '50%', top: '25%' }).show();
      setTimeout(() => bubble.hide(), 1800);
    }, 1200);
  }
}

// ==========================================
// 5. YURISH HARAKATLARI & SIMULATSIYA
// ==========================================
function makeSimulatedHumanMove() {
  if (game.game_over()) return handleGameOver();

  const moves = game.moves({ verbose: true });
  if (moves.length === 0) return handleGameOver();

  const minSpeed = currentOpponent ? currentOpponent.speed[0] : 1000;
  const maxSpeed = currentOpponent ? currentOpponent.speed[1] : 2800;
  const delay = Math.floor(Math.random() * (maxSpeed - minSpeed)) + minSpeed;

  setTimeout(() => {
    let chosenMove = null;

    // Agent ba'zan inson kabi xato yuradi
    if (currentOpponent && Math.random() < currentOpponent.blunders) {
      chosenMove = moves[Math.floor(Math.random() * moves.length)];
      if (Math.random() < 0.4) sendStickerReaction('🤦‍♂️');
    } else {
      $.ajax({
        url: `https://stockfish.online/api/s/v2.php?fen=${encodeURIComponent(game.fen())}&depth=9`,
        type: 'GET',
        dataType: 'json',
        success: function(data) {
          if (data && data.success && data.bestmove) {
            const m = data.bestmove.split(' ')[1];
            if (m) {
              const move = game.move({ from: m.substring(0,2), to: m.substring(2,4), promotion: 'q' });
              if (move) {
                blackTime += bonusIncrement;
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
      blackTime += bonusIncrement;
      board.position(game.fen());
      if (playerRole === 'agent' && !game.game_over()) triggerAgentMove();
    }
  }, delay);
}

function triggerAgentMove() {
  setTimeout(() => {
    const moves = game.moves();
    if (moves.length === 0) return;
    game.move(moves[Math.floor(Math.random() * moves.length)]);
    whiteTime += bonusIncrement;
    board.position(game.fen());
    if (!game.game_over()) makeSimulatedHumanMove();
  }, 1100);
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

  whiteTime += bonusIncrement;
  updateClocks();

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
    const isWin = game.turn() === 'b';
    showCustomAlert(isWin ? "🎉 SHOH VA MOT!" : "💀 MOT BO'LDINGIZ", isWin ? "Ajoyib g'alaba! Reytingingiz oshdi." : "Raqib g'alaba qozondi.");
  } else if (game.in_draw()) {
    showCustomAlert("🤝 DURANG!", "Partiya durang bilan yakunlandi.");
  }
}

function restartGameSession() {
  game.reset();
  board.start();
  whiteTime = baseTime;
  blackTime = baseTime;
  updateClocks();
  startMatchClock();
  $('#gameTurnStatus').text("Sizning yurishingiz").css('color', 'var(--accent-green)');
}

function undoMove() {
  if (!gameActive) return;
  if (isOnlineMatch) {
    showCustomAlert("⛔ Qaytarish Cheklovi", "Jonli raqibga qarshi o'yinda yurishni qaytarish mumkin emas!");
    return;
  }
  game.undo();
  game.undo();
  board.position(game.fen());
}

function resignGame() {
  if (!gameActive) return;
  gameActive = false;
  clearInterval(matchTimerInterval);
  showCustomAlert("🏳️ Taslim Bo'lindi", "Siz partiyani tark etdingiz va taslim bo'ldingiz.");
}

function offerDraw() {
  if (!gameActive) return;
  showCustomAlert("🤝 Durang Taklifi", "Raqib durangga rozi bo'lmadi va kurashni davom ettiradi!");
}

// ==========================================
// 6. MODALS VA ADMIN BOSHQARUVI
// ==========================================
function openGameSelectionModal() { $('#gameSelectModal').show(); }
function closeGameSelectionModal() { $('#gameSelectModal').hide(); }
function openEliteBotsModal() { $('#eliteBotsModal').show(); }
function openTournamentListModal() { $('#tournamentsModal').show(); }
function openSettingsModal() { $('#settingsModal').show(); }

function showCustomAlert(title, message) {
  $('#alertTitle').text(title);
  $('#alertMessage').text(message);
  $('#customAlertModal').show();
}

function closeCustomAlert() {
  $('#customAlertModal').hide();
}

function joinActiveTournament(name) {
  $('#tournamentsModal').hide();
  showCustomAlert("🏆 Turnirga Qo'shildingiz", `${name} turniriga muvaffaqiyatli ulandingiz!\n20 ta xalqaro agent va real o'yinchilar bilan 1-tur boshlanmoqda.`);
  startOnlineRealMatch();
}

function createCustomTournament() {
  showCustomAlert("🏆 Yangi Turnir", "Turnir yaratildi! 20 ta turli davlat agentlari avtomatik qatnashuvchilar ro'yxatiga kiritildi.");
}

function showAdminAgentsList() {
  let list = globalAgentsDB.map(a => `${a.flag} ${a.name} (${a.elo})`).join('\n');
  alert(`👑 JAMI AGENTLAR (20 ta):\n\n${list}`);
}

function showAdminUsersList() {
  alert("👑 OBUNACHILAR:\n1. Bekzod (Admin) - Premium\n2. Yangi qo'shilgan o'yinchilar: Jonli seansda.");
}

function toggleHandsFreeVoice() {
  showCustomAlert("🎙️ Ovozli Rejim", "Hands-free rejimi faol. Doskaga tegmasdan 'e2 e4' yoki 'ot f3' deng!");
}

// ==========================================
// 7. INIZIALIZATSIYA
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

  if (savedUser.isAdmin) {
    $('#adminPanelSection').show();
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

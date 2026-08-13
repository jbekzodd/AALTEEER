<!DOCTYPE html>
<html lang="uz">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AALTEEER Chess AI</title>
  
  <!-- Lichess Chessboard & Chess.js CDN -->
  <link rel="stylesheet" href="https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.css">
  <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
  <script src="https://unpkg.com/@chrisoakman/chessboardjs@1.0.0/dist/chessboard-1.0.0.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/chess.js/0.10.3/chess.min.js"></script>
  <script src="https://telegram.org/js/telegram-web-app.js"></script>

  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    body {
      background-color: #161512;
      color: #ffffff;
      padding-bottom: 70px;
    }

    /* Top Bar */
    .header {
      background-color: #1e1e1e;
      padding: 15px;
      text-align: center;
      border-bottom: 2px solid #363636;
    }

    .brand-title {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 2px;
      color: #3692e7;
    }

    .brand-title span {
      color: #fff;
    }

    .subtitle {
      font-size: 11px;
      color: #8c8c8c;
      margin-top: 2px;
    }

    /* Progress Bars Section */
    .progress-section {
      background: #262421;
      padding: 12px 15px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      border-bottom: 1px solid #363636;
    }

    .progress-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 12px;
    }

    .progress-label {
      width: 80px;
      color: #bababa;
    }

    .progress-bar-bg {
      flex-grow: 1;
      height: 8px;
      background-color: #363636;
      border-radius: 4px;
      margin: 0 10px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #629924, #81b64c);
      border-radius: 4px;
    }

    .progress-percent {
      width: 35px;
      text-align: right;
      font-weight: bold;
      color: #81b64c;
    }

    /* Main Container */
    .container {
      padding: 15px;
    }

    /* Board Container */
    .board-card {
      background-color: #262421;
      padding: 10px;
      border-radius: 12px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    }

    #board {
      width: 100%;
      max-width: 400px;
      margin: 0 auto;
    }

    /* Bottom Navigation */
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 60px;
      background-color: #1e1e1e;
      display: flex;
      justify-content: space-around;
      align-items: center;
      border-top: 1px solid #363636;
      z-index: 1000;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #8c8c8c;
      text-decoration: none;
      font-size: 10px;
      cursor: pointer;
    }

    .nav-item.active {
      color: #3692e7;
    }

    .nav-icon {
      font-size: 18px;
      margin-bottom: 2px;
    }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="brand-title">AALTEEER <span>AI</span></div>
    <div class="subtitle">Sizning Shaxmatdagi Ikkinchi "Men"ingiz</div>
  </div>

  <!-- Progress Bars -->
  <div class="progress-section">
    <div class="progress-item">
      <span class="progress-label">Debyut</span>
      <div class="progress-bar-bg"><div class="progress-fill" style="width: 100%;"></div></div>
      <span class="progress-percent">100%</span>
    </div>
    <div class="progress-item">
      <span class="progress-label">Taktika</span>
      <div class="progress-bar-bg"><div class="progress-fill" style="width: 65%;"></div></div>
      <span class="progress-percent">65%</span>
    </div>
    <div class="progress-item">
      <span class="progress-label">Mittelshpil</span>
      <div class="progress-bar-bg"><div class="progress-fill" style="width: 40%;"></div></div>
      <span class="progress-percent">40%</span>
    </div>
    <div class="progress-item">
      <span class="progress-label">Endshpil</span>
      <div class="progress-bar-bg"><div class="progress-fill" style="width: 25%;"></div></div>
      <span class="progress-percent">25%</span>
    </div>
    <div class="progress-item">
      <span class="progress-label">Diqqat</span>
      <div class="progress-bar-bg"><div class="progress-fill" style="width: 85%; background: linear-gradient(90deg, #3692e7, #5eb5ff);"></div></div>
      <span class="progress-percent" style="color:#3692e7;">85%</span>
    </div>
  </div>

  <!-- Main Board Area -->
  <div class="container">
    <div class="board-card">
      <div id="board"></div>
    </div>
  </div>

  <!-- Bottom Navigation -->
  <div class="bottom-nav">
    <div class="nav-item active">
      <span class="nav-icon">🏠</span>
      <span>Asosiy</span>
    </div>
    <div class="nav-item">
      <span class="nav-icon">🎓</span>
      <span>Darslar</span>
    </div>
    <div class="nav-item">
      <span class="nav-icon">⚔️</span>
      <span>Live</span>
    </div>
    <div class="nav-item">
      <span class="nav-icon">📊</span>
      <span>AI Bot</span>
    </div>
    <div class="nav-item">
      <span class="nav-icon">☰</span>
      <span>Ko'proq</span>
    </div>
  </div>

  <script>
    // Telegram Mini App Initsializatsiyasi
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();

    // Shaxmat Taxtasi (Lichess style)
    var board = null;
    var game = new Chess();

    function onDragStart (source, piece, position, orientation) {
      if (game.game_over()) return false;
      if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
          (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
      }
    }

    function onDrop (source, target) {
      var move = game.move({
        from: source,
        to: target,
        promotion: 'q'
      });

      if (move === null) return 'snapback';
    }

    function onSnapEnd () {
      board.position(game.fen());
    }

    var config = {
      draggable: true,
      position: 'start',
      onDragStart: onDragStart,
      onDrop: onDrop,
      onSnapEnd: onSnapEnd,
      pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    };

    board = Chessboard('board', config);
    $(window).resize(board.resize);
  </script>
</body>
</html>

(function () {
    const gameCanvas = $('#canvas'),
        gameContext = gameCanvas[0].getContext('2d');

    const blackjackApp = new Blackjack(gameCanvas, gameContext);

    blackjackApp.startGame();
    blackjackApp.drawCards();
})();               
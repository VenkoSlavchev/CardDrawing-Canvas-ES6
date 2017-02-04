class Blackjack {
    constructor(gameCanvas, canvasContext) {
        this.deck = new Deck();
        this.drawer = new Drawer(gameCanvas, canvasContext);
        /*cards on table is object that holds all cards that are on the table in every moment of the game
         and when a card has been removed it put undefined value of it's place until a new card appears*/
        this.cardsOnTable = {
            playerCards: [undefined, undefined],
            dealerCards: [undefined, undefined, undefined]
        };
        /*cards are moving is object that keep information if cards are moving or not and it puts true if card
         is moving and false after it stops*/
        this.cardsAreMoving = {
            playerCards: [false, false],
            dealerCards: [false, false, false]

        };
        /*cardsAnimationTimeout is property that holds time for set time out functions */
        this.cardsAnimationTimeout = 5;
    }

    /* Start Game Fills the deck with cards draws deck and hit button on the table and atach click event on canvas */
    startGame() {
        this.deck.fillDeckWithCards();
        this.adjustCardsPositions();
        $(window).trigger('resize');
        $('#canvas').on('click', (event) => {
            this.clickHandler(event);
        });
    }

    /*drawCards simply draws player and dealer cards */
    drawCards() {
        this.drawPlayerCards();
        this.drawDealerCards();
    }

    dealCard(currentXCoordinate, currentYCoordinate, destinationXCoordinate, destinationYCoordinate, card,
             cardIndex, isPlayerCard) {
        let cardMovingFunction,
            dealCardLoop;

        if (isPlayerCard) {
            this.cardsOnTable.playerCards[cardIndex] = {
                xCoordinate: currentXCoordinate,
                yCoordinate: currentYCoordinate,
                card: card
            };
            this.cardsAreMoving.playerCards[cardIndex] = true;
            /*bind cardMovingFunction to context of blackjack class in order to use class object properties */
            cardMovingFunction = this.movePlayerCard.bind(this);
        } else {
            this.cardsOnTable.dealerCards[cardIndex] = {
                xCoordinate: currentXCoordinate,
                yCoordinate: currentYCoordinate,
                card: card
            };
            this.cardsAreMoving.dealerCards[cardIndex] = true;
            /*bind cardMovingFunction to context of blackjack class in order to use class object properties */
            cardMovingFunction = this.moveDealerCard.bind(this);
        }
        /*Deal card loop is a loop that every time when executed make one move of the card on the table
         with movePlayerCard function or moveDealerCard function, redraw table and when card is already
         at right place it removes current card from moving card tracker object*/
        dealCardLoop = () => {
            setTimeout(() => {
                if (cardMovingFunction(cardIndex, destinationXCoordinate, destinationYCoordinate)) {
                    Blackjack.redrawGameTable();
                    dealCardLoop();
                } else {
                    if (isPlayerCard) {
                        this.cardsAreMoving.playerCards[cardIndex] = false;
                    } else {
                        this.cardsAreMoving.dealerCards[cardIndex] = false;
                    }
                    Blackjack.redrawGameTable();
                }
            }, this.cardsAnimationTimeout);
        };

        dealCardLoop.bind(this)();
    }

    /*drawPlayerCards pulls two random cards from the deck, takes deck coordinates and coordinates of player
     cards on table, and passes them as parameters of dealCard */
    drawPlayerCards() {

        let firstCard = this.deck.pullRandomCard(),
            secondCard = this.deck.pullRandomCard(),
            {deckXCoordinate, deckYCoordinate} = this.drawer.getDeckCoordinatesAndSize(),
            {firstXCoordinate, secondXCoordinate, sharedYCoordinate} = this.drawer.getPlayerCardsCoordinates();

        this.dealCard(deckXCoordinate, deckYCoordinate, firstXCoordinate, sharedYCoordinate,
            firstCard, 0, true);
        this.dealCard(deckXCoordinate, deckYCoordinate, secondXCoordinate, sharedYCoordinate,
            secondCard, 1, true);


    }

    /*drawDealerCards pulls three random cards from the deck, takes deck coordinates and coordinates of dealer
     cards on table, and passes them as parameters of dealCard */
    drawDealerCards() {
        let firstCard = this.deck.pullRandomCard(),
            secondCard = this.deck.pullRandomCard(),
            thirdCard = this.deck.pullRandomCard(),
            {deckXCoordinate, deckYCoordinate} = this.drawer.getDeckCoordinatesAndSize(),
            {firstXCoordinate, secondXCoordinate, thirdXCoordinate, sharedYCoordinate} =
                this.drawer.getDealerCardsCoordinates();

        this.dealCard(deckXCoordinate, deckYCoordinate, firstXCoordinate, sharedYCoordinate,
            firstCard, 0, false);
        this.dealCard(deckXCoordinate, deckYCoordinate, secondXCoordinate, sharedYCoordinate,
            secondCard, 1, false);
        this.dealCard(deckXCoordinate, deckYCoordinate, thirdXCoordinate, sharedYCoordinate,
            thirdCard, 2, false);
    }

    /*clickHandler takes care of clicking on screen like at first*/
    clickHandler(event) {
        /*event.pageX is a function that returns click coordinates starting from the most upper left point on the screen
         and in order to change the starting point to be the most upper left point on canvas window we reduce clicked
         coordinate with canvas.offset() (left and top) function*/
        let clickedXCoordinate = event.pageX,
            clickedYCoordinate = event.pageY,
            canvasOffset = this.drawer.canvas.offset();

        clickedXCoordinate -= canvasOffset.left;
        clickedYCoordinate -= canvasOffset.top;
        /*Hhere we check whether click coordinates are over hit button or one of player's card*/
        if (this.handleClickOverButton(clickedXCoordinate, clickedYCoordinate)) {
            /*Check if there is a player card that is moving and if there is until it stops doesn't allow
             other movement and it will prevent for clicking multiple times and making a lot of unnecessary requests*/
            if (this.cardsAreMoving.playerCards.indexOf(true) === -1) {
                /*Remove all player cards on table */
                this.cardsOnTable.playerCards.forEach((value, key) => {
                    if (this.cardsOnTable.playerCards[key]) {
                        this.removeCard(key);
                    }
                });
                /* In interval of 500 miliseconds runs a check if all player cards are removed and if they are
                 draw another two player cards */
                let drawPlayerCardsAfterRemove = setInterval(() => {
                    if (!(this.cardsOnTable.playerCards[0] && this.cardsOnTable.playerCards[1])) {
                        this.drawPlayerCards();
                        clearInterval(drawPlayerCardsAfterRemove);
                    }
                }, 500);
            }
            /*If it is not clicked over button it means that is over player cards*/
        } else {
            /*Check if there is a player card that is moving and if there is until it stops doesn't allow
             other movement and it will prevent for clicking multiple times and making a lot of unnecessary requests*/
            if (this.cardsAreMoving.playerCards.indexOf(true) === -1) {
                /*clickedCardIndex is result of handleClickOverPlayerCard function that returns index of clicked card*/
                let clickedCardIndex = this.handleClickOverPlayerCard(clickedXCoordinate, clickedYCoordinate);
                if (clickedCardIndex === 0 || clickedCardIndex === 1) {
                    this.removeCard(clickedCardIndex);
                }
            }
        }
    }

    /*HandleClickOverPlayerCard checks whether the click is inside first card, second card or outside cards and
     returns index 0 for first card, index 1 for second card or index -1 if it is outside*/
    handleClickOverPlayerCard(clickedXCoordinate, clickedYCoordinate) {
        let cardDimensions = this.drawer.getDeckDimensions(),
            {firstXCoordinate, secondXCoordinate, sharedYCoordinate} = this.drawer.getPlayerCardsCoordinates();
        if (isClickInsideCard(firstXCoordinate, sharedYCoordinate)) {
            return 0;
        } else if (isClickInsideCard(secondXCoordinate, sharedYCoordinate)) {
            return 1;
        } else {
            return -1;
        }
        /*isClickInsideCard checks if click is inside dimensions of first or second card  and if it is returns true else returns false*/
        function isClickInsideCard(cardXCoordinate, cardYCoordinate) {
            if ((clickedXCoordinate >= cardXCoordinate) &&
                (clickedXCoordinate <= cardXCoordinate + cardDimensions.width) &&
                (clickedYCoordinate >= cardYCoordinate) &&
                (clickedYCoordinate <= cardYCoordinate + cardDimensions.height)) {
                return true
            } else {
                return false
            }
        }
    }

    /*handleClickOverButton checks if click is inside hit button and returns true if it is inside and false if it is outside*/
    handleClickOverButton(clickedXCoordinate, clickedYCoordinate) {
        let padding = this.drawer.getCanvasPadding(),
            {
                width: buttonWidth,
                height: buttonHeight
            } = this.drawer.getButtonDimensions(),
            {
                height: canvasHeight
            } = this.drawer.getCanvasSize();

        if ((clickedXCoordinate <= buttonWidth) &&
            (clickedXCoordinate > 0) &&
            (clickedYCoordinate <= canvasHeight / 2 - (padding / 2) + buttonHeight) &&
            (clickedYCoordinate > canvasHeight / 2 - (padding / 2))) {
            return true
        } else {
            return false
        }

    }

    removeCard(cardIndex) {
        /* Exit coordinates are positions of player cards where they will disappear from the screen*/
        let exitXCoordinate = this.drawer.getCardExitCoordinates(cardIndex).exitXCoordinate,
            exitYCoordinate = this.drawer.getCardExitCoordinates(cardIndex).exitYCoordinate,
            removeCardLoop,
            cardMovingFunction;
        console.log('card moving');
        /*Put current card in moving card tracker object and bind cardMovingFunction to context of blackjack class */
        this.cardsAreMoving.playerCards[cardIndex] = true;
        cardMovingFunction = this.movePlayerCard.bind(this);

        /*Remove card loop is a loop that every time when executed make one move of the card on the table
         with movePlayerCard function, redraw table and when card is already at right place it removes
         current card from card holder object and from moving card tracker object*/
        removeCardLoop = () => {
            setTimeout(() => {
                if (cardMovingFunction(cardIndex, exitXCoordinate, exitYCoordinate)) {
                    Blackjack.redrawGameTable();
                    removeCardLoop();
                } else {
                    this.cardsOnTable.playerCards[cardIndex] = undefined;
                    this.cardsAreMoving.playerCards[cardIndex] = false;
                    Blackjack.redrawGameTable();
                }
            }, this.cardsAnimationTimeout);
        };
        /* Bind this in order to be possible using this from the context of blackjack class inside removeCardLoop */
        removeCardLoop.bind(this)();
    }

    /*Move dealer and player cards define the movement from the deck to the right positions of the cards.
     If movement hasn't finished function returns true else if it has finished and card is on the right place returns false */
    movePlayerCard(cardIndex, expectedXPosition, expectedYPosition) {
        let movementSpeed = this.drawer.cardMovementSpeed;
        /*The first if is for diagonal movement and second is for final adjustments of card*/
        if (this.cardsOnTable.playerCards[cardIndex].xCoordinate < expectedXPosition ||
            this.cardsOnTable.playerCards[cardIndex].yCoordinate < expectedYPosition) {
            this.cardsOnTable.playerCards[cardIndex].xCoordinate += movementSpeed + 1;
            this.cardsOnTable.playerCards[cardIndex].yCoordinate += movementSpeed;
            if (this.cardsOnTable.playerCards[cardIndex].xCoordinate > expectedXPosition) {
                this.cardsOnTable.playerCards[cardIndex].xCoordinate = expectedXPosition;
            } else if (this.cardsOnTable.playerCards[cardIndex].yCoordinate > expectedYPosition) {
                this.cardsOnTable.playerCards[cardIndex].yCoordinate = expectedYPosition;
            }
        } else if (this.cardsOnTable.playerCards[cardIndex].yCoordinate > expectedYPosition) {
            this.cardsOnTable.playerCards[cardIndex].yCoordinate -= movementSpeed;
            this.cardsOnTable.playerCards[cardIndex].yCoordinate = expectedYPosition;
        } else {
            return false;
        }
        return true;
    }

    moveDealerCard(cardIndex, expectedXPosition, expectedYPosition) {
        let movementSpeed = this.drawer.cardMovementSpeed;

        /*The first if is for diagonal movement and second is for final adjustments of card*/
        if (this.cardsOnTable.dealerCards[cardIndex].xCoordinate < expectedXPosition ||
            this.cardsOnTable.dealerCards[cardIndex].yCoordinate > expectedYPosition) {
            this.cardsOnTable.dealerCards[cardIndex].xCoordinate += movementSpeed;
            this.cardsOnTable.dealerCards[cardIndex].yCoordinate -= movementSpeed + 0.4;
            if (this.cardsOnTable.dealerCards[cardIndex].xCoordinate > expectedXPosition) {
                this.cardsOnTable.dealerCards[cardIndex].xCoordinate = expectedXPosition;
            } else if (this.cardsOnTable.dealerCards[cardIndex].yCoordinate < expectedYPosition) {
                this.cardsOnTable.dealerCards[cardIndex].yCoordinate = expectedYPosition;
            }
        }
        else if (this.cardsOnTable.dealerCards[cardIndex].yCoordinate < expectedYPosition) {
            this.cardsOnTable.dealerCards[cardIndex].yCoordinate -= movementSpeed;
            this.cardsOnTable.dealerCards[cardIndex].yCoordinate = expectedYPosition;
        }
        else {
            return false;
        }
        return true;
    }

    /*adjustCardsPositions is a method where are defined redraw and resize actions*/
    adjustCardsPositions() {
        /*resize action takes every existing card on the table and it updates it's current x and y coordinates by asking
         * the drawer for current positions of the cards*/
        $(window).on('resize', () => {
            //correct the cards size and position on canvas
            // to match card frames and render (both for dealerCards and playerCards hands)
            //and adjust card movement speed according to the new canvas width
            let firstPlayerCard = this.cardsOnTable.playerCards[0],
                secondPlayerCard = this.cardsOnTable.playerCards[1],
                firstDealerCard = this.cardsOnTable.dealerCards[0],
                secondDealerCard = this.cardsOnTable.dealerCards[1],
                thirdDealerCard = this.cardsOnTable.dealerCards[2];

            if (firstPlayerCard) {
                firstPlayerCard.xCoordinate = this.drawer.getPlayerCardsCoordinates().firstXCoordinate;
                firstPlayerCard.yCoordinate = this.drawer.getPlayerCardsCoordinates().sharedYCoordinate;
            }

            if (secondPlayerCard) {
                secondPlayerCard.xCoordinate = this.drawer.getPlayerCardsCoordinates().secondXCoordinate;
                secondPlayerCard.yCoordinate = this.drawer.getPlayerCardsCoordinates().sharedYCoordinate;
            }

            if (firstDealerCard) {
                firstDealerCard.xCoordinate = this.drawer.getDealerCardsCoordinates().firstXCoordinate;
                firstDealerCard.yCoordinate = this.drawer.getDealerCardsCoordinates().sharedYCoordinate;
            }

            if (secondDealerCard) {
                secondDealerCard.xCoordinate = this.drawer.getDealerCardsCoordinates().secondXCoordinate;
                secondDealerCard.yCoordinate = this.drawer.getDealerCardsCoordinates().sharedYCoordinate;
            }

            if (thirdDealerCard) {
                thirdDealerCard.xCoordinate = this.drawer.getDealerCardsCoordinates().thirdXCoordinate;
                thirdDealerCard.yCoordinate = this.drawer.getDealerCardsCoordinates().sharedYCoordinate;
            }

            Blackjack.redrawGameTable();
        });
        /*redraw action updates canvas size and after that draws button, deck and every existing card on the table.
         Also keep track and check on every draw whether the deck is empty or not and if it is not then draws back of cards
         from the deck sprite*/
        $(window).on('redraw', () => {
            this.drawer.updateCanvasSize();
            this.drawer.drawButton();
            this.cardsOnTable.playerCards.forEach(card => {
                if (card) {
                    this.drawer.drawCard(card);
                }
            });
            this.cardsOnTable.dealerCards.forEach(card => {
                if (card) {
                    this.drawer.drawCard(card);
                }
            });
            let deckRemainingCards = this.deck.cardArray.length;
            if (deckRemainingCards >= 2) {
                this.drawer.drawCardsBackSide();
            }
        });
    }

    /*redrawGameTable triggers redraw action*/
    static redrawGameTable() {
        $(window).trigger('redraw');
    }
}



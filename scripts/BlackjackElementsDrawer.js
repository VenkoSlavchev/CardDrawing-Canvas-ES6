/* Class Drawer cares for drawing (display) elements on canvas. Size, padding and positions are all declared here
* and all of them depend on width or height of canvas window in order to be responsive*/
class Drawer {
    constructor(canvas, canvasContext) {
        this.canvas = canvas;
        this.context = canvasContext;
        this.minCanvasWidth = 500;
        this.canvasWidthResizeIndex = 0.7;   /*canvasWidthResizeIndex and canvasHeightResizeIndex define*/
        this.canvasHeightResizeIndex = 0.6;  /*how much smaller from browser window will be canvas window */
        this.currentCanvasWidth = 0;
        this.currentCanvasHeight = 0;
        this.deckSprite = new Image();
        this.deckSprite.src = 'images/DeckOfCards.gif';
        this.cardMovementSpeed = 3; /*movement speed is in pixels*/
    }

/*getCardSizeFromSprite is static method because it is the same for every instance of the class and it defines size of
* one card from the sprite*/
    static getCardSizeFromSprite() {
        return {
            width: 81,
            height: 117.5
        };
    }

    /*getCardSpriteCoordinates defines positions (row and column) of different cards in the sprite*/
    static getCardSpriteCoordinates(card) {
        let spriteSuitsRowIndex,
            spriteFacesColumnIndex;

        switch (card.suit) {
            case '\u2665':
                spriteSuitsRowIndex = 0;
                break;
            case '\u2666':
                spriteSuitsRowIndex = 1;
                break;
            case '\u2660':
                spriteSuitsRowIndex = 2;
                break;
            case '\u2663':
                spriteSuitsRowIndex = 3;
                break;
            default:
                break;
        }

        switch (card.face) {
            case 'J':
                spriteFacesColumnIndex = 9;
                break;
            case 'Q':
                spriteFacesColumnIndex = 10;
                break;
            case 'K':
                spriteFacesColumnIndex = 11;
                break;
            case 'A':
                spriteFacesColumnIndex = 12;
                break;
            default:
                spriteFacesColumnIndex = Number(card.face) - 2;
                break;
        }

        return {
            spriteFacesColumnIndex,
            spriteSuitsRowIndex
        }
    }

    getCanvasSize() {
        return {
            width: this.canvas.width(),
            height: this.canvas.height()
        }
    }

    getCanvasPadding() {
        return this.canvas.height() * 0.04;
    }

    getDeckDimensions() {
        let deckWidth = this.canvas.width() * 0.1;

        return {
            width: deckWidth,
            height: deckWidth * 1.5
        }
    }

    getDeckCoordinatesAndSize() {
        let {width, height} = this.getDeckDimensions(),
            deckXCoordinate = width + this.getCanvasPadding(),
            deckYCoordinate = this.canvas.height() / 2.5;

        return {
            deckXCoordinate,
            deckYCoordinate,
            width,
            height
        }
    }

    getButtonDimensions() {
        let buttonWidth = this.getDeckDimensions().width,
            buttonHeight = buttonWidth * 0.5;

        return {
            width: buttonWidth,
            height: buttonHeight
        }
    }

    drawButton() {
        let ctx = this.context,
            padding = this.getCanvasPadding(),
            buttonDimensions = this.getButtonDimensions(),
            {width: buttonWidth, height: buttonHeight} = buttonDimensions,
            xCoordinate = this.getDeckCoordinatesAndSize().deckXCoordinate - (buttonWidth + padding),
            yCoordinate = this.getDeckCoordinatesAndSize().deckYCoordinate + (this.getDeckCoordinatesAndSize().height / 3);

        ctx.rect(
            xCoordinate,
            yCoordinate,
            buttonWidth,
            buttonHeight
        );

        ctx.font = `${buttonHeight}px Arial`;
        ctx.strokeStyle = 'white';
        ctx.stroke();
        ctx.fillStyle = 'white';
        ctx.fillText('HIT', xCoordinate + (buttonWidth / 10), yCoordinate + (buttonHeight*0.88));

    }

    drawCardsBackSide() {
        let spriteCardSizes = Drawer.getCardSizeFromSprite(),
        deckCoordinates = this.getDeckCoordinatesAndSize();

        this.context.drawImage(
            this.deckSprite,
            0,
            spriteCardSizes.height * 4,
            spriteCardSizes.width,
            spriteCardSizes.height,
            deckCoordinates.deckXCoordinate,
            deckCoordinates.deckYCoordinate,
            deckCoordinates.width,
            deckCoordinates.height
        );
    }

    drawCard(cardInfo) {
        let ctx = this.context,
        {spriteSuitsRowIndex, spriteFacesColumnIndex} = Drawer.getCardSpriteCoordinates(cardInfo.card),
        {width: spriteCardWidth, height: spriteCardHeight} = Drawer.getCardSizeFromSprite(),
        {width: cardWidth, height: cardHeight} = this.getDeckDimensions();


        ctx.drawImage(
            this.deckSprite,
            spriteCardWidth * spriteFacesColumnIndex,
            spriteCardHeight * spriteSuitsRowIndex,
            spriteCardWidth,
            spriteCardHeight,
            cardInfo.xCoordinate,
            cardInfo.yCoordinate,
            cardWidth,
            cardHeight
        );
    }

    /* Both dealer cards and player cards coordinates are related to canvas window size*/
    getDealerCardsCoordinates() {
        let deckDimensions = this.getDeckDimensions(),
            currentCanvasWidth = this.canvas.width(),
            middleOfCanvasWidth = currentCanvasWidth / 2,
            padding = this.getCanvasPadding(),
            firstCardXCoordinate = middleOfCanvasWidth - (deckDimensions.width / 2),
            secondCardXCoordinate = (middleOfCanvasWidth + padding) + (deckDimensions.width * 0.5),
            thirdCardXCoordinate = (middleOfCanvasWidth - padding) - (deckDimensions.width * 1.5),
            sharedCardsYCoordinate = this.canvas.height() / 100;

        return {
            firstXCoordinate: firstCardXCoordinate,
            secondXCoordinate: secondCardXCoordinate,
            thirdXCoordinate: thirdCardXCoordinate,
            sharedYCoordinate: sharedCardsYCoordinate
        }
    }

    getPlayerCardsCoordinates() {
        let deckDimensions = this.getDeckDimensions(),
            padding = this.getCanvasPadding(),
            currentCanvasWidth = this.canvas.width(),
            firstCardXCoordinate = currentCanvasWidth / 2 - (deckDimensions.width + (padding / 2)),
            secondCardXCoordinate = currentCanvasWidth / 2 + (padding / 2),
            sharedYCoordinate = this.canvas.height() - (deckDimensions.height);

        return {
            firstXCoordinate: firstCardXCoordinate,
            secondXCoordinate: secondCardXCoordinate,
            sharedYCoordinate: sharedYCoordinate
        }
    }
    /* Exit cards coordinates are for the animation of players cards. They disappear from those exit
    points, different for each card */
    getCardExitCoordinates(cardIndex) {
        let exitYCoordinate = this.canvas.height(),
            exitXCoordinate = undefined;

        if (cardIndex) {
            exitXCoordinate = this.getPlayerCardsCoordinates().secondXCoordinate;
        } else {
            exitXCoordinate = this.getPlayerCardsCoordinates().firstXCoordinate;
        }

        return {
            exitXCoordinate,
            exitYCoordinate
        }

    }

    updateCanvasSize() {
        let expectedCanvasWidthAfterResize =
            window.innerWidth * this.canvasWidthResizeIndex;

        if (expectedCanvasWidthAfterResize < this.minCanvasWidth) {
            this.currentCanvasWidth = this.minCanvasWidth;
            this.currentCanvasHeight =
                this.minCanvasWidth * this.canvasHeightResizeIndex;
        } else {
            this.currentCanvasWidth = expectedCanvasWidthAfterResize;
            this.currentCanvasHeight =
                expectedCanvasWidthAfterResize * this.canvasHeightResizeIndex;
        }
        this.context.canvas.width = this.currentCanvasWidth;
        this.context.canvas.height = this.currentCanvasHeight;
    }




}

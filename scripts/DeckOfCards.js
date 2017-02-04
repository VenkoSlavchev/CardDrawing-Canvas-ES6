/* Class Deck represents a deck of cards structured in array of 52 instances of class Card  */
class Deck {
    constructor() {
        this.cardArray = [];
    }
/*Here is the filling of the deck*/
    fillDeckWithCards() {
        this.cardArray = [];
        let suits = ['S', 'H', 'D', 'C'];
        let faces = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

        suits.forEach(suit => {
            faces.forEach(face => {
                this.cardArray.push(new Card(face, suit));
            })
        })
    }
/*Here is the pulling of random card from the deck*/
    pullRandomCard() {
        let numberOfCardsInDeck = this.cardArray.length;
        if (numberOfCardsInDeck) {
            let randomCardIndex = Math.floor(Math.random() * numberOfCardsInDeck);
            let pickedCard = this.cardArray[randomCardIndex];
            this.cardArray.splice(randomCardIndex, 1);
            return pickedCard;
        }

        return undefined;
    }
}

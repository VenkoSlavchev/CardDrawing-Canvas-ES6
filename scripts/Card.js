/* Class Card represents a playing card from real world. It has 2 properties - suit and face. You can set card
only in boundaries of a real existing card and it will throw error if you try to create for example card with
face 1 */
class Card {
    constructor(face, suit) {
        try {
            this.face = face;
            this.suit = suit;
        } catch (ex) {
            throw new Error(`Invalid card: ${face + suit}`);
        }
    }
/* The check for creating correct card is on the two places that you can create card - through constructor or
 in the setters of the properties */
    set suit(suit) {
        let suits = {
            S: '\u2660',
            H: '\u2665',
            D: '\u2666',
            C: '\u2663'
        };
        if (!suits[suit]) {
            throw new Error;
        }
        this._suit = suits[suit];
    }

    set face(face) {
        let faces = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        if (!faces.includes(face)) {
            throw new Error;
        }
        this._face = face;
    }


    get face() {
        return this._face;
    }

    get suit() {
        return this._suit;
    }

}
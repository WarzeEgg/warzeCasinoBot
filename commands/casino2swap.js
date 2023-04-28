const { registerCommand } = require("../commands");
const { C2Deck } = require("../utils/casino2deck");
const { changeBalance } = require("../utils/currency");
const { emojis } = require("../utils/emojis");
const { getNums } = require("../utils/numchoice");
const { send } = require("../utils/sender");

function casino2CardSwap(message, indices = "") {
	const cgame = ongoing_games[message.author.id];
	indices = getNums(indices)

	if (cgame && cgame.type === 'casino2') {

		// The player can only swap once per game
		if (cgame.state.player1.swapped) {
			send(message, 'You already swapped this round!');
			return;
		}

		// Toggle all cards at indices
		indices.forEach((index) => {
			if (index >= 1 && index <= 5) {
				cgame.state.player1.deck.toggleSingleCard(index - 1);
			}
		})

		// Send the current deck
		cgame.state.player1.deck.canvas(message);

		cgame.state.player1.deck.cardSwap();
		cgame.state.player1.swapped = true;

		// Send the current deck after swapping
		cgame.state.player1.deck.canvas(message);

		setTimeout(function() {
			const aideck = new C2Deck();
			
			aideck.autoSolve(message).then((score) => {
				const opponent_score = score;
				const your_score = cgame.state.player1.deck.getScore();
				
				setTimeout(() => {
					// Decide who won
					const bet_win = cgame.state.player1.bet;
					if (your_score === opponent_score) {
						// Tie
						send(message, `${emojis.geizeangry} We tied...? Impossible. (**+0** ${emojis.diamond})`);
						changeBalance(message.author.id, bet_win);
					} else if (your_score > opponent_score) {
						// Win
						send(message, `${emojis.geizesleep} You won... this time. (**+${bet_win}** ${emojis.diamond})`);
						changeBalance(message.author.id, bet_win * 2)
					} else {
						// Loss
						send(message, `${emojis.geizehappy} Ya lost, DUMBASS!`);
					}
					// Delete ongoing game
					delete ongoing_games[message.author.id];
				}, 500);
			});
		}, 500);

	}
}
registerCommand(casino2CardSwap, "Swap your cards during the Casino 2 game.", ['swap'], "[cardnumbers]");
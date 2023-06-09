const { registerCommand } = require("../commands");
const { db } = require("../utils/db");
const { send } = require("../utils/sender");
const { getPrefix } = require("../utils/getprefix");
const { parseUser } = require("../utils/usertarget");

function cmdShowInventory(message, target) {
    // Set self as target if not provided
    target = parseUser(target, message.author.id);
    if (!target) {
        send(message, `Invalid target`);
        return;
    }

	// This command does nothing except for return this message
    let cards_str = '';
    let decks_str = '';
    let chips_str = '';
    db.get('SELECT bought FROM shop WHERE id = ?', [target], (err, row) => {
        if (err) {
            console.log(err.message);
            return;
        }

        // Order depending on the type of shop item
        if (row) {
            cards_str += row.bought.split(',').filter((i) => !i.endsWith('deck') && !i.startsWith('chip')).join(',');
            decks_str += row.bought.split(',').filter((i) => i.endsWith('deck')).join(',');
            chips_str += row.bought.split(',').filter((i) => i.startsWith('chip')).join(',');
        }

        db.get('SELECT owned FROM customcard WHERE id = ?', [target], (err, row) => {
            if (err) {
                console.log(err.message);
                return;
            }

            if (row) {
                cards_str += `,${row.owned}`;
            }

            db.get('SELECT owned FROM customdeck WHERE id = ?', [target], (err, row) => {
                if (err) {
                    console.log(err.message);
                    return;
                }

                if (row) {
                    decks_str += `,${row.owned}`;
                }

                getPrefix(target).then((prefix) => {
                    let rendered_string = `<@${target}>**'s Inventory:**\n\n`;

                    rendered_string += `__**Cards:**__\n`;

                    rendered_string += `*${prefix}setcard* **normal**\n`;
                    cards_str.split(',').forEach((cardid) => {
                        if (cardid !== '') {
                            rendered_string += `*${prefix}setcard* **${cardid}**\n`;
                        }
                    });

                    rendered_string += `__**Decks:**__\n`;

                    rendered_string += `*${prefix}setdeck* **normal**\n`;
                    decks_str.split(',').forEach((deckid) => {
                        if (deckid !== '') {
                            rendered_string += `*${prefix}setdeck* **${deckid}**\n`;
                        }
                    })

                    rendered_string += `__**Chips:**__\n`;

                    rendered_string += `*${prefix}setchip* **normal**\n`;
                    chips_str.split(',').forEach((chipid) => {
                        if (chipid !== '') {
                            rendered_string += `*${prefix}setchip* **${chipid}**\n`;
                        }
                    })
                    send(message, rendered_string);
                })
            })
        })
    })
}

// Register the command as this function with the description "Sample command", aliases ['sample', 'smpl'] and arguments
registerCommand(cmdShowInventory, "Shows which cards and decks you own", ['inventory', 'inv', 'i', 'cards'], "[@user?]", false, false);
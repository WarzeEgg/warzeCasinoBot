const { registerCommand } = require("../commands");
const { db } = require("../utils/db");
const emojis = require('../emojis.json');
const { send } = require("../utils/sender");
const { secToReadable } = require("../utils/timestr");
const { changeBalance } = require("../utils/currency");
const { changeChests } = require("../utils/chests");
const { getSecUntilReward } = require("../utils/timereward");

// Amount of diamonds the daily command grants
const daily_amount = 1000;

function daily(message) {
    // Target is always author
    const target = message.author.id;

    getSecUntilReward(target, 'dailies', 86400).then((secTillDaily) => {
        // Prevent the user from collecting their daily
        if (secTillDaily > 0) {
            send(message, `<@${target}>, you need to wait **${secToReadable(secTillDaily)}**.`);
            return
        }
            
        // Reward the user with their hard-earned daily diamonds
        const resulting_balance_change = daily_amount;
        changeBalance(target, resulting_balance_change).then(() => {
            send(message, `<@${target}>, you collected: **${daily_amount}** ${emojis.diamond} and **3** ${emojis.redchest}`);
        })
        changeChests(target, 3, 'red')
        
        // Apply a timer that the user has to wait before collecting the next daily
        const now = Math.floor(Date.now() / 1000);
        db.run('UPDATE dailies SET last = ? WHERE id = ?', [now, target], (err) => {
            if (err) {
                console.log(err.message);
            }
        })
    })
}
registerCommand(daily, "Collect 1000 diamonds and 3 red chests everyday", ['daily', 'd']);
const { db } = require("./db");

// Seconds to wait after collecting daily
const sec_daily = 86400;

function getSecUntilDaily(target) {
    return new Promise((resolve) => {
        // Insert user into dailies db if not exists
        db.run('INSERT OR IGNORE INTO dailies (id) VALUES (?)', [target], (err) => {
            if (err) {
                console.log(err.message);
                return;
            }

            db.get('SELECT last FROM dailies WHERE id = ?', [target], (err, row) => {
                if (err) {
                    console.error(err.message);
                    return;
                }
        
                const now = Math.floor(Date.now() / 1000);
                const last = row ? row.last : 0;
        
                resolve(last + sec_daily - now)
            })
        })
    })
}
exports.getSecUntilDaily = getSecUntilDaily;
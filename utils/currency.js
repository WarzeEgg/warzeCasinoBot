const { db, createRowIfNotExists } = require("./db");

// Check if the target has enough coins for a transaction
function checkIfLarger(target, comparedAmount) {
    if (comparedAmount < 0) {
        return true;
    }
    return new Promise((resolve) => {
        db.get('SELECT balance FROM users WHERE id = ?', [target], (err, row) => {
            if (err) {
                console.error(err.message);
                return;
            }
    
            const balance = row ? row.balance : 0;

            resolve(balance >= comparedAmount)
        });
    })
}
exports.checkIfLarger = checkIfLarger;

// Changes the targets balance by any amount, does not take into account if they end up with negative money 
function changeBalance(target, changeAmount) {
    return new Promise((resolve) => {
        createRowIfNotExists(target, 'users');
        
        db.run('UPDATE users SET balance = balance + ? WHERE id = ?', [changeAmount, target], (err) => {
            if (err) {
                console.log(err.message);
                return;
            }
            resolve(true)
        });
    });
}
exports.changeBalance = changeBalance;

// Set the targets balance by any amount
function setBalance(target, setAmount) {
    return new Promise((resolve) => {
        createRowIfNotExists(target, 'users');
        
        db.run('UPDATE users SET balance = ? WHERE id = ?', [setAmount, target], (err) => {
            if (err) {
                console.log(err.message);
                return;
            }
            resolve(true)
        });
    });
}
exports.setBalance = setBalance;
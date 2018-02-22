const kb = require('./keyboard-buttons')

module.exports = {
    home: [
        [kb.home.exchange, kb.home.calculator]
    ],
    currencies: [
        {text: kb.currencies.usd, callback_data: 'usd'},
        {text: kb.currencies.eur, callback_data: 'eur'},
        {text: kb.currencies.rub, callback_data: 'rub'},
        {text: kb.currencies.cny, callback_data: 'cny'}
    ]
}

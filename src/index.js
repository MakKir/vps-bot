const TelegramBot = require('node-telegram-bot-api');
const config = require('./config');
const helper = require('./helper');
const keyboard = require('./keyboard');
const kb = require('./keyboard-buttons');
const request = require('request');

helper.logStart();


const bot = new TelegramBot(config.TOKEN, {
    polling: true
});

let currencyCommand,
    calcCommand = false;
let currName,
    currAmount;

bot.on('message', msg => {
    const chatId = helper.getChatId(msg);

    let text = msg.text;


    switch(text) {
        case kb.home.exchange:
            bot.sendMessage(chatId, 'Напишите название валюты на английском языке');
            currencyCommand = true;
            calcCommand = false;
            break;
        case kb.home.calculator:
            bot.sendMessage(chatId, 'Введите нужное количество валюты (например, 0.006 Bitcoin)');
            calcCommand = true;
            currencyCommand = false;
            break;
        case '/start':
            currencyCommand = false;
            calcCommand = false;
            break;
        default:
            if(currencyCommand) {
                currName = text;
                bot.sendMessage(chatId, `Показать цену в...`, {
                    reply_markup: {inline_keyboard: [keyboard.currencies]}
                })
            }
            if(calcCommand) {
                const calcData = text.split(' ');
                if(calcData.length !== 2) bot.sendMessage(chatId, 'Произошла ошибка! Попробуйте еще раз');
                bot.sendMessage(chatId, `Показать цену в...`, {
                    reply_markup: {inline_keyboard: [keyboard.currencies]}
                });
                currAmount = calcData[0];
                currName = calcData[1];
            }
    }

});

bot.onText(/\/start/, msg => {
    const chatId = helper.getChatId(msg);
    const text = 'Выберите команду';
    bot.sendMessage(chatId, text, {
        reply_markup: {
            keyboard: keyboard.home,
            resize_keyboard: true
        }
    });
});

bot.on('callback_query', query => {
    let currencyToConvert = query.data;
    sendRequest(query.message.chat.id, currName, currencyToConvert, config.REQUEST_URL);
});

function sendRequest(chatId, currName, currencyToConvert, url) {
    let query = url + currName.toLowerCase() + '/?convert=' + currencyToConvert;
    request(query, function (error, response, body) {
        const data = JSON.parse(body);
        if(data.error)  bot.sendMessage(chatId, 'Валюта не найдена');

        if(response.statusCode === 200) {
            const currency = data[0];
            const convPrice = 'price_' + currencyToConvert;
            let symbol,
                sum,
                amount;
            switch(currencyToConvert) {
                case 'usd':
                    symbol = '$';
                    break;
                case 'eur':
                    symbol = '€'
                    break;
                case 'rub':
                    symbol = '₽'
                    break;
                case 'cny':
                    symbol = '¥'
                    break;
            }

            if(calcCommand) {
                sum = currAmount * currency[convPrice];
                amount = currAmount;
            }
            else {
                sum = currency[convPrice];
                amount = 1;
            }
            sum = (+sum).toFixed(2);
            const name = currency.name.charAt(0).toUpperCase() + currency.name.slice(1);
            const html = `${amount} <b> ${name}</b> - ${sum} ${symbol}`;
            bot.sendMessage(chatId, html, {
                parse_mode: 'HTML'
            });
        }

    });
}

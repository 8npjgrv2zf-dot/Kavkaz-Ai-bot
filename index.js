const https = require('https');
const http = require('http');

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;
const PORT = process.env.PORT || 3000;

const userData = {};

const MENU = [
  ['🚀 Старт'],
  ['🏔 Подобрать маршрут'],
  ['🚙 Найти гида', '💰 Рассчитать бюджет'],
  ['📍 Лучшие места', '🧳 Что взять с собой'],
  ['❓ FAQ', '📞 Связаться']
];

function sendMessage(chatId, text) {
  const data = JSON.stringify({
    chat_id: chatId,
    text,
    reply_markup: {
      keyboard: MENU,
      resize_keyboard: true
    }
  });

  const req = https.request({
    hostname: 'api.telegram.org',
    path: `/bot${BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  });

  req.on('error', console.error);
  req.write(data);
  req.end();
}

function handleMessage(chatId, text) {
  if (text === '/start' || text === '🚀 Старт') {
    delete userData[chatId];
    sendMessage(chatId, '🏔 Kavkaz AI Travel\n\nВыберите действие:');
    return;
  }

  if (text === '🏔 Подобрать маршрут') {
    userData[chatId] = { step: 1 };
    sendMessage(chatId, '1/6. Из какого города вы выезжаете?');
    return;
  }

  if (text === '🚙 Найти гида') {
    sendMessage(chatId, '🚙 Чтобы подобрать гида, сначала нажмите: 🏔 Подобрать маршрут');
    return;
  }

  if (text === '💰 Рассчитать бюджет') {
    sendMessage(chatId, '💰 Бюджет по Кавказу:\n\nЭконом: 35–50 тыс ₽\nКомфорт: 50–90 тыс ₽\nПремиум: от 90 тыс ₽');
    return;
  }

  if (text === '📍 Лучшие места') {
    sendMessage(chatId, '📍 Лучшие места:\n\nСулакский каньон\nДербент\nГамсутль\nГрозный\nДжейрах\nДаргавс\nЦей');
    return;
  }

  if (text === '🧳 Что взять с собой') {
    sendMessage(chatId, '🧳 Возьмите:\n\nпаспорт\nудобную обувь\nтёплую одежду\nналичные\nпауэрбанк');
    return;
  }

  if (text === '❓ FAQ') {
    sendMessage(chatId, '❓ FAQ\n\nЛучший сезон: май–октябрь.\nС детьми можно.\nГид для горных маршрутов желателен.');
    return;
  }

  if (text === '📞 Связаться') {
    sendMessage(chatId, '📞 Администратор: @Kavkaz_AI_travel');
    return;
  }

  const data = userData[chatId];

  if (!data) {
    sendMessage(chatId, 'Нажмите 🚀 Старт или 🏔 Подобрать маршрут.');
    return;
  }

  if (data.step === 1) {
    data.city = text;
    data.step = 2;
    sendMessage(chatId, '2/6. Какие даты поездки?');
    return;
  }

  if (data.step === 2) {
    data.dates = text;
    data.step = 3;
    sendMessage(chatId, '3/6. Сколько человек едет?');
    return;
  }

  if (data.step === 3) {
    data.people = text;
    data.step = 4;
    sendMessage(chatId, '4/6. Бюджет на человека?');
    return;
  }

  if (data.step === 4) {
    data.budget = text;
    data.step = 5;
    sendMessage(chatId, '5/6. Что интересно? Горы, история, еда, джип-туры, фото?');
    return;
  }

  if (data.step === 5) {
    data.interests = text;
    data.step = 6;
    sendMessage(chatId, '6/6. Какие регионы интересны?');
    return;
  }

  if (data.step === 6) {
    data.regions = text;

    const route =
      '🏔 Ваш маршрут Kavkaz AI Travel\n\n' +
      `Город: ${data.city}\n` +
      `Даты: ${data.dates}\n` +
      `Людей: ${data.people}\n` +
      `Бюджет: ${data.budget}\n` +
      `Интересы: ${data.interests}\n` +
      `Регионы: ${data.regions}\n\n` +
      'День 1: прибытие и размещение\n' +
      'День 2: горный маршрут\n' +
      'День 3: исторические места\n' +
      'День 4: джип-тур\n' +
      'День 5: свободное время и выезд\n\n' +
      '🚙 Для подбора гида нажмите: 🚙 Найти гида';

    sendMessage(chatId, route);

    sendMessage(
      ADMIN_ID,
      '🔥 Новая заявка туриста\n\n' +
      `Город: ${data.city}\n` +
      `Даты: ${data.dates}\n` +
      `Людей: ${data.people}\n` +
      `Бюджет: ${data.budget}\n` +
      `Интересы: ${data.interests}\n` +
      `Регионы: ${data.regions}\n` +
      `Telegram ID: ${chatId}`
    );

    delete userData[chatId];
  }
}

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Kavkaz AI Travel Bot is running');
    return;
  }

  if (req.method === 'POST') {
    let body = '';

    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const update = JSON.parse(body);
        if (update.message && update.message.text) {
          handleMessage(update.message.chat.id, update.message.text.trim());
        }
      } catch (e) {
        console.error(e);
      }

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('ok');
    });

    return;
  }

  res.writeHead(200);
  res.end('ok');
});

server.listen(PORT, () => {
  console.log('Kavkaz AI Travel Bot running on port ' + PORT);
});

const https = require('https');

const BOT_TOKEN = '8146981663:AAEQkwJuCGPVwXU4rGIgWEjDAsdf_B83gqo';
const ADMIN_ID = '8759424842';

const userData = {};

function sendMessage(chatId, text) {
  const data = JSON.stringify({
    chat_id: chatId,
    text: text,
    reply_markup: {
      keyboard: [
        ['🏔 Подобрать маршрут'],
        ['🚙 Найти гида', '💰 Рассчитать бюджет'],
        ['📍 Лучшие места', '🧳 Что взять с собой'],
        ['👨‍💼 Добавить гида'],
        ['❓ FAQ', '📞 Связаться']
      ],
      resize_keyboard: true
    }
  });

  const options = {
    hostname: 'api.telegram.org',
    path: /bot${BOT_TOKEN}/sendMessage,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  const req = https.request(options);
  req.write(data);
  req.end();
}

const http = require('http');
const server = http.createServer((req, res) => {
  if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const update = JSON.parse(body);
        if (update.message && update.message.text) {
          const chatId = String(update.message.chat.id);
          const text = update.message.text.trim();
          const firstName = update.message.from.first_name || 'путешественник';

          if (text === '/start' || text === '🚀 Старт') {
            delete userData[chatId];
            sendMessage(chatId, `🏔 Добро пожаловать, ${firstName}!\n\nВыберите действие:`);
          } else if (text === '🏔 Подобрать маршрут') {
            userData[chatId] = { step: 1 };
            sendMessage(chatId, '1/6. Из какого города вы выезжаете?');
          } else if (text === '💰 Рассчитать бюджет') {
            sendMessage(chatId, '💰 Эконом: 35 000–50 000 ₽\nКомфорт: 50 000–80 000 ₽\nПремиум: от 90 000 ₽');
          } else if (text === '📍 Лучшие места') {
            sendMessage(chatId, '📍 Топ мест:\n🏔 Сулакский каньон\n🏰 Дербент\n⛰ Гамсутль\n🕌 Грозный\n🗼 Джейрах\n🏔 Эльбрус');
          } else if (text === '🧳 Что взять с собой') {
            sendMessage(chatId, '🧳 Паспорт, удобная обувь, тёплая кофта, наличные, пауэрбанк, солнцезащитные очки');
          } else if (text === '❓ FAQ') {
            sendMessage(chatId, '❓ Безопасно? Да.\nС детьми? Да.\nСезон? Май–октябрь.\nНужен гид? Желательно.');
          } else if (text === '📞 Связаться') {
            sendMessage(chatId, '📞 Telegram: @Kavkaz_AI_travel');
          } else if (text === '🚙 Найти гида') {
            sendMessage(chatId, '🚙 Сначала заполните анкету.\nНажмите: 🏔 Подобрать маршрут');
          } else if (text === '👨‍💼 Добавить гида') {
            sendMessage(chatId, '👨‍💼 Для регистрации напишите: @Kavkaz_AI_travel');
          } else if (userData[chatId]) {
            const d = userData[chatId];
            const steps = ['city','dates','people','budget','interests','regions'];
            const questions = [
              '2/6. Какие даты поездки?',
              '3/6. Сколько человек?',
              '4/6. Бюджет на человека?',
              '5/6. Что интересно? (Горы/История/Еда/Джип-туры)',
              '6/6. Какие регионы? (Дагестан/Чечня/Ингушетия/Осетия)'
            ];
            d[steps[d.step - 1]] = text;
            if (d.step < 6) {
              d.step++;
              sendMessage(chatId, questions[d.step - 2]);
            } else {
              sendMessage(chatId, `✅ Маршрут подобран!\n\nГород: ${d.city}\nДаты: ${d.dates}\nЛюдей: ${d.people}\nБюджет: ${d.budget}\nИнтересы: ${d.interests}\nРегионы: ${d.regions}\n\nСвяжитесь с нами: @Kavkaz_AI_travel`);
              sendMessage(ADMIN_ID, `🔥 Новая заявка!\nГород: ${d.city}\nДаты: ${d.dates}\nЛюдей: ${d.people}\nБюджет: ${d.budget}\nID: ${chatId}`);
              delete userData[chatId];
            }
          } else {
            sendMessage(chatId, '🤔 Воспользуйтесь меню.');
          }
        }
      } catch(e) {}
      res.end('ok');
    });
  } else {
    res.end('Bot is running');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Bot running on port ${PORT}`));

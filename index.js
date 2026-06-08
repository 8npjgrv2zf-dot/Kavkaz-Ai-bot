const https = require('https');
const http = require('http');

const BOT_TOKEN = process.env.8146981663:AAEQkwJuCGPVwXU4rGIgWEjDAsdf_B83gqo;
const ADMIN_ID = '8759424842';
const userData = {};

function sendMessage(chatId, text, keyboard) {
  const markup = keyboard ? {
    keyboard: keyboard,
    resize_keyboard: true
  } : { remove_keyboard: true };

  const data = JSON.stringify({
    chat_id: chatId,
    text: text,
    reply_markup: markup
  });

  const req = https.request({
    hostname: 'api.telegram.org',
    path: '/bot' + BOT_TOKEN + '/sendMessage',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  });
  req.write(data);
  req.end();
}

const MENU = [
  ['Podborat marshrut'],
  ['Nayti gida', 'Rasschitat byudzhet'],
  ['Luchshie mesta', 'Chto vzyat'],
  ['Dobavit gida'],
  ['FAQ', 'Svyazatsya']
];

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
          const name = update.message.from.first_name || 'drug';

          if (text === '/start') {
            delete userData[chatId];
            sendMessage(chatId, 'Dobro pozhalovat, ' + name + '! Vyberi deystvie:', MENU);
          } else if (text === 'Podborat marshrut') {
            userData[chatId] = { step: 1 };
            sendMessage(chatId, '1/6. Iz kakogo goroda vy vyezzhaete?', MENU);
          } else if (text === 'Rasschitat byudzhet') {
            sendMessage(chatId, 'Ekonom: 35000-50000 rub\nKomfort: 50000-80000 rub\nPremium: ot 90000 rub', MENU);
          } else if (text === 'Luchshie mesta') {
            sendMessage(chatId, 'Top mest:\n- Sulakskiy kanyon\n- Derbent\n- Grozny\n- Dzheyrah\n- Elbrus', MENU);
          } else if (text === 'FAQ') {
            sendMessage(chatId, 'Bezopasno? Da.\nS detmi? Da.\nSezon? May-oktyabr.', MENU);
          } else if (text === 'Svyazatsya') {
            sendMessage(chatId, 'Telegram: @Kavkaz_AI_travel', MENU);
          } else if (text === 'Nayti gida') {
            sendMessage(chatId, 'Snachala zapolnite anketu. Nazhmite: Podborat marshrut', MENU);
          } else if (text === 'Dobavit gida') {
            sendMessage(chatId, 'Dlya registracii napishite: @Kavkaz_AI_travel', MENU);
          } else if (text === 'Chto vzyat') {
            sendMessage(chatId, 'Vozmi s soboy:\n- Pasport\n- Udobnuyu obuv\n- Teplye veshi\n- Nalichnye\n- Powerbank', MENU);
          } else if (userData[chatId]) {
            const d = userData[chatId];
            const fields = ['city','dates','people','budget','interests','regions'];
            const questions = [
              '2/6. Kakie daty poezdki?',
              '3/6. Skolko chelovek?',
              '4/6. Byudzhet na cheloveka?',
              '5/6. Chto interesno? (Gory/Istoriya/Eda/Dzhip)',
              '6/6. Kakie regiony? (Dagestan/Chechnya/Ingushetiya/Osetiya)'
            ];
            d[fields[d.step - 1]] = text;
            if (d.step < 6) {
              d.step++;
              sendMessage(chatId, questions[d.step - 2], MENU);
            } else {
              sendMessage(chatId, 'Marshrut podobran!\nGorod: ' + d.city + '\nDaty: ' + d.dates + '\nLyudey: ' + d.people + '\nByudzhet: ' + d.budget + '\n\nSvyazhites: @Kavkaz_AI_travel', MENU);
              sendMessage(ADMIN_ID, 'Novaya zayavka!\nGorod: ' + d.city + '\nDaty: ' + d.dates + '\nLyudey: ' + d.people + '\nID: ' + chatId, null);
              delete userData[chatId];
            }
          } else {
            sendMessage(chatId, 'Vospolzuytes menyu.', MENU);
          }
        }
      } catch(e) { console.log(e); }
      res.end('ok');
    });
  } else {
    res.end('Bot is running');
  }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log('Bot running on port ' + PORT));

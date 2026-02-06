const fs = require('fs')
const request = require('request')
const { Client, RichPresence } = require('discord.js-selfbot-v13')

// El selfbot se puede conectar en 3 cuentas si solo tienes una no pongas las demas
const tokens = [
  "TOKEN 1",
  "TOKEN 2",
  "TOKEN 3"
];

const sleep = ms => new Promise(r => setTimeout(r, ms))
const read = f => fs.readFileSync(f, 'utf8').split('\n').filter(Boolean)

function setStatus(token, text, emojiInput) {
  let name = emojiInput ? emojiInput.trim() : null;
  let id = null;

  if (name && name.includes(':')) {
    const parts = name.split(':');
    name = parts[0];
    id = parts[1];
  }

  request.patch({
    url: 'https://discord.com/api/v10/users/@me/settings',
    headers: { Authorization: token },
    json: {
      custom_status: {
        text,
        emoji_name: name || null,
        emoji_id: id || null
      }
    }
  })
}

async function startAccount(accountToken, index) {
  const client = new Client({ checkUpdate: false })

  const names = ['i love money', 'star', 'rich', 'diamond']
  const states = ['lol', 'lol', 'lol']
  const images = [ 
    'https://cdn.discordapp.com/attachments/1451372487194579065/1469452641875661006/0cf6dcd008c19dedbd458932a787cc8a.gif?ex=6987b5ea&is=6986646a&hm=090f778dbc14a3ad87553d359faf12282e3711d288f478cccbea1a6dace70798&', 
    'https://cdn.discordapp.com/attachments/1451372487194579065/1469452633109565662/ff20a57a8a3053b148ad6c76b4a6bb57.gif?ex=6987b5e8&is=69866468&hm=acdb2d6b0b4e2d61126f206352f745e76257c9b1b2b0e3f42cc686720c73e443&', 
    'https://cdn.discordapp.com/attachments/1451372487194579065/1469452641875661006/0cf6dcd008c19dedbd458932a787cc8a.gif?ex=6987b5ea&is=6986646a&hm=090f778dbc14a3ad87553d359faf12282e3711d288f478cccbea1a6dace70798&'
  ]

  const yt = 'YouTube'
  const tw = 'Twitch'
  let current = yt
  let rpcIndex = 0

  function updateRPC() {
    const rp = new RichPresence(client)
      .setApplicationId('1')
      .setType('STREAMING')
      .setURL('https://twitch.tv/ixnp')
      .setName(current)
      .setDetails(names[rpcIndex % names.length])
      .setState(states[rpcIndex % states.length])
      .setAssetsLargeImage(images[rpcIndex % images.length])

    client.user.setPresence({ activities: [rp], status: 'dnd' })
    current = current === yt ? tw : yt
    rpcIndex++
  }

  async function statusLoop() {
    const texts = read('text.txt')
    const emojis = read('emojis.txt')
    let i = 0
    while (true) {
      setStatus(accountToken, texts[i % texts.length], emojis[i % emojis.length])
      i++
      await sleep(10000) 
    }
  }

  client.on('ready', () => {
    console.log(` Conectado como: ${client.user.tag}`)
    updateRPC()
    setInterval(updateRPC, 15000)
    statusLoop()
  })

  await sleep(index * 3000);
  client.login(accountToken).catch(err => console.error(`Error login: ${err.message}`));
}

console.clear();
console.log(`Iniciando ${tokens.length} cuentas...`);

tokens.forEach((t, i) => {
  startAccount(t, i);
});

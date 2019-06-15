require('dotenv').config();
const axios = require('axios');
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log('Le Bus commence à rouler...');
});

client.on('message', message => {

  if (!message.content.startsWith(process.env.PREFIX) || message.author.bot) return;

  if( (
      message.content.startsWith(process.env.PREFIX + 'verifier') ||
      message.content.startsWith(process.env.PREFIX + 'vérifier')
    ) && !message.author.bot) {

    const args = message.content.trim().split(/ +/);
    args.shift();

    message.delete();

    if(args.length == 0) {
      message.reply('pour vérifier ton compte, tu dois indiquer une clé d\'API valide après la commande : `'+ process.env.PREFIX +'vérifier <clé-api>`. Pour créer une clé API, tu peux visiter cette page sur le site officiel : https://account.arena.net/applications/create. Seule l\'autorisation par défaut _account_ est requise.');
      return;
    }

    const token = args[0];

    axios.get(`${process.env.GW2_API_URL}/build`)
      .then((res) => {

        axios.get(`${process.env.GW2_API_URL}/account?access_token=${token}`)
          .then((res) => {

            if(typeof(res.data.name) == 'undefined') {
              return message.reply('impossible de récupérer ton nom de compte et donc de vérifier ton compte.');
            }

            if(typeof(res.data.guilds) !== 'undefined') {
              var guilds = res.data.guilds;

              if(guilds.indexOf(process.env.GW2_LBM_ID) >= 0) {
                message.member.addRole(process.env.DISCORD_ROLE_LBM)
              }
            }

            message.member.addRole(process.env.DISCORD_ROLE_VERIFIED);
            message.member.setNickname(res.data.name);

            return message.reply('ton compte a bien été vérifié ! Nous te souhaitons la bienvenue à bord du Bus.');

          })
          .catch((e) => {
            console.log(e);
            return message.reply('cette clé d\'API semble incorrecte. Merci vérifier la clé d\'API utilisée avant de réessayer.');
          });

      })
      .catch((e) => {
        console.log(e);
        return message.reply('l\'API ne semble pas disponible, il n\'est donc pas possible de vérifier ton compte pour le moment. Merci de réessayer un peu plus tard ou de contacter un des membres de l\'équipe du Bus Magique.');
      });

	}

  return;

});

client.login(process.env.BOT_TOKEN);

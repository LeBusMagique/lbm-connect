require('dotenv').config();
const axios = require('axios');
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log('Le Bus commence à rouler...');
});

client.on('message', message => {

  if (!message.content.startsWith(process.env.PREFIX) || message.author.bot) return;

  if( message.content.startsWith(process.env.PREFIX + 'composter') && !message.author.bot ) {

    if(!message.member) {
      message.reply('impossible de connaître tes rôles sur notre serveur, merci de réessayer.');
      message.delete();
      return;
    }

    if(message.member._roles.indexOf(process.env.DISCORD_ROLE_ORGA) < 0){
      message.reply('seul les membres ayant le rôle "Organisateur" peuvent utiliser cette commande.');
      message.delete();
      return;
    }

    if(!message.member.voice.channelID) {
      message.reply('tu dois être connecté en vocal avec les membres dont tu souhaites valider le ticket !');
      message.delete();
      return;
    }

    var organizer = (message.member.nickname) ? message.member.nickname : message.member.displayName;
    var members = client.channels.cache.get(message.member.voice.channelID).members;
    var nicknames = [];

    members.forEach(m => {
      if(m.nickname) {
        nicknames.push(m.nickname)
      }
    });

    axios.post(process.env.COMPOSTER, JSON.stringify({
      organizer: organizer,
      nicknames: nicknames
    }));

    message.reply('ta demande de compostage a bien été transmise.');
    message.delete();
    return;
  }

  return;

});

client.login(process.env.BOT_TOKEN);

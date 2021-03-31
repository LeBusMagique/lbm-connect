require('dotenv').config();
const axios = require('axios');
const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log('Le Bus commence à rouler...');
});

client.on('message', message => {

  if (!message.content.startsWith(process.env.PREFIX) || message.author.bot) return;

  if( message.content.startsWith(process.env.PREFIX + 'giveaway-reset') && !message.author.bot ) {

    if(!message.member.roles.cache.has(process.env.DISCORD_ROLE_ADMIN)) {
      message.reply('seuls les admins peuvent utiliser cette commande.');
      message.delete();
      return;
    }

    let role = message.guild.roles.cache.find(role => role.name === process.env.DISCORD_ROLE_GIVEAWAY);

    if(role) {
      message.guild.roles.create({
        data: {
          name: role.name,
          color: role.color,
          hoist: role.hoist,
          position: role.position,
          permissions: role.permissions,
          mentionable: role.mentionable
        }
      });

      role.delete('I had to.');
      message.reply('rôle réinitialisé.');
    }

    message.delete();
  }

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

    let organizer = (message.member.nickname) ? message.member.nickname : message.member.displayName;
    let members = client.channels.cache.get(message.member.voice.channelID).members;
    let role = message.guild.roles.cache.find(role => role.name === process.env.DISCORD_ROLE_GIVEAWAY);
    let nicknames = [];

    members.forEach(m => {
      if(m.nickname) {
        nicknames.push(m.nickname);

        if(role) {
          m.roles.add(role.id);
        }
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

  if(message.content.startsWith(process.env.PREFIX + 'roster') && !message.author.bot) {

    if(!message.member.roles.cache.has(process.env.ROSTER_LEAD)) {
      message.reply('seuls les leads de raids peuvent utiliser cette commande.');
      message.delete();
      return;
    }

    let user = message.mentions.members.first();
    if (!user) return message.reply("tu as oublié de mentionner le joueur...");
    let role = message.mentions.roles.first();
    if (!role) return message.reply("tu as oublié de mentionner le roster...");

    let roles = process.env.ROSTER_ROLES.split(',');
    if(!roles.includes(role.id)) {
      message.reply('ce rôle ne fait pas partie de la liste blanche...');
      message.delete();
      return;
    }

    let author = message.author.username + '#' + message.author.discriminator;

    user.send(author + ' t\'a donné le rôle "' + role.name + '" sur le serveur Discord du Bus Magique.');
    user.roles.add(role.id);

    message.reply('le rôle "' + role.name + '" a été donné à <@'+user.id+'>.');
    message.delete();
  }

  if(message.content.startsWith(process.env.PREFIX + 'unroster') && !message.author.bot) {

    if(!message.member.roles.cache.has(process.env.ROSTER_LEAD)) {
      message.reply('seuls les leads de raids peuvent utiliser cette commande.');
      message.delete();
      return;
    }

    let user = message.mentions.members.first();
    if (!user) return message.reply("tu as oublié de mentionner le joueur...");
    let role = message.mentions.roles.first();
    if (!role) return message.reply("tu as oublié de mentionner le roster...");

    let roles = process.env.ROSTER_ROLES.split(',');
    if(!roles.includes(role.id)) {
      message.reply('ce rôle ne fait pas partie de la liste blanche...');
      message.delete();
      return;
    }

    let author = message.author.username + '#' + message.author.discriminator;

    user.send(author + ' t\'a retiré le rôle "' + role.name + '" sur le serveur Discord du Bus Magique.');
    user.roles.remove(role.id);

    message.reply('le rôle <@&'+role.id+'> a été retiré à <@'+user.id+'>.');
    message.delete();
  }

});

client.login(process.env.BOT_TOKEN);

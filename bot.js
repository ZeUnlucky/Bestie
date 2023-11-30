const setupFile = require('./includes.js');
const base = require("./files/base.js")
const Sheets = require("./files/sheets/sheet.js")
const ZEvents = require("./files/events/event.js")
const Mods = require("./files/mods/mod.js")
const Groups = require("./files/groups/group.js")
const Messages = new Map();

const {Discord, util, moment, fs} = setupFile.getRequires();
const {prefix, token} = setupFile.getSettings();
const {Client, GatewayIntentBits, EmbedBuilder  } = require('discord.js');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');

const client = new Client({ 'intents': [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
  ],});

client.on('messageCreate', msg => {
	if (!base.CheckMsgValid(msg)) return;
	
	var MsgContent = msg.content;
	var args = MsgContent.slice(prefix.length).split(' '); 
	if (MsgContent.startsWith(prefix))
	{
		var cmd = args.shift();
		if (cmd == "help")
			SendHelp(msg)
		else if (cmd == 'sheet')
			Sheets.HandleMessage(msg,args)
		else if (cmd == 'mod')
			Mods.HandleMessage(msg, args)
		else if (cmd == "event")
			ZEvents.HandleMessage(msg, args)
		else if (cmd == "deleted")
        	CheckDeleted(msg)
		else if (cmd == "group")
			Groups.HandleMessage(msg, args)
	}
});

function SendHelp(msg)
{
	HelpEmbed = new EmbedBuilder().setTitle("Bot Help").setDescription("These are the main commands:")
	.addFields(
		{ name: 'sheet help', value: 'Shows help with sheets.' },
		{ name: 'mod help', value: 'Shows moderation commands (WIP).' },
		{ name: 'event help', value: 'Shows event commands (WIP).'},
		{ name: 'group help', value: 'Shows group commands.' },
	)
	.setTimestamp()
	.setColor(0x0099FF)
	.setFooter({ text: msg.author.tag, iconURL: 'https://i.imgur.com/AfFp7pu.png' });
	msg.channel.send({ embeds: [HelpEmbed] });
}

function CheckDeleted(msg)
{
    if (Mods.isMod(msg.member))
    {
        let user = msg.mentions.users.first();
        if (user)
        {
            var ToSend = ">>> __" + user.tag + "__\n";
            var serverDeleted = Messages.get(msg.guild.id);
            serverDeleted.forEach(function(item,index,array){if (user.id == serverDeleted[index].id) ToSend+= serverDeleted[index].time + serverDeleted[index].channel.name + ": " + serverDeleted[index].content + "\n";});				
            msg.author.send(ToSend, {split:true});
        }
        else msg.channel.send('> Please specify a valid user!');	
    }
}



client.on("messageDelete", (msg) => {
	if (msg.channel.type == "dm")
		return;
	if (!msg.author.bot)
	{
		Time = base.ts()
		console.log(Time + msg.author.tag + "[" + msg.author.id +"]: " + msg.channel.name + ": " + msg.content);
		var serverDeleted = Messages.get(msg.guild.id);
		const Deleted = 
		{
			time: Time,
			tag: msg.author.tag,
			id: msg.author.id,
			channel: msg.channel,
			content: msg.content
		};
		if (!serverDeleted)
		{
			const MessagesOfServer = [];
			Messages.set(msg.guild.id, MessagesOfServer);
			serverDeleted = Messages.get(msg.guild.id);
		}
		serverDeleted.push(Deleted);
	}
});


client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.login(token);

module.exports = {client, Discord}





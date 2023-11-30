const Sheets = require('./sheets.json');
const Base = require('../base.js');
const Discord = require('discord.js')
const {EmbedBuilder} = require('discord.js');
const DEFAULT_COLOR = "219C9E"
function EmbedSheet(user, name, commander)
{
	
	var Sheet = Sheets[user.id][name];
	if (!Sheet.Color) // edit after deployment.
	{
		if (!Sheet.Params.includes("Color")) 
		Sheet.Params.push("Color");

		Sheet.Color = DEFAULT_COLOR
		Base.CreateFile(Sheets, "sheets/sheets");
	}

	CharEmbed = new EmbedBuilder().setTitle(name).setImage(Sheet.Pic).setColor(parseInt(Sheet.Color,16)).setAuthor({ name: ""+user.tag, iconURL:user.avatarURL() } );
	Sheet.Params.forEach(param =>
	{
		if (param != "Pic" && param != "Color")
		CharEmbed.addFields({ name: param, value: Sheet[param] });
		
	});
	CharEmbed.setTimestamp().setFooter({ text: commander.tag, iconURL: commander.avatarURL() });
	return CharEmbed;
}
function ShowSelfSheets(msg)
{
	if (!Sheets[msg.author.id]) return Base.SendErrorMessage(msg, "~sheet","You don't have any sheets!")
	var arr = Object.entries(Sheets[msg.author.id]);
	if (arr.length == 0) return Base.SendErrorMessage(msg, "~sheet","You don't have any sheets!")
	else
	{
		var ToSend = ">>> __" + msg.author.username + "__\n";
		for (var i = 0; i < arr.length; i++)
			ToSend += arr[i][0] + " - " + arr[i][1].Name + "\n";
		return msg.channel.send(ToSend);
	}
}
function ShowUserSheets(msg, args, Ment)
{
	if (!Sheets[Ment.id]) return Base.SendErrorMessage(msg, "~sheet","User has no sheets!")
	if (!args[0])
	{
		var arr = Object.entries(Sheets[Ment.id]);
		if (arr.length == 0) return Base.SendErrorMessage(msg, "~sheet","User has no sheets!")
		var ToSend = ">>> __" + Ment.username + "__\n";
		for (var i = 0; i < arr.length; i++)
			ToSend += arr[i][0] + " - " + arr[i][1].Name + "\n";
		msg.channel.send(ToSend);
	}
	else
	{
		var name = Base.Capitalise(args.shift());
		if (!Sheets[Ment.id][name])
			return msg.channel.send("> No sheets existing with the following name.");
		
		AnEmbed = EmbedSheet(Ment, name, msg.author)
		msg.channel.send({embeds: [AnEmbed]});
	}
}
function CreateNewSheet(msg, args)
{
	if (!!args[0])
	{
		var name = Base.Capitalise(args.join(' '));
		if (!Sheets[msg.author.id])
			Sheets[msg.author.id] = {}
		Sheets[msg.author.id][Base.Capitalise(args[0])] = {"Params":["Name"], "Name":Base.Capitalise(args.join(' '))};
		Base.CreateFile(Sheets, "/sheets/sheets");
		return Base.SendSuccessMessage(msg, "~sheet new", name + " created successfully")
	}
	else
		msg.channel.send("> Please enter a name for your profile");
}
function DeleteSheet(msg, args)
{
	var name = Base.Capitalise(args.shift());
	if (!Sheets[msg.author.id]) return Base.SendErrorMessage(msg, "~sheet","You don't have sheets!")
	if (!name) return Base.SendIncorrectInput(msg, "~sheet delete","~sheet delete <name>")
	if (!Sheets[msg.author.id][name]) return Base.SendErrorMessage(msg, "~sheet","No sheet found!", {name: "Sheet:", value: name})
	delete Sheets[msg.author.id][name];
	Base.CreateFile(Sheets, "sheets/sheets");
	return Base.SendSuccessMessage(msg, "~sheet delete", name + " deleted successfully")
}
function SendHelp(msg)
{
	var HelpEmbed = new EmbedBuilder().setTitle("Sheets Help").setDescription("<PARAMETERS> ARE NOT NECESSARY!");
	HelpEmbed.addFields({ name: "sheet <user>", value: "Lists profiles as ID - Name. Shows your own with no user given.\n For example, ~sheet or ~sheet @Zuof" },
	{ name: "sheet <user> -id", value: "Shows description of the profile by given ID. Can be used on yourself without pinging yourself.\nExamples:\n~sheet @Zuof George or ~sheet George" },
	{ name: '\u200B', value: '\u200B' },
	{ name: "sheet new -id/firstname", value: "Creates a profile, in which the id/firstname will act as ID. <PLEASE ONLY USE FIRST NAME AS ID!>\nFor example, if you'd do ~sheet new Firstname Lastname, then the id would be only Firstname. Please take that into consideration!" },
	{ name: "sheet delete -id/firstname", value: "Deletes the profile. \nExample: ~sheet delete josh"},
	{ name: "sheet -id -field -value", value: "Changes the value for the profile in that field. \nExample: ~sheet josh age 17" },
	{ name: "sheet -id picture <link>", value: "Sets the profile's picture. Be sure to attach a link or an image! \nExample: ~sheet josh picture (link)" },
	{ name: "sheet -id color <#color>", value: "Sets the profile's color. Be sure to use hex! \nExample: ~sheet josh color FF00FF" })
	.setTimestamp()
	.setColor("#13f14c")
	.setFooter({ text: msg.author.tag});
	msg.channel.send({embeds: [HelpEmbed]});
}
function EditSheet(msg, args, Command)
{
	if (!Sheets[msg.author.id]) return Base.SendErrorMessage(msg, "~sheet","You don't have sheets!")
	var sheet = Base.Capitalise(Command);
	if (!Sheets[msg.author.id][sheet]) return Base.SendErrorMessage(msg, "~sheet","No sheet found!", {name: "Sheet:", value: sheet})
	if (!args[0]) return msg.channel.send({embeds: [EmbedSheet(msg.author, sheet, msg.author)]});
	
	var Param = Base.Capitalise(args.shift().toLowerCase());			
	if (Param != "Picture" && Param != "Pic" && Param != "Color" && Param != "Colour")
	{
		if (!args[0])
		{
			if (!Sheets[msg.author.id][sheet][Param]) return Base.SendErrorMessage(msg, "~sheet","No parameter found!", {name: "Parameter:", value: Param})
			delete Sheets[msg.author.id][sheet][Param];
			const index = Sheets[msg.author.id][sheet].Params.indexOf(Param);
    		Sheets[msg.author.id][sheet].Params.splice(index, 1);
			Base.CreateFile(Sheets, "sheets/sheets");
			return Base.SendSuccessMessage(msg, "~sheet", Param + " deleted successfully")
			
		}
		var Value = args.join(' ');
		Sheets[msg.author.id][sheet][Param] = Value;
		if (!Sheets[msg.author.id][sheet].Params.includes(Param))
			Sheets[msg.author.id][sheet].Params.push(Param);
		Base.CreateFile(Sheets, "sheets/sheets");
		return Base.SendSuccessMessage(msg, "~sheet", Param + " changed successfully")
	}
	else if (Param == "Picture" || Param == "Pic")
	{
		Param = "Pic"
		if (!args[0] && msg.attachments.size == 0)
		{
			if (Sheets[msg.author.id][sheet].Pic == "") return Base.SendErrorMessage(msg, "~sheet","No picture found!", {name: "Sheet:", value: sheet})
			delete Sheets[msg.author.id][sheet][Param];
			const index = Sheets[msg.author.id][sheet].Params.indexOf(Param);
    		Sheets[msg.author.id][sheet].Params.splice(index, 1);
			Base.CreateFile(Sheets, "sheets/sheets");
			return Base.SendSuccessMessage(msg, "~sheet", Param + " deleted successfully")
		}
		var file = args.shift();
		if (msg.attachments.size > 0) // we take the picture embed, if there's no pic embedded, we test if it's a valid url
			file = msg.attachments.first().url;
		else
		{
			isURL = Base.stringIsAValidUrl(file)
			if (!isURL)
				return Base.SendErrorMessage(msg, "~sheet Picture","Invalid URL!")
		}
		Sheets[msg.author.id][sheet].Pic = file;
		if (!Sheets[msg.author.id][sheet].Params.includes("Pic"))
			Sheets[msg.author.id][sheet].Params.push("Pic");
		Base.CreateFile(Sheets, "sheets/sheets");
		return Base.SendSuccessMessage(msg, "~sheet", "Successfully changed the sheet's picture!")
	}
	else if (Param == "Color" || Param == "Colour")
	{
		Param = "Color"
		if (!args[0])
		{
			delete Sheets[msg.author.id][sheet][Param];
			const index = Sheets[msg.author.id][sheet].Params.indexOf(Param);
    		Sheets[msg.author.id][sheet].Params.splice(index, 1);
			Base.CreateFile(Sheets, "sheets/sheets");
			return Base.SendSuccessMessage(msg, "~sheet", Param + " deleted successfully")
		}
		const re = new RegExp(/^#([0-9a-f]{3}){1,2}$/i);
		var color = args.shift();
		if (color[0] != '#') color = "#" + color
		if (!re.test(color))
			return Base.SendErrorMessage(msg, "~sheet Color", "Not a valid HEX Color", {name: "You can use this website: ", value: "https://htmlcolorcodes.com/color-picker/"})
		color = color.substring(1)
		Sheets[msg.author.id][sheet].Color = color;
		if (!Sheets[msg.author.id][sheet].Params.includes("Color")) 
			Sheets[msg.author.id][sheet].Params.push("Color");
		Base.CreateFile(Sheets, "sheets/sheets");
		return Base.SendSuccessMessage(msg, "~sheet", "Successfully changed the sheet's color!")
	}
}
function HandleMessage(msg, args)
{
	//sheet |
	if (!args[0])
	{
		return ShowSelfSheets(msg);
	}
	
	var Command = args.shift();
	if (Command != null)
		Command.toLowerCase();
	var Ment = msg.author;
	if (Command != "help" && !!Command)
	{
		Ment = msg.mentions.users.first();
		if (!Ment)
			Ment = msg.author;
	}
	
	//sheet <user>
	if ((Command != null && Ment.id == Command.replace('<@', "").replace('>',"")))				
		ShowUserSheets(msg, args, Ment)	
	
	//sheet new <name>
	else if (Command == 'new')			
		CreateNewSheet(msg, args)
	
	//sheet delete <name>
	else if (Command == 'delete')
		DeleteSheet(msg, args)
	
	//sheet help
	else if (Command == 'help')
		SendHelp(msg)
	
	//literally edit or view any profile cuz am cool
	//sheet <name>
	else EditSheet(msg,args, Command)

}
module.exports = {EmbedSheet, HandleMessage}
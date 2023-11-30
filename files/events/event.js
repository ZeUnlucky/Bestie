const Base = require('../base.js');
const Mod = require('../mods/mod.js');
const Discord = require('discord.js')
const Events = require('./events.json');
const {EmbedBuilder} = require('discord.js');

function HandleMessage(msg, args)
{
    if (!Events[msg.guild.id])
        Events[msg.guild.id] = {}
	if (args[0] == "new")
    {
        if (!Mod.isMod(msg.member)) return Base.NoPermissionMessage(msg)
        CreateNewEvent(msg, args)
    }
    else if (args[0] == "delete")
    {
        if (!Mod.isMod(msg.member)) return Base.NoPermissionMessage(msg)
        DeleteEvent(msg, args)
    }
    else if (args[0] == "category")
    {
        if (!Mod.isMod(msg.member)) return Base.NoPermissionMessage(msg)
        if (!args[1]) DisplayCategories(msg)
        else if (args[1] == "new") CreateNewCategory(msg, args)
        else if (args[1] == "delete") DeleteCategory(msg, args)
    }
    else if (args[0] == "help")
    {
        SendHelpEmbed(msg)
    }
    else 
    {
        if (!Mod.isMod(msg.member)) return Base.NoPermissionMessage(msg)
        ExecuteEvent(msg, args)
        
    }
}

function DeleteCategory(msg, args)
{
    args[1] = ""
    args[0] = ""
    Cat = args[2]
    if (!Cat) return Base.SendIncorrectInput(msg, "~event category delete","~event category delete <category>")
    Cat = args.join(" ")
    Cat = Cat.trim()
    if (!Events[msg.guild.id][Cat]) return Base.SendErrorMessage(msg, "~event category delete","No category found!", {name: "Category:", value: Cat})
    delete Events[msg.guild.id][Cat]
    Base.CreateFile(Events, "/events/events");
    return Base.SendSuccessMessage(msg, "~event category delete", "Successfully deleted category " + Cat)
}

function DeleteEvent(msg, args)
{
    args[0] = ""
    FullCommand = args.join(" ")
    newArgs = FullCommand.split(', ')
    Cat = newArgs[0].trim()
    Name = newArgs[1]

    if (!Cat || !Name )
        return Base.SendIncorrectInput(msg, "~event delete","~event delete <category>, <event>")
    if (!Events[msg.guild.id][Cat]) return Base.SendErrorMessage(msg, "~event delete","No category found!", {name: "Category:", value: Cat})
    found = false
    Events[msg.guild.id][Cat].forEach(element => {
        if (element.Name == Name)
        {
            const index =  Events[msg.guild.id][Cat].indexOf(element);
    		Events[msg.guild.id][Cat].splice(index, 1);
            found = true
        }
    });
    if (!found) return Base.SendErrorMessage(msg, "~event delete", "No event found in category!", [{name: "Category:", value: Cat}, {name: "Event:", value: Name}])
    Base.CreateFile(Events, "/events/events");
    return Base.SendSuccessMessage(msg, "~event delete", "Successfully deleted the event!")
}

function SendHelpEmbed(msg)
{
    HelpEmbed = new EmbedBuilder().setTitle("Event Help").setDescription("<PARAMETER> ARE OPTIONAL!").addFields(
        {name: "event -category", value: "Rolls a random event from the category specified."},
        {name: "event new -category, -name, -description, -chance", value: "Creates a new event under the given category."},
        {name: "event delete -category, -name", value: "Deletes an event from inputted category."},
        {name: "event category new -category", value: "Creates a new category."},
        {name: "event category delete -category", value: "Deletes the category **and all events in it**."},
        {name: "event category", value: "Shows all the event categories."},
    ).setFooter({text: msg.author.tag}).setTimestamp()
    msg.channel.send({embeds: [HelpEmbed]})
}

function DisplayCategories(msg)
{
    if (!Events[msg.guild.id])
        Events[msg.guild.id] = {}
    if (Object.keys(Events[msg.guild.id]).length <= 0) return Base.SendErrorMessage(msg, "~event category", "No event categories in server!", [])
    CatEmbed = new EmbedBuilder().setTitle("Event Categories")
    Object.keys(Events[msg.guild.id]).forEach(key => {
        CatEmbed.addFields( {name: key, value: "Amount of events: " + Events[msg.guild.id][key].length})
    });
    CatEmbed.setTimestamp().setFooter({text: msg.author.tag})
    msg.channel.send({embeds:[CatEmbed]})
}

function ExecuteEvent(msg, args)
{
    if (!args[0]) return Base.SendIncorrectInput(msg, "~event","~event <categories> OR ~event category")
    Cat = args[0].trim()
   
    if (!Events[msg.guild.id][Cat]) return Base.SendErrorMessage(msg, "~event","Category not found!", {name: "Category:", value: Cat})
    RandomEvent = ChooseRandomEvent(msg, Cat)
    if (!RandomEvent) return Base.SendErrorMessage(msg, "~event","There are no events!", [])
        Severity = Base.getRandomIntEx(100)
        Color = "#529918"
        if (Severity >= 25 && Severity < 50) Color = "#b8b214"
        else if (Severity >= 50 && Severity < 75) Color = "#b87c14"
        else if (Severity >= 75) Color = "#ba160d"
        var EventEmbed = new EmbedBuilder().setTitle("WARNING!").setDescription("NEW EVENT!");
        EventEmbed.addFields(
            { name: RandomEvent.Name, value: RandomEvent.Desc },
            { name: "SEVERITY", value: Severity+"%" }, )
        .setTimestamp()
        .setColor(Color)
        .setFooter({text: msg.author.tag});
        msg.channel.send({embeds: [EventEmbed]});
        msg.delete()
}

function ChooseRandomEvent(msg, Cat)
{
    var totalChance = 0;
	var Entries = [];
	var winner;
    if (Events[msg.guild.id][Cat].length == 0) return Base.SendErrorMessage(msg, "~event","There are no events in this category!")
	Events[msg.guild.id][Cat].forEach(element => { totalChance += parseInt(element.Chance); Entries.push({'name':element.Name, 'entry':totalChance, 'object':element}); });
    var WinningNumber = Base.getRandomIntEx(totalChance);
	for (i = 0; i < Entries.length; i++)
	{
		if (Entries[i].entry > WinningNumber)
		{
			winner = Entries[i].object;
			break;
		}
	}
	return winner;
}

function CreateNewEvent(msg, args)
{
    args[0] = ""
    FullCommand = args.join(" ")
    newArgs = FullCommand.split(', ')
    Cat = newArgs[0].trim()
    Name = newArgs[1]
    Desc = newArgs[2]
    Chance = newArgs[3]

    if (!Cat || !Name || !Desc || !Chance) return Base.SendIncorrectInput(msg, "~event new","~event new <category>, <name>, <desc>, <chance>")
    console.log(Cat)
    if (!Events[msg.guild.id][Cat]) return Base.SendErrorMessage(msg, "~event new","No category found!", {name: "Category:", value: Cat})
    EventStruct = {
        "Category": Cat,
        "Name" : Name,
        "Desc" : Desc,
        "Chance" : Chance
    }
    Events[msg.guild.id][Cat].push(EventStruct)
    Base.CreateFile(Events, "/events/events");
    return Base.SendSuccessMessage(msg, "~event delete", "Successfully created event " + Name + "!")
}

function CreateNewCategory(msg, args)
{
    args[1] = ""
    args[0] = ""
    Cat = args[2]
    if (!Cat) return Base.SendIncorrectInput(msg, "~event category new","~event category new <category>")
    Cat = args.join(" ")
    Cat = Cat.trim()
    if (!!Events[msg.guild.id][Cat]) return Base.SendErrorMessage(msg, "~event category new","Category already exists!", {name: "Category:", value: Cat})
    Events[msg.guild.id][Cat] = []
    Base.CreateFile(Events, "/events/events");
    return Base.SendSuccessMessage(msg, "~event delete", "Category " + Cat + " created successfully!")
} 
module.exports = { HandleMessage }
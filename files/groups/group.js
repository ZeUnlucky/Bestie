const Base = require('../base.js');
const Mod = require('../mods/mod.js');
const Discord = require('discord.js')
const Groups = require('./groups.json');
const Pagination = require('../pagination.js')

const {EmbedBuilder} = require('discord.js');

function HandleMessage(msg, args)
{
    if (!Groups[msg.guild.id])
        Groups[msg.guild.id] = {}
    if (!args[0])
    {
        ShowAllGroups(msg)
    }
    else if (args[0] == "new")
    {
        if (!Mod.isMod(msg.member)) return Base.NoPermissionMessage(msg)
        CreateNewGroups(msg, args)
    }
    else if (args[0] == "stats")
    {
        return MakeGroupStats(msg)
    }
    else if (args[0] == "remove")
    {
        if (!Mod.isMod(msg.member)) return Base.NoPermissionMessage(msg)
        RemoveFromGroup(msg, args)
    }
    else if (args[0] == "delete")
    {
        if (!Mod.isMod(msg.member)) return Base.NoPermissionMessage(msg)
        DeleteGroup(msg, args)
    }
    else if (args[0] == "add")
    {
        if (!Mod.isMod(msg.member)) return Base.NoPermissionMessage(msg)
        AddToGroup(msg, args)
    }
    else if (args[0] == "find")
    {
        FindInGroup(msg, args)
    }
    else if (args[0] == "help")
    {
        SendHelpEmbed(msg)
    }
    else
    {
        ShowGroup(msg, args)
    }
}

function SendHelpEmbed(msg)
{
    HelpEmbed = new EmbedBuilder().setTitle("Group Help").setDescription("<PARAMETER> ARE OPTIONAL!").addFields(
        {name: "group <group>", value: "Shows a list of all the groups, or info about a specific group, if provided."},
        {name: "group stats", value: "Shows a bit of statistics about this server's groups."},
        {name: "group find -name", value: "Finds a person with said name in all of the groups."},
        {name: "\u200B", value: "\u200B"},
        {name: "group new -group -size", value: "Adds a new group with the provided name, and the provided size."},
        {name: "group delete -group", value: "Deletes the provided group."},
        {name: "group add -name <group>", value: "Adds a name to the provided group, or the first vacant if no group provided."},
        {name: "group remove -group -name", value: "Removes a name from the provided group."},
    ).setFooter({text: msg.author.tag}).setTimestamp()
    msg.channel.send({embeds: [HelpEmbed]})
}

function ShowGroup(msg, args)
{
    if (!args[0]) return Base.SendIncorrectInput(msg, "~group","~group <name>")
    else if (!Groups[msg.guild.id][args[0]]) return Base.SendErrorMessage(msg, "~group","Group not found!", {name: "Group:", value: args[0]})
    msg.channel.send({embeds:[CreateGroupEmbed(args[0], Groups[msg.guild.id][args[0]])]})
}

function AddToGroup(msg, args)
{
    Name = args[1]
    group = args[2]
    if (!group)
    {
        Object.values(Groups[msg.guild.id]).forEach(value => {
            if (value.Vacancy > 0 && !group) group = value.Name;  
        });
        if (!group) return Base.SendErrorMessage(msg, "~group add","There are no vacant groups!", [])
    }
    if (!Groups[msg.guild.id][group]) return Base.SendErrorMessage(msg, "~group add","Group doesn't exist", {name: "Group:", value: args[0]})
    else if (Groups[msg.guild.id][group].Vacancy <= 0) return msg.channel.send("> There are no vacant groups!")
    Groups[msg.guild.id][group].Residents.push(Name)
    Groups[msg.guild.id][group].Vacancy--
    Base.CreateFile(Groups, "/groups/groups");
    return Base.SendSuccessMessage(msg, "~group add", Name + " has been added to group " + group + "!")
}

function FindInGroup(msg, args)
{
    if (!args[1]) return Base.SendIncorrectInput(msg, "~group find","~group find <name>")
    found = false
    Object.values(Groups[msg.guild.id]).forEach(val => {
        val.Residents.forEach(element => {
            if (element == args[1]) 
            {
                found = true
                return msg.channel.send({embeds:[CreateGroupEmbed(val.Name, val)]})
            }
        });
      });
      
      if (!found) return Base.SendErrorMessage(msg, "~group find","This person wasn't found!", {name: "Name:", value: args[1]})
}

function CreateNewGroups(msg, args)
{
    if (!args[1] || !args[2]) return Base.SendIncorrectInput(msg, "~group new","~group new -name -size")
    Newgroup = {
        "Name" : "",
        "Size" : 0,
        "Vacancy" : 0, 
        "Residents" : [],
    
    }
    Newgroup.Name = args[1]
    Newgroup.Size = parseInt(args[2])
    Newgroup.Vacancy = Newgroup.Size
    Groups[msg.guild.id][Newgroup.Name] = Newgroup
    Base.CreateFile(Groups, "/groups/groups");
    return Base.SendSuccessMessage(msg, "~group new", "Successfully created new group!")
   
}

function ShowAllGroups(msg)
{
    if (Object.keys(Groups[msg.guild.id]).length <= 0) return Base.SendErrorMessage(msg, "~group","There are no groups!", [])
    groupFields = []
    Object.keys(Groups[msg.guild.id]).forEach(key => {
        groupFields.push({name:key, value:"Vacancy: " + Groups[msg.guild.id][key].Vacancy, inline:true})
    });
    groupEmbed = new EmbedBuilder().setTitle("group List").setDescription("Here you can see the vacancy of each group.").addFields(groupFields)
    .setTimestamp()
	.setColor("#13f14c")
    msg.channel.send({embeds:[groupEmbed]})
}

function MakeGroupStats(msg)
{
    if (Object.values(Groups[msg.guild.id]).length <= 0) return Base.SendErrorMessage(msg, "~group stats","There are no groups!", [])
    TotalVacancy = 0
    TotalSpace = 0
    groupAmount = 0
    Object.values(Groups[msg.guild.id]).forEach(value => {
        TotalVacancy += value.Vacancy
        TotalSpace += value.Size
        groupAmount++
    });
    groupEmbed = new EmbedBuilder().setTitle("Groups Stats!").setDescription("Here you can see the stats of the groups :)").addFields(
        {name: "Group Amount:", value: ""+groupAmount},
        {name: "Total space:", value: ""+TotalSpace},
        {name: "Total vacancy:", value: ""+TotalVacancy},
        {name: "Total taken:", value: ""+(TotalSpace-TotalVacancy)},
        {name: "Avg. person per group:", value: ""+((TotalSpace-TotalVacancy)/groupAmount)}
    )
    .setTimestamp()
	.setColor("#13f14c")
    msg.channel.send({embeds:[groupEmbed]})
}

function RemoveFromGroup(msg, args)
{
    group = args[1]
    person = args[2]
    if (!group || !person) return Base.SendIncorrectInput(msg, "~group remove","~group remove <group> <name>")
    else if (!Groups[msg.guild.id][group]) return Base.SendErrorMessage(msg, "~group remove","Group doesn't exist!", {name: "Group:", value: group})
    else if (!Groups[msg.guild.id][group].Residents.find(element => element == person)) return Base.SendErrorMessage(msg, "~group remove","Person doesn't exist in this group!", [{name: "Person:", value: person}, {name: "Group:", value: group}])
    const index = Groups[msg.guild.id][group].Residents.indexOf(person);
    Groups[msg.guild.id][group].Residents.splice(index, 1);
    Groups[msg.guild.id][group].Vacancy++;
    Base.CreateFile(Groups, "/groups/groups");
    return Base.SendSuccessMessage(msg, "~group remove", "Successfully removed "+ person +" from "+ group +"!")
}

function DeleteGroup(msg, args)
{
    group = args[1]
    if (!group) return Base.SendIncorrectInput(msg, "~group delete","~group remove <group> <name>")
    else if (!Groups[msg.guild.id][group]) return Base.SendErrorMessage(msg, "~group delete","Group doesn't exist!", {name: "Group:", value: group})
    delete Groups[msg.guild.id][group]
    Base.CreateFile(Groups, "/groups/groups");
    return Base.SendSuccessMessage(msg, "~group delete", "Successfully deleted " + group +"!")
}

function CreateGroupEmbed(key, val)
{
    var groupEmbed = new EmbedBuilder().setTitle("Group " + key).setDescription(key);
	groupEmbed.addFields({name: "Size", value: ""+val.Size})
	.addFields({name: "Vacancy", value: ""+val.Vacancy})
    for (i = 1; i <= val.Residents.length; i++)
    {
	    groupEmbed.addFields({name:"Member "+i, value:val.Residents[i-1] ? val.Residents[i-1] : "Vacant"})
    }
    groupEmbed.setTimestamp()
	.setColor("#13f14c")
	return groupEmbed;
}

module.exports = { HandleMessage }
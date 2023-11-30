const Base = require('../base.js');
const Discord = require('discord.js')
const Mods = require('./mods.json');
const { PermissionsBitField } = require('discord.js');

function isAdmin(member)
{
    return (member.permissions.has(PermissionsBitField.Flags.Administrator))
}
function isMod(member)
{
    if (!Mods[member.guild.id] && !isAdmin(member))
        return false
    return isAdmin(member) || member.roles.cache.some(role => role.id === Mods[member.guild.id].ModRole)
}
function HandleMessage(msg, args)
{
	if (args[0] == "role")
        SetModRole(msg, args[1])
}

function SetModRole(msg, role)
{
    if (!isAdmin(msg.member)) return Base.NoPermissionMessage(msg)
    if (!role) return Base.SendIncorrectInput(msg, "~mod role","~mode role <roleID>")
    if (!Mods[msg.guild.id])  Mods[msg.guild.id] = {};   
    Mods[msg.guild.id]["ModRole"] = role;
    Base.CreateFile(Mods, "/mods/mods");
    return Base.SendSuccessMessage(msg, "~mod role", "Successfully set new mod role!")
    

}




module.exports = { HandleMessage, isMod, isAdmin }

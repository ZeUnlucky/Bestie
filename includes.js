const { Discord  } = require('discord.js');
const util = require('util');
const moment = require('moment');
const fs = require('fs');
const {prefix, token} = require('./auth.json');

var getRequires = function() {return {Discord, util, moment, fs};}
var getSettings = function() {return {prefix, token};} 

module.exports = {getRequires, getSettings};
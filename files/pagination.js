
// const { ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, ReactionCollector } = require('discord.js');
// async function SendPaginatedMessage(Page, msgObj)
// {
// 	var CurrentPage = Page;
// 	const Pages = CalculatePages(CurrentPage);
// 	var Pos = PagePosition(CurrentPage);
	
// 	CurrentPage.msg.setFooter({text: "Page " + Pos + " out of " + Pages} );

// 	/*const row = new ActionRowBuilder()
// 			.addComponents(
// 				new ButtonBuilder()
// 					.setCustomId('BackPage')
// 					.setLabel('Previous Page')
// 					.setStyle(ButtonStyle.Primary),
// 				new ButtonBuilder()
// 					.setCustomId('FrontPage')
// 					.setLabel('Next Page')
// 					.setStyle(ButtonStyle.Primary),
// 			);*/
// 	//message = await msgObj.channel.send({ components: [row] , embeds: [CurrentPage.msg]})
// 	message = await msgObj.channel.send({ embeds: [CurrentPage.msg]})
// 		await message.react("▶️")
// 	const collector = message.createReactionCollector()
// 	collector.on("collect", (reaction, user) => {
// 		console.log(reaction)
// 	})

	

	
  		
// 	if (CurrentPage.FPage != null)
// 	{
// 		CurrentPage.FPage.BPage = CurrentPage;
// 		CurrentPage = CurrentPage.FPage;
// 		Pos++;
// 	}
// 	if (CurrentPage.BPage != null)
// 	{
// 		CurrentPage.BPage.FPage = CurrentPage;
// 		CurrentPage = CurrentPage.BPage;
// 		Pos--;
// 	}

// 		CurrentPage.msg.setFooter({text:"Page " + Pos + " out of " + Pages});	
// }

// function CalculatePages(Page)
// {
// 	var BackTotal = 0;
// 	var FrontTotal = 0;
// 	var CurrentPage = Page;
// 	while (CurrentPage.BPage != null)
// 	{
// 		BackTotal++;
// 		CurrentPage = CurrentPage.BPage;
// 	}
// 	CurrentPage = Page;
// 	while (CurrentPage.FPage != null)
// 	{
// 		FrontTotal++;
// 		CurrentPage = CurrentPage.FPage;
// 	}
	
// 	return BackTotal + FrontTotal + 1;
// }
// function PagePosition(Page)
// {
// 	var BackTotal = 0;
// 	var CurrentPage = Page;
// 	while (CurrentPage.BPage != null)
// 	{
// 		BackTotal++;
// 		CurrentPage = CurrentPage.BPage;
// 	}
// 	return BackTotal + 1;
// }




const paginationEmbed = require('discord.js-pagination');

function SendPaginatedMessage(Pages, msg)
{
	paginationEmbed(msg, Pages)
}

module.exports = {SendPaginatedMessage}
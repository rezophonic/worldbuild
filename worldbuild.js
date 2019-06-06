let wb = {
	CITY_LIST_HEADER: "<ons-list-item expandable> <div class='center title4'>Cities</div> <div class='expandable-content'>",
	EXP_LIST_FOOTER: "</div> </ons-list-item>",
	EXP_LIST_MID: "</div> <div class='expandable-content'>",
	EXP_LIST_HEADER: "<ons-list-item expandable> <div class='center title4'>",
	FAC_LIST_HEADER: "<ons-list-item tappable onclick='wb.pushPage(\"faction.html\",\"",
	HIST_LIST_HEADER: "<ons-list-item tappable onclick='wb.pushPage(\"event.html\",\"",
	LIST_ITEM_HEADER: "<ons-list-item> <div class='center'> <div class='list-item__title title4'>",
	LIST_ITEM_MID: "</div> <div class='list-item__subtitle'>",
	LIST_ITEM_FOOTER: "</div> </div> </ons-list-item>",
	//LIST_ITEM_FOOTER: "</div> </div> <div class='right'> <ons-icon icon='chevron-right'> </div> </ons-list-item>",
	LOC_LIST_ITEM_HEADER: "<ons-list-item tappable onclick='wb.pushPage(\"location.html\",\"",
	NAT_LIST_ITEM_HEADER: "<ons-list-item tappable onclick='wb.pushPage(\"nation.html\",\"",
	CLICKABLE_LIST_ITEM_MID: "\")'> <div class='center'> <div class='list-item__title title4'>",
	CLICKABLE_LIST_ITEM_FOOTER: "</div> </div> <div class='right'> <ons-icon icon='chevron-right'> </div> </ons-list-item>",
	PEOPLE_LIST_HEADER: "<ons-list-item tappable onclick='wb.pushPage(\"character.html\",\"",
	POI_LIST_HEADER: "<ons-list-item expandable> <div class='center title4'>Other Places of Interest</div> <div class='expandable-content'>",
	REG_LIST_HEADER: "<ons-list-item expandable> <div class='center title4'>Regions</div> <div class='expandable-content'>",
	
	UNCAPITALIZED_WORDS: ["a","an","and","aboard","about","above","across","after","against","along","amid","among","amongst","around","at","atop","before","behind","below","beneath","beside","besides","between","before","beyond","but","by","circa","despite","down","during","except","for","from","in","inside","into","less","like","near","of","off","on","onto","or","out","over","since","than","the","through","throughout","till","to","toward","towards","under","underneath","until","unto","up","upon","vs.","via","with","within","without"],
	
	PRIMALS: ["celestial", "demon", "devil", "dragon", "elder elemental"],
	
	pageStack: [],
	activeID: [],
	
	capitalize: function(str) {
		let out="";
		str=str.split(" ");
		str.forEach(function(e, i) {
			if (i === 0 || !wb.UNCAPITALIZED_WORDS.includes(e))
				out+=e[0].toUpperCase()+e.substring(1)+" ";
			else
				out+=e+" ";
		});
		return out.substring(0,out.length-1);
	},
	
	capitalizeFirst: str => str[0].toUpperCase()+str.substr(1),
	
	generateListItem (item) {
		let strOut="";
		if (typeof(item)==="string") {
			strOut=wb.LIST_ITEM_HEADER + 'string' + LIST_ITEM_FOOTER;
		}
		else if (world.characters.includes(item)) {
			// if (type === "clickable") {
			strOut=wb.PEOPLE_LIST_HEADER + item.name + wb.CLICKABLE_LIST_ITEM_MID;
			if (item.title && wb.getData(item.faction,"factions").hierarchy[item.title].display) strOut+= item.title + " ";
			strOut += item.name + wb.LIST_ITEM_MID;
			strOut+= item.subrace ? wb.capitalizeFirst(item.subrace) : wb.capitalizeFirst(item.race);
			let c=undefined;
			if (item.class) {
				if (typeof(item.class)==="string") c=item.class;
				else c=item.class[0];
				strOut += " " + c;
			}
			strOut += ", " + item.summary + wb.CLICKABLE_LIST_ITEM_FOOTER;
			// }
		}
		else if (world.factions.includes(item)) {
			strOut=wb.FAC_LIST_HEADER + item.name + wb.CLICKABLE_LIST_ITEM_MID + item.name + wb.LIST_ITEM_MID + item.summary + wb.CLICKABLE_LIST_ITEM_FOOTER;
		}
		else if (world.locations.includes(item) && item.type==="Nation") {
			strOut=wb.NAT_LIST_ITEM_HEADER + wb.nestableString(item.name) + wb.CLICKABLE_LIST_ITEM_MID + item.name + wb.LIST_ITEM_MID + item.summary + wb.CLICKABLE_LIST_ITEM_FOOTER;
		}
		return strOut;
	},

	
	getData: function(name,type) {
		let out = undefined;
		if(typeof(type)==="string") {
			out = world[type].find(o => o.name===name);
		} else {
			Object.getOwnPropertyNames(world).forEach(function(e) {
				test = world[e].find(o => o.name===name);
				if(test) out=test;
			});
		}
	return out;
	},
	
	getParentNation: (place) => typeof(place)==="undefined"?undefined:(place.type==="Nation"?place:wb.getParentNation(wb.getData(place.parent,"locations"))),
	
	getRank: function(character,factions) {
		let rank=255;
		if (Array.isArray(factions))
			faction=factions.find(o => o.name === character.faction);
		else
			faction=factions;
		if (faction) {
			if (wb.PRIMALS.includes(character.race)) rank=0;
			else if(character.title && faction.hierarchy[character.title]) rank=faction.hierarchy[character.title].rank;
		}
		return rank;
	},
	
	getSupertype: function(item) {
		out = undefined;
		Object.getOwnPropertyNames(world).forEach(function(e) {
			if (world[e].find(o=>o.name===item)) out=e;
		});
		return out;
	},
	
	initPage(page,callBack) {
		let idIndex=wb.activeID.length;
		let pages=document.getElementsByTagName("ons-page");
		let pageElements = pages[pages.length-1].getElementsByTagName("*");
		for(let i=0; i<pageElements.length; i++) {
			pageElements[i].id=pageElements[i].id+idIndex;
		}
		a=wb.activeID[idIndex-1];
		switch (page) {
			case "character":
				let character=wb.getData(a,"characters");
				let charInfoStr="<ons-list-item>" + character.summary + "</ons-list-item>";
				if (character.title && wb.getData(character.faction,"factions").hierarchy[character.title].display)
					$("#character_title"+idIndex).text(character.title+" "+a);
				else $("#character_title"+idIndex).text(a);
				Object.getOwnPropertyNames(character).forEach(function(e) {
					if(e!=="name" && e!=="summary" && e!=="tags")
					{
						if (e==="homeland")
							charInfoStr+=wb.NAT_LIST_ITEM_HEADER + character[e] + wb.CLICKABLE_LIST_ITEM_MID + character[e] + wb.LIST_ITEM_MID + e.toUpperCase() + wb.CLICKABLE_LIST_ITEM_FOOTER;
						else if (e==="faction")
							charInfoStr+=wb.FAC_LIST_HEADER + character[e] + wb.CLICKABLE_LIST_ITEM_MID + character[e] + wb.LIST_ITEM_MID + e.toUpperCase() + wb.CLICKABLE_LIST_ITEM_FOOTER;
						else if (Array.isArray(character[e]))
							charInfoStr+=wb.LIST_ITEM_HEADER + wb.capitalize(character[e][0]) + wb.LIST_ITEM_MID + e.toUpperCase() + wb.LIST_ITEM_FOOTER;
						else if(e!=="title" || !wb.getData(character.faction,"factions").hierarchy[character.title].display)
							charInfoStr+=wb.LIST_ITEM_HEADER + wb.capitalize(character[e]) + wb.LIST_ITEM_MID + e.toUpperCase() + wb.LIST_ITEM_FOOTER;
					}
				});
				$("#character_info"+idIndex).html(charInfoStr);
				break;
				
			case "event":
				$("#event_title"+idIndex).text(a);
				ev = wb.getData(a,"events");
				if (typeof(ev.text)==="string")
					$("#event_info"+idIndex).html("<p>" + ev.text + "</p>");
				else
					$("#event_info"+idIndex).text(ev.summary);
				break;
				
			case "faction":
				let facHrchyList="", facMemberList="";
				let faction=wb.getData(a,"factions");
				$("#faction_title"+idIndex).text(a);
				$("#fac_info"+idIndex).text(faction.summary);
				Object.getOwnPropertyNames(faction.hierarchy).forEach( function(e) {
					facHrchyList+=wb.LIST_ITEM_HEADER + e + wb.LIST_ITEM_MID + faction.hierarchy[e].summary + wb.LIST_ITEM_FOOTER;
				});
				world.characters.filter(o => o.faction===faction.name).sort((a,b) => wb.getRank(a,faction)-wb.getRank(b,faction)).forEach( function(c) {
					facMemberList += wb.generateListItem(c);
				});
				$("#fac_hierarchy"+idIndex).html(facHrchyList);
				$("#fac_members"+idIndex).html(facMemberList);
				break;
			
			case "factions":
				let facList = "", histFacList="";
				world.factions.forEach(function(e) {
					if(e.tags === undefined || !e.tags.includes("Historical"))
						facList+=wb.generateListItem(e);
					else
						histFacList+=wb.generateListItem(e);
				});
				$("#faction_list"+idIndex).html(facList);
				$("#hist_fac_list"+idIndex).html(histFacList);
				break;
			
			case "hierarchy":
				if (wb.getSupertype(a)==="locations") {
					$("#hierarchy_title"+idIndex).text("Noteworthy Residents of " + a); // Alphabetical / By Faction
					$("#hierarchy_list"+idIndex).html("");
					let factions=world.factions.filter(o => o.parent === a);
					let chars=world.characters.filter(o => o.homeland === a);
					chars.sort( (a,b) => wb.getRank(a,factions) - wb.getRank(b,factions) );
					factionHtml = {};
					chars.forEach( function(e) {
						if (e.tags && e.tags.includes("Historical")) {
							if(!factionHtml.Historical)
								factionHtml.Historical = wb.EXP_LIST_HEADER + "Historical" + wb.EXP_LIST_MID;
							factionHtml.Historical += wb.generateListItem(e);
						}
						else if (factions.find(o=> o.name === e.faction)) {
							if(!factionHtml[e.faction])
								factionHtml[e.faction] = wb.EXP_LIST_HEADER + wb.capitalize(e.faction) + wb.EXP_LIST_MID;
							factionHtml[e.faction] += wb.generateListItem(e);
						}
						else {
							if(!factionHtml.other)
								factionHtml.other=wb.EXP_LIST_HEADER + "Other" + wb.EXP_LIST_MID;
							factionHtml.other += wb.generateListItem(e);
						}
					});
					Object.getOwnPropertyNames(factionHtml).sort().forEach(function(e) {
						factionHtml[e] += wb.EXP_LIST_FOOTER;
						if( e !== "other"  && e !== "Historical" )
							$("#hierarchy_list"+idIndex).append(factionHtml[e]);
					});
					$("#hierarchy_list"+idIndex).append(factionHtml.other);
					$("#hierarchy_list"+idIndex).append(factionHtml.Historical);
				}
				else if (wb.getSupertype(a)==="factions")
					$("#hieararchy_title"+idIndex).text("Noteworthy Members of " + a);
				else $("#hierarchy_title"+idIndex).text("Error: \"" + wb.activeID + "\" is neither a faction nor a location.");
				break;
			
			case "history":
				let histList="";
				wb.sortByDate(world.events).forEach(function(e) {
						histList +=wb.HIST_LIST_HEADER + wb.nestableString(e.name) + wb.CLICKABLE_LIST_ITEM_MID + e.year + " " + e.era + wb.LIST_ITEM_MID + e.name + wb.CLICKABLE_LIST_ITEM_FOOTER;
				});
				$("#hist_list"+idIndex).html(histList);
				break;
			
			case "location":
				$("#loc_title"+idIndex).text(a);
				loc = wb.getData(a,"locations");
				if (typeof(loc.text)==="string")
					$("#loc_info"+idIndex).html("<p>" + loc.text + "</p>");
				else
					$("#loc_info"+idIndex).text(loc.summary);
				wb.sortByDate(world.events.filter(o => (o.parent===a || o.parent.includes(a)))).forEach(function(e){$("#loc_info"+idIndex).append("<p>" + e.text + "</p>")});
				break;
			
			case "nation":
				$("#nation_title"+idIndex).text(a);
				nation = wb.getData(a,"locations");
				let nationInfo=$("#nation_info"+idIndex);
				if(typeof(nation)==="undefined")
					nationInfo.text("Sorry, but " + a + " could not be found.");
				else {
					let cityList = "", regList = "", poiList = "";
					world.locations.forEach(function(e) {
						if (typeof(wb.getParentNation(e))!=="undefined" && wb.getParentNation(e).name===a) {
							if (e.type==="City")
								cityList+= wb.LOC_LIST_ITEM_HEADER + wb.nestableString(e.name) + wb.CLICKABLE_LIST_ITEM_MID + e.name + wb.LIST_ITEM_MID + e.summary + wb.CLICKABLE_LIST_ITEM_FOOTER;
							else if (e.type==="Region")
								regList+= wb.LOC_LIST_ITEM_HEADER + wb.nestableString(e.name) + wb.CLICKABLE_LIST_ITEM_MID + e.name + wb.LIST_ITEM_MID + e.summary + wb.CLICKABLE_LIST_ITEM_FOOTER;
							else if (e.type==="PoI")
								poiList+= wb.LOC_LIST_ITEM_HEADER + wb.nestableString(e.name) + wb.CLICKABLE_LIST_ITEM_MID + e.name + wb.LIST_ITEM_MID + e.summary + wb.CLICKABLE_LIST_ITEM_FOOTER;
						}
					});
					if (cityList!=="") cityList=wb.CITY_LIST_HEADER + cityList + wb.EXP_LIST_FOOTER;
					if (regList!=="") regList=wb.REG_LIST_HEADER + regList + wb.EXP_LIST_FOOTER;
					if (poiList!=="") poiList=wb.POI_LIST_HEADER + poiList + wb.EXP_LIST_FOOTER;
					$("#city_list"+idIndex).html(cityList);
					$("#reg_list"+idIndex).html(regList);
					$("#poi_list"+idIndex).html(poiList);
				}
				break;
				
			case "peopleatoz":
				$("#people_atoz_list"+idIndex).html("");
				
				world.characters.forEach(function(e) {
					let chars="";
					chars+=wb.PEOPLE_LIST_HEADER + e.name + wb.CLICKABLE_LIST_ITEM_MID;
					console.log(e.name + ", " + e.title + ", " + e.faction);
					if (e.title && wb.getData(e.faction,"factions").hierarchy[e.title].display) chars+= e.title + " ";
					chars += e.name + wb.LIST_ITEM_MID;
					chars+= e.subrace ? wb.capitalizeFirst(e.subrace) : wb.capitalizeFirst(e.race);
					let c=undefined;
					if (e.class) {
						if (typeof(e.class)==="string") c=e.class;
						else c=e.class[0];
						chars += " " + c;
					}
					chars += ", " + e.summary + wb.CLICKABLE_LIST_ITEM_FOOTER;
					$("#people_atoz_list"+idIndex).append(chars);
				});
				break;
				
			case "peoplebyclass":
				let classes={other: wb.EXP_LIST_HEADER + "Other" + wb.EXP_LIST_MID};
				$("#class_list"+idIndex).html("");
				world.characters.forEach(function(e) {
					let c=undefined;
					if (e.class) {
						if (typeof(e.class)==="string") c=e.class;
						else c=e.class[0];
						if (!classes[c])
							classes[c] = wb.EXP_LIST_HEADER + wb.capitalize(c) + wb.EXP_LIST_MID;
						classes[c] +=wb.PEOPLE_LIST_HEADER  + e.name + wb.CLICKABLE_LIST_ITEM_MID;
						if (e.title && wb.getData(e.faction,"factions").hierarchy[e.title].display) classes[c] += e.title + " ";
						classes[c] += e.name + wb.LIST_ITEM_MID;
						classes[c] += e.subrace ? wb.capitalizeFirst(e.subrace) + " " + c : wb.capitalizeFirst(e.race) + " " + c;
						classes[c] += ", " + e.summary + wb.CLICKABLE_LIST_ITEM_FOOTER;
					}
					else {
						classes.other +=wb.PEOPLE_LIST_HEADER  + e.name + wb.CLICKABLE_LIST_ITEM_MID;
						if (e.title && wb.getData(e.faction,"factions").hierarchy[e.title].display) classes.other += e.title + " ";
						classes.other += e.name + wb.LIST_ITEM_MID;
						classes.other += e.subrace ? wb.capitalizeFirst(e.subrace) : wb.capitalizeFirst(e.race);
						classes.other += ", " + e.summary + wb.CLICKABLE_LIST_ITEM_FOOTER;
					}
				});
					
				Object.getOwnPropertyNames(classes).sort().forEach(function(e) {
					classes[e] += wb.EXP_LIST_FOOTER;
					$("#class_list"+idIndex).append(classes[e]);
				});
				
				break;
			
			case "peoplebyrace":
				let races={}; 
				$("#race_list"+idIndex).html("");
				
				world.characters.forEach(function(e) {
					if (!races[e.race])
						races[e.race]= wb.EXP_LIST_HEADER + wb.capitalize(e.race) + wb.EXP_LIST_MID;
					races[e.race] += wb.PEOPLE_LIST_HEADER + e.name + wb.CLICKABLE_LIST_ITEM_MID;
					if (e.title && wb.getData(e.faction,"factions").hierarchy[e.title].display) races[e.race] += e.title + " ";
					races[e.race] += e.name + wb.LIST_ITEM_MID;
					races[e.race] += e.subrace ? wb.capitalizeFirst(e.subrace) : wb.capitalizeFirst(e.race);
					let c=undefined;
					if (e.class) {
						if (typeof(e.class)==="string") c=e.class;
						else c=e.class[0];
						races[e.race] += " " + c;
					}
					races[e.race] += ", " + e.summary + wb.CLICKABLE_LIST_ITEM_FOOTER;
				});
				Object.getOwnPropertyNames(races).sort().forEach(function(e) {
					races[e] += wb.EXP_LIST_FOOTER;
					$("#race_list"+idIndex).append(races[e]);
				});
				
				break;
				
			case "world":
				let natList="", azList="", histLocList="";
				world.locations.forEach(function(e){
					if(e.type==="Nation"){
						azList+= wb.generateListItem(e);
						if (typeof(e.subtype)==="undefined" || !e.subtype.includes("Historical"))
							natList+= wb.generateListItem(e);
						else
							histLocList += wb.generateListItem(e);
					}
					else {
						azList+= wb.LOC_LIST_ITEM_HEADER + wb.nestableString(e.name) + wb.CLICKABLE_LIST_ITEM_MID + e.name + wb.LIST_ITEM_MID + e.summary + wb.CLICKABLE_LIST_ITEM_FOOTER;
						if (typeof(e.subtype)!=="undefined" && e.subtype.includes("Historical"))
							histLocList+= wb.LOC_LIST_ITEM_HEADER + wb.nestableString(e.name) + wb.CLICKABLE_LIST_ITEM_MID + e.name + wb.LIST_ITEM_MID + e.summary + wb.CLICKABLE_LIST_ITEM_FOOTER;
					}
				});
				$("#nations_list"+idIndex).html(natList);
				$("#a-z_list"+idIndex).html(azList);
				$("#hist_loc_list"+idIndex).html(histLocList);
				break;
				
		}
	},

	nestableString: s=>s.replace("'","&#39;"),
	
	pushPage: function(p,a,cb) {
		if(a) wb.activeID.push(a);
		else wb.activeID.push("");
		wb.pageStack.push(p.substring(0,p.length-5));
		document.getElementById("nav").pushPage(p);
		if (typeof(cb)==="function") cb();
	},
	
	setActiveID: function(s) {wb.activeID.push(s);},
	
	sortByDate: d=>d.sort(function(a,b) {
		let eras={"EP": 1, "EM": 2, "ET": 3, "AF": 4};
	return eras[b.era]-eras[a.era]===0?eras[b.era]-eras[a.era]:b.year-a.year===0?b.year-a.year:b.month-a.month;
	}),
	
	//unnestString: s=>s.replace("&#39;","'"),
	
}

document.addEventListener("init",function(event) {
		wb.initPage(event.target.id);
});

document.addEventListener("postpush",function(event) {
	wb.initPage(wb.pageStack[wb.pageStack.length-1]);
});

document.addEventListener("prepop",function(event) {
	wb.activeID.pop();
	wb.pageStack.pop();
	wb.initPage(wb.pageStack[wb.pageStack.length-1]);
});

let wb = {
	CITY_LIST_HEADER: "<ons-list-item expandable> <div class='center title4'>Cities</div> <div class='expandable-content'>",
	EXP_LIST_FOOTER: "</div> </ons-list-item>",
	EXP_LIST_MID: "</div> <div class='expandable-content'>",
	EXP_LIST_HEADER: "<ons-list-item expandable> <div class='center title4'>",
	HIST_LIST_HEADER: "<ons-list-item tappable onclick='wb.pushPage(\"event.html\",\"",
	LOC_LIST_ITEM_HEADER: "<ons-list-item tappable onclick='wb.pushPage(\"location.html\",\"",
	LIST_ITEM_MID: "</div> <div class='list-item__subtitle'>",
	//LIST_ITEM_FOOTER: "</div> </div> <div class='right'> <ons-icon icon='chevron-right'> </div> </ons-list-item>",
	NAT_LIST_ITEM_HEADER: "<ons-list-item tappable onclick='wb.pushPage(\"nation.html\",\"",
	CLICKABLE_LIST_ITEM_MID: "\")'> <div class='center'> <div class='list-item__title title4'>",
	CLICKABLE_LIST_ITEM_FOOTER: "</div> </div> <div class='right'> <ons-icon icon='chevron-right'> </div> </ons-list-item>",
	PEOPLE_LIST_HEADER: "<ons-list-item tappable onclick='wb.pushPage(\"character.html\",\"",
	POI_LIST_HEADER: "<ons-list-item expandable> <div class='center title4'>Other Places of Interest</div> <div class='expandable-content'>",
	REG_LIST_HEADER: "<ons-list-item expandable> <div class='center title4'>Regions</div> <div class='expandable-content'>",
	
	pageStack: [],
	activeID: [],
	
	capitalize: function(str) {
		let out="";
		str=str.split(" ");
		str.forEach(function(e) {
			out+=e[0].toUpperCase()+e.substring(1)+" ";
		});
		return out.substring(0,out.length-1);
	},
	
	capitalizeFirst: str => str[0].toUpperCase()+str.substr(1),
	
	getData: (name)=>world.find(o=>o.name===name),
	
	getParentNation: (place)=>typeof(place)==="undefined"?undefined:(place.type==="Nation"?place:wb.getParentNation(wb.getData(place.parent))),
	
	initPage(page,callBack) {
		wb.pageStack.push(page);
		switch (page) {
			case "event":
				$("#event_title").text(wb.activeID[wb.activeID.length-1]);
				ev = wb.getData(wb.activeID[wb.activeID.length-1]);
				if (typeof(ev.text)==="string")
					$("#event_info").html("<p>" + ev.text + "</p>");
				else
					$("#event_info").text(ev.summary);
				break;
			
			case "history":
				histList="";
				wb.sortByDate(world.filter(o=>o.supertype==="Event")).forEach(function(e) {
						histList+=wb.HIST_LIST_HEADER + wb.nestableString(e.name) + wb.CLICKABLE_LIST_ITEM_MID + e.year + " " + e.era + wb.LIST_ITEM_MID + e.name + wb.CLICKABLE_LIST_ITEM_FOOTER;
				});
				$("#hist_list").html(histList);
				break;
			
			case "location":
				$("#loc_title").text(wb.activeID[wb.activeID.length-1]);
				loc = wb.getData(wb.activeID[wb.activeID.length-1]);
				if (typeof(loc.text)==="string")
					$("#loc_info").html("<p>" + loc.text + "</p>");
				else
					$("#loc_info").text(loc.summary);
				wb.sortByDate(world.filter(o=>o.supertype==="Event" && (o.parent===wb.activeID[wb.activeID.length-1] || o.parent.includes(wb.activeID[wb.activeID.length-1])))).forEach(function(e){$("#loc_info").append("<p>" + e.text + "</p>")});
				break;
			
			case "nation":
				$("#nation_title").text(wb.activeID[wb.activeID.length-1]);
				nation = wb.getData(wb.activeID[wb.activeID.length-1]);
				let nationInfo=$("#nation_info");
				if(typeof(nation)==="undefined")
					nationInfo.text("Sorry, but " + wb.activeID[wb.activeID.length-1] + " could not be found.");
				else {
					let cityList = "", regList = "", poiList = "";
					world.forEach(function(e) {
						if (e.supertype==="Location") {
							if (typeof(wb.getParentNation(e))!=="undefined" && wb.getParentNation(e).name===wb.activeID[wb.activeID.length-1]) {
								if (e.type==="City")
									cityList+= wb.LOC_LIST_ITEM_HEADER + wb.nestableString(e.name) + wb.CLICKABLE_LIST_ITEM_MID + e.name + wb.LIST_ITEM_MID + e.summary + wb.CLICKABLE_LIST_ITEM_FOOTER;
								else if (e.type==="Region")
									regList+= wb.LOC_LIST_ITEM_HEADER + wb.nestableString(e.name) + wb.CLICKABLE_LIST_ITEM_MID + e.name + wb.LIST_ITEM_MID + e.summary + wb.CLICKABLE_LIST_ITEM_FOOTER;
								else if (e.type==="PoI")
									poiList+= wb.LOC_LIST_ITEM_HEADER + wb.nestableString(e.name) + wb.CLICKABLE_LIST_ITEM_MID + e.name + wb.LIST_ITEM_MID + e.summary + wb.CLICKABLE_LIST_ITEM_FOOTER;
							}
						}
					});
					if (cityList!=="") cityList=wb.CITY_LIST_HEADER + cityList + wb.EXP_LIST_FOOTER;
					if (regList!=="") regList=wb.REG_LIST_HEADER + regList + wb.EXP_LIST_FOOTER;
					if (poiList!=="") poiList=wb.POI_LIST_HEADER + poiList + wb.EXP_LIST_FOOTER;
					$("#city_list").html(cityList);
					$("#reg_list").html(regList);
					$("#poi_list").html(poiList);
				}
				break;
				
			case "peopleatoz":
				$("#people_atoz_list").html("");
				
				world.forEach(function(e) {
					if (e.supertype==="Character") {
						let chars="";
						chars+=wb.PEOPLE_LIST_HEADER + e.name + wb.CLICKABLE_LIST_ITEM_MID;
						if (e.title) chars+= e.title + " ";
						chars += e.name + wb.LIST_ITEM_MID;
						chars+= e.subrace ? wb.capitalizeFirst(e.subrace) : wb.capitalizeFirst(e.race);
						let c=undefined;
						if (e.class) {
							if (typeof(e.class)==="string") c=e.class;
							else c=e.class[0];
							chars += " " + c;
						}
						chars += ", " + e.summary + wb.CLICKABLE_LIST_ITEM_FOOTER;
						$("#people_atoz_list").append(chars)
					}
				});
				break;
				
			case "peoplebyrace":
				let races={}; 
				$("#race_list").html("");
				
				world.forEach(function(e) {
					if (e.supertype==="Character") {
						if (!races[e.race])
							races[e.race]= wb.EXP_LIST_HEADER + wb.capitalize(e.race) + wb.EXP_LIST_MID;
						races[e.race] += wb.PEOPLE_LIST_HEADER + e.name + wb.CLICKABLE_LIST_ITEM_MID;
						if (e.title) races[e.race] += e.title + " ";
						races[e.race] += e.name + wb.LIST_ITEM_MID;
						races[e.race] += e.subrace ? wb.capitalizeFirst(e.subrace) : wb.capitalizeFirst(e.race);
						let c=undefined;
						if (e.class) {
							if (typeof(e.class)==="string") c=e.class;
							else c=e.class[0];
							races[e.race] += " " + c;
						}
						races[e.race] += ", " + e.summary + wb.CLICKABLE_LIST_ITEM_FOOTER;
					}
				});
				Object.getOwnPropertyNames(races).sort().forEach(function(e) {
					races[e] += wb.EXP_LIST_FOOTER;
					$("#race_list").append(races[e]);
				});
				
				break;
				
			case "peoplebyclass":
				let classes={other: wb.EXP_LIST_HEADER + "Other" + wb.EXP_LIST_MID};
				$("#class_list").html("");
				world.forEach(function(e) {
					if (e.supertype==="Character") {
						let c=undefined;
						if (e.class) {
							if (typeof(e.class)==="string") c=e.class;
							else c=e.class[0];
							if (!classes[c])
								classes[c] = wb.EXP_LIST_HEADER + wb.capitalize(c) + wb.EXP_LIST_MID;
							classes[c] +=wb.PEOPLE_LIST_HEADER  + e.name + wb.CLICKABLE_LIST_ITEM_MID;
							if (e.title) classes[c] += e.title + " ";
							classes[c] += e.name + wb.LIST_ITEM_MID;
							classes[c] += e.subrace ? wb.capitalizeFirst(e.subrace) + " " + c : wb.capitalizeFirst(e.race) + " " + c;
							classes[c] += ", " + e.summary + wb.CLICKABLE_LIST_ITEM_FOOTER;
						}
						else {
							classes.other +=wb.PEOPLE_LIST_HEADER  + e.name + wb.CLICKABLE_LIST_ITEM_MID;
							if (e.title) classes.other += e.title + " ";
							classes.other += e.name + wb.LIST_ITEM_MID;
							classes.other += e.subrace ? wb.capitalizeFirst(e.subrace) : wb.capitalizeFirst(e.race);
							classes.other += ", " + e.summary + wb.CLICKABLE_LIST_ITEM_FOOTER;
						}
					}
				});
					
				Object.getOwnPropertyNames(classes).sort().forEach(function(e) {
					classes[e] += wb.EXP_LIST_FOOTER;
					$("#class_list").append(classes[e]);
				});
				
				break;
			
			case "residents":
				
			
			case "world":
				let natList="", azList="";
				world.forEach(function(e){
					if (e.supertype==="Location")
					{
						if(e.type==="Nation" && (typeof(e.subtype)==="undefined" || !e.subtype.includes("Historical"))){
							natList+= wb.NAT_LIST_ITEM_HEADER + wb.nestableString(e.name) + wb.CLICKABLE_LIST_ITEM_MID + e.name + wb.LIST_ITEM_MID + e.summary + wb.CLICKABLE_LIST_ITEM_FOOTER;
							azList+= wb.NAT_LIST_ITEM_HEADER + wb.nestableString(e.name) + wb.CLICKABLE_LIST_ITEM_MID + e.name + wb.LIST_ITEM_MID + e.summary + wb.CLICKABLE_LIST_ITEM_FOOTER;
						}
						else
							azList+= wb.LOC_LIST_ITEM_HEADER + wb.nestableString(e.name) + wb.CLICKABLE_LIST_ITEM_MID + e.name + wb.LIST_ITEM_MID + e.summary + wb.CLICKABLE_LIST_ITEM_FOOTER;
					}
				});
				$("#nations_list").html(natList);
				$("#a-z_list").html(azList);
				break;
				
		}
	},

	nestableString: s=>s.replace("'","&#39;"),
	
	pushPage: function(p,a,cb) {
		document.getElementById("nav").pushPage(p);
		wb.activeID.push(a);
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

/*
document.addEventListener("prepush",function(event) {
	wb.initPage(event.target.id);
});
*/

document.addEventListener("prepop",function(event) {
	wb.activeID.pop();
	wb.pageStack.pop();
	wb.initPage(wb.pageStack[wb.pageStack.length-1]);
});
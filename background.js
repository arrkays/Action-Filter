//load filter
let filtres;
let msgSelecttionner;
let tabDest;

browser.storage.local.get().then((e)=>{
	filtres = e.filtres;
	console.log("filtres loaded in background");
});

browser.storage.onChanged.addListener((changes, areaName)=>{
	//filtres = e.filtres;
	console.log("background Storage Update");
	browser.storage.local.get().then((e)=>{
		filtres = e.filtres;
		console.log("filtres loaded in background");
	});
});

/*
Called when the item has been created, or when creation failed due to an error.
We'll just log success/failure here.
*/
function onCreated() {
  if (browser.runtime.lastError) {
    console.log(`Error: ${browser.runtime.lastError}`);
  } else {
    console.log("Item created successfully");
  }
}

/*
Called when there was an error.
We'll just log the error here.
*/
function onError(error) {
  console.log(`Error: ${error}`);
}

/*
Create all the context menu items.
*/
browser.menus.create({
  id: "mouve-mail",
  title: "ranger",
  contexts: ["message_list"]
}, onCreated);


/*
Click itème menu
id = dossier destination 
*/
browser.menus.onClicked.addListener((info, tab) => {
	var id = info.menuItemId;
	dest = {accountId:"account1", path:id};
	
	msgId = [];
	msgSelecttionner.forEach((m)=>msgId.push(m.id));
	
	browser.messages.move(msgId,dest);
});

browser.mailTabs.onSelectedMessagesChanged.addListener((tab, selectedMessages) =>{
	browser.menus.removeAll();
	
	console.log(selectedMessages);
	
	tabDest = findDestination(selectedMessages.messages[0]);
	msgSelecttionner = selectedMessages.messages;
	
	for(var i = 0; i < tabDest.length; i++){
		var title = tabDest[i].split("/");
		title = title[title.length-1];
		console.log(title);
		browser.menus.create({
			id: tabDest[i],
			title: title,
			contexts: ["message_list"]
		}, onCreated);
	}

});

function findDestination(msg){
	var listeDest = [];
	
	filtres.forEach((f)=>{
		filtreVrai = false;
		if(f.isAnd)
			filtreVrai = et(f.condition,msg);
		else
			filtreVrai = ou(f.condition,msg);
		
		if(filtreVrai)
			listeDest.push(f.destination);
	});	

	//verifier qu'il n'y a pas de doublon dans les destination
	//TODO
	
	return listeDest;
}

function et(condition, msg){
	var res = true;
	console.log(condition);
	for(let condi of condition){
		console.log(condi);
		//contien
		if(condi.operateur == "contient"){
			console.log(msg[condi.element]+".indexOf("+condi.pattern+")");
			if(msg[condi.element].indexOf(condi.pattern) == -1){
				res = false;
				break;
			}
		}
		else if(condi.operateur == "contientPas"){
			console.log(msg[condi.element]+".indexOf("+condi.pattern+")");
			if(msg[condi.element].indexOf(condi.pattern) == -1){
				res = false;
				break;
			}
		}
		else if(condi.operateur == "est"){
			if(msg[condi.element] != condi.pattern){
				res = false;
				break;
			}
		}
		else if(condi.operateur == "commence"){
			if(!msg[condi.element].startWith(condi.pattern)){
				res = false;
				break;
			}
		}
		
	}
	return res;
}

browser.menus.onShown.addListener((info, tab) => {
	console.log("onShon=>");
	console.log(info.selectedMessages.messages);
	
	//si le message click droité n'est pas selectionné
	if(info.selectedMessages.messages.length == 1){
		//on recréé un menu juste pour ce mesage
		
		browser.menus.removeAll();
		console.log(info.selectedMessages);
		
		//on trouve les destination par raport au filtre
		tabDest = findDestination(info.selectedMessages.messages[0]);
		
		//on dit quelle message doit erte deplacé
		msgSelecttionner = info.selectedMessages.messages;
		
		//on créé le menu
		for(var i = 0; i < tabDest.length; i++){
			var title = tabDest[i].split("/");
			title = title[title.length-1];
			console.log(title);
			browser.menus.create({
				id: tabDest[i],
				title: title,
				contexts: ["message_list"]
			}, onCreated);
		}
		
		browser.menus.refresh()
	}
});

browser.browserAction.onClicked.addListener(()=>{
	// browser.runtime.openOptionsPage()
	browser.windows.getCurrent({}).then((e)=>console.log(e));
});

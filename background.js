//variable globale
let comptes;
let selectedMesages;
let tabDest;

//on desactive l'actionmessage a l'ouvertur
browser.messageDisplayAction.disable();

browser.storage.local.get().then((e)=>{
	if(e.comptes){
		comptes = e.comptes
	}
	else{
		firstOpen();
	}
	console.log("comptes loaded in background");
});

browser.storage.onChanged.addListener((changes, areaName)=>{
	console.log("background Storage Update");
	browser.storage.local.get().then((e)=>{
		comptes = e.comptes
		console.log("comptes loaded in background");
	});
});

function firstOpen(){
	console.log("first opne");
	comptes = {};
	
	browser.accounts.list().then((acc)=>{
		for( var conpte of acc){
			console.log(conpte.id);
			comptes[conpte.id] = [];
		}
		
		browser.storage.local.set({"comptes":comptes}).then(()=>{
			console.log("first open");
			console.log("structure compte saves");
		});
	});
}


/*************** Déplacement des message *************************/

//Action display message
browser.messageDisplayAction.onClicked.addListener(()=>moveMessages());


//racourci clavier
browser.commands.onCommand.addListener(function (command) {
	if (command === "range") {
		moveMessages();
	}
});

/*
Click itème menu
id = dossier destination 
*/
browser.menus.onClicked.addListener((info, tab) => {
	var id = info.menuItemId;
	dest = {accountId:selectedMesages[0].folder.accountId, path:id};
	moveMessages(dest);
});

function moveMessages(dest = false){
	//si message a déplacer
	if(selectedMesages && tabDest && selectedMesages.length && tabDest.length){
		msgId = [];
		selectedMesages.forEach((m)=>msgId.push(m.id));
		
		//si destination non précisé
		if(typeof dest != 'object'){
			dest = {accountId:selectedMesages[0].folder.accountId, path:tabDest[0].destReelle};
		}
		browser.messages.move(msgId,dest);
	}
}

//action display message
//met titre et info si dest trouvé
function updateButton(){
	let enable = false;
	if(selectedMesages && tabDest && selectedMesages.length && tabDest.length){
		//on affiche le bouton
		browser.messageDisplayAction.enable();
		
		//definition du titre
		var title = tabDest[0].dest.split("/");
		title = title[title.length-1];
		browser.messageDisplayAction.setTitle({"title": title});
	}
	else
		browser.messageDisplayAction.disable();
}

//Message change
browser.mailTabs.onSelectedMessagesChanged.addListener((tab, selectedMessages) =>{
	if(selectedMessages.messages){
		tabDest = findDestination(selectedMessages.messages[0]);
		selectedMesages = selectedMessages.messages;
		updateButton();
	}
});

function findDestination(msg){
	var listeDest = [];
	compteMsgId = msg.folder.accountId;
	
	comptes[compteMsgId].forEach((f)=>{
		filtreVrai = false;
		if(f.isAnd)
			filtreVrai = et(f.condition,msg);
		else
			filtreVrai = ou(f.condition,msg);
		
		if(filtreVrai){
			listeDest.push({destReelle:f.destinationReelle, dest:f.destination});
			
		}
	});	

	//verifier qu'il n'y a pas de doublon dans les destination
	//TODO
	
	return listeDest;
}

function et(condition, msg){
	var res = true;
	for(let condi of condition){

		let msgElmnt = concatElement(msg[condi.element]);
		console.log(msgElmnt+" ----> "+condi.operateur+" <---- "+condi.pattern +"?");
		//contien
		if(condi.operateur == "contient"){
			if(msgElmnt.indexOf(condi.pattern) == -1){
				res = false;
				break;
			}
		}
		else if(condi.operateur == "contientPas"){
			if(msgElmnt.indexOf(condi.pattern) == -1){
				res = false;
				break;
			}
		}
		else if(condi.operateur == "estPas"){
			if(msgElmnt == condi.pattern){
				res = false;
				break;
			}
		}
		else if(condi.operateur == "est"){
			if(msgElmnt != condi.pattern){
				res = false;
				break;
			}
		}
		else if(condi.operateur == "commence"){
			
			if(!msgElmnt.startsWith(condi.pattern)){
				res = false;
				break;
			}
		}
		else if(condi.operateur == "fini"){
			if(!msgElmnt.endsWith(condi.pattern)){
				res = false;
				break;
			}
		}
	}
	return res;
}

function ou(condition, msg){
	var res = false;
	console.log(condition);
	for(let condi of condition){

		let msgElmnt = concatElement(msg[condi.element]);
		console.log(msgElmnt+" "+condi.operateur+" "+condi.pattern +"?");
		//contien
		if(condi.operateur == "contient"){
			if(msgElmnt.indexOf(condi.pattern) != -1){
				res = true;
				break;
			}
		}
		else if(condi.operateur == "contientPas"){
			if(msgElmnt.indexOf(condi.pattern) != -1){
				res = true;
				break;
			}
		}
		else if(condi.operateur == "estPas"){
			if(msgElmnt != condi.pattern){
				res = true;
				break;
			}
		}
		else if(condi.operateur == "est"){
			if(msgElmnt == condi.pattern){
				res = true;
				break;
			}
		}
		else if(condi.operateur == "commence"){
			if(msgElmnt.startWith(condi.pattern)){
				res = true;
				break;
			}
		}
		else if(condi.operateur == "fini"){
			if(msgElmnt.endsWith(condi.pattern)){
				res = true;
				break;
			}
		}
	}
	console.log(res);
	return res;
}

//renvoi la concaténation des string présent dans un tableau ou la string si string passer en param
function concatElement(e){
	if(Array.isArray(e)){
		let res="";
		for(let s of e){
			res+=s;
		}
		return res;
	}	
	else{
		return e;
	}
}

browser.menus.onShown.addListener((info, tab) => {
	
		
	//si le message click droité n'est pas selectionné
	if(info.selectedMessages.messages.length == 1){
		//on recréé un menu juste pour ce mesage
		
		browser.menus.removeAll();
		
		//on trouve les destination par raport au filtre
		tabDest = findDestination(info.selectedMessages.messages[0]);
		
		//on dit quelle message doit erte deplacé
		selectedMesages = info.selectedMessages.messages;
		
	}
		//on créé le menu
		for(var i = 0; i < tabDest.length; i++){
			var title = tabDest[i].dest.split("/");
			title = title[title.length-1];
			browser.menus.create({
				id: tabDest[i].destReelle,
				title: title,
				contexts: ["message_list"]
			});
		}
		
		browser.menus.refresh();
		browser.menus.overrideContext({context: "tab", showDefaults:false, tabId:tab.id});
});

browser.browserAction.onClicked.addListener(()=>{
	browser.runtime.openOptionsPage()
});


let accountSelected;
let comptes;
start();

//Load acont and filter an select
async function start(){
	var stor = await browser.storage.local.get();
	var acc = await browser.extension.getBackgroundPage().browser.accounts.list();
	
	accountSelected = (stor.accountSelected)? stor.accountSelected : acc[0].id;
	comptes = stor.comptes;
	
	for( var conpte of acc){
		var selectAccount = document.getElementById("selectAcount");

		//add options
		var o=document.createElement("option");
		o.value = conpte.id;
		o.id = "compte_"+conpte.id;
		o.text = conpte.name;
		if(accountSelected == conpte.id)
			o.selected="selected";
		selectAccount.add(o);
	}
	
	load(accountSelected)
}
/**
 * EVENT
 */

//compte selection
document.querySelector('#selectAcount').addEventListener('change', (e)=>{
	accountSelected = document.querySelector('#selectAcount').value;
	browser.storage.local.set({"accountSelected":accountSelected});
	document.querySelector('#filtres').innerHTML = "";
	load(accountSelected);
});

//ajout filtre event
document.querySelector('#ajout_filtre').addEventListener('click', (e)=>{
	
	var titre = window.prompt("Nom du filtre?");
	if(titre){
		var f = addFiltre(titre);
		addCondi(f);
	}
	document.querySelector('#save').style.background="#0060DF";
});


function addEventCondi(ligne){
	//supprimer ligne conditionelle 
	ligne.querySelector('.supCondi').addEventListener('click', (e)=>{
		var divCondi = e.target.parentElement;
		divCondi.remove();
		document.querySelector('#save').style.background="#0060DF";
	});
	
	//save redevien bleu si modif
	console.log("save blue evvent");
	ligne.querySelectorAll('input, select').forEach((e)=>{
		e.addEventListener('change', ()=>{document.querySelector('#save').style.background="#0060DF"})
		console.log(e);
	});
}

function addEventFiltre(filtre){
	//suprimer filtre
	filtre.querySelector('.supFiltre').addEventListener('click', (e)=>{
		e.target.parentElement.remove();
		document.querySelector('#save').style.background="#0060DF";
	});

	
	//changer titre
	filtre.querySelector('.titreFiltre').addEventListener('click', (e)=>{
		var titre = window.prompt("Nom du filtre?");
		if(titre){
			e.target.innerHTML = titre;
		}
		document.querySelector('#save').style.background="#0060DF";
	});
	
	//Ajouter ligne conditionelle
	filtre.querySelector('.ajouter').addEventListener('click', (e)=>{
		var divFiltre = e.target.parentElement.children[3];
		addCondi(e.target.parentElement);
		document.querySelector('#save').style.background="#0060DF";
	});
	
	
	//save redevien bleu si modif
	filtre.querySelectorAll('input').forEach((e)=>{
		e.addEventListener('change', ()=>{document.querySelector('#save').style.background="#0060DF"})
	});
}

document.querySelector('#save').addEventListener('click', save);

// -----------------------------------ADD div--------------------------------

function addFiltre(titre){
	divFiltres = document.querySelector('#filtres');
	div = document.createElement("div");
	div.className = "filtre";
	div.innerHTML = document.getElementById('sourceFiltre').innerHTML;
	div.querySelector('.titreFiltre').innerHTML=titre;
	addEventFiltre(div);
	divFiltres.append(div);
	
	return div;
}

function addCondi(divFiltre){
	divLigne = document.createElement("div");
	divLigne.className = "lineCondi";
	divLigne.innerHTML = document.getElementById('sourceLineCondi').innerHTML;
	addEventCondi(divLigne);
	divFiltre.querySelector(".listCondi").append(divLigne);
	return divLigne;
}
// ------------------------------- SAVE and LOAD ---------------------


function save(){
	//tableau de filtre
	var filtres = [];
	
	document.querySelectorAll(".filtre").forEach((filtre)=>{//pour chaque filtre
		var titreFiltre = filtre.querySelector(".titreFiltre").innerHTML;
		var isAnd = filtre.querySelector(".isAnd").checked;
		var dest = filtre.querySelector(".dest").value;
		
		var newFiltre = {"titre":titreFiltre, condition:[], "isAnd":isAnd, destination:dest};
		
		//on récupère chaque ligne de condi
		tabLigneCondi = filtre.querySelectorAll(".lineCondi");
		for(var i =0; i < tabLigneCondi.length; i++){
			var ligneCondi = tabLigneCondi[i];
			var condi = {
				element:ligneCondi.children[0].value,
				operateur:ligneCondi.children[1].value,
				pattern:ligneCondi.children[2].value
			};
			
			//si pattern non vide
			if(condi.pattern)
				newFiltre.condition.push(condi);
		}
		
		//on l'ajoute  a la colection si pattern et si destination
		if(newFiltre.condition && newFiltre.destination)
			filtres.push(newFiltre);
		else
			alert("Le filtre "+titreFiltre+" doit contenir au moins une destination et un filtre");
	});
	
	
	comptes[accountSelected] = filtres;

	browser.storage.local.set({"comptes":comptes}).then(()=>{
		document.querySelector("#save").style.background="grey";
		//document.querySelector("#save").style.color="white";
	});
}

function load(compte){
	browser.storage.local.get().then((store)=>{
		if(store.comptes[compte]){
			makeFilters(store.comptes[compte]);
		}
	});
}


//on rempli titre et dest 
function makeFilters(filtres){
	filtres.forEach((filtre)=>{
		//creation du filtre
		filtreDiv = addFiltre(filtre.titre);
		if(filtre.isAnd)
			filtreDiv.querySelector(".isAnd").checked = true;
		filtreDiv.querySelector(".dest").value = filtre.destination;
		
		//ajout des condition
		filtre.condition.forEach((condi)=>{
			let ligneCondi = addCondi(filtreDiv);
			ligneCondi.children[0].value = condi.element;
			ligneCondi.children[1].value = condi.operateur;
			ligneCondi.children[2].value = condi.pattern;
		});
	});
}

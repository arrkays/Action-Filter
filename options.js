let accountSelected;
let comptes;
start();

//Load accout and filter an select
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
	
	var f = addFiltre("<input type='text' placeholder='Nom du filtre?' class='inputTitre' />");
	addCondi(f);
	f.querySelector('.inputTitre').focus();
	document.querySelector('#save').style.background="#0060DF";
});

//Recherche
document.querySelector('#recherche').addEventListener('keyup', (e)=>{
	var str = e.target.value.toLowerCase();
	var i = 0;
	comptes[accountSelected].forEach(filtre=>{
		
		//si on trouve la string rechercher dans le titre ou dans la destination on l'affiche
		if(filtre.titre.toLowerCase().indexOf(str) != -1  || filtre.destination.toLowerCase().indexOf(str) != -1){
			document.querySelector('#id'+i).style.display = "block";
		}
		else{//sinon on le cache
			document.querySelector('#id'+i).style.display = "none";
		}
		
		i++;
	});
});

//Import / export
document.querySelector('#export').addEventListener('click', (e)=>{
	document.querySelector('#impExp').style.display = "block";
	document.querySelector('#textToImp').value = JSON.stringify(comptes[accountSelected]);
	document.getElementById("textToImp").focus();
    document.getElementById("textToImp").select();
});

document.querySelector('#import').addEventListener('click', (e)=>{
	var strImp = document.querySelector('#textToImp').value;
	var imp = JSON.parse(strImp);

	
	if(document.querySelector('#keepFilter').checked){
		imp = imp.concat(comptes[accountSelected]);
	}
	
	//modification de l'objet
	comptes[accountSelected] = imp;
	
	//on save en mémoire
	browser.storage.local.set({"comptes":comptes}).then(()=>{
		document.querySelector('#impExp').style.display = "none";
		document.querySelector('#filtres').innerHTML = "";
		
		load(accountSelected);
	});
});

document.querySelector('#fermerImport').addEventListener('click', (e)=>{
	document.querySelector('#impExp').style.display = "none";
});

//Filtres
function addEventCondi(ligne){
	//supprimer ligne conditionelle 
	ligne.querySelector('.supCondi').addEventListener('click', (e)=>{
		var divCondi = e.target.parentElement;
		divCondi.remove();
		document.querySelector('#save').style.background="#0060DF";
	});
	
	//save redevien bleu si modif
	ligne.querySelectorAll('input, select').forEach((e)=>{
		e.addEventListener('change', ()=>{document.querySelector('#save').style.background="#0060DF"})
	});
}

function addEventFiltre(filtre){
	//suprimer filtre
	filtre.querySelector('.supFiltre').addEventListener('click', (e)=>{
		e.target.parentElement.remove();
		document.querySelector('#save').style.background="#0060DF";
	});

	
	//changer titre
	if(! filtre.querySelector('.inputTitre'))
		filtre.querySelector('.titreFiltre').addEventListener('click', (e)=>{
			e.target.innerHTML = "<input type='text' placeholder='Nom du filtre?' value='"+e.target.innerHTML+"' class='inputTitre' />";
			document.querySelector('#save').style.background="#0060DF";
			e.target.querySelector(".inputTitre").focus();
			e.stopPropagation();
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
	
	//Explorateur parcourir
	filtre.querySelector('.dest').addEventListener('click', ()=>{
		browser.extension.getBackgroundPage().browser.accounts.get(accountSelected).then((e)=>{
			buildExplorer(e.folders, filtre, filtre.querySelector('.destReelle').value);
			filtre.querySelector('.valideFolder').style.display = "block";
			filtre.querySelector('.parcourir').style.display = "none";
			document.querySelector('#save').style.background="#0060DF";
			filtre.querySelector('.explorer').style.display = "block";
		});
	});
	
	//Explorateur parcourir
	filtre.querySelector('.parcourir').addEventListener('click', (e)=>{
		browser.extension.getBackgroundPage().browser.accounts.get(accountSelected).then((e)=>{
			buildExplorer(e.folders, filtre, filtre.querySelector('.destReelle').value);
			//openEplorerAt(filtre.querySelector('.dest').value, filtre.querySelector('.destReelle').value, e.folders, filtre,"");
			filtre.querySelector('.valideFolder').style.display = "block";
			filtre.querySelector('.parcourir').style.display = "none";
			document.querySelector('#save').style.background="#0060DF";
			filtre.querySelector('.explorer').style.display = "block";
		});
		e.stopPropagation();
	});
	
	//Explorateur Valider
	filtre.querySelector('.valideFolder').addEventListener('click', ()=>{
		filtre.querySelector('.explorer').style.display = "none";
		filtre.querySelector('.valideFolder').style.display = "none";
		filtre.querySelector('.parcourir').style.display = "block";
		document.querySelector('#save').style.background="#0060DF";
	});
	
	//Déplier filtre
	filtre.querySelector('.headerFiltre').addEventListener('click', ()=>{
		//displaFiltre(filtre, "none");
		//console.log("header been click");
		toggleFilter(filtre);
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
	// divFiltres.append(div);
	divFiltres.insertAdjacentElement('afterbegin', div);
	
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
	var err = false;

	document.querySelectorAll(".filtre").forEach((filtre)=>{//pour chaque filtre
		var titreFiltre = (filtre.querySelector(".inputTitre")) ? filtre.querySelector(".inputTitre").value : filtre.querySelector(".titreFiltre").innerHTML;
		var isAnd = filtre.querySelector(".isAnd").checked;
		var dest = filtre.querySelector(".dest").value;
		var destReelle = filtre.querySelector(".destReelle").value;
		var newFiltre = {"titre":titreFiltre, condition:[], "isAnd":isAnd, destination:dest, "destinationReelle":destReelle};
		
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
		filtre.querySelector(".inputLineCondi").style.background = "white";
		filtre.querySelector(".dest").style.background = "white";
		if(filtre.querySelector(".inputTitre"))
			filtre.querySelector(".inputTitre").style.background = "white";

		if(newFiltre.condition.length && newFiltre.destination != "" && newFiltre.titre != ""){
			filtre.querySelector(".titreFiltre").innerHTML = titreFiltre;
			filtres.push(newFiltre);
		}
		else{
			if(newFiltre.condition.length == 0){
				filtre.querySelector(".inputLineCondi").style.background = "red";
			}
			
			if(newFiltre.destination == ""){
				filtre.querySelector(".dest").style.background = "red";
			}

			if(newFiltre.titre == ""){
				filtre.querySelector(".inputTitre").style.background = "red";
			}
			
			document.querySelector("#save").style.background = "red";
			err = true;
		}
	});
	
	
	comptes[accountSelected] = filtres;

	browser.storage.local.set({"comptes":comptes}).then(()=>{
		if(!err)
			document.querySelector("#save").style.background="grey";
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
	var i = 0;
	filtres.forEach((filtre)=>{
		//creation du filtre
		filtreDiv = addFiltre(filtre.titre);
		filtreDiv.querySelector(".isAnd").checked = filtre.isAnd;
		filtreDiv.querySelector(".dest").value = filtre.destination;
		filtreDiv.querySelector(".destReelle").value = filtre.destinationReelle;
		filtreDiv.id = "id"+i;
		
		//ajout des condition
		filtre.condition.forEach((condi)=>{
			let ligneCondi = addCondi(filtreDiv);
			ligneCondi.children[0].value = condi.element;
			ligneCondi.children[1].value = condi.operateur;
			ligneCondi.children[2].value = condi.pattern;
		});
		
		displaFiltre(filtreDiv, "none");
		i++;
	});
}

function displaFiltre(filtre, val){
	filtre.querySelector(".listCondi").style.display = val;
	filtre.querySelector(".ajouter").style.display = val;
	filtre.querySelector(".divDest").style.display = val;
	filtre.querySelector(".etOu").style.display = val;
	filtre.querySelector(".repli").style.display = val;
}

function toggleFilter(filtre){
	if(filtre.querySelector(".listCondi").style.display == "block"){
		displaFiltre(filtre, "none");
	}
	else{
		displaFiltre(filtre, "block");
	}
	
}

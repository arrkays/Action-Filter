
function buildExplorer(folder, divFiltre, originePath, tree=""){
		var divExplorer = divFiltre.getElementsByClassName("explorer")[0];
		divExplorer.innerHTML = "";
		//divExplorer.style.display = "block";
		let destReelle;
		let dest;
		let subFolder;
		if(folder.subFolders){//si on est dans un sous dossier
		
			tree.push({"name":folder.name, "folder":folder});
			destReelle = folder.path;
			dest = getNamePath(tree);
			subFolder = folder.subFolders;
			
			
			//on me le bouton retour
			let d = document.createElement("div");
			d.className = "folder";
			d.innerHTML = "<span class='icoFolderRetour'> ⇧ </span> Retour";
			d.addEventListener("click",()=>{
				tree.pop();
				let t = tree.pop();
				buildExplorer(t.folder, divFiltre, originePath, tree);
			});
			divExplorer.appendChild(d);
			
		}
		else{//si on est a la racine
			tree=[{name:"", "folder":folder}];
			destReelle = "";
			dest = "";
			subFolder = folder;
		}
		
		subFolder.forEach((subF)=>{
			let d = document.createElement("div");
			d.className = "folder";
			d.innerHTML = "<span class='icoFolder'>📁</span> "+subF.name;
			d.addEventListener("click",()=>{
				buildExplorer(subF, divFiltre, originePath, tree)
			});
			
			let check = document.createElement("div");
			check.className = (subF.path == originePath)?"checked":"unChecked";
			//check.className = "unChecked"
			check.innerHTML ="✔";
			check.addEventListener("click",()=>{
				check.className = "checked";
				
				divFiltre.querySelector('.explorer').style.display = "none";
				divFiltre.querySelector('.valideFolder').style.display = "none";
				divFiltre.querySelector('.parcourir').style.display = "block";
				document.querySelector('#save').style.background="#0060DF";
				
			});
			
			d.appendChild(check);
			divExplorer.appendChild(d);
			
		});
		
		divFiltre.querySelector(".dest").value = dest;
		divFiltre.querySelector(".destReelle").value = destReelle;
}

// ouvre un folder au sous dossier du path
function openEplorerAt(path, pathReelle, folder, filtre, tree){
	if(path.indexOf("/") != -1){
		let nom = path.split("/")[0];
		let subFolder;
		
		if(tree!=""){//si on est dans un sous dossier
			tree.push({"name":folder.name, "folder":folder});
			destReelle = folder.path;
			subFolder = folder.subFolders;
			console.log("subF");
		}
		else{//si on est a la racine
			tree="123";
			console.log(tree);
			tree=new Array();
			console.log("tree->");
			console.log(tree);
			tree.push({name:"", "folder":folder});

			console.log(tree);
			destReelle = "";
			subFolder = folder;
			console.log("racine");
			console.log(tree);
		}
		console.log(tree);
		subFolder.forEach((subF)=>{
			//console.log("if("+subF.name+" == "+nom+")");
			if(subF.name == nom){
				path = path.substring(path.indexOf("/")+1);
				openEplorerAt(path, pathReelle, subF.subFolders, filtre, tree);
				console.log("recuecive->");
			}
		});
	}
	else{
		console.log(folder);
		console.log(filtre);
		console.log(pathReelle);
		console.log(tree);
		buildExplorer(folder, filtre, pathReelle, tree);
	}
}

function getNamePath(tree){
	let res="";
	for(let t of tree){
		res+="/"+t.name;
	}
	return res.substring(2);
}
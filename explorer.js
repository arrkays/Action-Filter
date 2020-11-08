
function buildExplorer(folder, divFiltre, tree=""){
		var divExplorer = divFiltre.getElementsByClassName("explorer")[0];;
		divExplorer.innerHTML = "";
		divExplorer.style.display = "block";
		
		let subFolder;
		if(folder.subFolders){//si on est dans un sous dossier
		
			tree.push({"name":folder.name, "folder":folder});

			divFiltre.getElementsByClassName("destReelle").value = folder.path;
			
			console.log(divFiltre.getElementsByClassName("destReelle"));
			
			divFiltre.querySelector(".dest").value = getNamePath(tree);
			subFolder = folder.subFolders;
			
			
			//on me le bouton retour
			let d = document.createElement("div");
			d.className = "folder";
			d.innerHTML = "<span class='icoFolderRetour'> ↰ </span> Retour";
			d.addEventListener("click",()=>{
				tree.pop();
				let t = tree.pop();
				buildExplorer(t.folder, divFiltre, tree);
			});
			divExplorer.appendChild(d);
			
		}
		else{//si on est a la racine
			tree=[{name:"", "folder":folder}];
			divFiltre.querySelector(".dest").value = "";
			divFiltre.getElementsByClassName(".destReelle").value = "";
			subFolder = folder;
		}
		
		subFolder.forEach((subF)=>{
			let d = document.createElement("div");
			d.className = "folder";
			d.innerHTML = "<span class='icoFolder'>📁</span> "+subF.name;
			d.addEventListener("click",()=>{
				buildExplorer(subF, divFiltre, tree)
			});
			
			divExplorer.appendChild(d);
		});
}



function getNamePath(tree){
	let res="";
	for(let t of tree){
		res+="/"+t.name;
	}
	return res.substring(2);
}
<?php
include_once('classes.php'); //inclusion des classes utiles

session_start();
?>

<!DOCTYPE html>
<html>

<head>
<meta charset="utf-8"/>
<link rel="stylesheet" href="style_2.css"/>
<title>Contribuer</title>
</head>

<body>

<!-- Début des infos utilisateur -->
<?php include("infos_utilisateur.php"); ?>
<!-- Fin -->

<section>
<h1>SALUT! Tu peux contribuer en nous envoyant des épreuves que nous n'avons pas encore sur notre site</h1>
Nous allons ensuite les examiner et les mettre en ligne. Elles seront ainsi disponibles pour tous.
<p>
<b><u>PS</u>: </b>Vous pouvez envoyer <span style="color:red"><b>maximum 5 fichiers</b></span> à la fois.
Si vous en avez plus, n'hésitez pas à revenir sur la page plusieurs fois pour les envoyer.
<br/><b>Merci!</b>
</p>
</section>

<section id="contribuer">

<!-- On va faire un formulaire ici -->
	<form method="post" action="" enctype="multipart/form-data">
  <div><label for="details">Détails sur épreuves : </label>
      <textarea name="details" id="details" placeholder="Ex: épreuves de l'ENS de Bertoua 
      filière Maths 2020" maxlength="240" required ></textarea>
  </div>
	<p class="choix_fichiers"><label for="fichiers">Fichiers à uploader : </label>
    <input type="file" multiple name="fichiers" id="fichiers" accept=".doc, .docx, .pdf" /><br/>
   <i>Choisissez des fichiers (5 au maximum) au format <b>pdf</b>, <b>doc</b> ou <b>docx</b> pesant maximum <b>4 Mo</b> chacun.</i>
		</p>
  <p class="apercu_fichiers">
    <b>Vueillez choisir les fichiers. Vous pouvez aussi les glisser-déposer dans cette zone.</b>
  </p>
  <p style="display:none" ><progress value="0" max="100"></progress><span></span>
  </p>
	<p><input type="submit" name="boutonEnvoyer" value="Envoyer" />
		</p>
	</form>
<!-- Fin du formulaire -->
<p class="erreur_connexion">

</p>	
</section>

<script>
var p_choix_fichiers=document.querySelector('p.choix_fichiers'),
 p_apercu_fichiers=document.querySelector('p.apercu_fichiers'),
 p_erreur_connexion=document.querySelector('p.erreur_connexion'),
 inputFile=document.querySelector('input[type="file"]'),
 textarea=document.querySelector('textarea'),
 formulaire=document.querySelector('form'),
 progress=document.querySelector('progress'),
 dropbox = document.querySelector("section#contribuer"); //la zone où on fera le glisser-déposer

var fileTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]; //Les types de fichiers autorisés (pdf, doc, docx)


  /* ATTRIBUTION DES GESTIONNAIRES D'EVENEMENTS */
inputFile.addEventListener('change', function(){handleFiles(this.files);}, false);

dropbox.addEventListener("dragenter", dragenter, false);
dropbox.addEventListener("dragover", dragover, false);
dropbox.addEventListener("drop", drop, false);

formulaire.addEventListener('submit', uploaderFichiers, false);

  /* DEFINITION DES FONCTIONS */
function dragenter(e) {
  e.stopPropagation();
  e.preventDefault();
}

function dragover(e) {
  e.stopPropagation();
  e.preventDefault();
}

function drop(e) {
  e.stopPropagation();
  e.preventDefault();

  let dt = e.dataTransfer;
  let files = dt.files;

  handleFiles(files);
  //Vu que ici le fichier est sélectionné par drag & drop, on doit vider le "input file"
  inputFile.value='';
}

function uploaderFichiers(e)
{e.preventDefault();

let li_list = p_apercu_fichiers.querySelectorAll('li'),
tabFile=[]; //le tableau des fichiers à uploader effectivement

if(!li_list) return; //si on n'a sélectionné aucun fichier, on arrête

  for(let i=0, c=li_list.length; i<c; i++)
   {
     if(li_list[i].file && li_list[i].envoiPossible) tabFile.push(li_list[i].file); //si le fichier est valide, on l'ajoute au tableau
   }

  let xhr = new XMLHttpRequest();
  xhr.open('POST', 'upload_contribution.php');
  xhr.onreadystatechange = function() {
                  if (xhr.readyState == 4 && xhr.status == 200) {
                      let resp = xhr.responseText;
                      if(parseInt(resp.trim())>=1) //Si Au moins 1 upload a réussi
                       {alert('Vos '+ resp + ' fichiers ont été correctement envoyés. \n\nMerci!');
                        window.location.href='contribuer.php';
                       }
                      else p_erreur_connexion.innerHTML=resp; // En cas d'échec
                  }
              };

  xhr.upload.onprogress=function(e){//Upload en cours
                      let per=Math.round( (e.loaded*100)/e.total );
                      progress.value=per; progress.nextSibling.innerHTML=per+'%';
                      progress.parentNode.style.display="block";
              };
  xhr.upload.onload=function(e){//Upload terminé
                      progress.value=100; progress.nextSibling.innerHTML=100+'%';
                      progress.parentNode.style.display="none";
              };
  let longueur=tabFile.length;
  if(longueur) //s'il y a des fichiers valides... on les ajoute dans le formData et on envoie.
   {
    let formD=new FormData();
    formD.append('details', textarea.value);
    for(let i=0; i<longueur; i++) {formD.append('mesFichiers[]', tabFile[i]);}
    //alert(longueur + ' fichiers valides trouvés');
    xhr.send(formD);
   }
  else {alert('Aucun fichier valide!');}

}

function handleFiles(listeFichiers)
/*S'exécute lorsqu'on sélectionne les fichiers (via l'input file ou le drag & drop).
Affiche les détails sur les fichiers (nom, taille, ...).*/
  { 
    p_erreur_connexion.innerHTML="";
    let nb=listeFichiers.length;

    if(nb) //si on a sélectionné un fichier (length=1)
     {p_apercu_fichiers.innerHTML="";
       for(let i=0; i<nb, i<5; i++) //On prend les 5 premiers fichiers s'il y en a plus.
        {
          handleOneFile(listeFichiers[i]);
        }
      
     }

    else //si on n'a pas sélectionné de fichier (length=0)
     {p_apercu_fichiers.innerHTML="<b>Vous n'avez choisi aucun fichier.</b>";
     }
  }

function handleOneFile(file)
 {
  let li = document.createElement("li");
  if(validFileType(file))
        {
          let info = document.createElement("span");
          info.innerHTML ="<b>"+file.name +"</b>, file size: <b>" + tailleArrangee(file.size)+"</b>";
          li.appendChild(info);

          li.file = file;
          li.envoiPossible=true;

          if(file.size>4*1024*1024)
           {let newText = document.createTextNode(", Taille du fichier supérieure à 4 Mo. Il ne sera pas envoyé");
            li.appendChild(newText);
            li.envoiPossible=false;
           }
        }
      else{li.innerHTML=file.name+
      ': <b>Type de fichier non valide</b>. Il ne sera pas envoyé.';
          li.envoiPossible=false;
          }

  if(li.envoiPossible) li.style.setProperty('color','black');
  else li.style.setProperty('color','red');
  p_apercu_fichiers.appendChild(li);

 }

function tailleArrangee(nBytes) //affiche la taille dans l'unité appropriée (Ko, Mo, etc.)
{
  var sOutput = nBytes + " octets";
  // partie de code facultative pour l'approximation des multiples
  for (var aMultiples = ["Ko", "Mo", "Go", "To", "Po", "Eo", "Zo", "Yo"], nMultiple = 0, nApprox = nBytes / 1024; nApprox > 1; nApprox /= 1024, nMultiple++) {
    sOutput = nApprox.toFixed(3) + " " + aMultiples[nMultiple] /*+ " (" + nBytes + " octets)"*/;
  }
  // fin de la partie de code facultative
return sOutput;
}

function validFileType(file) //Vérifie si le type du fichier est bon
{
  for(var i = 0; i < fileTypes.length; i++) {
    if(file.type === fileTypes[i]) {
      return true;
    }
  }

  return false;
}

</script>

</body>

</html>

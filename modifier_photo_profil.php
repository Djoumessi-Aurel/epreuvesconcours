<?php
include_once('classes.php'); //inclusion des classes utiles
include_once('fonctions_de_base.php');

session_start();
if(!user_connected()) header('location: index.php');
?>

<!DOCTYPE html>
<html>

<head>
<meta charset="utf-8"/>
<link rel="stylesheet" href="style_2.css"/>
<title>Modifier sa photo de profil</title>
</head>

<body>

<!-- Début des infos utilisateur -->
<?php include("infos_utilisateur.php"); ?>
<!-- Fin -->
<section id="connexion">

<!-- On va faire un formulaire ici -->
	<form method="post" action="" enctype="multipart/form-data">
    <p><label for="motdepasse">Mot de passe : </label><input type="password" name="motdepasse" id="motdepasse" size="30" required autofocus />
		</p>
	<p class="choix_image"><label for="photo_profil">Nouvelle Photo : </label>
    <input type="file" name="photo_profil" id="photo_profil" accept=".jpg, .jpeg, .png, .gif" /><br/>
   <i>Choisissez une image  au format <b>jpg</b>, <b>jpeg</b>, <b>gif</b> ou <b>png</b> pesant maximum <b>1 Mo</b>.</i>
		</p>
  <p class="apercu_image">
    <b>Vueillez choisir un fichier. Vous pouvez aussi glisser-déposer votre image dans cette zone.</b>
  </p>
    <?php if($_SESSION['membre']->getPhoto_profil()!=''){ ?>
    <p><label for="supprimer">Supprimer votre photo de profil : </label><input type="checkbox" name="supprimer" id="supprimer" />
    </p>
    <?php } ?>
	<p><input type="submit" name="boutonModifier" value="Modifier" />
		</p>
	</form>
<!-- Fin du formulaire -->
<p class="erreur_connexion">

</p>	
</section>

<script>
var p_choix_image=document.querySelector('p.choix_image'),
 p_apercu_image=document.querySelector('p.apercu_image'),
 p_erreur_connexion=document.querySelector('p.erreur_connexion'),
 checkbox=document.querySelector('input[type="checkbox"]'),
 inputFile=document.querySelector('input[type="file"]'),
 formulaire=document.querySelector('form'),
 dropbox = document.querySelector("section#connexion"); //la zone où on fera le glisser-déposer

var envoiPossible=false; /* devient TRUE lorsque le fichier sélectionné vérifie nos exigences 
 Cette variable conditionne l'envoi du formulaire (uniquement lorsque la checkbox n'est pas cochée) */

var fileTypes = [
  'image/jpeg',
  'image/pjpeg',
  'image/png',
  'image/gif'
]; //Les types de fichiers autorisés

if(checkbox) //car il y a des cas où il n'y a pas de checkbox sur cette page
  { checkbox.onchange=function(){
    if(this.checked) //si on coche la case 'Supprimer votre photo de profil'
    {p_choix_image.style.display='none'; p_apercu_image.style.display='none';
    }
    else //si on décoche la case
      {p_choix_image.style.display='block'; p_apercu_image.style.display='block';
      }
    };
  }

  /* ATTRIBUTION DES GESTIONNAIRES D'EVENEMENTS */
inputFile.addEventListener('change', function(){handleFiles(this.files);}, false);

dropbox.addEventListener("dragenter", dragenter, false);
dropbox.addEventListener("dragover", dragover, false);
dropbox.addEventListener("drop", drop, false);

formulaire.addEventListener('submit', uploaderImage, false);

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

function uploaderImage(e)
{e.preventDefault();
  //si la case supprimer n'existe pas ou n'est pas cochée
  if((!checkbox) || (checkbox && !checkbox.checked)) 
      if(!envoiPossible) return; //si le fichier choisi ne respecte pas les exigences pour l'upload, on arrête.

let monImage = p_apercu_image.querySelector('img');

  let xhr = new XMLHttpRequest();
  xhr.open('POST', 'upload_photo_profil.php');
  xhr.onreadystatechange = function() {
                  if (xhr.readyState == 4 && xhr.status == 200) {
                      let resp = xhr.responseText;
                      if(resp.trim()==='OK') window.location.href='profil.php'; //En cas de réussite de l'opération
                      else p_erreur_connexion.innerHTML=resp; // En cas d'échec
                  }
              };

  let formD=new FormData(formulaire);
  //Si le fichier est chargé et conforme, on l'uploade
  if(monImage && envoiPossible) formD.append('monImage', monImage.file);

  xhr.send(formD);

}

function handleFiles(listeFichiers)
/*S'exécute lorsqu'on sélectionne un fichier (via l'input file ou le drag & drop).
Affiche un aperçu de l'image sélectionnée, ainsi que sa taille.*/
  { 
    p_erreur_connexion.innerHTML="";

    if(listeFichiers.length) //si on a sélectionné un fichier (length=1)
     {p_apercu_image.innerHTML="";
      let file=listeFichiers[0];

       if(validFileType(file))
        { let img = document.createElement("img");
          img.src = window.URL.createObjectURL(file);
          img.file=file;
          img.onload = function() {
            window.URL.revokeObjectURL(this.src);
          };
          p_apercu_image.appendChild(img);

          let info = document.createElement("span");
          info.innerHTML ="file name: <b>"+file.name +"</b><br/>file size: <b>" + tailleArrangee(file.size)+"</b>";
          p_apercu_image.appendChild(info);

          envoiPossible=true;

          if(file.size>1024*1024)
           {let newText = document.createTextNode("Taille du fichier supérieure à 1 Mo");
            p_apercu_image.appendChild(newText);
            envoiPossible=false;
           }
        }
      else{p_apercu_image.innerHTML=file.name+
      ': <b>Type de fichier non valide</b>. Veuillez choisir un autre fichier.';
          envoiPossible=false;
          }

     }

    else //si on n'a pas sélectionné de fichier (length=0)
     {p_apercu_image.innerHTML="<b>Vous n'avez choisi aucun fichier.</b>";
      envoiPossible=false;
     }
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

<?php
include_once('classes.php'); //inclusion des classes utiles

session_start();
include_once('fonctions_de_base.php');
?>
<meta charset="utf-8"/>
<?php
if(!user_niveau1())
//Utilisateur non autorisé (pas admin, pas modérateur)
 { echo "Vous n'avez pas l'autorisation d'accéder à cette page<br/>";
	//echo '<a href="connexion.php?PGV='.get_url_actuelle().'">CONNEXION</a>';
	echo '<a href="index.php">ACCUEIL</a>';
 }
else //Utilisateur connecté en tant qu'admin ou modérateur
 {
?>

<!DOCTYPE html>
<html>

<head>
<link rel="stylesheet" href="style_2.css"/>
<title>Base de données des épreuves</title>
</head>

<!-- Cette page permet de choisir la filière pour laquelle on veut uploader des épreuves
elle permet aussi de visualiser les épreuves disponibles pour une filière donnée -->
<body>

<!-- Début des infos utilisateur -->
<?php include("infos_utilisateur.php"); ?>
<!-- Fin -->

<section id="parametres">

<section id="ecoles">
<?php
generer_select();

?>
</section>

<section id="filieres">
</section>

</section>

<section id="epreuves">

</section>

<script>   
/* Génération des filières */
var monSelect=document.querySelector("select#concours");
var sectionFilieres=document.querySelector("section#filieres");
var sectionEpreuves=document.querySelector("section#epreuves");
var code_ecole;

monSelect.onchange=function(e){		//Lorsqu'on sélectionne une école... il faut afficher ses filières
	code_ecole=monSelect.options[monSelect.selectedIndex].getAttribute("value");
    //alert (code_ecole);
    code_ecole=encodeURIComponent(code_ecole);
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'upload_page1_2.php?codeEcole='+code_ecole);
    //xhr.setRequestHeader("Content-Type", "application/x-www-formurlencoded"); // car on utilise 'POST'

    /* Gestion des événements du xhr */
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) //si tout s'est bien passé...
		{sectionFilieres.innerHTML =xhr.responseText;//	ON AFFICHE LES FILIERES
			
			/* Evénements gérant la génération de la liste des épreuves */
			sectionEpreuves.innerHTML=""; //on vide d'abord la section des épreuves
			var filieres=sectionFilieres.querySelectorAll("td[id]");
			for(var i=0, nb=filieres.length; i<nb; i++)
			{ filieres[i].onclick=function(e2){
				var code_filiere=encodeURIComponent( this.getAttribute("id") );
				var xhr2 = new XMLHttpRequest();
				xhr2.open('GET', 'generer_epreuves.php?codeFiliere='+code_filiere+'&voirLiens=oui');
				xhr2.onreadystatechange = function(){
					if (xhr2.readyState == 4 && xhr2.status == 200) //si tout s'est bien passé...
					{
					sectionEpreuves.innerHTML = xhr2.responseText;//	ON AFFICHE LES EPREUVES
					}

				};
				xhr2.send();
					};
			}
        }
    };
    /* Fin des events du xhr */

	xhr.send(); //Envoi de la requête: ça devrait nous renvoyer les filières
	
    };


function getParent(e,typeBalise)	//Recherche le parent le plus proche (du déclencheur de l'événement e) dont le nom de balise est typeBalise
	{var target=e.target||e.srcElement;
	while(target.nodeName.toLowerCase()!=typeBalise.toLowerCase())
	{target=target.parentNode;
	}
	return target;	//au final, target est l'élément dont le nom de balise est typeBalise
	}

</script>

</body>
</html>

<?php
 } //ON FERME le else{ qu'on a ouvert tout en haut de la page.

function generer_select() //Cette fonction crée la balise <select> contenant la liste des concours/examens
 {		 
	 //accès à la BDD

	 $type_concours=array(); //il contiendra les différents types de concours

	 global $bdd;
	 $reponse=$bdd->query('SELECT DISTINCT type_concours FROM ecoles ORDER BY type_concours'); //lancer la requête
	 while($donnees=$reponse->fetch()) //On parcourt les résultats ligne par ligne
	  {    $type_concours[]=$donnees['type_concours'];
	  }
	 $reponse->closeCursor(); //Termine le traitement de la requête
    echo '<label for="concours">Concours/Examen: </label>';
    echo '<select id="concours">';
    echo '<option value="">Sélectionnez...</option>';
	 foreach($type_concours as $element) //On parcours les types de concours
	  { echo '<optgroup label= "'.$element.'" >';

		/* écrivons le contenu du optgroup*/
		$reponse=$bdd->query('SELECT * FROM ecoles WHERE type_concours= "'.$element.'"'.' ORDER BY nom_reduit'); //lancer la requête
		while($donnees=$reponse->fetch()) //On parcourt les résultats ligne par ligne
		 { echo '<option value="'.$donnees['code_ecole'].'">'.
			 $donnees['nom_reduit'].'</option>';
		 }
		$reponse->closeCursor();

		/*Fin du contenu du optgroup*/
		echo '</optgroup>';
      }
      
      echo '</select>';
 }

?>
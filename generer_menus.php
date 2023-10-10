<?php
/*La fonction ici présentée permet de générer les menus (celui du header et celui de la section centrale
de la page index.php. On doit l'inclure (une seule fois) dans toute page qui génère ces menus*/

function generer_menus($type_de_bloc)
 {	if($type_de_bloc!='header' and $type_de_bloc!='section_centrale') return 0; //Sortir de la fonction dans ces cas.
	 

	 $type_concours=array(); //il contiendra les différents types de concours

	 global $bdd;
	 $reponse=$bdd->query('SELECT DISTINCT type_concours FROM ecoles ORDER BY type_concours'); //lancer la requête
	 while($donnees=$reponse->fetch()) //On parcourt les résultats ligne par ligne
	  {    $type_concours[]=$donnees['type_concours'];
	  }
	 $reponse->closeCursor(); //Termine le traitement de la requête

	 foreach($type_concours as $element) //On parcours les types de concours
	  { echo '<div class="menu1">';
	  
	  /*L'id de la balise <p> contenant le tire du menu. Les id ne DOIVENT PAS avoir d'accents*/
	  $idTitreMenu=str_replace(' ','_',strtolower(skip_accents($element)));

	    if($type_de_bloc=='header') //cas du menu de navigation du site
		{echo '<p class="titre_menu"><a href="index.php#'.$idTitreMenu.'">'.$element.'</a></p>';
		}
		elseif($type_de_bloc=='section_centrale') //cas de la section centrale de la page index
		{
			 echo '<p class="titre_menu" id="'.$idTitreMenu.'" title="Cliquez pour réduire">'.  //Titre du menu déroulant
			$element.'<img src="fleche_haut.png" alt=""/></p>';
		}
		/* écrivons le contenu du menu*/
		echo '<ul class="liste">';
		$reponse=$bdd->query('SELECT * FROM ecoles WHERE type_concours= "'.$element.'"'.' ORDER BY nom_reduit'); //lancer la requête
		while($donnees=$reponse->fetch()) //On parcourt les résultats ligne par ligne
		 { echo '<li class="menu2"><a href="concours.php?codeEcole='.$donnees['code_ecole'].'">'.
			 $donnees['nom_reduit'].'</a></li>';
		 }
		$reponse->closeCursor();

		echo '</ul>';
		/*Fin du contenu du menu*/
		echo '</div>';
	  }
 }

		
function skip_accents( $str, $charset='utf-8' ) //enlève les accents
	{
 
    $str = htmlentities( $str, ENT_NOQUOTES, $charset );
    
    $str = preg_replace( '#&([A-za-z])(?:acute|cedil|caron|circ|grave|orn|ring|slash|th|tilde|uml);#', '\1', $str );
    $str = preg_replace( '#&([A-za-z]{2})(?:lig);#', '\1', $str );
    $str = preg_replace( '#&[^;]+;#', '', $str );
    
    return $str;
		}
 
?>
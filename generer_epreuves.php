<?php	//CETTE PAGE PERMET D'AFFICHER LA LISTE DES EPREUVES POUR UNE FILIERE DONNEE

include_once('fonctions_de_base.php'); //INCLUSION DES FONCTIONS UTILES, avant toute chose.

	if(isset($_GET['codeFiliere']))  //test de l'existence de la variable
		{ $codeFiliere=htmlspecialchars($_GET['codeFiliere']); //sécurisation du contenu de la variable
			
	$resultats=array();//CONTIENDRA LES RESULTATS DE LA REQUETE

	$morceauAnnee='';
	$monArray=array( $codeFiliere );

	//Si le paramètre annee est défini (Cas de la page upload.php)
	if(isset($_GET['annee'])) 
	{$morceauAnnee=' AND annee=? ';
	 $monArray=array( $codeFiliere, $_GET['annee']);
	}
	//FIN DE SI

		$req=$bdd->prepare(
		'SELECT nom_ecole, nom_reduit, nom_filiere, niveau, annee, matiere, lien FROM filieres '.
		'INNER JOIN epreuves USING(code_filiere) '.
		'INNER JOIN ecoles USING(code_ecole) '.
		'WHERE code_filiere=? '.$morceauAnnee.' ORDER BY annee DESC, matiere'); //préparer la requête
		$req->execute( $monArray )
					or die(print_r($req->errorInfo())); //lancer la requête
		if($req)  //on vérifie que la requête n'a pas échoué
			{
			$compteur_resultats=0;
			while($donnees=$req->fetch()) //On parcourt les résultats ligne par ligne
				{$compteur_resultats++;
				 $resultats[]=$donnees;
				}
				$req->closeCursor(); //Termine le traitement de la requête
            if($compteur_resultats==0)  //s'il n'y a aucun résultat
                {echo 'Aucune filière trouvée!'; header('location:vide.txt'); } 

			}
		else {echo 'Echec de la requête SELECT'; header('location:vide.txt'); }//si la requête échoue...
		}
	else {header('location:vide.txt'); }//si la variable n'existe pas...
 ?>

<?php
$voirLiens="non";
if(isset($_GET['voirLiens']))  //test de l'existence de la variable
{ $voirLiens=htmlspecialchars($_GET['voirLiens']); //sécurisation du contenu de la variable
	//cette variable détermine si on va afficher la colonne présentant les liens des épreuves.
	//On doit le faire si on sur la page d'upload (mode administrateur)
}
?>

<?php //Ici, on est sûr qu'on a des résultats
	echo "<h3>".$resultats[0]['nom_ecole'].
	" (".$resultats[0]['nom_reduit'].")</h3>";
	$chaineNiveau = $resultats[0]['niveau'] ? ', <b>niveau '.$resultats[0]['niveau'].'</b>' : '';
	echo '<p class="titre"><b>Filière:</b> '.$resultats[0]['nom_filiere'].
	$chaineNiveau.'</p>';

if(isset($_GET['annee'])) echo '<b>Année: '.$_GET['annee'].'</b>';

	echo '<p><table>';
	echo '<caption>Epreuves</caption>';
	echo '<tr><th>N°</th><th>Année</th><th>Matière</th>';
	if($voirLiens=="oui") echo '<th>Lien</th>';
	echo '</tr>';
	$nb=0; //Le nombre de lignes du tableau
	$nom_fichier = '';
	$colspan= ($voirLiens=="oui")? 4:3; //colspan de la cellule de séparation
	$annee=$resultats[0]['annee'];
		foreach($resultats as $element)
		{$nb++;
		 if($annee!=$element['annee']) //Si l'année diffère de celle de la ligne précédente
			{//On ajoute une ligne vide pour bien faire la séparation.
				echo '<tr><td colspan="'.$colspan.'"></td></tr>';
				$annee=$element['annee'];
			}

			$nom_fichier = explode('/', $element['lien']);
			$nom_fichier = 'telecharger.php?fichier=' . end($nom_fichier);

            echo '<tr> <td>'.$nb.'</td> <td>'.
            $element['annee'].'</td>'.
			'<td><a href="'.$nom_fichier.'" >'.$element['matiere'].'</a></td>';
			
		if($voirLiens=="oui") echo '<td>'.$element['lien'].'</td>';
        echo '</tr>';
        }
    echo '</table></p>';
?>

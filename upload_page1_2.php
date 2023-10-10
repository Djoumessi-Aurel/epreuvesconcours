<?php	//CETTE PAGE PERMET D'AFFICHER LES FILIERES POUR UNE ECOLE DONNEE

include_once('fonctions_de_base.php'); //INCLUSION DES FONCTIONS UTILES, avant toute chose.


	if(isset($_GET['codeEcole']))  //test de l'existence de la variable
		{ $codeEcole=htmlspecialchars($_GET['codeEcole']); //sécurisation du contenu de la variable
			
	$resultats=array();//CONTIENDRA LES RESULTATS DE LA REQUETE
		$req=$bdd->prepare('SELECT nom_reduit, nom_ecole, type_concours, nom_filiere, niveau, code_filiere FROM ecoles inner join filieres '.
		'using(code_ecole) WHERE code_ecole=? ORDER BY niveau'); //préparer la requête
		$req->execute( array( $codeEcole ) )
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

<?php //Ici, on est sûr qu'on a des résultats
	if($resultats[0]['type_concours']=='Examens Officiels')
		echo '<h1>'.'Examen du '.$resultats[0]['nom_reduit'].'</h1>'; //Cas d'un examen officiel
	else {
		echo "<h1>Concours de l'".$resultats[0]['nom_ecole'].		//Cas d'un concours
		" (".$resultats[0]['nom_reduit'].")</h1>";
	}

    echo '<h3><em><u>Filières:</u></em></h3>';
    echo '<table>';
    $nb=0; //Le nombre de lignes du tableau
		foreach($resultats as $element)
        {$nb++;
		$chaineNiveau = $element['niveau'] ? '  <i>[Niveau '.$element['niveau'].']</i>' : '';
            echo '<tr> <th>'.$nb.'</th><td id= "'.$element['code_filiere'].'" >'.
            $element['nom_filiere'].$chaineNiveau.'</td>'.
            '<td><a href="upload.php?codeFiliere='.$element['code_filiere'].'" >Uploader...</a></td>';
        echo '</tr>';
        }
    echo '</table>';
?>

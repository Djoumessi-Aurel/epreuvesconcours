<?php
include_once('classes.php'); //inclusion des classes utiles
include_once('fonctions_de_base.php');

session_start();
EssaiConnectionAutomatique(); //connexion automatique si possible
?>

<!DOCTYPE html>
<html>

<head>
<meta charset="utf-8"/>
<link rel="stylesheet" href="animate.min.css"/>
<link rel="stylesheet" href="style_site.css"/>
<?php
	if(isset($_GET['codeEcole']))  //test de l'existence de la variable
		{ $nomEcole=htmlspecialchars($_GET['codeEcole']); //sécurisation du contenu de la variable
			
	$resultats=array();//CONTIENDRA LES RESULTATS DE LA REQUETE
		$req=$bdd->prepare('SELECT nom_reduit, nom_ecole, type_concours, nom_filiere, niveau, code_filiere FROM ecoles inner join filieres '.
		'using(code_ecole) WHERE code_ecole=?'); //préparer la requête
		$req->execute( array( $_GET['codeEcole'] ) )
					or die(print_r($req->errorInfo())); //lancer la requête
		if($req)  //on vérifie que la requête n'a pas échoué
			{
			$compteur_resultats=0;	
			while($donnees=$req->fetch()) //On parcourt les résultats ligne par ligne
				{$compteur_resultats++;
				 $resultats[]=$donnees;
				}
				$req->closeCursor(); //Termine le traitement de la requête
			if($compteur_resultats==0) header('location:index.php');  //On reconduit à la page d'accueil s'il n'y a rien à afficher

			}
		else {header('location:index.php');}//si la requête échoue... on reconduit
		}
	else {header('location:index.php');}//si la variable n'existe pas... on reconduit

$titre_page = $resultats[0]['type_concours']=='Examens Officiels' ? 
	'Examen du '.$resultats[0]['nom_reduit'] : 'Concours de l\''.$resultats[0]['nom_reduit']; //Le titre de la page, selon qu'il s'agisse d'un examen officiel ou d'un concours
 ?>
<title><?php echo 'Anciennes épreuves: '.$titre_page; ?></title>
</head>

<body>
<!-- INCLUSION DE LA PAGE CONTENANT LA FONCTION generer_menus() -->
<?php include_once("generer_menus.php"); ?>

<!-- Début du header -->
	<?php include_once("header.php"); ?>
<!-- Fin du header -->

<div id="corps">	<!-- Début du corps de la page -->

	<section id="section_gauche">	<!-- Section gauche de la page -->

<section id="section_centrale">

<?php
	if($resultats[0]['type_concours']=='Examens Officiels') echo '<h1>'.$titre_page.'</h1>'; //Cas d'un examen officiel
	else {
		echo "<h1>Concours de l'".$resultats[0]['nom_ecole'].		//Cas d'un concours
		" (".$resultats[0]['nom_reduit'].")</h1>";
	}

	echo '<h2><em><u>Filières:</u></em></h2>';
	echo "<ul>";
		foreach($resultats as $element)
		{ $chaineNiveau = $element['niveau'] ? '  <i>[Niveau '.$element['niveau'].']</i>' : '';//chaîne qui indique le niveau du concours (bac, licence, etc.)
			
			echo '<li class="filiere"><a href="epreuves.php?codeFiliere='.$element['code_filiere'].'">'.
			$element['nom_filiere'].$chaineNiveau.'</a></li>';
		}
	echo "</ul>";
?>

</section>

<!-- Partie des commentaires -->
<?php include_once("formulaire_et_com.php");
creer_formulaire_et_com('2_'.$_GET['codeEcole']); //Inclusion de la partie commentaires correspondant à la page ouverte
?>
<!-- Fin commentaires -->

	</section>

<!-- Section droite de la page -->
	<?php include_once("section_droite.php"); ?>
<!-- Fin  -->

</div>		<!-- Fin du corps de la page -->

<!-- Début du pied de la page -->
	<?php include_once("footer.php"); ?>
<!-- Fin du pied de la page -->

	<!-- Maintenant, le code javascript -->
<script src="gestion_menus.js"></script>

</body>

</html>
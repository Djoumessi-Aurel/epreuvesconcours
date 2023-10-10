<?php
include_once('classes.php'); //inclusion des classes utiles

session_start();
include_once('fonctions_de_base.php');

if(!user_niveau1()) header('location: index.php'); //Si l'utilisateur n'est pas autorisé, On reconduit.
?>

<!DOCTYPE html>
<html>

<head>
<meta charset="utf-8"/>
<link rel="stylesheet" href="style_2.css"/>
<title>Réception des épreuves</title>
</head>

<body>

<!-- Début des infos utilisateur -->
<?php include("infos_utilisateur.php"); ?>
<!-- Fin -->

<?php

 if(isset($_GET['codeFiliere']) and isset($_POST['annee']))
 {
   if(filiereExiste($_GET['codeFiliere']) and checkAnnee($_POST['annee'])) 
   //La filière existe et que l'année est conforme, on peut uploader.
   {
	   echo '<p><b><a href=upload.php?codeFiliere='.$_GET['codeFiliere'].' >'.
	   'RETOUR A LA PAGE D\'UPLOAD</a></b></p>';
	if(isset($_POST['nomEpreuve1']) and isset($_FILES['fichier1'])) //Fichier 1
	{
		uploader($_POST['nomEpreuve1'], $_FILES['fichier1']);
	}

	if(isset($_POST['nomEpreuve2']) and isset($_FILES['fichier2'])) //Fichier 2
	{
		uploader($_POST['nomEpreuve2'], $_FILES['fichier2']);
	}

	if(isset($_POST['nomEpreuve3']) and isset($_FILES['fichier3'])) //Fichier 3
	{
		uploader($_POST['nomEpreuve3'], $_FILES['fichier3']);
	}

	if(isset($_POST['nomEpreuve4']) and isset($_FILES['fichier4'])) //Fichier 4
	{
		uploader($_POST['nomEpreuve4'], $_FILES['fichier4']);
	}

	if(isset($_POST['nomEpreuve5']) and isset($_FILES['fichier5'])) //Fichier 5
	{
		uploader($_POST['nomEpreuve5'], $_FILES['fichier5']);
	}

   }

   else echo 'Ou code filière <b>'.htmlspecialchars($_GET['codeFiliere']).'</b> non trouvé!';
 }
 else {echo 'codeFiliere: '.isset($_GET['codeFiliere']); echo 'Année: '.isset($_POST['annee']); 
	echo '<br/>Code erreur: '.$_FILES['fichier1']['error'];
	}
?>


<?php
function uploader($nomEpreuve, $fichier)
 {
	echo '<p class="rapport_upload">';
	if(!checkNomEpreuve($nomEpreuve)) return false; //Si nomEpreuve est non conforme, on arrête là.

	//on teste si l'upload s'est bien passé. Ici on est sûr que le nom de l'épreuve est conforme.
	if($fichier['error']==0)
		{
		 echo 'Chemin du fichier d\'origine: <b>'.$fichier['name'].'</b> <br/>';
		 echo 'Taille du fichier: '.$fichier['size'].' octets <br/>';
		 echo 'Chemin du fichier temporaire: '.$fichier['tmp_name'].' <br/>';
		 
		 $extensionsOK=array('pdf','jpg','png','doc','docx','xls','xlsx');//extensions autorisées
		 $infosfichier=pathinfo($fichier['name']);
		 $extension=strtolower($infosfichier['extension']); //on récupère l'extension en minuscule.
		 
		 if($fichier['size']>8*1024*1024) //On teste la taille du fichier
			 echo '<strong>Votre fichier pèse plus de 8 Mo</strong>';

		 elseif(in_array($extension,$extensionsOK)) //Ici tout est bon. On accepte donc le fichier.
			{
			$cheminFichier='../ressources/uploads/'.strtolower($_GET['codeFiliere']).
			" ".$_POST['annee']." ".$nomEpreuve.'.'.$extension;//chemin du fichier

			FinaliserUpload($_GET['codeFiliere'], $_POST['annee'], $nomEpreuve, $cheminFichier, $fichier);
			 }

		 else
		  {echo '<strong>Type de fichier non autorisé</strong>';}//on teste l'extension du fichier
		}
	else {echo 'L\'envoi du fichier a merdé grave!<br/>Code d\'erreur: '.$fichier['error'];}
	
	echo '</p>';
 }
?>

<?php
 function filiereExiste($codeFiliere) //Teste si le code filière existe dans la base de données
 {
	 //accès à la BDD
	global $bdd;
	$req=$bdd->prepare('SELECT COUNT(*) as total FROM filieres WHERE code_filiere=?'); //préparer la requête
	$req->execute( array( $codeFiliere ) )
				or die(print_r($req->errorInfo())); //lancer la requête

	$nb_lignes = $req->fetch()['total'];
	$req->closeCursor();
	if($nb_lignes>=1) return true; //Si on a trouvé le code filiere, on renvoie true

 return false;
 }
?>

<?php
 function checkNomEpreuve($nomEpreuve) //Vérifie la conformité du nom de l'épreuve.
 {//détail regex: 1.commencer par une lettre ou un chiffre, 2.se terminer par une lettre ou un chiffre
//3. caractères autorisés: - _ chiffres, lettres et espaces.
$regex1="#^[a-zâäàéèùûêëîïôöçñ0-9]+[-\w âäàéèùûêëîïôöçñ]*[a-zâäàéèùûêëîïôöçñ0-9]$#i";

if(!preg_match($regex1,$nomEpreuve)) //si le nom de l'épreuve est non conforme...
	{echo "Nom de l'épreuve non conforme! </p>"; return false;}
else echo "Nom de l'épreuve: ".$nomEpreuve."<br/>";

return true;
 }

 function checkAnnee($annee) //Vérifie la conformité de l'année
 {$regex2="#^[1-2][0-9]{3}$#i";
 if(!preg_match($regex2,$annee)) //si l'année est non conforme...
 	{echo 'Année non conforme! </p>'; return false;}
 else echo "Année: ".$annee."<br/>";

 return true;
 }

function FinaliserUpload($codeFiliere, $annee, $nomEpreuve, $cheminFichier, $fichier)
/*Mentionne l'épreuve dans la BDD et uploade le fichier sur le serveur.
Gère aussi le cas où l'épreuve est déjà mentionnée dans la BDD */
 { $id=0; $lien='';
	 //accès à la BDD

	global $bdd;
	$req=$bdd->prepare('SELECT id, lien FROM epreuves WHERE code_filiere=? 
	and annee=? and matiere=?'); //préparer la requête
	$req->execute( array( $codeFiliere, $annee,
	$nomEpreuve ) )
				or die(print_r($req->errorInfo())); //lancer la requête

	while($donnees=$req->fetch()) 
	  {$id=$donnees['id'];
		$lien=$donnees['lien'];
		echo ' Cette épreuve EST DEJA mentionnée dans la table EPREUVES(id='.$id.').';
	  }
	$req->closeCursor();

	  if($id==0) //si l'épreuve n'est pas mentionnée dans la base de donnée, alors on INSERT INTO.
	  {
		$req=$bdd->prepare('INSERT INTO epreuves(code_filiere, annee, matiere, lien) '.
		'VALUES(?, ?, ?, ?)'); //préparer la requête
		$req->execute( array( $codeFiliere, $annee,
		$nomEpreuve, $cheminFichier ) )
					or die(print_r($req->errorInfo())); //lancer la requête
	
		$req->closeCursor();
		echo ' Epreuve mentionnée dans la BDD avec succès.';
	  }

	  else //si l'épreuve est déjà mentionnée, alors on UPDATE le lien dans la table epreuves
	  {deleteFileIfExists2($cheminFichier); //On supprime d'abord l'ancienne version du fichier sur le serveur

		$req=$bdd->prepare('UPDATE epreuves SET lien=? WHERE id=?'); //préparer la requête
		$req->execute( array( $cheminFichier, $id ) )
					or die(print_r($req->errorInfo())); //lancer la requête
	
		$req->closeCursor();
		echo ' Lien de l\'épreuve MIS à JOUR.';
	  }

//Et puis enfin, on valide l'upload
	move_uploaded_file($fichier['tmp_name'],utf8_decode($cheminFichier));
echo '<br/><strong class="upload_ok">Fichier correctement uploadé</strong> à l\'adresse: <b>'.
$cheminFichier.'</b>';

 }

/*La fonction deleteFileIfExists est déjà définie dans fonctions_de_base.php
Elle est différente de celle ci-dessous (il n'y a pas de "echo")
Pour différencier les deux, j'ai ajouté 2 au nom de la fonction ci-dessous
*/
 function deleteFileIfExists2($cheminFichier)
 { $chemin=utf8_decode($cheminFichier);
	 if(file_exists($chemin))
	{ if(unlink($chemin)) echo ' ANCIEN Fichier supprimé avec succès.';
		else echo ' Echec de la SUPPRESSION de l\'ancien fichier.';
	}

	else {echo ' Le fichier à supprimer n\'existe pas.';}
 }
 
?>

</body>
</html>
<?php
include_once('classes.php'); //inclusion des classes utiles

session_start();
include_once('fonctions_ins_con.php');
reconduireSiBesoin(); //si l'utilisateur est déjà connecté, il faut reconduire
?>

<!DOCTYPE html>
<html>

<head>
<meta charset="utf-8"/>
<link rel="stylesheet" href="style_2.css"/>
<title>Connexion</title>
</head>

<body>

<!-- Début des infos utilisateur -->
<?php include_once("infos_utilisateur.php"); ?>
<!-- Fin -->

<section id="connexion">
<p>
<?php
$PGV=''; //Page voulue
if( isset($_GET['PGV']) ) {$PGV='?PGV='.$_GET['PGV'];}
echo '<a href="inscription.php'.$PGV.'">Inscrivez-vous</a> si vous ne l\'êtes pas déjà';
?>
</p>
<!-- On va faire un formulaire ici -->
	<form method="post" action="">
	<p><label for="pseudo">Pseudo : </label><input type="text" name="pseudo" id="pseudo"  required size="30" placeholder="Votre identifiant" autofocus />
		</p>
	<p><label for="motdepasse">Mot de passe : </label><input type="password" name="motdepasse" id="motdepasse" size="30" required />
		</p>
	<p><label for="autoconnect">Connexion automatique : </label><input type="checkbox" name="autoconnect" id="autoconnect" />
		</p>
	<p><input type="submit" name="boutonConnexion" value="Connexion" />
		</p>
	</form>
<!-- Fin du formulaire -->
<p class="erreur_connexion">
<?php
/* VOYONS SI ON VA ACCEPTER DE CONNECTER L'UTILISATEUR OU NON */
if( isset($_POST['pseudo']) and isset($_POST['motdepasse']) )
{ $pseudo=$_POST['pseudo'];	$mdp=$_POST['motdepasse'];
	$table='membres';
	 //CONNECTION A LA BDD
	connecterUtilisateur($pseudo,$mdp,$bdd,$table);
}

/* FIN */
?>
</p>	
</section>

</body>

</html>

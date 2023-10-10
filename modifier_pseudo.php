<?php
include_once('classes.php'); //inclusion des classes utiles
include_once('fonctions_ins_con.php');

session_start();
if(!user_connected()) header('location: index.php');
?>

<!DOCTYPE html>
<html>

<head>
<meta charset="utf-8"/>
<link rel="stylesheet" href="style_2.css"/>
<title>Modifier son pseudo</title>
</head>

<body>

<!-- Début des infos utilisateur -->
<?php include("infos_utilisateur.php"); ?>
<!-- Fin -->
<section id="connexion">

<!-- On va faire un formulaire ici -->
	<form method="post" action="">
    <p><label for="motdepasse">Mot de passe : </label><input type="password" name="motdepasse" id="motdepasse" size="30" required autofocus />
		</p>
	<p><label for="pseudo">Nouveau Pseudo : </label><input type="text" name="pseudo" id="pseudo"  required size="30" placeholder="Votre nouvel identifiant" />
		</p>
	<p><input type="submit" name="boutonModifier" value="Modifier" />
		</p>
	</form>
<!-- Fin du formulaire -->
<p class="erreur_connexion">
<?php
/* VOYONS SI ON VA ACCEPTER la modification du pseudo OU NON */
if( isset($_POST['pseudo']) and isset($_POST['motdepasse']) )
{ $pseudo=$_POST['pseudo'];	$mdp=$_POST['motdepasse'];

  if(sha1($mdp)==$_SESSION['membre']->getMotdepasse()) //si le mot de passe est correct
  { 
      
      $table='membres';
      //Si le nouveau pseudo est valide ET disponible alors on VALIDE le changement
      if(validerPseudo($pseudo) and disponibilitePseudo($pseudo,$bdd,$table))
      {
        $_SESSION['membre']->setPseudo($pseudo);
        header('location: profil.php');
      }

  }
  else
  {
    echo 'Mot de passe incorrect';
  }
}

/* FIN */
?>
</p>	
</section>

</body>

</html>

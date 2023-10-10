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
<title>Modifier son mot de passe</title>
</head>

<body>

<!-- Début des infos utilisateur -->
<?php include("infos_utilisateur.php"); ?>
<!-- Fin -->
<section id="connexion">

<!-- On va faire un formulaire ici -->
	<form method="post" action="">
    <p><label for="motdepasse">Mot de passe actuel: </label><input type="password" name="motdepasse" id="motdepasse" size="30" required autofocus />
		</p>
	<p><label for="newpass">Nouveau mot de passe : </label><input type="password" name="newpass" id="newpass"  required size="30" />
		</p>
    <p><label for="newpass2">Confirmez le mot de passe : </label><input type="password" name="newpass2" id="newpass2" required size="30"/>
    </p>
	<p><input type="submit" name="boutonModifier" value="Modifier" />
		</p>
	</form>
<!-- Fin du formulaire -->
<p class="erreur_connexion">
<?php
/* VOYONS SI ON VA ACCEPTER la modification du mot de passe OU NON */
if( isset($_POST['motdepasse']) and isset($_POST['newpass']) and isset($_POST['newpass2']) )
{ $mdp=$_POST['motdepasse'];    $newpass=$_POST['newpass'];     $newpass2=$_POST['newpass2'];

  if(sha1($mdp)==$_SESSION['membre']->getMotdepasse()) //si le mot de passe est correct
  {
      //Si le nouveau mot de passe est valide et bien confirmé alors on VALIDE le changement
      if(validerMdp( $newpass, $newpass2 ))
      {
        $_SESSION['membre']->setMotdepasse( sha1($newpass) );
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

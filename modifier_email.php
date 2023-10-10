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
<title>Modifier son adresse mail</title>
</head>

<body>

<!-- Début des infos utilisateur -->
<?php include("infos_utilisateur.php"); ?>
<!-- Fin -->
<section id="connexion">

<!-- On va faire un formulaire ici -->
	<form method="post" action="">
    <p><label for="motdepasse">Mot de passe : </label><input type="password" name="motdepasse" id="motdepasse" size="30" required  autofocus />
		</p>
	<p><label for="email">Nouvel Email : </label><input type="text" name="email" id="email"  required size="30" placeholder="Votre nouvel email" />
		</p>
	<p><input type="submit" name="boutonModifier" value="Modifier" />
		</p>
	</form>
<!-- Fin du formulaire -->
<p class="erreur_connexion">
<?php
/* VOYONS SI ON VA ACCEPTER la modification de l'email OU NON */
if( isset($_POST['email']) and isset($_POST['motdepasse']) )
{ $email=$_POST['email'];	$mdp=$_POST['motdepasse'];

  if(sha1($mdp)==$_SESSION['membre']->getMotdepasse()) //si le mot de passe est correct
  { 
      
      $table='membres';
      //Si le nouvel email est valide ET disponible alors on VALIDE le changement
      if(validerEmail($email) and disponibiliteEmail($email,$bdd,$table))
      {
        $_SESSION['membre']->setEmail($email);
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

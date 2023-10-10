<?php
include_once('classes.php'); //inclusion des classes utiles
include_once('fonctions_de_base.php');

session_start();

if(!user_connected()) header('location: index.php');
?>

<!DOCTYPE html>
<html>

<head>
<meta charset="utf-8"/>
<link rel="stylesheet" href="style_2.css"/>
<title>Profil de l'utilisateur</title>
</head>

<body>

<!-- Début des infos utilisateur -->
<?php include_once("infos_utilisateur.php"); ?>
<!-- Fin -->

<section id="profil">
    <p> <span>Photo de profil: </span> <img src="<?php 
    if($_SESSION['membre']->getPhoto_profil() != ''){
            $nom_fichier = explode('/', $_SESSION['membre']->getPhoto_profil());
			$nom_fichier = 'get_image.php?file=' . end($nom_fichier);
            echo $nom_fichier; 
    }
    ?>" /> <a href="modifier_photo_profil.php" >Modifier</a>
<?php if($_SESSION['membre']->getPhoto_profil()=='') echo '(Vous n\'avez pas de photo de profil)'; ?>    
    </p>
    <p> <span>Pseudo: </span> <?php echo $_SESSION['membre']->getPseudo(); ?> <a href="modifier_pseudo.php" >Modifier</a>
    </p>
    <p> <span>Adresse mail: </span> <?php echo $_SESSION['membre']->getEmail(); ?> <a href="modifier_email.php" >Modifier</a>
    </p>
    <p> <span>Mot de passe: </span> <a href="modifier_motdepasse.php" >Modifier</a>
    </p>	
</section>

</body>

</html>

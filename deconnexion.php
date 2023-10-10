<?php
include_once('classes.php'); //inclusion des classes utiles

session_start();
$_SESSION = array(); //On vide la variable de session

session_destroy();//Déconnexion de l'utilisateur

//Suppression des cookies de connexion automatique
setcookie('pseudo_site_epreuves','');
setcookie('mdp_hash_site_epreuves','');

header('location: index.php'); //Reconduction
?>
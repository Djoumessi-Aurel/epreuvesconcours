<?php
/* C'est cette page qui permet d'afficher les commentaires sur site_epreuves
Elle est donc inclue dans le fichier "formulaire_et_com.php" ainsi que dans "com_post.php" */

include_once('fonctions.php'); //inclusion des fonctions utiles
?>

<?php
   //accès à la BDD
  
  $max_messages=10; //LE MAX DE COMMENTAIRES QU'ON AFFICHE A LA FOIS
  $page_messages=1; //PAR DEFAUT ON EST SUR LA PAGE N°1 DES COMMENTAIRES

  if(isset($_POST['max_messages'])) $max_messages = $_POST['max_messages'];
  if(isset($_POST['page_messages'])) $page_messages = $_POST['page_messages'];
  if(isset($_POST['code_page'])) $code_page = $_POST['code_page'];

  global $bdd;
  afficherMessages_selonPage($code_page, $bdd, $max_messages, $page_messages); //AFFICHAGE DES COMMENTAIRES
?>
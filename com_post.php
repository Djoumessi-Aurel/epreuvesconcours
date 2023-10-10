<?php
/*Cette page insère un commentaire de SITE_EPREUVES dans la base de données.
Ensuite elle affiche les commentaires*/

include_once('fonctions.php'); //inclusion des fonctions utiles
include_once('classes.php'); //inclusion des classes utiles
?>

<?php

if( isset($_POST['pseudo']) && isset($_POST['message']) && isset($_POST['code_page']) )
 { $pseudo=$_POST['pseudo'];
    $message=$_POST['message'];
    $code_page=$_POST['code_page'];
    $url_page = $_POST['url_page'];
    $id_parent=0;

    session_start(); //pour pouvoir accéder à la varaible _SESSION
    $id_membre= user_connected() ? $_SESSION['membre']->getId() : 0;

    if(isset($_POST['id_parent']))  $id_parent=(int)$_POST['id_parent']; //pour être sûr qu'on a un entier.

     //accès à la BDD

  if($pseudo != "" and $message!= "" and $code_page!= "")
  {//Là on peut écrire le message dans la base de données.
    setcookie('pseudo_site_epreuves',$pseudo,time()+30*24*3600,null,null,false,true); //On enregistre le pseudo dans un cookie
    
    $req=$bdd->prepare('INSERT INTO commentaires (auteur, code_page, url_page, id_parent, contenu, 
    id_membre, date_ajout) '.
    'VALUES(?, ?, ?, ?, ?, ?, NOW())'); //préparer la requête
    $req->execute( array( $pseudo, $code_page, $url_page, $id_parent
    , $message, $id_membre ) )
                    or die(print_r($req->errorInfo())); //lancer la requête

  }

  //ON A FINI D'INSERER, MAINTENANT ON AFFICHE LES COMMENTAIRES
  include_once('actualiser_com.php');

 }
?>

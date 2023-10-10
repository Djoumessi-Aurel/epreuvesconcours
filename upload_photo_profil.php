<?php
include_once('classes.php'); //inclusion des classes utiles
include_once('fonctions_de_base.php');

session_start();

/* VOYONS SI ON VA ACCEPTER la modification de la photo de profil OU NON */
if( isset($_POST['motdepasse']) )
{ $mdp=$_POST['motdepasse'];

  if(sha1($mdp)==$_SESSION['membre']->getMotdepasse()) //si le mot de passe est correct
  {
      if(isset($_POST['supprimer'])) //si on a coché "supprimer" alors on supprime la photo de profil
      {
        deleteFileIfExists( $_SESSION['membre']->getPhoto_profil() );
        $_SESSION['membre']->setPhoto_profil('');
        echo 'OK';
        //echo 'pp bien supprimée';
      }
      
      else //si on n'a pas coché "supprimer"
      {
        if(!isset($_FILES['monImage'])) return; //si on n'a pas envoyé de fichier à uploader, on arrête.

        $photo_profil=$_FILES['monImage'];
        //Si la nouvelle photo est valide ET disponible alors on VALIDE le changement
        if($cheminFichier = validerPhoto($photo_profil))
            {
                $_SESSION['membre']->setPhoto_profil($cheminFichier);
                echo 'OK';
                //echo 'pp bien modifiée';
            }
      }

  }
  else
  {
    echo 'Mot de passe incorrect';
  }
}

/* FIN */

function validerPhoto($fichier) 
/* vérifie si la taille et l'extension de l'image correspondent à nos critères  et uploade si OUI
Renvoie le chemin du fichier uploadé si tout se passe bien, et FALSE Sinon */

{ //echo 'Chemin du fichier temporaire: '.$fichier['tmp_name'].' <br/>';
 if($fichier['name']=='') {echo 'Vous n\'avez choisi aucun fichier'; return false; }

    $extensionsOK=array('jpg', 'jpeg', 'png', 'gif');//extensions autorisées
    $infosfichier=pathinfo($fichier['name']);
    $extension=strtolower($infosfichier['extension']); //on récupère l'extension en minuscule.
    
    if($fichier['size']>1*1024*1024) //On teste la taille du fichier
        echo '<strong>Votre fichier pèse plus de 1 Mo</strong>';

    elseif(in_array($extension,$extensionsOK)) //Ici tout est bon. On accepte donc le fichier.
       {
       $cheminFichier='../ressources/photos_profil/'.$_SESSION['membre']->getId().'.'.$extension;
       deleteFileIfExists( $_SESSION['membre']->getPhoto_profil() );
       move_uploaded_file($fichier['tmp_name'],utf8_decode($cheminFichier));
       return $cheminFichier; //L'upload a eu lieu. on retourne donc LE CHEMIN DU FICHIER.
        }

    else
     {echo '<strong>Type de fichier non autorisé</strong>';}

return false;
}
?>
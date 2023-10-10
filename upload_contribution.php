<?php
include_once('classes.php'); //inclusion des classes utiles
include_once('fonctions_de_base.php');

session_start();

/* Gestion de l'upload des fichiers envoyés */
if( isset($_FILES['mesFichiers']) and isset($_POST['details']) )
{
$nb = count($_FILES['mesFichiers']['name']); //le nombre de fichiers envoyés

$nbUp=0;//Le nombre d'uploads réussis

    for($i=0; $i<$nb; $i++)
    {   if( $chemin = validerFichier($_FILES['mesFichiers'], $i) ) //si l'upload du fichier réussit
        {   $nbUp++;
            $req=$bdd->prepare('INSERT INTO contributions (date, details, chemin_fichier) VALUES (NOW(), ?, ?)');
		    $req->execute( array( $_POST['details'], $chemin ) ) or die(print_r($req->errorInfo())); //lancer la requête
        }
    }
echo $nbUp; //On affiche le nombre d'uploads réussis
}
else echo 'Vous n\'avez soumis aucun fichier';

/* FIN */

function validerFichier($fichier, $i) //$i est l'indice du fichier à uploader
/* vérifie si la taille et l'extension du fichier correspondent à nos critères  et uploade si OUI
Renvoie le chemin du fichier uploadé si tout se passe bien, et FALSE Sinon */

{ //echo 'Chemin du fichier temporaire: '.$fichier['tmp_name'].' <br/>';
 if($fichier['name'][$i]=='') {echo 'Vous n\'avez choisi aucun fichier'; return false; }

    $extensionsOK=array('pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png');//extensions autorisées
    $infosfichier=pathinfo($fichier['name'][$i]);
    $extension=strtolower($infosfichier['extension']); //on récupère l'extension en minuscule.
    
    if($fichier['size'][$i]>4*1024*1024) //On teste la taille du fichier
        echo '<strong>Votre fichier pèse plus de 4 Mo</strong>';

    elseif(in_array($extension,$extensionsOK)) //Ici tout est bon. On accepte donc le fichier.
       {
       $cheminFichier='../ressources/contributions/'.date('dmYhis').'- '.$fichier['name'][$i];
       move_uploaded_file($fichier['tmp_name'][$i],utf8_decode($cheminFichier));
       return $cheminFichier; //L'upload a eu lieu. on retourne donc LE CHEMIN DU FICHIER.
        }

    else
     {echo '<strong>Type de fichier non autorisé</strong>';}

return false;
}
?>
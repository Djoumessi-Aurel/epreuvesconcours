<?php include_once('fonctions_de_base.php');

actualiserVisites(); //incrémente les visites dans la table visites
$nbOnline = actualiserUtilisateursEnLigne(); //Met à jour la table des utilisateurs en ligne et renvoie leur nombre
signalerCommentaires(); //M'envoie les COMMENTAIRES du site (ceux que je n'ai pas encore reçus) PAR MAIL
?>

<section id="infos_utilisateur">
      <!-- Script de réécriture des URL -->
      <script src="rewrite_url.js"></script>

<?php
if(!user_connected()) //Utilisateur non connecté
 { echo '<span><a href="index.php">Accueil</a></span>';
   echo '<span><a href="inscription.php">S\'inscrire</a></span>';
   echo '<span><a href="connexion.php">Se connecter</a></span>';
  // echo '<span><a href="contribuer.php" class="lien_contribuer">Contribuer</a></span>';
 }
else //Utilisateur connecté
 { echo '<span class="bienvenue">Bienvenue <b>'.$_SESSION['membre']->getPseudo().'</b> !</span>';
   echo '<span><a href="index.php">Accueil</a></span>';
   echo '<span><a href="profil.php">Profil</a></span>';

   if(!user_niveau1()) //Cas d'un membre qui n'est pas administrateur/modérateur
    {
      echo '<span><a href="contribuer.php" class="lien_contribuer">Contribuer</a></span>';
    }

   else //ADMINISTRATEUR OU MODERATEUR
   {echo '<span><a href="upload_page1.php">Consulter/uploader des épreuves</a></span>';
     echo '<span class="grade">[ '.$_SESSION['membre']->getGrade().' ]</span>';
    }
   
   echo '<span><a href="deconnexion.php">Se déconnecter</a></span>';
 }
?>
</section>
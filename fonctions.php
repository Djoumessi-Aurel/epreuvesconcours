<?php include_once('fonctions_de_base.php'); ?>

<?php
/* Ce fichier contient les fonctions utilisées dans les pages web de FORUM, MINICHAT et SITE_EPREUVES */

function afficherSujet($id, $pseudo,$date_heure,$titre,$message) //affiche un sujet de discussion du forum.
{$pseudo=htmlspecialchars( $pseudo );
 $titre=htmlspecialchars( $titre );
 $message=bbCode ( nl2br( htmlspecialchars( $message ) ) );
    
   echo '<div class="message" >';
   echo '<div class="titre_message" >'.
       '<span class="titre" >'.$titre.'</span>'.
       '<span class="date_heure" >'.$date_heure.'</span>'.
       '<span class="pseudo" ><i>par</i> '.$pseudo.'</span>'.
   '</div>';
   echo '<div class="contenu_message" >'.$message.'</div>';

   if(!isset($_GET['num_sujet'])) //c-à-d si on est sur la page forum.php
   {
    echo '<a href="commentaires.php?num_sujet='.$id.'"><i>Commenter / Voir la discussion</i></a>';
   }

 echo '</div>';
}//fonction utilisée sur FORUM.PHP et COMMENTAIRES.PHP

function afficherMessageForum($pseudo,$date_heure,$message) //affiche un message du chat.
 {$pseudo=htmlspecialchars( $pseudo );
  $message=bbCode( nl2br( htmlspecialchars( $message ) ) );
  
    echo '<div class="message" >';
    echo '<div class="titre_message" >'.
        '<span class="pseudo" >'.$pseudo.'</span>'.
        '<span class="date_heure" >'.$date_heure.'</span>'.
    '</div>';
    echo '<div class="contenu_message" >';
        echo $message;
    echo '</div>';
  echo '</div>';
 }//fonction utilisée sur le forum (COMMENTAIRES.PHP) et MINICHAT.PHP

function afficherMessage($bdd,$id) //affiche un message sur le site "site_epreuves"
 { /* Acquisition des données à afficher */
     $req=$bdd->prepare('SELECT c.id_membre, c.id_parent, c.auteur, m.grade, m.pseudo, 
    DATE_FORMAT(c.date_ajout,\'Le  %d/%m/%Y  à  %Hh%imin%ss\') as date_heure,
    c.contenu FROM commentaires AS c LEFT JOIN membres AS m ON c.id_membre=m.id
    WHERE c.id=?'); //préparer la requête

    $req->execute( array( $id ) ) 
        or die(print_r($req->errorInfo())); //lancer la requête

    if(!$donnees=$req->fetch()) return; //S'il n'y a pas de résultat, on arrête la fonction
    $req->closeCursor();//Termine le traitement de la requête

    /* -- L'auteur du commentaire peut être inscrit ou pas (ça dépend de $idMembre) -- */
    $idMembre=(int)$donnees['id_membre'];
    $grade= $idMembre==0 ? 'visiteur' : htmlspecialchars( $donnees['grade'] );
    $pseudo= $idMembre==0 ? $donnees['auteur'] : $donnees['pseudo'];
    /* -- Fin de cas -- */

  $pseudo=htmlspecialchars( $pseudo );
  $message=bbCode( nl2br( htmlspecialchars( $donnees['contenu'] ) ) );

  $str="";
  if($grade) $str='<span class="grade_auteur" >'.$grade.'</span>';
  /* FIN */

  /* AFFICHAGE PROPREMENT DIT */
    echo '<div class="message" id="msg'.$id.'" >';
    echo '<div class="titre_message" >'.
        '<span class="pseudo" >'.$pseudo.'</span>'.
        $str.'<span class="date_heure" >'.
        $donnees['date_heure'].'</span>'.
    '</div>';
    echo '<div class="contenu_message" >';
    if($donnees['id_parent']!=0) afficherMessageRepondu($bdd,$donnees['id_parent']); //si le message a un parent, on l'affiche
        echo '<div class="texte_message" >'.$message.'</div>';
    echo '</div>';
    echo '<a class="repondre" href="#" onclick="repondreAuMessage('.$id.'); return false;">Répondre</a>';
  echo '</div>';
  /* FIN */

 }//fonction utilisée sur SITE_EPREUVES

 function afficherMessageRepondu($bdd,$id_parent) //affiche le message auquel on répond
 { /* Acquisition des données à afficher */
    $req=$bdd->prepare('SELECT c.id_membre, c.id_parent, c.auteur, m.grade, m.pseudo, 
    DATE_FORMAT(c.date_ajout,\'Le  %d/%m/%Y  à  %Hh%imin%ss\') as date_heure,
    c.contenu FROM commentaires AS c LEFT JOIN membres AS m ON c.id_membre=m.id
    WHERE c.id=?'); //préparer la requête

    $req->execute( array( $id_parent ) ) 
        or die(print_r($req->errorInfo())); //lancer la requête
  /* FIN */

    /* AFFICHAGE PROPREMENT DIT */
    if($donnees=$req->fetch()) //S'il y a un résultat
        { $str="";

        /* -- L'auteur du commentaire peut être inscrit ou pas (ça dépend de $idMembre) -- */
        $idMembre=(int)$donnees['id_membre'];
        $grade= $idMembre==0 ? 'visiteur' : htmlspecialchars( $donnees['grade'] );
        $pseudo= $idMembre==0 ? $donnees['auteur'] : $donnees['pseudo'];
        /* -- Fin de cas -- */

        $pseudo=htmlspecialchars( $pseudo );
        $message=bbCode( nl2br( htmlspecialchars( $donnees['contenu'] ) ) );

    if($grade) $str='<span class="grade_auteur" >'.$grade.'</span>';

        echo '<div class="message_repondu" >';
            echo '<div class="titre_message" >'.
                '<span class="pseudo" >'.$pseudo.'</span>'.
                $str.'<span class="date_heure" >'.
                $donnees['date_heure'].'</span>'.
            '</div>';
            echo '<div class="contenu_message" >'.$message.'</div>';
          echo '</div>';
        }
    $req->closeCursor();//Termine le traitement de la requête
    /* FIN */
    
 }//fonction utilisée sur SITE_EPREUVES

function afficherLiens($nb_messages,$max_messages,$page,$nom_page)
 { if($nb_messages>$max_messages) //Si tous les messages ne peuvent pas figurer sur une seule page...
    {
    echo '<p class="zone_liens">';
        if($nom_page=='minichat.php') //c-à-d si on est sur la page minichat.php
        {echo $nb_messages.' messages au total.<br/>';
            $morceau_lien=' href="minichat.php?';
        }
        elseif($nom_page=='forum.php') //c-à-d si on est sur la page forum.php
        {echo $nb_messages.' sujets de discussion au total.<br/>';
            $morceau_lien=' href="forum.php?';
        }
        elseif( isset($_GET['num_sujet']) ) //si on est sur commentaires.php
        {echo $nb_messages.' commentaires au total.<br/>';
            $morceau_lien=' href="commentaires.php?num_sujet='.$_GET['num_sujet'].'&';
        }
    
    $texte='';
        for($i=0, $n=1; $i<$nb_messages; $i+=$max_messages, $n++)
        { if($page==$n) $texte=' class="page_actuelle" ';
            else $texte='';
        echo '<a '.$texte.$morceau_lien.'page='.$n.'" >Page '.$n.'</a>';
        }
    
    echo '</p>';
   }
 }//fonction utilisée sur FORUM.PHP, COMMENTAIRES.PHP et MINICHAT.PHP

function bbCode($message) //applique le bbCode sur une chaîne de caractères
 {$message=preg_replace('#\[u\](.+)\[/u\]#isU','<u>$1</u>',$message);
  $message=preg_replace('#\[i\](.+)\[/i\]#isU','<i>$1</i>',$message);
  $message=preg_replace('#\[b\](.+)\[/b\]#isU','<b>$1</b>',$message);
  $message=preg_replace('#(https?|ftp)://[a-z0-9_./?=&;-]+#i','<a href="$0">$0</a>',$message);
  $message=preg_replace('#[a-z0-9_.-]+@[a-z0-9_.-]{2,}\.[a-z]{2,4}#i','<a href="mailto:$0">$0</a>',$message);
  $message=preg_replace('#\[color=(red|green|blue|yellow|orange|maroon|gray|purple|olive)\](.+)\[/color\]#isU',
     '<span style="color:$1">$2</span>',$message); //balise [color]
 
 return $message;
 }

function afficherMessages_selonPage($codePage,$bdd,$max_messages,$page_messages)
//pour afficher les commentaires sur site_epreuves
 {
    ?>
    <h3><u>Commentaires:</u></h3>
    <?php

        //On détermine d'abord le nombre de commentaires (on le met ds la variable $nb_messages)
    $req=$bdd->prepare('SELECT COUNT(*) as total FROM commentaires WHERE code_page=?'); //préparer la requête
    $req->execute( array( $codePage ) ) 
        or die(print_r($req->errorInfo())); //lancer la requête
        
    $nb_messages = $req->fetch()['total'];
        $req->closeCursor();
    //FIN, maintenant on passe à l'affichage proprement dit.

    if( isset($_GET['page']) and (int)($_GET['page'])>=1 ) $page_messages=(int)($_GET['page']);
    $offset=($page_messages-1)*$max_messages; //Le décalage des résultats de la requête suivante.

    $req=$bdd->prepare('SELECT id FROM commentaires WHERE code_page=? ORDER BY date_ajout DESC '.
    'LIMIT '.$max_messages.' OFFSET '.$offset); //préparer la requête

    $req->execute( array( $codePage ) ) 
        or die(print_r($req->errorInfo())); //lancer la requête
    while($donnees=$req->fetch())
        {
        afficherMessage( $bdd, $donnees['id'] );
        }
    $req->closeCursor();//Termine le traitement de la requête

    afficherLiensJS($nb_messages,$max_messages,$page_messages); //affichage des liens de navigation des messages.
    /* Dans le cas actuel, on va se servir de javascript pour actualiser juste la partie des commentaires */

 } //fonction utilisée sur site_epreuves(FORMULAIRE_ET_COM.PHP)

 function afficherLiensJS($nb_messages,$max_messages,$page_messages)
 { if($nb_messages>$max_messages) //Si tous les messages ne peuvent pas figurer sur une seule page...
    {
    echo '<p class="zone_liens">';
    echo $nb_messages.' commentaires au total<br/>';

    $texte='';
        for($i=0, $n=1; $i<$nb_messages; $i+=$max_messages, $n++)
        { if($page_messages==$n) $texte=' class="page_actuelle" ';
            else $texte='';
        echo '<a '.$texte.' href="#" onclick="actualiser_com('.$n.'); return false;" >Page '.$n.'</a>';
        }
    
    echo '</p>';
   }
 }//fonction utilisée sur site_epreuves (FORMULAIRE_ET_COM.PHP)

?>
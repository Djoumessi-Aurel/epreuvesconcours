<?php
//Cette page permet l'acquisition et l'affichage des infos sur les visites du site
?>

<p id="infos_visites">
Utilisateurs en ligne: <?php echo $nbOnline; ?>
<br/>Nombre de visites ajourd'hui: <?php echo getVisitesJour($bdd); ?>
<br/>Nombre de visites ce mois: <?php echo getVisitesMois($bdd); ?>
<br/>Nombre total de visites: <?php echo getVisitesTotales($bdd); ?>
</p>

<?php
function getVisitesJour($bdd)
 {
    $req=$bdd->prepare('SELECT nb_visites FROM visites WHERE jour = CURDATE()');
    $req->execute( array( ) ) or die(print_r($req->errorInfo())); //lancer la requête
     if($req->rowCount()) return $req->fetch()['nb_visites'];
     else return 0;
 }

function getVisitesMois($bdd)
 {
    $req=$bdd->prepare('SELECT SUM(nb_visites) as visites_mois FROM visites WHERE 
    jour <= LAST_DAY(CURDATE()) AND jour > SUBDATE(LAST_DAY(CURDATE()), INTERVAL 1 MONTH)');
    $req->execute( array( ) ) or die(print_r($req->errorInfo())); //lancer la requête
     if($req->rowCount()) return $req->fetch()['visites_mois'];
     else return 0;
 }

function getVisitesTotales($bdd)
 {
    $req=$bdd->prepare('SELECT SUM(nb_visites) as visites_totales FROM visites');
    $req->execute( array( ) ) or die(print_r($req->errorInfo())); //lancer la requête
     if($req->rowCount()) return $req->fetch()['visites_totales'];
     else return 0;
 }
?>
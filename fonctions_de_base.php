<?php //CONTIENT LES FONCTIONS UTILES DANS PRESQUE TOUTES LES PAGES DU SITE

include_once('definitions.php');

function connectionBDD($host,$dbName,$user,$password)
/* Retourne une connection à la base de donnée $dbName située à l'adresse $host */
{try
	{$bdd = new PDO( 'mysql:host='.$host.';dbname='.$dbName,$user,$password,
		array(PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8") );
		//connection à la bdd. On PRECISE BIEN que les données échangées seront en UTF8.
	}
   catch(Exception $e)
	{die('Erreur: '.$e->getMessage());
	}
return $bdd;
}

function user_connected() //indique si l'utilisateur est connecté ou non
{if(isset($_SESSION['membre'])) return true;
else return false;
}

function user_niveau1() //indique si l'utilisateur est de niveau 1 (ADMIN ou MODERATEUR)
{if(user_connected())
	{if( $_SESSION['membre']->getGrade()=='admin' OR $_SESSION['membre']->getGrade()=='modérateur' )
		return true;
	}
return false;
}

function get_url_actuelle() //renvoie l'adresse de la page actuelle
{
    return /*$_SERVER['HTTP_HOST'].*/$_SERVER['REQUEST_URI'];
/*PS: je n'ai pas mis le nom d'hôte ($_SERVER['HTTP_HOST']) juste pour que ce soit moins long.*/
}

function EssaiConnectionAutomatique()
/* Vérifie si les paramètres de connexion (pseudo et mot de passe) sont stockés dans les cookies 
et connecte automatiquement l'utilisateur si oui */
{ if(user_connected()) return; //Si l'utilisateur est déjà connecté, on arrête là.

 if( !isset($_COOKIE['pseudo_site_epreuves']) or !isset($_COOKIE['mdp_hash_site_epreuves']) ) return;

 	global $bdd;
 	$req=$bdd->prepare('SELECT id FROM membres WHERE pseudo=? AND mot_de_passe=?');

	$req->execute( array( $_COOKIE['pseudo_site_epreuves'], $_COOKIE['mdp_hash_site_epreuves'] ) )
	or die(print_r($req->errorInfo())); //lancer la requête
	
		if($donnees=$req->fetch()) //S'il y a un résultat, alors il faut connecter l'utilisateur
		{ $_SESSION['membre']=new Membre($bdd, 'membres', $donnees['id']);
		}

}

function actualiserVisites()
/* Incrémente les visites dans la table visites */
{
	if(isset($_SESSION['visite_actuelle'])) return; //S'il ne s'agit pas d'une nouvelle visite, on arrête la fonction.

	//Si c'est une nouvelle visite... on continue.
	$_SESSION['visite_actuelle']='Un nouvel utilisateur est sur le site';
	
	global $bdd;
	 $req=$bdd->prepare('SELECT id, nb_visites FROM visites WHERE jour = CURDATE()');
	 $req->execute( array( ) ) or die(print_r($req->errorInfo())); //lancer la requête
	
	if($req->rowCount()) //Si la date du jour est déjà présente dans la bdd
	 { 
		$donnees=$req->fetch(); $req->closeCursor();
		$nb=$donnees['nb_visites'] + 1; $id=$donnees['id'];
		$req=$bdd->prepare('UPDATE visites SET nb_visites = ? WHERE id = ?');
	 	$req->execute( array( $nb, $id ) ) or die(print_r($req->errorInfo())); //lancer la requête
	 }
	else
	 {
		$req=$bdd->prepare('INSERT INTO visites (jour, nb_visites) VALUES (CURDATE(), 1)');
		$req->execute( array(  ) ) or die(print_r($req->errorInfo())); //lancer la requête
	 }
}

function deleteFileIfExists($cheminFichier)
{ $chemin=utf8_decode($cheminFichier);
	if(file_exists($chemin))
		{ if(unlink($chemin)) {/*echo ' ANCIEN Fichier supprimé avec succès.';*/}
		else {/*echo ' Echec de la SUPPRESSION de l\'ancien fichier.';*/}
		}

	else {/*echo ' Le fichier à supprimer n\'existe pas.';*/}
}


function actualiserUtilisateursEnLigne() //Met à jour la table des utilisateurs en ligne et renvoie leur nombre
 { global $bdd;

	if(!isset($_COOKIE['en_ligne_site_epreuves'])) //Si l'utilisateur n'était pas en ligne
	{ 
		setcookie('en_ligne_site_epreuves','EN LIGNE',time()+300,null,null,false,true); //cookie expirant après 300s (5 minutes)
		$req=$bdd->prepare('INSERT INTO utilisateurs_en_ligne (ip, timestamp) VALUES(?, ?)');
		$req->execute( array( '', time() ) ) or die(print_r($req->errorInfo()));
	}
	
	/* //ON UTILISERA LA METHODE CI-DESSOUS SI ON A ACCES AUX ADRESSES IP DES UTILISATEURS
	$req=$bdd->prepare('SELECT * FROM utilisateurs_en_ligne WHERE ip = ?');
	 $req->execute( array( $_SERVER['REMOTE_ADDR'] ) ) or die(print_r($req->errorInfo())); //lancer la requête

	 if($req->rowCount()==0) //l'adresse ip n'est pas dans la bdd
	 {
		$req=$bdd->prepare('INSERT INTO utilisateurs_en_ligne (ip, timestamp) VALUES(?, ?)');
		$req->execute( array( $_SERVER['REMOTE_ADDR'], time() ) ) or die(print_r($req->errorInfo()));
	 }
	 else //l'adresse ip est déjà dans la bdd
	 {
		$req=$bdd->prepare('UPDATE utilisateurs_en_ligne SET timestamp = ? WHERE ip = ?');
		$req->execute( array( time(), $_SERVER['REMOTE_ADDR'] ) ) or die(print_r($req->errorInfo()));
	 } */

	 /* MAINTENANT ON SUPPRIME DE LA TABLE LES UTILISATEURS QUI N'ONT PAS CHARGE DE PAGE DEPUIS PLUS DE 5 MINUTES */
	 $req=$bdd->prepare('DELETE FROM utilisateurs_en_ligne WHERE timestamp < ?');
	 $req->execute( array( time() - 5*60 ) ) or die(print_r($req->errorInfo()));

	 /* Pour finir, on renvoie le nombre d'utilisateurs en ligne */
	 $req=$bdd->query('SELECT COUNT(*) AS nb_users FROM utilisateurs_en_ligne');
	 
	 return $req->fetch()['nb_users'];
 }

function signalerCommentaires() //M'envoie les COMMENTAIRES du site (ceux que je n'ai pas encore reçus) PAR MAIL
{
	if($_SERVER['HTTP_HOST']=='localhost') return; //Si on est en local, on arrête là

	global $bdd;
	$req=$bdd->query('SELECT MAX(date_signalement) as date_s FROM commentaires'); //La date du dernier signalement
	$date_s = $req->fetch()['date_s'];

	if(time() > $date_s + 3600*24*1)//Si le dernier signalement date de plus d'un jour alors on signale les nouveaux commentaires
	{
		$req=$bdd->query('SELECT auteur, code_page, contenu, date_ajout, url_page FROM commentaires 
		WHERE date_signalement = 0'); //Les commentaires qu'on n'a pas encore signalés

		if($req->rowCount()==0) return;//Si il n'y en a pas, on arrête là.

		$message = '<h4>Ci-dessous la liste des '.$req->rowCount().' nouveaux commentaires</h4>'.requeteVersHtml($req);

		$parametres  = 'MIME-Version: 1.0' . "\r\n"; //Les paramètres de l'email
        $parametres .= 'Content-type: text/html; charset=utf-8' . "\r\n"; //pour bien afficher le code html envoyé

			if(mail('aurelbazir@gmail.com','SITE_EPREUVES: Nouveaux Commentaires',$message,$parametres)) //ON ENVOIE PAR MAIL
			{//echo 'Les nouveaux commentaires ont été signalés par mail à l\'administrateur!';

				$req=$bdd->prepare('UPDATE commentaires SET date_signalement = ? WHERE date_signalement = 0');
				$req->execute( array( time() ) ) or die(print_r($req->errorInfo()));
			}
	}
}

function requeteVersHtml($req) //Retourne le résultat d'une requête sous forme d'un tableau html
 {
	$tableau = '';

    $tableau .= '<table border style="border-collapse:collapse;">';
          /* Affichons d'abord l'en-tête du tableau */
	$tableau .= '<tr>';
      for($i=0; $i<$req->columnCount(); $i++)
      {
        $tableau .= '<th>'.$req->getColumnMeta($i)['name'].'</th>';
      }
	$tableau .= '</tr>';
        /* Maintenant, les données du tableau */
    while($donnees=$req->fetch(PDO::FETCH_ASSOC))
     {$tableau .= '<tr>';
        foreach($donnees as $element){$tableau .= '<td>'.nl2br($element).'</td>';}
	  $tableau .= '</tr>';
     }
    $req->closeCursor();
    $tableau .= '</table>';

return $tableau;
 }
/* function get_ip_address() { //RENVOIE L'ADRESSE IP DU CLIENT
	if ( isset( $_SERVER['HTTP_X_REAL_IP'] ) ) {
		return $_SERVER['HTTP_X_REAL_IP'];
	} elseif ( isset( $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) {
		// Proxy servers can send through this header like this: X-Forwarded-For: client1, proxy1, proxy2
		// Make sure we always only send through the first IP in the list which should always be the client IP.
		return (string) self::is_ip_address( trim( current( explode( ',', $_SERVER['HTTP_X_FORWARDED_FOR'] ) ) ) );
	} elseif ( isset( $_SERVER['REMOTE_ADDR'] ) ) {
		return $_SERVER['REMOTE_ADDR'];
	}
	return '';
}*/
?>
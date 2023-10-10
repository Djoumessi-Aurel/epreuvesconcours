<?php include_once('fonctions_de_base.php'); ?>

<?php
/* FONCTIONS NECESSAIRES POUR L'INSCRIPTION ET LA CONNEXION DES UTILISATEURS */

function validerPseudo($pseudo) //vérifie que $pseudo correspond aux critères (regex)
 {
	 if(preg_match('#^[-_a-z0-9àäéèêëùûüôöîï]{2,}$#i',$pseudo)) return true;
echo '<br/>Le pseudo doit avoir minimum 2 caractères (lettres, chiffres et tirets autorisés); Pas d\'espaces';
return false;
 }

 function validerEmail($email) //vérifie que $email correspond aux critères (regex)
 {
	 if(preg_match('#^[a-z0-9_.-]+@[a-z0-9_.-]{2,}\.[a-z]{2,4}$#i',$email)) return true;
echo '<br/>Adresse mail ('.$email.') non valide';
return false;
 }

 function validerMdp($mdp,$mdp2)
 {
	 /*if(preg_match('#.{8,}#',$mdp) and preg_match('#[A-Z]#',$mdp)
	  and preg_match('#[a-zàäéèêëùûüôöîï]#',$mdp) and preg_match('#[0-9]#',$mdp))*/
 if(preg_match('#^.{2,}$#',$mdp))
	{ if($mdp==$mdp2) return true;
	  else echo '<br/>Les deux mots de passe sont différents';
	}
echo '<br/>Le mot de passe doit avoir minimum 2 caractères';
/*echo '<br/>Le mot de passe doit avoir: minimum 8 caractères, au moins 1 minuscule, 1 majuscule et 1 chiffre';*/
return false;
 }

function disponibilitePseudo($pseudo,$bdd,$table)
/* Vérifie que $pseudo n'est pas présent dans la BDD */
 { $req=$bdd->prepare('SELECT * FROM '.$table.' WHERE pseudo=?');

	$req->execute( array( $pseudo ) )
	or die(print_r($req->errorInfo())); //lancer la requête

	if($req->fetch()) //S'il y a un résultat...
	{echo '<br/>Ce pseudo ('.$pseudo.') est déjà pris';
		return false;
	}
	$req->closeCursor(); //Termine le traitement de la requête

return true;
 }

function disponibiliteEmail($email,$bdd,$table)
/* Vérifie que $email n'est pas présent dans la BDD */
 { $req=$bdd->prepare('SELECT * FROM '.$table.' WHERE email=?');

	$req->execute( array( $email ) )
	or die(print_r($req->errorInfo())); //lancer la requête

	if($req->fetch()) //S'il y a un résultat...
	{echo '<br/>Cette adresse mail ('.$email.') est déjà prise';
		return false;
	}
	$req->closeCursor(); //Termine le traitement de la requête

return true;
 }

function inscrireUtilisateur($pseudo,$email,$mdp,$bdd,$table) //Inscrit l'utilisateur dans la table $table
{ $req=$bdd->prepare('INSERT INTO '.$table.' (pseudo, email, mot_de_passe, grade, date_inscription) '.
	'VALUES( ?, ?, ?, "inscrit", CURDATE() )'); //CURDATE renvoie le moment présent au format DATE

	$req->execute( array( $pseudo, $email, sha1($mdp) ) )
	or die(print_r($req->errorInfo())); //lancer la requête

//echo '<br/>Utilisateur: '.$pseudo.' | '.$email.' | '.$mdp.' correctement inscrit.';

$PGV=''; //Page voulue
if( isset($_GET['PGV']) ) {$PGV='?PGV='.$_GET['PGV'];}
echo '<br/>Inscription validée. <a href="connexion.php'.$PGV.'">Connectez-vous</a>';

}

function connecterUtilisateur($pseudo,$mdp,$bdd,$table)
{ $req=$bdd->prepare('SELECT id FROM '.$table.' WHERE pseudo=? AND mot_de_passe=?');

$req->execute( array( $pseudo, sha1($mdp) ) )
or die(print_r($req->errorInfo())); //lancer la requête

    if($donnees=$req->fetch()) //S'il y a un résultat, alors il faut connecter l'utilisateur
    { $_SESSION['membre']=new Membre($bdd, $table, $donnees['id']); //ON CREE LA VARIABLE DE SESSION représentant l'utilisateur
	
		if( isset($_POST['autoconnect']) ) //si on a coché l'option connexion automatique
		{
		 setcookie('pseudo_site_epreuves',$pseudo,time()+30*24*3600,null,null,false,true);
		 setcookie('mdp_hash_site_epreuves',sha1($mdp),time()+30*24*3600,null,null,false,true);
		}
    reconduireSiBesoin();
    }
    else
    { echo 'Identifiant ou mot de passe incorrect';

    }
$req->closeCursor();
}

function reconduireSiBesoin() //Reconduit l'utilisateur lorsqu'il est déjà connecté
{if(user_connected())
    {
     if( isset($_GET['PGV']) ) header('location: '.$_GET['PGV']); //si la page voulue est définie, on reconduit vers elle
     else header('location: index.php'); //sinon, on reconduit vers index.php
    }
}

?>
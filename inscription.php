<?php
include_once('classes.php'); //inclusion des classes utiles

session_start();
include_once('fonctions_ins_con.php');
reconduireSiBesoin(); //si l'utilisateur est déjà connecté, il faut reconduire
?>

<!DOCTYPE html>
<html>

<head>
<meta charset="utf-8"/>
<link rel="stylesheet" href="js/css/screen.css">
<link rel="stylesheet" href="style_2.css"/>
<title>Inscription</title>
</head>

<body>

<!-- Début des infos utilisateur -->
<?php include_once("infos_utilisateur.php"); ?>
<!-- Fin -->

<section id="inscription">
<!-- Formulaire d'inscription ici -->
	<form method="post" action="" id="form_ins">
	<p><label for="pseudo">Pseudo* : </label><input type="text" name="pseudo" id="pseudo"  required size="30" minlength="5" placeholder="Votre identifiant" autofocus />
		</p>
	<p><label for="email">Email* : </label><input type="email" name="email" id="email" required size="30"/>
		</p>
	<p><label for="motdepasse">Mot de passe* : </label><input type="password" name="motdepasse" id="motdepasse" required size="30" minlength="8"/>
		</p>
	<p><label for="motdepasse2">Confirmez le mot de passe* : </label><input type="password" name="motdepasse2" id="motdepasse2" required size="30"/>
		</p>
	<p><label for="age">Âge : </label><input type="number" name="age" id="age" min="13" max="150"/>
		</p>
	<p><label for="date">Date de naissance: </label><input type="date" name="date" id="date"/>
		</p>
	<p><label for="homme">Homme</label><input type="radio" name="sexe" id="homme" value="homme"/>
		<label for="femme">Femme</label><input type="radio" name="sexe" id="femme" value="femme"/>
		</p>
	<p><label for="pays">Pays : </label>
		<select name="pays" id="pays">
			 <optgroup label="Afrique">
			 <option value="Angola">Angola</option>
			 <option value="Burundi">Burundi</option>
			 <option value="Cameroun" selected>Cameroun</option>
			 <option value="Nigeria">Nigeria</option>
			 <option value="Zimbabwe">Zimbabwe</option>
			 </optgroup>
			 
			 <optgroup label="Europe">
			 <option value="Allemagne">Allemagne</option>
			 <option value="Espagne">Espagne</option>
			 <option value="France">France</option>
			 <option value="Italie">Italie</option>
			 </optgroup>
		 
		</select>
		</p>
	<p><input type="submit" name="boutonInscription" value="Inscription" />  * = <em>Obligatoire</em>
		</p>
	</form>

<p class="erreur_inscription">
<?php 
/* FAISONS LES VERIFICATIONS D'USAGE AVANT D'INSCRIRE L'UTILISATEUR SUR LE SITE */

if(isset($_POST['pseudo']) and isset($_POST['email']) and isset($_POST['motdepasse'])  and isset($_POST['motdepasse2']) )
{ $pseudo=$_POST['pseudo']; $email=$_POST['email'];
$mdp=$_POST['motdepasse']; $mdp2=$_POST['motdepasse2'];

$table="membres"; //La table des membres du site

$vP=validerPseudo($pseudo); $vE=validerEmail($email); $vM=validerMdp($mdp,$mdp2);
	
	if( $vP and $vE and $vM )
	{ //echo $vP.'-'.$vE.'-'.$vM;
	 //CONNECTION A LA BDD
		$dP=disponibilitePseudo($pseudo,$bdd,$table); $dE=disponibiliteEmail($email,$bdd,$table);
	 if( $dP and $dE )
		{inscrireUtilisateur($pseudo,$email,$mdp,$bdd,$table);}
	}
}

/* FIN: L'UTILISATEUR A ETE INSCRIT SI TOUT ETAIT BON */
?>
</p>

</section>
<script src="js/jquery-1.12.4.min.js"></script>
<script src="js/jquery.validate.min.js"></script>
<script>//Gestion de la validation du formulaire côté utilisateur
$(function() {
	$("form#form_ins").validate({
		rules: {
			motdepasse2: {equalTo: "#motdepasse"}
		},
		messages: {
			pseudo:{required:"Entrez votre pseudo svp",
				minlength:"Le pseudo doit avoir minimum 5 caractères"
				},
			email: 'Entrez une adresse email valide',
			motdepasse: {required:"Entrez un mot de passe svp",
				minlength:"Le mot de passe doit avoir minimum 8 caractères"
				},
			motdepasse2:{required:"Entrez un mot de passe svp",
				minlength:"Le mot de passe doit avoir minimum 8 caractères",
				equalTo: "Entrez le même mot de passe que ci-dessus"
				}
		}
	});
});
</script>
</body>

</html>

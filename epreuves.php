<?php
include_once('classes.php'); //inclusion des classes utiles
include_once('fonctions_de_base.php');

session_start();
EssaiConnectionAutomatique(); //connexion automatique si possible
?>

<!DOCTYPE html>
<html>

<head>
<meta charset="utf-8"/>
<link rel="stylesheet" href="animate.min.css"/>
<link rel="stylesheet" href="style_site.css"/>
<title>Anciennes épreuves de concours/examen au Cameroun</title>
</head>

<body>
<!-- INCLUSION DE LA PAGE CONTENANT LA FONCTION generer_menus() -->
<?php include_once("generer_menus.php"); ?>

<!-- Début du header -->
	<?php include_once("header.php"); ?>
<!-- Fin du header -->

<div id="corps">	<!-- Début du corps de la page -->

	<section id="section_gauche">	<!-- Section gauche de la page -->

<section id="section_centrale" class="epreuves"> <!-- Section centrale, Inclusion des épreuves -->
<?php include_once('generer_epreuves.php'); ?>
</section>

<!-- Partie des commentaires -->
<?php include_once("formulaire_et_com.php");
creer_formulaire_et_com('3_'.$_GET['codeFiliere']);
?>
<!-- Fin commentaires -->

	</section>

<!-- Section droite de la page -->
	<?php include_once("section_droite.php"); ?>
<!-- Fin  -->

</div>		<!-- Fin du corps de la page -->

<!-- Début du pied de la page -->
	<?php include_once("footer.php"); ?>
<!-- Fin du pied de la page -->

	<!-- Maintenant, le code javascript -->
<script src="gestion_menus.js"></script>

</body>

</html>
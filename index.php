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
<link rel="stylesheet" href="js/slick.css"/>
<link rel="stylesheet" href="js/slick-theme.css"/>
<link rel="stylesheet" href="animate.min.css"/>
<link rel="stylesheet" href="style_site.css"/>

<script type="text/javascript" src="js/jquery-1.12.4.min.js">//jquery, nécessaire pour le carousel</script>
<script type="text/javascript" src="js/slick.min.js">//Plugin Carousel</script>

<title>Recueil d'anciennes épreuves de concours et examens officiels au Cameroun</title>
</head>

<body>

<?php  //INCLUSION DE LA PAGE CONTENANT LA FONCTION generer_menus()
include_once("generer_menus.php"); ?>

<!-- Début du header -->
	<?php include_once("header.php"); ?>
<!-- Fin du header -->

<div id="corps">	<!-- Début du corps de la page -->

<section id="carousel">  <!-- Le carousel -->
	<div><h1>Recueil d'anciennes épreuves de concours et examens au Cameroun</h1><p><b><i>Epreuves de l'ISSEA, IFORD, Polytechnique, ENS, et bien d'autres...</i></b></p></div>
	<div><h1>Retrouvez les épreuves de l'ISSEA</h1><p>Avec corrigés.</p></div>
	<div><h1>Retrouvez les épreuves de l'EAMAC (ASECNA)</h1><p>Ecole Africaine de Météorologie et d'Aviation Civile</p></div>
	<div><h1>Retrouvez les épreuves de Polytechnique</h1><p>Ecole Nationale Supérieure Polytechnique de Yaoundé<br/><i>Niveau BAC et niveau licence</i></p></div>
	<div><h1>Retrouvez les épreuves de l'Ecole Normale Supérieure de Yaoundé</h1><p>Niveau BAC et niveau licence</p></div>
</section>

<section id="section_gauche">	<!-- Section gauche de la page -->
<!-- Section centrale de la page -->
	<?php include_once("section_centrale.php"); ?>
<!-- Fin section centrale -->

<!-- Partie des commentaires -->
<?php include_once("formulaire_et_com.php");
creer_formulaire_et_com('1');
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
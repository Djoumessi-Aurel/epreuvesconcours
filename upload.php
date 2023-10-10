<?php
include_once('classes.php'); //inclusion des classes utiles

session_start();
include_once('fonctions_de_base.php');
?>

<?php
//Si on n'est pas autorisé ou si la filière n'est pas définie, on redirige
if(!user_niveau1() OR !isset($_GET['codeFiliere']))
 { header('location: upload_page1.php');
 }

?>
<!DOCTYPE html>
<html>

<head>
<meta charset="utf-8"/>
<link rel="stylesheet" href="style_2.css"/>
<title>Uploader des épreuves</title>
</head>

<body>

<!-- Début des infos utilisateur -->
<?php include("infos_utilisateur.php"); ?>
<!-- Fin -->

<section id="upload">

<p><a href="upload_page1.php">RETOUR A LA PAGE 1</a></p>
<!-- Formulaire d'upload ici -->
	<form method="post" 
    
    <?php echo 'action="upload_reception.php';
    if(isset($_GET['codeFiliere'])) {echo '?codeFiliere='.htmlspecialchars($_GET['codeFiliere']);}
    echo '"';
    if(isset($_GET['codeFiliere'])) {echo ' id="'.$_GET['codeFiliere'].'" ';}
    ?>
    enctype="multipart/form-data">
    
    <p>
    <label for="annee">Année: </label>
    <input type="number" name="annee" id="annee" min=1900 max=2999 step=1 required />
    </p>

    <table>
        <tr>
            <th>Nom de l'épreuve *</th>
            <th>Choisir le fichier *</th>
            <th>Précision</th>
        </tr>
        <tr>
            <td><input type="text" name="nomEpreuve1" size=30 placeholder="Exemple: Mathématiques" required /></td>
            <td><input type="file" name="fichier1" required /></td>
            <td rowspan="5">Uniquement des fichiers PDF<br/><br/>Maximum 5Mo par fichier
            <br/><br/>Taille totale des fichiers: Maximum 25Mo</td>
        </tr>
        <tr>
            <td><input type="text" name="nomEpreuve2" size=30 /></td>
            <td><input type="file" name="fichier2" /></td>
        </tr>
		<tr>
            <td><input type="text" name="nomEpreuve3" size=30 /></td>
            <td><input type="file" name="fichier3" /></td>
        </tr>
		<tr>
            <td><input type="text" name="nomEpreuve4" size=30 /></td>
            <td><input type="file" name="fichier4" /></td>
        </tr>
		<tr>
            <td><input type="text" name="nomEpreuve5" size=30 /></td>
            <td><input type="file" name="fichier5" /></td>
        </tr>
    </table>

	<p><input type="submit" name="boutonUploader" value="Uploader" />  * = <em>Obligatoire</em>
		</p>
	</form>
<p><b>Attention:</b> Les noms d'épreuves doivent obligatoirement: 
<br/>Commencer par une lettre ou un chiffre. Finir par une lettre ou un chiffre.
<br/><u>Caractères autorisés</u>: lettres, chiffres, espaces et tirets.
</p>
</section>

<section id="epreuves_page_upload">

</section>


<script>
/* Evénements gérant la génération de la liste des épreuves */
var sectionEpreuves=document.querySelector("section#epreuves_page_upload");
var inputAnnee=document.querySelector("input#annee");
var formulaire=document.querySelector("form");

 inputAnnee.onblur=function(e2){
    sectionEpreuves.innerHTML=""; //on vide d'abord la section des épreuves
        var annee=inputAnnee.value;
        var code_filiere=encodeURIComponent( formulaire.getAttribute("id") );
        var xhr2 = new XMLHttpRequest();
        xhr2.open('GET', 'generer_epreuves.php?codeFiliere='+code_filiere+'&voirLiens=oui'+'&annee='+annee);
        xhr2.onreadystatechange = function(){
            if (xhr2.readyState == 4 && xhr2.status == 200) //si tout s'est bien passé...
            {
            sectionEpreuves.innerHTML = xhr2.responseText;//	ON AFFICHE LES EPREUVES
            }

        };
        xhr2.send();
    };
</script>


</body>

</html>
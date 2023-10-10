<?php
/* Cette page représente les éléments prévus pour écrire un commentaire sur le site (le forumlaire), 
suivis de l'affichage des commentaires.
La fonction creer_formulaire_et_com ici définie est utilisée dans index.php, concours.php et epreuves.php */

include_once('fonctions.php'); //inclusion des fonctions utiles
?>

<?php
function creer_formulaire_et_com($code_page) //Cette fonction englobe TOUTE LA PAGE
    {//DEBUT_FORMULAIRE_ET_COM
    //$code_page représente la page sur laquelle on se trouve (index, epreuves, concours, etc.)

$pseudo='';
if(user_connected()) { $pseudo=$_SESSION['membre']->getPseudo(); }
elseif(isset($_COOKIE['pseudo_site_epreuves'])) //si son nom est enregistré dans les cookies...
{$pseudo=str_replace( '"','',$_COOKIE['pseudo_site_epreuves'] );
    //PS: On a enlevé les guillemets pour ne pas créer de bug.
}

?>

<section id="formulaire"> <!-- Le formulaire pour commenter -->
<div class="message_a_repondre">
</div>
    <form method="POST" >

    <fieldset >
    <legend><b>Commenter</b></legend>
<?php
if(!user_connected()) //on affiche ce paragraphe ssi l'utilisateur n'est pas connecté
{
?>
<p>
<label for="pseudo">Votre nom: </label> <input type="text" name="pseudo" id="pseudo" maxlength="30" required
    <?php if($pseudo) echo ' value="'.$pseudo.'"'; ?> placeholder="Au moins 2 caractères" />
</p>
<?php } ?>
<p>
<label for="message">Commentaire: </label> <textarea name="message" id="message" rows="6" cols="50" 
 placeholder="Au moins 10 caractères"></textarea>
</p>
<p>
<input type="button" id="bouton_envoi" value="Envoyer" />
</p>
    </fieldset>

    </form>
</section> <!-- Fin du formulaire -->

<section id="commentaires"> <!-- Affichage des commentaires -->
<?php

include_once('actualiser_com.php');

?>
</section> <!-- Fin -->

<script>
var divHaut=document.querySelector("section#formulaire .message_a_repondre");
var formulaire=document.querySelector("section#formulaire form");
var inputPseudo=formulaire.querySelector("input#pseudo");
var areaMessage=formulaire.querySelector("textarea#message");
var bouton_envoi=formulaire.querySelector("input#bouton_envoi");
var sectionCom=document.querySelector("section#commentaires");

var max_messages=<?php echo $max_messages;  /*valeur provenant de actualiser_com.php*/?>;
var ID_PARENT=0;

//blocage de l'action provoquée par l'appui de la touche entrée dans l'input
<?php if(!user_connected()) { ?>
inputPseudo.onkeydown=function(e){ if(e.keyCode==13) e.preventDefault(); };
<?php } ?>
bouton_envoi.onclick=function(e){

    var pseudo=<?php if(user_connected()) {echo '"'.$_SESSION['membre']->getPseudo().'"';}
    else {?>encodeURIComponent( inputPseudo.value )<?php } ?>;

    var message=encodeURIComponent( areaMessage.value );
    
    if(pseudo.length>=2 && message.length>=5)
    {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'com_post.php');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4 && xhr.status == 200) //si tout s'est bien passé...
        {
        sectionCom.innerHTML = xhr.responseText;//	ON AFFICHE LES COMMENTAIRES
        areaMessage.value=""; //On vide le textarea puisque le message a été envoyé
        divHaut.innerHTML="";
        ID_PARENT=0 //on remet ID_PARENT à zéro
        }

    };
    xhr.send('pseudo='+ pseudo + '&message=' + message + 
    '&code_page=<?php echo $code_page.'&url_page='.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI']; ?>' 
    + '&max_messages=' + max_messages
    + '&id_parent=' + ID_PARENT);
    }
 };


function actualiser_com(page_msg) //Affiche les commentaires de la page n° page_msg
{
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'actualiser_com.php');
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.onreadystatechange = function(){
        if (xhr.readyState == 4 && xhr.status == 200) //si tout s'est bien passé...
        {
        sectionCom.innerHTML = xhr.responseText;//	ON ACTUALISE LES COMMENTAIRES selon la page voulue
        }

    };
    xhr.send('code_page=<?php echo $code_page; ?>' + '&page_messages=' + page_msg
    + '&max_messages=' + max_messages);
}

function repondreAuMessage(id_msg)
{
divHaut.innerHTML="";
 var divMessage=document.querySelector("#msg"+id_msg); //on sélectionne le div.message auquel on répond
 var cloneTitre=divMessage.querySelector(".titre_message").cloneNode(true);
 var cloneContenu=divMessage.querySelector(".texte_message").cloneNode(true);

 var spanHaut=divHaut.appendChild(document.createElement('span'));
 spanHaut.innerHTML="<i>Vous répondez au message ci-dessous</i>";
 cloneTitre=divHaut.appendChild(cloneTitre);
 cloneContenu=divHaut.appendChild(cloneContenu);

 lienAnnuler=divHaut.appendChild(document.createElement('a'));
 lienAnnuler.setAttribute('class','annulerRepondre');
 lienAnnuler.innerHTML='Annuler'; lienAnnuler.href='#';
 lienAnnuler.onclick=function(e){divHaut.innerHTML="";
    ID_PARENT=0 //on remet ID_PARENT à zéro
    e.preventDefault();
    };

areaMessage.focus();
ID_PARENT=id_msg; //ID_PARENT devient l'id du message auquel on répond
}

</script>

    <?php
    }//FIN_FORMULAIRE_ET_COM
    ?>

<meta charset="utf-8" />
<?php
echo mt_rand()."\n";
echo mt_rand()."\n";
echo mt_rand(5,15);
echo '<br/>'.realpath('admin/.htpasswd');
?>

<p>
<?php
if (isset($_POST['login']) AND isset($_POST['pass']))
    {
    $login = $_POST['login'];
    $pass_crypte = crypt($_POST['pass']); // On crypte le mot de passe
    echo 'Ligne à copier dans le .htpasswd :<br />' . $login . ':' . $pass_crypte;
    } ?>
</p>
<?php
if (!isset($_POST['login']) OR !isset($_POST['pass'])) // On n'a pas encore rempli le formulaire
 {?>
    <p>Entrez votre login et votre mot de passe pour le crypter.</p>
    <form method="post">
    <p>
    Login : <input type="text" name="login"><br />
    Mot de passe : <input type="text" name="pass"><br /><br />
    <input type="submit" value="Crypter !">
    </p>
    </form>
<?php
 }

/* include_once('Membre.class.php');

$membre=new Membre();
$membre->setPseudo('OXxar');
echo $membre->getPseudo() . ', je vais te bannir !<br/>'; */
//$membre->bannir();
?>
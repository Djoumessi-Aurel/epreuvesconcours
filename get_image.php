<?php

include_once('Membre.class.php');
session_start();

// Vérifiez si l'utilisateur est autorisé à voir cette photo (par exemple, s'il est connecté)
$nom_vrai = explode('/', $_SESSION['membre']->getPhoto_profil());
$nom_vrai = end($nom_vrai);
$nom_fichier = $_GET['file'];

if ($nom_fichier === $nom_vrai) { // Utilisateur autorisé à accéder à l'image

    // Chemin vers le dossier contenant les images
    $chemin_dossier = '../ressources/photos_profil/';

    // Chemin complet vers le fichier
    $chemin_fichier = $chemin_dossier . $nom_fichier;

    // Vérifiez si le fichier existe
    if (file_exists($chemin_fichier)) {
        // Envoyez les en-têtes appropriées pour afficher l'image
        header('Content-Type: image/*');
        header('Content-Disposition: attachment; filename="' . $nom_fichier . '"');

        // Lisez et renvoyez le contenu du fichier
        readfile($chemin_fichier);
    } else {
        // Gérez le cas où le fichier n'existe pas
        echo "Photo de profil introuvable.";
    }
} else {
    // Gérez le cas où l'utilisateur n'est pas autorisé
    echo "Vous n'êtes pas autorisé à accéder à cette ressource.";
}
?>

<?php

include_once('Membre.class.php');
session_start();

if(isset($_SESSION)){
    // Chemin vers le dossier contenant les fichiers PDF
    $chemin_dossier = '../ressources/uploads/';

    // Nom du fichier à télécharger (obtenu par exemple depuis un paramètre GET)
    $nom_fichier = $_GET['fichier'];

    // Chemin complet vers le fichier à télécharger
    $chemin_fichier = $chemin_dossier . $nom_fichier;

    // Vérifier si le fichier existe et est lisible
    if (file_exists($chemin_fichier) && is_readable($chemin_fichier)) {
        // En-têtes pour indiquer que c'est un fichier PDF
        header('Content-Type: application/pdf');
        header('Content-Disposition: attachment; filename="' . $nom_fichier . '"');
        
        // Lire le fichier et le renvoyer au client
        readfile($chemin_fichier);
    } else {
        // Gérer le cas où le fichier n'existe pas ou n'est pas lisible
        echo "Fichier non trouvé.";
    }
}
else {
    // Gérez le cas où l'utilisateur n'est pas autorisé
    echo "Vous n'êtes pas autorisé à accéder à cette ressource.";
}

?>

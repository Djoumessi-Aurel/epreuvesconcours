<?php
class Membre
{
    private $id;
    private $pseudo;
    private $email;
    private $motdepasse;
    private $statut;
    private $grade;
    private $date_inscription;
    private $photo_profil;

 public function __construct($bdd, $table, $idMembre=0)
 {$req=$bdd->prepare('SELECT * FROM '.$table.' WHERE id=?');

      $req->execute( array( $idMembre ) )
      or die(print_r($req->errorInfo())); //lancer la requête
      
          if($donnees=$req->fetch()) //S'il y a un résultat, MISE A JOUR DES ATTRIBUTS
          {$this->id=$donnees['id'];
            $this->pseudo = $donnees['pseudo']; //ON RECONVERTIT LES TEXTES EN UTF-8
            $this->email = $donnees['email'];
            $this->motdepasse = $donnees['mot_de_passe'];
            $this->statut = $donnees['statut'];
            $this->grade = $donnees['grade'];
            $this->date_inscription = $donnees['date_inscription'];
            $this->photo_profil = $donnees['photo_profil'];
          }

 }

 public function envoyerEmail($objet,$message)
 {
    mail($this->email,$objet,$message);
 }

 public function bannir()
 {
    $this->statut = 'banni';
    $this->envoyerEMail('Vous avez été banni', 'Ne revenez plus sur notre site!');
 }

 public function getId()
 {
     return $this->id;
 }

 public function getPseudo()
 {
     return $this->pseudo;
 }
 public function setPseudo($newPseudo)
 { 
    global $bdd;
    $req=$bdd->prepare('UPDATE membres SET pseudo=? WHERE id=?'); //préparer la requête
	$req->execute( array( $newPseudo, $this->id ) )
                    or die(print_r($req->errorInfo())); //lancer la requête
          
    $this->pseudo=$newPseudo;
 }

 public function getEmail()
 {
     return $this->email;
 }
 public function setEmail($newEmail)
 {
    global $bdd;
    $req=$bdd->prepare('UPDATE membres SET email=? WHERE id=?'); //préparer la requête
	$req->execute( array( $newEmail, $this->id ) )
                    or die(print_r($req->errorInfo())); //lancer la requête

    $this->email=$newEmail;
 }

 public function getMotdepasse()
 {
     return $this->motdepasse;
 }
 public function setMotdepasse($newMdp)
 {
    global $bdd;
    $req=$bdd->prepare('UPDATE membres SET mot_de_passe=? WHERE id=?'); //préparer la requête
	$req->execute( array( $newMdp, $this->id ) )
                    or die(print_r($req->errorInfo())); //lancer la requête

    $this->motdepasse=$newMdp;
 }

 public function getStatut()
 {
     return $this->statut;
 }
 public function setStatut($newStatut)
 {
    $this->statut=$newStatut;
 }

 public function getGrade()
 {
     return $this->grade;
 }
 public function setGrade($newGrade)
 {
    $this->grade=$newGrade;
 }

 public function getDate_inscription()
 {
     return $this->date_inscription;
 }

 public function getPhoto_profil()
 {
     return $this->photo_profil;
 }
 public function setPhoto_profil($newPhoto)
 {
    global $bdd;
    $req=$bdd->prepare('UPDATE membres SET photo_profil=? WHERE id=?'); //préparer la requête
	$req->execute( array( $newPhoto, $this->id ) )
                    or die(print_r($req->errorInfo())); //lancer la requête

     $this->photo_profil = $newPhoto;
 }

}

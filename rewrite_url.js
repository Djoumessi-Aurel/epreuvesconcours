/* Script permettant de réécrire certaines URL de la page sous une forme plus propre
(sans les ? et &) */

function rewriteURL(lien) //Réécris le lien (href) de la balise <a> passée en paramètre
 {
    let adresse=lien.href,
    Reg1=/index.php/i, Reg2=/\.php\?(codeEcole|codeFiliere)=/i, Reg3=/([A-Za-z0-9_-]+)\.php$/i;

    if(Reg1.test(adresse)) {adresse=adresse.replace(Reg1,'accueil');}
    else if(Reg2.test(adresse)) {adresse=adresse.replace(Reg2,'-');}
    else if(Reg3.test(adresse)) {adresse=adresse.replace(Reg3,'$1');}
    else {return 0;}

    lien.href=adresse;
    return 1; //Si le lien a été effectivement modifié, on retourne 1
 }


(function ()
    {
        window.addEventListener('load', function(){
            let liens=document.querySelectorAll('a'), taille=liens.length, nb=0;
            for(let i=0; i<taille; i++)
             {
                nb += rewriteURL(liens[i]);
             }
            console.log(`${nb} adresses réécrites.`);
        },
        false);
    })();


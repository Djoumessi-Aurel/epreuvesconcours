/* Ce script gère l'animation du menu du site, AINSI QUE LE CAROUSEL (voir dernière partie du script) */

var couleur_titre_menu="rgb(104, 174, 206)", couleur_titre_menu_hover="rgb(229,93,66)";

var menu=document.querySelectorAll("header .menu1");	//la liste des menu1 de l'entête.
var menuCorps=document.querySelectorAll("#corps .menu1");//la liste des menu1 du corps de la page.
var titre_menu,liste;
		/*		Attribution des évènements: Début		*/
	for(var i=0,b=menu.length;i<b;i++)		/*Cas des menus de l'entête*/
	 {	 
	 menu[i].onmouseout=function(e){var monMenu=getMenu(e,"menu1"); //alert(monMenu.innerHTML);
	 titre_menu = monMenu.querySelector(".titre_menu");
	 liste = monMenu.querySelector(".liste");
		
		liste.classList.remove('animate__animated', 'animate__fadeIn');
		liste.style.display="none";
		titre_menu.style.backgroundColor=couleur_titre_menu;};
		
	menu[i].onmouseover=function(e){var monMenu=getMenu(e,"menu1"); //alert(monMenu.innerHTML);
	 titre_menu = monMenu.querySelector(".titre_menu");
	 liste = monMenu.querySelector(".liste");
		liste.style.display="block";
		liste.classList.add('animate__animated', 'animate__fadeIn');
		titre_menu.style.backgroundColor=couleur_titre_menu_hover;};	
	 }


	for(var i=0,b=menuCorps.length;i<b;i++)		/*Cas des menus du corps de la page*/
	 {
		menuCorps[i].querySelector(".liste").style.display="block"; /*Au départ, on affiche les listes*/
			
	 titre_menu = menuCorps[i].querySelector(".titre_menu");
	 titre_menu.onclick=function(e){var monMenu=getMenu(e,"menu1"); //alert(monMenu.innerHTML);
				var maFleche=monMenu.querySelector(".titre_menu img");
				var target=e.target||e.srcElement;
	 
	 liste = monMenu.querySelector(".liste");
	 if(liste.style.display=="none")
		{liste.style.display="block"; maFleche.setAttribute("src","fleche_haut.png");
			target.setAttribute("title","Cliquez pour réduire");
		 liste.classList.add('animate__animated', 'animate__fadeIn');
		}
     else 
		{liste.style.display="none"; maFleche.setAttribute("src","fleche_bas.png");
			target.setAttribute("title","Cliquez pour dérouler");
		 liste.classList.remove('animate__animated', 'animate__fadeIn');
		}
			
			};
			
	 }
	/*		Fin de l'attribution des évènements		*/
	
	function getMenu(e,typeMenu)	//Recherche le parent le plus proche (du déclencheur de l'événement e) dont la classe est typeMenu
	 {var classe="",target=e.target||e.srcElement;
	 classe=target.getAttribute("class");
	 while(classe!=typeMenu)
		{target=target.parentNode;
		 classe=target.getAttribute("class");
		}
		return target;	//au final, target est l'élément dont la classe est typeMenu
	 }


/* GESTION DU CAROUSEL */

$(
	function(){
		$("#carousel").slick({autoplay: true, autoplaySpeed: 5000, speed: 1000, dots: true});
	}
);

/* FIN */
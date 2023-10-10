<?php
	function afficherDate()
	{return "<b>".date('d')."/".date('m')."/".date('Y')."</b>";
	}
	$tableau=array('nom'=>'Djoumessi','prenom'=>'Aurel B.','date_validite'=>2020);
?>

<footer>
<p>
<br/><br/><?php echo afficherDate();?><br/><br/>Copyright @igea 2020.
</p>
</footer>
var reminder = localStorage.reminderme;

function save_options() {
	var delay 		= document.querySelector("#delay").value;
	
	var status	= "";
	
	//on type la variable comme entier
	delay = parseInt(delay);
	
	//on vérifie la valeur du champ
	if(delay <= 0)
		status = '<font color="red">Erreur de sauvegarde !</font>';
	else if(delay < 2 || delay >= 30)
		status = '<font color="red">Le délai doit être compris entre 2 et 30 minutes !</font>';
	else {
		if(reminder)
		{
			var hour 	= document.querySelector("#reminderHour").value;
			var minutes	= document.querySelector("#reminderMinutes").value;
			
			hour 	= parseInt(hour);
			minutes	= parseInt(minutes);
			
			if(hour < 0 || hour > 23)
				status = '<font color="red">La valeur de l\'heure doit être comprise entre 0 et 24</font>';
			else if(minutes < 0 || minutes > 59)
				status = '<font color="red">La valeurs des minutes doit être compris entre 0 et 60</font>';
			else
			{
				localStorage.reminderme = true;
				localStorage.hour		= hour;
				localStorage.minutes	= minutes;
			}
		}
		else
		{
			localStorage.reminderme = false;
			localStorage.hour		= 0;
			localStorage.minutes	= 0;
		}
		
		localStorage.delay = delay;
		
		if(!status) status	= '<font color="green">Options Sauvegardées !</font>';
	}
	
	document.querySelector("#status").innerHTML = status;
	setTimeout(function() { document.querySelector("#status").innerHTML = ""; }, 1500);
}

function reminderMeToggle()
{
	if(reminder)
	{
		reminder = false;
		document.querySelector('#reminderTime').style.display = 'none';
	}
	else
	{
		reminder = true;
		document.querySelector('#reminderTime').style.display = 'block';	
	}		
}

document.querySelector('#reminder').addEventListener('click', reminderMeToggle);

document.querySelector('#delay').value = localStorage.delay;
if(reminder) {
	document.querySelector('#reminderTime').style.display = 'block';
	document.querySelector("#reminder").checked = 'checked';
	document.querySelector("#reminderHour").value = localStorage.hour;
	document.querySelector("#reminderMinutes").value = localStorage.minutes;
}
else document.querySelector('#reminderTime').style.display = 'none';

document.querySelector('#form_options').addEventListener('submit', save_options);

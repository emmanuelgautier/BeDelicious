var icons	 	= Array('open', 'close');
var i			= 0; //l'index du tableau des icons
var loading		= true;
var state		= false; //défini l'état du snack, true si ouvert et false si fermé
var popupOpened = false; //défini si la popup s'est déjà ouverte ou non cela évite d'en avoir plein qui reste

var remindermeActivated = false;

var url = "http://food.bedelicious.fr/";

//on regarde si une valeur par défaut a été donné pour delay
if(localStorage.delay == undefined || parseInt(localStorage.delay) < 1)
	localStorage.delay = 5;

function setIconOpen()
{
	chrome.browserAction.setIcon({path:icons[0] + ".png"});
}

function setIconClose()
{
	chrome.browserAction.setIcon({path:icons[1] + ".png"});
}

function noticeConnectionLost()
{
	chrome.browserAction.setIcon({path:"cross.png"});
}

function checkState()
{
	var xhr = new XMLHttpRequest();
	xhr.open("GET", url+"services/status/get", true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4) {
			if(xhr.status == 200 && xhr.responseText != ""){
				// permet d'évaluer un script dangereux et detecte les erreurs de syntaxes
				var obj = eval("(" + xhr.responseText + ")");
				
				if(obj.shop_status == "open")
				{
					//ça ne sera à rien de reexuté le script si état n'a pas changé
					if(!state)
					{
						if(!loading){
							opening.show();					
						}
						open();
					}
				}
				else if(state)
				{
					close();
				}
				else
				{
					setIconClose();
				}	
			}else {
				console.log("Code HTTP réponse : "+xhr.status);
				connectionLost();
			}
			
		if(loading)
			loading=false;			
		}
	};
	xhr.onerror = function() { connectionLost();  console.log("Erreur de requête : "+xhr.error); };
	xhr.send(null);
	
	if(localStorage.reminderme && !remindermeActivated) reminderMe();
}

function open()
{
	state=true;
	setIconOpen();
}

function close()
{
	state=false;
	setIconClose();
}

function connectionLost()
{
	state = false;
	noticeConnectionLost();
}

chrome.browserAction.onClicked.addListener(function() {
	chrome.tabs.create({
		'url':url,
		'selected':true
	});
});

var opening = webkitNotifications.createNotification(
  'food.png',  // icon url - can be relative
  'Snack ouvert !',  // notification title
  'C\'est l\'heure, il faut commander !'  // notification body text
);

var time = webkitNotifications.createNotification(
	'food.png',
	'L\'heure passe !',
	'Il va être dans bientôt l\'heure, vous avez commandé ?'
);

var checkStateAlarm;
var remindermeAlarm;

//permet de définir l'alarme pour la vérification de l'ouverture du BDE
function alarm()
{
	var delay = localStorage.delay;
	checkStateAlarm = chrome.alarms.create('check', {periodInMinutes: parseInt(localStorage.delay)}); //on défini l'alarme et on l'initialise 
	chrome.alarms.onAlarm.addListener(function(checkStateAlarm) {
		checkState();
		//dans le cas où le délai a été changé on redifini l'alarme
		if(delay != localStorage.delay){
			delay = localStorage.delay;
			resetAlarm();
		}
	});
}

function cancelAlarm()
{
	chrome.alarms.clear('check');
}

function resetAlarm()
{
	//on redéfini la variable contenant l'alarme
	checkStateAlarm = chrome.alarms.create('check', {periodInMinutes: parseInt(localStorage.delay)});
}

function reminderMe()
{
	remindermeActivated = true;

	var minutes = localStorage.minutes;
	var hour	= localStorage.hour;
	
	var Currenthour 	= (new Date()).getHours();
	var Currentminutes	= (new Date()).getMinutes();	
	
	var delayinminutes = (hour - Currenthour) * 60 + (minutes - Currentminutes);
	
	if(delayinminutes < 0)
	{
		var minutesinday = 24 * 60;
		delayinminutes = minutesinday - delayinminutes;
	}
	
	remindermeAlarm = chrome.alarms.create('reminderme', {delayInMinutes: delayinminutes});
	chrome.alarms.onAlarm.addListener(function(remindermeAlarm) {
		if(state) time.show();
	});
}

checkState();
alarm();
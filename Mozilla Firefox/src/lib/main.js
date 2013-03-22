var icons       = Array('open', 'close');
var i           = 0;
var loading     = true;
var state       = false;
var popupOpened = false;

var remindermeActivated = false;

var url = "http://food.bedelicious.fr/";

var widgets         = require("sdk/widget");
var tabs            = require("sdk/tabs");
var notifications   = require("sdk/notifications");
var self            = require("self");
var pref            = require("sdk/simple-prefs").prefs;
var Request         = require("sdk/request").Request;
var timer           = require('timer');

var icon        = self.data.url("icon.png");
var iconWidget  = widgets.Widget({ id: "bdelicious-link", label: "Site du BDE", contentURL: self.data.url(icons[0]+".png"), onClick: function() { tabs.open("http://food.bedelicious.fr/"); }});

function setIconOpen()
{
    iconWidget.contentURL = self.data.url(icons[0]+".png");
}

function setIconClose()
{
    iconWidget.contentURL = self.data.url(icons[1]+".png");
}

function noticeConnectionLost()
{
    iconWidget.contentURL = self.data.url("cross.png");
}

function checkState()
{
    Request({
      url: url+"services/status/get",
      onComplete: function (response) {
        if(response.status == 200)
        {
            if (response.json.shop_status === "open") {
                if(!state)
                {
                    if(!loading){
                        notifications.notify({ title: "Snack ouvert !", text: "C'est l'heure, il faut commander !", iconURL: icon });
                    }
                    open();
                }
            } else if(state){
                close();
            }
            else{
                setIconClose();
            }
        } 
        else {
            console.log("Code HTTP réponse : " + response.status);
            connectionLost();
        }
        
        if(loading)
            loading = false;
      }
    }).get();
    
    if(pref.reminderme && !remindermeActivated) reminderMe();
}

function open()
{
    state = true;
    setIconOpen();
}

function close()
{
    state = false;
    setIconClose();
}

function connectionLost()
{
    state = false;
    noticeConnectionLost();
}

var checkStateAlarm;
var remindermeAlarm;

function alarm()
{
    if(pref.delay < 2) pref.delay = 2;

    var delay = pref.delay;
    
    checkStateAlarm = timer.setInterval(function(){
        checkState();
        
        if(delay != pref.delay){
            resetAlarm();
        }
    }, delay * 60 * 1000);//on convertir en ms
}

function cancelAlarm(){
    timer.clearInterval(checkStateAlarm);
}

function resetAlarm()
{
    cancelAlarm();
    alarm();
}

function reminderMe()
{
    remindermeActivated = true;

    var reminderTime    = pref.reminderTime;
    reminderTime        = reminderTime.split(":");

    var hour    = parseInt(reminderTime[0]);
    var minutes = parseInt(reminderTime[1]);
    
    console.log("minutes : "+ minutes);
    console.log("hour : "+ hour);
    
    var CurrentHour     = (new Date()).getHours();
    var CurrentMinutes  = (new Date()).getMinutes();
    
    var delayinms = ((hour - CurrentHour) * 60 + (minutes - CurrentMinutes)) * 60 * 1000;

    if(delayinms < 0)
    {
        var msinday = 24 * 60 * 60 * 1000;
        delayinms   = msinday - delayinms;
    }

    reminderAlarm = timer.setTimeout(function(){
        if(state) notifications.notify({ title: "L'heure passe !", text: "il va bientôt être l'heure, vous avez commandé ?", iconURL: icon });
    }, delayinms);
}

checkState();
alarm();
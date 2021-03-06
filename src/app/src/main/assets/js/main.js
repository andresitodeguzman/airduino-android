$(document).ready(function(){
    loginCheck();
    $('.dropdown-trigger').dropdown();
    $('.modal').modal();
    $('.tabs').tabs();

    var sd = getSavedDevices();
    try {
        sd.forEach(element=>{
            getTemperatureObject(element.device_id);
            getHumidityObject(element.device_id);
            getAirQualityObject(element.device_id);
        });
    } catch(e){
        console.log(e);
    }

    hideWindowedBar();
    clear();
    $(".splashscreen").fadeOut();
	setupNewsFeed();
    prepareAccount();
    prepareHome();

    showActivity("home");

    setInterval(()=>{
    	var sd = getSavedDevices();
    	
    try {
        setupNewsFeed();
        sd.forEach(element=>{
            getTemperatureObject(element.device_id);
            getHumidityObject(element.device_id);
            getAirQualityObject(element.device_id);
        });
        prepareHome();
    } catch(e){
        console.log(e);
    }
    },30000);

}).keypress(e=>{
	var key = e.which;
	
	if(key == 13){
		var ch =  $("#Ausername").val();
		if(ch){
			editAccount();
		}
	}
	
});

var showToast = (msg)=>{
    try {
        Android.showToast(msg);
    } catch(error){
        console.log({
            "Message":"Cannot fire up native toast. You might be debugging in a web browser.",
            "Content":msg
        });
        M.toast({html:msg,durationLength:2000});
    }
};

var loginCheck = ()=>{
    if(localStorage.getItem('airduino-loggedin')){
        var li = localStorage.getItem('airduino-loggedin');
        if(li != 'true') {
            location.replace('welcome.html');
        }
    } else {
        location.replace('welcome.html');
    }
};


// activity
var clear = ()=>{ $(".activity").hide(); };
var showActivity = (actName)=>{ clear(); $(`#${actName}Activity`).fadeIn(); $('html,body').animate({scrollTop:0},'fast'); };

// navbar
var hideNavbar = ()=>{ $("#regularNavbar").hide(); };
var showNavbar = ()=>{ $("#regularNavbar").show(); };

// bottombar
var showBottombar = ()=>{ $(".bottombar").show(); };
var hideBottombar = ()=>{ $(".bottombar").hide(); };

// windowed bar
var hideWindowedBar = ()=>{ $("#windowedNavbar").hide(); };
var showWindowedBar = ()=>{ $("#windowedNavbar").show(); };

var showPreloader = ()=>{
    hideNavbar();
    hideWindowedBar();
    hideBottombar();
    showActivity('preloader');
};

var hidePreloader = ()=>{
    clear();
    showNavbar();
    showBottombar();
};

var refreshActivity = ()=>{
    hideWindowedBar();
    showNavbar();
    showBottombar();
}

var refreshData = ()=>{
	 showToast("Getting new data");
     var sd = getSavedDevices();
    	
    try {
        sd.forEach(element=>{
            getTemperatureObject(element.device_id);
            getHumidityObject(element.device_id);
            getAirQualityObject(element.device_id);
        });
        setupNewsFeed();
        prepareHome();
       } catch(e){
       	
       	console.log(e);
       	
       }
};


var isDarkMode = ()=>{
	if(!localStorage.getItem("airduino-darkmode")){
		return false;
	} else {
		if(localStorage.getItem("airduino-darkmode") == "on"){
			return true;
		} else {
			return false;
		}
	}
}


var getSavedDevices = ()=>{
    if(localStorage.getItem("airduino-devices")){
        var devices = JSON.parse(localStorage.getItem("airduino-devices"));
        if(devices == ""){
            return [];
        } else {
            return devices;
        }
    } else {
        return [];
    }
}

var getAccount = ()=>{
    if(localStorage.getItem("airduino-user")){
        return JSON.parse(localStorage.getItem("airduino-user"));
    } else {
        return {};
    }
}

var prepareAccount = ()=>{
    var account = getAccount();
    var fn = account['first_name'];
    var ln = account['last_name'];
    var u = account['username'];
    var i = account['id'];
    var e = account['email'];

    $(".first_name").html(fn);
    $(".last_name").html(ln);
    $(".username").html(u);

    $("#Afirst_name").val(fn);
    $("#Alast_name").val(ln);
    $("#Ausername").val(u);
    $("#Aemail").val(e);

    M.updateTextFields();
    
}

var prepareHome = ()=>{
	
    var d = new Date();
    var time = d.getHours();

    if(time < 12){
        // morning
        $("#homeGreet").html("Good Morning");
    } else {
        if(time == 12){
            // noon
            $("#homeGreet").html("Good Day");
        } else {
            if(time <= 18){
                // afternoon
                $("#homeGreet").html("Good Afternoon");
            } else {
                //evening
                $("#homeGreet").html("Good Evening");
            } // <6
        }// == 12
    } // < 12
	
    var savedDevices = getSavedDevices();

    if(savedDevices == ""){
        $("#homeDevices").hide();
        $("#homeEmptyDevices").show();
    } else {

        if(savedDevices == []){
            $("#homeDevices").hide();
            $("#homeEmptyDevices").show();
        } else {
            $("#homeDevicesList").html("");
            savedDevices.forEach(element => {

                try {

                    getTemperatureObject(element.device_id);
                    getHumidityObject(element.device_id);
                    getAirQualityObject(element.device_id);

                    var temp = JSON.parse(localStorage.getItem(`airduino-temperature-${element.device_id}`));
                    var hum = JSON.parse(localStorage.getItem(`airduino-humidity-${element.device_id}`));
                    var air = JSON.parse(localStorage.getItem(`airduino-airquality-${element.device_id}`));

                    temp = temp[temp.length - 1];
                    hum = hum[hum.length - 1];
                    air = air[air.length - 1];
                    airdesc = air.description;
                    
                    switch(airdesc){
                    	case('Good'):
                    		airdesc = `<span class="green-text text-darken-2">Good</span>`;
                    		break;
                    	case('Moderate'):
                    	 airdesc = `<span class="yellow-text text-darken-2">Moderate</span>`;
                    		break;
                    	case('Unhealty 1'):
                    		airdesc = `<span class="orange-text text-darken-2">Unhealthy for Sensitive Groups</span>`;
                    		break;
                    		case('Unhealty 2'):
                    		airdesc = `<span class="red-text text-darken-2">Unhealthy</span>`;
                    		break;
                    	case('Very Unhealty'):
                    		airdesc = `<span class="purple-text text-darken-2">Very Unhealthy</span>`;
                    		break;
                    	case('Hazardous'):
                    		airdesc = `<span class="red-text text-darken-3">Hazardous</span>`;
                    		break;
                    	default:
                    		airdesc = `<span class="blue-text text-darken-2">${airdesc}</span>`;
                    		break;
                    }

                    var ts = new Date(temp.timestamp);

                    var tpl = `
                        <h4>${element.location}</h4>
                        <p>${element.city}</p>
                        <div class="row">
                            <div class="col s6">
                                <h1 class="blue-text text-darken-2">${temp.value}°C</h1>
                                <p>${hum.value}% Humidity</p>
                            </div>
                            <div class="col s6">
                            <br>
                                <p style="font-size:-1;">Air Quality</p>
                                <h5>${airdesc}</h5>
                                <p>at ${air.value} PPM</p>
                            </div>
                        </div>
                        <p class="grey-text">As of ${ts.toDateString()} ${ts.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        <br><br>
                        <div class="row">
                            <div class="col s4">
                                <a href="#!" onclick="launchTemperature('${element.id}');">
                                    <div class="circle_button_small red lighten-2" style="border:0px;">
                                        <i class="material-icons white-text">wb_sunny</i>
                                    </div>
                                    <p class="grey-text darken-1">Temperature</p>
                                </a>
                            </div>
                            <div class="col s4">
                                <a href="#!" onclick="launchHumidity('${element.id}');">
                                    <div class="circle_button_small green lighten-2" style="border:0px;">
                                        <i class="material-icons white-text">cloud</i>
                                    </div>
                                    <p class="grey-text darken-1">Humidity</p>
                                </a>
                            </div>
                            <div class="col s4">
                                <a href="#!" onclick="launchAirQuality('${element.id}');">
                                    <div class="circle_button_small blue lighten-2" style="border:0px;">
                                        <i class="material-icons white-text">tonality</i>
                                    </div>
                                    <p class="grey-text darken-1">Air Quality</p>
                                </a>
                            </div>
                        </div>
                        
                        <br><br><br>
                    `;
                    $("#homeDevicesList").append(tpl);
    
                } catch(e){

                    var tpl = `
                        <h4>${element.location}</h4>
                        <p>${element.city}</p>
                        <br><br>
                        <div class="row">
                            <div class="col s4">
                                <a href="#!" onclick="launchTemperature('${element.id}');">
                                    <div class="circle_button_small red lighten-2" style="border:0px;">
                                        <i class="material-icons white-text">wb_sunny</i>
                                    </div>
                                    <p class="grey-text darken-1">Temperature</p>
                                </a>
                            </div>
                            <div class="col s4">
                                <a href="#!" onclick="launchHumidity('${element.id}');">
                                    <div class="circle_button_small green lighten-2" style="border:0px;">
                                        <i class="material-icons white-text">cloud</i>
                                    </div>
                                    <p class="grey-text darken-1">Humidity</p>
                                </a>
                            </div>
                            <div class="col s4">
                                <a href="#!" onclick="launchAirQuality('${element.id}');">
                                    <div class="circle_button_small blue lighten-2" style="border:0px;">
                                        <i class="material-icons white-text">tonality</i>
                                    </div>
                                    <p class="grey-text darken-1">Air Quality</p>
                                </a>
                            </div>
                        </div>
                        
                        <br><br><br>
                    `;

                    $("#homeDevicesList").append(tpl);

                }
            });

            $("#homeEmptyDevices").hide();
            $("#homeDevices").show();
        }
        
    }
}

var getSavedDeviceInfo = (id)=>{
    var devices = getSavedDevices();
    try {
        return devices.find(obj=>{if(obj.id == id) return obj;});
    } catch (error) {
        return {};
    }
}

var getTemperatureObject = (id)=>{

    $.ajax({
        type:'GET',
        url:'https://airduino-ph.000webhostapp.com/api/temperature/getLastFifty.php',
        data: {
            device_id:id
        },
        success: result=>{
            result = JSON.parse(result);
            localStorage.setItem(`airduino-temperature-${id}`,JSON.stringify(result));
        }
    }).fail((error)=>{            
        console.log(error);
    });
    
}

var getHumidityObject = (id)=>{

    $.ajax({
        type:'GET',
        url:'https://airduino-ph.000webhostapp.com/api/humidity/getLastFifty.php',
        data: {
            device_id:id
        },
        success: result=>{
            result = JSON.parse(result);
            result = result.reverse();
            localStorage.setItem(`airduino-humidity-${id}`,JSON.stringify(result));
        }
    }).fail((error)=>{            
        console.log(error);
    });
    
};

var getAirQualityObject = (id)=>{

    $.ajax({
        type:'GET',
        url:'https://airduino-ph.000webhostapp.com/api/airquality/getLastFifty.php',
        data: {
            device_id:id
        },
        success: result=>{
        		   
            result = result.reverse();
            localStorage.setItem(`airduino-airquality-${id}`,JSON.stringify(result));
        }
    }).fail((error)=>{            
        console.log(error);
    });
    
};

var launchTemperature = (id)=>{
    try {
        var device = getSavedDeviceInfo(id);
        getTemperatureObject(device.device_id);

        var result = localStorage.getItem(`airduino-temperature-${device.device_id}`);
        

        try {
            result = JSON.parse(result);
            $("#Tlocation").html(device.location);
            $("#Tcity").html(device.city);
            try {
            			if(isDarkMode() == true){
	            				$("#Tcardaction").html(`<a href="https://airduino-ph.000webhostapp.com/export/dark.php?data_cat=temperature&device_id=${device.device_id}" class="white-text" onclick="showToast('Please wait...');">Export</a>`);
            			} else {
            				$("#Tcardaction").html(`<a href="https://airduino-ph.000webhostapp.com/export/index.php?data_cat=temperature&device_id=${device.device_id}" class="grey-text text-darken-2" onclick="showToast('Please wait...');">Export</a>`);
            			}
            } catch(error){
            		$("#Tcardaction").html(`<a href="https://airduino-ph.000webhostapp.com/export/index.php?data_cat=temperature&device_id=${device.device_id}" class="grey-text text-darken-2" onclick="showToast('Please wait...');">Export</a>`);
            }
                
            var latest = result[result.length - 1];
   
            var ts = new Date(latest.timestamp);
            ts = `${ts.toDateString()} ${ts.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    
    
            $("#Ttemperature").html(`${latest.value}°C`);
            $("#Tdatetime").html(ts);
    
            var time_labels = [];
            var temp_data = [];
    
            $("#Thistory").html("");
            
            if(result.length > 5){
                var resultSlice = result.slice(result.length - 5);
            } else {
                var resultSlice = result;
            }

            resultSlice.forEach(element=>{
                var date = new Date(element.timestamp);
                var time = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                time_labels.push(time);
    
                temp_data.push(element.value);
            });
    
            if(result.length > 10){
                result = result.slice(result.length - 10);
            }

            result.forEach(element=>{
                var date = new Date(element.timestamp);            
    
                if(isDarkMode() == true){
                	var tpl = `
                    <li class="collection-item blue-grey darken-3">
                        <p class="white-text">${element.value}°C</p>
                        <p style="font-size:8pt;" class="grey-text">${date.toDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </li>
                `;    
                } else {
                  var tpl = `
                    <li class="collection-item">
                        <p>${element.value}°C</p>
                        <p style="font-size:8pt;" class="grey-text">${date.toDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </li>
                `;  
                }
                    
                $("#Thistory").append(tpl);
    
            });
    
            new Chart(
                document.getElementById("Tchart"),{
                    "type":"line",
                    "data":{
                        "labels":time_labels,
                        "datasets":
                        [
                            {
                                "label":"Temperature","data":temp_data,
                                "fill":false,
                                "borderColor":"#1e88e5",
                                "lineTension":0.01
                            }
                        ]
                    },
                    "options":{}
                }
            );
    
            hideNavbar();
            hideBottombar();
            showWindowedBar();
            showActivity("temperature");
            $('html,body').animate({scrollTop:0},'medium');
    

        } catch(e){
            showToast("No available data yet");
            console.log(e);
        }

    } catch (error) {
        showToast("Cannot load temperature");
        console.log(error);
    }
};

var launchHumidity = (id)=>{
    try {

        var device = getSavedDeviceInfo(id);
        getHumidityObject(device.device_id);
        
        try {

            result = JSON.parse(localStorage.getItem(`airduino-humidity-${device.device_id}`));

            $("#Hlocation").html(device.location);
            $("#Hcity").html(device.city);
            
            try {
            			if(isDarkMode() == true){
	            				$("#Hcardaction").html(`<a href="https://airduino-ph.000webhostapp.com/export/dark.php?data_cat=humidity&device_id=${device.device_id}" class="modal-trigger white-text" onclick="showToast('Please wait...');">Export</a>`);
            			} else {
            				$("#Hcardaction").html(`<a href="https://airduino-ph.000webhostapp.com/export/index.php?data_cat=humidity&device_id=${device.device_id}" class="modal-trigger grey-text text-darken-2" onclick="showToast('Please wait...');">Export</a>`);
            			}
            } catch(error){
            		$("#Hcardaction").html(`<a href="https://airduino-ph.000webhostapp.com/export/index.php?data_cat=humidity&device_id=${device.device_id}" class="modal-trigger grey-text text-darken-2" onclick="showToast('Please wait...');">Export</a>`);
            } 

            var latest = result[result.length - 1];
            var ts = new Date(latest.timestamp);
            $("#Hpercentage").html(latest.value + "%");
            $("#Hdatetime").html(`${ts.toDateString()} ${ts.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`);

            $("#Hhistory").html("");

            var time_labels = [];
            var temp_data = [];

            if(result.length > 10){
                var resultSlice = result.slice(result.length - 10);
            } else {
                var resultSlice = result;
            }
            resultSlice.forEach(element=>{
                var date = new Date(element.timestamp);
                var time = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                time_labels.push(time);
    4
                temp_data.push(element.value);
            });
    
            if(result.length > 10){
                result = result.slice(result.length - 10);
            }
            result.forEach(element=>{
                var date = new Date(element.timestamp);
    
                if(isDarkMode() == true){
                	var tpl = `
                    <li class="collection-item blue-grey darken-3">
                        <p class="white-text">${element.value}%</p>
                        <p style="font-size:8pt;" class="grey-text">${date.toDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </li>
                `;    
                } else {
                  var tpl = `
                    <li class="collection-item">
                        <p>${element.value}%</p>
                        <p style="font-size:8pt;" class="grey-text">${date.toDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </li>
                `;  
                }
                
    
                $("#Hhistory").append(tpl);
    
            });

            new Chart(
                document.getElementById("Hchart"),{
                    "type":"line",
                    "data":{
                        "labels":time_labels,
                        "datasets":
                        [
                            {
                                "label":"Humidity","data":temp_data,
                                "fill":false,
                                "borderColor":"#1e88e5",
                                "lineTension":0.01
                            }
                        ]
                    },
                    "options":{}
                }
            );

            hideNavbar();
            hideBottombar();
            showWindowedBar();
            showActivity('humidity');
            $('html,body').animate({scrollTop:0},'medium');
            

        } catch(error){
            showToast("No available data yet");
        }
    } catch(error){
        showToast("Cannot load humidity");
        console.log(error);
    }
};


var launchAirQuality = (id)=>{
	try {

        var device = getSavedDeviceInfo(id);
        
        getAirQualityObject(device.device_id);
        
        var result = JSON.parse(localStorage.getItem(`airduino-airquality-${device.device_id}`));
        
 								try {

	        var latest = result[result.length - 1];
	
	        $("#Alocation").html(device.location);
	        $("#Acity").html(device.city);
	        
	        try {
            			if(isDarkMode() == true){
	            				$("#Acardaction").html(`<a href="https://airduino-ph.000webhostapp.com/export/dark.php?data_cat=airquality&device_id=${device.device_id}" class="modal-trigger white-text" onclick="showToast('Please wait...');">Export</a>`);
            			} else {
            				$("#Acardaction").html(`<a href="https://airduino-ph.000webhostapp.com/export/index.php?data_cat=airquality&device_id=${device.device_id}" class="modal-trigger grey-text text-darken-2" onclick="showToast('Please wait...');">Export</a>`);
            			}
            } catch(error){
            		$("#Acardaction").html(`<a href="https://airduino-ph.000webhostapp.com/export/index.php?data_cat=airquality&device_id=${device.device_id}" class="modal-trigger grey-text text-darken-2" onclick="showToast('Please wait...');">Export</a>`);
            }
 
	
	        var lValue = latest.value;
	        var lDescription = latest.description;
	        var airdesc = lDescription;
	        
	        switch(airdesc){
                    	case('Good'):
                    		airdesc = `<span class="green-text text-darken-2">Good</span>`;
                    		break;
                    	case('Moderate'):
                    	 airdesc = `<span class="yellow-text text-darken-2">Moderate</span>`;
                    		break;
                    	case('Unhealty 1'):
                    		airdesc = `<span class="orange-text text-darken-2">Unhealthy for Sensitive Groups</span>`;
                    		break;
                    		case('Unhealty 2'):
                    		airdesc = `<span class="red-text text-darken-2">Unhealthy</span>`;
                    		break;
                    	case('Very Unhealty'):
                    		airdesc = `<span class="purple-text text-darken-2">Very Unhealthy</span>`;
                    		break;
                    	case('Hazardous'):
                    		airdesc = `<span class="red-text text-darken-3">Hazardous</span>`;
                    		break;
                    	default:
                    		airdesc = `<span class="blue-text text-darken-2">${airdesc}</span>`;
                    		break;
                    }
	
            if(isDarkMode() == true){
               $("#Aquality").html(`<b>${airdesc} </b><br><span class="white-text">${lValue} PPM</span>`);
            } else {
            	$("#Aquality").html(`<b>${airdesc} </b><br><span class="grey-text text-darken-2">${lValue} PPM</span>`);   
            }
	        
	
	        var ts = new Date(latest.timestamp);
	        ts = `${ts.toDateString()} ${ts.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
	
	        $("#Adatetime").html(ts);
	
	        var time_labels = [];
	        var temp_data = [];
	
	        $("#Ahistory").html("");
	        
	        if(result.length > 10){
	            var resultSlice = result.slice(result.length - 10);
	        } else {
	            var resultSlice = result;
	        }
	        resultSlice.forEach(element=>{
	            var date = new Date(element.timestamp);
	            var time = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
	            time_labels.push(time);
	
	            temp_data.push(element.value);
	        });
	
	        if(result.length > 10){
	            result = result.slice(result.length - 10);
	        }
	        result.forEach(element=>{
	            var date = new Date(element.timestamp);
	
                if(isDarkMode() == true){
                	var tpl = `
	                <li class="collection-item blue-grey darken-3">
	                    <p class="white-text">${element.description} at ${element.value} PPM</p>
	                    <p style="font-size:8pt;" class="grey-text">${date.toDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
	                </li>
	            `;    
                } else {
                  var tpl = `
	                <li class="collection-item">
	                    <p>${element.description} at ${element.value} PPM</p>
	                    <p style="font-size:8pt;" class="grey-text">${date.toDateString()} ${date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
	                </li>
	            `;  
                }
	            
	
	            $("#Ahistory").append(tpl);
	
	        });
	
	            new Chart(
	                document.getElementById("Achart"),{
	                    "type":"line",
	                    "data":{
	                        "labels":time_labels,
	                        "datasets":
	                        [
	                            {
	                                "label":"Air Quality","data":temp_data,
	                                "fill":false,
	                                "borderColor":"#1e88e5",
	                                "lineTension":0.01
	                            }
	                        ]
	                    },
	                    "options":{}
	                }
	            );
	
	        hideNavbar();
	        hideBottombar();
	        showWindowedBar();
	        showActivity('airquality');
	        $('html,body').animate({scrollTop:0},'medium');
	       } catch(error){
	       	
											showToast("No available data yet");
												       	
	       }

	    } catch(error){
        showToast("Cannot load air quality");
        console.log(error);
    }
};


var setupNewsFeed = ()=>{
	var emptyFeed = `<center><p>No Alerts Yet</p></center>`;
	var populate = ()=>{
		$("#newsfeedList").html("");
		if(localStorage.getItem('airduino-newsfeed')){
            var entries = JSON.parse(localStorage.getItem('airduino-newsfeed'));
            var entries = entries.reverse();
			if(entries != []){
				entries.forEach(element=>{
					
                    ts = new Date(element.timestamp_created);
                    ts =  moment(element.timestamp_created).fromNow();
                    
                    if(element.imgUrl){
                        var tpl =  `
							<div class="card">
								<div class="card-img">
									<img src="${element.imgUrl}" width="100%" style="border-radius: 12px 12px 0px 0px;">
								</div>
								<div class="card-content">
									<h5>${element.title}</h5>
									<p style="white-space:pre-wrap;">${element.content}</p><br>
									<p style="font-size:8pt;" class="grey-text">${ts}</p>
								</div>
							</div><br>`;                        
                    } else {
                        var tpl =  `
							<div class="card">
								<div class="card-content">
									<h5>${element.title}</h5>
									<p style="white-space:pre-wrap;">${element.content}</p><br>
									<p style="font-size:8pt;" class="grey-text">${ts}</p>
								</div>
							</div><br>`;
                    }
					$("#newsfeedList").append(tpl);
				});
			} else {
				$("#newsfeedList").html(emptyFeed);
			}
			
		} else {
			$("#newsfeedList").html(emptyFeed);
		}

	};
	
	try {
        
		if(navigator.onLine){
			$.ajax({
				type:"GET",
				url: "https://airduino-ph.000webhostapp.com/api/newsfeed/getAll.php",
				cache: 'false',
				success: result=>{
					localStorage.setItem("airduino-newsfeed", result);
					populate();
				}
			}).fail((error)=>{
				populate();
			});
		} else {
			populate();
		}
	} catch(error) {
		console.log(error);
		populate();
	}
};

var launchAddStation = ()=>{
    showPreloader();

    if(navigator.onLine){

        $("#addStationList").html("");

        $.ajax({
            type:"GET",
            cache:"false",
            url:"https://airduino-ph.000webhostapp.com/api/device/getAll.php",
            success: result=>{
                var result = JSON.parse(result);
                result.forEach(element=>{
                    if(!getSavedDeviceInfo(element.id)){

                        var ls = JSON.stringify(element);
                        
                        var colors = ["red", "blue-grey", "green", "blue", "orange","grey","amber"];
                        var randColor = colors[Math.floor(Math.random()*colors.length)];

                        var tpl = `
							<a href="#!" id="StationAdd${element.id}">
								<div class="card hoverable ${randColor} darken-2 white-text" style="box-shadow: 0 20px 40px rgba(92, 92, 92, 0.3);">
									<div class="card-content">
                                        <h5>${element.location}</h5>
                                        <p>${element.city}</p>
                                    </div>
								</div>
							</a>
                            <script>
                                $("#StationAdd${element.id}").click(()=>{
                                    addSavedStation('${ls}');
                                                                                                         
                                    prepareHome();
                                    showBottombar();
                                    hideWindowedBar();
                                    showNavbar();                                   
                                    showActivity("home");
                                    showToast("Added ${element.location} to saved stations");
                                });
                            </script>
                        `;
                        $("#addStationList").append(tpl);

                    }
                    
                });

                var asl = $("#addStationList").html();
                if(!asl){
                    var tpl = `
                        <center><p>No new Airduino stations available yet.</p></center>
                    `;
                    $("#addStationList").html(tpl);
                }

                clear();
                hideNavbar();
                hideBottombar();
                showWindowedBar();
                showActivity('addstation');
                
            }
        }).fail(()=>{
            showToast("Cannot open stations list");
            hidePreloader();
            showActivity("home");                
        });

    } else {
        showToast("Offline. Cannot open stations list.");
        hidePreloader();
        showActivity("home");
    }
};

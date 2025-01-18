var checkIfsetProxy = function(){
    setTimeout(function(){
        if(sessionStorage.getItem("autobot_setproxy") != 'undefined' && sessionStorage.getItem("autobot_setproxy") != null){
            var proxConfig = JSON.parse(sessionStorage.getItem("autobot_setproxy"))
            sessionStorage.setItem("autobot_setproxy", undefined)
            console.log("communicating with bg.js")
            
            chrome.runtime.sendMessage({ action: "set_proxy",...proxConfig }, (response) => {
                console.log("Response from background:", response);
              });
        }
        if(sessionStorage.getItem("autobot_stopproxy") == 'true'){
            sessionStorage.setItem("autobot_stopproxy", 'false')
            console.log("communicating with bg.js")
            chrome.runtime.sendMessage({ action: "clear_proxy" }, (response) => {
                console.log("Response from background:", response);
              });
        }

        if(sessionStorage.getItem("autobot_proxy_status") == 'true'){
            sessionStorage.setItem("autobot_proxy_status", 'false')
            console.log("communicating with bg.js")
            chrome.runtime.sendMessage({ action: "proxy_status" }, (response) => {
                console.log("Response from background:", response);
              });
        }

        checkIfsetProxy()
    },1000)
}


checkIfsetProxy()
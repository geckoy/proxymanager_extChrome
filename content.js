var checkIfsetProxy = function(){
    setTimeout(function(){
        if(sessionStorage.getItem("autobot_setproxy") != null){
            var proxConfig = JSON.parse(sessionStorage.getItem("autobot_setproxy"))
            sessionStorage.removeItem("autobot_setproxy")
            console.log("communicating with bg.js")
            
            chrome.runtime.sendMessage({ action: "set_proxy",...proxConfig }, (response) => {
                console.log("Response from background:", response);
              });
        }
        if(sessionStorage.getItem("autobot_stopproxy") == 'true'){
            sessionStorage.removeItem("autobot_stopproxy")
            console.log("communicating with bg.js")
            chrome.runtime.sendMessage({ action: "clear_proxy" }, (response) => {
                console.log("Response from background:", response);
              });
        }

        if(sessionStorage.getItem("autobot_proxy_status") == 'true'){
            sessionStorage.removeItem("autobot_proxy_status")
            console.log("communicating with bg.js")
            chrome.runtime.sendMessage({ action: "proxy_status" }, (response) => {
                sessionStorage.setItem("autobot_prox_status", JSON.stringify(response));
              });
        }

        checkIfsetProxy()
    },1000)
}


checkIfsetProxy()
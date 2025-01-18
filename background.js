// background.js
var calls = {};

function setProxyIcon() {

    var icon = {
        path: "images/off.png",
    }

    chrome.proxy.settings.get(
                {'incognito': false},
        function(config) {
            if (config["value"]["mode"] == "system") {
                chrome.action.setIcon(icon);
            } else if (config["value"]["mode"] == "direct") {
                chrome.action.setIcon(icon);
            } else {
                icon["path"] = "images/on.png";
                chrome.action.setIcon(icon);
            }
        }
    );
}

// Function to set proxy configuration
async function setProxy(proxyConfig) {
    const proxyURL = `${proxyConfig.scheme || "http"}://${proxyConfig.username}:${proxyConfig.password}@${proxyConfig.host}:${proxyConfig.port}`;

    chrome.proxy.settings.set(
        {
            value: {
                mode: "fixed_servers",
                rules: {
                    singleProxy: {
                        scheme: proxyConfig.scheme || "http",
                        host: proxyConfig.host,
                        port: parseInt(proxyConfig.port, 10)
                    },
                    bypassList: ["<local>"]
                }
            },
            scope: "regular"
        },
        () => {
            if (chrome.runtime.lastError) {
                console.error("Error setting proxy:", chrome.runtime.lastError.message);
            } else {
                console.log("Proxy settings successfully applied.");
            }
        }
    );

    console.log(`Proxy URL with embedded credentials: ${proxyURL}`);

    chrome.webRequest.onAuthRequired.addListener(
        function(details) {
            var idstr = details.requestId.toString();
            if(details.isProxy === true){
            
                console.log('AUTH - ' + details.requestId);
                //console.log(JSON.stringify(details));
                if(!(idstr in calls)){
                    calls[idstr] = 0;
                }
                calls[idstr] = calls[idstr] + 1;
                var retry = 10;

                if(calls[idstr] >= retry){
                    calls = {};
                    chrome.action.setIcon({
                        path: "images/error.png",
                    })
                    return({
                        cancel : true
                    });
                }

                var login = proxyConfig.username;
                var password = proxyConfig.password;
                
                if (login && password){
                    return({
                        authCredentials : {
                            'username' : login,
                            'password' : password
                        }
                    });
                }
            }
        },
        {urls: ["<all_urls>"]}, 
        ["blocking"]
    );
}
  
function clearProxy() {
    chrome.proxy.settings.set(
        {
            value: { mode: "direct" }, // Reset to direct mode
            scope: "regular"
        },
        () => {
            if (chrome.runtime.lastError) {
                console.error("Error clearing proxy:", chrome.runtime.lastError.message);
            } else {
                console.log("Proxy settings cleared.");
            }
        }
    );

    // Optionally remove the authentication listener
    chrome.webRequest.onAuthRequired.addListener(
        function(details) {
        
            if(details.isProxy === true){
            
                console.log('AUTH - ' + details.requestId);
                //console.log(JSON.stringify(details));
                
                
                
                var login = "user";
                var password = "pass";
                
                if (login && password){
                    return({
                        authCredentials : {
                            'username' : login,
                            'password' : password
                        }
                    });
                }
            }
        },
        {urls: ["<all_urls>"]}, 
        ["blocking"]
    );
}

// sessionStorage.setItem("autobot_setproxy",JSON.stringify({
//     host: "gw.dataimpulse.com",
//     port: "823",
//     username: "46ccb803bc3dfbda6f16__cr.dz",
//     password: "16780e6cd07e7cd8"
// }))

chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed.");
  });
  
  // Listen for messages from other parts of the extension
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received in background:", message);
  
    if(message.action === "set_proxy"){
        chrome.storage.session.set({proxy_status:{ autobot_prox: message, autobot_isset:true }}, () => {
            setProxy(message)
            setProxyIcon()
            sendResponse({ response: "proxy launched successfully!" });
        });    
        return true
    }else if(message.action === "clear_proxy"){
        chrome.storage.session.remove("proxy_status", () => {
            clearProxy()
            setProxyIcon()
            sendResponse({ response: "proxy cleared successfully!" });
        }); 
        return true;
    }else if (message.action === "proxy_status"){
        chrome.storage.session.get("proxy_status").then(function (res) {
            sendResponse(res)
        })
        return true;
    }
  });
  
setProxyIcon();
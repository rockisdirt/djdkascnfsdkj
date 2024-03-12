//https://developer.chrome.com/extensions/api_index
//https://developer.chrome.com/extensions/management
//https://developer.chrome.com/extensions/storage

var extensionsEnabled = false
let selfId = ""
chrome.management.getSelf(function(extension){
    selfId = extension.id
});

function updateVisuals(){
  let iconPath = "images/off.png";
  if (extensionsEnabled){
    iconPath = "images/on.png";
  }
  chrome.browserAction.setIcon({path:iconPath});
}

function setExtensions(enabled){
  //set new state
  extensionsEnabled = enabled
  updateVisuals();
  chrome.storage.sync.set({extensionsEnabled: extensionsEnabled});

  //toggle the extensions
  if (extensionsEnabled == false){
    chrome.management.getAll(function(extensions){
        let disabledIds = [];
        extensions.forEach(ext => {
          if (ext.id != selfId && ext.enabled){
              disabledIds.push(ext.id);
              chrome.management.setEnabled(ext.id,false);
          }
        });
        chrome.storage.sync.set({disabledIds:disabledIds});
    });
  }
  else{
    chrome.storage.sync.get({disabledIds:null},function(data){
      let ids = data.disabledIds;
      if (ids != null){
        ids.forEach(id => {
          chrome.management.setEnabled(id,true);
        });
      }
    });
  }
}

//retrieve toggle status
chrome.storage.sync.get({extensionsEnabled:extensionsEnabled}, function(data) {
  extensionsEnabled = data.extensionsEnabled;
  updateVisuals();
});

//listen for toggle clicks
chrome.browserAction.onClicked.addListener(function(tab) {
  setExtensions(!extensionsEnabled);
});
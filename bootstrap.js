const { classes: Cc, interfaces: Ci, manager: Cm, utils: Cu, results: Cr } = Components;

Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/XPCOMUtils.jsm");

XPCOMUtils.defineLazyModuleGetter(this, "Prompt", "resource://gre/modules/Prompt.jsm");

let debug = Cu.import("resource://gre/modules/AndroidLog.jsm", {}).AndroidLog.d.bind(null, "WhatsThis");

/**
 * Content policy for blocking images
 */

const SEARCH_XHDPI = "data:image/png;base64,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";

/**
 * UI code
 */

function showToast(window, msg) {
  window.NativeWindow.toast.show(msg, "short");
}

var NativeUI = {
  createUI: function createUI(window) {
    let filter = {
      matches: function(element) {
        return window.SelectionHandler.isSelectionActive();
      }
    };

    window.SelectionHandler.addAction({
      id: "whatsthis_search_action",
      label: "What's this?",
      icon: SEARCH_XHDPI,
      order: 6,
      selector: filter,
      action: element => {
        let selectedText = window.SelectionHandler._getSelectedText();
        this.fetch(window, selectedText);
      }
    });
  },

  removeUI: function removeUI(window) {
    window.SelectionHandler.removeAction("whatsthis_search_action");
  },

  fetch: function(window, query) {
    // Query the Wikipedia API for an excerpt
    let apiURL = "https://wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=" + encodeURIComponent(query);
    let xhr = Cc["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Ci.nsIXMLHttpRequest);
    xhr.open("GET", apiURL, true);

    xhr.addEventListener("load", (function() {
      if (xhr.status == 200) {
        debug("XXX: " + xhr.responseText);
        let msg = JSON.parse(xhr.responseText);
        if (Object.keys(msg).length === 0) {
          // no results
          showToast(window, "No results found");
          return;
        }

        // Break out the excerpt from the JSON result
        let pages = msg.query.pages;
        let pageKeys = Object.keys(pages);
        if (pageKeys.length === 0) {
          // no result pages
          showToast(window, "No result pages found");
          return;
        }

        let extract = msg.query.pages[pageKeys[0]].extract;
        let sentences = extract.split("\n");
        if (sentences.length === 0) {
          // no result sentences
          showToast(window, "No result sentences found");
          return;
        }

        // Show the first sentence in a prompt
        new Prompt({
          window: null,
          title: "What's this?",
          message: sentences[0],
          buttons: [
            "Open in Tab",
            "Close"
          ]
        }).show((data) => {
          if (data.button === 0) {
            // Allow users to open the summary into a new tab for full information
            let pageURL = "https://wikipedia.org/wiki/?curid=" + encodeURIComponent(pageKeys[0]);
            window.BrowserApp.addTab(pageURL, { parentId: window.BrowserApp.selectedTab.id, selected: true });
          }
        });

      }
    }).bind(this), false);

    xhr.addEventListener("error", (function() {
      debug("Error fetching");
    }).bind(this), false);

    debug("XXX sending");
    xhr.send(null);
  }
};

function loadIntoWindow(window) {
  if (!window) {
    return;
  }

  // Setup the UI when we get a window
  NativeUI.createUI(window);
}

function unloadFromWindow(window) {
  if (!window) {
    return;
  }

  // Register to remove the UI on shutdown
  NativeUI.removeUI(window);
}

var WindowWatcher = {
  start: function() {
    // Load into any existing windows
    let windows = Services.wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements()) {
      let window = windows.getNext();
      if (window.document.readyState == "complete") {
        loadIntoWindow(window);
      } else {
        this.waitForLoad(window);
      }
    }

    // Load into any new windows
    Services.ww.registerNotification(this);
  },

  stop: function() {
    // Stop listening for new windows
    Services.ww.unregisterNotification(this);

    // Unload from any existing windows
    let windows = Services.wm.getEnumerator("navigator:browser");
    while (windows.hasMoreElements()) {
      let window = windows.getNext();
      unloadFromWindow(window);
    }
  },

  waitForLoad: function(window) {
    window.addEventListener("load", function onLoad() {
      window.removeEventListener("load", onLoad, false);
      let { documentElement } = window.document;
      if (documentElement.getAttribute("windowtype") == "navigator:browser") {
        loadIntoWindow(window);
      }
    }, false);
  },

  observe: function(subject, topic, data) {
    if (topic == "domwindowopened") {
      this.waitForLoad(subject);
    }
  }
};

/**
* Handle the add-on being activated on install/enable
*/
function startup(data, reason) {
  WindowWatcher.start();
}

/**
* Handle the add-on being deactivated on uninstall/disable
*/
function shutdown(data, reason) {
  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (reason == APP_SHUTDOWN) {
    return;
  }

  WindowWatcher.stop();
}

/**
* Handle the add-on being installed
*/
function install(data, reason) {}

/**
* Handle the add-on being uninstalled
*/
function uninstall(data, reason) {}

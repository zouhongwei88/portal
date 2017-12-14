(function () {
	var properties, rootApp, rootWindow, win = window.parent;

	while (win) {
		try {
			if (win.App) {
				rootApp = win.App;
				rootWindow = win;
				break;
			}
			if (win === win.parent) {
				break;
			}
			win = win.parent;
		} catch (e) {

		}
	}

	if (!rootApp) {
		properties = {
			mainView: "./frame/main",
			loginPath: "./login",
			longPollingTimeout: 0,
			longPollingInterval: 2000,
			//"service.messagePull": "./service/message/pull",
			"service.messagePull": "./resources/data/message.json",
			"service.login": "./service/account/login",
			"service.logout": "./service/account/logout",
			//"service.menus": "./service/menus",
			"service.menus": "./widgetMenu.getCurrentChildren?widgetElementId=1",
			//"service.user.detail": "./service/user/detail"
			"service.user.detail": "./resources/data/detail.json"
		};
	}

	var App = window.App = {
		getRootWindow: function () {
			if (rootApp) {
				return rootWindow;
			} else {
				return window;
			}
		},
		goHome: function () {
			cola.widget("mainCard").setCurrentIndex(0);
		},
		open: function (path, config) {
			cola.widget("mainFrame").open(path);
		},
		showWorkspace: function () {

		},
		goLogin: function (callback) {
			if (rootApp) {
				rootApp.goLogin(callback);
				return
			}
			login && login(callback);
		},
		setTitle: function (title) {
			if (rootApp) {
				return rootApp.setTitle(path);
			}
			document.title = title;
		},
		setFavicon: function (path) {
			if (rootApp) {
				rootApp.setFavicon(path, config);
			} else {
				var rels = ["icon", "shortcut icon"];
				for (var i = 0, len = rels.length; i < len; i++) {
					var icon = $("link[rel='" + rels[i] + "']");
					if (icon.length > 0) {
						icon.attr("href", rels[i]);
					} else {
						document.head.appendChild($.xCreate({
							tagName: "link",
							rel: rels[i],
							href: path
						}));
					}
				}
			}
		},
		refreshMessage: function () {
			if (rootApp) {
				rootApp.refreshMessage();
				return
			}
			refreshMessage && refreshMessage();
		},
		prop: function (key, value) {
			if (rootApp) {
				return rootApp.prop.apply(rootApp, arguments);
			}
			else {
				if (arguments.length == 1) {
					if (typeof key == "string") {
						return properties[key];
					}
					else if (key) {
						for (var p in key) {
							if (key.hasOwnProperty(p)) properties[p] = key[p];
						}
					}
				}
				else {
					properties[key] = value;
				}
			}
		}
	};

	cola.defaultAction("setting", function (key) {
		return App.prop(key);
	});

	cola.defaultAction("numberString", function (number) {
		return ["one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen"][number - 1];
	});

	cola.setting({
		routerMode: "state",
		pagingParamStyle: "from"
	});

	$(document).ajaxError(function (event, jqXHR) {
		if (jqXHR.status === 401) {
			App.goLogin();
			return false;
		} else {
			var message = jqXHR.responseJSON;
			if (message) {
				throw new cola.Exception(message);
			}
		}
	});

	var language = $.cookie("_language") || window.navigator.language;

	if (language) {
		if (language.indexOf("zh-") === 0) {
			language = "zh"
		}
		//document.write("<script src=\"resources/cola-ui/i18n/" + language + "/cola.js\"></script>");
		//document.write("<script src=\"resources/i18n/" + language + "/common.js\"></script>");
	}

	
	window.chartColors = [
		"rgba(24, 166, 137, 0.5)",
		"rgba(28, 132, 198, 0.5)",
		"rgba(182, 162, 73, 0.4)",
		"rgba(248, 172, 89, 0.6)",
		"rgba(29, 149, 201, 0.5)"
	]


}).call(this);

/*******************************************************************************************
 *
 *  KrodSpa (Krodzone's Spa Framework) provides a lightweight JavaScript based framework for
 *  creating SPA (Single Page Application) applications.
 *
 *  Copyright (C) 2005  Krodzone Technologies, LLC.
 *
 *  This program is free software: you can redistribute it and/or modify it under the terms
 *  of the GNU General Public License as published by the Free Software Foundation, either
 *  version 3 of the License, or (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
 *  without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *  See the GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License along with this program.
 *  If not, see <http://www.gnu.org/licenses/>.
 *
 *******************************************************************************************/
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var _this = this;
/// <reference path="../jquery/jquery.d.ts" />
var currentApplication;
var pageController;
var currentController;
var container;
var removeEscapeChars = function (text) {
    try {
        return decodeURIComponent(text);
    }
    catch (e) {
        return text;
    }
};
var settingFetcher = function (hash, settings) {
    var setting = undefined;
    if (settings && settings.length > 0) {
        for (var i = 0; i < settings.length; i++) {
            if (settings[i].Hash.toUpperCase() === hash.toUpperCase()) {
                setting = settings[i];
                break;
            }
        }
    }
    return setting;
};
var controllerFetcher = function (name, controllers) {
    var controller = undefined;
    if (controllers && controllers.length > 0) {
        for (var i = 0; i < controllers.length; i++) {
            if (controllers[i].Name.toUpperCase() === name.toUpperCase()) {
                controller = controllers[i];
                break;
            }
        }
    }
    return controller;
};
$(document).ready(function () {
    var containerResults = $("div[view-container]");
    var body = $("body")[0];
    if (KrodSpa.Application.Applications !== undefined && KrodSpa.Application.Applications.length > 0) {
        var html = $("html")[0];
        if (html && html.hasAttribute("application")) {
            var appName = html.getAttribute("application");
            currentApplication = KrodSpa.Application.Get(appName);
            if (currentApplication !== undefined) {
                if (body !== undefined) {
                    if ($(body).attr("controller")) {
                        var href = window.location.href;
                        var pageControllerName = $(body).attr("controller");
                        var parameters = (href.indexOf("?") > -1 ? href.split("?")[1].split("&") : undefined);
                        pageController = controllerFetcher(pageControllerName, currentApplication.Controllers);
                        if (pageController !== undefined) {
                            if (parameters !== undefined) {
                                pageController.Scope["Parameters"] = new Object();
                                for (var i = 0; i < parameters.length; i++) {
                                    var parmKVP = parameters[i].split("=");
                                    if (parmKVP !== undefined && parmKVP.length === 2) {
                                        pageController.Scope["Parameters"][parmKVP[0]] = (parmKVP[1].indexOf("#") > -1 ? parmKVP[1].substring(0, parmKVP[1].indexOf("#")) : parmKVP[1]);
                                    }
                                }
                            }
                            currentApplication.InitializeController(pageController, body);
                        }
                    }
                }
                if (containerResults && containerResults.length > 0) {
                    container = containerResults[0];
                    var hash = window.location.hash;
                    var parameters = (hash.indexOf("?") > -1 ? hash.split("?")[1].split("&") : undefined);
                    var config = undefined;
                    hash = (hash.indexOf("?") > -1 ? hash.split("?")[0] : hash);
                    hash = (hash.lastIndexOf("/") !== hash.indexOf("/") ? hash.substring(0, hash.lastIndexOf("/") + 1) + "{id}" : hash);
                    hash = (hash.lastIndexOf("/") === hash.indexOf("/") && !isNaN(parseInt(hash.substring(2))) ? "#/{id}" : hash);
                    if (hash !== "") {
                        config = settingFetcher(hash.replace("#", ""), currentApplication.Settings);
                        if (config) {
                            currentController = controllerFetcher(config.Controller, currentApplication.Controllers);
                            KrodSpa.Data.WebQuery.load(config.Template).then(function (result) {
                                $(container).html(result);
                                if (currentController) {
                                    if (parameters !== undefined) {
                                        currentController.Scope["Parameters"] = new Object();
                                        for (var i = 0; i < parameters.length; i++) {
                                            var parmKVP = parameters[i].split("=");
                                            if (parmKVP !== undefined && parmKVP.length === 2) {
                                                currentController.Scope["Parameters"][parmKVP[0]] = parmKVP[1];
                                            }
                                        }
                                    }
                                    if (hash.indexOf("{id}") > -1) {
                                        currentController.Scope["ID"] = window.location.hash.substring(window.location.hash.lastIndexOf("/") + 1);
                                    }
                                    currentApplication.InitializeController(currentController, container);
                                }
                            }).catch(function (error) {
                                $(container).html("<h3>Error Loading View</h3>");
                            });
                        }
                        else {
                            config = settingFetcher(currentApplication.DefaultHash, currentApplication.Settings);
                            if (config) {
                                window.location.hash = config.Hash;
                            }
                        }
                    }
                    else {
                        config = settingFetcher(currentApplication.DefaultHash, currentApplication.Settings);
                        if (config) {
                            window.location.hash = config.Hash;
                        }
                    }
                }
            }
        }
    }
});
window.onhashchange = function (ev) {
    if (currentApplication !== undefined && container !== undefined) {
        var hash = window.location.hash.replace("#", "");
        var parameters = (hash.indexOf("?") > -1 ? hash.split("?")[1].split("&") : undefined);
        hash = (hash.indexOf("?") > -1 ? hash.split("?")[0] : hash);
        hash = (hash.lastIndexOf("/") !== hash.indexOf("/") ? hash.substring(0, hash.lastIndexOf("/") + 1) + "{id}" : hash);
        hash = (hash.lastIndexOf("/") === hash.indexOf("/") && !isNaN(parseInt(hash.substring(2))) ? "/{id}" : hash);
        var config = settingFetcher(hash, currentApplication.Settings);
        if (config) {
            if (currentController) {
                currentController.StopIterations();
            }
            currentController = controllerFetcher(config.Controller, currentApplication.Controllers);
            KrodSpa.Data.WebQuery.load(config.Template).then(function (result) {
                $(container).html(result);
                if (currentController) {
                    if (parameters !== undefined) {
                        currentController.Scope["Parameters"] = new Object();
                        for (var i = 0; i < parameters.length; i++) {
                            var parmKVP = parameters[i].split("=");
                            if (parmKVP !== undefined && parmKVP.length === 2) {
                                currentController.Scope["Parameters"][parmKVP[0]] = parmKVP[1];
                            }
                        }
                    }
                    if (hash.indexOf("{id}") > -1) {
                        currentController.Scope["ID"] = window.location.hash.substring(window.location.hash.lastIndexOf("/") + 1);
                    }
                    currentApplication.InitializeController(currentController, container);
                }
            }).catch(function (error) {
                $(container).html("<h3>Error Loading View</h3>");
            });
        }
    }
};
HTMLElement.prototype.enable = function () {
    _this.setAttribute("disabled", "");
};
HTMLElement.prototype.disable = function () {
    _this.setAttribute("disabled", "disabled");
};
Function.prototype.toKeyString = function (obj) {
    if (typeof obj !== "object" && typeof obj !== "function" || obj === null) {
        throw new TypeError("Object.toKeyString called on a non-object");
    }
    var Keys = Object.keys(obj);
    var keyString = "";
    Keys.forEach(function (key) {
        if (typeof obj[key] === "string" || typeof obj[key] === "number" || typeof obj[key] === "boolean") {
            keyString = (keyString === "" ? key + "=" + encodeURI(obj[key]) : keyString + "&" + key + "=" + encodeURI(obj[key]));
        }
        if (typeof obj[key] === "object" && (Object.prototype.toString.call(obj[key]) === "[object String]" || Object.prototype.toString.call(obj[key]) === "[object Number]" || Object.prototype.toString.call(obj[key]) === "[object Boolean]")) {
            keyString = (keyString === "" ? key + "=" + encodeURI(obj[key]) : keyString + "&" + key + "=" + encodeURI(obj[key]));
        }
        if (typeof obj[key] === "object" && Object.prototype.toString.call(obj[key]) === '[object Date]') {
            var month = obj[key].getMonth() + 1, day = obj[key].getDate(), year = obj[key].getFullYear(), hour = (obj[key].getHours() > 12 ? obj[key].getHours() - 12 : (obj[key].getHours() == 0 ? 12 : obj[key].getHours())), minutes = obj[key].getMinutes(), meridian = (obj[key].getHours() >= 12 ? "PM" : "AM");
            var dateString = ('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year) + ' ' + ('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian;
            keyString = (keyString === "" ? key + "=" + dateString : keyString + "&" + key + "=" + dateString);
        }
    });
    return keyString;
};
Function.prototype.toJson = function (obj) {
    if (typeof obj !== "object" && typeof obj !== "function" || obj === null) {
        throw new TypeError("Object.toKeyString called on a non-object");
    }
    var Keys = Object.keys(obj);
    var keyString = '{';
    Keys.forEach(function (key) {
        if (typeof obj[key] === "string" || (typeof obj[key] === "object" && (Object.prototype.toString.call(obj[key]) === "[object String]"))) {
            keyString = (keyString === '{' ? keyString + '"' + key + '":' : keyString + ',"' + key + '":');
            keyString += '"' + obj[key] + '"';
        }
        if (typeof obj[key] === "number" || (typeof obj[key] === "object" && (Object.prototype.toString.call(obj[key]) === "[object Number]"))) {
            keyString = (keyString === '{' ? keyString + '"' + key + '":' : keyString + ',"' + key + '":');
            keyString += obj[key];
        }
        if (typeof obj[key] === "boolean" || (typeof obj[key] === "object" && (Object.prototype.toString.call(obj[key]) === "[object Boolean]"))) {
            keyString = (keyString === '{' ? keyString + '"' + key + '":' : keyString + ',"' + key + '":');
            keyString = (obj[key] === true ? keyString + 'true' : keyString + 'false');
        }
        //string formattedDate = string.Format("{0}-{1}-{2}T{3}:{4}:{5}", year, month, day, hour, minute, second);
        if (typeof obj[key] === "object" && Object.prototype.toString.call(obj[key]) === '[object Date]') {
            var month = obj[key].getMonth() + 1, day = obj[key].getDate(), year = obj[key].getFullYear(), hour = obj[key].getHours(), minutes = obj[key].getMinutes(), seconds = obj[key].getSeconds();
            var dateString = String(year) + '-' + ('0' + month).slice(-2) + '-' + ('0' + day).slice(-2) + 'T' + ('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2);
            keyString = (keyString === '{' ? keyString + '"' + key + '":' : keyString + ',"' + key + '":');
            keyString += '"' + dateString + '"';
        }
        if (typeof obj[key] === "object" && Object.prototype.toString.call(obj[key]) === '[object Object]') {
            keyString = (keyString === '{' ? keyString + '"' + key + '":' : keyString + ',"' + key + '":');
            keyString += Object.toJson(obj[key]);
        }
    });
    keyString += '}';
    return keyString;
};
Function.prototype.hasKey = function (obj, key) {
    var keyFound = false;
    var Keys = Object.keys(obj);
    for (var i = 0; i < Keys.length; i++) {
        var objKey = Keys[i];
        if (objKey === key) {
            keyFound = true;
            break;
        }
    }
    return keyFound;
};
window.location.getParameterByName = function (name) {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if (results == null) {
        return "";
    }
    else {
        return removeEscapeChars(results[1].replace(/\+/g, " "));
    }
};
window.location.getAbsolutePath = function () {
    var protocol = window.location.protocol;
    var host = window.location.host;
    var path = window.location.pathname;
    var pathParts = path.split("/");
    var completePath = protocol + "//" + host;
    for (var i = 0; i < pathParts.length; i++) {
        if (pathParts[i].indexOf(".") === -1) {
            completePath += pathParts[i] + "/";
        }
        else {
            break;
        }
    }
    return completePath;
};
var Promise = (function () {
    function Promise() {
        var that = this;
        that.then = function (resolved) {
            that.onResolved = resolved;
            return that;
        };
        that.catch = function (rejected) {
            that.onRejected = rejected;
            return that;
        };
        that.resolve = function (result) {
            if (that.onResolved) {
                that.onResolved(result);
            }
        };
        that.reject = function (error) {
            if (that.onRejected) {
                that.onRejected(error);
            }
        };
    }
    return Promise;
}());
var KrodSpa;
(function (KrodSpa) {
    //  Used for Validating & Data Binding
    (function (DataTypeArgs) {
        DataTypeArgs[DataTypeArgs["Int"] = 0] = "Int";
        DataTypeArgs[DataTypeArgs["Float"] = 1] = "Float";
        DataTypeArgs[DataTypeArgs["Date"] = 2] = "Date";
        DataTypeArgs[DataTypeArgs["Time"] = 3] = "Time";
        DataTypeArgs[DataTypeArgs["DateTime"] = 4] = "DateTime";
        DataTypeArgs[DataTypeArgs["Boolean"] = 5] = "Boolean";
        DataTypeArgs[DataTypeArgs["String"] = 6] = "String";
    })(KrodSpa.DataTypeArgs || (KrodSpa.DataTypeArgs = {}));
    var DataTypeArgs = KrodSpa.DataTypeArgs;
    //  Provides a Simple Interface for Determining the Numeric Data Type Value
    var DataTypeCollection = (function () {
        function DataTypeCollection() {
            var that = this;
        }
        //  Returns a Default Instance of DataTypeCollection
        DataTypeCollection.Instance = function () {
            var _instance = new DataTypeCollection();
            _instance['INT'] = DataTypeArgs.Int;
            _instance['FLOAT'] = DataTypeArgs.Float;
            _instance['DATE'] = DataTypeArgs.Date;
            _instance['TIME'] = DataTypeArgs.Time;
            _instance['DATETIME'] = DataTypeArgs.DateTime;
            _instance['BOOLEAN'] = DataTypeArgs.Boolean;
            _instance['STRING'] = DataTypeArgs.String;
            return _instance;
        };
        return DataTypeCollection;
    }());
    KrodSpa.DataTypeCollection = DataTypeCollection;
    var Application = (function () {
        function Application(name) {
            var _this = this;
            this.Config = function (settings) {
                if (settings && settings.length) {
                    for (var j = 0; j < settings.length; j++) {
                        (function (appSettings, args) {
                            var index = -1, setting;
                            for (var i = 0; i < appSettings.length; i++) {
                                if (appSettings[i].Hash.toUpperCase() === args.Hash.toUpperCase()) {
                                    index = i;
                                    break;
                                }
                            }
                            if (index === -1) {
                                setting = new ConfigSetting((args.Hash ? args.Hash : ""), (args.Template ? args.Template : ""), (args.Controller ? args.Controller : ""));
                                appSettings.push(setting);
                            }
                            else {
                                appSettings[index].Hash = (args.Hash ? args.Hash : appSettings[index].Hash);
                                appSettings[index].Template = (args.Template ? args.Template : appSettings[index].Template);
                                appSettings[index].Controller = (args.Controller ? args.Controller : appSettings[index].Controller);
                            }
                        })(_this.Settings, settings[j]);
                    }
                }
                return _this;
            };
            this.Default = function (defaultHash) {
                _this.DefaultHash = defaultHash;
                return _this;
            };
            this.Controller = function (name, mod) {
                var index = -1, controller;
                for (var i = 0; i < _this.Controllers.length; i++) {
                    if (_this.Controllers[i].Name.toUpperCase() === name.toUpperCase()) {
                        index = i;
                        break;
                    }
                }
                if (index === -1) {
                    controller = new Controller(name, mod);
                    _this.Controllers.push(controller);
                }
                else {
                    _this.Controllers[index].Name = name;
                    _this.Controllers[index].Module = mod;
                }
                return _this;
            };
            this.InitializeController = function (controller, view) {
                controller.Module(controller.Scope, KrodSpa.Data.WebQuery);
                setTimeout(function () {
                    var variables = view.getElementsByTagName("variable");
                    if (variables !== undefined && variables.length > 0) {
                        for (var i = 0; i < variables.length; i++) {
                            if (variables[i].hasAttribute("model")) {
                                var model = variables[i].getAttribute("model");
                                var objName;
                                if (model.indexOf(".") > -1) {
                                    var parts = model.split(".");
                                    objName = parts[0];
                                }
                                else {
                                    objName = model;
                                }
                                if (controller.Scope[objName]) {
                                    controller.WatchProperty(variables[i], model);
                                }
                            }
                        }
                    }
                    var clickElements = $(view).find("[click]");
                    if (clickElements && clickElements.length > 0) {
                        for (var i = 0; i < clickElements.length; i++) {
                            (function (idx) {
                                var element = clickElements[idx];
                                var method = clickElements[idx].getAttribute("click");
                                method = method.substring(0, method.indexOf("("));
                                if (controller.Scope[method]) {
                                    $(element).on("click", function (e) {
                                        controller.Scope[method](e);
                                    });
                                }
                            })(i);
                        }
                    }
                    var bindingModelElements = $(view).find("[binding]");
                    if (bindingModelElements && bindingModelElements.length > 0) {
                        for (var i = 0; i < bindingModelElements.length; i++) {
                            var bindingElement = bindingModelElements[i];
                            var binding = BoundFieldBase.CreateBoundField(controller.Scope, bindingElement);
                            controller.BoundFields.push(binding);
                        }
                    }
                    controller.SetView(view);
                }, 200);
                return _this;
            };
            var that = this;
            that.Name = name;
            that.DefaultHash = "";
            that.Controllers = new Array();
            that.Settings = new Array();
        }
        Application.Create = function (name) {
            var app;
            if (!Application.Applications) {
                Application.Applications = new Array();
            }
            for (var i = 0; i < Application.Applications.length; i++) {
                if (Application.Applications[i].Name.toUpperCase() === name.toUpperCase()) {
                    app = Application.Applications[i];
                    break;
                }
            }
            if (app === undefined) {
                app = new Application(name);
                Application.Applications.push(app);
            }
            return app;
        };
        Application.Get = function (name) {
            var app = undefined;
            if (Application.Applications) {
                for (var i = 0; i < Application.Applications.length; i++) {
                    if (Application.Applications[i].Name.toUpperCase() === name.toUpperCase()) {
                        app = Application.Applications[i];
                        break;
                    }
                }
            }
            return app;
        };
        return Application;
    }());
    KrodSpa.Application = Application;
    var ConfigSetting = (function () {
        function ConfigSetting(hash, template, controller) {
            var that = this;
            that.Hash = hash;
            that.Template = template;
            that.Controller = controller;
        }
        return ConfigSetting;
    }());
    KrodSpa.ConfigSetting = ConfigSetting;
    var Controller = (function () {
        function Controller(name, mod) {
            var _this = this;
            this.GetDynamicValue = function (model, defaultValue) {
                if (model) {
                    return model;
                }
                else {
                    return defaultValue;
                }
            };
            this.GetObject = function (model) {
                var obj;
                if (model.indexOf(".") > -1) {
                    var parts = model.split(".");
                    switch (parts.length) {
                        case 2:
                            if (!_this.Scope[parts[0]]) {
                                _this.Scope[parts[0]] = new Object();
                            }
                            obj = _this.Scope[parts[0]];
                            break;
                        case 3:
                            if (!_this.Scope[parts[0]]) {
                                _this.Scope[parts[0]] = new Object();
                            }
                            if (!_this.Scope[parts[0]][parts[1]]) {
                                _this.Scope[parts[0]][parts[1]] = new Object();
                            }
                            obj = _this.Scope[parts[0]][parts[1]];
                            break;
                        case 4:
                            if (!_this.Scope[parts[0]]) {
                                _this.Scope[parts[0]] = new Object();
                            }
                            if (!_this.Scope[parts[0]][parts[1]]) {
                                _this.Scope[parts[0]][parts[1]] = new Object();
                            }
                            if (!_this.Scope[parts[0]][parts[1]][parts[2]]) {
                                _this.Scope[parts[0]][parts[1]][parts[2]] = new Object();
                            }
                            obj = _this.Scope[parts[0]][parts[1]][parts[2]];
                            break;
                        case 5:
                            if (!_this.Scope[parts[0]]) {
                                _this.Scope[parts[0]] = new Object();
                            }
                            if (!_this.Scope[parts[0]][parts[1]]) {
                                _this.Scope[parts[0]][parts[1]] = new Object();
                            }
                            if (!_this.Scope[parts[0]][parts[1]][parts[2]]) {
                                _this.Scope[parts[0]][parts[1]][parts[2]] = new Object();
                            }
                            if (!_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]) {
                                _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = new Object();
                            }
                            obj = _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]];
                            break;
                    }
                }
                else {
                    obj = _this.Scope;
                }
                return obj;
            };
            this.GetModelValue = function (model) {
                var value;
                if (model.indexOf(".") > -1) {
                    var parts = model.split(".");
                    switch (parts.length) {
                        case 2:
                            _this.Scope[parts[0]] = _this.EnsureObjectExists(_this.Scope[parts[0]]);
                            _this.Scope[parts[0]][parts[1]] = (_this.Scope[parts[0]][parts[1]] ? _this.Scope[parts[0]][parts[1]] : "");
                            value = _this.Scope[parts[0]][parts[1]];
                            break;
                        case 3:
                            _this.Scope[parts[0]] = _this.EnsureObjectExists(_this.Scope[parts[0]]);
                            _this.Scope[parts[0]][parts[1]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]] = (_this.Scope[parts[0]][parts[1]][parts[2]] ? _this.Scope[parts[0]][parts[1]][parts[2]] : "");
                            value = _this.Scope[parts[0]][parts[1]][parts[2]];
                            break;
                        case 4:
                            _this.Scope[parts[0]] = _this.EnsureObjectExists(_this.Scope[parts[0]]);
                            _this.Scope[parts[0]][parts[1]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = (_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] ? _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] : "");
                            value = _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]];
                            break;
                        case 5:
                            _this.Scope[parts[0]] = _this.EnsureObjectExists(_this.Scope[parts[0]]);
                            _this.Scope[parts[0]][parts[1]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = (_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] ? _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] : "");
                            value = _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]];
                            break;
                        case 6:
                            _this.Scope[parts[0]] = _this.EnsureObjectExists(_this.Scope[parts[0]]);
                            _this.Scope[parts[0]][parts[1]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = (_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] ? _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] : "");
                            value = _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]];
                            break;
                        case 7:
                            _this.Scope[parts[0]] = _this.EnsureObjectExists(_this.Scope[parts[0]]);
                            _this.Scope[parts[0]][parts[1]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = (_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] ? _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] : "");
                            value = _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]];
                            break;
                        case 8:
                            _this.Scope[parts[0]] = _this.EnsureObjectExists(_this.Scope[parts[0]]);
                            _this.Scope[parts[0]][parts[1]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] = (_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] ? _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] : "");
                            value = _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]];
                            break;
                        case 9:
                            _this.Scope[parts[0]] = _this.EnsureObjectExists(_this.Scope[parts[0]]);
                            _this.Scope[parts[0]][parts[1]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]] = (_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]] ? _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]] : "");
                            value = _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]];
                            break;
                        case 10:
                            _this.Scope[parts[0]] = _this.EnsureObjectExists(_this.Scope[parts[0]]);
                            _this.Scope[parts[0]][parts[1]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]][parts[9]] = (_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]][parts[9]] ? _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]][parts[9]] : "");
                            value = _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]][parts[9]];
                            break;
                        default:
                    }
                }
                else {
                    _this.Scope[model] = (_this.Scope[model] ? _this.Scope[model] : "");
                    value = _this.Scope[model];
                }
                return value;
            };
            this.SetModelValue = function (model, value) {
                if (model.indexOf(".") > -1) {
                    var parts = model.split(".");
                    switch (parts.length) {
                        case 2:
                            _this.Scope[parts[0]] = _this.EnsureObjectExists(_this.Scope[parts[0]]);
                            _this.Scope[parts[0]][parts[1]] = value;
                            break;
                        case 3:
                            _this.Scope[parts[0]] = _this.EnsureObjectExists(_this.Scope[parts[0]]);
                            _this.Scope[parts[0]][parts[1]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]] = value;
                            break;
                        case 4:
                            _this.Scope[parts[0]] = _this.EnsureObjectExists(_this.Scope[parts[0]]);
                            _this.Scope[parts[0]][parts[1]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = value;
                            break;
                        case 5:
                            _this.Scope[parts[0]] = _this.EnsureObjectExists(_this.Scope[parts[0]]);
                            _this.Scope[parts[0]][parts[1]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = value;
                            break;
                        case 6:
                            _this.Scope[parts[0]] = _this.EnsureObjectExists(_this.Scope[parts[0]]);
                            _this.Scope[parts[0]][parts[1]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = value;
                            break;
                        case 7:
                            _this.Scope[parts[0]] = _this.EnsureObjectExists(_this.Scope[parts[0]]);
                            _this.Scope[parts[0]][parts[1]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = value;
                            break;
                        case 8:
                            _this.Scope[parts[0]] = _this.EnsureObjectExists(_this.Scope[parts[0]]);
                            _this.Scope[parts[0]][parts[1]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] = value;
                            break;
                        case 9:
                            _this.Scope[parts[0]] = _this.EnsureObjectExists(_this.Scope[parts[0]]);
                            _this.Scope[parts[0]][parts[1]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]] = value;
                            break;
                        case 10:
                            _this.Scope[parts[0]] = _this.EnsureObjectExists(_this.Scope[parts[0]]);
                            _this.Scope[parts[0]][parts[1]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]] = _this.EnsureObjectExists(_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]]);
                            _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]][parts[9]] = value;
                            break;
                        default:
                    }
                }
                else {
                    _this.Scope[model] = (_this.Scope[model] ? _this.Scope[model] : "");
                    value = _this.Scope[model];
                }
                return value;
            };
            this.EnsureObjectExists = function (obj) {
                if (obj) {
                    return obj;
                }
                else {
                    return new Object();
                }
            };
            var that = this;
            that.Name = name;
            that.Module = mod;
            that.Dependencies = new Array();
            that.BoundFields = new Array();
            that.Scope = new Object();
            that.Iterations = new IterationCollection();
            that.StopIterations = function () {
                if (that.Iterations !== undefined) {
                    that.Iterations.StopAll();
                }
            };
            that.SetView = function (view) {
                that.View = view;
                var iters = $(that.View).find("[iteration]");
                if (iters !== undefined && iters !== null && iters.length !== undefined) {
                    for (var i = 0; i < iters.length; i++) {
                        var iteration;
                        try {
                            iteration = new Iteration(that.View, iters[i], that.Scope);
                        }
                        catch (er) {
                            iteration = undefined;
                        }
                        that.Iterations.Add(iteration);
                    }
                    that.Iterations.RenderAll();
                }
            };
            that.WatchProperty = function (element, property) {
                setInterval(function (el, prop) {
                    var value = el.innerHTML;
                    var obj = that.GetObject(prop);
                    if (obj) {
                        if (prop.indexOf(".") > -1) {
                            var parts = prop.split(".");
                            switch (parts.length) {
                                case 2:
                                    value = that.GetDynamicValue(obj[parts[1]], el.innerHTML);
                                    break;
                                case 3:
                                    value = that.GetDynamicValue(obj[parts[2]], el.innerHTML);
                                    break;
                                case 4:
                                    value = that.GetDynamicValue(obj[parts[3]], el.innerHTML);
                                    break;
                                case 5:
                                    value = that.GetDynamicValue(obj[parts[4]], el.innerHTML);
                                    break;
                            }
                        }
                        else {
                            value = that.GetDynamicValue(that.Scope[prop], el.innerHTML);
                        }
                    }
                    el.innerHTML = removeEscapeChars(value);
                }, 200, element, property);
            };
            that.Scope["ShowModal"] = function (view, modalArgs) {
                var boundFields = new Array();
                var variables = view.getElementsByTagName("variable");
                if (variables !== undefined && variables.length > 0) {
                    for (var i = 0; i < variables.length; i++) {
                        if (variables[i].hasAttribute("model")) {
                            var model = variables[i].getAttribute("model");
                            var objName;
                            if (model.indexOf(".") > -1) {
                                var parts = model.split(".");
                                objName = parts[0];
                            }
                            else {
                                objName = model;
                            }
                            if (that.Scope[objName]) {
                                that.WatchProperty(variables[i], model);
                            }
                        }
                    }
                }
                var clickElements = $(view).find("[click]");
                if (clickElements && clickElements.length > 0) {
                    for (var i = 0; i < clickElements.length; i++) {
                        (function (idx) {
                            var element = clickElements[idx];
                            var method = clickElements[idx].getAttribute("click");
                            method = method.substring(0, method.indexOf("("));
                            if (that.Scope[method]) {
                                $(element).on("click", function (e) {
                                    that.Scope[method](e);
                                });
                            }
                        })(i);
                    }
                }
                KrodSpa.Views.ModalWindow.showDialog(view, new KrodSpa.Views.ModalWindowArgs(that.Scope, modalArgs.ModalWidth, modalArgs.ModalCaption, modalArgs.FooterText, modalArgs.ExecutionHtml, modalArgs.CancelHtml, modalArgs.ShowExecuteButton, modalArgs.ShowCancelButton, function (callback) {
                    var executionCallback;
                    executionCallback = function (success, message) {
                        callback(success, message);
                    };
                    modalArgs.ExecuteButtonCallback(executionCallback);
                    that.Iterations.Refresh();
                }, modalArgs.CancelButtonCallback));
                setTimeout(function () {
                    var bindingModelElements = $(view).find("[binding]");
                    if (bindingModelElements && bindingModelElements.length > 0) {
                        for (var i = 0; i < bindingModelElements.length; i++) {
                            var bindingElement = bindingModelElements[i];
                            var binding = BoundFieldBase.CreateBoundField(that.Scope, bindingElement);
                            boundFields.push(binding);
                        }
                    }
                    var dialogIterations = new IterationCollection();
                    var dialogIters = $(view).find("[iteration]");
                    if (dialogIters !== undefined && dialogIters !== null && dialogIters.length !== undefined) {
                        for (var i = 0; i < dialogIters.length; i++) {
                            var iteration;
                            try {
                                iteration = new Iteration(view, dialogIters[i], that.Scope);
                            }
                            catch (er) {
                                iteration = undefined;
                            }
                            dialogIterations.Add(iteration);
                        }
                        dialogIterations.RenderAll();
                    }
                }, 200);
            };
            that.Scope["ShowMessageBox"] = function (messageHtml, messageTitle, msgboxType, msgboxButtons, resultCallback) {
                KrodSpa.Views.MessageBox.showDialog(messageHtml, messageTitle, msgboxType, msgboxButtons, new KrodSpa.Views.MessageBoxWindowArgs(that.Scope, "modal-400", messageTitle, msgboxButtons, resultCallback));
            };
            if (mod.arguments) {
                if (mod.arguments.length) {
                    for (var i = 0; i < mod.arguments.length; i++) {
                        that.Dependencies.push(mod.arguments[i]);
                    }
                }
                else {
                    that.Dependencies.push(mod.arguments);
                }
            }
        }
        return Controller;
    }());
    KrodSpa.Controller = Controller;
    var Iteration = (function () {
        function Iteration(view, element, scope) {
            var _this = this;
            this.ShowFilterText = "Show Filter";
            this.HideFilterText = "Hide Filter";
            this.TotalItems = -1;
            this.IntervalID = -1;
            var that = this, FilterObj = new KrodSpa.Data.FilterObjectCollection(), Filters = new Array();
            var getModel = function (modelName) {
                var obj;
                if (that.Scope !== undefined) {
                    if (modelName.indexOf(".") > -1) {
                        var parts = modelName.split(".");
                        for (var i = 0; i < parts.length; i++) {
                            obj = obj === undefined ? that.Scope[parts[i]] : obj[parts[i]];
                        }
                    }
                    else {
                        obj = that.Scope[modelName];
                    }
                }
                return obj;
            };
            var createNavigationButton = function (html, clickHandler) {
                var button = document.createElement("button");
                $(button).addClass("btn");
                $(button).addClass("btn-xs");
                $(button).addClass("btn-default");
                $(button).css({
                    "width": "23px",
                    "height": "23px",
                    "float": "left",
                    "margin": "1.5px"
                });
                $(button).html(html);
                button.onclick = clickHandler;
                return button;
            };
            var displayItems = function (items, template) {
                var totalProcessed = 0;
                var rgx = /\{\{\w{1,}\}\}/gm;
                var html = "";
                var promise = new Promise();
                promise.then(function (result) {
                    $(that.Element).html(result !== "" ? result : that.NoItemTemplate);
                    var clickControls = $(that.Element).find("[click]");
                    if (that.Scope !== undefined && clickControls !== undefined && clickControls !== null && clickControls.length !== undefined) {
                        $(clickControls).each(function () {
                            var paramList = $(this).attr("click").split("(");
                            var clickCallback = paramList && paramList.length && paramList.length === 2 ? paramList[0] : undefined;
                            var index = !isNaN(parseInt($(this).attr("index"))) ? parseInt($(this).attr("index")) : -1;
                            var params = paramList && paramList.length && paramList.length === 2 ? new Object() : undefined;
                            if (!clickCallback)
                                return;
                            if (params) {
                                var paramItemList = paramList[1].replace(")", "").split(",");
                                if (paramItemList && paramItemList.length) {
                                    for (var pilIdx = 0; pilIdx < paramItemList.length; pilIdx++) {
                                        if (paramItemList[pilIdx].trim().indexOf("$item.") > -1) {
                                            var fieldName = paramItemList[pilIdx].trim().replace("$item.", "");
                                            if (fieldName !== "" && that.FilteredItems[index][fieldName]) {
                                                params[fieldName] = that.FilteredItems[index][fieldName];
                                            }
                                        }
                                    }
                                }
                            }
                            $(this).on("click", function (ev) {
                                that.Scope[clickCallback](that.FilteredItems[index], params);
                            });
                        });
                    }
                });
                if (items !== undefined && items !== null && items.length !== undefined && promise !== undefined && promise !== null && template.trim() !== "") {
                    for (var m = 0; m < items.length; m++) {
                        (function (idx) {
                            var modelHtml = template.replace('hidden="hidden"', "");
                            var attributes = modelHtml.match(rgx);
                            attributes.forEach(function (attr) {
                                var attrName = attr.replace("{{", "").replace("}}", "").trim();
                                var attrValue = items[idx][attrName] !== undefined ? removeEscapeChars(items[idx][attrName]) : "";
                                var attrRgx = new RegExp("\{\{" + attrName + "\}\}", "gm");
                                modelHtml = modelHtml.replace(attrRgx, attrValue);
                            });
                            var div = document.createElement("div");
                            $(div).html(modelHtml);
                            var clickControls = $(div).find("[click]");
                            if (clickControls !== undefined && clickControls !== null && clickControls.length !== undefined) {
                                $(clickControls).each(function () {
                                    $(this).attr("index", idx);
                                });
                                modelHtml = $(div).html();
                            }
                            html += modelHtml;
                            totalProcessed++;
                            if (totalProcessed === items.length) {
                                promise.resolve(html);
                            }
                        })(m);
                    }
                }
            };
            that.StartWatch = function () {
                if (that.Element !== undefined && that.Model !== undefined && that.Model !== null) {
                    if (that.PaginationCtl !== undefined && that.PageTotal > 0) {
                        var container = document.createElement("div");
                        var pageNo = document.createElement("div");
                        var first = createNavigationButton('<i class="fa fa-angle-double-left" aria-hidden="true"></i>', function (ev) {
                            if (that.FilteredItems) {
                                that.PageIndex = 0;
                                var startIndex = that.PageIndex * that.PageTotal;
                                var endIndex = (startIndex + that.PageTotal) > that.FilteredItems.length ? that.FilteredItems.length : (startIndex + that.PageTotal);
                                displayItems(that.FilteredItems.slice(startIndex, endIndex), that.ModelTemplate);
                                $(that.PaginationCtl).find('[pagination-display="true"]').html("Page " + (that.PageIndex + 1) + " of " + that.TotalPages);
                            }
                        });
                        var previous = createNavigationButton('<i class="fa fa-angle-left" aria-hidden="true"></i>', function (ev) {
                            if (that.FilteredItems) {
                                that.PageIndex = (that.PageIndex - 1) < 0 ? 0 : that.PageIndex - 1;
                                var startIndex = that.PageIndex * that.PageTotal;
                                var endIndex = (startIndex + that.PageTotal) > that.FilteredItems.length ? that.FilteredItems.length : (startIndex + that.PageTotal);
                                displayItems(that.FilteredItems.slice(startIndex, endIndex), that.ModelTemplate);
                                $(that.PaginationCtl).find('[pagination-display="true"]').html("Page " + (that.PageIndex + 1) + " of " + that.TotalPages);
                            }
                        });
                        var next = createNavigationButton('<i class="fa fa-angle-right" aria-hidden="true"></i>', function (ev) {
                            if (that.FilteredItems) {
                                that.PageIndex = (that.PageIndex + 2) > that.TotalPages ? that.TotalPages - 1 : that.PageIndex + 1;
                                var startIndex = that.PageIndex * that.PageTotal;
                                var endIndex = (startIndex + that.PageTotal) > that.FilteredItems.length ? that.FilteredItems.length : (startIndex + that.PageTotal);
                                displayItems(that.FilteredItems.slice(startIndex, endIndex), that.ModelTemplate);
                                $(that.PaginationCtl).find('[pagination-display="true"]').html("Page " + (that.PageIndex + 1) + " of " + that.TotalPages);
                            }
                        });
                        var last = createNavigationButton('<i class="fa fa-angle-double-right" aria-hidden="true"></i>', function (ev) {
                            if (that.FilteredItems) {
                                that.PageIndex = that.TotalPages - 1;
                                var startIndex = that.PageIndex * that.PageTotal;
                                var endIndex = (startIndex + that.PageTotal) > that.FilteredItems.length ? that.FilteredItems.length : (startIndex + that.PageTotal);
                                displayItems(that.FilteredItems.slice(startIndex, endIndex), that.ModelTemplate);
                                $(that.PaginationCtl).find('[pagination-display="true"]').html("Page " + (that.PageIndex + 1) + " of " + that.TotalPages);
                            }
                        });
                        $(pageNo).css({
                            "font-family": "'Lucida Sans Unicode', Arial, Helvetica, sans-serif",
                            "color": "#333",
                            "-webkit-border-radius": "3px",
                            "-moz-border-radius": "3px",
                            "-ms-border-radius": "3px",
                            "border-radius": "3px",
                            "border": "1px solid #666",
                            "float": "left",
                            "margin": "1.5px",
                            "font-size": "0.85em",
                            "text-align": "center",
                            "min-width": "150px",
                            "height": "23px",
                            "padding-top": "2px",
                            "font-weight": "bold"
                        });
                        $(pageNo).attr("pagination-display", "true");
                        $(container).css({
                            "display": "inline-table",
                            "height": "35px"
                        });
                        $(container).append(first);
                        $(container).append(previous);
                        $(container).append(pageNo);
                        $(container).append(next);
                        $(container).append(last);
                        $(_this.PaginationCtl).empty();
                        $(_this.PaginationCtl).append(container);
                    }
                    that.IntervalID = setInterval(function (iter) {
                        if (iter.FilteredItems !== undefined && iter.FilteredItems !== null && iter.FilteredItems.length !== undefined && iter.FilteredItems.length > 0) {
                            if (iter.FilteredItems.length !== iter.TotalItems) {
                                iter.TotalItems = iter.FilteredItems.length;
                                var rgx = /\{\{\w{1,}\}\}/gm;
                                if (iter.PaginationCtl !== undefined && iter.PageTotal > 0) {
                                    iter.TotalPages = iter.PageTotal > 0 && iter.FilteredItems !== undefined && iter.FilteredItems !== null && iter.FilteredItems.length !== undefined ? Math.ceil(iter.FilteredItems.length / iter.PageTotal) : 1;
                                    iter.PageIndex = (iter.PageIndex + 1) > iter.TotalPages ? iter.TotalPages - 1 : iter.PageIndex;
                                    var startIndex = iter.PageIndex * iter.PageTotal;
                                    var endIndex = (startIndex + iter.PageTotal) > iter.FilteredItems.length ? iter.FilteredItems.length : (startIndex + iter.PageTotal);
                                    displayItems(iter.FilteredItems.slice(startIndex, endIndex), iter.ModelTemplate);
                                    $(that.PaginationCtl).find('[pagination-display="true"]').html("Page " + (that.PageIndex + 1) + " of " + that.TotalPages);
                                }
                                else {
                                    displayItems(iter.FilteredItems, iter.ModelTemplate);
                                }
                            }
                        }
                        else {
                            iter.TotalItems = 0;
                            if (iter.NoItemTemplate !== undefined) {
                                $(iter.Element).html(iter.NoItemTemplate.replace('hidden="hidden"', ""));
                            }
                            else {
                                $(iter.Element).html("<h4>No Data</h4>");
                            }
                        }
                    }, 500, _this);
                }
            };
            that.EndWatch = function () {
                clearInterval(that.IntervalID);
            };
            that.Refresh = function () {
                if (that.Model && FilterObj) {
                    that.FilteredItems = that.Model.filter(FilterObj.MeetsCriteria);
                    if (that.FilteredItems) {
                        that.TotalItems = (that.FilteredItems !== undefined ? that.FilteredItems.length : 0);
                        that.TotalPages = Math.ceil((that.FilteredItems !== undefined ? that.FilteredItems.length : 0) / (that.PageTotal ? (that.PageTotal > 0 ? that.PageTotal : 5) : 5));
                        that.PageIndex = that.PageIndex > that.TotalPages ? 0 : that.PageIndex;
                        var startIndex = that.PageIndex * that.PageTotal;
                        var endIndex = (startIndex + that.PageTotal) > that.FilteredItems.length ? that.FilteredItems.length : (startIndex + that.PageTotal);
                        displayItems(that.FilteredItems.slice(startIndex, endIndex), that.ModelTemplate);
                        if (that.PaginationCtl) {
                            $(that.PaginationCtl).find('[pagination-display="true"]').html("Page " + (that.PageIndex + 1) + " of " + that.TotalPages);
                        }
                    }
                }
            };
            that.Element = element;
            that.Scope = scope;
            that.ModelTemplate = that.Element && $(that.Element).find('[template-type="data"]') && $(that.Element).find('[template-type="data"]').length > 0 ? $(that.Element).find('[template-type="data"]')[0].outerHTML : undefined;
            that.LoadingTemplate = that.Element && $(that.Element).find('[template-type="dataloading"]') && $(that.Element).find('[template-type="dataloading"]').length > 0 ? $(that.Element).find('[template-type="dataloading"]')[0].outerHTML : '<i class="fa fa-refresh fa-spin fa-fw"></i><span class="sr-only">Loading Data...</span>';
            that.NoItemTemplate = that.Element && $(that.Element).find('[template-type="nodata"]') && $(that.Element).find('[template-type="nodata"]').length > 0 ? $(that.Element).find('[template-type="nodata"]')[0].outerHTML : undefined;
            that.PageIndex = 0;
            if (that.Element) {
                var iterationValue = $(that.Element).attr("iteration");
                var toggleValue = $(that.Element).attr("filter-toggle");
                if (iterationValue) {
                    var iterationParts = iterationValue.split(";");
                    for (var i = 0; i < iterationParts.length; i++) {
                        var parts = iterationParts[i].trim().split(":");
                        if (parts && parts.length && parts.length === 2) {
                            switch (parts[0].trim().toUpperCase()) {
                                case "MODEL":
                                    that.Model = getModel(parts[1].trim());
                                    that.FilteredItems = that.Model && that.Model.length ? that.Model.slice(0, that.Model.length) : undefined;
                                    that.TotalPages = that.PageTotal > 0 && that.FilteredItems !== undefined && that.FilteredItems !== null && that.FilteredItems.length !== undefined ? Math.ceil(that.FilteredItems.length / that.PageTotal) : 1;
                                    if (!that.Model && !that.FilteredItems)
                                        return;
                                    break;
                                case "PAGINATIONID":
                                    that.PaginationCtl = $(view).find("#" + parts[1].trim()) !== undefined && $(view).find("#" + parts[1].trim()).length > 0 ? $(view).find("#" + parts[1].trim())[0] : undefined;
                                    break;
                                case "PAGETOTAL":
                                    that.PageTotal = !isNaN(parseInt(parts[1].trim())) ? parseInt(parts[1].trim()) : -1;
                                    that.TotalPages = that.PageTotal > 0 && that.FilteredItems !== undefined && that.FilteredItems !== null && that.FilteredItems.length !== undefined ? Math.ceil(that.FilteredItems.length / that.PageTotal) : 1;
                                    break;
                                case "FILTER":
                                    var filterParts = parts[1].trim().split(",");
                                    if (filterParts && filterParts.length) {
                                        filterParts.forEach(function (fp) {
                                            var fParts = fp.trim().split("=");
                                            if (fParts && fParts.length && fParts.length === 2) {
                                                var ctl = $(view).find("#" + fParts[1].trim()) !== undefined && $(view).find("#" + fParts[1].trim()).length > 0 ? $(view).find("#" + fParts[1].trim())[0] : undefined;
                                                Filters.push(new FilterAttribute(fParts[0].trim(), ctl));
                                            }
                                        });
                                    }
                                    break;
                            }
                        }
                    }
                }
                if (toggleValue) {
                    var toggleParts = toggleValue.split(";");
                    for (var i = 0; i < toggleParts.length; i++) {
                        var parts = toggleParts[i].trim().split(":");
                        if (parts && parts.length && parts.length === 2) {
                            switch (parts[0].trim().toUpperCase()) {
                                case "TOGGLEID":
                                    that.FilterToggle = $(view).find("#" + parts[1].trim()) !== undefined && $(view).find("#" + parts[1].trim()).length > 0 ? $(view).find("#" + parts[1].trim())[0] : undefined;
                                    break;
                                case "CONTAINERID":
                                    that.FilterContainer = $(view).find("#" + parts[1].trim()) !== undefined && $(view).find("#" + parts[1].trim()).length > 0 ? $(view).find("#" + parts[1].trim())[0] : undefined;
                                    break;
                                case "SHOWTEXT":
                                    that.ShowFilterText = parts[1].trim();
                                    break;
                                case "HIDETEXT":
                                    that.HideFilterText = parts[1].trim();
                                    break;
                            }
                        }
                    }
                }
                $(that.Element).empty();
                $(that.Element).html(that.LoadingTemplate);
            }
            if (that.FilterToggle && that.FilterContainer) {
                $(that.FilterToggle).html(that.ShowFilterText);
                $(that.FilterContainer).hide();
                $(that.FilterToggle).on("click", function (ev) {
                    $(that.FilterContainer).toggle();
                    if ($(that.FilterContainer).is(':visible')) {
                        $(that.FilterToggle).html(that.HideFilterText);
                    }
                    else {
                        $(that.FilterToggle).html(that.ShowFilterText);
                    }
                });
            }
            Filters.forEach(function (filter) {
                var inputControl = filter.Control instanceof HTMLInputElement ? filter.Control : undefined;
                if (inputControl !== undefined && inputControl.tagName.toUpperCase() === "INPUT" && inputControl.type.toUpperCase() !== "CHECKBOX") {
                    $(filter.Control).on("keyup", function (ev) {
                        FilterObj.Add(filter.Attribute, $(this).val(), 5);
                        that.FilteredItems = that.Model.filter(FilterObj.MeetsCriteria);
                        if (that.FilteredItems) {
                            that.PageIndex = 0;
                            that.TotalItems = (that.FilteredItems !== undefined ? that.FilteredItems.length : 0);
                            that.TotalPages = Math.ceil((that.FilteredItems !== undefined ? that.FilteredItems.length : 0) / (that.PageTotal ? (that.PageTotal > 0 ? that.PageTotal : 5) : 5));
                            var startIndex = that.PageIndex * that.PageTotal;
                            var endIndex = (startIndex + that.PageTotal) > that.FilteredItems.length ? that.FilteredItems.length : (startIndex + that.PageTotal);
                            displayItems(that.FilteredItems.slice(startIndex, endIndex), that.ModelTemplate);
                            if (that.PaginationCtl) {
                                $(that.PaginationCtl).find('[pagination-display="true"]').html("Page " + (that.PageIndex + 1) + " of " + that.TotalPages);
                            }
                        }
                    });
                }
            });
            var modelTotal = that.Model && that.Model.length ? that.Model.length : 0;
            setInterval(function () {
                if (that.Model && that.Model.length) {
                    if (that.Model.length !== modelTotal) {
                        modelTotal = that.Model.length;
                        that.FilteredItems = that.Model.filter(FilterObj.MeetsCriteria);
                    }
                }
                else {
                    that.Model = [];
                    that.FilteredItems = [];
                }
            }, 100);
        }
        return Iteration;
    }());
    KrodSpa.Iteration = Iteration;
    var IterationCollection = (function () {
        function IterationCollection() {
            var that = this;
            that.Iterations = new Array();
            that.Add = function (iteration) {
                if (iteration !== undefined) {
                    iteration.StartWatch();
                    that.Iterations.push(iteration);
                }
            };
            that.Refresh = function () {
                that.Iterations.forEach(function (iteration) {
                    iteration.Refresh();
                });
            };
            that.RenderAll = function () {
                that.Iterations.forEach(function (iteration) {
                    iteration.StartWatch();
                });
            };
            that.StopAll = function () {
                that.Iterations.forEach(function (iteration) {
                    iteration.EndWatch();
                });
            };
        }
        return IterationCollection;
    }());
    KrodSpa.IterationCollection = IterationCollection;
    var FilterAttribute = (function () {
        function FilterAttribute(attribute, control) {
            var that = this;
            that.Attribute = attribute;
            that.Control = control;
        }
        return FilterAttribute;
    }());
    var BindingModel = (function () {
        function BindingModel() {
        }
        return BindingModel;
    }());
    KrodSpa.BindingModel = BindingModel;
    //  Represents the Base Class of All Form Fields
    var BoundFieldBase = (function () {
        function BoundFieldBase(scope, field) {
            var _this = this;
            //  Ensures the Model Exists and Sets the Default Value if Needed
            this.SetDefaultValue = function (model, defaultValue, dataType) {
                if (model.indexOf(".") > -1) {
                    var parts = model.split(".");
                    switch (parts.length) {
                        case 2:
                            if (!_this.Scope[parts[0]]) {
                                _this.Scope[parts[0]] = new Object();
                            }
                            _this.Model = _this.Scope[parts[0]];
                            _this.PropertyName = parts[1];
                            if (!_this.Model[_this.PropertyName]) {
                                _this.Model[_this.PropertyName] = _this.Cast(defaultValue, dataType, _this.Model[_this.PropertyName]);
                            }
                            break;
                        case 3:
                            if (!_this.Scope[parts[0]]) {
                                _this.Scope[parts[0]] = new Object();
                            }
                            if (!_this.Scope[parts[0]][parts[1]]) {
                                _this.Scope[parts[0]][parts[1]] = new Object();
                            }
                            _this.Model = _this.Scope[parts[0]][parts[1]];
                            _this.PropertyName = parts[2];
                            if (!_this.Model[_this.PropertyName]) {
                                _this.Model[_this.PropertyName] = _this.Cast(defaultValue, dataType, _this.Model[_this.PropertyName]);
                            }
                            break;
                        case 4:
                            if (!_this.Scope[parts[0]]) {
                                _this.Scope[parts[0]] = new Object();
                            }
                            if (!_this.Scope[parts[0]][parts[1]]) {
                                _this.Scope[parts[0]][parts[1]] = new Object();
                            }
                            if (!_this.Scope[parts[0]][parts[1]][parts[2]]) {
                                _this.Scope[parts[0]][parts[1]][parts[2]] = new Object();
                            }
                            _this.Model = _this.Scope[parts[0]][parts[1]][parts[2]];
                            _this.PropertyName = parts[3];
                            if (!_this.Model[_this.PropertyName]) {
                                _this.Model[_this.PropertyName] = _this.Cast(defaultValue, dataType, _this.Model[_this.PropertyName]);
                            }
                            break;
                        case 5:
                            if (!_this.Scope[parts[0]]) {
                                _this.Scope[parts[0]] = new Object();
                            }
                            if (!_this.Scope[parts[0]][parts[1]]) {
                                _this.Scope[parts[0]][parts[1]] = new Object();
                            }
                            if (!_this.Scope[parts[0]][parts[1]][parts[2]]) {
                                _this.Scope[parts[0]][parts[1]][parts[2]] = new Object();
                            }
                            if (!_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]) {
                                _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = new Object();
                            }
                            _this.Model = _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]];
                            _this.PropertyName = parts[4];
                            if (!_this.Model[_this.PropertyName]) {
                                _this.Model[_this.PropertyName] = _this.Cast(defaultValue, dataType, _this.Model[_this.PropertyName]);
                            }
                    }
                }
                else {
                    _this.Model = _this.Scope;
                    _this.PropertyName = model;
                    if (!_this.Model[_this.PropertyName]) {
                        _this.Model[_this.PropertyName] = _this.Cast(defaultValue, dataType, _this.Model[_this.PropertyName]);
                    }
                }
            };
            this.GetObject = function (model) {
                var obj;
                if (model.indexOf(".") > -1) {
                    var parts = model.split(".");
                    switch (parts.length) {
                        case 2:
                            if (!_this.Scope[parts[0]]) {
                                _this.Scope[parts[0]] = new Object();
                            }
                            obj = _this.Scope[parts[0]];
                            break;
                        case 3:
                            if (!_this.Scope[parts[0]]) {
                                _this.Scope[parts[0]] = new Object();
                            }
                            if (!_this.Scope[parts[0]][parts[1]]) {
                                _this.Scope[parts[0]][parts[1]] = new Object();
                            }
                            obj = _this.Scope[parts[0]][parts[1]];
                            break;
                        case 4:
                            if (!_this.Scope[parts[0]]) {
                                _this.Scope[parts[0]] = new Object();
                            }
                            if (!_this.Scope[parts[0]][parts[1]]) {
                                _this.Scope[parts[0]][parts[1]] = new Object();
                            }
                            if (!_this.Scope[parts[0]][parts[1]][parts[2]]) {
                                _this.Scope[parts[0]][parts[1]][parts[2]] = new Object();
                            }
                            obj = _this.Scope[parts[0]][parts[1]][parts[2]];
                            break;
                        case 5:
                            if (!_this.Scope[parts[0]]) {
                                _this.Scope[parts[0]] = new Object();
                            }
                            if (!_this.Scope[parts[0]][parts[1]]) {
                                _this.Scope[parts[0]][parts[1]] = new Object();
                            }
                            if (!_this.Scope[parts[0]][parts[1]][parts[2]]) {
                                _this.Scope[parts[0]][parts[1]][parts[2]] = new Object();
                            }
                            if (!_this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]) {
                                _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = new Object();
                            }
                            obj = _this.Scope[parts[0]][parts[1]][parts[2]][parts[3]];
                            break;
                    }
                }
                else {
                    obj = _this.Scope;
                }
                return obj;
            };
            //  Converts the Value of value Consistent with dataType
            this.Cast = function (value, dataType, currentValue) {
                if (currentValue === void 0) { currentValue = undefined; }
                //  Numeric Field
                if (dataType === DataTypeArgs.Int || dataType === DataTypeArgs.Float) {
                    if (!isNaN(dataType === DataTypeArgs.Int ? parseInt(value) : parseFloat(value))) {
                        return (dataType === DataTypeArgs.Int ? parseInt(value) : parseFloat(value));
                    }
                    else if (currentValue !== undefined && !isNaN(dataType === DataTypeArgs.Int ? parseInt(currentValue) : parseFloat(currentValue))) {
                        return (dataType === DataTypeArgs.Int ? parseInt(currentValue) : parseFloat(currentValue));
                    }
                    else {
                        return 0;
                    }
                }
                //  Date/Time Field
                if ((value !== undefined && value !== null && ((new Date(value)).toDateString() !== "Invalid Date" || (new Date("1/1/1900 " + value)).toDateString() !== "Invalid Date")) && (dataType === DataTypeArgs.Date || dataType === DataTypeArgs.Time || dataType === DataTypeArgs.DateTime)) {
                    var sDate = (dataType === DataTypeArgs.Time ? "1/1/1900 " + value : value);
                    var date = (value.toUpperCase() === "TODAY" ? new Date() : new Date(sDate));
                    if (date.toDateString() !== "Invalid Date") {
                        var month = date.getMonth() + 1, day = date.getDate(), year = date.getFullYear(), hour = (date.getHours() > 12 ? date.getHours() - 12 : (date.getHours() == 0 ? 12 : date.getHours())), minutes = date.getMinutes(), seconds = date.getSeconds(), meridian = (date.getHours() >= 12 ? "PM" : "AM");
                        if (dataType === DataTypeArgs.Date) {
                            return new String(('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year));
                        }
                        if (dataType === DataTypeArgs.Time) {
                            hour = date.getHours();
                            return new String(('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2));
                        }
                        if (dataType === DataTypeArgs.DateTime) {
                            return new String(('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year) + ' ' + ('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian);
                        }
                    }
                }
                //  Boolean Field
                if (dataType === DataTypeArgs.Boolean) {
                    if (value !== undefined && value !== null) {
                        if (typeof value === "boolean") {
                            return value;
                        }
                        if (typeof value === "object" && Object.prototype.toString.call(value) === "[object Boolean]") {
                            return value;
                        }
                        if ((value === 'true') === true || (value === 'false') === true) {
                            return new Boolean(value);
                        }
                    }
                    else if (currentValue !== undefined && currentValue !== null) {
                        if (typeof currentValue === "boolean") {
                            return currentValue;
                        }
                        if (typeof currentValue === "object" && Object.prototype.toString.call(currentValue) === "[object Boolean]") {
                            return currentValue;
                        }
                        if ((currentValue === 'true') === true || (currentValue === 'false') === true) {
                            return new Boolean(currentValue);
                        }
                    }
                    else {
                        return false;
                    }
                }
                //  String Field
                if (dataType === DataTypeArgs.String) {
                    return new String((value !== undefined ? encodeURIComponent(value) : ""));
                }
            };
            //  Gets the Value of the Named Parameter
            this.GetParameterValue = function (name, params) {
                for (var i = 0; i < params.length; i++) {
                    var param = params[i].split(":");
                    if (param && param.length === 2) {
                        if (param[0].trim().toUpperCase() === name.toUpperCase()) {
                            return param[1].trim();
                        }
                    }
                }
                return undefined;
            };
            var that = this;
            that.Scope = scope;
            that.Field = field;
            var bindingParams = $(that.Field).attr("binding").split(";");
            if (bindingParams && bindingParams.length > 0) {
                var dataTypeValue = that.GetParameterValue("DATATYPE", bindingParams);
                var modelValue = that.GetParameterValue("MODEL", bindingParams);
                var defaultValue = that.GetParameterValue("DEFAULTVALUE", bindingParams);
                var getValue = that.GetParameterValue("GET", bindingParams);
                var setValue = that.GetParameterValue("SET", bindingParams);
                //  Ensures the Data Type is properly defined and sets the DataType value
                var dt = DataTypeCollection.Instance()[dataTypeValue.toUpperCase()];
                var bl = DataTypeCollection.Instance()['INT'];
                that.DataType = (DataTypeCollection.Instance()[dataTypeValue.toUpperCase()] !== undefined ? DataTypeCollection.Instance()[dataTypeValue.toUpperCase()] : DataTypeArgs.String);
                that.FullModel = modelValue;
                that.SetDefaultValue(modelValue, defaultValue, that.DataType);
                if (that.Scope[getValue] !== undefined) {
                    that.Get = that.Scope[getValue];
                }
                if (that.Scope[setValue] !== undefined) {
                    that.Set = that.Scope[setValue];
                }
            }
        }
        //  Creates an Inherited Instance of BoundFieldBase Based on the Element Tag,
        //  and in the Case of INPUT Fields, the Field Type
        BoundFieldBase.CreateBoundField = function (scope, field) {
            if (scope === undefined || field === undefined) {
                return undefined;
            }
            switch (field.tagName.toUpperCase()) {
                case "SELECT":
                    return new BoundSelectField(scope, field);
                case "INPUT":
                    var tagType = field.type;
                    if (tagType.toUpperCase() === "CHECKBOX") {
                        return new BoundCheckBoxField(scope, field);
                    }
                    else {
                        return new BoundInputField(scope, field);
                    }
                case "TEXTAREA":
                    return new BoundTextAreaField(scope, field);
            }
        };
        return BoundFieldBase;
    }());
    KrodSpa.BoundFieldBase = BoundFieldBase;
    //  Represents a Bound HTML Select Field
    var BoundSelectField = (function (_super) {
        __extends(BoundSelectField, _super);
        function BoundSelectField(scope, field) {
            var _this = this;
            _super.call(this, scope, field);
            //  Determines if the Options in the Select Element Have Changed
            this.OptionsChanged = function (opts) {
                if ((_this.SelectField.options && _this.SelectField.options.length) && (opts && opts.length)) {
                    if (_this.SelectField.options.length === opts.length) {
                        for (var i = 0; i < opts.length; i++) {
                            var opt1 = opts[i];
                            var elementFound = false;
                            for (var j = 0; j < _this.SelectField.options.length; j++) {
                                var opt2 = _this.SelectField.options[j];
                                if (opt1.isSameNode(opt2)) {
                                    elementFound = true;
                                    break;
                                }
                            }
                            if (!elementFound) {
                                return true;
                            }
                        }
                        return false;
                    }
                    else {
                        return true;
                    }
                }
                return true;
            };
            var that = this, currentValue, // = that.Model[that.PropertyName],
            settingValue = false;
            that.SelectField = field;
            that.SelectField.selectedIndex = -1;
            that.Options = new Array();
            //  Get the Current Options so We Can Determine When They Change
            for (var i = 0; i < that.SelectField.options.length; i++) {
                var opt = that.SelectField.options[i];
                that.Options.push(opt);
            }
            //  Update the Value Property Value of Model
            that.SelectField.onchange = function (ev) {
                settingValue = true;
                if (that.Get) {
                    that.Model[that.PropertyName] = that.Get();
                    currentValue = that.Model[that.PropertyName];
                }
                else {
                    that.Model[that.PropertyName] = that.Cast(removeEscapeChars(that.SelectField.value), that.DataType);
                    currentValue = that.Model[that.PropertyName];
                }
                settingValue = false;
            };
            //  Monitor Option Changes & Changes in the Property Value of the Model
            setInterval(function () {
                if (!settingValue) {
                    that.Model = that.GetObject(that.FullModel);
                    if (that.OptionsChanged(that.Options)) {
                        that.SelectField.selectedIndex = -1;
                        that.Options = new Array();
                        for (var i = 0; i < that.SelectField.options.length; i++) {
                            var opt = that.SelectField.options[i];
                            that.Options.push(opt);
                        }
                        if (that.Set) {
                            that.Set(that.SelectField, that.Model);
                        }
                        else {
                            that.SelectField.value = removeEscapeChars(that.Model[that.PropertyName]);
                        }
                    }
                    if (that.Model[that.PropertyName] !== currentValue) {
                        if (that.Set) {
                            that.Set(that.SelectField, that.Model);
                        }
                        else {
                            that.SelectField.value = removeEscapeChars(that.Model[that.PropertyName]);
                        }
                        currentValue = that.Model[that.PropertyName];
                    }
                }
            }, 1000);
        }
        return BoundSelectField;
    }(BoundFieldBase));
    KrodSpa.BoundSelectField = BoundSelectField;
    //  Represents a Bound HTML Text Type Input Field
    var BoundInputField = (function (_super) {
        __extends(BoundInputField, _super);
        function BoundInputField(scope, field) {
            _super.call(this, scope, field);
            var that = this, currentValue = that.Model[that.PropertyName], settingValue = false;
            that.InputField = field;
            that.InputField.value = removeEscapeChars(that.Model[that.PropertyName]);
            //  Update Model Property Value When Key Pressed
            that.InputField.onkeyup = function (ev) {
                settingValue = true;
                if (that.Get !== undefined) {
                    that.Model[that.PropertyName] = that.Get();
                    currentValue = that.Model[that.PropertyName];
                }
                else {
                    that.Model[that.PropertyName] = that.Cast(that.InputField.value, that.DataType);
                    currentValue = that.Model[that.PropertyName];
                }
                settingValue = false;
            };
            //  Update Model Property Value When Value Changed
            that.InputField.onchange = function (ev) {
                settingValue = true;
                if (that.Get !== undefined) {
                    that.Model[that.PropertyName] = that.Get();
                    currentValue = that.Model[that.PropertyName];
                }
                else {
                    that.Model[that.PropertyName] = that.Cast(that.InputField.value, that.DataType);
                    currentValue = that.Model[that.PropertyName];
                }
                settingValue = false;
            };
            //  Monitor Option Changes & Changes in the Property Value of the Model
            setInterval(function () {
                if (!settingValue) {
                    that.Model = that.GetObject(that.FullModel);
                    if (that.Model[that.PropertyName] !== currentValue) {
                        if (that.Set !== undefined) {
                            that.Set(that.InputField, that.Model);
                        }
                        else {
                            that.InputField.value = removeEscapeChars(that.Model[that.PropertyName]);
                        }
                        currentValue = that.Model[that.PropertyName];
                    }
                }
            }, 1000);
        }
        return BoundInputField;
    }(BoundFieldBase));
    KrodSpa.BoundInputField = BoundInputField;
    //  Represents a Bound HTML CheckBox Type Input Field
    var BoundCheckBoxField = (function (_super) {
        __extends(BoundCheckBoxField, _super);
        function BoundCheckBoxField(scope, field) {
            _super.call(this, scope, field);
            var that = this, currentValue = that.Model[that.PropertyName], settingValue = false;
            that.CheckBox = field;
            if (that.Set !== undefined) {
                that.Set(that.CheckBox, that.Model);
            }
            else {
                $(that.CheckBox).prop("checked", that.Cast(that.Model[that.PropertyName], that.DataType));
            }
            //  Update Model Property Value When Key Pressed
            that.CheckBox.onclick = function (ev) {
                settingValue = true;
                if (that.Get !== undefined) {
                    that.Model[that.PropertyName] = that.Get();
                    currentValue = that.Cast(that.Model[that.PropertyName], that.DataType);
                }
                else {
                    that.Model[that.PropertyName] = $(that.CheckBox).prop("checked");
                    currentValue = that.Cast(that.Model[that.PropertyName], that.DataType);
                }
                settingValue = false;
            };
            //  Monitor Option Changes & Changes in the Property Value of the Model
            setInterval(function () {
                if (!settingValue) {
                    that.Model = that.GetObject(that.FullModel);
                    if (that.Model[that.PropertyName] !== currentValue) {
                        if (that.Set !== undefined) {
                            that.Set(that.CheckBox, that.Model);
                        }
                        else {
                            $(that.CheckBox).prop("checked", that.Cast(that.Model[that.PropertyName], that.DataType));
                        }
                        currentValue = that.Cast(that.Model[that.PropertyName], that.DataType);
                    }
                }
            }, 500);
        }
        return BoundCheckBoxField;
    }(BoundFieldBase));
    KrodSpa.BoundCheckBoxField = BoundCheckBoxField;
    //  Represents a Bound HTML Text Type Input Field
    var BoundTextAreaField = (function (_super) {
        __extends(BoundTextAreaField, _super);
        function BoundTextAreaField(scope, field) {
            _super.call(this, scope, field);
            var that = this, currentValue = that.Model[that.PropertyName], settingValue = false;
            that.InputField = field;
            that.InputField.value = removeEscapeChars(that.Model[that.PropertyName]);
            //  Update Model Property Value When Key Pressed
            that.InputField.onkeyup = function (ev) {
                settingValue = true;
                if (that.Get !== undefined) {
                    that.Model[that.PropertyName] = that.Get();
                    currentValue = that.Model[that.PropertyName];
                }
                else {
                    that.Model[that.PropertyName] = that.Cast(that.InputField.value, that.DataType);
                    currentValue = that.Model[that.PropertyName];
                }
                settingValue = false;
            };
            //  Update Model Property Value When Value Changed
            that.InputField.onchange = function (ev) {
                settingValue = true;
                if (that.Get !== undefined) {
                    that.Model[that.PropertyName] = that.Get();
                    currentValue = that.Model[that.PropertyName];
                }
                else {
                    that.Model[that.PropertyName] = that.Cast(that.InputField.value, that.DataType);
                    currentValue = that.Model[that.PropertyName];
                }
                settingValue = false;
            };
            //  Monitor Option Changes & Changes in the Property Value of the Model
            setInterval(function () {
                if (!settingValue) {
                    that.Model = that.GetObject(that.FullModel);
                    if (that.Model[that.PropertyName] !== currentValue) {
                        if (that.Set !== undefined) {
                            that.Set(that.InputField, that.Model);
                        }
                        else {
                            that.InputField.value = removeEscapeChars(that.Model[that.PropertyName]);
                        }
                        currentValue = that.Model[that.PropertyName];
                    }
                }
            }, 500);
        }
        return BoundTextAreaField;
    }(BoundFieldBase));
    KrodSpa.BoundTextAreaField = BoundTextAreaField;
})(KrodSpa || (KrodSpa = {}));
var KrodSpa;
(function (KrodSpa) {
    var Data;
    (function (Data) {
        (function (HttpReadyStateArgs) {
            HttpReadyStateArgs[HttpReadyStateArgs["Opened"] = 1] = "Opened";
            HttpReadyStateArgs[HttpReadyStateArgs["HeadersReceived"] = 2] = "HeadersReceived";
            HttpReadyStateArgs[HttpReadyStateArgs["LoadingResponse"] = 3] = "LoadingResponse";
            HttpReadyStateArgs[HttpReadyStateArgs["Done"] = 4] = "Done";
        })(Data.HttpReadyStateArgs || (Data.HttpReadyStateArgs = {}));
        var HttpReadyStateArgs = Data.HttpReadyStateArgs;
        (function (HeaderTypeArgs) {
            HeaderTypeArgs[HeaderTypeArgs["CacheControl"] = 0] = "CacheControl";
            HeaderTypeArgs[HeaderTypeArgs["Accept"] = 1] = "Accept";
            HeaderTypeArgs[HeaderTypeArgs["ContentType"] = 2] = "ContentType";
            HeaderTypeArgs[HeaderTypeArgs["Authorization"] = 5] = "Authorization";
        })(Data.HeaderTypeArgs || (Data.HeaderTypeArgs = {}));
        var HeaderTypeArgs = Data.HeaderTypeArgs;
        var HttpHeader = (function () {
            function HttpHeader(headerType, value) {
                var that = this;
                that.Value = value;
                switch (headerType) {
                    case HeaderTypeArgs.Accept:
                        that.Key = "Accept";
                        break;
                    case HeaderTypeArgs.Authorization:
                        that.Key = "Authorization";
                        break;
                    case HeaderTypeArgs.CacheControl:
                        that.Key = "Cache-Control";
                        break;
                    case HeaderTypeArgs.ContentType:
                        that.Key = "Content-Type";
                        break;
                }
            }
            HttpHeader.GetHeaderKeyValue = function (Key) {
                switch (Key) {
                    case HeaderTypeArgs.Accept:
                        return "Accept";
                    case HeaderTypeArgs.Authorization:
                        return "Authorization";
                    case HeaderTypeArgs.CacheControl:
                        return "Cache-Control";
                    case HeaderTypeArgs.ContentType:
                        return "Content-Type";
                    default:
                        return "";
                }
            };
            HttpHeader.NoCache = function () {
                return new HttpHeader(HeaderTypeArgs.CacheControl, "no-cache");
            };
            HttpHeader.AcceptJSon = function () {
                return new HttpHeader(HeaderTypeArgs.Accept, "text/json");
            };
            HttpHeader.AcceptXML = function () {
                return new HttpHeader(HeaderTypeArgs.Accept, "text/xml");
            };
            HttpHeader.ContentTypeFormUrlEncoded = function () {
                return new HttpHeader(HeaderTypeArgs.ContentType, "application/x-www-form-urlencoded");
            };
            HttpHeader.ContentTypeApplicationJSon = function () {
                return new HttpHeader(HeaderTypeArgs.ContentType, "application/json");
            };
            return HttpHeader;
        }());
        Data.HttpHeader = HttpHeader;
        //  Holds a Collection of HTTP Headers to be Used in Web Requests Made by WebQuery
        var HttpHeaderCollection = (function () {
            function HttpHeaderCollection() {
                var that = this, items = new Array();
                that.Length = function () {
                    return items.length;
                };
                that.Item = function (idx) {
                    if (idx < items.length) {
                        return items[idx];
                    }
                    else {
                        return null;
                    }
                };
                that.Get = function (Key) {
                    var hdr = undefined;
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].Key === HttpHeader.GetHeaderKeyValue(Key)) {
                            hdr = items[i];
                            break;
                        }
                    }
                    return hdr;
                };
                that.HasHeader = function (Key) {
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].Key === HttpHeader.GetHeaderKeyValue(Key)) {
                            return true;
                        }
                    }
                    return false;
                };
                that.AddHeader = function (header) {
                    if (header) {
                        for (var i = 0; i < items.length; i++) {
                            if (items[i].Key === header.Key) {
                                items[i].Value += ", " + header.Value;
                                return;
                            }
                        }
                        items.push(header);
                    }
                };
                that.CreateHeader = function (headerType, headerValue) {
                    var header = new HttpHeader(headerType, headerValue);
                    for (var i = 0; i < items.length; i++) {
                        if (items[i].Key === header.Key) {
                            items[i].Value += ", " + headerValue;
                            return;
                        }
                    }
                    items.push(header);
                };
            }
            return HttpHeaderCollection;
        }());
        Data.HttpHeaderCollection = HttpHeaderCollection;
        //  Used to Load Server Resources, and Send & Retrieve Data to & from RESTful Web Services
        var WebQuery = (function () {
            function WebQuery() {
            }
            //  Loads the rource located on the server specified in the URL
            WebQuery.load = function (url, showWait) {
                if (showWait === void 0) { showWait = false; }
                var body = $("body")[0];
                //  To ensure the enduser cannot interact with the DOM while transaction is being processed
                //  It creates a transparent overlay over the screen so that they can still see the screen,
                //  but are unable to click any buttons, or make changes to any selections or other inputs
                var progressMask = WebQuery.CreateElement("div", "", undefined, undefined);
                //  Provides a visual progress indicator so that the enduser can see the steps being executed
                var messageElement = WebQuery.CreateElement("div", "", undefined, undefined);
                //  Builds our mask & progress indicator, and adds them to the DOM
                var progressContainer = WebQuery.CreateProgressWindow(progressMask, messageElement);
                if (showWait === true) {
                    $(body).append(progressMask);
                    $(body).append(progressContainer);
                }
                var xhr = new XMLHttpRequest(), promise = new Promise(), result;
                try {
                    //  We'll create the event handler before opening the URL so that we'll
                    //  receive the Opened & HeadersReceived state changes
                    xhr.onreadystatechange = function (ev) {
                        //  Display the progress as readyState changes
                        if (xhr.readyState === HttpReadyStateArgs.Opened) {
                            $(messageElement).html("Sending Request...");
                        }
                        if (xhr.readyState === HttpReadyStateArgs.HeadersReceived) {
                            $(messageElement).html("Receiving Response...");
                        }
                        if (xhr.readyState === HttpReadyStateArgs.LoadingResponse) {
                            $(messageElement).html("Processing Data...");
                        }
                        //  Response is OK so we'll call the resolve method on our Promise object instance
                        if (xhr.readyState === HttpReadyStateArgs.Done && xhr.status === 200) {
                            if (showWait === true) {
                                $(progressContainer).remove();
                                $(progressMask).remove();
                            }
                            promise.resolve((xhr.responseText ? xhr.responseText : (xhr.responseXML ? xhr.responseXML : (xhr.response ? xhr.response : ""))));
                        }
                        //  Response is Not OK so we'll call the reject method on our Promise object instance
                        if (xhr.readyState === HttpReadyStateArgs.Done && xhr.status !== 200) {
                            if (showWait === true) {
                                $(progressContainer).remove();
                                $(progressMask).remove();
                            }
                            var errMsg;
                            try {
                                errMsg = JSON.parse(xhr.responseText.replace('error', 'Message'));
                                errMsg["Status"] = xhr.status;
                            }
                            catch (ex) {
                                if (errMsg === undefined || errMsg === null) {
                                    errMsg = new Object();
                                }
                                errMsg["Message"] = xhr.responseText.replace('"error":', '').replace('"Message":', '');
                                errMsg["Status"] = xhr.status;
                            }
                            promise.reject(errMsg);
                        }
                    };
                    //  Open the connection to the server resource
                    xhr.open("GET", url + "?ranID=" + Math.ceil((Math.random() * 100) + 1), true);
                    //  If an error occurs  call the reject method on our Promise object instance
                    xhr.onerror = function (ev) {
                        if (showWait === true) {
                            $(progressContainer).remove();
                            $(progressMask).remove();
                        }
                        promise.reject(ev);
                    };
                    xhr.send(null);
                }
                //  If an error occurs  call the reject method on our Promise object instance
                catch (ex) {
                    if (showWait === true) {
                        $(progressContainer).remove();
                        $(progressMask).remove();
                    }
                    promise.reject(ex);
                }
                //  Return the promise so that the resolve callback can be passed to the "then" method
                return promise;
            };
            //  Calls a RESTful web service, and performs a GET operation
            WebQuery.RestfulGet = function (url, parameters, headers, showWait) {
                if (showWait === void 0) { showWait = true; }
                var body = $("body")[0];
                //  To ensure the enduser cannot interact with the DOM while transaction is being processed
                //  It creates a transparent overlay over the screen so that they can still see the screen,
                //  but are unable to click any buttons, or make changes to any selections or other inputs
                var progressMask = WebQuery.CreateElement("div", "", undefined, undefined);
                //  Provides a visual progress indicator so that the enduser can see the steps being executed
                var messageElement = WebQuery.CreateElement("div", "", undefined, undefined);
                //  Builds our mask & progress indicator, and adds them to the DOM
                var progressContainer = WebQuery.CreateProgressWindow(progressMask, messageElement);
                if (showWait === true) {
                    $(body).append(progressMask);
                    $(body).append(progressContainer);
                }
                var xhr = new XMLHttpRequest(), promise = new Promise(), result;
                try {
                    //  We'll create the event handler before opening the URL so that we'll
                    //  receive the Opened & HeadersReceived state changes
                    xhr.onreadystatechange = function (ev) {
                        //  Display the progress as readyState changes
                        if (xhr.readyState === HttpReadyStateArgs.Opened) {
                            $(messageElement).html("Sending Request...");
                        }
                        if (xhr.readyState === HttpReadyStateArgs.HeadersReceived) {
                            $(messageElement).html("Receiving Response...");
                        }
                        if (xhr.readyState === HttpReadyStateArgs.LoadingResponse) {
                            $(messageElement).html("Processing Data...");
                        }
                        //  Response is OK so we'll call the resolve method on our Promise object instance
                        if (xhr.readyState === HttpReadyStateArgs.Done && xhr.status === 200) {
                            if (showWait === true) {
                                $(progressContainer).remove();
                                $(progressMask).remove();
                            }
                            try {
                                promise.resolve(JSON.parse(xhr.responseText));
                            }
                            catch (ex) {
                                promise.resolve((xhr.responseText ? xhr.responseText : (xhr.responseXML ? xhr.responseXML : (xhr.response ? xhr.response : ""))));
                            }
                        }
                        //  Response is Not OK so we'll call the reject method on our Promise object instance
                        if (xhr.readyState === HttpReadyStateArgs.Done && xhr.status !== 200) {
                            if (showWait === true) {
                                $(progressContainer).remove();
                                $(progressMask).remove();
                            }
                            var errMsg;
                            try {
                                errMsg = JSON.parse(xhr.responseText.replace('error', 'Message'));
                                errMsg["Status"] = xhr.status;
                            }
                            catch (ex) {
                                if (errMsg === undefined || errMsg === null) {
                                    errMsg = new Object();
                                }
                                errMsg["Message"] = xhr.responseText.replace('"error":', '').replace('"Message":', '');
                                errMsg["Status"] = xhr.status;
                            }
                            promise.reject(errMsg);
                        }
                    };
                    //  Open the connection to the server resource & pass any parameters that exist
                    parameters = (parameters !== undefined && parameters !== "" ? "?" + parameters + "&ranID=" + Math.ceil((Math.random() * 10000) + 1) : "?ranID=" + Math.ceil((Math.random() * 10000) + 1));
                    xhr.open("GET", url + parameters, true);
                    //  Add the specified HTTP Headers
                    if (headers) {
                        for (var i = 0; i < headers.Length(); i++) {
                            xhr.setRequestHeader(headers.Item(i).Key, headers.Item(i).Value);
                        }
                    }
                    //  If an error occurs  call the reject method on our Promise object instance
                    xhr.onerror = function (ev) {
                        if (showWait === true) {
                            $(progressContainer).remove();
                            $(progressMask).remove();
                        }
                        promise.reject(ev);
                    };
                    xhr.send(null);
                }
                //  If an error occurs  call the reject method on our Promise object instance
                catch (ex) {
                    if (showWait === true) {
                        $(progressContainer).remove();
                        $(progressMask).remove();
                    }
                    promise.reject(ex);
                }
                //  Return the promise so that the resolve callback can be passed to the "then" method
                return promise;
            };
            //  Calls a RESTful web service, and performs a POST operation
            WebQuery.RestfulPost = function (url, model, headers) {
                var body = $("body")[0];
                //  To ensure the enduser cannot interact with the DOM while transaction is being processed
                //  It creates a transparent overlay over the screen so that they can still see the screen,
                //  but are unable to click any buttons, or make changes to any selections or other inputs
                var progressMask = WebQuery.CreateElement("div", "", undefined, undefined);
                //  Provides a visual progress indicator so that the enduser can see the steps being executed
                var messageElement = WebQuery.CreateElement("div", "", undefined, undefined);
                //  Builds our mask & progress indicator, and adds them to the DOM
                var progressContainer = WebQuery.CreateProgressWindow(progressMask, messageElement);
                $(body).append(progressMask);
                $(body).append(progressContainer);
                var xhr = new XMLHttpRequest(), promise = new Promise(), result;
                try {
                    //  We'll create the event handler before opening the URL so that we'll
                    //  receive the Opened & HeadersReceived state changes
                    xhr.onreadystatechange = function (ev) {
                        //  Display the progress as readyState changes
                        if (xhr.readyState === HttpReadyStateArgs.Opened) {
                            $(messageElement).html("Sending Request...");
                        }
                        if (xhr.readyState === HttpReadyStateArgs.HeadersReceived) {
                            $(messageElement).html("Receiving Response...");
                        }
                        if (xhr.readyState === HttpReadyStateArgs.LoadingResponse) {
                            $(messageElement).html("Processing Data...");
                        }
                        //  Response is OK so we'll call the resolve method on our Promise object instance
                        if (xhr.readyState === HttpReadyStateArgs.Done && xhr.status === 200) {
                            $(progressContainer).remove();
                            $(progressMask).remove();
                            try {
                                promise.resolve(JSON.parse(xhr.responseText));
                            }
                            catch (ex) {
                                promise.resolve((xhr.responseText ? xhr.responseText : (xhr.responseXML ? xhr.responseXML : (xhr.response ? xhr.response : ""))));
                            }
                        }
                        //  Response is Not OK so we'll call the reject method on our Promise object instance
                        if (xhr.readyState === HttpReadyStateArgs.Done && xhr.status !== 200) {
                            $(progressContainer).remove();
                            $(progressMask).remove();
                            var errMsg;
                            try {
                                errMsg = JSON.parse(xhr.responseText.replace('error', 'Message'));
                                errMsg["Status"] = xhr.status;
                            }
                            catch (ex) {
                                if (errMsg === undefined || errMsg === null) {
                                    errMsg = new Object();
                                }
                                errMsg["Message"] = xhr.responseText.replace('"error":', '').replace('"Message":', '');
                                errMsg["Status"] = xhr.status;
                            }
                            promise.reject(errMsg);
                        }
                    };
                    //  Open the connection to the server resource & pass our parameters
                    xhr.open("POST", url, true);
                    //  Add the specified HTTP Headers
                    if (headers) {
                        for (var i = 0; i < headers.Length(); i++) {
                            xhr.setRequestHeader(headers.Item(i).Key, headers.Item(i).Value);
                        }
                    }
                    //  If an error occurs  call the reject method on our Promise object instance
                    xhr.onerror = function (ev) {
                        $(progressContainer).remove();
                        $(progressMask).remove();
                        promise.reject(ev);
                    };
                    xhr.send((typeof model === 'object' && model !== null ? Object.toKeyString(model) : (typeof model === 'string' ? model : "")));
                }
                //  If an error occurs  call the reject method on our Promise object instance
                catch (ex) {
                    $(progressContainer).remove();
                    $(progressMask).remove();
                    promise.reject(ex);
                }
                //  Return the promise so that the resolve callback can be passed to the "then" method
                return promise;
            };
            //  Calls a RESTful web service, and performs a POST operations for each element found in parameter postParams
            //  THIS METHOD HAS NOT YET BEEN IMPLEMENTED
            WebQuery.RestfulPostAll = function (postParams, headers) {
                var body = $("body")[0];
                var progressMask = WebQuery.CreateElement("div", "", undefined, undefined);
                var messageElement = WebQuery.CreateElement("div", "", undefined, undefined);
                var progressContainer = WebQuery.CreateProgressWindow(progressMask, messageElement);
                $(body).append(progressMask);
                $(body).append(progressContainer);
                var xhr = new XMLHttpRequest(), promise = new Promise(), result;
                return promise;
            };
            //  Creates the Progress Mask & Indicator Controls that are displayed 
            //  while our XMLHttpRequest operations are being performed
            WebQuery.CreateProgressWindow = function (progressMask, messageElement) {
                var body = $("body")[0];
                var container = WebQuery.CreateElement("div", "", undefined, undefined);
                var progress = WebQuery.CreateElement("div", "", undefined, undefined);
                $(progressMask).css("position", "fixed");
                $(progressMask).css("left", "0");
                $(progressMask).css("top", "0");
                $(progressMask).css("width", "100%");
                $(progressMask).css("height", "100%");
                $(progressMask).css("background-color", "transparent");
                var top = 0, left = 0;
                left = ((body.clientWidth - 150.0) / 2);
                top = ((body.clientHeight - 150.0) / 2);
                $(container).css("width", "150px");
                $(container).css("height", "150px");
                $(container).css("position", "absolute");
                $(container).css("left", left + "px");
                $(container).css("top", top + "px");
                $(container).css("color", "#000");
                $(container).css("font-family", "Arial, Helvetica, sans-serif");
                $(container).css("padding", "35px 5px 5px 5px");
                $(container).css("border", "1px solid #e8e4e4");
                $(container).css("border-radius", "5px");
                $(container).css("background-color", "#fff");
                $(progress).css("width", "50px");
                $(progress).css("font-size", "95%");
                $(progress).css("margin-left", "auto");
                $(progress).css("margin-right", "auto");
                $(progress).html('<i class="fa fa-spinner fa-pulse fa-3x"></i>');
                $(container).append(progress);
                $(messageElement).css("font-size", "75%");
                $(messageElement).css("padding-top", "20px");
                $(messageElement).css("text-align", "center");
                $(container).append(messageElement);
                return container;
            };
            //  Creates the HTML element specified in elementType, and adds the classes and attributes defined in classList &
            //  attributes respectiviely. It then sets the innerHTML property equal to the value of innerHtml parameter
            WebQuery.CreateElement = function (elementType, innerHtml, classList, attributes) {
                var element = document.createElement(elementType);
                if (classList !== undefined) {
                    classList.forEach(function (value) {
                        $(element).addClass(value);
                    });
                }
                if (attributes !== undefined) {
                    attributes.forEach(function (value) {
                        $(element).attr(value.Key, value.Value);
                    });
                }
                element.innerHTML = innerHtml;
                return element;
            };
            return WebQuery;
        }());
        Data.WebQuery = WebQuery;
        var FilterObject = (function () {
            function FilterObject() {
                var that = this;
            }
            return FilterObject;
        }());
        Data.FilterObject = FilterObject;
        var FilterObjectCollection = (function () {
            function FilterObjectCollection() {
                var that = this;
                that.Filter = new Array();
                that.Add = function (name, value, datatType) {
                    if (that.ContainsField(name)) {
                        that.UpdateValue(name, value);
                    }
                    else {
                        var filterObj = new FilterObject();
                        filterObj.FieldName = name;
                        filterObj.FilterValue = value;
                        filterObj.DataType = datatType;
                        that.Filter.push(filterObj);
                    }
                };
                that.UpdateValue = function (name, value) {
                    for (var i = 0; i < that.Filter.length; i++) {
                        if (that.Filter[i].FieldName.toLowerCase() === name.toLowerCase()) {
                            that.Filter[i].FilterValue = value;
                            break;
                        }
                    }
                };
                that.ContainsField = function (name) {
                    for (var i = 0; i < that.Filter.length; i++) {
                        if (that.Filter[i].FieldName.toLowerCase() === name.toLowerCase()) {
                            return true;
                        }
                    }
                    return false;
                };
                that.MeetsCriteria = function (value) {
                    var totalFilterFields = that.Filter.length;
                    var totalMatchedFields = 0;
                    for (var i = 0; i < that.Filter.length; i++) {
                        if (value[that.Filter[i].FieldName] !== undefined) {
                            var compareDates = function (d1, d2) {
                                if (Krodzone.KrodzoneDate.dateValid(d1) && Krodzone.KrodzoneDate.dateValid(d2)) {
                                    var dateOne = new Date(d1);
                                    var dateTwo = new Date(d2);
                                    return (dateOne >= dateTwo);
                                }
                                return true;
                            };
                            switch (that.Filter[i].DataType) {
                                case 0:
                                    var intOne = (!isNaN(parseInt(value[that.Filter[i].FieldName])) ? parseInt(value[that.Filter[i].FieldName]) : -1);
                                    var intTwo = (!isNaN(parseInt(that.Filter[i].FilterValue)) ? parseInt(that.Filter[i].FilterValue) : -1);
                                    if (intOne > -1 && intTwo > -1) {
                                        if (intOne >= intTwo) {
                                            totalMatchedFields++;
                                        }
                                    }
                                    break;
                                case 1:
                                    var floatOne = (!isNaN(parseFloat(value[that.Filter[i].FieldName])) ? parseFloat(value[that.Filter[i].FieldName]) : -1);
                                    var floatTwo = (!isNaN(parseFloat(that.Filter[i].FilterValue)) ? parseFloat(that.Filter[i].FilterValue) : -1);
                                    if (floatOne > -1 && floatTwo > -1) {
                                        if (floatOne >= floatTwo) {
                                            totalMatchedFields++;
                                        }
                                    }
                                    break;
                                case 2:
                                    var dateMatchFound = compareDates(value[that.Filter[i].FieldName], that.Filter[i].FilterValue);
                                    if (dateMatchFound) {
                                        totalMatchedFields++;
                                    }
                                    break;
                                case 3:
                                    var timeMatchFound = compareDates("1/1/1900 " + value[that.Filter[i].FieldName], "1/1/1900 " + that.Filter[i].FilterValue);
                                    if (timeMatchFound) {
                                        totalMatchedFields++;
                                    }
                                    break;
                                case 4:
                                    var dateTimeMatchFound = compareDates(value[that.Filter[i].FieldName], that.Filter[i].FilterValue);
                                    if (dateTimeMatchFound) {
                                        totalMatchedFields++;
                                    }
                                    if (compareDates(value[that.Filter[i].FieldName], that.Filter[i].FilterValue)) {
                                        totalMatchedFields++;
                                    }
                                    break;
                                default:
                                    var stringOne = value[that.Filter[i].FieldName].toString().toLowerCase();
                                    var stringTwo = that.Filter[i].FilterValue.toString().toLowerCase();
                                    if (stringTwo === "none") {
                                        if (stringOne.trim() === "") {
                                            totalMatchedFields++;
                                        }
                                    }
                                    else {
                                        if (stringOne.indexOf(stringTwo) > -1) {
                                            totalMatchedFields++;
                                        }
                                    }
                                    break;
                            }
                        }
                        else {
                            totalMatchedFields++;
                        }
                    }
                    return (totalMatchedFields === totalFilterFields);
                };
            }
            return FilterObjectCollection;
        }());
        Data.FilterObjectCollection = FilterObjectCollection;
    })(Data = KrodSpa.Data || (KrodSpa.Data = {}));
})(KrodSpa || (KrodSpa = {}));
var KrodSpa;
(function (KrodSpa) {
    var Views;
    (function (Views) {
        /******************************************************************************************************************
         *
         * BASE CLASS FOR ALL HTML VIEWS
         *
         ******************************************************************************************************************/
        //  Base Class
        var HtmlControl = (function () {
            function HtmlControl() {
                //  Creates the HTML element specified in elementType, and adds the classes and attributes defined in classList &
                //  attributes respectiviely. It then sets the innerHTML property equal to the value of innerHtml parameter
                this.CreateElement = function (elementType, innerHtml, classList, attributes) {
                    var element = document.createElement(elementType);
                    if (classList !== undefined) {
                        for (var i = 0; i < classList.length; i++) {
                            element.classList.add(classList[i]);
                        }
                    }
                    if (attributes !== undefined) {
                        for (var i = 0; i < attributes.Keys.length; i++) {
                            element.setAttribute(attributes.Keys[i], attributes.Values[i]);
                        }
                    }
                    element.innerHTML = innerHtml;
                    return element;
                };
                //  Used to get the value of a property found in the supplied CSS class
                this.GetCssValue = function (className, property) {
                    for (var i = 0; i < document.styleSheets.length; i++) {
                        try {
                            var styleSheet = document.styleSheets[i];
                            var classes = (styleSheet.rules ? styleSheet.rules : (styleSheet.cssRules ? styleSheet.cssRules : undefined));
                            if (classes !== undefined) {
                                for (var c = 0; c < classes.length; c++) {
                                    if (classes[c].selectorText === className) {
                                        return (classes[c].style[property] ? classes[c].style[property] : "");
                                    }
                                }
                            }
                        }
                        catch (e) {
                            if (e.name !== 'SecurityError')
                                throw e;
                            return "";
                        }
                    }
                    return "";
                };
                //  Retrieves the Elements physical location on the page
                this.GetElementCoordinates = function (el, offsetWidth, childWidth) {
                    var rect = el.getBoundingClientRect();
                    var docEl = document.documentElement;
                    var elemTop = Math.ceil(rect.top + window.pageYOffset - docEl.clientTop);
                    var elemLeft = Math.ceil(rect.left + window.pageXOffset - docEl.clientLeft);
                    var elemHeight = el.clientHeight;
                    if (offsetWidth && childWidth && offsetWidth === true) {
                        elemLeft = elemLeft - Math.abs(el.clientWidth - childWidth);
                    }
                    return new ElementLocation(elemLeft, (elemTop + elemHeight + 2));
                };
            }
            return HtmlControl;
        }());
        Views.HtmlControl = HtmlControl;
        //  Used for returning an elements physical location on a page
        var ElementLocation = (function () {
            function ElementLocation(x, y) {
                var that = this;
                that.X = x + "px";
                that.Y = y + "px";
            }
            return ElementLocation;
        }());
        Views.ElementLocation = ElementLocation;
        //  Used for Determining MessageBox Type
        (function (MessageBoxTypeArgs) {
            MessageBoxTypeArgs[MessageBoxTypeArgs["Information"] = 0] = "Information";
            MessageBoxTypeArgs[MessageBoxTypeArgs["Question"] = 1] = "Question";
            MessageBoxTypeArgs[MessageBoxTypeArgs["Exclamation"] = 2] = "Exclamation";
        })(Views.MessageBoxTypeArgs || (Views.MessageBoxTypeArgs = {}));
        var MessageBoxTypeArgs = Views.MessageBoxTypeArgs;
        //  Used for Determining Return Types for MessageBox Result
        (function (MessageBoxButtonArgs) {
            MessageBoxButtonArgs[MessageBoxButtonArgs["Ok"] = 0] = "Ok";
            MessageBoxButtonArgs[MessageBoxButtonArgs["OkCancel"] = 1] = "OkCancel";
            MessageBoxButtonArgs[MessageBoxButtonArgs["YesNo"] = 2] = "YesNo";
        })(Views.MessageBoxButtonArgs || (Views.MessageBoxButtonArgs = {}));
        var MessageBoxButtonArgs = Views.MessageBoxButtonArgs;
        //  Used for Determining Return Types for MessageBox Result
        (function (MessageBoxResultArgs) {
            MessageBoxResultArgs[MessageBoxResultArgs["Ok"] = 0] = "Ok";
            MessageBoxResultArgs[MessageBoxResultArgs["Cancel"] = 1] = "Cancel";
            MessageBoxResultArgs[MessageBoxResultArgs["Yes"] = 2] = "Yes";
            MessageBoxResultArgs[MessageBoxResultArgs["No"] = 3] = "No";
        })(Views.MessageBoxResultArgs || (Views.MessageBoxResultArgs = {}));
        var MessageBoxResultArgs = Views.MessageBoxResultArgs;
        //  Dialog Window
        var ModalWindow = (function (_super) {
            __extends(ModalWindow, _super);
            function ModalWindow(view, modalArgs) {
                var _this = this;
                _super.call(this);
                //  Creates the Modal Window and Prepares it to be Added to the Body
                this.CreateModalWindow = function () {
                    _this.ModalContainer = _this.CreateElement("div", "", ["modal-window", _this.ModalArgs.ModalWidth], undefined);
                    _this.ModalClose = _this.CreateElement("div", '<i class="fa fa-close"></i>', undefined, undefined);
                    _this.ExecuteButton = _this.CreateElement("button", _this.ModalArgs.ExecutionHtml, ["btn", "btn-primary", "pull-right"], undefined);
                    _this.CancelButton = _this.CreateElement("button", _this.ModalArgs.CancelHtml, ["btn", "btn-warning", "pull-right"], undefined);
                    //  Created the Modal Title
                    var modalTitle = _this.CreateElement("div", "<span>" + _this.ModalArgs.ModalCaption + "</span>", ["title"], undefined);
                    modalTitle.appendChild(_this.ModalClose);
                    _this.ModalContainer.appendChild(modalTitle);
                    //  Add the View to the Body of the Modal
                    var modalBody = _this.CreateElement("div", "", ["body"], undefined);
                    modalBody.appendChild(_this.View);
                    _this.ModalContainer.appendChild(modalBody);
                    //  Add the Buttons if Required
                    if (_this.ModalArgs.ShowExecuteButton || _this.ModalArgs.ShowCancelButton) {
                        var modalButtons = _this.CreateElement("div", "", ["button"], undefined);
                        if (_this.ModalArgs.ShowCancelButton) {
                            modalButtons.appendChild(_this.CancelButton);
                        }
                        if (_this.ModalArgs.ShowExecuteButton) {
                            modalButtons.appendChild(_this.ExecuteButton);
                        }
                        _this.ModalContainer.appendChild(modalButtons);
                    }
                    //  Created the Modal Footer
                    var modalFooter = _this.CreateElement("div", _this.ModalArgs.FooterText, ["footer"], undefined);
                    _this.ModalContainer.appendChild(modalFooter);
                };
                var that = this;
                that.View = view;
                that.ModalArgs = modalArgs;
                that.Mask = new ModalMask("opaque");
                if (that.View === undefined) {
                    that.View = that.CreateElement("div", "<strong>Invalid Template</strong>", undefined, undefined);
                    that.ModalArgs.ShowCancelButton = false;
                    that.ModalArgs.ShowExecuteButton = false;
                }
                that.Validator = new ViewValidator(that.View, that.ModalArgs.Scope);
                var viewValid = function (view) {
                    var formValidator = $(view).find('formvalidator');
                    if (formValidator && formValidator.length > 0) {
                        var validationParent = formValidator[0];
                        var validationChildren = $(validationParent).find('[validate]').toArray();
                        var errorContainer = ($("#" + $(validationParent).attr("errorcontainerid")) ? $("#" + $(validationParent).attr("errorcontainerid"))[0] : undefined);
                        var errorMsgElement = ($("#" + $(validationParent).attr("errormessageid")) ? $("#" + $(validationParent).attr("errormessageid"))[0] : undefined);
                        if (errorMsgElement) {
                            $(errorMsgElement).removeClass("alert-danger");
                            $(errorMsgElement).removeClass("alert-success");
                        }
                        if (errorContainer) {
                            $(errorContainer).hide();
                        }
                        if (validationChildren) {
                            var viewIsValid = true;
                            var errorMsg = "";
                            for (var i = 0; i < validationChildren.length; i++) {
                                var element = validationChildren[i];
                                var validationRules = $(element).attr("validationrule").split(",");
                                var elementValue = $(element).val();
                                $(element).removeClass("form-error");
                                if (validationRules && validationRules.length > 0) {
                                    var validationMsgs = ($(element).attr("validationmessage") ? $(element).attr("validationmessage") : "Required field!").split(",");
                                    for (var ruleIDX = 0; ruleIDX < validationRules.length; ruleIDX++) {
                                        var rule = validationRules[ruleIDX];
                                        var validationMsg = (validationMsgs[ruleIDX] ? validationMsgs[ruleIDX] : "Required Field!");
                                        switch (rule.toUpperCase()) {
                                            case "RANGE":
                                                try {
                                                    var rangeValue = (parseFloat(elementValue) === NaN ? -1 : parseFloat(elementValue));
                                                    var minRange = (parseFloat(elementValue) === NaN ? 0 : (parseFloat($(element).attr("min-range")) === NaN ? rangeValue + 1 : parseFloat($(element).attr("min-range"))));
                                                    var maxRange = (parseFloat(elementValue) === NaN ? 1 : ($(element).attr("max-range") === "*" ? rangeValue + minRange + 10 : (parseFloat($(element).attr("max-range")) === NaN ? rangeValue - 1 : parseFloat($(element).attr("max-range")))));
                                                    if (rangeValue < minRange || rangeValue > maxRange) {
                                                        $(element).addClass("form-error");
                                                        viewIsValid = false;
                                                        errorMsg = (errorMsg === "" ? validationMsg : errorMsg + "<br>" + validationMsg);
                                                    }
                                                }
                                                catch (ex) {
                                                    $(element).addClass("form-error");
                                                    viewIsValid = false;
                                                    errorMsg = (errorMsg === "" ? ex : errorMsg + "<br>" + ex);
                                                }
                                                break;
                                            case "NEGATION":
                                                var negatationObj = $("#" + ($(element).attr("negationid") ? $(element).attr("negationid") : "000"));
                                                if (negatationObj) {
                                                    var negationValue = $(negatationObj).val();
                                                    if (negationValue === elementValue) {
                                                        $(element).addClass("form-error");
                                                        viewIsValid = false;
                                                        errorMsg = (errorMsg === "" ? validationMsg : errorMsg + "<br>" + validationMsg);
                                                    }
                                                }
                                                else {
                                                    $(element).addClass("form-error");
                                                    viewIsValid = false;
                                                    errorMsg = (errorMsg === "" ? "A Negation ID must be provided for this type of validation!" : errorMsg + "<br>A Negation ID must be provided for this type of validation!");
                                                }
                                                break;
                                            case "MATCH":
                                                var matchObj = $("#" + ($(element).attr("matchid") ? $(element).attr("matchid") : "000"));
                                                if (matchObj) {
                                                    var matchValue = $(matchObj).val();
                                                    if (matchValue !== elementValue) {
                                                        $(element).addClass("form-error");
                                                        viewIsValid = false;
                                                        errorMsg = (errorMsg === "" ? validationMsg : errorMsg + "<br>" + validationMsg);
                                                    }
                                                }
                                                else {
                                                    $(element).addClass("form-error");
                                                    viewIsValid = false;
                                                    errorMsg = (errorMsg === "" ? "A Negation ID must be provided for this type of validation!" : errorMsg + "<br>A Negation ID must be provided for this type of validation!");
                                                }
                                                break;
                                            case "CALLBACK":
                                                var method = ($(element).attr("validationmethod") ? $(element).attr("validationmethod").substring(0, $(element).attr("validationmethod").indexOf("(")) : "0000");
                                                if (currentController.Scope[method] && !currentController.Scope[method](elementValue)) {
                                                    $(element).addClass("form-error");
                                                    viewIsValid = false;
                                                    errorMsg = (errorMsg === "" ? validationMsg : errorMsg + "<br>" + validationMsg);
                                                }
                                                break;
                                            case "REGEX":
                                                var pattern = ($(element).attr("validationpattern") ? $(element).attr("validationpattern") : "(([0-9]|[a-z])\s*){0,}");
                                                var matches = elementValue.match(new RegExp(pattern, "i"));
                                                if (!matches || matches.length <= 0) {
                                                    $(element).addClass("form-error");
                                                    viewIsValid = false;
                                                    errorMsg = (errorMsg === "" ? validationMsg : errorMsg + "<br>" + validationMsg);
                                                }
                                                break;
                                        }
                                    }
                                }
                            }
                            if (!viewIsValid && errorContainer && errorMsgElement) {
                                $(errorMsgElement).addClass("alert-danger");
                                $(errorMsgElement).html(errorMsg);
                                $(errorContainer).show();
                            }
                            return viewIsValid;
                        }
                        else {
                            return true;
                        }
                    }
                    else {
                        return true;
                    }
                };
                var setSuccessMessage = function (view, alertClass, message) {
                    var formValidator = $(view).find('formvalidator');
                    if (formValidator && formValidator.length > 0) {
                        var validationParent = formValidator[0];
                        var errorContainer = ($("#" + $(validationParent).attr("errorcontainerid")) ? $("#" + $(validationParent).attr("errorcontainerid"))[0] : undefined);
                        var errorMsgElement = ($("#" + $(validationParent).attr("errormessageid")) ? $("#" + $(validationParent).attr("errormessageid"))[0] : undefined);
                        if (errorContainer && errorMsgElement) {
                            $(errorMsgElement).removeClass("alert-danger");
                            $(errorMsgElement).removeClass("alert-success");
                            $(errorMsgElement).addClass(alertClass);
                            $(errorMsgElement).html(message);
                            $(errorContainer).show();
                        }
                    }
                };
                that.CreateModalWindow();
                document.documentElement.onscroll = function (ev) {
                    var top = 50 + (document.documentElement.scrollTop === document.body.scrollTop ? document.documentElement.scrollTop : (document.documentElement.scrollTop > 0 && document.body.scrollTop === 0 ? document.documentElement.scrollTop : document.body.scrollTop));
                    var modalContainers = $(".modal-window").toArray();
                    $(".modal-window").each(function () {
                        var element = $(this)[0];
                        if (top < element.offsetTop && element.offsetTop > 50) {
                            element.style.top = top + "px";
                        }
                    });
                };
                //  Create the Success Response Event Handler
                that.SuccessResult = function (success, message) {
                    setSuccessMessage(that.View, (success ? "alert-success" : "alert-danger"), message);
                    if (success) {
                        setTimeout(function () {
                            that.Close();
                        }, 2000);
                    }
                    else {
                        that.ExecuteButton.disabled = false;
                        that.CancelButton.disabled = false;
                    }
                };
                //  Close the Modal Window
                that.Close = function () {
                    if (that.ModalArgs.CancelButtonCallback !== undefined) {
                        that.ModalArgs.CancelButtonCallback(that);
                    }
                    //  Remove the Modal Mask & Modal Window from the DOM
                    var body = document.getElementsByTagName("body")[0];
                    if (body !== undefined) {
                        try {
                            body.removeChild(that.Mask.MaskElement);
                            body.removeChild(that.ModalContainer);
                        }
                        catch (e) {
                        }
                    }
                };
                //  Handle the Cancel Button Click Event
                that.CancelButton.onclick = function (ev) {
                    that.Close();
                };
                //  Handle the Close Button Click Event
                that.ModalClose.onclick = function (ev) {
                    that.Close();
                };
                //  Call the Execution Method
                that.ExecuteButton.onclick = function (ev) {
                    if (that.ModalArgs.ExecuteButtonCallback) {
                        if (that.Validator.FormValid()) {
                            that.ExecuteButton.disabled = true;
                            that.CancelButton.disabled = true;
                            that.ModalArgs.ExecuteButtonCallback(that.SuccessResult);
                        }
                    }
                };
                $(that.ModalContainer).find("input").on("keypress", function (ev) {
                    if (ev.keyCode === 13) {
                        that.ExecuteButton.click();
                    }
                });
            }
            ModalWindow.showDialog = function (view, modalArgs) {
                var modal = new ModalWindow(view, modalArgs);
                var body = document.getElementsByTagName("body")[0];
                var sWidth = modal.GetCssValue(".modal-window ." + modal.ModalArgs.ModalWidth, "width");
                var top = 50 + (document.documentElement.scrollTop === document.body.scrollTop ? document.documentElement.scrollTop : (document.documentElement.scrollTop > 0 && document.body.scrollTop === 0 ? document.documentElement.scrollTop : document.body.scrollTop));
                var width = 0, left = 0;
                try {
                    if (sWidth === "") {
                        width = (body.clientWidth * .50);
                        left = ((body.clientWidth - width) / 2);
                    }
                    else {
                        //  If the width property is a percentage the absolute width
                        //  needs to be calculated
                        if (sWidth.indexOf("%") > 0) {
                            width = (body.clientWidth * parseFloat("." + sWidth.replace("%", "")));
                        }
                        else {
                            width = parseInt(sWidth.replace("px", ""));
                        }
                        //  Center the Modal Window
                        left = ((body.clientWidth - width) / 2);
                    }
                }
                catch (e) {
                    width = (body.clientWidth * .80);
                    left = ((body.clientWidth - width) / 2);
                }
                //  Set the absolute width of the Modal Window
                modal.ModalContainer.style.width = width + "px";
                //  Set the absolute value of the X axis
                modal.ModalContainer.style.left = left + "px";
                //  Set the absolute value of the Y axis
                modal.ModalContainer.style.top = top + "px";
                body.appendChild(modal.Mask.MaskElement);
                body.appendChild(modal.ModalContainer);
            };
            return ModalWindow;
        }(HtmlControl));
        Views.ModalWindow = ModalWindow;
        //  MessageBox
        var MessageBox = (function (_super) {
            __extends(MessageBox, _super);
            function MessageBox(messageHtml, messageTitle, msgboxType, msgboxButtons, modalArgs) {
                var _this = this;
                _super.call(this);
                //  Creates the Modal Window and Prepares it to be Added to the Body
                this.CreateModalWindow = function () {
                    _this.ModalContainer = _this.CreateElement("div", "", ["modal-window", _this.ModalArgs.ModalWidth], undefined);
                    _this.ModalClose = _this.CreateElement("div", '<i class="fa fa-close"></i>', undefined, undefined);
                    var assentText = (_this.MsgBoxButtons === MessageBoxButtonArgs.Ok || _this.MsgBoxButtons === MessageBoxButtonArgs.OkCancel ? "OK" : (_this.MsgBoxButtons === MessageBoxButtonArgs.YesNo ? "Yes" : "OK"));
                    var abortText = (_this.MsgBoxButtons === MessageBoxButtonArgs.OkCancel ? "Cancel" : (_this.MsgBoxButtons === MessageBoxButtonArgs.YesNo ? "No" : "Cancel"));
                    _this.AssentButton = _this.CreateElement("button", assentText, ["btn", "btn-sm", "btn-default", "pull-right"], undefined);
                    _this.AbortButton = _this.CreateElement("button", abortText, ["btn", "btn-sm", "btn-danger", "pull-right"], undefined);
                    //  Created the Modal Title
                    var modalTitle = _this.CreateElement("div", "<span>" + _this.ModalArgs.ModalCaption + "</span>", ["title"], undefined);
                    modalTitle.appendChild(_this.ModalClose);
                    _this.ModalContainer.appendChild(modalTitle);
                    //  Add the View to the Body of the Modal
                    var modalBody = _this.CreateElement("div", "", ["body"], undefined);
                    modalBody.appendChild(_this.View);
                    _this.ModalContainer.appendChild(modalBody);
                    //  Add the Buttons if Required
                    var modalButtons = _this.CreateElement("div", "", ["button"], undefined);
                    if (_this.MsgBoxButtons !== MessageBoxButtonArgs.Ok) {
                        modalButtons.appendChild(_this.AbortButton);
                    }
                    modalButtons.appendChild(_this.AssentButton);
                    _this.ModalContainer.appendChild(modalButtons);
                    //  Created the Modal Footer
                    var modalFooter = _this.CreateElement("div", "&nbsp;", ["footer"], undefined);
                    _this.ModalContainer.appendChild(modalFooter);
                };
                var that = this;
                var createView = function (msg, icon) {
                    var container = that.CreateElement("div", "", ["row"], undefined);
                    var iconClass = (icon === MessageBoxTypeArgs.Information ? "information-icon" : (icon === MessageBoxTypeArgs.Question ? "question-icon" : (icon === MessageBoxTypeArgs.Exclamation ? "exclamation-icon" : "information-icon")));
                    var iconCell = that.CreateElement("div", '<div class="' + iconClass + '">&nbsp;</div>', ["col-md-2"], undefined);
                    var msgCell = that.CreateElement("div", msg, ["col-md-10", "padding-top-10"], undefined);
                    container.appendChild(iconCell);
                    container.appendChild(msgCell);
                    return container;
                };
                that.View = createView(messageHtml, msgboxType);
                that.ModalArgs = modalArgs;
                that.MsgBoxType = msgboxType;
                that.MsgBoxButtons = msgboxButtons;
                that.Mask = new ModalMask("opaque");
                that.CreateModalWindow();
                document.documentElement.onscroll = function (ev) {
                    var top = 50 + (document.documentElement.scrollTop === document.body.scrollTop ? document.documentElement.scrollTop : (document.documentElement.scrollTop > 0 && document.body.scrollTop === 0 ? document.documentElement.scrollTop : document.body.scrollTop));
                    var modalContainers = $(".modal-window").toArray();
                    $(".modal-window").each(function () {
                        var element = $(this)[0];
                        if (top < element.offsetTop && element.offsetTop > 50) {
                            element.style.top = top + "px";
                        }
                    });
                };
                //  Close the Modal Window
                that.Close = function (result) {
                    if (that.ModalArgs.MessageBoxCallback !== undefined) {
                        that.ModalArgs.MessageBoxCallback(result);
                    }
                    //  Remove the Modal Mask & Modal Window from the DOM
                    var body = document.getElementsByTagName("body")[0];
                    if (body !== undefined) {
                        try {
                            body.removeChild(that.Mask.MaskElement);
                            body.removeChild(that.ModalContainer);
                        }
                        catch (e) {
                        }
                    }
                };
                //  Handle the Cancel Button Click Event
                that.AbortButton.onclick = function (ev) {
                    var result = (that.MsgBoxButtons === MessageBoxButtonArgs.Ok || that.MsgBoxButtons === MessageBoxButtonArgs.OkCancel ? MessageBoxResultArgs.Cancel : MessageBoxResultArgs.No);
                    that.Close(result);
                };
                //  Handle the Close Button Click Event
                that.ModalClose.onclick = function (ev) {
                    var result = (that.MsgBoxButtons === MessageBoxButtonArgs.Ok || that.MsgBoxButtons === MessageBoxButtonArgs.OkCancel ? MessageBoxResultArgs.Cancel : MessageBoxResultArgs.No);
                    that.Close(result);
                };
                //  Call the Execution Method
                that.AssentButton.onclick = function (ev) {
                    var result = (that.MsgBoxButtons === MessageBoxButtonArgs.Ok || that.MsgBoxButtons === MessageBoxButtonArgs.OkCancel ? MessageBoxResultArgs.Ok : MessageBoxResultArgs.Yes);
                    that.Close(result);
                };
            }
            MessageBox.showDialog = function (messageHtml, messageTitle, msgboxType, msgboxButtons, modalArgs) {
                var modal = new MessageBox(messageHtml, messageTitle, msgboxType, msgboxButtons, modalArgs);
                var body = document.getElementsByTagName("body")[0];
                var sWidth = modal.GetCssValue(".modal-window ." + modal.ModalArgs.ModalWidth, "width");
                var top = 50 + (document.documentElement.scrollTop === document.body.scrollTop ? document.documentElement.scrollTop : (document.documentElement.scrollTop > 0 && document.body.scrollTop === 0 ? document.documentElement.scrollTop : document.body.scrollTop));
                var width = 0, left = 0;
                try {
                    if (sWidth === "") {
                        width = (body.clientWidth * .50);
                        left = ((body.clientWidth - width) / 2);
                    }
                    else {
                        //  If the width property is a percentage the absolute width
                        //  needs to be calculated
                        if (sWidth.indexOf("%") > 0) {
                            width = (body.clientWidth * parseFloat("." + sWidth.replace("%", "")));
                        }
                        else {
                            width = parseInt(sWidth.replace("px", ""));
                        }
                        //  Center the Modal Window
                        left = ((body.clientWidth - width) / 2);
                    }
                }
                catch (e) {
                    width = (body.clientWidth * .80);
                    left = ((body.clientWidth - width) / 2);
                }
                //  Set the absolute width of the Modal Window
                modal.ModalContainer.style.width = width + "px";
                //  Set the absolute value of the X axis
                modal.ModalContainer.style.left = left + "px";
                //  Set the absolute value of the Y axis
                modal.ModalContainer.style.top = top + "px";
                body.appendChild(modal.Mask.MaskElement);
                body.appendChild(modal.ModalContainer);
            };
            return MessageBox;
        }(HtmlControl));
        Views.MessageBox = MessageBox;
        //  Modal Window Arguments
        var ModalWindowArgs = (function () {
            function ModalWindowArgs(scope, modalWidth, modalCaption, footerText, executionHtml, cancelHtml, showExecuteButton, showCancelButton, executionCallback, cancelCallback) {
                var that = this;
                that.Scope = scope;
                that.ModalWidth = modalWidth;
                that.ModalCaption = modalCaption;
                that.FooterText = footerText;
                that.ExecutionHtml = executionHtml;
                that.CancelHtml = cancelHtml;
                that.ShowExecuteButton = showExecuteButton;
                that.ShowCancelButton = showCancelButton;
                that.ExecuteButtonCallback = executionCallback;
                that.CancelButtonCallback = cancelCallback;
            }
            return ModalWindowArgs;
        }());
        Views.ModalWindowArgs = ModalWindowArgs;
        //  MessageBox Window Arguments
        var MessageBoxWindowArgs = (function () {
            function MessageBoxWindowArgs(scope, modalWidth, modalCaption, msgboxBtns, msgboxCallback) {
                var that = this;
                that.Scope = scope;
                that.ModalWidth = modalWidth;
                that.ModalCaption = modalCaption;
                that.ShowAbortButton = (msgboxBtns === MessageBoxButtonArgs.OkCancel || msgboxBtns === MessageBoxButtonArgs.YesNo);
                that.MessageBoxCallback = msgboxCallback;
            }
            return MessageBoxWindowArgs;
        }());
        Views.MessageBoxWindowArgs = MessageBoxWindowArgs;
        //  Validates the Input Fields Based on the Values on the Validation Attributes
        var ViewValidator = (function () {
            function ViewValidator(view, scope) {
                var that = this;
                that.View = view;
                that.Scope = scope;
                that.CanValidate = false;
                that.Fields = new Array();
                if (that.View) {
                    that.CanValidate = ($(that.View).find('formvalidator') && $(that.View).find('formvalidator').length > 0);
                    if (that.CanValidate === true) {
                        var validationParent = $(that.View).find('formvalidator')[0];
                        var errorContainerAttribute = $(validationParent).attr("errorcontainerid");
                        var errorMessageAttribute = $(validationParent).attr("errormessageid");
                        that.ErrorContainer = ($(that.View).find('[id="' + errorContainerAttribute + '"]') && $(that.View).find('[id="' + errorContainerAttribute + '"]').length > 0 ? $(that.View).find('[id="' + errorContainerAttribute + '"]')[0] : undefined);
                        that.ErrorMessage = ($(that.View).find('[id="' + errorMessageAttribute + '"]') && $(that.View).find('[id="' + errorMessageAttribute + '"]').length > 0 ? $(that.View).find('[id="' + errorMessageAttribute + '"]')[0] : undefined);
                        //  Clear the Alert Message
                        if (that.ErrorMessage) {
                            $(that.ErrorMessage).removeClass("alert-danger");
                            $(that.ErrorMessage).removeClass("alert-warning");
                            $(that.ErrorMessage).removeClass("alert-success");
                            $(that.ErrorMessage).html("");
                        }
                        //  Hide the Error Container
                        if (that.ErrorContainer) {
                            $(that.ErrorContainer).hide();
                        }
                        //  Get the Fields to be Validated
                        var validationChildren = $(validationParent).find('[validation]').toArray();
                        if (validationChildren && validationChildren.length > 0) {
                            validationChildren.forEach(function (child) {
                                var field = new ValidationField(child, that.Scope, that.View);
                                that.Fields.push(field);
                            });
                        }
                        else {
                            that.CanValidate = false;
                        }
                    }
                }
                //  Determine if the Form Can be Validated, and if so Validate Based on the Values of the Validation Fields
                that.FormValid = function () {
                    if (that.CanValidate === true) {
                        var msg = new ValidationMessage();
                        try {
                            that.Fields.forEach(function (fld) {
                                var m = fld.GetValidationResult();
                                $(fld.Field).removeClass("form-error");
                                if (m.IsValid === false) {
                                    $(fld.Field).addClass("form-error");
                                    msg.IsValid = false;
                                    msg.Message = (msg.Message === "" ? m.Message : msg.Message + "<br>" + m.Message);
                                }
                            });
                            if (msg.IsValid === false && that.ErrorContainer && that.ErrorMessage) {
                                $(that.ErrorMessage).addClass("alert-danger");
                                $(that.ErrorMessage).html(msg.Message);
                                $(that.ErrorContainer).show();
                            }
                            return msg.IsValid;
                        }
                        catch (err) {
                            return false;
                        }
                    }
                    else {
                        return true;
                    }
                };
            }
            return ViewValidator;
        }());
        Views.ViewValidator = ViewValidator;
        //  Represents an Individual Field to be Validated
        var ValidationField = (function () {
            function ValidationField(field, scope, view) {
                //  Gets the Value of the Named Parameter
                this.GetParameterValue = function (name, params) {
                    //  Rules & Messages Can Have Multiple Values. If Found Return string Array
                    if (name.toUpperCase() === "RULE" || name.toUpperCase() === "MESSAGE") {
                        for (var i = 0; i < params.length; i++) {
                            var param = params[i].split(":");
                            if (param && param.length === 2) {
                                if (param[0].trim().toUpperCase() === name.toUpperCase()) {
                                    return param[1].trim().split(",");
                                }
                            }
                        }
                    }
                    //  Min, Max, Negation ID, Match ID, Method, Pattern, and Data Type Can Only Have a Single Value
                    for (var i = 0; i < params.length; i++) {
                        var param = params[i].split(":");
                        if (param && param.length === 2) {
                            if (param[0].trim().toUpperCase() === name.toUpperCase()) {
                                return param[1].trim();
                            }
                        }
                    }
                    return undefined;
                };
                var that = this;
                that.Field = field;
                that.Scope = scope;
                that.Rules = new Array();
                that.Messages = new Array();
                var validationParameters = $(that.Field).attr("validation").split(";");
                if (validationParameters && validationParameters.length > 0) {
                    var ruleValues = that.GetParameterValue("RULE", validationParameters);
                    var messageValues = that.GetParameterValue("MESSAGE", validationParameters);
                    var minValue = that.GetParameterValue("MIN", validationParameters);
                    var maxValue = that.GetParameterValue("MAX", validationParameters);
                    var negationValue = that.GetParameterValue("NEGATIONID", validationParameters);
                    var matchValue = that.GetParameterValue("MATCHID", validationParameters);
                    var methodValue = that.GetParameterValue("METHOD", validationParameters);
                    var patternValue = that.GetParameterValue("PATTERN", validationParameters);
                    var dataTypeValue = that.GetParameterValue("DATATYPE", validationParameters);
                    //  If Rules & Messages were found, and their lengths are equal, we can begin creating our validation rules
                    if ((ruleValues && messageValues) && (ruleValues.length > 0 && messageValues.length > 0) && (ruleValues.length === messageValues.length)) {
                        for (var i = 0; i < ruleValues.length; i++) {
                            var r = ruleValues[i].trim().toUpperCase();
                            var m = messageValues[i].trim();
                            var rule;
                            switch (r) {
                                case "RANGE":
                                    rule = new RangeValidationRule(dataTypeValue);
                                    rule.SetMin(minValue);
                                    rule.SetMax(maxValue);
                                    break;
                                case "NEGATION":
                                    negationValue = (negationValue ? negationValue : "");
                                    rule = new NegationValidationRule(dataTypeValue, ($(view).find("#" + negationValue) && $(view).find("#" + negationValue).length > 0 ? $(view).find("#" + negationValue)[0] : undefined));
                                    break;
                                case "MATCH":
                                    matchValue = (matchValue ? matchValue : "");
                                    rule = new MatchValidationRule(dataTypeValue, ($(view).find("#" + matchValue) && $(view).find("#" + matchValue).length > 0 ? $(view).find("#" + matchValue)[0] : undefined));
                                    break;
                                case "CALLBACK":
                                    methodValue = (methodValue ? methodValue : "");
                                    rule = new CallbackValidationRule(dataTypeValue, that.Scope, methodValue);
                                    break;
                                case "REGEX":
                                    patternValue = (patternValue ? patternValue : "(([0-9]|[a-z])\s*){0,}");
                                    rule = new RegExValidationRule(patternValue);
                                    break;
                            }
                            if (rule !== undefined && rule.IsValid !== undefined) {
                                that.Rules.push(rule);
                                that.Messages.push(m);
                            }
                        }
                    }
                }
                that.GetValidationResult = function () {
                    var msg = new ValidationMessage();
                    for (var i = 0; i < that.Rules.length; i++) {
                        var rule = that.Rules[i];
                        rule.SetValue(getFieldValue(that.Field));
                        if (!rule.IsValid() === true) {
                            msg.IsValid = false;
                            msg.Message = (msg.Message === "" ? that.Messages[i] : msg.Message + "<br>" + that.Messages[i]);
                        }
                    }
                    return msg;
                };
                //  Used to Get the Field Value Based on Form Field Type
                var getFieldValue = function (el) {
                    if (el === undefined) {
                        return undefined;
                    }
                    switch (el.tagName.toUpperCase()) {
                        case "SELECT":
                            return $(el).val();
                        case "INPUT":
                            var tagType = el.type;
                            if (tagType.toUpperCase() === "CHECKBOX") {
                                return $(el).prop('checked');
                            }
                            else {
                                return $(el).val();
                            }
                        case "TEXTAREA":
                            return $(el).val();
                    }
                };
            }
            return ValidationField;
        }());
        Views.ValidationField = ValidationField;
        //  Provides the Interface for Determining Field Validation Results
        var ValidationMessage = (function () {
            function ValidationMessage() {
                var that = this;
                that.IsValid = true;
                that.Message = "";
            }
            return ValidationMessage;
        }());
        Views.ValidationMessage = ValidationMessage;
        //  Used to Validate the Field Against a Numeric Range
        var RangeValidationRule = (function () {
            function RangeValidationRule(dataType) {
                var that = this, MinValue = 0, MaxValue = 100, MaxValueUnlimited = false, FieldValue = -1;
                var dataTypes = KrodSpa.DataTypeCollection.Instance();
                //  Ensures the Data Type is properly defined and sets the DataType value
                that.DataType = (dataTypes[dataType.toUpperCase()] !== undefined ? dataTypes[dataType.toUpperCase()] : KrodSpa.DataTypeArgs.Int);
                //  Ensures the Data Type is properly defined and sets the min value
                that.SetMin = function (min) {
                    if (!isNaN((that.DataType === KrodSpa.DataTypeArgs.Int ? parseInt(min) : parseFloat(min)))) {
                        MinValue = (that.DataType === KrodSpa.DataTypeArgs.Int ? parseInt(min) : parseFloat(min));
                    }
                    else {
                        MinValue = 0;
                    }
                };
                //  Ensures the Data Type is properly defined and sets the max value
                that.SetMax = function (max) {
                    if (max === "*") {
                        MaxValueUnlimited = true;
                        return;
                    }
                    if (!isNaN((that.DataType === KrodSpa.DataTypeArgs.Int ? parseInt(max) : parseFloat(max)))) {
                        MaxValue = (that.DataType === KrodSpa.DataTypeArgs.Int ? parseInt(max) : parseFloat(max));
                    }
                    else {
                        MaxValue = 100;
                    }
                };
                //  Ensures the Data Type is properly defined and sets the field value
                that.SetValue = function (value) {
                    if (!isNaN((that.DataType === KrodSpa.DataTypeArgs.Int ? parseInt(value) : parseFloat(value)))) {
                        FieldValue = (that.DataType === KrodSpa.DataTypeArgs.Int ? parseInt(value) : parseFloat(value));
                    }
                    else {
                        FieldValue = MinValue - 1;
                    }
                };
                //  Validates the Field Value against the values in MinValue and MaxValue
                that.IsValid = function () {
                    if (FieldValue < MinValue || FieldValue > (MaxValueUnlimited === true ? (FieldValue + MinValue + 10) : MaxValue)) {
                        return false;
                    }
                    return true;
                };
            }
            return RangeValidationRule;
        }());
        Views.RangeValidationRule = RangeValidationRule;
        //  Used to Ensure the Field Value IS NOT Equal to the Value of Another Field
        var NegationValidationRule = (function () {
            function NegationValidationRule(dataType, negationObj) {
                var that = this, FieldValue = undefined;
                //  Ensures the Data Type is properly defined and sets the min value
                that.DataType = (KrodSpa.DataTypeCollection.Instance[dataType.toUpperCase()] ? KrodSpa.DataTypeCollection.Instance[dataType.toUpperCase()] : KrodSpa.DataTypeArgs.String);
                that.NegationObj = negationObj;
                //  Ensures the Data Type is properly defined and sets the field value
                that.SetValue = function (value) {
                    //  Numeric Field
                    if (that.DataType === KrodSpa.DataTypeArgs.Int || that.DataType === KrodSpa.DataTypeArgs.Float) {
                        if ((that.DataType === KrodSpa.DataTypeArgs.Int ? parseInt(value) : parseFloat(value)) !== NaN) {
                            FieldValue = (that.DataType === KrodSpa.DataTypeArgs.Int ? parseInt(value) : parseFloat(value));
                        }
                    }
                    //  Date/Time Field
                    if (that.DataType === KrodSpa.DataTypeArgs.Date || that.DataType === KrodSpa.DataTypeArgs.Time || that.DataType === KrodSpa.DataTypeArgs.DateTime) {
                        var date = new Date(value);
                        if (date.toDateString() !== "Invalid Date") {
                            var month = date.getMonth() + 1, day = date.getDate(), year = date.getFullYear(), hour = (date.getHours() > 12 ? date.getHours() - 12 : (date.getHours() == 0 ? 12 : date.getHours())), minutes = date.getMinutes(), meridian = (date.getHours() >= 12 ? "PM" : "AM");
                            if (that.DataType === KrodSpa.DataTypeArgs.Date) {
                                FieldValue = new String(('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year));
                            }
                            if (that.DataType === KrodSpa.DataTypeArgs.Time) {
                                FieldValue = new String(('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian);
                            }
                            if (that.DataType === KrodSpa.DataTypeArgs.DateTime) {
                                FieldValue = new String(('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year) + ' ' + ('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian);
                            }
                        }
                    }
                    //  Boolean Field
                    if (that.DataType === KrodSpa.DataTypeArgs.Boolean) {
                        if (typeof value === "object" && Object.prototype.toString.call(value) === "[object Boolean]") {
                            FieldValue = new Boolean(value);
                        }
                        if ((value === 'true') === true || (value === 'false') === true) {
                            FieldValue = new Boolean(value);
                        }
                    }
                    //  String Field
                    if (that.DataType === KrodSpa.DataTypeArgs.String) {
                        FieldValue = new String(value);
                    }
                };
                //  Validates the Field Value against the Negation Element Value
                that.IsValid = function () {
                    if (that.NegationObj) {
                        var negationObjValue = $(that.NegationObj).val(), negationValue = undefined, currentValue = undefined;
                        //  Numeric Field
                        if (that.DataType === KrodSpa.DataTypeArgs.Int || that.DataType === KrodSpa.DataTypeArgs.Float) {
                            if ((that.DataType === KrodSpa.DataTypeArgs.Int ? parseInt(negationObjValue) : parseFloat(negationObjValue)) !== NaN) {
                                negationValue = (that.DataType === KrodSpa.DataTypeArgs.Int ? parseInt(negationObjValue) : parseFloat(negationObjValue));
                                currentValue = (that.DataType === KrodSpa.DataTypeArgs.Int ? parseInt(FieldValue) : parseFloat(FieldValue));
                            }
                        }
                        //  Date/Time Field
                        if (that.DataType === KrodSpa.DataTypeArgs.Date || that.DataType === KrodSpa.DataTypeArgs.Time || that.DataType === KrodSpa.DataTypeArgs.DateTime) {
                            var date = new Date(negationObjValue);
                            if (date.toDateString() !== "Invalid Date") {
                                var month = date.getMonth() + 1, day = date.getDate(), year = date.getFullYear(), hour = (date.getHours() > 12 ? date.getHours() - 12 : (date.getHours() == 0 ? 12 : date.getHours())), minutes = date.getMinutes(), meridian = (date.getHours() >= 12 ? "PM" : "AM");
                                if (that.DataType === KrodSpa.DataTypeArgs.Date) {
                                    negationValue = new String(('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year));
                                }
                                if (that.DataType === KrodSpa.DataTypeArgs.Time) {
                                    negationValue = new String(('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian);
                                }
                                if (that.DataType === KrodSpa.DataTypeArgs.DateTime) {
                                    negationValue = new String(('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year) + ' ' + ('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian);
                                }
                                currentValue = new String(FieldValue);
                            }
                        }
                        //  Boolean Field
                        if (that.DataType === KrodSpa.DataTypeArgs.Boolean) {
                            if (typeof negationObjValue === "object" && Object.prototype.toString.call(negationObjValue) === "[object Boolean]") {
                                negationValue = new Boolean(negationObjValue);
                                currentValue = new Boolean(FieldValue);
                            }
                            if ((negationObjValue === 'true') === true || (negationObjValue === 'false') === true) {
                                negationValue = new Boolean(negationObjValue);
                                currentValue = new Boolean(FieldValue);
                            }
                        }
                        //  String Field
                        if (that.DataType === KrodSpa.DataTypeArgs.String) {
                            negationValue = new String(negationObjValue);
                            currentValue = new String(FieldValue);
                        }
                        if (currentValue !== undefined && negationValue !== undefined) {
                            return (currentValue.valueOf() !== negationValue.valueOf());
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        return false;
                    }
                };
            }
            return NegationValidationRule;
        }());
        Views.NegationValidationRule = NegationValidationRule;
        //  Used to Ensure the Field Value IS Equal to the Value of Another Field
        var MatchValidationRule = (function () {
            function MatchValidationRule(dataType, matchObj) {
                var that = this, FieldValue = undefined;
                //  Ensures the Data Type is properly defined and sets the min value
                that.DataType = (KrodSpa.DataTypeCollection.Instance[dataType.toUpperCase()] ? KrodSpa.DataTypeCollection.Instance[dataType.toUpperCase()] : KrodSpa.DataTypeArgs.String);
                that.MatchObj = matchObj;
                //  Ensures the Data Type is properly defined and sets the field value
                that.SetValue = function (value) {
                    //  Numeric Field
                    if (that.DataType === KrodSpa.DataTypeArgs.Int || that.DataType === KrodSpa.DataTypeArgs.Float) {
                        if ((that.DataType === KrodSpa.DataTypeArgs.Int ? parseInt(value) : parseFloat(value)) !== NaN) {
                            FieldValue = (that.DataType === KrodSpa.DataTypeArgs.Int ? parseInt(value) : parseFloat(value));
                        }
                    }
                    //  Date/Time Field
                    if (that.DataType === KrodSpa.DataTypeArgs.Date || that.DataType === KrodSpa.DataTypeArgs.Time || that.DataType === KrodSpa.DataTypeArgs.DateTime) {
                        var date = new Date(value);
                        if (date.toDateString() !== "Invalid Date") {
                            var month = date.getMonth() + 1, day = date.getDate(), year = date.getFullYear(), hour = (date.getHours() > 12 ? date.getHours() - 12 : (date.getHours() == 0 ? 12 : date.getHours())), minutes = date.getMinutes(), meridian = (date.getHours() >= 12 ? "PM" : "AM");
                            if (that.DataType === KrodSpa.DataTypeArgs.Date) {
                                FieldValue = new String(('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year));
                            }
                            if (that.DataType === KrodSpa.DataTypeArgs.Time) {
                                FieldValue = new String(('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian);
                            }
                            if (that.DataType === KrodSpa.DataTypeArgs.DateTime) {
                                FieldValue = new String(('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year) + ' ' + ('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian);
                            }
                        }
                    }
                    //  Boolean Field
                    if (that.DataType === KrodSpa.DataTypeArgs.Boolean) {
                        if (typeof value === "object" && Object.prototype.toString.call(value) === "[object Boolean]") {
                            FieldValue = new Boolean(value);
                        }
                        if ((value === 'true') === true || (value === 'false') === true) {
                            FieldValue = new Boolean(value);
                        }
                    }
                    //  String Field
                    if (that.DataType === KrodSpa.DataTypeArgs.String) {
                        FieldValue = new String(value);
                    }
                };
                //  Validates the Field Value against the Match Element Value
                that.IsValid = function () {
                    if (that.MatchObj) {
                        var matchObjValue = $(that.MatchObj).val(), matchValue = undefined, currentValue = undefined;
                        //  Numeric Field
                        if (that.DataType === KrodSpa.DataTypeArgs.Int || that.DataType === KrodSpa.DataTypeArgs.Float) {
                            if ((that.DataType === KrodSpa.DataTypeArgs.Int ? parseInt(matchObjValue) : parseFloat(matchObjValue)) !== NaN) {
                                matchValue = (that.DataType === KrodSpa.DataTypeArgs.Int ? parseInt(matchObjValue) : parseFloat(matchObjValue));
                                currentValue = (that.DataType === KrodSpa.DataTypeArgs.Int ? parseInt(FieldValue) : parseFloat(FieldValue));
                            }
                        }
                        //  Date/Time Field
                        if (that.DataType === KrodSpa.DataTypeArgs.Date || that.DataType === KrodSpa.DataTypeArgs.Time || that.DataType === KrodSpa.DataTypeArgs.DateTime) {
                            var date = new Date(matchObjValue);
                            if (date.toDateString() !== "Invalid Date") {
                                var month = date.getMonth() + 1, day = date.getDate(), year = date.getFullYear(), hour = (date.getHours() > 12 ? date.getHours() - 12 : (date.getHours() == 0 ? 12 : date.getHours())), minutes = date.getMinutes(), meridian = (date.getHours() >= 12 ? "PM" : "AM");
                                if (that.DataType === KrodSpa.DataTypeArgs.Date) {
                                    matchValue = new String(('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year));
                                }
                                if (that.DataType === KrodSpa.DataTypeArgs.Time) {
                                    matchValue = new String(('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian);
                                }
                                if (that.DataType === KrodSpa.DataTypeArgs.DateTime) {
                                    matchValue = new String(('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year) + ' ' + ('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian);
                                }
                                currentValue = new String(FieldValue);
                            }
                        }
                        //  Boolean Field
                        if (that.DataType === KrodSpa.DataTypeArgs.Boolean) {
                            if (typeof matchObjValue === "object" && Object.prototype.toString.call(matchObjValue) === "[object Boolean]") {
                                matchValue = new Boolean(matchObjValue);
                                currentValue = new Boolean(FieldValue);
                            }
                            if ((matchObjValue === 'true') === true || (matchObjValue === 'false') === true) {
                                matchValue = new Boolean(matchObjValue);
                                currentValue = new Boolean(FieldValue);
                            }
                        }
                        //  String Field
                        if (that.DataType === KrodSpa.DataTypeArgs.String) {
                            matchValue = new String(matchObjValue);
                            currentValue = new String(FieldValue);
                        }
                        if (currentValue !== undefined && matchValue !== undefined) {
                            return (currentValue.valueOf() === matchValue.valueOf());
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        return false;
                    }
                };
            }
            return MatchValidationRule;
        }());
        Views.MatchValidationRule = MatchValidationRule;
        //  Used to Call the Method as Defined in Scope to Validate the Field
        var CallbackValidationRule = (function () {
            function CallbackValidationRule(dataType, scope, validationMethod) {
                var that = this, FieldValue = undefined;
                //  Ensures the Data Type is properly defined and sets the min value
                that.DataType = (KrodSpa.DataTypeCollection.Instance[dataType.toUpperCase()] ? KrodSpa.DataTypeCollection.Instance[dataType.toUpperCase()] : KrodSpa.DataTypeArgs.String);
                that.Scope = scope;
                that.ValidationMethod = validationMethod;
                //  Ensures the Data Type is properly defined and sets the field value
                that.SetValue = function (value) {
                    //  Numeric Field
                    if (that.DataType === KrodSpa.DataTypeArgs.Int || that.DataType === KrodSpa.DataTypeArgs.Float) {
                        if ((that.DataType === KrodSpa.DataTypeArgs.Int ? parseInt(value) : parseFloat(value)) !== NaN) {
                            FieldValue = (that.DataType === KrodSpa.DataTypeArgs.Int ? parseInt(value) : parseFloat(value));
                        }
                    }
                    //  Date/Time Field
                    if (that.DataType === KrodSpa.DataTypeArgs.Date || that.DataType === KrodSpa.DataTypeArgs.Time || that.DataType === KrodSpa.DataTypeArgs.DateTime) {
                        var date = new Date(value);
                        if (date.toDateString() !== "Invalid Date") {
                            var month = date.getMonth() + 1, day = date.getDate(), year = date.getFullYear(), hour = (date.getHours() > 12 ? date.getHours() - 12 : (date.getHours() == 0 ? 12 : date.getHours())), minutes = date.getMinutes(), meridian = (date.getHours() >= 12 ? "PM" : "AM");
                            if (that.DataType === KrodSpa.DataTypeArgs.Date) {
                                FieldValue = new String(('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year));
                            }
                            if (that.DataType === KrodSpa.DataTypeArgs.Time) {
                                FieldValue = new String(('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian);
                            }
                            if (that.DataType === KrodSpa.DataTypeArgs.DateTime) {
                                FieldValue = new String(('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year) + ' ' + ('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian);
                            }
                        }
                    }
                    //  Boolean Field
                    if (that.DataType === KrodSpa.DataTypeArgs.Boolean) {
                        if (typeof value === "object" && Object.prototype.toString.call(value) === "[object Boolean]") {
                            FieldValue = new Boolean(value);
                        }
                        if ((value === 'true') === true || (value === 'false') === true) {
                            FieldValue = new Boolean(value);
                        }
                    }
                    //  String Field
                    if (that.DataType === KrodSpa.DataTypeArgs.String) {
                        FieldValue = new String(value);
                    }
                };
                //  Validates the Field Value against the Match Element Value
                that.IsValid = function () {
                    if (that.Scope && that.Scope[that.ValidationMethod]) {
                        return (that.Scope[that.ValidationMethod](FieldValue) === true);
                    }
                    else {
                        return false;
                    }
                };
            }
            return CallbackValidationRule;
        }());
        Views.CallbackValidationRule = CallbackValidationRule;
        //  Used to Validate the Field Value Against a Regular Expression Pattern
        var RegExValidationRule = (function () {
            function RegExValidationRule(validationPattern) {
                var that = this, FieldValue = "";
                that.ValidationPattern = validationPattern;
                //  Ensures the Data Type is properly defined and sets the field value
                that.SetValue = function (value) {
                    if (value === undefined) {
                        FieldValue = "";
                    }
                    else {
                        FieldValue = value;
                    }
                };
                //  Validates the Field Value against the Regular Expressing Pattern in ValidationPattern
                that.IsValid = function () {
                    var matches = FieldValue.match(new RegExp(that.ValidationPattern, "i"));
                    return (matches !== undefined && matches !== null && matches.length > 0);
                };
            }
            return RegExValidationRule;
        }());
        Views.RegExValidationRule = RegExValidationRule;
        //  Modal Mask
        var ModalMask = (function () {
            function ModalMask(bgClass) {
                var that = this;
                that.MaskElement = document.createElement("div");
                that.MaskElement.classList.add("modal-mask");
                that.MaskElement.classList.add(bgClass);
            }
            return ModalMask;
        }());
        Views.ModalMask = ModalMask;
        //  Menu Item Command Type
        (function (MenuItemCommandTypeArgs) {
            MenuItemCommandTypeArgs[MenuItemCommandTypeArgs["URL"] = 1] = "URL";
            MenuItemCommandTypeArgs[MenuItemCommandTypeArgs["Hash"] = 2] = "Hash";
            MenuItemCommandTypeArgs[MenuItemCommandTypeArgs["Method"] = 3] = "Method";
        })(Views.MenuItemCommandTypeArgs || (Views.MenuItemCommandTypeArgs = {}));
        var MenuItemCommandTypeArgs = Views.MenuItemCommandTypeArgs;
        //  Context Menu Item
        var MenuItem = (function () {
            function MenuItem(item) {
                var that = this;
                if (item !== undefined) {
                    try {
                        that.MenuItemID = item.MenuItemID;
                        that.MenuGroup = item.MenuGroup;
                        that.ControlID = item.ControlID;
                        that.ApplySeparator = item.ApplySeparator;
                        that.Controller = item.Controller;
                        that.CommandType = item.CommandType;
                        that.Command = item.Command;
                        that.MenuIcon = item.MenuIcon;
                        that.LabelText = item.LabelText;
                        that.IsActive = item.IsActive;
                        that.CreatedBy = item.CreatedBy;
                        that.DateCreated = Krodzone.KrodzoneDate.toDateTimeString(new Date(item.DateCreated));
                        that.UpdatedBy = item.UpdatedBy;
                        that.DateUpdated = Krodzone.KrodzoneDate.toDateTimeString(new Date(item.DateUpdated));
                    }
                    catch (e) {
                        that.MenuItemID = 0;
                        that.MenuGroup = "";
                        that.ControlID = "";
                        that.ApplySeparator = false;
                        that.Controller = "";
                        that.CommandType = MenuItemCommandTypeArgs.Hash;
                        that.Command = "";
                        that.MenuIcon = "";
                        that.LabelText = "";
                        that.IsActive = true;
                        that.CreatedBy = 0;
                        that.DateCreated = Krodzone.KrodzoneDate.toDateTimeString(new Date());
                        that.UpdatedBy = 0;
                        that.DateUpdated = Krodzone.KrodzoneDate.toDateTimeString(new Date());
                    }
                }
                else {
                    that.MenuItemID = 0;
                    that.MenuGroup = "";
                    that.ControlID = "";
                    that.ApplySeparator = false;
                    that.Controller = "";
                    that.CommandType = MenuItemCommandTypeArgs.Hash;
                    that.Command = "";
                    that.MenuIcon = "";
                    that.LabelText = "";
                    that.IsActive = true;
                    that.CreatedBy = 0;
                    that.DateCreated = Krodzone.KrodzoneDate.toDateTimeString(new Date());
                    that.UpdatedBy = 0;
                    that.DateUpdated = Krodzone.KrodzoneDate.toDateTimeString(new Date());
                }
                that.toLineItem = function () {
                    var lineItem = document.createElement("li");
                    var anchor = document.createElement("a");
                    var icon = '<i class="fa ' + that.MenuIcon + '"></i>&nbsp;&nbsp;';
                    switch (that.CommandType) {
                        case MenuItemCommandTypeArgs.Hash:
                            anchor.href = that.Command;
                            break;
                        case MenuItemCommandTypeArgs.URL:
                            anchor.href = that.Command;
                            break;
                        case MenuItemCommandTypeArgs.Method:
                            $(anchor).css("cursor", "pointer");
                            break;
                    }
                    if (that.ApplySeparator === true) {
                        $(lineItem).addClass("mnu-separator");
                    }
                    anchor.innerHTML = icon + that.LabelText;
                    lineItem.id = that.ControlID;
                    lineItem.appendChild(anchor);
                    return lineItem;
                };
            }
            MenuItem.toArray = function (data) {
                var items = new Array();
                if (data !== undefined) {
                    var results;
                    try {
                        results = (typeof data === 'string' ? JSON.parse(data) : data);
                    }
                    catch (e) {
                        results = undefined;
                    }
                    if (results !== undefined && results.length !== undefined) {
                        for (var i = 0; i < results.length; i++) {
                            var item = new MenuItem(results[i]);
                            items.push(item);
                        }
                    }
                }
                return items;
            };
            return MenuItem;
        }());
        Views.MenuItem = MenuItem;
        //  Context Menu Callback Args
        var ContextMenuCallbackArgs = (function () {
            function ContextMenuCallbackArgs(sender, model) {
                var that = this;
                that.Sender = sender;
                that.Model = model;
            }
            return ContextMenuCallbackArgs;
        }());
        Views.ContextMenuCallbackArgs = ContextMenuCallbackArgs;
        var ContextMenuCallback = (function () {
            function ContextMenuCallback(elementID, callback) {
                var that = this;
                that.ElementID = elementID;
                that.ItemCallback = callback;
            }
            return ContextMenuCallback;
        }());
        Views.ContextMenuCallback = ContextMenuCallback;
        var ContextMenu = (function (_super) {
            __extends(ContextMenu, _super);
            function ContextMenu(menuItems, model) {
                _super.call(this);
                this.CreateMenu = function (items) {
                    var menu = document.createElement("div");
                    if (items !== undefined && items.length > 0) {
                        var ul = document.createElement("ul");
                        items.forEach(function (item) {
                            ul.appendChild(item.toLineItem());
                        });
                        menu.appendChild(ul);
                    }
                    else {
                        $(menu).css("text-align", "center");
                        $(menu).html("<h4>Unable to Create Menu</h4>");
                    }
                    return menu;
                };
                var that = this, showingMenu = false;
                that.Model = model;
                that.MenuItems = menuItems;
                document.getElementsByTagName("body")[0].onclick = function (ev) {
                    setTimeout(function () {
                        if (!showingMenu) {
                            if ($("body").find(that.Menu).length) {
                                document.getElementsByTagName("body")[0].removeChild(that.Menu);
                            }
                        }
                        else {
                            showingMenu = false;
                        }
                    }, 100);
                };
                that.ShowMenu = function (ctl) {
                    //showingMenu = true;
                    if ($("body").find("context-menu").length) {
                        document.getElementsByTagName("body")[0].removeChild($("context-menu")[0]);
                    }
                    setTimeout(function () {
                        var location = that.GetElementCoordinates(ctl);
                        $(that.Menu).css("position", "absolute");
                        $(that.Menu).css("left", location.X);
                        $(that.Menu).css("top", location.Y);
                        $(that.Menu).css("display", "block");
                        document.getElementsByTagName("body")[0].appendChild(that.Menu);
                    }, 200);
                };
                that.Menu = document.createElement("context-menu");
                that.Menu.appendChild(that.CreateMenu(that.MenuItems));
                if (that.MenuItems !== undefined && that.MenuItems.length > 0) {
                    for (var i = 0; i < that.MenuItems.length; i++) {
                        (function (idx) {
                            var item = that.MenuItems[idx];
                            if (item.CommandType === MenuItemCommandTypeArgs.Method) {
                                if ($(that.Menu).find('[id="' + item.ControlID + '"]').length) {
                                    $(that.Menu).find('[id="' + item.ControlID + '"]').on("click", function (ev) {
                                        if (KrodSpa.Application.Applications !== undefined && KrodSpa.Application.Applications.length > 0) {
                                            KrodSpa.Application.Applications.forEach(function (application) {
                                                var itemController = controllerFetcher(item.Controller, application.Controllers);
                                                if (itemController !== undefined) {
                                                    itemController.Scope[item.Command](that);
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        })(i);
                    }
                }
            }
            return ContextMenu;
        }(HtmlControl));
        Views.ContextMenu = ContextMenu;
    })(Views = KrodSpa.Views || (KrodSpa.Views = {}));
})(KrodSpa || (KrodSpa = {}));
var Krodzone;
(function (Krodzone) {
    (function (DayOfWeek) {
        DayOfWeek[DayOfWeek["Sunday"] = 0] = "Sunday";
        DayOfWeek[DayOfWeek["Monday"] = 1] = "Monday";
        DayOfWeek[DayOfWeek["Tuesday"] = 2] = "Tuesday";
        DayOfWeek[DayOfWeek["Wednesday"] = 3] = "Wednesday";
        DayOfWeek[DayOfWeek["Thursday"] = 4] = "Thursday";
        DayOfWeek[DayOfWeek["Friday"] = 5] = "Friday";
        DayOfWeek[DayOfWeek["Saturday"] = 6] = "Saturday";
    })(Krodzone.DayOfWeek || (Krodzone.DayOfWeek = {}));
    var DayOfWeek = Krodzone.DayOfWeek;
    var KrodzoneDate = (function () {
        function KrodzoneDate(startDate) {
            if (!KrodzoneDate.dateValid(startDate)) {
                startDate = new Date();
            }
            this.CurrentDate = startDate;
            this.Month = this.CurrentDate.getMonth() + 1;
            this.Day = this.CurrentDate.getDate();
            this.Year = this.CurrentDate.getFullYear();
            this.DOW = this.CurrentDate.getDay();
            this.CurrentTime = new KrodzoneTime(startDate);
        }
        KrodzoneDate.prototype.setDate = function (dat) {
            if (KrodzoneDate.dateValid(dat)) {
                this.CurrentDate = dat;
                this.Month = this.CurrentDate.getMonth() + 1;
                this.Day = this.CurrentDate.getDate();
                this.Year = this.CurrentDate.getFullYear();
                this.DOW = this.CurrentDate.getDay();
                this.CurrentTime.setTime(this.CurrentDate);
            }
        };
        KrodzoneDate.prototype.toShortDateString = function () {
            return ('0' + this.Month).slice(-2) + '/' + ('0' + this.Day).slice(-2) + '/' + String(this.Year);
        };
        KrodzoneDate.prototype.toDateTimeString = function () {
            return this.toShortDateString() + ' ' + this.CurrentTime.toTimeString();
        };
        KrodzoneDate.prototype.toString = function () {
            return "KrodzoneDate (" + this.toShortDateString() + ")";
        };
        KrodzoneDate.toShortDateString = function (date) {
            if (!KrodzoneDate.dateValid(date)) {
                date = new Date();
            }
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var year = date.getFullYear();
            return ('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year);
        };
        KrodzoneDate.toDateTimeString = function (date) {
            if (!KrodzoneDate.dateValid(date)) {
                date = new Date();
            }
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var year = date.getFullYear();
            var hour = (date.getHours() > 12 ? date.getHours() - 12 : (date.getHours() == 0 ? 12 : date.getHours()));
            var minutes = date.getMinutes();
            var meridian = (date.getHours() >= 12 ? "PM" : "AM");
            return ('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year) + ' ' + ('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian;
        };
        KrodzoneDate.dateDiff = function (part, dat1, dat2) {
            if (!KrodzoneDate.dateValid(dat1) || !KrodzoneDate.dateValid(dat2)) {
                return -1;
            }
            switch (part) {
                case "DAY":
                    var totalDays1 = Math.ceil(((dat1.getFullYear() - 1900) * 365.25) + dat1.getDate());
                    var totalDays2 = Math.ceil(((dat2.getFullYear() - 1900) * 365.25) + dat2.getDate());
                    if ((dat1.getMonth() - 1) >= 0) {
                        var dayMonths1 = dat1.getMonth() - 1;
                        while (dayMonths1 >= 0) {
                            totalDays1 += KrodzoneDate.daysInMonth(new Date((dayMonths1 + 1) + "/1/" + dat1.getFullYear()));
                            dayMonths1--;
                        }
                    }
                    if ((dat2.getMonth() - 1) >= 0) {
                        var dayMonths2 = dat2.getMonth() - 1;
                        while (dayMonths2 >= 0) {
                            totalDays2 += KrodzoneDate.daysInMonth(new Date((dayMonths2 + 1) + "/1/" + dat2.getFullYear()));
                            dayMonths2--;
                        }
                    }
                    return totalDays2 - totalDays1;
                case "MONTH":
                    var mo1 = dat1.getMonth();
                    var mo2 = dat2.getMonth();
                    return mo2 - mo1;
                case "YEAR":
                    var yr1 = dat1.getFullYear();
                    var yr2 = dat2.getFullYear();
                    return yr2 - yr1;
                case "HOUR":
                    var hr1 = dat1.getHours();
                    var hr2 = dat2.getHours();
                    return hr2 - hr1;
                case "MINUTES":
                    var totalDays1 = Math.ceil(((dat1.getFullYear() - 1900) * 365.25) + (dat1.getDate() - 1));
                    var totalDays2 = Math.ceil(((dat2.getFullYear() - 1900) * 365.25) + (dat2.getDate() - 1));
                    if ((dat1.getMonth() - 1) >= 0) {
                        var dayMonths1 = dat1.getMonth() - 1;
                        while (dayMonths1 >= 0) {
                            totalDays1 += KrodzoneDate.daysInMonth(new Date((dayMonths1 + 1) + "/1/" + dat1.getFullYear()));
                            dayMonths1--;
                        }
                    }
                    if ((dat2.getMonth() - 1) >= 0) {
                        var dayMonths2 = dat2.getMonth() - 1;
                        while (dayMonths2 >= 0) {
                            totalDays2 += KrodzoneDate.daysInMonth(new Date((dayMonths2 + 1) + "/1/" + dat2.getFullYear()));
                            dayMonths2--;
                        }
                    }
                    var minutesToday1 = (dat1.getMinutes() + (dat1.getHours() * 60)) + ((totalDays1 * 24) * 60);
                    var minutesToday2 = (dat2.getMinutes() + (dat2.getHours() * 60)) + ((totalDays2 * 24) * 60);
                    return minutesToday2 - minutesToday1;
                case "SECONDS":
                    var sec1 = dat1.getSeconds();
                    var sec2 = dat2.getSeconds();
                    return sec2 - sec1;
                default:
                    return -1;
            }
        };
        KrodzoneDate.dateAdd = function (part, num, dat) {
            if (!KrodzoneDate.dateValid(dat)) {
                return new Date("1/1/1900");
            }
            if (isNaN(num)) {
                return new Date("1/1/1900");
            }
            var day = dat.getDate();
            var mo = dat.getMonth();
            var yr = dat.getFullYear();
            var hr = dat.getHours();
            var min = dat.getMinutes();
            var sec = dat.getSeconds();
            var workingDays = 0;
            var addDay = function (daysToAdd) {
                var totalDaysInMo = KrodzoneDate.daysInMonth(dat);
                if (daysToAdd < 0) {
                    if ((day + (daysToAdd)) <= 0) {
                        workingDays = ((daysToAdd + day) === 0 ? totalDaysInMo : (daysToAdd + day));
                        while (workingDays <= 0) {
                            yr = ((mo + 1) == 1 ? yr - 1 : yr);
                            mo = ((mo + 1) == 1 ? 11 : mo - 1);
                            totalDaysInMo = KrodzoneDate.daysInMonth(new Date((mo + 1) + "/1/" + yr));
                            workingDays = ((workingDays + totalDaysInMo) === 0 ? totalDaysInMo : (workingDays + totalDaysInMo));
                        }
                        var dateString = (mo + 1) + "/" + workingDays + "/" + yr + " " + hr + ":" + min + ":" + sec;
                        return new Date(dateString);
                    }
                    else {
                        workingDays = (day + (daysToAdd));
                        var dateString = (mo + 1) + "/" + workingDays + "/" + yr + " " + hr + ":" + min + ":" + sec;
                        return new Date(dateString);
                    }
                }
                if ((day + daysToAdd) > totalDaysInMo) {
                    workingDays = (day + daysToAdd);
                    while (workingDays > totalDaysInMo) {
                        yr = ((mo + 1) == 12 ? yr + 1 : yr);
                        mo = ((mo + 1) == 12 ? 0 : mo + 1);
                        workingDays -= totalDaysInMo;
                        totalDaysInMo = KrodzoneDate.daysInMonth(new Date((mo + 1) + "/1/" + yr));
                    }
                    var dateString = (mo + 1) + "/" + workingDays + "/" + yr + " " + hr + ":" + min + ":" + sec;
                    return new Date(dateString);
                }
                else {
                    var dateString = (mo + 1) + "/" + (day + daysToAdd) + "/" + yr + " " + hr + ":" + min + ":" + sec;
                    return new Date(dateString);
                }
            };
            var addMonth = function (monthsToAdd) {
                var totalDaysInMo;
                var dateString;
                if ((mo + (monthsToAdd)) >= 12) {
                    var monthsForCurrentYear = 12 - (mo + 1);
                    var remainingMonths = monthsToAdd - monthsForCurrentYear;
                    var totalYears = Math.floor(remainingMonths / 12);
                    remainingMonths = remainingMonths - (totalYears * 12);
                    totalYears += (yr + 1);
                    totalDaysInMo = KrodzoneDate.daysInMonth(new Date(remainingMonths + "/1/" + totalYears));
                    if (day > totalDaysInMo) {
                        dateString = remainingMonths + "/" + totalDaysInMo + "/" + totalYears + " " + hr + ":" + min + ":" + sec;
                    }
                    else {
                        dateString = remainingMonths + "/" + day + "/" + totalYears + " " + hr + ":" + min + ":" + sec;
                    }
                    return new Date(dateString);
                }
                else if ((mo + (monthsToAdd)) < 0) {
                    var remainingMonths = Math.abs(monthsToAdd) - (mo + 1);
                    var totalYears = Math.floor(remainingMonths / 12);
                    var newMonth = (12 - (remainingMonths - (totalYears * 12)));
                    totalYears = yr - (totalYears + 1);
                    totalDaysInMo = KrodzoneDate.daysInMonth(new Date(newMonth + "/1/" + totalYears));
                    if (day > totalDaysInMo) {
                        dateString = newMonth + "/" + totalDaysInMo + "/" + totalYears + " " + hr + ":" + min + ":" + sec;
                    }
                    else {
                        dateString = newMonth + "/" + day + "/" + totalYears + " " + hr + ":" + min + ":" + sec;
                    }
                    return new Date(dateString);
                }
                else {
                    dateString = (mo + (monthsToAdd) + 1) + "/" + day + "/" + yr + " " + hr + ":" + min + ":" + sec;
                    return new Date(dateString);
                }
            };
            var addHours = function (hoursToAdd) {
                if ((hr + hoursToAdd) > 23) {
                    var totalDaysInMo = KrodzoneDate.daysInMonth(dat);
                    var totalDays = Math.floor((hr + hoursToAdd) / 24);
                    hoursToAdd = (hr + hoursToAdd) - (totalDays * 24);
                    if ((day + totalDays) > totalDaysInMo) {
                        workingDays = (day + totalDays);
                        while (workingDays > totalDaysInMo) {
                            yr = ((mo + 1) == 12 ? yr + 1 : yr);
                            mo = ((mo + 1) == 12 ? 0 : mo + 1);
                            workingDays -= totalDaysInMo;
                            totalDaysInMo = KrodzoneDate.daysInMonth(new Date((mo + 1) + "/1/" + yr));
                        }
                        var dateString = (mo + 1) + "/" + workingDays + "/" + yr + " " + hoursToAdd + ":" + min + ":" + sec;
                        return new Date(dateString);
                    }
                    else {
                        var year = yr;
                        var month = (mo + 1);
                        var dy = day;
                        var hour = hr;
                        if (hoursToAdd < 0) {
                            year = (Math.abs(hoursToAdd) > hr ? (hr === 0 ? (day === 1 ? (mo === 0 ? (yr - 1) : yr) : yr) : yr) : yr);
                            month = (Math.abs(hoursToAdd) > hr ? (hr === 0 ? (day === 1 ? (mo === 0 ? 12 : mo) : (mo + 1)) : (mo + 1)) : (mo + 1));
                            dy = (Math.abs(hoursToAdd) > hr ? (hr === 0 ? (day === 1 ? KrodzoneDate.daysInMonth(new Date(month + "/1/" + year)) : day) : day) : day);
                            hour = (Math.abs(hoursToAdd) > hr ? ((hr - (Math.abs(hoursToAdd) - hr)) < 0 ? 23 - (hr - (Math.abs(hoursToAdd) - hr)) : (hr - (Math.abs(hoursToAdd) - hr))) : hr + (hoursToAdd));
                        }
                        else {
                            year = ((hoursToAdd + hr) > 23 ? (day === KrodzoneDate.daysInMonth(new Date((mo + 1) + "/1/" + yr)) ? (mo === 11 ? yr + 1 : yr) : yr) : yr);
                            month = ((hoursToAdd + hr) > 23 ? (day === KrodzoneDate.daysInMonth(new Date((mo + 1) + "/1/" + yr)) ? (mo === 11 ? 1 : (mo + 2)) : (mo + 1)) : (mo + 1));
                            dy = ((hoursToAdd + hr) > 23 ? (day === KrodzoneDate.daysInMonth(new Date((mo + 1) + "/1/" + yr)) ? 1 : (day + 1)) : day);
                            hour = ((hoursToAdd + hr) > 23 ? (hoursToAdd + hr) - 23 : (hoursToAdd + hr));
                        }
                        var dateString = month + "/" + dy + "/" + year + " " + hour + ":" + min + ":" + sec;
                        return new Date(dateString);
                    }
                }
                else {
                    var year = yr;
                    var month = (mo + 1);
                    var dy = day;
                    var hour = hr;
                    if (hoursToAdd < 0) {
                        year = (Math.abs(hoursToAdd) > hr ? (hr === 0 ? (day === 1 ? (mo === 0 ? (yr - 1) : yr) : yr) : yr) : yr);
                        month = (Math.abs(hoursToAdd) > hr ? (hr === 0 ? (day === 1 ? (mo === 0 ? 12 : mo) : (mo + 1)) : (mo + 1)) : (mo + 1));
                        dy = (Math.abs(hoursToAdd) > hr ? (day === 1 ? KrodzoneDate.daysInMonth(new Date(month + "/1/" + year)) : day - 1) : day);
                        hour = (Math.abs(hoursToAdd) > hr ? 24 + (hr + (hoursToAdd)) : hr + (hoursToAdd));
                    }
                    else {
                        year = ((hoursToAdd + hr) > 23 ? (day === KrodzoneDate.daysInMonth(new Date((mo + 1) + "/1/" + yr)) ? (mo === 11 ? yr + 1 : yr) : yr) : yr);
                        month = ((hoursToAdd + hr) > 23 ? (day === KrodzoneDate.daysInMonth(new Date((mo + 1) + "/1/" + yr)) ? (mo === 11 ? 1 : (mo + 2)) : (mo + 1)) : (mo + 1));
                        dy = ((hoursToAdd + hr) > 23 ? (day === KrodzoneDate.daysInMonth(new Date((mo + 1) + "/1/" + yr)) ? 1 : (day + 1)) : day);
                        hour = ((hoursToAdd + hr) > 23 ? (hoursToAdd + hr) - 23 : (hoursToAdd + hr));
                    }
                    var dateString = month + "/" + dy + "/" + year + " " + hour + ":" + min + ":" + sec;
                    return new Date(dateString);
                }
            };
            var addMinutes = function (minutesToAdd) {
                if ((min + minutesToAdd) > 60) {
                    var totalHrs = Math.floor((min + minutesToAdd) / 60);
                    minutesToAdd = (min + minutesToAdd) - (totalHrs * 60);
                    if ((hr + totalHrs) > 23) {
                        var totalDaysInMo = KrodzoneDate.daysInMonth(dat);
                        var totalDays = Math.floor((hr + totalHrs) / 24);
                        totalHrs = (hr + totalHrs) - (totalDays * 24);
                        if ((day + totalDays) > totalDaysInMo) {
                            workingDays = (day + totalDays);
                            while (workingDays > totalDaysInMo) {
                                yr = ((mo + 1) == 12 ? yr + 1 : yr);
                                mo = ((mo + 1) == 12 ? 0 : mo + 1);
                                workingDays -= totalDaysInMo;
                                totalDaysInMo = KrodzoneDate.daysInMonth(new Date((mo + 1) + "/1/" + yr));
                            }
                            var dateString = (mo + 1) + "/" + workingDays + "/" + yr + " " + totalHrs + ":" + minutesToAdd + ":" + sec;
                            return new Date(dateString);
                        }
                        else {
                            var dateString = (mo + 1) + "/" + (day + totalDays) + "/" + yr + " " + totalHrs + ":" + minutesToAdd + ":" + sec;
                            return new Date(dateString);
                        }
                    }
                    else {
                        var dateString = (mo + 1) + "/" + day + "/" + yr + " " + (hr + totalHrs) + ":" + minutesToAdd + ":" + sec;
                        return new Date(dateString);
                    }
                }
                else {
                    var year = yr;
                    var month = (mo + 1);
                    var dy = day;
                    var hour = hr;
                    var minuts = min;
                    if (minutesToAdd < 0) {
                        year = (Math.abs(minutesToAdd) > min ? (hr === 0 ? (day === 1 ? (mo === 0 ? (yr - 1) : yr) : yr) : yr) : yr);
                        month = (Math.abs(minutesToAdd) > min ? (hr === 0 ? (day === 1 ? (mo === 0 ? 12 : mo) : (mo + 1)) : (mo + 1)) : (mo + 1));
                        dy = (Math.abs(minutesToAdd) > min ? (hr === 0 ? (day === 1 ? KrodzoneDate.daysInMonth(new Date(month + "/1/" + year)) : day) : day) : day);
                        hour = (Math.abs(minutesToAdd) > min ? (hr === 0 ? 23 : hr - 1) : hr);
                        minuts = (Math.abs(minutesToAdd) > min ? 60 + (min + (minutesToAdd)) : min + (minutesToAdd));
                    }
                    else {
                        year = ((min + minutesToAdd) > 60 ? (hr === 23 ? (day === KrodzoneDate.daysInMonth(new Date((mo + 1) + "/1/" + yr)) ? (mo === 11 ? (yr + 1) : yr) : yr) : yr) : yr);
                        month = ((min + minutesToAdd) > 60 ? (hr === 23 ? (day === KrodzoneDate.daysInMonth(new Date((mo + 1) + "/1/" + yr)) ? (mo === 11 ? 1 : (mo + 1)) : (mo + 1)) : (mo + 1)) : (mo + 1));
                        dy = ((min + minutesToAdd) > 60 ? (hr === 23 ? (day === KrodzoneDate.daysInMonth(new Date(month + "/1/" + year)) ? 1 : day) : day) : day);
                        hour = ((min + minutesToAdd) > 60 ? (hr === 23 ? 0 : hr) : hr);
                        minuts = ((min + minutesToAdd) > 60 ? (60 - (min + minutesToAdd)) : (min + minutesToAdd));
                    }
                    var dateString = month + "/" + dy + "/" + year + " " + hour + ":" + minuts + ":" + sec;
                    return new Date(dateString);
                }
            };
            switch (part) {
                case "DAY":
                    return addDay(num);
                case "MONTH":
                    return addMonth(num);
                case "YEAR":
                    var dateString = (mo + 1) + "/" + day + "/" + (yr + num) + " " + hr + ":" + min + ":" + sec;
                    return new Date(dateString);
                case "HOUR":
                    if (Math.abs(num) >= 24) {
                        var daysToAdd = (num < 0 ? Math.ceil(num / 24) : Math.floor(num / 24));
                        dat = addDay(daysToAdd);
                        day = dat.getDate();
                        mo = dat.getMonth();
                        yr = dat.getFullYear();
                        hr = dat.getHours();
                        min = dat.getMinutes();
                        sec = dat.getSeconds();
                        workingDays = 0;
                        num = (num < 0 ? Math.ceil(num - ((daysToAdd) * 24.0)) : Math.floor(num - ((daysToAdd) * 24.0)));
                        return addHours(num);
                    }
                    else {
                        return addHours(num);
                    }
                case "MINUTES":
                    if (Math.abs(num) >= 60) {
                        var hoursToAdd = (num < 0 ? Math.ceil(num / 60.0) : Math.floor(num / 60.0));
                        var daysToAdd = 0;
                        if (Math.abs(hoursToAdd) >= 24.0) {
                            daysToAdd = (hoursToAdd < 0 ? Math.ceil(hoursToAdd / 24.0) : Math.floor(hoursToAdd / 24.0));
                            hoursToAdd -= ((daysToAdd) * 24.0);
                            dat = addDay(daysToAdd);
                            day = dat.getDate();
                            mo = dat.getMonth();
                            yr = dat.getFullYear();
                            hr = dat.getHours();
                            min = dat.getMinutes();
                            sec = dat.getSeconds();
                            workingDays = 0;
                        }
                        if (Math.abs(hoursToAdd) > 0) {
                            dat = addHours(hoursToAdd);
                            day = dat.getDate();
                            mo = dat.getMonth();
                            yr = dat.getFullYear();
                            hr = dat.getHours();
                            min = dat.getMinutes();
                            sec = dat.getSeconds();
                            workingDays = 0;
                        }
                        num -= (((daysToAdd) * 24.0 * 60.0) + ((hoursToAdd) * 60.0));
                        return addMinutes(num);
                    }
                    else {
                        return addMinutes(num);
                    }
                case "SECONDS":
                    if ((sec + num) > 60) {
                        var totalMins = Math.floor((sec + num) / 60);
                        num = (sec + num) - (totalMins * 60);
                        if ((min + totalMins) > 60) {
                            var totalHrs = Math.floor((min + totalMins) / 60);
                            totalMins = (min + totalMins) - (totalHrs * 60);
                            if ((hr + totalHrs) > 23) {
                                var totalDaysInMo = KrodzoneDate.daysInMonth(dat);
                                var totalDays = Math.floor((hr + totalHrs) / 24);
                                totalHrs = (hr + totalHrs) - (totalDays * 24);
                                if ((day + totalDays) > totalDaysInMo) {
                                    workingDays = (day + totalDays);
                                    while (workingDays > totalDaysInMo) {
                                        yr = ((mo + 1) == 12 ? yr + 1 : yr);
                                        mo = ((mo + 1) == 12 ? 0 : mo + 1);
                                        workingDays -= totalDaysInMo;
                                        totalDaysInMo = KrodzoneDate.daysInMonth(new Date((mo + 1) + "/1/" + yr));
                                    }
                                    var dateString = (mo + 1) + "/" + workingDays + "/" + yr + " " + totalHrs + ":" + totalMins + ":" + num;
                                    return new Date(dateString);
                                }
                                else {
                                    var dateString = (mo + 1) + "/" + (day + totalDays) + "/" + yr + " " + totalHrs + ":" + totalMins + ":" + num;
                                    return new Date(dateString);
                                }
                            }
                            else {
                                var dateString = (mo + 1) + "/" + day + "/" + yr + " " + (hr + totalHrs) + ":" + totalMins + ":" + num;
                                return new Date(dateString);
                            }
                        }
                        else {
                            var dateString = (mo + 1) + "/" + day + "/" + yr + " " + hr + ":" + (min + totalMins) + ":" + num;
                            return new Date(dateString);
                        }
                    }
                    else {
                        var dateString = (mo + 1) + "/" + day + "/" + yr + " " + hr + ":" + min + ":" + (sec + num);
                        return new Date(dateString);
                    }
                default:
                    return new Date("1/1/1900");
            }
        };
        KrodzoneDate.isLeapYear = function (yr) {
            if (!isNaN(yr)) {
                return (new Date(yr, 1, 29).getMonth() == 1);
            }
            else {
                return false;
            }
        };
        KrodzoneDate.daysInMonth = function (dat) {
            if (!KrodzoneDate.dateValid(dat)) {
                return 0;
            }
            var mo = dat.getMonth();
            var yr = dat.getFullYear();
            var febDays = 0;
            if (KrodzoneDate.isLeapYear(yr)) {
                febDays = 29;
            }
            else {
                febDays = 28;
            }
            var days = [31, febDays, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            return days[mo];
        };
        KrodzoneDate.dateValid = function (dateToCheck) {
            var result = false;
            try {
                var date = new Date(dateToCheck);
                if (date.toDateString() != "Invalid Date") {
                    result = true;
                }
                else {
                    result = false;
                }
            }
            catch (err) {
                result = false;
            }
            return result;
        };
        KrodzoneDate.firstDayOfMonth = function (date) {
            if (!KrodzoneDate.dateValid(date)) {
                date = new Date();
            }
            var month = date.getMonth() + 1;
            var year = date.getFullYear();
            return ('0' + month).slice(-2) + '/01/' + String(year);
        };
        KrodzoneDate.lastDayOfMonth = function (date) {
            if (!KrodzoneDate.dateValid(date)) {
                date = new Date();
            }
            var month = date.getMonth() + 1;
            var day = KrodzoneDate.daysInMonth(date);
            var year = date.getFullYear();
            return ('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year);
        };
        KrodzoneDate.isWeekDay = function (date) {
            if (KrodzoneDate.dateValid(date)) {
                var d = new Date(date);
                var dow = d.getDay();
                return (dow !== DayOfWeek.Sunday && dow !== DayOfWeek.Saturday);
            }
            else {
                return false;
            }
        };
        KrodzoneDate.isWeekendDay = function (date) {
            if (KrodzoneDate.dateValid(date)) {
                var d = new Date(date);
                var dow = d.getDay();
                return (dow === DayOfWeek.Sunday || dow === DayOfWeek.Saturday);
            }
            else {
                return false;
            }
        };
        KrodzoneDate.getDayOfWeek = function (date) {
            if (KrodzoneDate.dateValid(date)) {
                var d = new Date(date);
                var dow = d.getDay();
                return dow;
            }
            else {
                return undefined;
            }
        };
        return KrodzoneDate;
    }());
    Krodzone.KrodzoneDate = KrodzoneDate;
    var KrodzoneTime = (function () {
        function KrodzoneTime(startDate) {
            if (!KrodzoneDate.dateValid(startDate)) {
                startDate = new Date();
            }
            this.Hour = (startDate.getHours() > 12 ? startDate.getHours() - 12 : (startDate.getHours() == 0 ? 12 : startDate.getHours()));
            this.Minutes = startDate.getMinutes();
            this.Seconds = startDate.getSeconds();
            this.Meridian = (startDate.getHours() >= 12 ? "PM" : "AM");
        }
        KrodzoneTime.prototype.setTime = function (dat) {
            if (KrodzoneDate.dateValid(dat)) {
                this.Hour = (dat.getHours() > 12 ? dat.getHours() - 12 : (dat.getHours() == 0 ? 12 : dat.getHours()));
                this.Minutes = dat.getMinutes();
                this.Seconds = dat.getSeconds();
                this.Meridian = (dat.getHours() >= 12 ? "PM" : "AM");
            }
        };
        KrodzoneTime.prototype.toHourString = function () {
            return ('0' + this.Hour).slice(-2);
        };
        KrodzoneTime.prototype.toMinuteString = function () {
            return ('0' + this.Minutes).slice(-2);
        };
        KrodzoneTime.prototype.toTimeString = function () {
            return (this.Hour < 10 ? '0' + this.Hour : this.Hour) + ':' + (this.Minutes < 10 ? '0' + this.Minutes : this.Minutes) + ' ' + this.Meridian;
        };
        KrodzoneTime.toTimeString = function (date) {
            if (!KrodzoneDate.dateValid(date)) {
                date = new Date();
            }
            var hour = (date.getHours() > 12 ? date.getHours() - 12 : (date.getHours() == 0 ? 12 : date.getHours()));
            var minutes = date.getMinutes();
            var meridian = (date.getHours() >= 12 ? "PM" : "AM");
            return ('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian;
        };
        return KrodzoneTime;
    }());
    Krodzone.KrodzoneTime = KrodzoneTime;
})(Krodzone || (Krodzone = {}));
//# sourceMappingURL=KrodSpa.js.map
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

/// <reference path="../jquery/jquery.d.ts" />
/// <reference path="kroddom.ts" />

var currentApplication: KrodSpa.Application;
var pageController: KrodSpa.Controller;
var currentController: KrodSpa.Controller;
var container: HTMLElement;

var removeEscapeChars = (text): string => {
    try {
        return decodeURIComponent(text);
    }
    catch (e) {
        return text;
    }
};

var settingFetcher = (hash: string, settings: KrodSpa.ConfigSetting[]): KrodSpa.ConfigSetting => {
    var setting: KrodSpa.ConfigSetting = undefined;

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

var controllerFetcher = (name: string, controllers: KrodSpa.Controller[]): KrodSpa.Controller => {
    var controller: KrodSpa.Controller = undefined;

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

$(document).ready(() => {
    var containerResults = $("div[view-container]");
    var body: HTMLBodyElement = <HTMLBodyElement>$("body")[0];

    if (KrodSpa.Application.Applications !== undefined && KrodSpa.Application.Applications.length > 0) {
        var html: HTMLElement = $("html")[0];

        if (html && html.hasAttribute("application")) {
            var appName: string = html.getAttribute("application");

            currentApplication = KrodSpa.Application.Get(appName);

            if (currentApplication !== undefined) {


                if (body !== undefined) {

                    if ($(body).attr("controller")) {
                        var href: string = window.location.href;
                        var pageControllerName: string = $(body).attr("controller");
                        var parameters: string[] = (href.indexOf("?") > -1 ? href.split("?")[1].split("&") : undefined);

                        pageController = controllerFetcher(pageControllerName, currentApplication.Controllers);

                        if (pageController !== undefined) {

                            if (parameters !== undefined) {
                                pageController.Scope["Parameters"] = new Object();

                                for (var i: number = 0; i < parameters.length; i++) {
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

                    var hash: string = window.location.hash;
                    var parameters: string[] = (hash.indexOf("?") > -1 ? hash.split("?")[1].split("&") : undefined);
                    var config: KrodSpa.ConfigSetting = undefined;

                    hash = (hash.indexOf("?") > -1 ? hash.split("?")[0] : hash);
                    hash = (hash.lastIndexOf("/") !== hash.indexOf("/") ? hash.substring(0, hash.lastIndexOf("/") + 1) + "{id}" : hash);
                    hash = (hash.lastIndexOf("/") === hash.indexOf("/") && !isNaN(parseInt(hash.substring(2))) ? "#/{id}" : hash);

                    if (hash !== "") {
                        config = settingFetcher(hash.replace("#", ""), currentApplication.Settings);

                        if (config) {
                            currentController = controllerFetcher(config.Controller, currentApplication.Controllers);

                            KrodSpa.Data.WebQuery.load(config.Template).then((result: any) => {
                                $(container).html(result);

                                if (currentController) {

                                    if (parameters !== undefined) {
                                        currentController.Scope["Parameters"] = new Object();

                                        for (var i: number = 0; i < parameters.length; i++) {
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

                            }).catch((error: any) => {
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

window.onhashchange = (ev: Event) => {

    if (currentApplication !== undefined && container !== undefined) {
        var hash = window.location.hash.replace("#", "");
        var parameters = (hash.indexOf("?") > -1 ? hash.split("?")[1].split("&") : undefined);

        hash = (hash.indexOf("?") > -1 ? hash.split("?")[0] : hash);
        hash = (hash.lastIndexOf("/") !== hash.indexOf("/") ? hash.substring(0, hash.lastIndexOf("/") + 1) + "{id}" : hash);
        hash = (hash.lastIndexOf("/") === hash.indexOf("/") && !isNaN(parseInt(hash.substring(2))) ? "/{id}" : hash);

        var config: KrodSpa.ConfigSetting = settingFetcher(hash, currentApplication.Settings);

        if (config) {

            if (currentController) {
                currentController.StopIterations();
            }

            currentController = controllerFetcher(config.Controller, currentApplication.Controllers);

            KrodSpa.Data.WebQuery.load(config.Template).then((result: any) => {
                $(container).html(result);

                if (currentController) {

                    if (parameters !== undefined) {
                        currentController.Scope["Parameters"] = new Object();

                        for (var i: number = 0; i < parameters.length; i++) {
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

            }).catch((error: any) => {
                $(container).html("<h3>Error Loading View</h3>");
            });


        }

    }

}


interface HTMLElement {
    disable: () => void;
    enable: () => void;
}

HTMLElement.prototype.enable = (): void => {
    (<HTMLElement>this).setAttribute("disabled", "");
}

HTMLElement.prototype.disable = (): void => {
    (<HTMLElement>this).setAttribute("disabled", "disabled");
}

interface Function {
    toKeyString(obj: Object): string;
    toJson(obj: Object): string;
    hasKey(obj: Object, key: string): boolean;
}

interface Location {
    getParameterByName: (name: string) => string;
    getAbsolutePath: () => string;
}

Function.prototype.toKeyString = (obj: Object): string => {
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
            var month = obj[key].getMonth() + 1,
                day = obj[key].getDate(),
                year = obj[key].getFullYear(),
                hour = (obj[key].getHours() > 12 ? obj[key].getHours() - 12 : (obj[key].getHours() == 0 ? 12 : obj[key].getHours())),
                minutes = obj[key].getMinutes(),
                meridian = (obj[key].getHours() >= 12 ? "PM" : "AM");
            var dateString = ('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year) + ' ' + ('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian;

            keyString = (keyString === "" ? key + "=" + dateString : keyString + "&" + key + "=" + dateString);
        }

    });

    return keyString;

}

Function.prototype.toJson = (obj: Object): string => {
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
            var month = obj[key].getMonth() + 1,
                day = obj[key].getDate(),
                year = obj[key].getFullYear(),
                hour = obj[key].getHours(),
                minutes = obj[key].getMinutes(),
                seconds = obj[key].getSeconds();
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

}

Function.prototype.hasKey = (obj: Object, key: string): boolean => {
    var keyFound: boolean = false;
    var Keys: string[] = Object.keys(obj);

    for (var i: number = 0; i < Keys.length; i++) {
        var objKey: string = Keys[i];

        if (objKey === key) {
            keyFound = true;
            break;
        }

    }

    return keyFound;

}

window.location.getParameterByName = (name: string): string => {
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
}

window.location.getAbsolutePath = (): string => {
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

}

class Promise {
    onResolved: (result: any) => void;
    onRejected: (error: any) => void;

    then: (resolved: (result: any) => void) => Promise;
    catch: (rejected: (error: any) => void) => Promise;

    resolve: (result: any) => void;
    reject: (error: any) => void;

    constructor() {
        var that = this;

        that.then = (resolved: (result: any) => void): Promise => {
            that.onResolved = resolved;
            return that;
        }

        that.catch = (rejected: (result: any) => void): Promise => {
            that.onRejected = rejected;
            return that;
        }

        that.resolve = (result: any): void => {

            if (that.onResolved) {
                that.onResolved(result);
            }

        }

        that.reject = (error: any): void => {

            if (that.onRejected) {
                that.onRejected(error);
            }

        }

    }

}

module KrodSpa {

    //  Used for Validating & Data Binding
    export enum DataTypeArgs {
        Int = 0,
        Float = 1,
        Date = 2,
        Time = 3,
        DateTime = 4,
        Boolean = 5,
        String = 6
    }

    //  Provides a Simple Interface for Determining the Numeric Data Type Value
    export class DataTypeCollection {
        [name: string]: DataTypeArgs;

        constructor() {
            var that = this;

        }

        //  Returns a Default Instance of DataTypeCollection
        static Instance = (): DataTypeCollection => {
            var _instance = new DataTypeCollection();

            _instance['INT'] = DataTypeArgs.Int;
            _instance['FLOAT'] = DataTypeArgs.Float;
            _instance['DATE'] = DataTypeArgs.Date;
            _instance['TIME'] = DataTypeArgs.Time;
            _instance['DATETIME'] = DataTypeArgs.DateTime;
            _instance['BOOLEAN'] = DataTypeArgs.Boolean;
            _instance['STRING'] = DataTypeArgs.String;

            return _instance;

        }

    }

    export class Application {
        Name: string;
        DefaultHash: string;
        Settings: ConfigSetting[];
        Controllers: Controller[];
        $rootScope: Object;

        static Applications: Application[];

        constructor(name: string) {
            var that = this;

            that.Name = name;
            that.DefaultHash = "";

            that.Controllers = new Array<Controller>();
            that.Settings = new Array<ConfigSetting>();

            that.$rootScope = new Object();

        }

        Config = (settings: { Hash: string; Template: string; Controller: string }[]): Application => {
            
            if (settings && settings.length) {

                for (var j = 0; j < settings.length; j++) {

                    (function (appSettings, args) {
                        var index: number = -1, setting: ConfigSetting;

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

                    })(this.Settings, settings[j]);

                }

            }

            return this;

        }

        Default = (defaultHash: string): Application => {
            this.DefaultHash = defaultHash;

            return this;

        }

        Controller = (name: string, mod: (args?: any[]) => void): Application => {
            var index: number = -1, controller: Controller;

            for (var i = 0; i < this.Controllers.length; i++) {
                if (this.Controllers[i].Name.toUpperCase() === name.toUpperCase()) {
                    index = i;
                    break;
                }
            }

            if (index === -1) {
                controller = new Controller(name, mod);
                this.Controllers.push(controller);
                this.$rootScope[name] = controller;
            }
            else {
                this.Controllers[index].Name = name;
                this.Controllers[index].Module = mod;
            }

            return this;

        }

        InitializeController = (controller: Controller, view: HTMLElement): Application => {
            controller.Module(controller.Scope, KrodSpa.Data.WebQuery);

            setTimeout(() => {

                var variables = view.getElementsByTagName("variable");

                if (variables !== undefined && variables.length > 0) {

                    for (var i = 0; i < variables.length; i++) {

                        if ((<HTMLElement>variables[i]).hasAttribute("model")) {
                            var model = (<HTMLElement>variables[i]).getAttribute("model");
                            var objName: string;

                            if (model.indexOf(".") > -1) {
                                var parts: string[] = model.split(".");
                                objName = parts[0];
                            }
                            else {
                                objName = model;
                            }

                            if (controller.Scope[objName]) {
                                controller.WatchProperty((<HTMLElement>variables[i]), model);
                            }


                        }

                    }

                }


                var clickElements = $(view).find("[click]");

                if (clickElements && clickElements.length > 0) {

                    for (var i = 0; i < clickElements.length; i++) {

                        (function (idx) {
                            var element: HTMLElement = <HTMLElement>clickElements[idx];
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
                        var bindingElement: HTMLElement = <HTMLElement>bindingModelElements[i];
                        var binding: IBoundField = BoundFieldBase.CreateBoundField(controller.Scope, bindingElement);

                        controller.BoundFields.push(binding);

                    }

                }

                controller.SetView(view);
                
            }, 200);


            return this;

        }

        static Create = (name: string): Application => {
            var app: Application;

            if (!Application.Applications) {
                Application.Applications = new Array<Application>();
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

        }

        static Get = (name: string): Application => {
            var app: Application = undefined;

            if (Application.Applications) {

                for (var i = 0; i < Application.Applications.length; i++) {
                    if (Application.Applications[i].Name.toUpperCase() === name.toUpperCase()) {
                        app = Application.Applications[i];
                        break;
                    }
                }

            }

            return app;

        }

    }

    export class ConfigSetting {
        Hash: string;
        Template: string;
        Controller: string;

        constructor(hash: string, template: string, controller: string) {
            var that = this;

            that.Hash = hash;
            that.Template = template;
            that.Controller = controller;

        }

    }

    export class Controller {
        Name: string;
        View: HTMLElement;
        Module: ($scope: Object, $webQuery: Object) => void;
        Dependencies: any[];
        Scope: Object;

        BoundFields: IBoundField[];

        WatchProperty: (element: HTMLElement, property: string) => void;

        SetView: (view: HTMLElement) => void;
        ShowModal: (view: HTMLElement, modalArgs: KrodSpa.Views.ModalWindowArgs) => void;

        Iterations: IterationCollection;

        StopIterations: () => void;

        constructor(name: string, mod: (args?: any[]) => void) {
            var that = this;

            that.Name = name;
            that.Module = mod;
            that.Dependencies = new Array<any>();

            that.BoundFields = new Array<IBoundField>();

            that.Scope = new Object();

            that.Iterations = new IterationCollection();

            that.StopIterations = () => {

                if (that.Iterations !== undefined) {
                    that.Iterations.StopAll();
                }

            }

            that.SetView = (view: HTMLElement) => {
                that.View = view;

                var iters = $$(that.View).find("[iteration]");

                if (iters !== undefined && iters !== null && iters.length !== undefined) {

                    for (var i = 0; i < iters.length; i++) {
                        var iteration: Iteration;

                        try {
                            iteration = new Iteration(that.View, <HTMLElement>iters[i].Element, that.Scope);
                        }
                        catch (er) {
                            iteration = undefined;
                        }

                        that.Iterations.Add(iteration);

                    }

                    that.Iterations.RenderAll();

                }

            }

            that.WatchProperty = (element: HTMLElement, property: string) => {

                setInterval((el: HTMLElement, prop: string) => {
                    var value: string = el.innerHTML;
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

            }


            that.Scope["ShowModal"] = (view: HTMLElement, modalArgs: KrodSpa.Views.ModalWindowArgs) => {
                var boundFields: IBoundField[] = new Array<IBoundField>();

                var variables = view.getElementsByTagName("variable");

                if (variables !== undefined && variables.length > 0) {

                    for (var i = 0; i < variables.length; i++) {

                        if ((<HTMLElement>variables[i]).hasAttribute("model")) {
                            var model = (<HTMLElement>variables[i]).getAttribute("model");
                            var objName: string;

                            if (model.indexOf(".") > -1) {
                                var parts: string[] = model.split(".");
                                objName = parts[0];
                            }
                            else {
                                objName = model;
                            }

                            if (that.Scope[objName]) {
                                that.WatchProperty((<HTMLElement>variables[i]), model);
                            }


                        }

                    }

                }


                var clickElements = $(view).find("[click]");

                if (clickElements && clickElements.length > 0) {

                    for (var i = 0; i < clickElements.length; i++) {

                        (function (idx) {
                            var element: HTMLElement = <HTMLElement>clickElements[idx];
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


                KrodSpa.Views.ModalWindow.showDialog(view, new Views.ModalWindowArgs(
                    that.Scope,
                    modalArgs.ModalWidth,
                    modalArgs.ModalCaption,
                    modalArgs.FooterText,
                    modalArgs.ExecutionHtml,
                    modalArgs.CancelHtml,
                    modalArgs.ShowExecuteButton,
                    modalArgs.ShowCancelButton,
                    (callback: (success: boolean, message: string) => void) => {
                        var executionCallback: (success: boolean, message: string) => void;

                        executionCallback = (success: boolean, message: string) => {
                            callback(success, message);
                        }

                        modalArgs.ExecuteButtonCallback(executionCallback);

                        that.Iterations.Refresh();

                    }, modalArgs.CancelButtonCallback));

                setTimeout((): void => {
                    var bindingModelElements = $(view).find("[binding]");
                    
                    if (bindingModelElements && bindingModelElements.length > 0) {

                        for (var i = 0; i < bindingModelElements.length; i++) {
                            var bindingElement: HTMLElement = <HTMLElement>bindingModelElements[i];
                            var binding: IBoundField = BoundFieldBase.CreateBoundField(that.Scope, bindingElement);

                            boundFields.push(binding);

                        }

                    }



                    var dialogIterations: IterationCollection = new IterationCollection();
                    var dialogIters = $$(view).find("[iteration]");

                    if (dialogIters !== undefined && dialogIters !== null && dialogIters.length !== undefined) {

                        for (var i = 0; i < dialogIters.length; i++) {
                            var iteration: Iteration;

                            try {
                                iteration = new Iteration(view, <HTMLElement>dialogIters[i].Element, that.Scope);
                            }
                            catch (er) {
                                iteration = undefined;
                            }

                            dialogIterations.Add(iteration);

                        }

                        dialogIterations.RenderAll();

                    }

                }, 200);

            }



            that.Scope["ShowMessageBox"] = (messageHtml: string, messageTitle: string, msgboxType: Views.MessageBoxTypeArgs, msgboxButtons: Views.MessageBoxButtonArgs, resultCallback: (result: Views.MessageBoxResultArgs) => void) => {
                
                KrodSpa.Views.MessageBox.showDialog(messageHtml, messageTitle, msgboxType, msgboxButtons, new Views.MessageBoxWindowArgs(
                    that.Scope,
                    "modal-400",
                    messageTitle,
                    msgboxButtons,
                    resultCallback
                ));
                
            }


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

        GetDynamicValue = (model: any, defaultValue: string): string => {

            if (model) {
                return model;
            }
            else {
                return defaultValue;
            }

        }

        GetObject = (model: string): Object => {
            var obj: Object;

            if (model.indexOf(".") > -1) {
                var parts = model.split(".");

                switch (parts.length) {
                    case 2:
                        if (!this.Scope[parts[0]]) {
                            this.Scope[parts[0]] = new Object();
                        }

                        obj = this.Scope[parts[0]];

                        break;
                    case 3:
                        if (!this.Scope[parts[0]]) {
                            this.Scope[parts[0]] = new Object();
                        }

                        if (!this.Scope[parts[0]][parts[1]]) {
                            this.Scope[parts[0]][parts[1]] = new Object();
                        }

                        obj = this.Scope[parts[0]][parts[1]];

                        break;
                    case 4:
                        if (!this.Scope[parts[0]]) {
                            this.Scope[parts[0]] = new Object();
                        }

                        if (!this.Scope[parts[0]][parts[1]]) {
                            this.Scope[parts[0]][parts[1]] = new Object();
                        }

                        if (!this.Scope[parts[0]][parts[1]][parts[2]]) {
                            this.Scope[parts[0]][parts[1]][parts[2]] = new Object();
                        }

                        obj = this.Scope[parts[0]][parts[1]][parts[2]];

                        break;
                    case 5:
                        if (!this.Scope[parts[0]]) {
                            this.Scope[parts[0]] = new Object();
                        }

                        if (!this.Scope[parts[0]][parts[1]]) {
                            this.Scope[parts[0]][parts[1]] = new Object();
                        }

                        if (!this.Scope[parts[0]][parts[1]][parts[2]]) {
                            this.Scope[parts[0]][parts[1]][parts[2]] = new Object();
                        }

                        if (!this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]) {
                            this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = new Object();
                        }

                        obj = this.Scope[parts[0]][parts[1]][parts[2]][parts[3]];

                        break;
                }

            }
            else {

                obj = this.Scope;

            }

            return obj;

        }

        GetModelValue = (model: string): any => {
            var value: any;

            if (model.indexOf(".") > -1) {
                var parts = model.split(".");

                switch (parts.length) {
                    case 2:
                        this.Scope[parts[0]] = this.EnsureObjectExists(this.Scope[parts[0]]);
                        this.Scope[parts[0]][parts[1]] = (this.Scope[parts[0]][parts[1]] ? this.Scope[parts[0]][parts[1]] : "");
                        value = this.Scope[parts[0]][parts[1]];
                        break;
                    case 3:
                        this.Scope[parts[0]] = this.EnsureObjectExists(this.Scope[parts[0]]);
                        this.Scope[parts[0]][parts[1]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]]);
                        this.Scope[parts[0]][parts[1]][parts[2]] = (this.Scope[parts[0]][parts[1]][parts[2]] ? this.Scope[parts[0]][parts[1]][parts[2]] : "");
                        value = this.Scope[parts[0]][parts[1]][parts[2]];
                        break;
                    case 4:
                        this.Scope[parts[0]] = this.EnsureObjectExists(this.Scope[parts[0]]);
                        this.Scope[parts[0]][parts[1]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]]);
                        this.Scope[parts[0]][parts[1]][parts[2]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = (this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] ? this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] : "");
                        value = this.Scope[parts[0]][parts[1]][parts[2]][parts[3]];
                        break;
                    case 5:
                        this.Scope[parts[0]] = this.EnsureObjectExists(this.Scope[parts[0]]);
                        this.Scope[parts[0]][parts[1]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]]);
                        this.Scope[parts[0]][parts[1]][parts[2]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = (this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] ? this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] : "");
                        value = this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]];
                        break;
                    case 6:
                        this.Scope[parts[0]] = this.EnsureObjectExists(this.Scope[parts[0]]);
                        this.Scope[parts[0]][parts[1]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]]);
                        this.Scope[parts[0]][parts[1]][parts[2]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = (this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] ? this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] : "");
                        value = this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]];
                        break;
                    case 7:
                        this.Scope[parts[0]] = this.EnsureObjectExists(this.Scope[parts[0]]);
                        this.Scope[parts[0]][parts[1]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]]);
                        this.Scope[parts[0]][parts[1]][parts[2]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = (this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] ? this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] : "");
                        value = this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]];
                        break;
                    case 8:
                        this.Scope[parts[0]] = this.EnsureObjectExists(this.Scope[parts[0]]);
                        this.Scope[parts[0]][parts[1]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]]);
                        this.Scope[parts[0]][parts[1]][parts[2]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] = (this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] ? this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] : "");
                        value = this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]];
                        break;
                    case 9:
                        this.Scope[parts[0]] = this.EnsureObjectExists(this.Scope[parts[0]]);
                        this.Scope[parts[0]][parts[1]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]]);
                        this.Scope[parts[0]][parts[1]][parts[2]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]] = (this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]] ? this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]] : "");
                        value = this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]];
                        break;
                    case 10:
                        this.Scope[parts[0]] = this.EnsureObjectExists(this.Scope[parts[0]]);
                        this.Scope[parts[0]][parts[1]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]]);
                        this.Scope[parts[0]][parts[1]][parts[2]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]][parts[9]] = (this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]][parts[9]] ? this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]][parts[9]] : "");
                        value = this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]][parts[9]];
                        break;
                    default:

                }
            }
            else {
                this.Scope[model] = (this.Scope[model] ? this.Scope[model] : "");
                value = this.Scope[model];
            }

            return value;

        }

        SetModelValue = (model: string, value: string): string => {

            if (model.indexOf(".") > -1) {
                var parts = model.split(".");

                switch (parts.length) {
                    case 2:
                        this.Scope[parts[0]] = this.EnsureObjectExists(this.Scope[parts[0]]);
                        this.Scope[parts[0]][parts[1]] = value;
                        break;
                    case 3:
                        this.Scope[parts[0]] = this.EnsureObjectExists(this.Scope[parts[0]]);
                        this.Scope[parts[0]][parts[1]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]]);
                        this.Scope[parts[0]][parts[1]][parts[2]] = value;
                        break;
                    case 4:
                        this.Scope[parts[0]] = this.EnsureObjectExists(this.Scope[parts[0]]);
                        this.Scope[parts[0]][parts[1]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]]);
                        this.Scope[parts[0]][parts[1]][parts[2]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = value;
                        break;
                    case 5:
                        this.Scope[parts[0]] = this.EnsureObjectExists(this.Scope[parts[0]]);
                        this.Scope[parts[0]][parts[1]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]]);
                        this.Scope[parts[0]][parts[1]][parts[2]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = value;
                        break;
                    case 6:
                        this.Scope[parts[0]] = this.EnsureObjectExists(this.Scope[parts[0]]);
                        this.Scope[parts[0]][parts[1]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]]);
                        this.Scope[parts[0]][parts[1]][parts[2]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = value;
                        break;
                    case 7:
                        this.Scope[parts[0]] = this.EnsureObjectExists(this.Scope[parts[0]]);
                        this.Scope[parts[0]][parts[1]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]]);
                        this.Scope[parts[0]][parts[1]][parts[2]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = value;
                        break;
                    case 8:
                        this.Scope[parts[0]] = this.EnsureObjectExists(this.Scope[parts[0]]);
                        this.Scope[parts[0]][parts[1]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]]);
                        this.Scope[parts[0]][parts[1]][parts[2]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] = value;
                        break;
                    case 9:
                        this.Scope[parts[0]] = this.EnsureObjectExists(this.Scope[parts[0]]);
                        this.Scope[parts[0]][parts[1]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]]);
                        this.Scope[parts[0]][parts[1]][parts[2]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]] = value;
                        break;
                    case 10:
                        this.Scope[parts[0]] = this.EnsureObjectExists(this.Scope[parts[0]]);
                        this.Scope[parts[0]][parts[1]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]]);
                        this.Scope[parts[0]][parts[1]][parts[2]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]] = this.EnsureObjectExists(this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]]);
                        this.Scope[parts[0]][parts[1]][parts[2]][parts[3]][parts[4]][parts[5]][parts[6]][parts[7]][parts[8]][parts[9]] = value;
                        break;
                    default:

                }
            }
            else {
                this.Scope[model] = (this.Scope[model] ? this.Scope[model] : "");
                value = this.Scope[model];
            }

            return value;

        }

        EnsureObjectExists = (obj: Object): Object => {

            if (obj) {
                return obj;
            }
            else {
                return new Object();
            }

        }

    }


    class Iteration {
        Element: HTMLElement;
        Scope: Object;

        Model: any[];

        private FilteredItems: any[];
        private IterationViews: IterationViewCollection;
        private IntervalID: number = -1;
        private SelectedView: IterationView;

        StartWatch: () => void;
        EndWatch: () => void;

        Refresh: () => void;

        constructor(view: HTMLElement, element: HTMLElement, scope: Object) {
            var that = this,
                FilterObj: KrodSpa.Data.FilterObjectCollection = new KrodSpa.Data.FilterObjectCollection(),
                Filters: FilterAttribute[] = new Array<FilterAttribute>(),
                ButtonCallback = (templateType: IterationTemplateType, itemIndex: number): void => {

                    if (templateType === IterationTemplateType.Desktop) {
                        that.IterationViews.DesktopView.UpdatePaginationValues(itemIndex);
                    }
                    else {
                        that.IterationViews.DesktopView.UpdatePaginationValues(itemIndex);
                    }

                };
            

            that.StartWatch = (): void => {

                if (that.Element !== undefined && that.Model !== undefined && that.Model !== null) {
                    
                    that.IntervalID = setInterval(function (iterVw: IterationView) {
                        iterVw.UpdateView();
                    }, 500, that.SelectedView);

                }

            }

            that.EndWatch = (): void => {
                clearInterval(that.IntervalID);
            }

            that.Refresh = (): void => {

                if (that.Model && FilterObj) {
                    that.SelectedView.UpdateDisplay();
                }

            }
            
            that.Element = element;
            that.Scope = scope;
            that.IterationViews = new IterationViewCollection();
            
            if (that.Element) {
                var iterationAttr: any = $$(that.Element).attrKVP("iteration");

                that.Model = that.GetModel((iterationAttr["MODEL"] ? iterationAttr["MODEL"] : ""));

                if (!that.Model)
                    return;

                var template: any = $$(that.Element).find("[template]");

                template.each(function (itm) {
                    var templateAttr: any = $$(itm).attrKVP("template");

                    if (templateAttr["TYPE"]) {
                        var iterationView: IterationView = new IterationView(itm["Element"], that.Scope, that.Model, Filters, ButtonCallback);

                        switch ((<string>templateAttr["TYPE"]).toUpperCase()) {
                            case "DESKTOP":
                                that.IterationViews.Add(IterationTemplateType.Desktop, iterationView);
                                break;
                            default:
                                that.IterationViews.Add(IterationTemplateType.Mobile, iterationView);

                        }

                    }

                });

                $$(that.IterationViews.DesktopView.MainElement).hide();
                $$(that.IterationViews.MobileView.MainElement).hide();

                var documentWidth: number = $$(document).width();

                if (documentWidth >= 500) {
                    $$(that.IterationViews.DesktopView.MainElement).show();
                    that.SelectedView = that.IterationViews.DesktopView;
                }
                else {
                    $$(that.IterationViews.MobileView.MainElement).show();
                    that.SelectedView = that.IterationViews.MobileView;
                }

                window.addEventListener("resize", function (ev) {

                    setTimeout(function () {
                        var docWd: number = $$(document).width();
                        
                        if (docWd >= 500) {

                            if (!$$(that.IterationViews.DesktopView.MainElement).visible()) {
                                $$(that.IterationViews.MobileView.MainElement).hide();
                                $$(that.IterationViews.DesktopView.MainElement).show();
                                that.SelectedView = that.IterationViews.DesktopView;
                                that.SelectedView.UpdateView();
                            }
                            
                        }
                        else {

                            if (!$$(that.IterationViews.MobileView.MainElement).visible()) {
                                $$(that.IterationViews.DesktopView.MainElement).hide();
                                $$(that.IterationViews.MobileView.MainElement).show();
                                that.SelectedView = that.IterationViews.MobileView;
                                that.SelectedView.UpdateView();
                            }
                            
                        }

                    }, 100);

                });

            }

            
            setTimeout(function () {

                Filters.forEach((filter: FilterAttribute): void => {
                    var inputControl: HTMLInputElement = filter.Control instanceof HTMLInputElement ? <HTMLInputElement>filter.Control : undefined;

                    if (inputControl !== undefined && inputControl.tagName.toUpperCase() === "INPUT" && inputControl.type.toUpperCase() !== "CHECKBOX") {
                        $(filter.Control).on("keyup", function (ev) {

                            FilterObj.Add(filter.Attribute, $(this).val(), 5);

                            that.FilteredItems = that.Model.filter(FilterObj.MeetsCriteria);


                            if (that.FilteredItems) {
                                that.SelectedView.UpdateView(that.FilteredItems);
                            }


                        });
                    }
                });

            }, 500);

            

            var modelTotal = that.Model && that.Model.length ? that.Model.length : 0;

            setInterval(function () {

                if (that.Model && that.Model.length) {
                    if (that.Model.length !== modelTotal) {
                        modelTotal = that.Model.length;

                        that.FilteredItems = that.Model.filter(FilterObj.MeetsCriteria);
                        that.SelectedView.UpdateView();

                    }
                }
                else {
                    that.Model = [];
                    that.FilteredItems = [];
                }

            }, 100);


        }

        private GetModel = (modelName): any => {
            var obj;

            if (this.Scope !== undefined) {

                if (modelName.indexOf(".") > -1) {
                    var parts = modelName.split(".");
                    for (var i = 0; i < parts.length; i++) {
                        obj = obj === undefined ? this.Scope[parts[i]] : obj[parts[i]];
                    }
                }
                else {
                    obj = this.Scope[modelName];
                }

            }

            return obj;

        }

    }


    export enum IterationTemplateType {
        Desktop = 1,
        Mobile = 2
    }

    class IterationViewCollection {

        private _iterationViews: IterationView[];

        get DesktopView(): IterationView {
            return (!this._iterationViews[0] ? this._iterationViews[0] : (!this._iterationViews[1] ? this._iterationViews[1] : this._iterationViews[0]));
        }

        get MobileView(): IterationView {
            return (!this._iterationViews[1] ? this._iterationViews[1] : (!this._iterationViews[0] ? this._iterationViews[0] : this._iterationViews[1]));
        }

        Add: (templateType: IterationTemplateType, view: IterationView) => void;

        constructor() {
            var that = this;

            that._iterationViews = new Array<IterationView>();
            that._iterationViews.push(undefined);
            that._iterationViews.push(undefined);

            that.Add = (templateType: IterationTemplateType, view: IterationView): void => {

                if (templateType) {

                    if (templateType === IterationTemplateType.Desktop) {
                        this._iterationViews[0] = (view ? view : undefined);
                    }
                    else {
                        this._iterationViews[1] = (view ? view : undefined);
                    }

                }

            }

        }

    }

    /*
        The HTML Template Displayed in the UI.

            There can be only 2: (Desktop | Mobile)
            The default template is desktop
     */
    class IterationView {
        MainElement: HTMLElement;

        get width(): number {
            if (this.MainElement) {
                return $$(this.MainElement).width();
            }
            else {
                return 0;
            }
        }

        private TemplateContainer: HTMLElement;
        private TemplateType: IterationTemplateType = IterationTemplateType.Desktop;

        private Scope: Object;

        private FilteredItems: any[];

        private ModelTemplate: string;
        private LoadingTemplate: string;
        private NoItemTemplate: string;

        private PaginationCtl: HTMLElement;
        private PaginationDisplay: HTMLElement;
        private PageTotal: number = 15;
        private TotalPages: number;
        private PageIndex: number;

        private FilterToggle: HTMLElement;
        private FilterContainer: HTMLElement;
        private ShowFilterText: string = 'Show Filter <i class="fa fa- chevron - down" aria-hidden="true"></i>';
        private HideFilterText: string = 'Hide Filter <i class="fa fa-chevron-up" aria-hidden="true"></i>';
        
        private TotalItems: number = -1;
        private IntervalID: number = -1;

        private First: (ev: MouseEvent) => void;
        private Previous: (ev: MouseEvent) => void;
        private Next: (ev: MouseEvent) => void;
        private Last: (ev: MouseEvent) => void;

        UpdateView: (filteredItems?: any[]) => void;
        UpdatePaginationValues: (itemIndex: number) => void;
        
        constructor(element: HTMLElement, scope: Object, filteredItems: any[], filters: FilterAttribute[], buttonCallback: (templateType: IterationTemplateType, itemIndex: number) => void) {
            var that = this;

            that.First = (ev: MouseEvent): void => {

                if (that.FilteredItems) {
                    that.PageIndex = 0;

                    var startIndex = that.PageIndex * that.PageTotal;
                    var endIndex = (startIndex + that.PageTotal) > that.FilteredItems.length ? that.FilteredItems.length : (startIndex + that.PageTotal);

                    that.DisplayItems(that.FilteredItems.slice(startIndex, endIndex));
                    $(that.PaginationCtl).find('[pagination-display="true"]').html("Page " + (that.PageIndex + 1) + " of " + that.TotalPages);

                    if (buttonCallback) {
                        buttonCallback(that.TemplateType, startIndex);
                    }

                }

            };

            that.Previous = (ev: MouseEvent): void => {

                if (that.FilteredItems) {
                    that.PageIndex = (that.PageIndex - 1) < 0 ? 0 : that.PageIndex - 1;

                    var startIndex = that.PageIndex * that.PageTotal;
                    var endIndex = (startIndex + that.PageTotal) > that.FilteredItems.length ? that.FilteredItems.length : (startIndex + that.PageTotal);

                    that.DisplayItems(that.FilteredItems.slice(startIndex, endIndex));
                    $(that.PaginationCtl).find('[pagination-display="true"]').html("Page " + (that.PageIndex + 1) + " of " + that.TotalPages);

                    if (buttonCallback) {
                        buttonCallback(that.TemplateType, startIndex);
                    }

                }

            };

            that.Next = (ev: MouseEvent): void => {

                if (that.FilteredItems) {
                    that.PageIndex = (that.PageIndex + 2) > that.TotalPages ? that.TotalPages - 1 : that.PageIndex + 1;

                    var startIndex = that.PageIndex * that.PageTotal;
                    var endIndex = (startIndex + that.PageTotal) > that.FilteredItems.length ? that.FilteredItems.length : (startIndex + that.PageTotal);

                    that.DisplayItems(that.FilteredItems.slice(startIndex, endIndex));
                    $(that.PaginationCtl).find('[pagination-display="true"]').html("Page " + (that.PageIndex + 1) + " of " + that.TotalPages);

                    if (buttonCallback) {
                        buttonCallback(that.TemplateType, startIndex);
                    }

                }

            };

            that.Last = (ev: MouseEvent): void => {

                if (that.FilteredItems) {
                    that.PageIndex = that.TotalPages - 1;

                    var startIndex = that.PageIndex * that.PageTotal;
                    var endIndex = (startIndex + that.PageTotal) > that.FilteredItems.length ? that.FilteredItems.length : (startIndex + that.PageTotal);

                    that.DisplayItems(that.FilteredItems.slice(startIndex, endIndex));
                    $(that.PaginationCtl).find('[pagination-display="true"]').html("Page " + (that.PageIndex + 1) + " of " + that.TotalPages);

                    if (buttonCallback) {
                        buttonCallback(that.TemplateType, startIndex);
                    }

                }

            };

            that.MainElement = element;
            that.Scope = scope;
            that.FilteredItems = filteredItems;

            that.UpdateView = (filteredItems?: any[]): void => {
                that.FilteredItems = (filteredItems ? filteredItems : that.FilteredItems);

                if (that.FilteredItems !== undefined && that.FilteredItems !== null && that.FilteredItems.length !== undefined && that.FilteredItems.length > 0) {

                    if (that.FilteredItems.length !== that.TotalItems) {
                        that.TotalItems = that.FilteredItems.length;
                        var rgx = /\{\{\w{1,}\}\}/gm;

                        if (that.PaginationCtl !== undefined && that.PageTotal > 0) {
                            that.TotalPages = that.PageTotal > 0 && that.FilteredItems !== undefined && that.FilteredItems !== null && that.FilteredItems.length !== undefined ? Math.ceil(that.FilteredItems.length / that.PageTotal) : 1;
                            that.PageIndex = (that.PageIndex + 1) > that.TotalPages ? that.TotalPages - 1 : that.PageIndex;

                            var startIndex = that.PageIndex * that.PageTotal;
                            var endIndex = (startIndex + that.PageTotal) > that.FilteredItems.length ? that.FilteredItems.length : (startIndex + that.PageTotal);

                            that.DisplayItems(that.FilteredItems.slice(startIndex, endIndex));
                            $(that.PaginationCtl).find('[pagination-display="true"]').html("Page " + (that.PageIndex + 1) + " of " + that.TotalPages);

                        }
                        else {
                            that.DisplayItems(that.FilteredItems);
                        }


                    }

                }
                else {
                    that.TotalItems = 0;

                    if (that.NoItemTemplate !== undefined) {
                        $(that.TemplateContainer).html(that.NoItemTemplate.replace('hidden="hidden"', ""));
                    }
                    else {
                        $(that.TemplateContainer).html("<h4>No Data</h4>");
                    }
                }

            }

            that.UpdatePaginationValues = (itemIndex: number): void => {

            }

            if (that.MainElement) {
                var promise: Promise = new Promise();

                promise.then((result: any): void => {

                    if ($$("").isString(result)) {
                        $$(that.MainElement).html(result);
                    }
                    

                    that.InitializeView(filters);

                    //  Get the Model, Loading, and No Data Templates to be Displayed
                    that.ModelTemplate = that.GetHtmlTemplate("data", undefined);
                    that.LoadingTemplate = that.GetHtmlTemplate("dataloading", '<i class="fa fa-refresh fa-spin fa-fw"></i>&nbsp;&nbsp;<span>Loading Data...</span>');
                    that.NoItemTemplate = that.GetHtmlTemplate("nodata", undefined);

                    that.PageIndex = 0;

                    if (that.TemplateContainer) {
                        $$(that.TemplateContainer).clear();
                        $$(that.TemplateContainer).html(that.LoadingTemplate);
                    }


                    //  Create the Pagination Controls & Add the Appropriate Event Handlers
                    if (that.PaginationCtl) {
                        that.InitializePagination(buttonCallback);
                    }


                    //  Setup Event Handler for Showing/Hiding Filter & Display Filter Text
                    if (that.FilterToggle && that.FilterContainer) {
                        $$(that.FilterToggle).html(that.ShowFilterText);
                        $$(that.FilterContainer).hide();

                        $$(that.FilterToggle).on("click", function (ev) {
                            $$(that.FilterContainer).toggle();

                            if ($$(that.FilterContainer).visible()) {
                                $$(that.FilterToggle).html(that.HideFilterText);
                            }
                            else {
                                $$(that.FilterToggle).html(that.ShowFilterText);
                            }

                        });

                    }


                });

                that.LoadTemplate(promise);

            }
            else {
                that.MainElement = document.createElement("div");
                $$(that.MainElement).html("<h4>Invalid Iteration Template</h4>");
            }

        }

        public UpdateDisplay = (): void => {

            if (this.FilteredItems !== undefined && this.FilteredItems !== null && this.FilteredItems.length !== undefined && this.FilteredItems.length > 0) {
                var rgx = /\{\{\w{1,}\}\}/gm;

                if (this.PaginationCtl !== undefined && this.PageTotal > 0) {
                    this.TotalPages = this.PageTotal > 0 && this.FilteredItems !== undefined && this.FilteredItems !== null && this.FilteredItems.length !== undefined ? Math.ceil(this.FilteredItems.length / this.PageTotal) : 1;
                    this.PageIndex = (this.PageIndex + 1) > this.TotalPages ? this.TotalPages - 1 : this.PageIndex;

                    var startIndex = this.PageIndex * this.PageTotal;
                    var endIndex = (startIndex + this.PageTotal) > this.FilteredItems.length ? this.FilteredItems.length : (startIndex + this.PageTotal);

                    this.DisplayItems(this.FilteredItems.slice(startIndex, endIndex));
                    $(this.PaginationCtl).find('[pagination-display="true"]').html("Page " + (this.PageIndex + 1) + " of " + this.TotalPages);

                }
                else {
                    this.DisplayItems(this.FilteredItems);
                }

            }
        }

        public DisplayItems = (items: any[]): void => {
            var totalProcessed = 0;
            var rgx = /\{\{\w{1,}\}\}/gm;
            var html = "";
            var promise = new Promise();
            var template: string = this.ModelTemplate.toString();

            promise.then(function (result) {
                $$(result.View.TemplateContainer).html(result.HTML !== "" ? result.HTML : result.View.NoItemTemplate);

                var clickControls = $$(result.View.TemplateContainer).find("[click]");

                if (result.View.Scope !== undefined && clickControls !== undefined && clickControls !== null && clickControls.length !== undefined) {

                    $$(clickControls).each(function (ctl) {
                        var paramList = $$(ctl).attr("click").toString().split("(");
                        var clickCallback = paramList && paramList.length && paramList.length === 2 ? paramList[0] : undefined;
                        var index = !isNaN(parseInt(<string>$$(ctl).attr("index"))) ? parseInt($$(ctl).attr("index").toString()) : -1;
                        var params = paramList && paramList.length && paramList.length === 2 ? new Object() : undefined;

                        if (!clickCallback)
                            return;

                        if (params && index > -1) {
                            var paramItemList = paramList[1].replace(")", "").split(",");

                            params["Refresh"] = result.View.UpdateDisplay;

                            if (paramItemList && paramItemList.length) {

                                for (var pilIdx = 0; pilIdx < paramItemList.length; pilIdx++) {
                                    if (paramItemList[pilIdx].trim().indexOf("$item.") > -1) {
                                        var fieldName: string = paramItemList[pilIdx].trim().replace("$item.", "");

                                        if (fieldName !== "" && result.View.FilteredItems[index][fieldName]) {
                                            params[fieldName] = result.View.FilteredItems[index][fieldName];
                                        }

                                    }
                                }

                            }

                        }

                        $$(ctl).on("click", function (ev) {
                            result.View.Scope[clickCallback](result.View.FilteredItems[index], params);
                        });

                    });

                }

            });

            if (items !== undefined && items !== null && items.length !== undefined && promise !== undefined && promise !== null && template.trim() !== "") {

                for (var m = 0; m < items.length; m++) {

                    (function (idx, iter) {
                        var modelHtml: string = template.replace('hidden="hidden"', "");
                        var attributes = modelHtml.match(rgx);
                        var offset = iter.PageIndex * iter.PageTotal;

                        attributes.forEach(function (attr) {
                            var attrName = attr.replace("{{", "").replace("}}", "").trim();
                            var attrValue = items[idx][attrName] !== undefined ? removeEscapeChars(items[idx][attrName]) : "";
                            var attrRgx = new RegExp("\{\{" + attrName + "\}\}", "gm");
                            modelHtml = modelHtml.replace(attrRgx, attrValue);
                        });

                        var div = document.createElement(iter.TemplateContainer.nodeName);

                        $$(div).html(modelHtml);
                        
                        var clickControls = $$(div).find("[click]");

                        if (clickControls !== undefined && clickControls !== null && clickControls.length !== undefined) {

                            $$(clickControls).each(function (ctl) {
                                $$(ctl).attr("index", (idx + offset));
                            });

                            modelHtml = $$(div).html();

                        }

                        html += modelHtml;
                        totalProcessed++;

                        if (totalProcessed === items.length) {
                            var promiseResult = { View: iter, HTML: html };
                            promise.resolve(promiseResult);
                        }

                    })(m, this);

                }

            }

        }

        private LoadTemplate(promise: Promise): void {
            var templateAttr: any = $$(this.MainElement).attrKVP("template");

            if (promise) {

                //  Get the Template Source
                if (templateAttr['SRC']) {
                    var templateSrc: string = window.location.getAbsolutePath() + templateAttr['SRC'];

                    KrodSpa.Data.WebQuery.load(templateSrc, false).then(function (result) {
                        promise.resolve(result);
                    });

                }
                else {
                    promise.resolve(this);
                }

            }

        }

        private InitializeView(filters: FilterAttribute[]): void {
            var templateAttr: any = $$(this.MainElement).attrKVP("template");
            var paginationAttr: any = $$(this.MainElement).attrKVP("pagination");
            var filterAttr: any = $$(this.MainElement).attrKVP("filter");
            var cont: any = undefined;
            
            
            //  Get the Template Container
            if (templateAttr['CONTAINERID']) {
                cont = $$(this.MainElement).find("#" + templateAttr['CONTAINERID']);
                this.TemplateContainer = (cont.length > 0 ? cont[0].Element : undefined);
            }

            //  Get the Template Type
            if (templateAttr['TYPE']) {
                this.TemplateType = ((<string>templateAttr['TYPE']).toUpperCase() === "MOBILE" ? IterationTemplateType.Mobile : IterationTemplateType.Desktop);
            }

            if (this.TemplateContainer) {

                //  Get the Pagination Container Element
                if (paginationAttr['CONTAINERID']) {
                    cont = $$(this.MainElement).find("#" + paginationAttr['CONTAINERID']);
                    this.PaginationCtl = (cont.length > 0 ? cont[0].Element : undefined);
                }

                //  Get the Total Items to Display Per Page
                if (paginationAttr['PAGETOTAL'] && !isNaN(paginationAttr['PAGETOTAL'])) {
                    this.PageTotal = <number>paginationAttr['PAGETOTAL'];
                }
                else {
                    this.PageTotal = (this.TemplateType === IterationTemplateType.Mobile ? 1 : this.PageTotal);
                }

                //  Get the Text to Display for Showing the Filter
                if (filterAttr['SHOWTEXT']) {
                    this.ShowFilterText = filterAttr['SHOWTEXT'];
                }

                //  Get the Text to Display for Hiding the Filter
                if (filterAttr['HIDETEXT']) {
                    this.HideFilterText = filterAttr['HIDETEXT'];
                }

                //  Get the Filter Toggle Attributes
                if (filterAttr['TOGGLE']) {
                    var toggleVals: string[] = (<string>filterAttr['TOGGLE']).split(",");

                    for (var i: number = 0; i < toggleVals.length; i++) {
                        var toggleParts: string[] = toggleVals[i].trim().split("=");

                        if (toggleParts.length === 2) {

                            switch (toggleParts[0].trim().toUpperCase()) {
                                case "TOGGLEID":
                                    cont = $$(this.MainElement).find("#" + toggleParts[1].trim());
                                    this.FilterToggle = (cont.length > 0 ? cont[0].Element : undefined);
                                    break;
                                case "CONTAINERID":
                                    cont = $$(this.MainElement).find("#" + toggleParts[1].trim());
                                    this.FilterContainer = (cont.length > 0 ? cont[0].Element : undefined);
                                    break;
                            }

                        }

                    }

                }

                //  Get the Filter Field Attributes
                if (filterAttr['FIELDS']) {
                    var filterVals: string[] = (<string>filterAttr['FIELDS']).split(",");
                    
                    for (var i: number = 0; i < filterVals.length; i++) {
                        var filterParts: string[] = filterVals[i].trim().split("=");

                        if (filterParts.length === 2) {
                            cont = $$(this.MainElement).find("#" + filterParts[1].trim());

                            if (cont.length > 0)
                                filters.push(new FilterAttribute(filterParts[0].trim(), cont[0].Element));

                        }

                    }

                }

            }
            //  Cannot Find the Main/Parent Element: Re-Initialize as DIV Containing Error Message
            else {
                this.MainElement = document.createElement("div");
                $$(this.MainElement).html("<h4>Invalid Iteration Template</h4>");
            }

        }

        private InitializePagination(callback: (templateType: IterationTemplateType, itemIndex: number) => void): void {
            var container = document.createElement("div");
            var first: HTMLButtonElement = this.CreateNavigationButton('<i class="fa fa-angle-double-left" aria-hidden="true"></i>', this.First);
            var previous: HTMLButtonElement = this.CreateNavigationButton('<i class="fa fa-angle-left" aria-hidden="true"></i>', this.Previous);
            var next: HTMLButtonElement = this.CreateNavigationButton('<i class="fa fa-angle-right" aria-hidden="true"></i>', this.Next);
            var last: HTMLButtonElement = this.CreateNavigationButton('<i class="fa fa-angle-double-right" aria-hidden="true"></i>', this.Last);

            this.PaginationDisplay = document.createElement("div");

            $$(this.PaginationDisplay).css({
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
            $$(this.PaginationDisplay).attr("pagination-display", "true");

            if (this.TemplateType === IterationTemplateType.Desktop) {

                $$(container).css({
                    "display": "inline-table",
                    "height": "35px"
                });

                $$(container).append(first);
                $$(container).append(previous);
                $$(container).append(this.PaginationDisplay);
                $$(container).append(next);
                $$(container).append(last);
            }
            else {
                var buttonRow = document.createElement("div");
                var pageNoRow = document.createElement("div");
                
                $$(this.PaginationDisplay).css({
                    "width": "125px",
                    "min-width": "125px",
                    "max-width": "125px",
                    "float": "left",
                    "margin": "1.5px"
                });

                $$(pageNoRow).css({
                    "display": "inline-table",
                    "height": "35px",
                    "width": "100%"
                });

                $$(buttonRow).css({
                    "display": "inline-table",
                    "height": "35px",
                    "width": "100%"
                });
                
                $$(pageNoRow).append(this.PaginationDisplay);


                $$(buttonRow).append(first);
                $$(buttonRow).append(previous);
                $$(buttonRow).append(next);
                $$(buttonRow).append(last);


                $$(container).css({
                    "display": "inline-block",
                    "height": "70px"
                });

                $$(container).append(pageNoRow);
                $$(container).append(buttonRow);
            }

            $$(this.PaginationCtl).append(container);

        }

        private GetHtmlTemplate(templateType: string, defaultValue?: string): string {
            var cont: any = $$(this.TemplateContainer).find("[template-type=" + templateType + "]");
            return (cont.length > 0 ? <string>cont.body() : defaultValue);
        }

        private CreateNavigationButton = (html: string, clickHandler: (ev: MouseEvent) => void): HTMLButtonElement => {
            var button: HTMLButtonElement = document.createElement("button");

            $$(button).addClass("btn");
            
            $$(button).addClass("btn-default");

            if (this.TemplateType === IterationTemplateType.Desktop) {
                $$(button).addClass("btn-xs");

                $$(button).css({
                    "width": "23px",
                    "height": "23px",
                    "float": "left",
                    "margin": "1.5px"
                });

            }
            else {
                $$(button).addClass("btn-sm");

                $$(button).css({
                    "width": "30px",
                    "height": "30px",
                    "float": "left",
                    "margin": "1.5px"
                });

            }
            
            $$(button).html(html);

            button.onclick = clickHandler;

            return button;

        }

        private Sleep(milliseconds: number): void {
            for (var i: number = 0; i < milliseconds; i++) {
                console.count();
            }
        }
                //that.Filters.forEach((filter: FilterAttribute): void => {
                //    var inputControl: HTMLInputElement = filter.Control instanceof HTMLInputElement ? <HTMLInputElement>filter.Control : undefined;

                //    if (inputControl !== undefined && inputControl.tagName.toUpperCase() === "INPUT" && inputControl.type.toUpperCase() !== "CHECKBOX") {
                //        $(filter.Control).on("keyup", function (ev) {

                //            that.FilterObj.Add(filter.Attribute, $(this).val(), 5);

                //            that.FilteredItems = that.Model.filter(that.FilterObj.MeetsCriteria);


                //            if (that.FilteredItems) {
                //                that.PageIndex = 0;
                //                //that.TotalItems = (that.FilteredItems !== undefined ? that.FilteredItems.length : 0);
                //                that.TotalPages = Math.ceil((that.FilteredItems !== undefined ? that.FilteredItems.length : 0) / (that.PageTotal ? (that.PageTotal > 0 ? that.PageTotal : 5) : 5));

                //                var startIndex = that.PageIndex * that.PageTotal;
                //                var endIndex = (startIndex + that.PageTotal) > that.FilteredItems.length ? that.FilteredItems.length : (startIndex + that.PageTotal);

                //                //displayItems(that.FilteredItems.slice(startIndex, endIndex), that.ModelTemplate);

                //                if (that.PaginationCtl) {
                //                    $(that.PaginationCtl).find('[pagination-display="true"]').html("Page " + (that.PageIndex + 1) + " of " + that.TotalPages);
                //                }

                //            }


                //        });
                //    }
                //});
    }
    
    export class IterationCollection {
        Iterations: Iteration[];

        Add: (iteration: Iteration) => void;
        Refresh: () => void;
        RenderAll: () => void;
        StopAll: () => void;

        constructor() {
            var that = this;

            that.Iterations = new Array<Iteration>();

            that.Add = (iteration: Iteration): void => {
                if (iteration !== undefined) {
                    iteration.StartWatch();
                    that.Iterations.push(iteration);
                }
            }

            that.Refresh = (): void => {
                that.Iterations.forEach((iteration: Iteration): void => {
                    iteration.Refresh();
                });
            }


            that.RenderAll = (): void => {
                that.Iterations.forEach((iteration: Iteration): void => {
                    iteration.StartWatch();
                });
            }


            that.StopAll = (): void => {
                that.Iterations.forEach((iteration: Iteration): void => {
                    iteration.EndWatch();
                });
            }


        }

    }

    class FilterAttribute {
        Attribute: string;
        Control: HTMLElement;

        constructor(attribute: string, control: HTMLElement) {
            var that = this;

            that.Attribute = attribute;
            that.Control = control;

        }

    }

    export class BindingModel {
        Model: string;
        ModelValue: string;
        ModelElement: HTMLElement;
        ElementValue: string

        constructor() { }

    }


    //  Base Interface for All Bound Fields
    export interface IBoundField {
        //  Data Type of the Bound Field
        DataType: DataTypeArgs;

        //  The HTML Field the Model is Bound to
        Field: HTMLElement;

        //  The Name of the Property Holding the Value of the HTML Field
        PropertyName: string;

        //  The Object Containing the Property Holding the Value of the HTML Field
        Model: Object;

        //  The Scope Containing the Model
        Scope: Object;

        //  Method Called in Order to Set the Value of the Model Field
        Get: () => any;

        //  Method Called in Order to Set the Value of the HTML Field
        Set: (fld: HTMLElement, value: Object) => void;

    }

    //  Represents the Base Class of All Form Fields
    export class BoundFieldBase implements IBoundField {
        //  Data Type of the Bound Field
        DataType: DataTypeArgs;

        //  The HTML Field the Model is Bound to
        Field: HTMLElement;

        //  The Name of the Property Holding the Value of the HTML Field
        PropertyName: string;

        //  The Object Containing the Property Holding the Value of the HTML Field
        Model: Object;

        FullModel: string;

        //  The Scope Containing the Model
        Scope: Object;

        //  Method Called in Order to Set the Value of the Model Field
        Get: () => any;

        //  Method Called in Order to Set the Value of the HTML Field
        Set: (fld: HTMLElement, value: Object) => void;

        constructor(scope: Object, field: HTMLElement) {
            var that = this;

            that.Scope = scope;
            that.Field = field;

            var bindingParams: string[] = $(that.Field).attr("binding").split(";");

            if (bindingParams && bindingParams.length > 0) {
                var dataTypeValue: string = <string>that.GetParameterValue("DATATYPE", bindingParams);
                var modelValue: string = <string>that.GetParameterValue("MODEL", bindingParams);
                var defaultValue: string = <string>that.GetParameterValue("DEFAULTVALUE", bindingParams);
                var getValue: string = <string>that.GetParameterValue("GET", bindingParams);
                var setValue: string = <string>that.GetParameterValue("SET", bindingParams);

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

        //  Ensures the Model Exists and Sets the Default Value if Needed
        SetDefaultValue = (model: string, defaultValue: string, dataType: DataTypeArgs): void => {

            if (model.indexOf(".") > -1) {
                var parts = model.split(".");

                switch (parts.length) {
                    case 2:
                        if (!this.Scope[parts[0]]) {
                            this.Scope[parts[0]] = new Object();
                        }

                        this.Model = this.Scope[parts[0]];
                        this.PropertyName = parts[1];

                        if (!this.Model[this.PropertyName]) {
                            this.Model[this.PropertyName] = this.Cast(defaultValue, dataType, this.Model[this.PropertyName]);
                        }

                        break;
                    case 3:
                        if (!this.Scope[parts[0]]) {
                            this.Scope[parts[0]] = new Object();
                        }

                        if (!this.Scope[parts[0]][parts[1]]) {
                            this.Scope[parts[0]][parts[1]] = new Object();
                        }

                        this.Model = this.Scope[parts[0]][parts[1]];
                        this.PropertyName = parts[2];

                        if (!this.Model[this.PropertyName]) {
                            this.Model[this.PropertyName] = this.Cast(defaultValue, dataType, this.Model[this.PropertyName]);
                        }

                        break;
                    case 4:
                        if (!this.Scope[parts[0]]) {
                            this.Scope[parts[0]] = new Object();
                        }

                        if (!this.Scope[parts[0]][parts[1]]) {
                            this.Scope[parts[0]][parts[1]] = new Object();
                        }

                        if (!this.Scope[parts[0]][parts[1]][parts[2]]) {
                            this.Scope[parts[0]][parts[1]][parts[2]] = new Object();
                        }

                        this.Model = this.Scope[parts[0]][parts[1]][parts[2]];
                        this.PropertyName = parts[3];

                        if (!this.Model[this.PropertyName]) {
                            this.Model[this.PropertyName] = this.Cast(defaultValue, dataType, this.Model[this.PropertyName]);
                        }

                        break;
                    case 5:
                        if (!this.Scope[parts[0]]) {
                            this.Scope[parts[0]] = new Object();
                        }

                        if (!this.Scope[parts[0]][parts[1]]) {
                            this.Scope[parts[0]][parts[1]] = new Object();
                        }

                        if (!this.Scope[parts[0]][parts[1]][parts[2]]) {
                            this.Scope[parts[0]][parts[1]][parts[2]] = new Object();
                        }

                        if (!this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]) {
                            this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = new Object();
                        }

                        this.Model = this.Scope[parts[0]][parts[1]][parts[2]][parts[3]];
                        this.PropertyName = parts[4];

                        if (!this.Model[this.PropertyName]) {
                            this.Model[this.PropertyName] = this.Cast(defaultValue, dataType, this.Model[this.PropertyName]);
                        }

                }

            }
            else {

                this.Model = this.Scope;
                this.PropertyName = model;

                if (!this.Model[this.PropertyName]) {
                    this.Model[this.PropertyName] = this.Cast(defaultValue, dataType, this.Model[this.PropertyName]);
                }

            }

        }

        GetObject = (model: string): Object => {
            var obj: Object;

            if (model.indexOf(".") > -1) {
                var parts = model.split(".");

                switch (parts.length) {
                    case 2:
                        if (!this.Scope[parts[0]]) {
                            this.Scope[parts[0]] = new Object();
                        }

                        obj = this.Scope[parts[0]];

                        break;
                    case 3:
                        if (!this.Scope[parts[0]]) {
                            this.Scope[parts[0]] = new Object();
                        }

                        if (!this.Scope[parts[0]][parts[1]]) {
                            this.Scope[parts[0]][parts[1]] = new Object();
                        }

                        obj = this.Scope[parts[0]][parts[1]];

                        break;
                    case 4:
                        if (!this.Scope[parts[0]]) {
                            this.Scope[parts[0]] = new Object();
                        }

                        if (!this.Scope[parts[0]][parts[1]]) {
                            this.Scope[parts[0]][parts[1]] = new Object();
                        }

                        if (!this.Scope[parts[0]][parts[1]][parts[2]]) {
                            this.Scope[parts[0]][parts[1]][parts[2]] = new Object();
                        }

                        obj = this.Scope[parts[0]][parts[1]][parts[2]];

                        break;
                    case 5:
                        if (!this.Scope[parts[0]]) {
                            this.Scope[parts[0]] = new Object();
                        }

                        if (!this.Scope[parts[0]][parts[1]]) {
                            this.Scope[parts[0]][parts[1]] = new Object();
                        }

                        if (!this.Scope[parts[0]][parts[1]][parts[2]]) {
                            this.Scope[parts[0]][parts[1]][parts[2]] = new Object();
                        }

                        if (!this.Scope[parts[0]][parts[1]][parts[2]][parts[3]]) {
                            this.Scope[parts[0]][parts[1]][parts[2]][parts[3]] = new Object();
                        }

                        obj = this.Scope[parts[0]][parts[1]][parts[2]][parts[3]];

                        break;
                }

            }
            else {

                obj = this.Scope;

            }

            return obj;

        }

        //  Converts the Value of value Consistent with dataType
        Cast = (value: string, dataType: DataTypeArgs, currentValue: any = undefined): any => {

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
                var sDate: string = (dataType === DataTypeArgs.Time ? "1/1/1900 " + value : value);
                var date: Date = (value.toUpperCase() === "TODAY" ? new Date() : new Date(sDate));

                if (date.toDateString() !== "Invalid Date") {
                    var month: number = date.getMonth() + 1,
                        day = date.getDate(),
                        year = date.getFullYear(),
                        hour: number = (date.getHours() > 12 ? date.getHours() - 12 : (date.getHours() == 0 ? 12 : date.getHours())),
                        minutes: number = date.getMinutes(),
                        seconds: number = date.getSeconds(),
                        meridian: string = (date.getHours() >= 12 ? "PM" : "AM");

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

        }

        //  Gets the Value of the Named Parameter
        GetParameterValue = (name: string, params: string[]): any => {

            for (var i: number = 0; i < params.length; i++) {
                var param: string[] = params[i].split(":");

                if (param && param.length === 2) {

                    if (param[0].trim().toUpperCase() === name.toUpperCase()) {
                        return param[1].trim();
                    }

                }

            }

            return undefined;

        }

        //  Creates an Inherited Instance of BoundFieldBase Based on the Element Tag,
        //  and in the Case of INPUT Fields, the Field Type
        static CreateBoundField = (scope: Object, field: HTMLElement): IBoundField => {

            if (scope === undefined || field === undefined) {
                return undefined;
            }

            switch (field.tagName.toUpperCase()) {
                case "SELECT":
                    return new BoundSelectField(scope, field);
                case "INPUT":
                    var tagType: string = (<any>field).type;

                    if (tagType.toUpperCase() === "CHECKBOX") {
                        return new BoundCheckBoxField(scope, field);
                    }
                    else {
                        return new BoundInputField(scope, field);
                    }

                case "TEXTAREA":
                    return new BoundTextAreaField(scope, field);
            }

        }

    }

    //  Represents a Bound HTML Select Field
    export class BoundSelectField extends BoundFieldBase {
        SelectField: HTMLSelectElement;
        Options: HTMLOptionElement[];

        constructor(scope: Object, field: HTMLElement) {
            super(scope, field);

            var that = this,
                currentValue: any, // = that.Model[that.PropertyName],
                settingValue: boolean = false;

            that.SelectField = <HTMLSelectElement>field;
            that.SelectField.selectedIndex = -1;
            that.Options = new Array<HTMLOptionElement>();

            //  Get the Current Options so We Can Determine When They Change
            for (var i: number = 0; i < that.SelectField.options.length; i++) {
                var opt: HTMLOptionElement = <HTMLOptionElement>that.SelectField.options[i];
                that.Options.push(opt);
            }

            //  Update the Value Property Value of Model
            that.SelectField.onchange = (ev: Event) => {
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

            }

            //  Monitor Option Changes & Changes in the Property Value of the Model
            setInterval(() => {

                if (!settingValue) {

                    that.Model = that.GetObject(that.FullModel);

                    if (that.OptionsChanged(that.Options)) {
                        that.SelectField.selectedIndex = -1;
                        that.Options = new Array<HTMLOptionElement>();

                        for (var i: number = 0; i < that.SelectField.options.length; i++) {
                            var opt: HTMLOptionElement = <HTMLOptionElement>that.SelectField.options[i];
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

        //  Determines if the Options in the Select Element Have Changed
        OptionsChanged = (opts: HTMLOptionElement[]): boolean => {

            if ((this.SelectField.options && this.SelectField.options.length) && (opts && opts.length)) {

                if (this.SelectField.options.length === opts.length) {

                    for (var i: number = 0; i < opts.length; i++) {
                        var opt1: HTMLOptionElement = opts[i];
                        var elementFound: boolean = false;

                        for (var j: number = 0; j < this.SelectField.options.length; j++) {
                            var opt2: HTMLOptionElement = <HTMLOptionElement>this.SelectField.options[j];

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

        }

    }

    //  Represents a Bound HTML Text Type Input Field
    export class BoundInputField extends BoundFieldBase {
        InputField: HTMLInputElement;

        constructor(scope: Object, field: HTMLElement) {
            super(scope, field);

            var that = this,
                currentValue: any = that.Model[that.PropertyName],
                settingValue: boolean = false;

            that.InputField = <HTMLInputElement>field;
            that.InputField.value = removeEscapeChars(that.Model[that.PropertyName]);


            //  Update Model Property Value When Key Pressed
            that.InputField.onkeyup = (ev: KeyboardEvent) => {
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

            }

            //  Update Model Property Value When Value Changed
            that.InputField.onchange = (ev: Event) => {
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

            }

            //  Monitor Option Changes & Changes in the Property Value of the Model
            setInterval(() => {

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

    }

    //  Represents a Bound HTML CheckBox Type Input Field
    export class BoundCheckBoxField extends BoundFieldBase {
        CheckBox: HTMLInputElement;

        constructor(scope: Object, field: HTMLElement) {
            super(scope, field);

            var that = this,
                currentValue: any = that.Model[that.PropertyName],
                settingValue: boolean = false;

            that.CheckBox = <HTMLInputElement>field;

            if (that.Set !== undefined) {
                that.Set(that.CheckBox, that.Model);
            }
            else {
                $(that.CheckBox).prop("checked", that.Cast(that.Model[that.PropertyName], that.DataType));
            }

            //  Update Model Property Value When Key Pressed
            that.CheckBox.onclick = (ev: MouseEvent) => {
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

            }

            //  Monitor Option Changes & Changes in the Property Value of the Model
            setInterval(() => {

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

    }

    //  Represents a Bound HTML Text Type Input Field
    export class BoundTextAreaField extends BoundFieldBase {
        InputField: HTMLTextAreaElement;

        constructor(scope: Object, field: HTMLElement) {
            super(scope, field);

            var that = this,
                currentValue: any = that.Model[that.PropertyName],
                settingValue: boolean = false;

            that.InputField = <HTMLTextAreaElement>field;
            that.InputField.value = removeEscapeChars(that.Model[that.PropertyName]);

            //  Update Model Property Value When Key Pressed
            that.InputField.onkeyup = (ev: KeyboardEvent) => {
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

            }

            //  Update Model Property Value When Value Changed
            that.InputField.onchange = (ev: Event) => {
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

            }

            //  Monitor Option Changes & Changes in the Property Value of the Model
            setInterval(() => {

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

    }

}

module KrodSpa.Data {

    export enum HttpReadyStateArgs {
        Opened = 1,
        HeadersReceived = 2,
        LoadingResponse = 3,
        Done = 4
    }

    export enum HeaderTypeArgs {
        CacheControl = 0,
        Accept = 1,
        ContentType = 2,
        Authorization = 5
    }

    export class HttpHeader {
        Key: string;
        Value: string;

        constructor(headerType: HeaderTypeArgs, value: string) {
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

        static GetHeaderKeyValue = (Key: HeaderTypeArgs): string => {

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

        }

        static NoCache = (): HttpHeader => {
            return new HttpHeader(HeaderTypeArgs.CacheControl, "no-cache");
        }

        static AcceptJSon = (): HttpHeader => {
            return new HttpHeader(HeaderTypeArgs.Accept, "text/json");
        }

        static AcceptXML = (): HttpHeader => {
            return new HttpHeader(HeaderTypeArgs.Accept, "text/xml");
        }

        static ContentTypeFormUrlEncoded = (): HttpHeader => {
            return new HttpHeader(HeaderTypeArgs.ContentType, "application/x-www-form-urlencoded");
        }

        static ContentTypeApplicationJSon = (): HttpHeader => {
            return new HttpHeader(HeaderTypeArgs.ContentType, "application/json");
        }

    }

    //  Holds a Collection of HTTP Headers to be Used in Web Requests Made by WebQuery
    export class HttpHeaderCollection {

        AddHeader: (header: HttpHeader) => void;
        CreateHeader: (headerType: HeaderTypeArgs, headerValue: string) => void;
        Length: () => number;
        Item: (idx: number) => HttpHeader;
        Get: (Key: HeaderTypeArgs) => HttpHeader;
        HasHeader: (Key: HeaderTypeArgs) => boolean;

        constructor() {
            var that = this,
                items: HttpHeader[] = new Array<HttpHeader>();

            that.Length = () => {
                return items.length;
            }

            that.Item = (idx: number): HttpHeader => {
                if (idx < items.length) {
                    return items[idx];
                }
                else {
                    return null;
                }
            }

            that.Get = (Key: HeaderTypeArgs): HttpHeader => {
                var hdr: HttpHeader = undefined;

                for (var i = 0; i < items.length; i++) {
                    if (items[i].Key === HttpHeader.GetHeaderKeyValue(Key)) {
                        hdr = items[i];
                        break;
                    }
                }

                return hdr;

            }

            that.HasHeader = (Key: HeaderTypeArgs): boolean => {

                for (var i = 0; i < items.length; i++) {
                    if (items[i].Key === HttpHeader.GetHeaderKeyValue(Key)) {
                        return true;
                    }
                }

                return false;

            }

            that.AddHeader = (header: HttpHeader): void => {

                if (header) {

                    for (var i = 0; i < items.length; i++) {
                        if (items[i].Key === header.Key) {
                            items[i].Value += ", " + header.Value;
                            return;
                        }
                    }

                    items.push(header);

                }

            }

            that.CreateHeader = (headerType: HeaderTypeArgs, headerValue: string): void => {
                var header = new HttpHeader(headerType, headerValue);

                for (var i = 0; i < items.length; i++) {
                    if (items[i].Key === header.Key) {
                        items[i].Value += ", " + headerValue;
                        return;
                    }
                }

                items.push(header);

            }

        }

    }

    //  Used to Load Server Resources, and Send & Retrieve Data to & from RESTful Web Services
    export class WebQuery {

        //  Loads the rource located on the server specified in the URL
        static load = (url: string, showWait: boolean = false): Promise => {
            var body: HTMLBodyElement = <HTMLBodyElement>$("body")[0];

            //  To ensure the enduser cannot interact with the DOM while transaction is being processed
            //  It creates a transparent overlay over the screen so that they can still see the screen,
            //  but are unable to click any buttons, or make changes to any selections or other inputs
            var progressMask: HTMLDivElement = <HTMLDivElement>WebQuery.CreateElement("div", "", undefined, undefined);

            //  Provides a visual progress indicator so that the enduser can see the steps being executed
            var messageElement: HTMLDivElement = <HTMLDivElement>WebQuery.CreateElement("div", "", undefined, undefined);

            //  Builds our mask & progress indicator, and adds them to the DOM
            var progressContainer: HTMLDivElement = WebQuery.CreateProgressWindow(progressMask, messageElement);


            if (showWait === true) {
                $(body).append(progressMask);
                $(body).append(progressContainer);
            }




            var xhr = new XMLHttpRequest(),
                promise = new Promise(),
                result;

            try {

                //  We'll create the event handler before opening the URL so that we'll
                //  receive the Opened & HeadersReceived state changes
                xhr.onreadystatechange = (ev: ProgressEvent) => {

                    //  Display the progress as readyState changes
                    if (xhr.readyState === <number>HttpReadyStateArgs.Opened) {
                        $(messageElement).html("Sending Request...");
                    }

                    if (xhr.readyState === <number>HttpReadyStateArgs.HeadersReceived) {
                        $(messageElement).html("Receiving Response...");
                    }

                    if (xhr.readyState === <number>HttpReadyStateArgs.LoadingResponse) {
                        $(messageElement).html("Processing Data...");
                    }


                    //  Response is OK so we'll call the resolve method on our Promise object instance
                    if (xhr.readyState === <number>HttpReadyStateArgs.Done && xhr.status === 200) {

                        if (showWait === true) {
                            $(progressContainer).remove();
                            $(progressMask).remove();
                        }

                        promise.resolve((xhr.responseText ? xhr.responseText : (xhr.responseXML ? xhr.responseXML : (xhr.response ? xhr.response : ""))));
                    }


                    //  Response is Not OK so we'll call the reject method on our Promise object instance
                    if (xhr.readyState === <number>HttpReadyStateArgs.Done && xhr.status !== 200) {

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
                xhr.onerror = (ev: Event) => {

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

        }


        //  Calls a RESTful web service, and performs a GET operation
        static RestfulGet = (url: string, parameters: string, headers: HttpHeaderCollection, showWait: boolean = true): Promise => {
            var body: HTMLBodyElement = <HTMLBodyElement>$("body")[0];

            //  To ensure the enduser cannot interact with the DOM while transaction is being processed
            //  It creates a transparent overlay over the screen so that they can still see the screen,
            //  but are unable to click any buttons, or make changes to any selections or other inputs
            var progressMask: HTMLDivElement = <HTMLDivElement>WebQuery.CreateElement("div", "", undefined, undefined);

            //  Provides a visual progress indicator so that the enduser can see the steps being executed
            var messageElement: HTMLDivElement = <HTMLDivElement>WebQuery.CreateElement("div", "", undefined, undefined);

            //  Builds our mask & progress indicator, and adds them to the DOM
            var progressContainer: HTMLDivElement = WebQuery.CreateProgressWindow(progressMask, messageElement);

            if (showWait === true) {
                $(body).append(progressMask);
                $(body).append(progressContainer);
            }



            var xhr = new XMLHttpRequest(),
                promise = new Promise(),
                result;

            try {

                //  We'll create the event handler before opening the URL so that we'll
                //  receive the Opened & HeadersReceived state changes
                xhr.onreadystatechange = (ev: ProgressEvent) => {

                    //  Display the progress as readyState changes
                    if (xhr.readyState === <number>HttpReadyStateArgs.Opened) {
                        $(messageElement).html("Sending Request...");
                    }

                    if (xhr.readyState === <number>HttpReadyStateArgs.HeadersReceived) {
                        $(messageElement).html("Receiving Response...");
                    }

                    if (xhr.readyState === <number>HttpReadyStateArgs.LoadingResponse) {
                        $(messageElement).html("Processing Data...");
                    }


                    //  Response is OK so we'll call the resolve method on our Promise object instance
                    if (xhr.readyState === <number>HttpReadyStateArgs.Done && xhr.status === 200) {

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
                    if (xhr.readyState === <number>HttpReadyStateArgs.Done && xhr.status !== 200) {

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
                xhr.onerror = (ev: Event) => {

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

        }


        //  Calls a RESTful web service, and performs a POST operation
        static RestfulPost = (url: string, model: any, headers: HttpHeaderCollection): Promise => {
            var body: HTMLBodyElement = <HTMLBodyElement>$("body")[0];

            //  To ensure the enduser cannot interact with the DOM while transaction is being processed
            //  It creates a transparent overlay over the screen so that they can still see the screen,
            //  but are unable to click any buttons, or make changes to any selections or other inputs
            var progressMask: HTMLDivElement = <HTMLDivElement>WebQuery.CreateElement("div", "", undefined, undefined);

            //  Provides a visual progress indicator so that the enduser can see the steps being executed
            var messageElement: HTMLDivElement = <HTMLDivElement>WebQuery.CreateElement("div", "", undefined, undefined);

            //  Builds our mask & progress indicator, and adds them to the DOM
            var progressContainer: HTMLDivElement = WebQuery.CreateProgressWindow(progressMask, messageElement);

            $(body).append(progressMask);
            $(body).append(progressContainer);

            var xhr = new XMLHttpRequest(),
                promise = new Promise(),
                result;

            try {

                //  We'll create the event handler before opening the URL so that we'll
                //  receive the Opened & HeadersReceived state changes
                xhr.onreadystatechange = (ev: ProgressEvent) => {

                    //  Display the progress as readyState changes
                    if (xhr.readyState === <number>HttpReadyStateArgs.Opened) {
                        $(messageElement).html("Sending Request...");
                    }

                    if (xhr.readyState === <number>HttpReadyStateArgs.HeadersReceived) {
                        $(messageElement).html("Receiving Response...");
                    }

                    if (xhr.readyState === <number>HttpReadyStateArgs.LoadingResponse) {
                        $(messageElement).html("Processing Data...");
                    }


                    //  Response is OK so we'll call the resolve method on our Promise object instance
                    if (xhr.readyState === <number>HttpReadyStateArgs.Done && xhr.status === 200) {

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
                    if (xhr.readyState === <number>HttpReadyStateArgs.Done && xhr.status !== 200) {

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
                xhr.onerror = (ev: Event) => {

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

        }


        //  Calls a RESTful web service, and performs a POST operations for each element found in parameter postParams
        //  THIS METHOD HAS NOT YET BEEN IMPLEMENTED
        static RestfulPostAll = (postParams: { url: string; model: any }[], headers: HttpHeaderCollection): Promise => {
            var body: HTMLBodyElement = <HTMLBodyElement>$("body")[0];
            var progressMask: HTMLDivElement = <HTMLDivElement>WebQuery.CreateElement("div", "", undefined, undefined);
            var messageElement: HTMLDivElement = <HTMLDivElement>WebQuery.CreateElement("div", "", undefined, undefined);
            var progressContainer: HTMLDivElement = WebQuery.CreateProgressWindow(progressMask, messageElement);

            $(body).append(progressMask);
            $(body).append(progressContainer);

            var xhr = new XMLHttpRequest(),
                promise = new Promise(),
                result;


            return promise;

        }


        //  Creates the Progress Mask & Indicator Controls that are displayed 
        //  while our XMLHttpRequest operations are being performed
        static CreateProgressWindow = (progressMask: HTMLDivElement, messageElement: HTMLDivElement): HTMLDivElement => {
            var body: HTMLBodyElement = <HTMLBodyElement>$("body")[0];
            var container: HTMLDivElement = <HTMLDivElement>WebQuery.CreateElement("div", "", undefined, undefined);
            var progress: HTMLDivElement = <HTMLDivElement>WebQuery.CreateElement("div", "", undefined, undefined);

            $(progressMask).css("position", "fixed");
            $(progressMask).css("left", "0");
            $(progressMask).css("top", "0");
            $(progressMask).css("width", "100%");
            $(progressMask).css("height", "100%");
            $(progressMask).css("background-color", "transparent");


            var top: number = 0, left: number = 0;

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

        }

        //  Creates the HTML element specified in elementType, and adds the classes and attributes defined in classList &
        //  attributes respectiviely. It then sets the innerHTML property equal to the value of innerHtml parameter
        static CreateElement = (elementType: string, innerHtml: string, classList: string[], attributes: { Key: string; Value: string }[]): HTMLElement => {
            var element: HTMLElement = document.createElement(elementType);


            if (classList !== undefined) {
                classList.forEach((value: any) => {
                    $(element).addClass(value);
                });
            }

            if (attributes !== undefined) {
                attributes.forEach((value: any) => {
                    $(element).attr(value.Key, value.Value);
                });
            }

            element.innerHTML = innerHtml;

            return element;

        }

    }

    export class FilterObject {
        FieldName: string;
        FilterValue: any;
        DataType: number;

        constructor() {
            var that = this;
        }

    }

    export class FilterObjectCollection {
        Filter: FilterObject[];

        Add: (name: string, value: any, datatType: number) => void;
        UpdateValue: (name: string, value: any) => void;

        ContainsField: (name: string) => boolean;
        MeetsCriteria: (value: any) => boolean;

        constructor() {
            var that = this;

            that.Filter = new Array<FilterObject>();

            that.Add = (name: string, value: any, datatType: number): void => {

                if (that.ContainsField(name)) {
                    that.UpdateValue(name, value);
                }
                else {
                    var filterObj: FilterObject = new FilterObject();

                    filterObj.FieldName = name;
                    filterObj.FilterValue = value;
                    filterObj.DataType = datatType;

                    that.Filter.push(filterObj);

                }

            }

            that.UpdateValue = (name: string, value: any): void => {

                for (var i: number = 0; i < that.Filter.length; i++) {
                    if (that.Filter[i].FieldName.toLowerCase() === name.toLowerCase()) {
                        that.Filter[i].FilterValue = value;
                        break;
                    }
                }

            }

            that.ContainsField = (name: string): boolean => {

                for (var i: number = 0; i < that.Filter.length; i++) {
                    if (that.Filter[i].FieldName.toLowerCase() === name.toLowerCase()) {
                        return true;
                    }
                }

                return false;

            }


            that.MeetsCriteria = (value: any): boolean => {
                var totalFilterFields: number = that.Filter.length;
                var totalMatchedFields: number = 0;

                for (var i: number = 0; i < that.Filter.length; i++) {

                    if (value[that.Filter[i].FieldName] !== undefined) {
                        var compareDates = (d1: any, d2: any): boolean => {
                            if (Krodzone.KrodzoneDate.dateValid(d1) && Krodzone.KrodzoneDate.dateValid(d2)) {
                                var dateOne: Date = new Date(d1);
                                var dateTwo: Date = new Date(d2);
                                return (dateOne >= dateTwo);
                            }
                            return true;
                        }

                        switch (that.Filter[i].DataType) {
                            case 0:     //  Int
                                var intOne: number = (!isNaN(parseInt(value[that.Filter[i].FieldName])) ? parseInt(value[that.Filter[i].FieldName]) : -1);
                                var intTwo: number = (!isNaN(parseInt(that.Filter[i].FilterValue)) ? parseInt(that.Filter[i].FilterValue) : -1);

                                if (intOne > -1 && intTwo > -1) {
                                    if (intOne >= intTwo) {
                                        totalMatchedFields++;
                                    }
                                }

                                break;
                            case 1:     //  Float
                                var floatOne: number = (!isNaN(parseFloat(value[that.Filter[i].FieldName])) ? parseFloat(value[that.Filter[i].FieldName]) : -1);
                                var floatTwo: number = (!isNaN(parseFloat(that.Filter[i].FilterValue)) ? parseFloat(that.Filter[i].FilterValue) : -1);

                                if (floatOne > -1 && floatTwo > -1) {
                                    if (floatOne >= floatTwo) {
                                        totalMatchedFields++;
                                    }
                                }

                                break;
                            case 2:     //  Date
                                var dateMatchFound: boolean = compareDates(value[that.Filter[i].FieldName], that.Filter[i].FilterValue);

                                if (dateMatchFound) {
                                    totalMatchedFields++;
                                }

                                break;
                            case 3:     //  Time
                                var timeMatchFound: boolean = compareDates("1/1/1900 " + value[that.Filter[i].FieldName], "1/1/1900 " + that.Filter[i].FilterValue);

                                if (timeMatchFound) {
                                    totalMatchedFields++;
                                }

                                break;
                            case 4:     //  DateTime
                                var dateTimeMatchFound: boolean = compareDates(value[that.Filter[i].FieldName], that.Filter[i].FilterValue);

                                if (dateTimeMatchFound) {
                                    totalMatchedFields++;
                                }

                                if (compareDates(value[that.Filter[i].FieldName], that.Filter[i].FilterValue)) {
                                    totalMatchedFields++;
                                }
                                break;
                            default:     //  String
                                var stringOne: string = value[that.Filter[i].FieldName].toString().toLowerCase();
                                var stringTwo: string = that.Filter[i].FilterValue.toString().toLowerCase();

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

            }

        }

    }

}

module KrodSpa.Views {


    /******************************************************************************************************************
     * 
     * BASE CLASS FOR ALL HTML VIEWS 
     * 
     ******************************************************************************************************************/

    //  Base Class
    export class HtmlControl {

        constructor() { }

        //  Creates the HTML element specified in elementType, and adds the classes and attributes defined in classList &
        //  attributes respectiviely. It then sets the innerHTML property equal to the value of innerHtml parameter
        CreateElement = (elementType: string, innerHtml: string, classList: string[], attributes: { Keys: string[]; Values: string[] }): HTMLElement => {
            var element: HTMLElement = document.createElement(elementType);

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

        }

        //  Used to get the value of a property found in the supplied CSS class
        GetCssValue = (className: string, property: string): string => {

            for (var i = 0; i < document.styleSheets.length; i++) {

                try {
                    var styleSheet: any = document.styleSheets[i];
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

        }

        //  Retrieves the Elements physical location on the page
        GetElementCoordinates = (el: HTMLElement, offsetWidth?: boolean, childWidth?: number): ElementLocation => {
            var rect = el.getBoundingClientRect();
            var docEl = document.documentElement;

            var elemTop = Math.ceil(rect.top + window.pageYOffset - docEl.clientTop);
            var elemLeft = Math.ceil(rect.left + window.pageXOffset - docEl.clientLeft);

            var elemHeight = el.clientHeight;

            if (offsetWidth && childWidth && offsetWidth === true) {
                elemLeft = elemLeft - Math.abs(el.clientWidth - childWidth);
            }

            return new ElementLocation(elemLeft, (elemTop + elemHeight + 2));
        }

    }

    //  Used for returning an elements physical location on a page
    export class ElementLocation {
        X: string;
        Y: string;

        constructor(x: number, y: number) {
            var that = this;

            that.X = x + "px";
            that.Y = y + "px";

        }

    }



    //  Used for Determining MessageBox Type
    export enum MessageBoxTypeArgs {
        Information = 0,
        Question = 1,
        Exclamation = 2
    }

    //  Used for Determining Return Types for MessageBox Result
    export enum MessageBoxButtonArgs {
        Ok = 0,
        OkCancel = 1,
        YesNo = 2
    }

    //  Used for Determining Return Types for MessageBox Result
    export enum MessageBoxResultArgs {
        Ok = 0,
        Cancel = 1,
        Yes = 2,
        No = 3
    }

    //  Dialog Window
    export class ModalWindow extends HtmlControl {
        Mask: ModalMask;
        View: HTMLElement;
        ModalArgs: ModalWindowArgs;

        //  Displays a close button in the top right corner of the dialog window
        ModalClose: HTMLDivElement;

        //  The container that holds the HTML view
        ModalContainer: HTMLDivElement;

        //  The button that calls the execution code
        ExecuteButton: HTMLButtonElement;
        //  The button that calls the cancel/close modal code
        CancelButton: HTMLButtonElement;

        //  The Form Field Validator
        Validator: IViewValidator;

        //  Called by the execution method if the code usccessfully finishes
        SuccessResult: (success: boolean, message: string) => void;

        Close: () => void;

        constructor(view: HTMLElement, modalArgs: ModalWindowArgs) {
            super();

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

            var viewValid = (view: HTMLElement): boolean => {
                var formValidator: any = $(view).find('formvalidator');

                if (formValidator && formValidator.length > 0) {
                    var validationParent: HTMLElement = <HTMLElement>formValidator[0];
                    var validationChildren: HTMLElement[] = <HTMLElement[]>$(validationParent).find('[validate]').toArray();
                    var errorContainer: HTMLElement = ($("#" + $(validationParent).attr("errorcontainerid")) ? <HTMLElement>$("#" + $(validationParent).attr("errorcontainerid"))[0] : undefined);
                    var errorMsgElement: HTMLElement = ($("#" + $(validationParent).attr("errormessageid")) ? <HTMLElement>$("#" + $(validationParent).attr("errormessageid"))[0] : undefined);

                    if (errorMsgElement) {
                        $(errorMsgElement).removeClass("alert-danger");
                        $(errorMsgElement).removeClass("alert-success");
                    }

                    if (errorContainer) {
                        $(errorContainer).hide();
                    }

                    if (validationChildren) {
                        var viewIsValid: boolean = true;
                        var errorMsg: string = "";

                        for (var i = 0; i < validationChildren.length; i++) {
                            var element: HTMLElement = validationChildren[i];
                            var validationRules: string[] = $(element).attr("validationrule").split(",");
                            var elementValue: string = $(element).val();

                            $(element).removeClass("form-error");

                            if (validationRules && validationRules.length > 0) {
                                var validationMsgs: string[] = ($(element).attr("validationmessage") ? $(element).attr("validationmessage") : "Required field!").split(",");

                                for (var ruleIDX = 0; ruleIDX < validationRules.length; ruleIDX++) {
                                    var rule: string = validationRules[ruleIDX];
                                    var validationMsg: string = (validationMsgs[ruleIDX] ? validationMsgs[ruleIDX] : "Required Field!");

                                    switch (rule.toUpperCase()) {
                                        case "RANGE":

                                            try {
                                                var rangeValue: number = (parseFloat(elementValue) === NaN ? -1 : parseFloat(elementValue));
                                                var minRange: number = (parseFloat(elementValue) === NaN ? 0 : (parseFloat($(element).attr("min-range")) === NaN ? rangeValue + 1 : parseFloat($(element).attr("min-range"))));
                                                var maxRange: number = (parseFloat(elementValue) === NaN ? 1 : ($(element).attr("max-range") === "*" ? rangeValue + minRange + 10 : (parseFloat($(element).attr("max-range")) === NaN ? rangeValue - 1 : parseFloat($(element).attr("max-range")))));

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
                                                var negationValue: string = $(negatationObj).val();

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
                                                var matchValue: string = $(matchObj).val();

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
                                            var method: string = ($(element).attr("validationmethod") ? $(element).attr("validationmethod").substring(0, $(element).attr("validationmethod").indexOf("(")) : "0000");

                                            if (currentController.Scope[method] && !currentController.Scope[method](elementValue)) {
                                                $(element).addClass("form-error");

                                                viewIsValid = false;
                                                errorMsg = (errorMsg === "" ? validationMsg : errorMsg + "<br>" + validationMsg);
                                            }

                                            break;
                                        case "REGEX":
                                            var pattern: string = ($(element).attr("validationpattern") ? $(element).attr("validationpattern") : "(([0-9]|[a-z])\s*){0,}");
                                            var matches: RegExpMatchArray = elementValue.match(new RegExp(pattern, "i"));

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

            var setSuccessMessage = (view: HTMLElement, alertClass: string, message: string) => {
                var formValidator: any = $(view).find('formvalidator');

                if (formValidator && formValidator.length > 0) {
                    var validationParent: HTMLElement = <HTMLElement>formValidator[0];
                    var errorContainer: HTMLElement = ($("#" + $(validationParent).attr("errorcontainerid")) ? <HTMLElement>$("#" + $(validationParent).attr("errorcontainerid"))[0] : undefined);
                    var errorMsgElement: HTMLElement = ($("#" + $(validationParent).attr("errormessageid")) ? <HTMLElement>$("#" + $(validationParent).attr("errormessageid"))[0] : undefined);

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

            document.documentElement.onscroll = (ev: UIEvent): void => {
                var top: number = 50 + (document.documentElement.scrollTop === document.body.scrollTop ? document.documentElement.scrollTop : (document.documentElement.scrollTop > 0 && document.body.scrollTop === 0 ? document.documentElement.scrollTop : document.body.scrollTop));
                var modalContainers: HTMLDivElement[] = <Array<HTMLDivElement>>$(".modal-window").toArray();

                $(".modal-window").each(function () {
                    var element: HTMLElement = <HTMLElement>$(this)[0];

                    if (top < element.offsetTop && element.offsetTop > 50) {
                        element.style.top = top + "px";
                    }

                });

            }

            //  Create the Success Response Event Handler
            that.SuccessResult = (success: boolean, message: string) => {
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
            }


            //  Close the Modal Window
            that.Close = () => {

                if (that.ModalArgs.CancelButtonCallback !== undefined) {
                    that.ModalArgs.CancelButtonCallback(that);
                }

                //  Remove the Modal Mask & Modal Window from the DOM
                var body: HTMLBodyElement = <HTMLBodyElement>document.getElementsByTagName("body")[0];

                if (body !== undefined) {

                    try {
                        body.removeChild(that.Mask.MaskElement);
                        body.removeChild(that.ModalContainer);
                    }
                    catch (e) {
                        //  NO NOTHING: THE CONTROL HAS ALREADY BEEN REMOVED
                    }

                }

            }


            //  Handle the Cancel Button Click Event
            that.CancelButton.onclick = (ev: MouseEvent) => {
                that.Close();
            }

            //  Handle the Close Button Click Event
            that.ModalClose.onclick = (ev: MouseEvent) => {
                that.Close();
            }


            //  Call the Execution Method
            that.ExecuteButton.onclick = (ev: MouseEvent) => {

                if (that.ModalArgs.ExecuteButtonCallback) {

                    if (that.Validator.FormValid()) {
                        that.ExecuteButton.disabled = true;
                        that.CancelButton.disabled = true;
                        that.ModalArgs.ExecuteButtonCallback(that.SuccessResult);
                    }

                }

            }

            $(that.ModalContainer).find("input").on("keypress", (ev: any): void => {
                if (ev.keyCode === 13) {
                    that.ExecuteButton.click();
                }
            });

        }

        //  Creates the Modal Window and Prepares it to be Added to the Body
        CreateModalWindow = (): void => {
            this.ModalContainer = <HTMLDivElement>this.CreateElement("div", "", ["modal-window", this.ModalArgs.ModalWidth], undefined);
            this.ModalClose = <HTMLDivElement>this.CreateElement("div", '<i class="fa fa-close"></i>', undefined, undefined);
            this.ExecuteButton = <HTMLButtonElement>this.CreateElement("button", this.ModalArgs.ExecutionHtml, ["btn", "btn-primary", "pull-right"], undefined);
            this.CancelButton = <HTMLButtonElement>this.CreateElement("button", this.ModalArgs.CancelHtml, ["btn", "btn-warning", "pull-right"], undefined);

            //  Created the Modal Title
            var modalTitle: HTMLDivElement = <HTMLDivElement>this.CreateElement("div", "<span>" + this.ModalArgs.ModalCaption + "</span>", ["title"], undefined);
            modalTitle.appendChild(this.ModalClose);

            this.ModalContainer.appendChild(modalTitle);


            //  Add the View to the Body of the Modal
            var modalBody: HTMLDivElement = <HTMLDivElement>this.CreateElement("div", "", ["body"], undefined);
            modalBody.appendChild(this.View);

            this.ModalContainer.appendChild(modalBody);


            //  Add the Buttons if Required
            if (this.ModalArgs.ShowExecuteButton || this.ModalArgs.ShowCancelButton) {
                var modalButtons: HTMLDivElement = <HTMLDivElement>this.CreateElement("div", "", ["button"], undefined);

                if (this.ModalArgs.ShowCancelButton) {
                    modalButtons.appendChild(this.CancelButton);
                }

                if (this.ModalArgs.ShowExecuteButton) {
                    modalButtons.appendChild(this.ExecuteButton);
                }

                this.ModalContainer.appendChild(modalButtons);

            }


            //  Created the Modal Footer
            var modalFooter: HTMLDivElement = <HTMLDivElement>this.CreateElement("div", this.ModalArgs.FooterText, ["footer"], undefined);

            this.ModalContainer.appendChild(modalFooter);

        }

        static showDialog = (view: HTMLElement, modalArgs: ModalWindowArgs): void => {
            var modal: ModalWindow = new ModalWindow(view, modalArgs);
            var body: HTMLBodyElement = <HTMLBodyElement>document.getElementsByTagName("body")[0];
            var sWidth: string = modal.GetCssValue(".modal-window ." + modal.ModalArgs.ModalWidth, "width");
            var top: number = 50 + (document.documentElement.scrollTop === document.body.scrollTop ? document.documentElement.scrollTop : (document.documentElement.scrollTop > 0 && document.body.scrollTop === 0 ? document.documentElement.scrollTop : document.body.scrollTop));
            var width: number = 0, left: number = 0;
            
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

                if (width > window.innerWidth) {
                    width = Math.ceil(window.innerWidth * .95);
                    left = Math.ceil((window.innerWidth - width) / 2);
                    $$(modal.ModalContainer).removeClass(modal.ModalArgs.ModalWidth);
                    $$(modal.ModalContainer).find(".form-control").addClass("form-control-inline");
                }

            }
            catch (e) {
                width = (window.innerWidth * .95);
                left = ((window.innerWidth - width) / 2);
            }

            //  Set the absolute width of the Modal Window
            modal.ModalContainer.style.width = width + "px";
            //  Set the absolute value of the X axis
            modal.ModalContainer.style.left = left + "px";
            //  Set the absolute value of the Y axis
            modal.ModalContainer.style.top = top + "px";
            
            body.appendChild(modal.Mask.MaskElement);
            body.appendChild(modal.ModalContainer);

        }

    }

    //  MessageBox
    export class MessageBox extends HtmlControl {
        Mask: ModalMask;
        View: HTMLElement;
        ModalArgs: MessageBoxWindowArgs;

        //  Displays a close button in the top right corner of the dialog window
        ModalClose: HTMLDivElement;

        //  The container that holds the HTML view
        ModalContainer: HTMLDivElement;

        MsgBoxType: MessageBoxTypeArgs;
        MsgBoxButtons: MessageBoxButtonArgs;

        //  The button that calls the execution code
        AssentButton: HTMLButtonElement;
        //  The button that calls the cancel/close modal code
        AbortButton: HTMLButtonElement;
        
        Close: (result: MessageBoxResultArgs) => void;

        constructor(messageHtml: string, messageTitle: string, msgboxType: MessageBoxTypeArgs, msgboxButtons: MessageBoxButtonArgs, modalArgs: MessageBoxWindowArgs) {
            super();

            var that = this;

            var createView = (msg: string, icon: MessageBoxTypeArgs): HTMLElement => {
                var container: HTMLElement = that.CreateElement("div", "", ["row"], undefined);
                var iconClass: string = (icon === MessageBoxTypeArgs.Information ? "information-icon" : (icon === MessageBoxTypeArgs.Question ? "question-icon" : (icon === MessageBoxTypeArgs.Exclamation ? "exclamation-icon" : "information-icon")));
                var iconCell: HTMLElement = that.CreateElement("div", '<div class="' + iconClass + '">&nbsp;</div>', ["col-md-2"], undefined);
                var msgCell: HTMLElement = that.CreateElement("div", msg, ["col-md-10", "padding-top-10"], undefined);
                
                container.appendChild(iconCell);
                container.appendChild(msgCell);

                return container;

            }

            that.View = createView(messageHtml, msgboxType);
            that.ModalArgs = modalArgs;

            that.MsgBoxType = msgboxType;
            that.MsgBoxButtons = msgboxButtons;

            that.Mask = new ModalMask("opaque");
            


            that.CreateModalWindow();

            document.documentElement.onscroll = (ev: UIEvent): void => {
                var top: number = 50 + (document.documentElement.scrollTop === document.body.scrollTop ? document.documentElement.scrollTop : (document.documentElement.scrollTop > 0 && document.body.scrollTop === 0 ? document.documentElement.scrollTop : document.body.scrollTop));
                var modalContainers: HTMLDivElement[] = <Array<HTMLDivElement>>$(".modal-window").toArray();

                $(".modal-window").each(function () {
                    var element: HTMLElement = <HTMLElement>$(this)[0];

                    if (top < element.offsetTop && element.offsetTop > 50) {
                        element.style.top = top + "px";
                    }

                });

            }
            

            //  Close the Modal Window
            that.Close = (result: MessageBoxResultArgs) => {

                if (that.ModalArgs.MessageBoxCallback !== undefined) {
                    that.ModalArgs.MessageBoxCallback(result);
                }

                //  Remove the Modal Mask & Modal Window from the DOM
                var body: HTMLBodyElement = <HTMLBodyElement>document.getElementsByTagName("body")[0];

                if (body !== undefined) {

                    try {
                        body.removeChild(that.Mask.MaskElement);
                        body.removeChild(that.ModalContainer);
                    }
                    catch (e) {
                        //  NO NOTHING: THE CONTROL HAS ALREADY BEEN REMOVED
                    }

                }

            }


            //  Handle the Cancel Button Click Event
            that.AbortButton.onclick = (ev: MouseEvent) => {
                var result: MessageBoxResultArgs = (that.MsgBoxButtons === MessageBoxButtonArgs.Ok || that.MsgBoxButtons === MessageBoxButtonArgs.OkCancel ? MessageBoxResultArgs.Cancel : MessageBoxResultArgs.No);
                that.Close(result);
            }

            //  Handle the Close Button Click Event
            that.ModalClose.onclick = (ev: MouseEvent) => {
                var result: MessageBoxResultArgs = (that.MsgBoxButtons === MessageBoxButtonArgs.Ok || that.MsgBoxButtons === MessageBoxButtonArgs.OkCancel ? MessageBoxResultArgs.Cancel : MessageBoxResultArgs.No);
                that.Close(result);
            }


            //  Call the Execution Method
            that.AssentButton.onclick = (ev: MouseEvent) => {
                var result: MessageBoxResultArgs = (that.MsgBoxButtons === MessageBoxButtonArgs.Ok || that.MsgBoxButtons === MessageBoxButtonArgs.OkCancel ? MessageBoxResultArgs.Ok : MessageBoxResultArgs.Yes);
                that.Close(result);
            }
            

        }

        //  Creates the Modal Window and Prepares it to be Added to the Body
        CreateModalWindow = (): void => {
            this.ModalContainer = <HTMLDivElement>this.CreateElement("div", "", ["modal-window", this.ModalArgs.ModalWidth], undefined);
            this.ModalClose = <HTMLDivElement>this.CreateElement("div", '<i class="fa fa-close"></i>', undefined, undefined);

            var assentText: string = (this.MsgBoxButtons === MessageBoxButtonArgs.Ok || this.MsgBoxButtons === MessageBoxButtonArgs.OkCancel ? "OK" : (this.MsgBoxButtons === MessageBoxButtonArgs.YesNo ? "Yes" : "OK"));
            var abortText: string = (this.MsgBoxButtons === MessageBoxButtonArgs.OkCancel ? "Cancel" : (this.MsgBoxButtons === MessageBoxButtonArgs.YesNo ? "No" : "Cancel"));

            this.AssentButton = <HTMLButtonElement>this.CreateElement("button", assentText, ["btn", "btn-sm", "btn-default", "pull-right"], undefined);
            this.AbortButton = <HTMLButtonElement>this.CreateElement("button", abortText, ["btn", "btn-sm", "btn-danger", "pull-right"], undefined);

            //  Created the Modal Title
            var modalTitle: HTMLDivElement = <HTMLDivElement>this.CreateElement("div", "<span>" + this.ModalArgs.ModalCaption + "</span>", ["title"], undefined);
            modalTitle.appendChild(this.ModalClose);

            this.ModalContainer.appendChild(modalTitle);


            //  Add the View to the Body of the Modal
            var modalBody: HTMLDivElement = <HTMLDivElement>this.CreateElement("div", "", ["body"], undefined);
            modalBody.appendChild(this.View);

            this.ModalContainer.appendChild(modalBody);


            //  Add the Buttons if Required
            var modalButtons: HTMLDivElement = <HTMLDivElement>this.CreateElement("div", "", ["button"], undefined);

            if (this.MsgBoxButtons !== MessageBoxButtonArgs.Ok) {
                modalButtons.appendChild(this.AbortButton);
            }

            modalButtons.appendChild(this.AssentButton);

            this.ModalContainer.appendChild(modalButtons);



            //  Created the Modal Footer
            var modalFooter: HTMLDivElement = <HTMLDivElement>this.CreateElement("div", "&nbsp;", ["footer"], undefined);

            this.ModalContainer.appendChild(modalFooter);

        }

        static showDialog = (messageHtml: string, messageTitle: string, msgboxType: MessageBoxTypeArgs, msgboxButtons: MessageBoxButtonArgs, modalArgs: MessageBoxWindowArgs): void => {
            var modal: MessageBox = new MessageBox(messageHtml, messageTitle, msgboxType, msgboxButtons, modalArgs);
            var body: HTMLBodyElement = <HTMLBodyElement>document.getElementsByTagName("body")[0];
            var sWidth: string = modal.GetCssValue(".modal-window ." + modal.ModalArgs.ModalWidth, "width");
            var top: number = 50 + (document.documentElement.scrollTop === document.body.scrollTop ? document.documentElement.scrollTop : (document.documentElement.scrollTop > 0 && document.body.scrollTop === 0 ? document.documentElement.scrollTop : document.body.scrollTop));
            var width: number = 0, left: number = 0;

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

                if (width > window.innerWidth) {
                    width = Math.ceil(window.innerWidth * .95);
                    left = Math.ceil((window.innerWidth - width) / 2);
                    $$(modal.ModalContainer).removeClass(modal.ModalArgs.ModalWidth);
                    $$(modal.ModalContainer).find(".form-control").addClass("form-control-inline");
                    document.documentElement.scrollLeft = 0;
                }

            }
            catch (e) {
                width = Math.ceil(window.innerWidth * .95);
                left = Math.ceil((window.innerWidth - width) / 2);
                $$(modal.ModalContainer).removeClass(modal.ModalArgs.ModalWidth);
                $$(modal.ModalContainer).find(".form-control").addClass("form-control-inline");
                document.documentElement.scrollLeft = 0;
            }

            //  Set the absolute width of the Modal Window
            modal.ModalContainer.style.width = width + "px";
            //  Set the absolute value of the X axis
            modal.ModalContainer.style.left = left + "px";
            //  Set the absolute value of the Y axis
            modal.ModalContainer.style.top = top + "px";

            body.appendChild(modal.Mask.MaskElement);
            body.appendChild(modal.ModalContainer);

        }

    }

    //  Modal Window Arguments
    export class ModalWindowArgs {

        //  The Scope the Modal Window Belongs to
        Scope: Object;

        //  The class that controls the width of the modal
        ModalWidth: string;

        //  The text displayed in the title & footer sections of the modal window
        ModalCaption: string;
        FooterText: string;

        //  The HTML to display in ExecuteButton
        ExecutionHtml: string;
        //  The HTML to display in CancelButton
        CancelHtml: string;

        //  The JavaScript method that is executed when the ExecuteButton is clicked
        ExecuteButtonCallback: (callback: (success: boolean, message: string) => void) => void;
        //  The JavaScript method that is executed when ModalClose or CancelButton is clicked
        CancelButtonCallback: (Sender: ModalWindow) => void;

        //  Flag used to determine if ExecuteButton should be displayed
        ShowExecuteButton: boolean;
        //  Flag used to determine if CancelButton should be displayed
        ShowCancelButton: boolean;

        constructor(scope: Object, modalWidth: string, modalCaption: string, footerText: string, executionHtml: string, cancelHtml: string, showExecuteButton: boolean, showCancelButton: boolean, executionCallback: (callback: (success: boolean, message: string) => void) => void, cancelCallback: (sender: ModalWindow) => void) {
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

    }

    //  MessageBox Window Arguments
    export class MessageBoxWindowArgs {

        //  The Scope the Modal Window Belongs to
        Scope: Object;

        //  The class that controls the width of the modal
        ModalWidth: string;

        //  The text displayed in the title & footer sections of the modal window
        ModalCaption: string;
        
        //  The JavaScript method that is executed when the Buttons are clicked
        MessageBoxCallback: (result: MessageBoxResultArgs) => void;
        
        //  Flag used to determine if CancelButton should be displayed
        ShowAbortButton: boolean;

        constructor(scope: Object, modalWidth: string, modalCaption: string, msgboxBtns: MessageBoxButtonArgs, msgboxCallback: (result: MessageBoxResultArgs) => void) {
            var that = this;

            that.Scope = scope;

            that.ModalWidth = modalWidth;

            that.ModalCaption = modalCaption;
            
            that.ShowAbortButton = (msgboxBtns === MessageBoxButtonArgs.OkCancel || msgboxBtns === MessageBoxButtonArgs.YesNo);

            that.MessageBoxCallback = msgboxCallback;

        }

    }

    /*
    
    */
    //  Represents the Base Interface for Validating HTML Form Fields
    export interface IViewValidator {
        //  The HTML View to be Validated
        View: HTMLElement;

        //  Flag Used to Determine in the FormaValidator HTML Tag is Present
        CanValidate: boolean;

        //  The HTML Element Containing the Error Message Element
        ErrorContainer: HTMLElement;

        //  The HTML Error Message Element
        ErrorMessage: HTMLElement;

        //  The Scope that the View Belongs to
        Scope: Object;

        //  The Fields to be Validated
        Fields: IValidationField[];

        //  Used to Determine if the Form is Valid Based on the Values of the Validation Fields
        FormValid: () => boolean;

    }

    //  Validates the Input Fields Based on the Values on the Validation Attributes
    export class ViewValidator implements IViewValidator {
        //  The HTML View to be Validated
        View: HTMLElement;

        //  Flag Used to Determine in the FormaValidator HTML Tag is Present
        CanValidate: boolean;

        //  The HTML Element Containing the Error Message Element
        ErrorContainer: HTMLElement;

        //  The HTML Error Message Element
        ErrorMessage: HTMLElement;

        //  The Scope that the View Belongs to
        Scope: Object;

        //  The Fields to be Validated
        Fields: IValidationField[];

        //  Used to Determine if the Form is Valid Based on the Values of the Validation Fields
        FormValid: () => boolean;

        constructor(view: HTMLElement, scope: Object) {
            var that = this;

            that.View = view;
            that.Scope = scope;

            that.CanValidate = false;
            that.Fields = new Array<IValidationField>();


            if (that.View) {
                that.CanValidate = ($(that.View).find('formvalidator') && $(that.View).find('formvalidator').length > 0);

                if (that.CanValidate === true) {
                    var validationParent: HTMLElement = <HTMLElement>$(that.View).find('formvalidator')[0];
                    var errorContainerAttribute: string = $(validationParent).attr("errorcontainerid");
                    var errorMessageAttribute: string = $(validationParent).attr("errormessageid");

                    that.ErrorContainer = ($(that.View).find('[id="' + errorContainerAttribute + '"]') && $(that.View).find('[id="' + errorContainerAttribute + '"]').length > 0 ? <HTMLElement>$(that.View).find('[id="' + errorContainerAttribute + '"]')[0] : undefined);
                    that.ErrorMessage = ($(that.View).find('[id="' + errorMessageAttribute + '"]') && $(that.View).find('[id="' + errorMessageAttribute + '"]').length > 0 ? <HTMLElement>$(that.View).find('[id="' + errorMessageAttribute + '"]')[0] : undefined);

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
                    var validationChildren: HTMLElement[] = <HTMLElement[]>$(validationParent).find('[validation]').toArray();

                    if (validationChildren && validationChildren.length > 0) {

                        validationChildren.forEach((child: HTMLElement) => {
                            var field: IValidationField = new ValidationField(child, that.Scope, that.View);
                            that.Fields.push(field);
                        });

                    }
                    else {
                        that.CanValidate = false;
                    }

                }

            }


            //  Determine if the Form Can be Validated, and if so Validate Based on the Values of the Validation Fields
            that.FormValid = (): boolean => {

                if (that.CanValidate === true) {
                    var msg: ValidationMessage = new ValidationMessage();

                    try {

                        that.Fields.forEach((fld: IValidationField) => {
                            var m: ValidationMessage = fld.GetValidationResult();

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

            }


        }

    }

    //  Represents the Base Interface for Data Type Specific Field Validators
    export interface IValidationField {
        //  The HTML Element to be Validated
        Field: HTMLElement;

        //  The Scope that the Field Belongs to
        Scope: Object;

        //  The Validation Rules Used in Determining the Validation
        Rules: IValidationRule[];

        //  The Messages to Display if Validation Fails
        Messages: string[];

        //  Returns the Validation Result, Along with Any Validation Messages to Display
        GetValidationResult: () => ValidationMessage;

    }

    //  Represents an Individual Field to be Validated
    export class ValidationField implements IValidationField {
        //  The HTML Element to be Validated
        Field: HTMLElement;

        //  The Scope that the Field Belongs to
        Scope: Object;

        //  The Validation Rules Used in Determining the Validation
        Rules: IValidationRule[];

        //  The Messages to Display if Validation Fails
        Messages: string[];

        //  Returns the Validation Result, Along with Any Validation Messages to Display
        GetValidationResult: () => ValidationMessage;

        constructor(field: HTMLElement, scope: Object, view: HTMLElement) {
            var that = this;

            that.Field = field;
            that.Scope = scope;

            that.Rules = new Array<IValidationRule>();
            that.Messages = new Array<string>();

            var validationParameters: string[] = $(that.Field).attr("validation").split(";");

            if (validationParameters && validationParameters.length > 0) {
                var ruleValues: string[] = <string[]>that.GetParameterValue("RULE", validationParameters);
                var messageValues: string[] = <string[]>that.GetParameterValue("MESSAGE", validationParameters);
                var minValue: string = <string>that.GetParameterValue("MIN", validationParameters);
                var maxValue: string = <string>that.GetParameterValue("MAX", validationParameters);
                var negationValue: string = <string>that.GetParameterValue("NEGATIONID", validationParameters);
                var matchValue: string = <string>that.GetParameterValue("MATCHID", validationParameters);
                var methodValue: string = <string>that.GetParameterValue("METHOD", validationParameters);
                var patternValue: string = <string>that.GetParameterValue("PATTERN", validationParameters);
                var dataTypeValue: string = <string>that.GetParameterValue("DATATYPE", validationParameters);

                //  If Rules & Messages were found, and their lengths are equal, we can begin creating our validation rules
                if ((ruleValues && messageValues) && (ruleValues.length > 0 && messageValues.length > 0) && (ruleValues.length === messageValues.length)) {

                    for (var i: number = 0; i < ruleValues.length; i++) {
                        var r: string = ruleValues[i].trim().toUpperCase();
                        var m: string = messageValues[i].trim();
                        var rule: IValidationRule;

                        switch (r) {
                            case "RANGE":
                                rule = new RangeValidationRule(dataTypeValue);
                                (<RangeValidationRule>rule).SetMin(minValue);
                                (<RangeValidationRule>rule).SetMax(maxValue);

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

            that.GetValidationResult = (): ValidationMessage => {
                var msg: ValidationMessage = new ValidationMessage();

                for (var i: number = 0; i < that.Rules.length; i++) {
                    var rule: IValidationRule = that.Rules[i];

                    rule.SetValue(getFieldValue(that.Field));

                    if (!rule.IsValid() === true) {
                        msg.IsValid = false;
                        msg.Message = (msg.Message === "" ? that.Messages[i] : msg.Message + "<br>" + that.Messages[i]);
                    }

                }

                return msg;

            }

            //  Used to Get the Field Value Based on Form Field Type
            var getFieldValue = (el: HTMLElement): any => {

                if (el === undefined) {
                    return undefined;
                }

                switch (el.tagName.toUpperCase()) {
                    case "SELECT":
                        return $(el).val();
                    case "INPUT":
                        var tagType: string = (<any>el).type;

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

        //  Gets the Value of the Named Parameter
        GetParameterValue = (name: string, params: string[]): any => {

            //  Rules & Messages Can Have Multiple Values. If Found Return string Array
            if (name.toUpperCase() === "RULE" || name.toUpperCase() === "MESSAGE") {

                for (var i: number = 0; i < params.length; i++) {
                    var param: string[] = params[i].split(":");

                    if (param && param.length === 2) {

                        if (param[0].trim().toUpperCase() === name.toUpperCase()) {
                            return <string[]>param[1].trim().split(",");
                        }

                    }

                }

            }


            //  Min, Max, Negation ID, Match ID, Method, Pattern, and Data Type Can Only Have a Single Value
            for (var i: number = 0; i < params.length; i++) {
                var param: string[] = params[i].split(":");

                if (param && param.length === 2) {

                    if (param[0].trim().toUpperCase() === name.toUpperCase()) {
                        return param[1].trim();
                    }

                }

            }

            return undefined;

        }

    }

    //  Provides the Interface for Determining Field Validation Results
    export class ValidationMessage {
        IsValid: boolean;
        Message: string;

        constructor() {
            var that = this;

            that.IsValid = true;
            that.Message = "";

        }

    }

    /*
        Base Interface for All Validation Rules
	    Validation Rule: Used to determine how the field will be validated
	    Possible Values:
		    { RANGE | Range | range }
		    Used for validating numeric data types only, this validation rule will ensure
		    the field is greater than or equal to, or less than or equal, the provided min 
		    and max values found in attributes min-range and max-range respectively

		    { NEGATION | Negation | negation }
		    Used to ensure the value of one field is NOT EQUAL to the value of another
		    as provided by attribute NegationID

		    { MATCH | Match | match }
		    Similar to negation in comparison to another field, this rule differs in that it
		    ensures that value IS EQUAL to the value of another field as provided by
		    attribute MatchID

		    { CALLBACK | Callback | callback }
		    This validation rule attempts to call a method on the current scope provided
		    in attribute ValidationMethod

		    { REGEX | RegEx | regex }
		    Used for validating string data types only, this validation rule ensures the value
		    matches the pattern in attribute ValidationPattern
    */
    export interface IValidationRule {
        //  Sets the field value, and ensures the data type is correct
        SetValue: (value: any) => void;

        //  Validates the Field Value According to the Validation Rule Implementation
        IsValid: () => boolean;
    }

    //  Used to Validate the Field Against a Numeric Range
    export class RangeValidationRule implements IValidationRule {
        // Used for determining field value conversion method
        DataType: DataTypeArgs;

        //  Sets the min-range value, and ensures the data type is correct
        SetMin: (min: any) => void;

        //  Sets the max-range value, and ensures the data type is correct
        SetMax: (max: any) => void;

        //  Sets the field value, and ensures the data type is correct
        SetValue: (value: any) => void;

        //   Validates the Field Value against the Values of Min and Max
        IsValid: () => boolean;

        constructor(dataType: string) {
            var that = this,
                MinValue: number = 0,
                MaxValue: number = 100,
                MaxValueUnlimited: boolean = false,
                FieldValue: number = -1;

            var dataTypes: KrodSpa.DataTypeCollection = KrodSpa.DataTypeCollection.Instance();

            //  Ensures the Data Type is properly defined and sets the DataType value
            that.DataType = (dataTypes[dataType.toUpperCase()] !== undefined ? dataTypes[dataType.toUpperCase()] : KrodSpa.DataTypeArgs.Int);

            //  Ensures the Data Type is properly defined and sets the min value
            that.SetMin = (min: any) => {

                if (!isNaN((that.DataType === DataTypeArgs.Int ? parseInt(min) : parseFloat(min)))) {
                    MinValue = (that.DataType === DataTypeArgs.Int ? parseInt(min) : parseFloat(min));
                }
                else {
                    MinValue = 0;
                }

            }

            //  Ensures the Data Type is properly defined and sets the max value
            that.SetMax = (max: any) => {

                if (max === "*") {
                    MaxValueUnlimited = true;
                    return;
                }

                if (!isNaN((that.DataType === DataTypeArgs.Int ? parseInt(max) : parseFloat(max)))) {
                    MaxValue = (that.DataType === DataTypeArgs.Int ? parseInt(max) : parseFloat(max));
                }
                else {
                    MaxValue = 100;
                }

            }

            //  Ensures the Data Type is properly defined and sets the field value
            that.SetValue = (value: any) => {

                if (!isNaN((that.DataType === DataTypeArgs.Int ? parseInt(value) : parseFloat(value)))) {
                    FieldValue = (that.DataType === DataTypeArgs.Int ? parseInt(value) : parseFloat(value));
                }
                else {
                    FieldValue = MinValue - 1;
                }

            }

            //  Validates the Field Value against the values in MinValue and MaxValue
            that.IsValid = (): boolean => {

                if (FieldValue < MinValue || FieldValue > (MaxValueUnlimited === true ? (FieldValue + MinValue + 10) : MaxValue)) {
                    return false;
                }

                return true;

            }

        }

    }

    //  Used to Ensure the Field Value IS NOT Equal to the Value of Another Field
    export class NegationValidationRule implements IValidationRule {
        // Used for determining field value conversion method
        DataType: DataTypeArgs;

        //  The HTML Element Used for the Comparison Field
        NegationObj: HTMLElement;

        //  Sets the field value, and ensures the data type is correct
        SetValue: (value: any) => void;

        //   Validates the Field Value against the Value of the Negation HTML Element
        IsValid: () => boolean;

        constructor(dataType: string, negationObj: HTMLElement) {
            var that = this,
                FieldValue: any = undefined;

            //  Ensures the Data Type is properly defined and sets the min value
            that.DataType = (DataTypeCollection.Instance[dataType.toUpperCase()] ? DataTypeCollection.Instance[dataType.toUpperCase()] : DataTypeArgs.String);

            that.NegationObj = negationObj;

            //  Ensures the Data Type is properly defined and sets the field value
            that.SetValue = (value: any) => {

                //  Numeric Field
                if (that.DataType === DataTypeArgs.Int || that.DataType === DataTypeArgs.Float) {

                    if ((that.DataType === DataTypeArgs.Int ? parseInt(value) : parseFloat(value)) !== NaN) {
                        FieldValue = (that.DataType === DataTypeArgs.Int ? parseInt(value) : parseFloat(value));
                    }

                }

                //  Date/Time Field
                if (that.DataType === DataTypeArgs.Date || that.DataType === DataTypeArgs.Time || that.DataType === DataTypeArgs.DateTime) {
                    var date: Date = new Date(value);

                    if (date.toDateString() !== "Invalid Date") {
                        var month: number = date.getMonth() + 1,
                            day = date.getDate(),
                            year = date.getFullYear(),
                            hour: number = (date.getHours() > 12 ? date.getHours() - 12 : (date.getHours() == 0 ? 12 : date.getHours())),
                            minutes: number = date.getMinutes(),
                            meridian: string = (date.getHours() >= 12 ? "PM" : "AM");

                        if (that.DataType === DataTypeArgs.Date) {
                            FieldValue = new String(('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year));
                        }

                        if (that.DataType === DataTypeArgs.Time) {
                            FieldValue = new String(('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian);
                        }

                        if (that.DataType === DataTypeArgs.DateTime) {
                            FieldValue = new String(('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year) + ' ' + ('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian);
                        }

                    }

                }

                //  Boolean Field
                if (that.DataType === DataTypeArgs.Boolean) {

                    if (typeof value === "object" && Object.prototype.toString.call(value) === "[object Boolean]") {
                        FieldValue = new Boolean(value);
                    }

                    if ((value === 'true') === true || (value === 'false') === true) {
                        FieldValue = new Boolean(value);
                    }

                }

                //  String Field
                if (that.DataType === DataTypeArgs.String) {
                    FieldValue = new String(value);
                }

            }

            //  Validates the Field Value against the Negation Element Value
            that.IsValid = (): boolean => {

                if (that.NegationObj) {
                    var negationObjValue: any = $(that.NegationObj).val(),
                        negationValue: any = undefined,
                        currentValue: any = undefined;

                    //  Numeric Field
                    if (that.DataType === DataTypeArgs.Int || that.DataType === DataTypeArgs.Float) {

                        if ((that.DataType === DataTypeArgs.Int ? parseInt(negationObjValue) : parseFloat(negationObjValue)) !== NaN) {
                            negationValue = (that.DataType === DataTypeArgs.Int ? parseInt(negationObjValue) : parseFloat(negationObjValue));
                            currentValue = (that.DataType === DataTypeArgs.Int ? parseInt(FieldValue) : parseFloat(FieldValue));
                        }

                    }

                    //  Date/Time Field
                    if (that.DataType === DataTypeArgs.Date || that.DataType === DataTypeArgs.Time || that.DataType === DataTypeArgs.DateTime) {
                        var date: Date = new Date(negationObjValue);

                        if (date.toDateString() !== "Invalid Date") {
                            var month: number = date.getMonth() + 1,
                                day = date.getDate(),
                                year = date.getFullYear(),
                                hour: number = (date.getHours() > 12 ? date.getHours() - 12 : (date.getHours() == 0 ? 12 : date.getHours())),
                                minutes: number = date.getMinutes(),
                                meridian: string = (date.getHours() >= 12 ? "PM" : "AM");

                            if (that.DataType === DataTypeArgs.Date) {
                                negationValue = new String(('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year));
                            }

                            if (that.DataType === DataTypeArgs.Time) {
                                negationValue = new String(('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian);
                            }

                            if (that.DataType === DataTypeArgs.DateTime) {
                                negationValue = new String(('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year) + ' ' + ('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian);
                            }

                            currentValue = new String(FieldValue);

                        }

                    }

                    //  Boolean Field
                    if (that.DataType === DataTypeArgs.Boolean) {

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
                    if (that.DataType === DataTypeArgs.String) {
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

            }

        }

    }

    //  Used to Ensure the Field Value IS Equal to the Value of Another Field
    export class MatchValidationRule implements IValidationRule {
        // Used for determining field value conversion method
        DataType: DataTypeArgs;

        //  The HTML Element ID for the Comparison Field
        MatchObj: HTMLElement;

        //  Sets the field value, and ensures the data type is correct
        SetValue: (value: any) => void;

        //   Validates the Field Value against the Value of the Match HTML Element
        IsValid: () => boolean;

        constructor(dataType: string, matchObj: HTMLElement) {
            var that = this,
                FieldValue: any = undefined;

            //  Ensures the Data Type is properly defined and sets the min value
            that.DataType = (DataTypeCollection.Instance[dataType.toUpperCase()] ? DataTypeCollection.Instance[dataType.toUpperCase()] : DataTypeArgs.String);

            that.MatchObj = matchObj;

            //  Ensures the Data Type is properly defined and sets the field value
            that.SetValue = (value: any) => {

                //  Numeric Field
                if (that.DataType === DataTypeArgs.Int || that.DataType === DataTypeArgs.Float) {

                    if ((that.DataType === DataTypeArgs.Int ? parseInt(value) : parseFloat(value)) !== NaN) {
                        FieldValue = (that.DataType === DataTypeArgs.Int ? parseInt(value) : parseFloat(value));
                    }

                }

                //  Date/Time Field
                if (that.DataType === DataTypeArgs.Date || that.DataType === DataTypeArgs.Time || that.DataType === DataTypeArgs.DateTime) {
                    var date: Date = new Date(value);

                    if (date.toDateString() !== "Invalid Date") {
                        var month: number = date.getMonth() + 1,
                            day = date.getDate(),
                            year = date.getFullYear(),
                            hour: number = (date.getHours() > 12 ? date.getHours() - 12 : (date.getHours() == 0 ? 12 : date.getHours())),
                            minutes: number = date.getMinutes(),
                            meridian: string = (date.getHours() >= 12 ? "PM" : "AM");

                        if (that.DataType === DataTypeArgs.Date) {
                            FieldValue = new String(('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year));
                        }

                        if (that.DataType === DataTypeArgs.Time) {
                            FieldValue = new String(('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian);
                        }

                        if (that.DataType === DataTypeArgs.DateTime) {
                            FieldValue = new String(('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year) + ' ' + ('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian);
                        }

                    }

                }

                //  Boolean Field
                if (that.DataType === DataTypeArgs.Boolean) {

                    if (typeof value === "object" && Object.prototype.toString.call(value) === "[object Boolean]") {
                        FieldValue = new Boolean(value);
                    }

                    if ((value === 'true') === true || (value === 'false') === true) {
                        FieldValue = new Boolean(value);
                    }

                }

                //  String Field
                if (that.DataType === DataTypeArgs.String) {
                    FieldValue = new String(value);
                }

            }

            //  Validates the Field Value against the Match Element Value
            that.IsValid = (): boolean => {

                if (that.MatchObj) {
                    var matchObjValue: any = $(that.MatchObj).val(),
                        matchValue: any = undefined,
                        currentValue: any = undefined;

                    //  Numeric Field
                    if (that.DataType === DataTypeArgs.Int || that.DataType === DataTypeArgs.Float) {

                        if ((that.DataType === DataTypeArgs.Int ? parseInt(matchObjValue) : parseFloat(matchObjValue)) !== NaN) {
                            matchValue = (that.DataType === DataTypeArgs.Int ? parseInt(matchObjValue) : parseFloat(matchObjValue));
                            currentValue = (that.DataType === DataTypeArgs.Int ? parseInt(FieldValue) : parseFloat(FieldValue));
                        }

                    }

                    //  Date/Time Field
                    if (that.DataType === DataTypeArgs.Date || that.DataType === DataTypeArgs.Time || that.DataType === DataTypeArgs.DateTime) {
                        var date: Date = new Date(matchObjValue);

                        if (date.toDateString() !== "Invalid Date") {
                            var month: number = date.getMonth() + 1,
                                day = date.getDate(),
                                year = date.getFullYear(),
                                hour: number = (date.getHours() > 12 ? date.getHours() - 12 : (date.getHours() == 0 ? 12 : date.getHours())),
                                minutes: number = date.getMinutes(),
                                meridian: string = (date.getHours() >= 12 ? "PM" : "AM");

                            if (that.DataType === DataTypeArgs.Date) {
                                matchValue = new String(('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year));
                            }

                            if (that.DataType === DataTypeArgs.Time) {
                                matchValue = new String(('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian);
                            }

                            if (that.DataType === DataTypeArgs.DateTime) {
                                matchValue = new String(('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year) + ' ' + ('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian);
                            }

                            currentValue = new String(FieldValue);

                        }

                    }

                    //  Boolean Field
                    if (that.DataType === DataTypeArgs.Boolean) {

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
                    if (that.DataType === DataTypeArgs.String) {
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

            }

        }

    }

    //  Used to Call the Method as Defined in Scope to Validate the Field
    export class CallbackValidationRule implements IValidationRule {
        // Used for determining field value conversion method
        DataType: DataTypeArgs;

        //  The Scope Containing the Validation Method
        Scope: Object;

        //  The Method to Call to Validate the Field Value
        ValidationMethod: string;

        //  Sets the field value, and ensures the data type is correct
        SetValue: (value: any) => void;

        //   Validates the Field Value by Calling the Scope Method
        //  Returns False if the Scope is undefined or Method is not Found
        //  on the Scope Object
        IsValid: () => boolean;

        constructor(dataType: string, scope: Object, validationMethod: string) {
            var that = this,
                FieldValue: any = undefined;

            //  Ensures the Data Type is properly defined and sets the min value
            that.DataType = (DataTypeCollection.Instance[dataType.toUpperCase()] ? DataTypeCollection.Instance[dataType.toUpperCase()] : DataTypeArgs.String);

            that.Scope = scope;
            that.ValidationMethod = validationMethod;

            //  Ensures the Data Type is properly defined and sets the field value
            that.SetValue = (value: any) => {

                //  Numeric Field
                if (that.DataType === DataTypeArgs.Int || that.DataType === DataTypeArgs.Float) {

                    if ((that.DataType === DataTypeArgs.Int ? parseInt(value) : parseFloat(value)) !== NaN) {
                        FieldValue = (that.DataType === DataTypeArgs.Int ? parseInt(value) : parseFloat(value));
                    }

                }

                //  Date/Time Field
                if (that.DataType === DataTypeArgs.Date || that.DataType === DataTypeArgs.Time || that.DataType === DataTypeArgs.DateTime) {
                    var date: Date = new Date(value);

                    if (date.toDateString() !== "Invalid Date") {
                        var month: number = date.getMonth() + 1,
                            day = date.getDate(),
                            year = date.getFullYear(),
                            hour: number = (date.getHours() > 12 ? date.getHours() - 12 : (date.getHours() == 0 ? 12 : date.getHours())),
                            minutes: number = date.getMinutes(),
                            meridian: string = (date.getHours() >= 12 ? "PM" : "AM");

                        if (that.DataType === DataTypeArgs.Date) {
                            FieldValue = new String(('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year));
                        }

                        if (that.DataType === DataTypeArgs.Time) {
                            FieldValue = new String(('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian);
                        }

                        if (that.DataType === DataTypeArgs.DateTime) {
                            FieldValue = new String(('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year) + ' ' + ('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian);
                        }

                    }

                }

                //  Boolean Field
                if (that.DataType === DataTypeArgs.Boolean) {

                    if (typeof value === "object" && Object.prototype.toString.call(value) === "[object Boolean]") {
                        FieldValue = new Boolean(value);
                    }

                    if ((value === 'true') === true || (value === 'false') === true) {
                        FieldValue = new Boolean(value);
                    }

                }

                //  String Field
                if (that.DataType === DataTypeArgs.String) {
                    FieldValue = new String(value);
                }

            }

            //  Validates the Field Value against the Match Element Value
            that.IsValid = (): boolean => {

                if (that.Scope && that.Scope[that.ValidationMethod]) {
                    return (that.Scope[that.ValidationMethod](FieldValue) === true);
                }
                else {
                    return false;
                }

            }

        }

    }

    //  Used to Validate the Field Value Against a Regular Expression Pattern
    export class RegExValidationRule implements IValidationRule {
        //  The RegEx Pattern to Use When Validating the Field Value
        ValidationPattern: string;

        //  Sets the field to a string data type value
        SetValue: (value: string) => void;

        //   Validates the Field Value against the Regular Expressing Pattern in ValidationPattern
        IsValid: () => boolean;

        constructor(validationPattern: string) {
            var that = this,
                FieldValue: string = "";

            that.ValidationPattern = validationPattern;

            //  Ensures the Data Type is properly defined and sets the field value
            that.SetValue = (value: string) => {

                if (value === undefined) {
                    FieldValue = "";
                }
                else {
                    FieldValue = value;
                }

            }

            //  Validates the Field Value against the Regular Expressing Pattern in ValidationPattern
            that.IsValid = (): boolean => {
                var matches: RegExpMatchArray = FieldValue.match(new RegExp(that.ValidationPattern, "i"));

                return (matches !== undefined && matches !== null && matches.length > 0);

            }

        }

    }


    //  Modal Mask
    export class ModalMask {
        MaskElement: HTMLDivElement;

        constructor(bgClass: string) {
            var that = this;

            that.MaskElement = document.createElement("div");

            that.MaskElement.classList.add("modal-mask");
            that.MaskElement.classList.add(bgClass);

        }

    }


    //  Menu Item Command Type
    export enum MenuItemCommandTypeArgs {
        URL = 1,
        Hash = 2,
        Method = 3
    }


    //  Context Menu Item
    export class MenuItem {
        MenuItemID: number;
        MenuGroup: string;
        ControlID: string;
        ApplySeparator: boolean;
        Controller: string;
        CommandType: MenuItemCommandTypeArgs;
        Command: string;
        MenuIcon: string;
        LabelText: string;
        IsActive: boolean;
        CreatedBy: number;
        DateCreated: string;
        UpdatedBy: number;
        DateUpdated: string;

        toLineItem: () => HTMLLIElement;

        constructor(item: any) {
            var that = this;

            if (item !== undefined) {

                try {
                    that.MenuItemID = item.MenuItemID;
                    that.MenuGroup = item.MenuGroup;
                    that.ControlID = item.ControlID;
                    that.ApplySeparator = item.ApplySeparator;
                    that.Controller = item.Controller;
                    that.CommandType = <MenuItemCommandTypeArgs>item.CommandType;
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

            that.toLineItem = () => {
                var lineItem: HTMLLIElement = document.createElement("li");
                var anchor: HTMLAnchorElement = document.createElement("a");
                var icon: string = '<i class="fa ' + that.MenuIcon + '"></i>&nbsp;&nbsp;';

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

            }

        }

        static toArray = (data: any): MenuItem[] => {
            var items: MenuItem[] = new Array<MenuItem>();

            if (data !== undefined) {
                var results: any;

                try {
                    results = (typeof data === 'string' ? JSON.parse(data) : data);
                }
                catch (e) {
                    results = undefined;
                }

                if (results !== undefined && results.length !== undefined) {

                    for (var i: number = 0; i < results.length; i++) {
                        var item: MenuItem = new MenuItem(results[i]);
                        items.push(item);
                    }

                }

            }

            return items;

        }

    }


    //  Context Menu Callback Args
    export class ContextMenuCallbackArgs {
        Sender: Object;
        Model: Object;

        constructor(sender: Object, model: Object) {
            var that = this;

            that.Sender = sender;
            that.Model = model;

        }

    }

    export interface IMenuItemCallback {
        ElementID: string;
        ItemCallback: (e: ContextMenuCallbackArgs) => void;
    }

    export class ContextMenuCallback implements IMenuItemCallback {
        ElementID: string;
        ItemCallback: (e: ContextMenuCallbackArgs) => void;

        constructor(elementID: string, callback: (e: ContextMenuCallbackArgs) => void) {
            var that = this;

            that.ElementID = elementID;
            that.ItemCallback = callback;

        }

    }

    //  Context Menu Interface
    export interface IContextMenu {
        Menu: HTMLElement;

        MenuItems: MenuItem[];

        Model: Object;

        ShowMenu: (ctl: HTMLElement) => void;

    }

    export class ContextMenu extends HtmlControl implements IContextMenu {
        Menu: HTMLElement;

        MenuItems: MenuItem[];

        Model: Object;

        ShowMenu: (ctl: HTMLElement) => void;

        constructor(menuItems: MenuItem[], model: Object) {
            super();

            var that = this,
                showingMenu: boolean = false;

            that.Model = model;
            that.MenuItems = menuItems;

            document.getElementsByTagName("body")[0].onclick = (ev: MouseEvent) => {

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

            }

            that.ShowMenu = (ctl: HTMLElement) => {
                //showingMenu = true;

                if ($("body").find("context-menu").length) {
                    document.getElementsByTagName("body")[0].removeChild($("context-menu")[0]);
                }

                setTimeout(() => {
                    var location: ElementLocation = that.GetElementCoordinates(ctl);

                    $(that.Menu).css("position", "absolute");
                    $(that.Menu).css("left", location.X);
                    $(that.Menu).css("top", location.Y);
                    $(that.Menu).css("display", "block");

                    document.getElementsByTagName("body")[0].appendChild(that.Menu);

                }, 200);

            }

            that.Menu = document.createElement("context-menu");
            that.Menu.appendChild(that.CreateMenu(that.MenuItems));

            if (that.MenuItems !== undefined && that.MenuItems.length > 0) {

                for (var i: number = 0; i < that.MenuItems.length; i++) {

                    ((idx: number) => {
                        var item: MenuItem = that.MenuItems[idx];

                        if (item.CommandType === MenuItemCommandTypeArgs.Method) {

                            if ($(that.Menu).find('[id="' + item.ControlID + '"]').length) {

                                $(that.Menu).find('[id="' + item.ControlID + '"]').on("click", (ev: Event) => {

                                    if (KrodSpa.Application.Applications !== undefined && KrodSpa.Application.Applications.length > 0) {

                                        KrodSpa.Application.Applications.forEach((application: Application) => {
                                            var itemController: Controller = controllerFetcher(item.Controller, application.Controllers)

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

        CreateMenu = (items: MenuItem[]): HTMLDivElement => {
            var menu: HTMLDivElement = document.createElement("div");
            
            if (items !== undefined && items.length > 0) {
                var ul: HTMLUListElement = document.createElement("ul");

                items.forEach((item: MenuItem) => {
                    ul.appendChild(item.toLineItem());
                });

                menu.appendChild(ul);

            }
            else {
                $(menu).css("text-align", "center");
                $(menu).html("<h4>Unable to Create Menu</h4>");
            }

            return menu;

        }

    }

}


module Krodzone {

    export enum DayOfWeek {
        Sunday = 0,
        Monday = 1,
        Tuesday = 2,
        Wednesday = 3,
        Thursday = 4,
        Friday = 5,
        Saturday = 6
    }

    export class KrodzoneDate {
        Month: number;
        Day: number;
        Year: number;
        DOW: number;
        CurrentDate: Date;
        CurrentTime: KrodzoneTime;


        constructor(startDate: Date) {
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

        setDate(dat: Date): void {
            if (KrodzoneDate.dateValid(dat)) {
                this.CurrentDate = dat;
                this.Month = this.CurrentDate.getMonth() + 1;
                this.Day = this.CurrentDate.getDate();
                this.Year = this.CurrentDate.getFullYear();
                this.DOW = this.CurrentDate.getDay();
                this.CurrentTime.setTime(this.CurrentDate);
            }
        }

        toShortDateString(): string {
            return ('0' + this.Month).slice(-2) + '/' + ('0' + this.Day).slice(-2) + '/' + String(this.Year);
        }

        toDateTimeString(): string {
            return this.toShortDateString() + ' ' + this.CurrentTime.toTimeString();
        }

        toString(): string {
            return "KrodzoneDate (" + this.toShortDateString() + ")";
        }

        static toShortDateString(date: Date): string {

            if (!KrodzoneDate.dateValid(date)) {
                date = new Date();
            }

            var month: number = date.getMonth() + 1;
            var day: number = date.getDate();
            var year: number = date.getFullYear();

            return ('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year);

        }

        static toDateTimeString(date: Date): string {

            if (!KrodzoneDate.dateValid(date)) {
                date = new Date();
            }

            var month: number = date.getMonth() + 1;
            var day: number = date.getDate();
            var year: number = date.getFullYear();
            var hour: number = (date.getHours() > 12 ? date.getHours() - 12 : (date.getHours() == 0 ? 12 : date.getHours()));
            var minutes: number = date.getMinutes();
            var meridian: string = (date.getHours() >= 12 ? "PM" : "AM");

            return ('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year) + ' ' + ('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian;

        }

        static firstDayOfMonth = (date: Date): string => {

            if (!KrodzoneDate.dateValid(date)) {
                date = new Date();
            }

            var month: number = date.getMonth() + 1;
            var year: number = date.getFullYear();

            return ('0' + month).slice(-2) + '/01/' + String(year);

        }

        static lastDayOfMonth = (date: Date): string => {

            if (!KrodzoneDate.dateValid(date)) {
                date = new Date();
            }

            var month: number = date.getMonth() + 1;
            var day: number = KrodzoneDate.daysInMonth(date);
            var year: number = date.getFullYear();

            return ('0' + month).slice(-2) + '/' + ('0' + day).slice(-2) + '/' + String(year);

        }

        static dateDiff(part: string, dat1: Date, dat2: Date): number {
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

        }

        static dateAdd(part: string, num: number, dat: Date): Date {
            if (!KrodzoneDate.dateValid(dat)) {
                return new Date("1/1/1900");
            }

            if (isNaN(num)) {
                return new Date("1/1/1900");
            }

            var day: number = dat.getDate();
            var mo: number = dat.getMonth();
            var yr: number = dat.getFullYear();
            var hr: number = dat.getHours();
            var min: number = dat.getMinutes();
            var sec: number = dat.getSeconds();
            var workingDays: number = 0;

            var addDay = (daysToAdd): Date => {
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
            var addMonth = (monthsToAdd: number): Date => {
                var totalDaysInMo: number;
                var dateString: string;

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
            var addHours = (hoursToAdd: number): Date => {

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
            var addMinutes = (minutesToAdd: number): Date => {

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
                        var hoursToAdd: number = (num < 0 ? Math.ceil(num / 60.0) : Math.floor(num / 60.0));
                        var daysToAdd: number = 0;

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

        }

        static isLeapYear(yr): boolean {
            if (!isNaN(yr)) {
                return (new Date(yr, 1, 29).getMonth() == 1);
            }
            else {
                return false;
            }
        }

        static daysInMonth(dat): number {

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

        }

        static dateValid(dateToCheck: any): boolean {
            var result: boolean = false;

            try {
                var date: Date = new Date(dateToCheck);

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

        }

        static isWeekDay = (date: any): boolean => {

            if (KrodzoneDate.dateValid(date)) {
                var d: Date = new Date(date);
                var dow: DayOfWeek = <DayOfWeek>d.getDay();

                return (dow !== DayOfWeek.Sunday && dow !== DayOfWeek.Saturday);

            }
            else {
                return false;
            }

        }

        static isWeekendDay = (date: any): boolean => {

            if (KrodzoneDate.dateValid(date)) {
                var d: Date = new Date(date);
                var dow: DayOfWeek = <DayOfWeek>d.getDay();

                return (dow === DayOfWeek.Sunday || dow === DayOfWeek.Saturday);

            }
            else {
                return false;
            }

        }

        static getDayOfWeek = (date: any): DayOfWeek => {

            if (KrodzoneDate.dateValid(date)) {
                var d: Date = new Date(date);
                var dow: DayOfWeek = <DayOfWeek>d.getDay();

                return dow;

            }
            else {
                return undefined;
            }

        }

    }

    export class KrodzoneTime {
        Hour: number;
        Minutes: number;
        Seconds: number;
        Meridian: string;

        constructor(startDate: Date) {
            if (!KrodzoneDate.dateValid(startDate)) {
                startDate = new Date();
            }
            this.Hour = (startDate.getHours() > 12 ? startDate.getHours() - 12 : (startDate.getHours() == 0 ? 12 : startDate.getHours()));
            this.Minutes = startDate.getMinutes();
            this.Seconds = startDate.getSeconds();
            this.Meridian = (startDate.getHours() >= 12 ? "PM" : "AM");
        }

        setTime(dat): void {
            if (KrodzoneDate.dateValid(dat)) {
                this.Hour = (dat.getHours() > 12 ? dat.getHours() - 12 : (dat.getHours() == 0 ? 12 : dat.getHours()));
                this.Minutes = dat.getMinutes();
                this.Seconds = dat.getSeconds();
                this.Meridian = (dat.getHours() >= 12 ? "PM" : "AM");
            }
        }

        toHourString(): string {
            return ('0' + this.Hour).slice(-2);
        }

        toMinuteString(): string {
            return ('0' + this.Minutes).slice(-2);
        }

        toTimeString(): string {
            return (this.Hour < 10 ? '0' + this.Hour : this.Hour) + ':' + (this.Minutes < 10 ? '0' + this.Minutes : this.Minutes) + ' ' + this.Meridian;
        }

        static toTimeString(date: Date): string {

            if (!KrodzoneDate.dateValid(date)) {
                date = new Date();
            }

            var hour: number = (date.getHours() > 12 ? date.getHours() - 12 : (date.getHours() == 0 ? 12 : date.getHours()));
            var minutes: number = date.getMinutes();
            var meridian: string = (date.getHours() >= 12 ? "PM" : "AM");

            return ('0' + hour).slice(-2) + ':' + ('0' + minutes).slice(-2) + ' ' + meridian;

        }

    }

}  
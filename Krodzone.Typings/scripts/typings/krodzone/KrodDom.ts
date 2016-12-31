
var Handlers: EventData[] = new Array<EventData>();

var $$ = function (selector: string | HTMLElement | HTMLDocument | Window | Krodzone.IKrodDom | any, context?: HTMLElement) {
    return Krodzone.KDom(selector, context);
};

$$["arrayIndex"] = function (ary: any[], value: any): number {
    var index: number = -1;

    if (((ary !== undefined && ary !== null) && (ary.length !== undefined && ary.length !== null)) && (value !== undefined && value !== null)) {
        for (var i: number = 0; i < ary.length; i++) {
            if (value === ary[i]) {
                index = i;
                break;
            }
        }
    }

    return index;
}




interface IEventData {
    element: HTMLElement | HTMLDocument | Window;
    eventType: string;
    handler: EventListener;
}

class EventData implements IEventData {
    constructor(public element: HTMLElement | HTMLDocument | Window, public eventType: string, public handler: EventListener) { }
}


module Krodzone {

    export var KDom = (selector: string | HTMLElement | HTMLDocument | Window | IKrodDom | any, context?: HTMLElement): IKrodDom => {
        var findById = function (selector: string, context?: HTMLElement, searcher?: (s: string, c?: HTMLElement) => HTMLElement[]): HTMLElement[] {
            var elements: HTMLElement[] = new Array<HTMLElement>();

            if (context && context) {
                elements = searcher("id=" + selector, context);
            }
            else {
                var results = document.getElementById(<string>selector);

                if (results) {
                    elements.push(<HTMLElement>results);
                }

            }

            return elements;

        };
        var findByTag = function (selector: string, context?: HTMLElement): HTMLElement[] {
            var elements: HTMLElement[] = new Array<HTMLElement>();
            var results = (context ? context.getElementsByTagName(<string>selector) : document.getElementsByTagName(<string>selector));

            if (results && results.length) {
                for (var i = 0; i < results.length; i++) {
                    if (results[i] instanceof HTMLElement) {
                        elements.push(<HTMLElement>results[i]);
                    }
                }
            }

            return elements;

        };
        var findByName = function (selector: string): HTMLElement[] {
            var elements: HTMLElement[] = new Array<HTMLElement>();
            var results = document.getElementsByName(<string>selector);

            if (results && results.length) {
                for (var i = 0; i < results.length; i++) {
                    if (results[i] instanceof HTMLElement) {
                        elements.push(<HTMLElement>results[i]);
                    }
                }
            }

            return elements;

        };
        var findByClass = function (selector: string, context?: HTMLElement): HTMLElement[] {
            var elements: HTMLElement[] = new Array<HTMLElement>();
            var results = (context ? context.getElementsByClassName(<string>selector) : document.getElementsByClassName(<string>selector));

            if (results && results.length) {
                for (var i = 0; i < results.length; i++) {
                    if (results[i] instanceof HTMLElement) {
                        elements.push(<HTMLElement>results[i]);
                    }
                }
            }

            return elements;

        };
        var findByAttribute = function (selector: string, context?: HTMLElement): HTMLElement[] {
            var elements: HTMLElement[] = new Array<HTMLElement>();
            var parent: HTMLElement = (context ? context : document.documentElement);
            var findAll = (searcher: (s: any, el: HTMLElement, t: string, v: string) => HTMLElement[], element: HTMLElement, attrName: string, attrValue: string): HTMLElement[] => {
                var els: HTMLElement[] = new Array<HTMLElement>();

                if (searcher && element && (attrName !== undefined && attrName !== "")) {

                    for (var i: number = 0; i < element.children.length; i++) {
                        var children: HTMLElement[] = searcher(searcher, <HTMLElement>element.children[i], attrName, attrValue);
                        children.forEach((child: HTMLElement) => {
                            els.push(child);
                        });
                    }

                    if (element.hasAttribute(attrName)) {

                        if ((attrValue !== undefined && attrValue !== "")) {
                            if (element.getAttribute(attrName).trim().toUpperCase() === attrValue.trim().toUpperCase())
                                els.push(element);
                        }
                        else {
                            els.push(element);
                        }

                    }

                }

                return els;

            }
            var parts = selector.split("=");
            var attrName = (parts && parts.length && parts.length > 0 ? parts[0] : undefined);
            var attrValue = (parts && parts.length && parts.length === 2 ? parts[1] : undefined);

            elements = findAll(findAll, parent, attrName, attrValue);

            return elements;

        };
        var ikdom: IKrodDom = createDomObject();
        var items: HTMLElement[];

        if (ikdom.isObject(selector)) {

            if (selector instanceof HTMLElement) {
                ikdom[0] = new KrodDom(<HTMLElement>selector);
                ikdom.length = 1;
            }

            if (selector instanceof HTMLDocument) {
                ikdom[0] = new KrodDom(<HTMLDocument>selector);
                ikdom.length = 1;
            }

            if (selector instanceof Window) {
                ikdom[0] = new KrodDom(<Window>selector);
                ikdom.length = 1;
            }
            
            if (selector instanceof KrodDom) {
                var kd: any = selector;
                ikdom[0] = <KrodDom>kd;
                ikdom.length = 1;
            }

            if (selector["length"] && selector["length"] > 0 && selector[0] instanceof KrodDom) {
                ikdom = <IKrodDom>selector;
            }

        }
        else {

            if (ikdom.isString(selector)) {

                //  Find by id
                if ((<string>selector).substring(0, 1) === "#") {
                    items = findById((<string>selector).replace("#", ""), context, findByAttribute);
                }

                //  Find by className
                else if ((<string>selector).substring(0, 1) === ".") {
                    items = findByClass((<string>selector).replace(".", ""), context);
                }

                //  Find by attribute
                else if ((<string>selector).substring(0, 1) === "[") {
                    items = findByAttribute((<string>selector).replace("[", "").replace("]", ""), context);
                }

                //  Determine intent
                else {

                    items = findById((<string>selector).replace("#", ""));

                    if (!items)
                        items = findByClass((<string>selector).replace(".", ""), context);

                    if (!items)
                        items = findByName(<string>selector);

                    if (!items)
                        items = findByTag(<string>selector, context);

                }

                if (items && items.length) {

                    for (var i: number = 0; i < items.length; i++) {
                        if (items[i] instanceof HTMLElement) {
                            ikdom[i] = new KrodDom(<HTMLElement>items[i]);
                            ikdom.length++;
                        }
                    }

                }

            }

        }

        
        return ikdom;

    }


    interface IAttributeValue {
        length: number;
        [index: number]: string;
        [key: string]: number|string;
    }

    export interface IKrodzoneObjectModel {
        arrayIndex: (ary: any[], value: any) => number;
        bindEvent: (el: any, name: string, handler: any) => IKrodzoneObjectModel;
        (selector: string | HTMLElement | HTMLDocument | Window | IKrodzoneObjectModel, context?: HTMLElement): IKrodDom;
    }

    function arrayIndex(ary: any[], value: any): number {
        var index: number = -1;

        if (((ary !== undefined && ary !== null) && (ary.length !== undefined && ary.length !== null)) && (value !== undefined && value !== null)) {
            for (var i: number = 0; i < ary.length; i++) {
                if (value === ary[i]) {
                    index = i;
                    break;
                }
            }
        }

        return index;

    }

    function bindEvent(el: any, name: string, handler: any): IKrodDom {
        return <IKrodDom>this;
    }
    
    export interface IKrodDom {
        [index: number]: KrodDom;

        length: number;

        addClass: (className: string) => IKrodDom;
        append: (child: HTMLElement) => IKrodDom;
        attr: (name: string, value?: string) => string | IKrodDom;
        attrKVP: (name: string) => IAttributeValue;
        body: () => string;
        clear: () => IKrodDom;
        css: (css: string | Object, value?: string) => string | IKrodDom;
        domLoaded: (callback: (event: any) => void) => IKrodDom;
        each: (callback: (item: KrodDom) => void) => IKrodDom;
        find: (selector: string | HTMLElement) => IKrodDom;
        height: (hgt?: number) => number;
        hide: () => IKrodDom;
        html: (html?: string) => any;
        on: (eventType: string, handler: EventListener) => IKrodDom;
        removeClass: (className: string) => IKrodDom;
        show: () => IKrodDom;
        toggle: () => IKrodDom;
        visible: () => boolean;
        width: (wd?: number) => number;
        isString: (value: any) => boolean;
        isObject: (value: any) => boolean;

    }

    function createDomObject(): IKrodDom {
        var ikdom: IKrodDom = {
            length: 0,
            addClass: addClass,
            append: appendChild,
            attr: attr,
            attrKVP: attrKVP,
            body: body,
            clear: clearElements,
            css: css,
            domLoaded: onDomLoaded,
            each: forEach,
            find: find,
            height: height,
            hide: hide,
            html: getHtml,
            on: onEvent,
            removeClass: removeClass,
            show: show,
            toggle: toggle,
            visible: visible,
            width: width,
            isString: isString,
            isObject: isObject
        };

        return ikdom;

    }

    function createAttrValue(): IAttributeValue {
        var iattr: IAttributeValue = {
            length: 0
        };
        
        return iattr;

    }

    function addClass(className: string): IKrodDom {

        if (typeof this === "object") {

            try {

                for (var i: number = 0; i < (<IKrodDom>this).length; i++) {
                    var item: KrodDom = <KrodDom>(<IKrodDom>this)[i];

                    if (item)
                        item.addClass(className);

                }

                return <IKrodDom>this;

            }
            catch (e) {
                return createDomObject();
            }

        }

    }

    function appendChild(child: HTMLElement): IKrodDom {

        if (typeof this === "object") {

            try {

                for (var i: number = 0; i < (<IKrodDom>this).length; i++) {
                    var item: KrodDom = <KrodDom>(<IKrodDom>this)[i];

                    if (item)
                        item.append(child);

                }

                return <IKrodDom>this;

            }
            catch (e) {
                return createDomObject();
            }

        }

    }

    function attr(name: string, value?: string): string | IKrodDom {

        if (typeof this === "object") {

            try {

                if (isString(name) && isString(value)) {

                    for (var i: number = 0; i < (<IKrodDom>this).length; i++) {
                        var item: KrodDom = <KrodDom>(<IKrodDom>this)[i];

                        if (item)
                            item.attr(name, value);

                    }

                    return <IKrodDom>this;

                }
                else {
                    var item: KrodDom = <KrodDom>(<IKrodDom>this)[0];

                    if (item && isString(name))
                        return <string>item.attr(name);
                    else
                        return "";

                }
                
            }
            catch (e) {
                return createDomObject();
            }

        }

    }

    function attrKVP(name: string): IAttributeValue {
        var iattr: IAttributeValue = createAttrValue();

        if (typeof this === "object") {

            try {
                var item: KrodDom = <KrodDom>(<IKrodDom>this)[0];

                if (item && isString(name)) {
                    var pairs: string[] = (<string>item.attr(name)).split(";");

                    for (var i: number = 0; i < pairs.length; i++) {
                        var parts: string[] = pairs[i].split(":");

                        if (parts.length === 2) {

                            if (!isNaN(parseInt(parts[1].trim()))) {
                                iattr[parts[0].trim().toUpperCase()] = (parts[1].trim().indexOf(".") > -1 ? parseFloat(parts[1].trim()) : parseInt(parts[1].trim()));
                                iattr.length++;
                            }
                            else {
                                iattr[parts[0].trim().toUpperCase()] = parts[1].trim();
                                iattr.length++;
                            }

                        }

                    }

                }

            }
            catch (e) {
                return createAttrValue();
            }

        }

        return iattr;

    }

    function body(): string {

        if (typeof this === "object") {

            try {
                var item: KrodDom = <KrodDom>(<IKrodDom>this)[0];

                if (item) {
                    return item.body();
                }

                return "";

            }
            catch (e) {
                return "";
            }

        }

    }

    function clearElements(): IKrodDom {

        if (typeof this === "object") {

            try {

                for (var i: number = 0; i < (<IKrodDom>this).length; i++) {
                    var item: KrodDom = <KrodDom>(<IKrodDom>this)[i];

                    if (item)
                        item.clear();

                }

                return <IKrodDom>this;

            }
            catch (e) {
                return createDomObject();
            }

        }

    }

    function css(css: string | Object, value?: string): string | IKrodDom {

        if (typeof this === "object") {

            try {

                if ((isString(css) && isString(value)) || isObject(css)) {

                    for (var i: number = 0; i < (<IKrodDom>this).length; i++) {
                        var item: KrodDom = <KrodDom>(<IKrodDom>this)[i];

                        if (item)
                            item.css(css, value);

                    }

                    return <IKrodDom>this;

                }
                else {
                    var item: KrodDom = <KrodDom>(<IKrodDom>this)[0];

                    if (item)
                        return <string>item.css(css);

                }

            }
            catch (e) {
                return createDomObject();
            }

        }

    }

    function onDomLoaded(callback: (event: any) => void): IKrodDom {

        if (typeof this === "object") {

            try {

                document.addEventListener("readystatechange", function (ev) {

                    if (callback && document.readyState === "interactive") {
                        callback(ev);
                    }

                });

                return <IKrodDom>this;

            }
            catch (e) {
                return createDomObject();
            }

        }

    }

    function onEvent(eventType: string, handler: EventListener): IKrodDom {

        if (typeof this === "object") {

            try {

                for (var i: number = 0; i < (<IKrodDom>this).length; i++) {
                    var item: KrodDom = <KrodDom>(<IKrodDom>this)[i];

                    if (item)
                        item.on(eventType, handler);

                }

                return <IKrodDom>this;

            }
            catch (e) {
                return createDomObject();
            }

        }

    }

    function find(selector: string | HTMLElement): IKrodDom {
        var ikdom: IKrodDom = createDomObject();

        if (typeof this === "object") {

            try {
                var item: KrodDom = <KrodDom>(<IKrodDom>this)[0];

                if (item) {
                    ikdom = KDom(selector, <HTMLElement>item.Element);
                }

                return ikdom;

            }
            catch (e) {
                return createDomObject();
            }

        }

    }

    function forEach(callback: (item: KrodDom) => void): IKrodDom {
        var t = typeof this;

        if (typeof this === "object") {

            try {

                for (var i: number = 0; i < (<IKrodDom>this).length; i++) {
                    if (callback)
                        callback((<IKrodDom>this)[i]);
                }

                return <IKrodDom>this;

            }
            catch (e) {
                return createDomObject();
            }

        }

    }

    function hide(): IKrodDom {

        if (typeof this === "object") {

            try {

                for (var i: number = 0; i < (<IKrodDom>this).length; i++) {
                    var item: KrodDom = <KrodDom>(<IKrodDom>this)[i];

                    if (item)
                        item.hide();

                }

                return <IKrodDom>this;

            }
            catch (e) {
                return createDomObject();
            }

        }

    }

    function getHtml(html?: string): string | IKrodDom {

        if (typeof this === "object") {

            try {
                var returnVal: any;

                if (html) {

                    for (var i: number = 0; i < (<IKrodDom>this).length; i++) {
                        var item: KrodDom = <KrodDom>(<IKrodDom>this)[i];

                        if (item)
                            item.html(html);

                    }

                    returnVal = <IKrodDom>this;

                }
                else {
                    var combinedHtml: string = "";

                    for (var i: number = 0; i < (<IKrodDom>this).length; i++) {
                        var item: KrodDom = <KrodDom>(<IKrodDom>this)[i];

                        if (item)
                            combinedHtml += item.html();

                    }

                    returnVal = <string>combinedHtml;

                }

                return returnVal;

            }
            catch (e) {
                return "";
            }

        }

    }

    function height(hgt?: number): number {

        if (typeof this === "object") {

            try {
                var result: number = 0;

                if (hgt !== undefined && hgt !== null) {

                    for (var i: number = 0; i < (<IKrodDom>this).length; i++) {
                        var item: KrodDom = <KrodDom>(<IKrodDom>this)[i];

                        if (item)
                            item.height(hgt);

                    }
                    
                }
                else {
                    
                    for (var i: number = 0; i < (<IKrodDom>this).length; i++) {
                        var item: KrodDom = <KrodDom>(<IKrodDom>this)[i];

                        if (item)
                            result += item.height();

                    }
                    
                }

                return result;

            }
            catch (e) {
                return -1;
            }

        }

    }

    function removeClass(className: string): IKrodDom {

        if (typeof this === "object") {

            try {

                for (var i: number = 0; i < (<IKrodDom>this).length; i++) {
                    var item: KrodDom = <KrodDom>(<IKrodDom>this)[i];

                    if (item)
                        item.removeClass(className);

                }

                return <IKrodDom>this;

            }
            catch (e) {
                return createDomObject();
            }

        }

    }

    function show(): IKrodDom {

        if (typeof this === "object") {

            try {

                for (var i: number = 0; i < (<IKrodDom>this).length; i++) {
                    var item: KrodDom = <KrodDom>(<IKrodDom>this)[i];

                    if (item)
                        item.show();

                }

                return <IKrodDom>this;

            }
            catch (e) {
                return createDomObject();
            }

        }

    }

    function toggle(): IKrodDom {

        if (typeof this === "object") {

            try {

                for (var i: number = 0; i < (<IKrodDom>this).length; i++) {
                    var item: KrodDom = <KrodDom>(<IKrodDom>this)[i];

                    if (item) {
                        if (item.visible())
                            item.hide();
                        else
                            item.show();
                    }

                }

                return <IKrodDom>this;

            }
            catch (e) {
                return createDomObject();
            }

        }

    }

    function visible(): boolean {

        if (typeof this === "object") {

            try {

                for (var i: number = 0; i < (<IKrodDom>this).length; i++) {
                    var item: KrodDom = <KrodDom>(<IKrodDom>this)[i];

                    if (item && !item.visible())
                        return false;

                }


                return true;

            }
            catch (e) {
                return true;
            }

        }

    }

    function width(wd?: number): number {

        if (typeof this === "object") {

            try {
                var result: number = 0;

                if (wd !== undefined && wd !== null) {

                    for (var i: number = 0; i < (<IKrodDom>this).length; i++) {
                        var item: KrodDom = <KrodDom>(<IKrodDom>this)[i];

                        if (item)
                            item.width(wd);

                    }

                }
                else {

                    for (var i: number = 0; i < (<IKrodDom>this).length; i++) {
                        var item: KrodDom = <KrodDom>(<IKrodDom>this)[i];

                        if (item)
                            result += item.width();

                    }

                }

                return result;

            }
            catch (e) {
                return -1;
            }

        }

    }

    function isString(value: any): boolean {
        if (value && (typeof value === "string" || (typeof value === "object" && (Object.prototype.toString.call(value) === "[object String]"))))
            return true;
        else if (typeof value === "number" || (typeof value === "object" && (Object.prototype.toString.call(value) === "[object Number]")))
            return true;
        else
            return false;
    }

    function isObject(value: any): boolean {
        if (value && (typeof value === "object" || (typeof value === "object" && (Object.prototype.toString.call(value) === "[object Object]"))))
            return true;
        else
            return false;
    }

    class KrodDom {
        private _Element: HTMLElement | HTMLDocument | Window;
        get Element(): HTMLElement | HTMLDocument | Window {
            return this._Element;
        }

        constructor(element: HTMLElement | HTMLDocument | Window) {
            this._Element = element;
        }

        public addClass = (className: string): KrodDom => {

            if ((this.Element && this.Element instanceof HTMLElement) && className) {
                var classList: string[] = className.split(" ");

                classList.forEach((cls: string) => {
                    if (!(<HTMLElement>this.Element).classList.contains(cls))
                        (<HTMLElement>this.Element).classList.add(cls);
                });

            }

            return this;
        }

        public append = (child: HTMLElement): KrodDom => {

            if ((this.Element && this.Element instanceof HTMLElement) && child)
                (<HTMLElement>this.Element).appendChild(child);

            if ((this.Element && this.Element instanceof HTMLDocument) && child)
                (<HTMLDocument>this.Element).appendChild(child);

            return this;

        }

        public attr = (name: string, value?: string): string | KrodDom => {
            
            if (this.Element && this.Element instanceof HTMLElement) {

                if (isString(name)) {

                    if (isString(value)) {
                        (<HTMLElement>this.Element).setAttribute(name, value);
                    }
                    else {
                        return (<HTMLElement>this.Element).getAttribute(name);
                    }

                }

            }

            return this;
        }

        public clear = (): KrodDom => {

            if (this.Element && this.Element instanceof HTMLElement) {
                while ((<HTMLElement>this.Element).hasChildNodes()) {
                    (<HTMLElement>this.Element).removeChild((<HTMLElement>this.Element).firstChild);
                }
            }
            
            return this;
        }
        
        public css = (css: string | Object, value?: string): string | KrodDom => {
            var caseChanger = function (name: string): string {
                var matches = name.match(/\-[a-zA-Z]/gm);

                if (matches) {

                    matches.forEach(function (match) {
                        var firstChar = match.replace("-", "").trim();
                        var rgx = new RegExp("\-[a-zA-Z]", "gm");
                        name = name.replace(rgx, firstChar.toUpperCase());
                    });

                }

                return name;
                
            };

            if (this.Element && this.Element instanceof HTMLElement) {

                if (css) {

                    if (isString(css) && isString(value)) {
                        css = caseChanger(<string>css);
                        if ((<HTMLElement>this.Element).style[<string>css] !== undefined)
                            (<HTMLElement>this.Element).style[<string>css] = value;
                    }
                    else if (isObject(css)) {
                        var keys = Object.keys(<Object>css);

                        if (keys && keys.length) {

                            for (var i: number = 0; i < keys.length; i++) {
                                var key: string = caseChanger(<string>keys[i]);
                                if ((<HTMLElement>this.Element).style && (<HTMLElement>this.Element).style[<string>key] !== undefined)
                                    (<HTMLElement>this.Element).style[<string>key] = (<Object>css)[<string>keys[i]];
                            }

                        }

                    }
                    else if (isString(css)) {
                        var key: string = caseChanger(<string>css);
                        if ((<HTMLElement>this.Element).style && (<HTMLElement>this.Element).style[<string>key] !== undefined)
                            return (<HTMLElement>this.Element).style[<string>key];
                    }

                }

            }

            return this;
        }

        public hide = (): KrodDom => {

            if (this.isBlockElement() || this.isInlineElement()) {
                this.css({
                    display: "none",
                    visibility: "hidden"
                });
                console.log("Hidden using css");
            }
            
            return this;

        }

        public html = (html?: string): string | KrodDom => {

            if ((this.Element && this.Element instanceof HTMLElement) && html) {
                (<HTMLElement>this.Element).innerHTML = html;
                return this;
            }
            else {
                if (this.Element && this.Element instanceof HTMLElement)
                    return (<HTMLElement>this.Element).innerHTML;
                else if (this.Element && this.Element instanceof HTMLDocument)
                    return (<HTMLDocument>this.Element).body.innerHTML;
                else
                    return "";
            }

        }

        public body = (): string => {

            if (this.Element) {

                if (this.Element instanceof HTMLElement) {
                    return (<HTMLElement>this.Element).outerHTML;
                }

                if (this.Element instanceof HTMLDocument) {
                    return (<HTMLDocument>this.Element).documentElement.outerHTML;
                }

                return "";

            }
            else {
                return "";
            }
            
        }

        public height = (hgt?: number): number => {

            if ((this.Element || this.Element instanceof HTMLDocument) && (hgt !== undefined && hgt !== null)) {

                if (this.Element instanceof HTMLElement)
                    (<HTMLElement>this.Element).clientHeight = hgt;

                if (this.Element instanceof HTMLDocument)
                    (<HTMLDocument>this.Element).documentElement.clientHeight = hgt;


                return 0;
            }
            else {
                if (this.Element && this.Element instanceof HTMLElement)
                    return (<HTMLElement>this.Element).clientHeight;
                else if (this.Element && this.Element instanceof HTMLDocument)
                    return (<HTMLDocument>this.Element).documentElement.clientHeight;
                else if (this.Element && this.Element instanceof Window)
                    return (<Window>this.Element).innerHeight;
                else
                    return -1;
            }

        }

        public on = (eventType: string, handler: EventListener): KrodDom => {

            if (this.Element && this.Element instanceof HTMLElement) {
                Handlers.push(new EventData(this.Element, eventType, handler));

                this.Element.addEventListener(eventType, handler);

            }

            return this;

        }

        public removeClass = (className: string): KrodDom => {

            if ((this.Element && this.Element instanceof HTMLElement) && className) {
                var classList: string[] = className.split(" ");

                classList.forEach((cls: string) => {
                    if ((<HTMLElement>this.Element).classList.contains(cls))
                        (<HTMLElement>this.Element).classList.remove(cls);
                });

            }

            return this;
        }

        public show = (): KrodDom => {

            if (this.isBlockElement() || this.isInlineElement()) {
                this.css({
                    display: "",
                    visibility: "visible"
                });
                console.log("Displayed using css");
            }
            
            return this;

        }

        public visible = (): boolean => {

            if (this.isBlockElement() || this.isInlineElement()) {
                return (<HTMLElement>this.Element).style.display !== "none" && (<HTMLElement>this.Element).style.visibility !== "hidden";
            }

            return true;

        }

        public width = (wd?: number): number => {

            if ((this.Element || this.Element instanceof HTMLDocument) && (wd !== undefined && wd !== null)) {

                if (this.Element instanceof HTMLElement)
                    (<HTMLElement>this.Element).clientWidth = wd;

                if (this.Element instanceof HTMLDocument)
                    (<HTMLDocument>this.Element).documentElement.clientWidth = wd;


                return 0;
            }
            else {
                
                if (this.Element && this.Element instanceof HTMLElement) {
                    var elementWidth: number = ((<HTMLElement>this.Element).scrollWidth > (<HTMLElement>this.Element).clientWidth ? (<HTMLElement>this.Element).scrollWidth : (<HTMLElement>this.Element).clientWidth);
                    var currentWidth: string = "";
                    
                    if (elementWidth === 0) {
                        currentWidth = (<HTMLElement>this.Element).style.width.replace("px", "");
                        elementWidth = (!isNaN(parseInt(currentWidth)) && parseInt(currentWidth) > elementWidth ? parseInt(currentWidth) : elementWidth);
                    }

                    if (elementWidth === 0) {
                        
                        for (var i: number = 0; i < (<HTMLElement>this.Element).classList.length; i++) {
                            currentWidth = this.GetCssValue((<HTMLElement>this.Element).classList[i], "width");
                            elementWidth = (!isNaN(parseInt(currentWidth.replace("px", ""))) && parseInt(currentWidth.replace("px", "")) > elementWidth ? parseInt(currentWidth.replace("px", "")) : elementWidth);
                        }

                    }

                    var marginLeft: string = (<HTMLElement>this.Element).style.marginRight.replace("px", "");
                    var marginRight: string = (<HTMLElement>this.Element).style.marginLeft.replace("px", "");
                    var leftMargin: number = (!isNaN(parseInt(marginLeft)) ? parseInt(marginLeft) : 0);
                    var rightMargin: number = (!isNaN(parseInt(marginRight)) ? parseInt(marginRight) : 0);

                    return elementWidth + leftMargin + rightMargin;
                }
                else if (this.Element && this.Element instanceof HTMLDocument)
                    return (<HTMLDocument>this.Element).documentElement.clientWidth;
                else if (this.Element && this.Element instanceof Window)
                    return (<Window>this.Element).innerWidth;
                else
                    return -1;
            }

        }

        private isBlockElement = (): boolean => {
            var blockElements = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "ol", "ul", "pre", "address", "blockquote", "dl", "div", "fieldset", "form", "hr", "noscript", "table"];

            if (this.Element) {

                try {
                    var elmnt: HTMLElement = <HTMLElement>this.Element;

                    if (elmnt.nodeType === 1) {
                        return (arrayIndex(blockElements, elmnt.nodeName) > -1);
                    }
                    else {
                        return false;
                    }

                }
                catch (e) {
                    return false;
                }
                
            }

            return false;

        }

        private isInlineElement = (): boolean => {
            var blockElements = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "ol", "ul", "pre", "address", "blockquote", "dl", "div", "fieldset", "form", "hr", "noscript", "table"];

            if (this.Element) {

                try {
                    var elmnt: HTMLElement = <HTMLElement>this.Element;

                    if (elmnt.nodeType === 1) {
                        return (arrayIndex(blockElements, elmnt.nodeName) === -1);
                    }
                    else {
                        return false;
                    }

                }
                catch (e) {
                    return false;
                }

            }

            return false;

        }

        //  Used to get the value of a property found in the supplied CSS class
        private GetCssValue = (className: string, property: string): string => {

            for (var i = 0; i < document.styleSheets.length; i++) {

                try {
                    var styleSheet: any = document.styleSheets[i];
                    var classes = (styleSheet.rules ? styleSheet.rules : (styleSheet.cssRules ? styleSheet.cssRules : undefined));

                    if (classes !== undefined) {

                        for (var c = 0; c < classes.length; c++) {

                            if ((<string>classes[c].selectorText).indexOf(className) > -1) {
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

    }

}

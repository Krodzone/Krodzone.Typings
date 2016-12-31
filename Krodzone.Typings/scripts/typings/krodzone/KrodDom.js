var Handlers = new Array();
var $$ = function (selector, context) {
    return Krodzone.KDom(selector, context);
};
$$["arrayIndex"] = function (ary, value) {
    var index = -1;
    if (((ary !== undefined && ary !== null) && (ary.length !== undefined && ary.length !== null)) && (value !== undefined && value !== null)) {
        for (var i = 0; i < ary.length; i++) {
            if (value === ary[i]) {
                index = i;
                break;
            }
        }
    }
    return index;
};
var EventData = (function () {
    function EventData(element, eventType, handler) {
        this.element = element;
        this.eventType = eventType;
        this.handler = handler;
    }
    return EventData;
}());
var Krodzone;
(function (Krodzone) {
    Krodzone.KDom = function (selector, context) {
        var findById = function (selector, context, searcher) {
            var elements = new Array();
            if (context && context) {
                elements = searcher("id=" + selector, context);
            }
            else {
                var results = document.getElementById(selector);
                if (results) {
                    elements.push(results);
                }
            }
            return elements;
        };
        var findByTag = function (selector, context) {
            var elements = new Array();
            var results = (context ? context.getElementsByTagName(selector) : document.getElementsByTagName(selector));
            if (results && results.length) {
                for (var i = 0; i < results.length; i++) {
                    if (results[i] instanceof HTMLElement) {
                        elements.push(results[i]);
                    }
                }
            }
            return elements;
        };
        var findByName = function (selector) {
            var elements = new Array();
            var results = document.getElementsByName(selector);
            if (results && results.length) {
                for (var i = 0; i < results.length; i++) {
                    if (results[i] instanceof HTMLElement) {
                        elements.push(results[i]);
                    }
                }
            }
            return elements;
        };
        var findByClass = function (selector, context) {
            var elements = new Array();
            var results = (context ? context.getElementsByClassName(selector) : document.getElementsByClassName(selector));
            if (results && results.length) {
                for (var i = 0; i < results.length; i++) {
                    if (results[i] instanceof HTMLElement) {
                        elements.push(results[i]);
                    }
                }
            }
            return elements;
        };
        var findByAttribute = function (selector, context) {
            var elements = new Array();
            var parent = (context ? context : document.documentElement);
            var findAll = function (searcher, element, attrName, attrValue) {
                var els = new Array();
                if (searcher && element && (attrName !== undefined && attrName !== "")) {
                    for (var i = 0; i < element.children.length; i++) {
                        var children = searcher(searcher, element.children[i], attrName, attrValue);
                        children.forEach(function (child) {
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
            };
            var parts = selector.split("=");
            var attrName = (parts && parts.length && parts.length > 0 ? parts[0] : undefined);
            var attrValue = (parts && parts.length && parts.length === 2 ? parts[1] : undefined);
            elements = findAll(findAll, parent, attrName, attrValue);
            return elements;
        };
        var ikdom = createDomObject();
        var items;
        if (ikdom.isObject(selector)) {
            if (selector instanceof HTMLElement) {
                ikdom[0] = new KrodDom(selector);
                ikdom.length = 1;
            }
            if (selector instanceof HTMLDocument) {
                ikdom[0] = new KrodDom(selector);
                ikdom.length = 1;
            }
            if (selector instanceof Window) {
                ikdom[0] = new KrodDom(selector);
                ikdom.length = 1;
            }
            if (selector instanceof KrodDom) {
                var kd = selector;
                ikdom[0] = kd;
                ikdom.length = 1;
            }
            if (selector["length"] && selector["length"] > 0 && selector[0] instanceof KrodDom) {
                ikdom = selector;
            }
        }
        else {
            if (ikdom.isString(selector)) {
                //  Find by id
                if (selector.substring(0, 1) === "#") {
                    items = findById(selector.replace("#", ""), context, findByAttribute);
                }
                else if (selector.substring(0, 1) === ".") {
                    items = findByClass(selector.replace(".", ""), context);
                }
                else if (selector.substring(0, 1) === "[") {
                    items = findByAttribute(selector.replace("[", "").replace("]", ""), context);
                }
                else {
                    items = findById(selector.replace("#", ""));
                    if (!items)
                        items = findByClass(selector.replace(".", ""), context);
                    if (!items)
                        items = findByName(selector);
                    if (!items)
                        items = findByTag(selector, context);
                }
                if (items && items.length) {
                    for (var i = 0; i < items.length; i++) {
                        if (items[i] instanceof HTMLElement) {
                            ikdom[i] = new KrodDom(items[i]);
                            ikdom.length++;
                        }
                    }
                }
            }
        }
        return ikdom;
    };
    function arrayIndex(ary, value) {
        var index = -1;
        if (((ary !== undefined && ary !== null) && (ary.length !== undefined && ary.length !== null)) && (value !== undefined && value !== null)) {
            for (var i = 0; i < ary.length; i++) {
                if (value === ary[i]) {
                    index = i;
                    break;
                }
            }
        }
        return index;
    }
    function bindEvent(el, name, handler) {
        return this;
    }
    function createDomObject() {
        var ikdom = {
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
    function createAttrValue() {
        var iattr = {
            length: 0
        };
        return iattr;
    }
    function addClass(className) {
        if (typeof this === "object") {
            try {
                for (var i = 0; i < this.length; i++) {
                    var item = this[i];
                    if (item)
                        item.addClass(className);
                }
                return this;
            }
            catch (e) {
                return createDomObject();
            }
        }
    }
    function appendChild(child) {
        if (typeof this === "object") {
            try {
                for (var i = 0; i < this.length; i++) {
                    var item = this[i];
                    if (item)
                        item.append(child);
                }
                return this;
            }
            catch (e) {
                return createDomObject();
            }
        }
    }
    function attr(name, value) {
        if (typeof this === "object") {
            try {
                if (isString(name) && isString(value)) {
                    for (var i = 0; i < this.length; i++) {
                        var item = this[i];
                        if (item)
                            item.attr(name, value);
                    }
                    return this;
                }
                else {
                    var item = this[0];
                    if (item && isString(name))
                        return item.attr(name);
                    else
                        return "";
                }
            }
            catch (e) {
                return createDomObject();
            }
        }
    }
    function attrKVP(name) {
        var iattr = createAttrValue();
        if (typeof this === "object") {
            try {
                var item = this[0];
                if (item && isString(name)) {
                    var pairs = item.attr(name).split(";");
                    for (var i = 0; i < pairs.length; i++) {
                        var parts = pairs[i].split(":");
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
    function body() {
        if (typeof this === "object") {
            try {
                var item = this[0];
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
    function clearElements() {
        if (typeof this === "object") {
            try {
                for (var i = 0; i < this.length; i++) {
                    var item = this[i];
                    if (item)
                        item.clear();
                }
                return this;
            }
            catch (e) {
                return createDomObject();
            }
        }
    }
    function css(css, value) {
        if (typeof this === "object") {
            try {
                if ((isString(css) && isString(value)) || isObject(css)) {
                    for (var i = 0; i < this.length; i++) {
                        var item = this[i];
                        if (item)
                            item.css(css, value);
                    }
                    return this;
                }
                else {
                    var item = this[0];
                    if (item)
                        return item.css(css);
                }
            }
            catch (e) {
                return createDomObject();
            }
        }
    }
    function onDomLoaded(callback) {
        if (typeof this === "object") {
            try {
                document.addEventListener("readystatechange", function (ev) {
                    if (callback && document.readyState === "interactive") {
                        callback(ev);
                    }
                });
                return this;
            }
            catch (e) {
                return createDomObject();
            }
        }
    }
    function onEvent(eventType, handler) {
        if (typeof this === "object") {
            try {
                for (var i = 0; i < this.length; i++) {
                    var item = this[i];
                    if (item)
                        item.on(eventType, handler);
                }
                return this;
            }
            catch (e) {
                return createDomObject();
            }
        }
    }
    function find(selector) {
        var ikdom = createDomObject();
        if (typeof this === "object") {
            try {
                var item = this[0];
                if (item) {
                    ikdom = Krodzone.KDom(selector, item.Element);
                }
                return ikdom;
            }
            catch (e) {
                return createDomObject();
            }
        }
    }
    function forEach(callback) {
        var t = typeof this;
        if (typeof this === "object") {
            try {
                for (var i = 0; i < this.length; i++) {
                    if (callback)
                        callback(this[i]);
                }
                return this;
            }
            catch (e) {
                return createDomObject();
            }
        }
    }
    function hide() {
        if (typeof this === "object") {
            try {
                for (var i = 0; i < this.length; i++) {
                    var item = this[i];
                    if (item)
                        item.hide();
                }
                return this;
            }
            catch (e) {
                return createDomObject();
            }
        }
    }
    function getHtml(html) {
        if (typeof this === "object") {
            try {
                var returnVal;
                if (html) {
                    for (var i = 0; i < this.length; i++) {
                        var item = this[i];
                        if (item)
                            item.html(html);
                    }
                    returnVal = this;
                }
                else {
                    var combinedHtml = "";
                    for (var i = 0; i < this.length; i++) {
                        var item = this[i];
                        if (item)
                            combinedHtml += item.html();
                    }
                    returnVal = combinedHtml;
                }
                return returnVal;
            }
            catch (e) {
                return "";
            }
        }
    }
    function height(hgt) {
        if (typeof this === "object") {
            try {
                var result = 0;
                if (hgt !== undefined && hgt !== null) {
                    for (var i = 0; i < this.length; i++) {
                        var item = this[i];
                        if (item)
                            item.height(hgt);
                    }
                }
                else {
                    for (var i = 0; i < this.length; i++) {
                        var item = this[i];
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
    function removeClass(className) {
        if (typeof this === "object") {
            try {
                for (var i = 0; i < this.length; i++) {
                    var item = this[i];
                    if (item)
                        item.removeClass(className);
                }
                return this;
            }
            catch (e) {
                return createDomObject();
            }
        }
    }
    function show() {
        if (typeof this === "object") {
            try {
                for (var i = 0; i < this.length; i++) {
                    var item = this[i];
                    if (item)
                        item.show();
                }
                return this;
            }
            catch (e) {
                return createDomObject();
            }
        }
    }
    function toggle() {
        if (typeof this === "object") {
            try {
                for (var i = 0; i < this.length; i++) {
                    var item = this[i];
                    if (item) {
                        if (item.visible())
                            item.hide();
                        else
                            item.show();
                    }
                }
                return this;
            }
            catch (e) {
                return createDomObject();
            }
        }
    }
    function visible() {
        if (typeof this === "object") {
            try {
                for (var i = 0; i < this.length; i++) {
                    var item = this[i];
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
    function width(wd) {
        if (typeof this === "object") {
            try {
                var result = 0;
                if (wd !== undefined && wd !== null) {
                    for (var i = 0; i < this.length; i++) {
                        var item = this[i];
                        if (item)
                            item.width(wd);
                    }
                }
                else {
                    for (var i = 0; i < this.length; i++) {
                        var item = this[i];
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
    function isString(value) {
        if (value && (typeof value === "string" || (typeof value === "object" && (Object.prototype.toString.call(value) === "[object String]"))))
            return true;
        else if (typeof value === "number" || (typeof value === "object" && (Object.prototype.toString.call(value) === "[object Number]")))
            return true;
        else
            return false;
    }
    function isObject(value) {
        if (value && (typeof value === "object" || (typeof value === "object" && (Object.prototype.toString.call(value) === "[object Object]"))))
            return true;
        else
            return false;
    }
    var KrodDom = (function () {
        function KrodDom(element) {
            var _this = this;
            this.addClass = function (className) {
                if ((_this.Element && _this.Element instanceof HTMLElement) && className) {
                    var classList = className.split(" ");
                    classList.forEach(function (cls) {
                        if (!_this.Element.classList.contains(cls))
                            _this.Element.classList.add(cls);
                    });
                }
                return _this;
            };
            this.append = function (child) {
                if ((_this.Element && _this.Element instanceof HTMLElement) && child)
                    _this.Element.appendChild(child);
                if ((_this.Element && _this.Element instanceof HTMLDocument) && child)
                    _this.Element.appendChild(child);
                return _this;
            };
            this.attr = function (name, value) {
                if (_this.Element && _this.Element instanceof HTMLElement) {
                    if (isString(name)) {
                        if (isString(value)) {
                            _this.Element.setAttribute(name, value);
                        }
                        else {
                            return _this.Element.getAttribute(name);
                        }
                    }
                }
                return _this;
            };
            this.clear = function () {
                if (_this.Element && _this.Element instanceof HTMLElement) {
                    while (_this.Element.hasChildNodes()) {
                        _this.Element.removeChild(_this.Element.firstChild);
                    }
                }
                return _this;
            };
            this.css = function (css, value) {
                var caseChanger = function (name) {
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
                if (_this.Element && _this.Element instanceof HTMLElement) {
                    if (css) {
                        if (isString(css) && isString(value)) {
                            css = caseChanger(css);
                            if (_this.Element.style[css] !== undefined)
                                _this.Element.style[css] = value;
                        }
                        else if (isObject(css)) {
                            var keys = Object.keys(css);
                            if (keys && keys.length) {
                                for (var i = 0; i < keys.length; i++) {
                                    var key = caseChanger(keys[i]);
                                    if (_this.Element.style && _this.Element.style[key] !== undefined)
                                        _this.Element.style[key] = css[keys[i]];
                                }
                            }
                        }
                        else if (isString(css)) {
                            var key = caseChanger(css);
                            if (_this.Element.style && _this.Element.style[key] !== undefined)
                                return _this.Element.style[key];
                        }
                    }
                }
                return _this;
            };
            this.hide = function () {
                if (_this.isBlockElement() || _this.isInlineElement()) {
                    _this.css({
                        display: "none",
                        visibility: "hidden"
                    });
                    console.log("Hidden using css");
                }
                return _this;
            };
            this.html = function (html) {
                if ((_this.Element && _this.Element instanceof HTMLElement) && html) {
                    _this.Element.innerHTML = html;
                    return _this;
                }
                else {
                    if (_this.Element && _this.Element instanceof HTMLElement)
                        return _this.Element.innerHTML;
                    else if (_this.Element && _this.Element instanceof HTMLDocument)
                        return _this.Element.body.innerHTML;
                    else
                        return "";
                }
            };
            this.body = function () {
                if (_this.Element) {
                    if (_this.Element instanceof HTMLElement) {
                        return _this.Element.outerHTML;
                    }
                    if (_this.Element instanceof HTMLDocument) {
                        return _this.Element.documentElement.outerHTML;
                    }
                    return "";
                }
                else {
                    return "";
                }
            };
            this.height = function (hgt) {
                if ((_this.Element || _this.Element instanceof HTMLDocument) && (hgt !== undefined && hgt !== null)) {
                    if (_this.Element instanceof HTMLElement)
                        _this.Element.clientHeight = hgt;
                    if (_this.Element instanceof HTMLDocument)
                        _this.Element.documentElement.clientHeight = hgt;
                    return 0;
                }
                else {
                    if (_this.Element && _this.Element instanceof HTMLElement)
                        return _this.Element.clientHeight;
                    else if (_this.Element && _this.Element instanceof HTMLDocument)
                        return _this.Element.documentElement.clientHeight;
                    else if (_this.Element && _this.Element instanceof Window)
                        return _this.Element.innerHeight;
                    else
                        return -1;
                }
            };
            this.on = function (eventType, handler) {
                if (_this.Element && _this.Element instanceof HTMLElement) {
                    Handlers.push(new EventData(_this.Element, eventType, handler));
                    _this.Element.addEventListener(eventType, handler);
                }
                return _this;
            };
            this.removeClass = function (className) {
                if ((_this.Element && _this.Element instanceof HTMLElement) && className) {
                    var classList = className.split(" ");
                    classList.forEach(function (cls) {
                        if (_this.Element.classList.contains(cls))
                            _this.Element.classList.remove(cls);
                    });
                }
                return _this;
            };
            this.show = function () {
                if (_this.isBlockElement() || _this.isInlineElement()) {
                    _this.css({
                        display: "",
                        visibility: "visible"
                    });
                    console.log("Displayed using css");
                }
                return _this;
            };
            this.visible = function () {
                if (_this.isBlockElement() || _this.isInlineElement()) {
                    return _this.Element.style.display !== "none" && _this.Element.style.visibility !== "hidden";
                }
                return true;
            };
            this.width = function (wd) {
                if ((_this.Element || _this.Element instanceof HTMLDocument) && (wd !== undefined && wd !== null)) {
                    if (_this.Element instanceof HTMLElement)
                        _this.Element.clientWidth = wd;
                    if (_this.Element instanceof HTMLDocument)
                        _this.Element.documentElement.clientWidth = wd;
                    return 0;
                }
                else {
                    if (_this.Element && _this.Element instanceof HTMLElement) {
                        var elementWidth = (_this.Element.scrollWidth > _this.Element.clientWidth ? _this.Element.scrollWidth : _this.Element.clientWidth);
                        var currentWidth = "";
                        if (elementWidth === 0) {
                            currentWidth = _this.Element.style.width.replace("px", "");
                            elementWidth = (!isNaN(parseInt(currentWidth)) && parseInt(currentWidth) > elementWidth ? parseInt(currentWidth) : elementWidth);
                        }
                        if (elementWidth === 0) {
                            for (var i = 0; i < _this.Element.classList.length; i++) {
                                currentWidth = _this.GetCssValue(_this.Element.classList[i], "width");
                                elementWidth = (!isNaN(parseInt(currentWidth.replace("px", ""))) && parseInt(currentWidth.replace("px", "")) > elementWidth ? parseInt(currentWidth.replace("px", "")) : elementWidth);
                            }
                        }
                        var marginLeft = _this.Element.style.marginRight.replace("px", "");
                        var marginRight = _this.Element.style.marginLeft.replace("px", "");
                        var leftMargin = (!isNaN(parseInt(marginLeft)) ? parseInt(marginLeft) : 0);
                        var rightMargin = (!isNaN(parseInt(marginRight)) ? parseInt(marginRight) : 0);
                        return elementWidth + leftMargin + rightMargin;
                    }
                    else if (_this.Element && _this.Element instanceof HTMLDocument)
                        return _this.Element.documentElement.clientWidth;
                    else if (_this.Element && _this.Element instanceof Window)
                        return _this.Element.innerWidth;
                    else
                        return -1;
                }
            };
            this.isBlockElement = function () {
                var blockElements = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "ol", "ul", "pre", "address", "blockquote", "dl", "div", "fieldset", "form", "hr", "noscript", "table"];
                if (_this.Element) {
                    try {
                        var elmnt = _this.Element;
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
            };
            this.isInlineElement = function () {
                var blockElements = ["p", "h1", "h2", "h3", "h4", "h5", "h6", "ol", "ul", "pre", "address", "blockquote", "dl", "div", "fieldset", "form", "hr", "noscript", "table"];
                if (_this.Element) {
                    try {
                        var elmnt = _this.Element;
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
            };
            //  Used to get the value of a property found in the supplied CSS class
            this.GetCssValue = function (className, property) {
                for (var i = 0; i < document.styleSheets.length; i++) {
                    try {
                        var styleSheet = document.styleSheets[i];
                        var classes = (styleSheet.rules ? styleSheet.rules : (styleSheet.cssRules ? styleSheet.cssRules : undefined));
                        if (classes !== undefined) {
                            for (var c = 0; c < classes.length; c++) {
                                if (classes[c].selectorText.indexOf(className) > -1) {
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
            this._Element = element;
        }
        Object.defineProperty(KrodDom.prototype, "Element", {
            get: function () {
                return this._Element;
            },
            enumerable: true,
            configurable: true
        });
        return KrodDom;
    }());
})(Krodzone || (Krodzone = {}));
//# sourceMappingURL=KrodDom.js.map
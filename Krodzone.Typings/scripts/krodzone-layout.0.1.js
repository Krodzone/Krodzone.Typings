
window.addEventListener("load", function (ev) {
    var intervalId = setInterval(function () {

    }, 100);

    setTimeout(function () {
        clearInterval(intervalId);

        var body = document.getElementsByTagName("body")[0];

        for (var i = 0; i < body.children.length; i++) {
            var element = body.children[i];
            updateRowContentWidths(element);
        }

    }, 500);

});

window.addEventListener("resize", function (ev) {

    setTimeout(function () {

        var body = document.getElementsByTagName("body")[0];

        for (var i = 0; i < body.children.length; i++) {
            var element = body.children[i];
            updateRowContentWidths(element);
        }

    }, 500);

});

window.addEventListener("hashchange", function (ev) {

    setTimeout(function () {

        var body = document.getElementsByTagName("body")[0];

        for (var i = 0; i < body.children.length; i++) {
            var element = body.children[i];
            updateRowContentWidths(element);
        }

    }, 500);

});

function updateRowContentWidths(element) {

    if (element.nodeName !== "SCRIPT") {

        if (element.classList.contains("row")) {
            setColumnWidth(element);
        }

        for (var i = 0; i < element.children.length; i++) {
            var elmnt = element.children[i];
            updateRowContentWidths(elmnt);
        }

    }

}

function setColumnWidth(row) {

    if (row !== undefined && row !== null) {
        var calcFactors = [0, 0.05, 0.1, 0.15, 0.2, 0.25, 0.333, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0];
        var rowWidth = row.clientWidth;
        var totalWidth = Math.floor(rowWidth * 0.988);
        var totalCols = 0;

        for (var c = 0; c < row.children.length; c++) {
            var col = row.children[c];
            var colIndex = col.classList.indexOf(/col-.*/);
            var spIndex = col.classList.indexOf(/span.*/);
            var rhIndex = col.classList.indexOf(/row-height-.*/);

            if (colIndex > -1) {
                var factor = (!isNaN(parseInt(col.classList[colIndex].replace("col-", ""))) ? calcFactors[parseInt(col.classList[colIndex].replace("col-", ""))] : 0);
                var rowHeight = (rhIndex > -1 && !isNaN(parseInt(col.classList[rhIndex].replace("row-height-", ""))) ? parseInt(col.classList[rhIndex].replace("row-height-", "")) : 25);
                var spanFactor = (spIndex > -1 && !isNaN(parseInt(col.classList[spIndex].replace("span", ""))) ? parseInt(col.classList[spIndex].replace("span", "")) : 1);
                var borderWidth = (col.classList.contains("border-box") ? 2 :
                                    col.classList.contains("border-left") ? 1 : 0 +
                                    col.classList.contains("border-right") ? 1 : 0);
                var colWidth = parseInt(totalWidth * factor) - (4 + borderWidth);
                var colHeight = ((rowHeight * spanFactor) + (6 * spanFactor));

                resizeImages(col, colWidth); //parseFloat(colWidth - 1) / parseFloat(col.clientWidth));

                col.style.width = colWidth + "px";
                col.style.height = (spanFactor > 1 ? colHeight + "px" : col.style.height);

            }

        }

    }

}

function resizeImages(col, colWidth) {

    if (col !== undefined && col !== null) {

        for (var c = 0; c < col.children.length; c++) {
            var child = col.children[c];

            if (child.nodeName === "IMG") {
                var width = Math.floor(colWidth * 0.95) - 10;
                var height = parseInt(Math.floor((child.clientHeight * width) / child.clientWidth));

                child.style.width = width + "px";
                child.style.height = height + "px";
            }

        }

    }

}

DOMTokenList.prototype.indexOf = function (rgx) {
    for (var i = 0; i < this.length; i++) {
        if (rgx.test(this[i])) {
            return i;
        }
    }
    return -1;
}

DOMTokenList.prototype.inList = function (rgx) {
    for (var i = 0; i < this.length; i++) {
        if (rgx.test(this[i])) {
            return true;
        }
    }
    return false;
}
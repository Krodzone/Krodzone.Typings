/// <reference path="kroddom.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
window.addEventListener("load", function (ev) {
    var calendars = new Array();
    var calElements = document.getElementsByTagName("calendar");
    var calAttributes = $("body").find("[calendar]");
    if (calElements && calElements.length) {
        var controlBase = new Krodzone.Controls.BaseControl();
        for (var i = 0; i < calElements.length; i++) {
            var calElement = calElements[i];
            var parent = calElement.parentElement;
            var element = document.createElement("div");
            for (var atIdx = 0; atIdx < calElement.attributes.length; atIdx++) {
                element.setAttribute(calElement.attributes.item(atIdx).name, calElement.attributes.item(atIdx).value);
            }
            parent.replaceChild(element, calElement);
            Handlers.forEach(function (data) {
                if (calElement instanceof HTMLElement && calElement === data.element) {
                    $$(element).on(data.eventType, data.handler);
                    calElement.removeEventListener(data.eventType, data.handler);
                }
            });
            calendars.push(new Krodzone.Controls.Calendar(element));
        }
    }
    if (calAttributes && calAttributes.length) {
        for (var i = 0; i < calAttributes.length; i++) {
            calendars.push(new Krodzone.Controls.Calendar(calAttributes[i]));
        }
    }
});
var EventDispatcher = (function () {
    function EventDispatcher() {
        this._subscriptions = new Array();
    }
    EventDispatcher.prototype.subscribe = function (handler) {
        if (handler) {
            this._subscriptions.push(handler);
        }
    };
    EventDispatcher.prototype.unsubscribe = function (handler) {
        var i = this._subscriptions.indexOf(handler);
        if (i > -1) {
            this._subscriptions.splice(i, 1);
        }
    };
    EventDispatcher.prototype.dispatch = function (sender, args) {
        for (var _i = 0, _a = this._subscriptions; _i < _a.length; _i++) {
            var handler = _a[_i];
            handler(sender, args);
        }
    };
    return EventDispatcher;
}());
var EventArgs = (function () {
    function EventArgs(target, data) {
        var that = this;
        that._target = target;
        that._data = data;
    }
    Object.defineProperty(EventArgs.prototype, "target", {
        get: function () {
            return this._target;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(EventArgs.prototype, "data", {
        get: function () {
            return this._data;
        },
        enumerable: true,
        configurable: true
    });
    return EventArgs;
}());
var Krodzone;
(function (Krodzone) {
    var Controls;
    (function (Controls) {
        var BaseControl = (function () {
            function BaseControl() {
                var that = this;
                that.AddClasses = function (el, classList) {
                    if (el && classList && classList.length) {
                        classList.forEach(function (cls) {
                            if (!el.classList.contains(cls)) {
                                el.classList.add(cls);
                            }
                        });
                    }
                };
            }
            return BaseControl;
        }());
        Controls.BaseControl = BaseControl;
        var Calendar = (function (_super) {
            __extends(Calendar, _super);
            function Calendar(container) {
                _super.call(this);
                var that = this, table = document.createElement("table"), caption = document.createElement("caption"), btnPrev = document.createElement("button"), btnNext = document.createElement("button"), prev = document.createElement("span"), next = document.createElement("span"), title = document.createElement("span"), thead = document.createElement("thead"), tbody = document.createElement("tbody"), tfoot = document.createElement("tfoot");
                var calendarDateHeader = function () {
                    var row = document.createElement("tr");
                    var cell1 = document.createElement("td");
                    var cell2 = document.createElement("td");
                    var cell3 = document.createElement("td");
                    var cell4 = document.createElement("td");
                    var cell5 = document.createElement("td");
                    var cell6 = document.createElement("td");
                    var cell7 = document.createElement("td");
                    that.AddClasses(cell1, ["hdr-cal-view"]);
                    that.AddClasses(cell2, ["hdr-cal-view"]);
                    that.AddClasses(cell3, ["hdr-cal-view"]);
                    that.AddClasses(cell4, ["hdr-cal-view"]);
                    that.AddClasses(cell5, ["hdr-cal-view"]);
                    that.AddClasses(cell6, ["hdr-cal-view"]);
                    that.AddClasses(cell7, ["hdr-cal-view"]);
                    cell1.innerHTML = "SUN";
                    cell2.innerHTML = "MON";
                    cell3.innerHTML = "TUE";
                    cell4.innerHTML = "WED";
                    cell5.innerHTML = "THU";
                    cell6.innerHTML = "FRI";
                    cell7.innerHTML = "SAT";
                    row.appendChild(cell1);
                    row.appendChild(cell2);
                    row.appendChild(cell3);
                    row.appendChild(cell4);
                    row.appendChild(cell5);
                    row.appendChild(cell6);
                    row.appendChild(cell7);
                    return row;
                }, calendarMonthHeader = function () {
                    var row = document.createElement("tr");
                    var cell = document.createElement("td");
                    that.AddClasses(cell, ["hdr-month-view"]);
                    cell.setAttribute("colspan", "3");
                    cell.innerHTML = "&nbsp;";
                    row.appendChild(cell);
                    return row;
                }, calendarFooter = function (colspan) {
                    var row = document.createElement("tr");
                    var cell = document.createElement("td");
                    cell.setAttribute("colspan", colspan.toString());
                    cell.innerHTML = "Today&nbsp;<span>&nbsp;&nbsp;&nbsp;</span><strong>:</strong>&nbsp;&nbsp;&nbsp;&nbsp;" + Krodzone.KrodzoneDate.toShortDateString(new Date());
                    row.appendChild(cell);
                    $$(cell).on("click", function (ev) {
                        that.SelectedDate = new Date();
                        that.Calendar = CalendarMatrix.GetCalendar(that.SelectedDate);
                        $(title).html(that.Calendar.MonthName + " " + that.Calendar.Year.toString());
                        $(tbody).empty();
                        that.Calendar.Weeks.forEach(function (week) {
                            tbody.appendChild(week.TableRow);
                        });
                        var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                        var event = document.createEvent("CustomEvent");
                        var weekDay = new Krodzone.KrodzoneDate(that.SelectedDate);
                        var calendarDay = new Day(weekDay.Day, daysOfWeek[weekDay.DOW], weekDay.CurrentDate, true, true);
                        event.initCustomEvent("dateselected", true, true, new EventArgs(that.Container, calendarDay));
                        event["data"] = event.detail;
                        that.Container.dispatchEvent(event);
                    });
                    return row;
                };
                that.AddClasses(prev, ["nav", "left"]);
                that.AddClasses(btnPrev, ["btn", "btn-xs", "btn-default"]);
                that.AddClasses(next, ["nav", "right"]);
                that.AddClasses(btnNext, ["btn", "btn-xs", "btn-default"]);
                that.AddClasses(title, ["title"]);
                $$(btnPrev).html('<i class="fa fa-chevron-left" aria-hidden="true"></i>');
                $$(btnNext).html('<i class="fa fa-chevron-right" aria-hidden="true"></i>');
                prev.appendChild(btnPrev);
                next.appendChild(btnNext);
                caption.appendChild(prev);
                caption.appendChild(title);
                caption.appendChild(next);
                thead.appendChild(calendarDateHeader());
                tfoot.appendChild(calendarFooter(7));
                table.appendChild(caption);
                table.appendChild(thead);
                table.appendChild(tbody);
                table.appendChild(tfoot);
                that.Container = container;
                if (!that.Container)
                    return;
                that.SelectedDate = (that.Container.attributes.getNamedItem("selecteddate") && Krodzone.KrodzoneDate.dateValid(that.Container.attributes.getNamedItem("selecteddate").value) ? new Date(that.Container.attributes.getNamedItem("selecteddate").value) : (that.Container.attributes.getNamedItem("selected-date") && Krodzone.KrodzoneDate.dateValid(that.Container.attributes.getNamedItem("selected-date").value) ? new Date(that.Container.attributes.getNamedItem("selected-date").value) :
                    new Date()));
                that.Years = YearMatrix.GetYears(that.SelectedDate.getFullYear());
                that.Calendar = CalendarMatrix.GetCalendar(that.SelectedDate);
                that.AddClasses(that.Container, ["calendar"]);
                $$(title).html(that.Calendar.MonthName + " " + that.Calendar.Year.toString());
                $$(that.Container).clear();
                $$(that.Container).append(table);
                that.Calendar.Weeks.forEach(function (week) {
                    $$(tbody).append(week.TableRow);
                });
                $$(table).on("dateselected", function (ev) {
                    var eventArgs = (ev["data"] ? ev["data"] : undefined);
                    ev.preventDefault();
                    ev.stopImmediatePropagation();
                    if (eventArgs) {
                        that.SelectedDate = eventArgs.data.Date;
                        if (!eventArgs.data.CurrentMonth) {
                            that.Calendar = CalendarMatrix.GetCalendar(that.SelectedDate);
                            $$(title).html(that.Calendar.MonthName + " " + that.Calendar.Year.toString());
                            $$(tbody).clear();
                            that.Calendar.Weeks.forEach(function (week) {
                                $$(tbody).append(week.TableRow);
                            });
                        }
                        else {
                            $$(tbody).find(".selected").removeClass("selected");
                            $$(eventArgs.target).addClass("selected");
                        }
                        var event = document.createEvent("CustomEvent");
                        event.initCustomEvent("dateselected", true, true, new EventArgs(that.Container, eventArgs.data));
                        event["data"] = event.detail;
                        that.Container.dispatchEvent(event);
                    }
                });
            }
            Calendar.prototype.CreateDatePicker = function (changeView, selectPrevious, selectNext) {
                var container = document.createElement("div");
                var calendar = new CalendarItemCollection(container);
                container.classList.add("datepicker-container");
                /******************************************************************************************
                 *  Create Header Row
                 ******************************************************************************************/
                var hdrRow = document.createElement("div");
                hdrRow.classList.add("datepicker-row");
                hdrRow.classList.add("datepicker-colhdr-row");
                var hdrNavPrev = document.createElement("div");
                var hdrContent = document.createElement("div");
                var hdrNavNext = document.createElement("div");
                hdrNavPrev.classList.add("datepicker-nav-item");
                hdrContent.classList.add("datepicker-mo-yr-item");
                hdrNavNext.classList.add("datepicker-nav-item");
                var btnPrev = document.createElement("button");
                var btnNext = document.createElement("button");
                btnPrev.classList.add("btn");
                btnPrev.classList.add("btn-default");
                btnPrev.classList.add("btn-xs");
                btnNext.classList.add("btn");
                btnNext.classList.add("btn-default");
                btnNext.classList.add("btn-xs");
                btnPrev.innerHTML = '<i class="fa fa-chevron-left"></i>';
                btnPrev.onclick = function (ev) {
                    selectPrevious();
                };
                hdrNavPrev.appendChild(btnPrev);
                hdrContent.onclick = function (ev) {
                    changeView();
                };
                btnNext.innerHTML = '<i class="fa fa-chevron-right"></i>';
                btnNext.onclick = function (ev) {
                    selectNext();
                };
                hdrNavNext.appendChild(btnNext);
                hdrRow.appendChild(hdrNavPrev);
                hdrRow.appendChild(hdrContent);
                hdrRow.appendChild(hdrNavNext);
                container.appendChild(hdrRow);
                calendar.HeaderRow.push(new CalendarItem(hdrNavPrev, ""));
                calendar.HeaderRow.push(new CalendarItem(hdrContent, ""));
                calendar.HeaderRow.push(new CalendarItem(hdrNavNext, ""));
                /******************************************************************************************
                 *  Create DOW Row
                 ******************************************************************************************/
                var dowRow = document.createElement("div");
                dowRow.classList.add("datepicker-row");
                dowRow.classList.add("datepicker-dow-row");
                dowRow.classList.add("datepicker-colhdr-row");
                var SUN = document.createElement("div");
                var MON = document.createElement("div");
                var TUE = document.createElement("div");
                var WED = document.createElement("div");
                var THU = document.createElement("div");
                var FRI = document.createElement("div");
                var SAT = document.createElement("div");
                SUN.classList.add("datepicker-day-item");
                SUN.textContent = "SUN";
                MON.classList.add("datepicker-day-item");
                MON.textContent = "MON";
                TUE.classList.add("datepicker-day-item");
                TUE.textContent = "TUE";
                WED.classList.add("datepicker-day-item");
                WED.textContent = "WED";
                THU.classList.add("datepicker-day-item");
                THU.textContent = "THU";
                FRI.classList.add("datepicker-day-item");
                FRI.textContent = "FRI";
                SAT.classList.add("datepicker-day-item");
                SAT.textContent = "SAT";
                dowRow.appendChild(SUN);
                dowRow.appendChild(MON);
                dowRow.appendChild(TUE);
                dowRow.appendChild(WED);
                dowRow.appendChild(THU);
                dowRow.appendChild(FRI);
                dowRow.appendChild(SAT);
                container.appendChild(dowRow);
                /******************************************************************************************
                 *  Create Rows
                 ******************************************************************************************/
                for (var r = 0; r < 6; r++) {
                    var row = document.createElement("div");
                    row.classList.add("datepicker-row");
                    var calItemRow = this.CreateCalendarRow("datepicker-item", 7);
                    for (var i = 0; i < calItemRow.length; i++) {
                        calItemRow[i].Element.onclick = function (ev) {
                            //this.SelectYear(parseInt(calItemRow[i].Element.textContent));
                        };
                        row.appendChild(calItemRow[i].Element);
                    }
                    container.appendChild(row);
                    calendar.Rows.push(calItemRow);
                }
                return calendar;
            };
            Calendar.prototype.CreateYearPicker = function (selectPrevious, selectNext) {
                var container = document.createElement("div");
                var calendar = new CalendarItemCollection(container);
                container.classList.add("datepicker-mnth-yr-container");
                /******************************************************************************************
                 *  Create Header Row
                 ******************************************************************************************/
                var hdrRow = document.createElement("div");
                hdrRow.classList.add("datepicker-row");
                hdrRow.classList.add("datepicker-colhdr-row");
                var hdrNavPrev = document.createElement("div");
                var hdrContent = document.createElement("div");
                var hdrNavNext = document.createElement("div");
                hdrNavPrev.classList.add("datepicker-nav-item");
                hdrContent.classList.add("datepicker-mo-yr-item");
                hdrNavNext.classList.add("datepicker-nav-item");
                var btnPrev = document.createElement("button");
                var btnNext = document.createElement("button");
                btnPrev.classList.add("btn");
                btnPrev.classList.add("btn-default");
                btnPrev.classList.add("btn-xs");
                btnNext.classList.add("btn");
                btnNext.classList.add("btn-default");
                btnNext.classList.add("btn-xs");
                btnPrev.innerHTML = '<i class="fa fa-chevron-left"></i>';
                btnPrev.onclick = function (ev) {
                    selectPrevious();
                };
                hdrNavPrev.appendChild(btnPrev);
                btnNext.innerHTML = '<i class="fa fa-chevron-right"></i>';
                btnNext.onclick = function (ev) {
                    selectNext();
                };
                hdrNavNext.appendChild(btnNext);
                hdrRow.appendChild(hdrNavPrev);
                hdrRow.appendChild(hdrContent);
                hdrRow.appendChild(hdrNavNext);
                container.appendChild(hdrRow);
                calendar.HeaderRow.push(new CalendarItem(hdrNavPrev, ""));
                calendar.HeaderRow.push(new CalendarItem(hdrContent, ""));
                calendar.HeaderRow.push(new CalendarItem(hdrNavNext, ""));
                /******************************************************************************************
                 *  Create Rows
                 ******************************************************************************************/
                for (var r = 0; r < 4; r++) {
                    var row = document.createElement("div");
                    row.classList.add("datepicker-mo-yr-row");
                    var calItemRow = this.CreateCalendarRow("dp-mo-yr-item", 3);
                    for (var i = 0; i < calItemRow.length; i++) {
                        calItemRow[i].Element.onclick = function (ev) {
                            //this.SelectYear(parseInt(calItemRow[i].Element.textContent));
                        };
                        row.appendChild(calItemRow[i].Element);
                    }
                    container.appendChild(row);
                    calendar.Rows.push(calItemRow);
                }
                return calendar;
            };
            Calendar.prototype.CreateMonthPicker = function (changeView, currentYear) {
                var container = document.createElement("div");
                container.classList.add("datepicker-mnth-yr-container");
                /******************************************************************************************
                 *  Create Header Row
                 ******************************************************************************************/
                var hdrRow = document.createElement("div");
                hdrRow.classList.add("datepicker-row");
                hdrRow.classList.add("datepicker-colhdr-row");
                var hdrNavPrev = document.createElement("div");
                var hdrContent = document.createElement("div");
                var hdrNavNext = document.createElement("div");
                hdrNavPrev.classList.add("datepicker-nav-item");
                hdrContent.classList.add("datepicker-mo-yr-item");
                hdrNavNext.classList.add("datepicker-nav-item");
                var btnPrev = document.createElement("button");
                var btnNext = document.createElement("button");
                btnPrev.classList.add("btn");
                btnPrev.classList.add("btn-default");
                btnPrev.classList.add("btn-xs");
                btnNext.classList.add("btn");
                btnNext.classList.add("btn-default");
                btnNext.classList.add("btn-xs");
                btnPrev.disabled = true;
                btnNext.disabled = true;
                btnPrev.innerHTML = '<i class="fa fa-chevron-left"></i>';
                hdrNavPrev.appendChild(btnPrev);
                hdrContent.textContent = currentYear.toString();
                hdrContent.onclick = function (ev) {
                    changeView();
                };
                btnNext.innerHTML = '<i class="fa fa-chevron-right"></i>';
                hdrNavNext.appendChild(btnNext);
                hdrRow.appendChild(hdrNavPrev);
                hdrRow.appendChild(hdrContent);
                hdrRow.appendChild(hdrNavNext);
                container.appendChild(hdrRow);
                /******************************************************************************************
                 *  Row One -   Jan   |   Feb   |   Mar
                 ******************************************************************************************/
                var rowOne = document.createElement("div");
                rowOne.classList.add("datepicker-mo-yr-row");
                var jan = document.createElement("div");
                var feb = document.createElement("div");
                var mar = document.createElement("div");
                jan.classList.add("dp-mo-yr-item");
                jan.textContent = "Jan";
                jan.onclick = function (ev) {
                    //this.SelectMonth(1);
                };
                feb.classList.add("dp-mo-yr-item");
                feb.textContent = "Feb";
                feb.onclick = function (ev) {
                    //this.SelectMonth(2);
                };
                mar.classList.add("dp-mo-yr-item");
                mar.textContent = "Mar";
                mar.onclick = function (ev) {
                    //this.SelectMonth(3);
                };
                rowOne.appendChild(jan);
                rowOne.appendChild(feb);
                rowOne.appendChild(mar);
                container.appendChild(rowOne);
                /******************************************************************************************
                 *  Row Two -   Apr   |   May   |   Jun
                 ******************************************************************************************/
                var rowTwo = document.createElement("div");
                rowTwo.classList.add("datepicker-mo-yr-row");
                var apr = document.createElement("div");
                var may = document.createElement("div");
                var jun = document.createElement("div");
                apr.classList.add("dp-mo-yr-item");
                apr.textContent = "Apr";
                apr.onclick = function (ev) {
                    //this.SelectMonth(4);
                };
                may.classList.add("dp-mo-yr-item");
                may.textContent = "May";
                may.onclick = function (ev) {
                    //this.SelectMonth(5);
                };
                jun.classList.add("dp-mo-yr-item");
                jun.textContent = "Jun";
                jun.onclick = function (ev) {
                    //this.SelectMonth(6);
                };
                rowTwo.appendChild(apr);
                rowTwo.appendChild(may);
                rowTwo.appendChild(jun);
                container.appendChild(rowTwo);
                /******************************************************************************************
                 *  Row Three -   Jul   |   Aug   |   Sep
                 ******************************************************************************************/
                var rowThree = document.createElement("div");
                rowThree.classList.add("datepicker-mo-yr-row");
                var jul = document.createElement("div");
                var aug = document.createElement("div");
                var sep = document.createElement("div");
                jul.classList.add("dp-mo-yr-item");
                jul.textContent = "Jul";
                jul.onclick = function (ev) {
                    //this.SelectMonth(7);
                };
                aug.classList.add("dp-mo-yr-item");
                aug.textContent = "Aug";
                aug.onclick = function (ev) {
                    //this.SelectMonth(8);
                };
                sep.classList.add("dp-mo-yr-item");
                sep.textContent = "Sep";
                sep.onclick = function (ev) {
                    //this.SelectMonth(9);
                };
                rowThree.appendChild(jul);
                rowThree.appendChild(aug);
                rowThree.appendChild(sep);
                container.appendChild(rowThree);
                /******************************************************************************************
                 *  Row Four -   Oct   |   Nov   |   Dec
                 ******************************************************************************************/
                var rowFour = document.createElement("div");
                rowFour.classList.add("datepicker-mo-yr-row");
                var oct = document.createElement("div");
                var nov = document.createElement("div");
                var dec = document.createElement("div");
                oct.classList.add("dp-mo-yr-item");
                oct.textContent = "Oct";
                oct.onclick = function (ev) {
                    //this.SelectMonth(10);
                };
                nov.classList.add("dp-mo-yr-item");
                nov.textContent = "Nov";
                nov.onclick = function (ev) {
                    //this.SelectMonth(11);
                };
                dec.classList.add("dp-mo-yr-item");
                dec.textContent = "Dec";
                dec.onclick = function (ev) {
                    //this.SelectMonth(12);
                };
                rowFour.appendChild(oct);
                rowFour.appendChild(nov);
                rowFour.appendChild(dec);
                container.appendChild(rowFour);
                return container;
            };
            Calendar.prototype.CreateCalendarRow = function (itemClass, totalItems) {
                var calRow = new Array();
                for (var i = 0; i < totalItems; i++) {
                    var div = document.createElement("div");
                    div.classList.add(itemClass);
                    calRow.push(new CalendarItem(div, ""));
                }
                return calRow;
            };
            return Calendar;
        }(BaseControl));
        Controls.Calendar = Calendar;
        var CalendarItemCollection = (function () {
            function CalendarItemCollection(control) {
                var that = this;
                that.Control = control;
                that.HeaderRow = new Array();
                that.Rows = new Array();
            }
            return CalendarItemCollection;
        }());
        Controls.CalendarItemCollection = CalendarItemCollection;
        var CalendarItem = (function () {
            function CalendarItem(element, text) {
                var that = this;
                that.Element = element;
                that.Text = text;
            }
            return CalendarItem;
        }());
        Controls.CalendarItem = CalendarItem;
        var YearMatrix = (function () {
            function YearMatrix(minYear, maxYear) {
                var that = this;
                that.MinYear = minYear;
                that.MaxYear = maxYear;
                that.Rows = new Array();
            }
            YearMatrix.GetYears = function (yr) {
                var startYear = ((yr - 4) < 1900 ? 1900 : (yr - 4));
                var endYear = 0;
                if ((yr + 7) > 2099) {
                    endYear = 2099;
                    startYear = endYear - 11;
                }
                else {
                    endYear = yr + 7;
                }
                var years = new YearMatrix(startYear, endYear);
                for (var r = 0; r < 4; r++) {
                    var rowYear = new YearRow();
                    for (var y = (startYear + (3 * r)); y < ((startYear + (3 * r)) + 3); y++) {
                        years.MinYear = (y < startYear ? y : startYear);
                        years.MaxYear = (y > endYear ? y : endYear);
                        var yearItem = new YearItem(y);
                        rowYear.Years.push(yearItem);
                        rowYear.TableRow.appendChild(yearItem.TableCell);
                    }
                    years.Rows.push(rowYear);
                }
                return years;
            };
            return YearMatrix;
        }());
        var YearRow = (function (_super) {
            __extends(YearRow, _super);
            function YearRow() {
                _super.call(this);
                var that = this;
                that.Years = new Array();
                that.TableRow = document.createElement("tr");
            }
            return YearRow;
        }(BaseControl));
        var YearItem = (function (_super) {
            __extends(YearItem, _super);
            function YearItem(year) {
                _super.call(this);
                var that = this;
                that.Year = year;
                that.TableCell = document.createElement("td");
                that.AddClasses(that.TableCell, ["cal-month"]);
            }
            return YearItem;
        }(BaseControl));
        var CalendarMatrix = (function () {
            function CalendarMatrix(monthNumber, monthName, monthAbbrev, year) {
                var that = this;
                that.MonthNumber = monthNumber;
                that.MonthName = monthName;
                that.MonthAbbrev = monthAbbrev;
                that.Year = year;
                that.Weeks = new Array();
            }
            CalendarMatrix.GetCalendar = function (date) {
                var sdate = (date.getMonth() + 1) + '/1/' + date.getFullYear();
                var parts = new Krodzone.KrodzoneDate(new Date(sdate));
                var moSmall = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                var moLrg = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
                var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                var calendar = new CalendarMatrix(parts.Month, moLrg[parts.Month - 1], moSmall[parts.Month - 1], parts.Year);
                var daysInWeek = 7 - parts.DOW;
                var startDay = daysInWeek - 7;
                var weeks = new Array();
                var currentDaysInMonth = Krodzone.KrodzoneDate.daysInMonth(parts.CurrentDate);
                var prevDaysInMonth = Krodzone.KrodzoneDate.daysInMonth(Krodzone.KrodzoneDate.dateAdd("MONTH", -1, parts.CurrentDate));
                for (var wk = 0; wk < 6; wk++) {
                    var week = new Week(wk + 1);
                    for (var day = startDay; day < (startDay + 7); day++) {
                        var mo = (day < 0 ? (parts.Month == 1 ? 12 : parts.Month - 1) : parts.Month);
                        var dy = ((parts.Day + (day)) <= 0 ? prevDaysInMonth + (parts.Day + (day)) : (parts.Day + (day)));
                        var yr = (day < 0 ? (parts.Month == 1 ? parts.Year - 1 : parts.Year) : parts.Year);
                        sdate = (mo != calendar.MonthNumber ? mo : (dy > currentDaysInMonth ? (mo == 12 ? 1 : mo + 1) : mo)) + '/' + (mo == calendar.MonthNumber ? (dy > currentDaysInMonth ? dy - currentDaysInMonth : dy) : dy) + '/' + (mo != calendar.MonthNumber ? yr : (dy > currentDaysInMonth ? (mo == 12 ? yr + 1 : yr) : yr));
                        var weekDay = new Krodzone.KrodzoneDate(new Date(sdate));
                        var calendarDay = new Day(weekDay.Day, daysOfWeek[weekDay.DOW], weekDay.CurrentDate, (weekDay.Month == parts.Month), Krodzone.KrodzoneDate.dateDiff("DAY", date, weekDay.CurrentDate) === 0);
                        week.AddDay(calendarDay);
                    }
                    weeks.push(week);
                    startDay += 7;
                }
                calendar.Weeks = weeks;
                return calendar;
            };
            return CalendarMatrix;
        }());
        var Week = (function (_super) {
            __extends(Week, _super);
            function Week(weekNumber) {
                _super.call(this);
                var that = this;
                that.WeekNumber = weekNumber;
                that.Days = new Array();
                that.TableRow = document.createElement("tr");
                that.AddClasses(that.TableRow, ["cal-date"]);
                that.AddDay = function (day) {
                    that.Days.push(day);
                    that.TableRow.appendChild(day.TableCell);
                };
            }
            return Week;
        }(BaseControl));
        var Day = (function (_super) {
            __extends(Day, _super);
            function Day(num, name, date, currentMonth, currentDate) {
                _super.call(this);
                this._onDateSelected = new EventDispatcher();
                var that = this;
                that.Number = num;
                that.Name = name;
                that.Date = date;
                that.CurrentMonth = currentMonth;
                that.TableCell = document.createElement("td");
                var classes = new Array();
                if (currentMonth) {
                    classes.push("active-month");
                }
                else {
                    classes.push("inactive-month");
                }
                if (currentDate) {
                    classes.push("selected");
                }
                if (Krodzone.KrodzoneDate.dateDiff("DAY", new Date(), date) === 0) {
                    classes.push("today");
                }
                that.AddClasses(that.TableCell, classes);
                $$(that.TableCell).html(that.Number.toString());
                $$(that.TableCell).on("click", function (ev) {
                    var event = document.createEvent("CustomEvent");
                    event.initCustomEvent("dateselected", true, true, new EventArgs(that.TableCell, that));
                    event["data"] = event.detail;
                    that.TableCell.dispatchEvent(event);
                });
            }
            Object.defineProperty(Day.prototype, "onDateSelected", {
                get: function () {
                    return this._onDateSelected;
                },
                enumerable: true,
                configurable: true
            });
            return Day;
        }(BaseControl));
    })(Controls = Krodzone.Controls || (Krodzone.Controls = {}));
})(Krodzone || (Krodzone = {}));
//# sourceMappingURL=Krodzone.Controls.js.map
/// <reference path="kroddom.ts" />

window.addEventListener("load", (ev: Event): void => {
    var calendars: Krodzone.Controls.Calendar[] = new Array<Krodzone.Controls.Calendar>();
    var calElements = document.getElementsByTagName("calendar");
    var calAttributes = $("body").find("[calendar]");

    if (calElements && calElements.length) {
        var controlBase: Krodzone.Controls.BaseControl = new Krodzone.Controls.BaseControl();

        for (var i: number = 0; i < calElements.length; i++) {
            var calElement: HTMLElement = <HTMLElement>calElements[i];
            var parent: HTMLElement = calElement.parentElement;
            var element: HTMLDivElement = document.createElement("div")


            for (var atIdx: number = 0; atIdx < calElement.attributes.length; atIdx++) {
                element.setAttribute(calElement.attributes.item(atIdx).name, calElement.attributes.item(atIdx).value);
            }
            
            parent.replaceChild(element, calElement);
            
            Handlers.forEach((data: EventData) => {
                if (calElement instanceof HTMLElement && calElement === data.element) {
                    $$(element).on(data.eventType, data.handler);
                    calElement.removeEventListener(data.eventType, data.handler);
                }
            });

            calendars.push(new Krodzone.Controls.Calendar(element));
        }

    }

    if (calAttributes && calAttributes.length) {

        for (var i: number = 0; i < calAttributes.length; i++) {
            calendars.push(new Krodzone.Controls.Calendar(<HTMLElement>calAttributes[i]));
        }

    }
    
});

interface IEvent<TSender, TArgs> {

    subscribe(handler: (sender: TSender, args: TArgs) => void): void;

    unsubscribe(handler: (sender: TSender, args: TArgs) => void): void;

}

class EventDispatcher<TSender, TArgs> implements IEvent<TSender, TArgs> {

    private _subscriptions: Array<(sender: TSender, args: TArgs) => void> = new Array<(sender: TSender, args: TArgs) => void>();

    subscribe(handler: (sender: TSender, args: TArgs) => void): void {
        if (handler) {
            this._subscriptions.push(handler);
        }
    }

    unsubscribe(handler: (sender: TSender, args: TArgs) => void): void {
        let i = this._subscriptions.indexOf(handler);
        if (i > -1) {
            this._subscriptions.splice(i, 1);
        }
    }

    dispatch(sender: TSender, args: TArgs): void {
        for (let handler of this._subscriptions) {
            handler(sender, args);
        }
    }

}

class EventArgs<T> {

    private _target: HTMLElement;
    get target(): HTMLElement {
        return this._target;
    }

    private _data: T;
    get data(): T {
        return this._data;
    }

    constructor(target: HTMLElement, data: T) {
        var that = this;

        that._target = target;
        that._data = data;

    }

}

module Krodzone.Controls {

    export class BaseControl {
        AddClasses: (el: HTMLElement, classList: string[]) => void;

        constructor() {
            var that = this;

            that.AddClasses = (el: HTMLElement, classList: string[]): void => {

                if (el && classList && classList.length) {
                    classList.forEach((cls: string): void => {
                        if (!el.classList.contains(cls)) {
                            el.classList.add(cls);
                        }
                    });
                }

            }

        }
        
    }

    export class Calendar extends BaseControl {
        SelectedDate: Date;
        Years: YearMatrix;
        Calendar: CalendarMatrix;
        
        Container: HTMLElement;

        CalendarPicker: CalendarItemCollection;
        YearPicker: CalendarItemCollection;
        MonthView: HTMLDivElement;
        
        constructor(container: HTMLElement) {
            super();

            var that = this,
                table: HTMLTableElement = document.createElement("table"),
                caption: HTMLTableCaptionElement = document.createElement("caption"),
                btnPrev: HTMLButtonElement = document.createElement("button"),
                btnNext: HTMLButtonElement = document.createElement("button"),
                prev: HTMLSpanElement = document.createElement("span"),
                next: HTMLSpanElement = document.createElement("span"),
                title: HTMLSpanElement = document.createElement("span"),
                thead: HTMLTableSectionElement = document.createElement("thead"),
                tbody: HTMLTableSectionElement = document.createElement("tbody"),
                tfoot: HTMLTableSectionElement = document.createElement("tfoot");
            var calendarDateHeader = (): HTMLTableRowElement => {
                var row: HTMLTableRowElement = document.createElement("tr");
                var cell1: HTMLTableCellElement = document.createElement("td");
                var cell2: HTMLTableCellElement = document.createElement("td");
                var cell3: HTMLTableCellElement = document.createElement("td");
                var cell4: HTMLTableCellElement = document.createElement("td");
                var cell5: HTMLTableCellElement = document.createElement("td");
                var cell6: HTMLTableCellElement = document.createElement("td");
                var cell7: HTMLTableCellElement = document.createElement("td");

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

            },
                calendarMonthHeader = (): HTMLTableRowElement => {
                    var row: HTMLTableRowElement = document.createElement("tr");
                    var cell: HTMLTableCellElement = document.createElement("td");

                    that.AddClasses(cell, ["hdr-month-view"]);

                    cell.setAttribute("colspan", "3");
                    cell.innerHTML = "&nbsp;";

                    row.appendChild(cell);

                    return row;

                },
                calendarFooter = (colspan: number): HTMLTableRowElement => {
                    var row: HTMLTableRowElement = document.createElement("tr");
                    var cell: HTMLTableCellElement = document.createElement("td");
                    
                    cell.setAttribute("colspan", colspan.toString());
                    cell.innerHTML = "Today&nbsp;<span>&nbsp;&nbsp;&nbsp;</span><strong>:</strong>&nbsp;&nbsp;&nbsp;&nbsp;" + KrodzoneDate.toShortDateString(new Date());

                    row.appendChild(cell);
                    
                    $$(cell).on("click", function (ev) {
                        that.SelectedDate = new Date();
                        that.Calendar = CalendarMatrix.GetCalendar(that.SelectedDate);

                        $(title).html(that.Calendar.MonthName + " " + that.Calendar.Year.toString());
                        $(tbody).empty();

                        that.Calendar.Weeks.forEach((week: Week): void => {
                            tbody.appendChild(week.TableRow);
                        });

                        var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                        var event = document.createEvent("CustomEvent");
                        var weekDay = new KrodzoneDate(that.SelectedDate);
                        var calendarDay: Day = new Day(weekDay.Day, daysOfWeek[weekDay.DOW], weekDay.CurrentDate, true, true);

                        event.initCustomEvent("dateselected", true, true, new EventArgs<Day>(that.Container, calendarDay));
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

            that.SelectedDate = (that.Container.attributes.getNamedItem("selecteddate") && Krodzone.KrodzoneDate.dateValid(that.Container.attributes.getNamedItem("selecteddate").value) ? new Date(that.Container.attributes.getNamedItem("selecteddate").value) : (
                    that.Container.attributes.getNamedItem("selected-date") && Krodzone.KrodzoneDate.dateValid(that.Container.attributes.getNamedItem("selected-date").value) ? new Date(that.Container.attributes.getNamedItem("selected-date").value) :
                        new Date()));
            
            that.Years = YearMatrix.GetYears(that.SelectedDate.getFullYear());
            that.Calendar = CalendarMatrix.GetCalendar(that.SelectedDate);

            that.AddClasses(that.Container, ["calendar"]);

            $$(title).html(that.Calendar.MonthName + " " + that.Calendar.Year.toString());

            $$(that.Container).clear();
            $$(that.Container).append(table);

            that.Calendar.Weeks.forEach((week: Week): void => {
                $$(tbody).append(week.TableRow);
            });

            $$(table).on("dateselected", (ev: UIEvent) => {
                var eventArgs: EventArgs<Day> = (ev["data"] ? <EventArgs<Day>>ev["data"] : undefined);

                ev.preventDefault();
                ev.stopImmediatePropagation();

                if (eventArgs) {
                    that.SelectedDate = eventArgs.data.Date;

                    if (!eventArgs.data.CurrentMonth) {
                        that.Calendar = CalendarMatrix.GetCalendar(that.SelectedDate);

                        $$(title).html(that.Calendar.MonthName + " " + that.Calendar.Year.toString());
                        $$(tbody).clear();

                        that.Calendar.Weeks.forEach((week: Week): void => {
                            $$(tbody).append(week.TableRow);
                        });

                    }
                    else {
                        $$(tbody).find(".selected").removeClass("selected");
                        $$(eventArgs.target).addClass("selected");
                    }


                    var event = document.createEvent("CustomEvent");

                    event.initCustomEvent("dateselected", true, true, new EventArgs<Day>(that.Container, eventArgs.data));
                    event["data"] = event.detail;

                    that.Container.dispatchEvent(event);

                }

            });
            

        }

        CreateDatePicker(changeView: () => void, selectPrevious: () => void, selectNext: () => void): CalendarItemCollection {
            var container: HTMLDivElement = document.createElement("div");
            var calendar = new CalendarItemCollection(container);

            container.classList.add("datepicker-container");


            /******************************************************************************************
             *  Create Header Row
             ******************************************************************************************/
            var hdrRow: HTMLDivElement = document.createElement("div");

            hdrRow.classList.add("datepicker-row");
            hdrRow.classList.add("datepicker-colhdr-row");

            var hdrNavPrev: HTMLDivElement = document.createElement("div");
            var hdrContent: HTMLDivElement = document.createElement("div");
            var hdrNavNext: HTMLDivElement = document.createElement("div");

            hdrNavPrev.classList.add("datepicker-nav-item");
            hdrContent.classList.add("datepicker-mo-yr-item");
            hdrNavNext.classList.add("datepicker-nav-item");

            var btnPrev: HTMLButtonElement = document.createElement("button");
            var btnNext: HTMLButtonElement = document.createElement("button");


            btnPrev.classList.add("btn");
            btnPrev.classList.add("btn-default");
            btnPrev.classList.add("btn-xs");

            btnNext.classList.add("btn");
            btnNext.classList.add("btn-default");
            btnNext.classList.add("btn-xs");


            btnPrev.innerHTML = '<i class="fa fa-chevron-left"></i>';
            btnPrev.onclick = (ev: MouseEvent) => {
                selectPrevious();
            }
            hdrNavPrev.appendChild(btnPrev);

            hdrContent.onclick = (ev: MouseEvent) => {
                changeView();
            }

            btnNext.innerHTML = '<i class="fa fa-chevron-right"></i>';
            btnNext.onclick = (ev: MouseEvent) => {
                selectNext();
            }
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
            var dowRow: HTMLDivElement = document.createElement("div");

            dowRow.classList.add("datepicker-row");
            dowRow.classList.add("datepicker-dow-row");
            dowRow.classList.add("datepicker-colhdr-row");

            var SUN: HTMLDivElement = document.createElement("div");
            var MON: HTMLDivElement = document.createElement("div");
            var TUE: HTMLDivElement = document.createElement("div");
            var WED: HTMLDivElement = document.createElement("div");
            var THU: HTMLDivElement = document.createElement("div");
            var FRI: HTMLDivElement = document.createElement("div");
            var SAT: HTMLDivElement = document.createElement("div");

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
                var row: HTMLDivElement = document.createElement("div");

                row.classList.add("datepicker-row");

                var calItemRow: CalendarItem[] = this.CreateCalendarRow("datepicker-item", 7);

                for (var i = 0; i < calItemRow.length; i++) {
                    calItemRow[i].Element.onclick = (ev: MouseEvent) => {
                        //this.SelectYear(parseInt(calItemRow[i].Element.textContent));
                    }
                    row.appendChild(calItemRow[i].Element);
                }

                container.appendChild(row);
                calendar.Rows.push(calItemRow);

            }



            return calendar;

        }

        CreateYearPicker(selectPrevious: () => void, selectNext: () => void): CalendarItemCollection {
            var container: HTMLDivElement = document.createElement("div");
            var calendar = new CalendarItemCollection(container);

            container.classList.add("datepicker-mnth-yr-container");


            /******************************************************************************************
             *  Create Header Row
             ******************************************************************************************/
            var hdrRow: HTMLDivElement = document.createElement("div");

            hdrRow.classList.add("datepicker-row");
            hdrRow.classList.add("datepicker-colhdr-row");

            var hdrNavPrev: HTMLDivElement = document.createElement("div");
            var hdrContent: HTMLDivElement = document.createElement("div");
            var hdrNavNext: HTMLDivElement = document.createElement("div");

            hdrNavPrev.classList.add("datepicker-nav-item");
            hdrContent.classList.add("datepicker-mo-yr-item");
            hdrNavNext.classList.add("datepicker-nav-item");

            var btnPrev: HTMLButtonElement = document.createElement("button");
            var btnNext: HTMLButtonElement = document.createElement("button");


            btnPrev.classList.add("btn");
            btnPrev.classList.add("btn-default");
            btnPrev.classList.add("btn-xs");

            btnNext.classList.add("btn");
            btnNext.classList.add("btn-default");
            btnNext.classList.add("btn-xs");


            btnPrev.innerHTML = '<i class="fa fa-chevron-left"></i>';
            btnPrev.onclick = (ev: MouseEvent) => {
                selectPrevious();
            }
            hdrNavPrev.appendChild(btnPrev);

            btnNext.innerHTML = '<i class="fa fa-chevron-right"></i>';
            btnNext.onclick = (ev: MouseEvent) => {
                selectNext();
            }
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
                var row: HTMLDivElement = document.createElement("div");

                row.classList.add("datepicker-mo-yr-row");

                var calItemRow: CalendarItem[] = this.CreateCalendarRow("dp-mo-yr-item", 3);

                for (var i = 0; i < calItemRow.length; i++) {
                    calItemRow[i].Element.onclick = (ev: MouseEvent) => {
                        //this.SelectYear(parseInt(calItemRow[i].Element.textContent));
                    }
                    row.appendChild(calItemRow[i].Element);
                }

                container.appendChild(row);
                calendar.Rows.push(calItemRow);

            }



            return calendar;

        }

        CreateMonthPicker(changeView: () => void, currentYear: number): HTMLDivElement {
            var container: HTMLDivElement = document.createElement("div");

            container.classList.add("datepicker-mnth-yr-container");


            /******************************************************************************************
             *  Create Header Row
             ******************************************************************************************/
            var hdrRow: HTMLDivElement = document.createElement("div");

            hdrRow.classList.add("datepicker-row");
            hdrRow.classList.add("datepicker-colhdr-row");

            var hdrNavPrev: HTMLDivElement = document.createElement("div");
            var hdrContent: HTMLDivElement = document.createElement("div");
            var hdrNavNext: HTMLDivElement = document.createElement("div");

            hdrNavPrev.classList.add("datepicker-nav-item");
            hdrContent.classList.add("datepicker-mo-yr-item");
            hdrNavNext.classList.add("datepicker-nav-item");

            var btnPrev: HTMLButtonElement = document.createElement("button");
            var btnNext: HTMLButtonElement = document.createElement("button");


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

            hdrContent.onclick = (ev: MouseEvent) => {
                changeView();
            }

            btnNext.innerHTML = '<i class="fa fa-chevron-right"></i>';
            hdrNavNext.appendChild(btnNext);

            hdrRow.appendChild(hdrNavPrev);
            hdrRow.appendChild(hdrContent);
            hdrRow.appendChild(hdrNavNext);

            container.appendChild(hdrRow);


            /******************************************************************************************
             *  Row One -   Jan   |   Feb   |   Mar
             ******************************************************************************************/
            var rowOne: HTMLDivElement = document.createElement("div");

            rowOne.classList.add("datepicker-mo-yr-row");

            var jan: HTMLDivElement = document.createElement("div");
            var feb: HTMLDivElement = document.createElement("div");
            var mar: HTMLDivElement = document.createElement("div");

            jan.classList.add("dp-mo-yr-item");
            jan.textContent = "Jan";
            jan.onclick = (ev: MouseEvent) => {
                //this.SelectMonth(1);
            }

            feb.classList.add("dp-mo-yr-item");
            feb.textContent = "Feb";
            feb.onclick = (ev: MouseEvent) => {
                //this.SelectMonth(2);
            }

            mar.classList.add("dp-mo-yr-item");
            mar.textContent = "Mar";
            mar.onclick = (ev: MouseEvent) => {
                //this.SelectMonth(3);
            }

            rowOne.appendChild(jan);
            rowOne.appendChild(feb);
            rowOne.appendChild(mar);

            container.appendChild(rowOne);


            /******************************************************************************************
             *  Row Two -   Apr   |   May   |   Jun
             ******************************************************************************************/
            var rowTwo: HTMLDivElement = document.createElement("div");

            rowTwo.classList.add("datepicker-mo-yr-row");

            var apr: HTMLDivElement = document.createElement("div");
            var may: HTMLDivElement = document.createElement("div");
            var jun: HTMLDivElement = document.createElement("div");

            apr.classList.add("dp-mo-yr-item");
            apr.textContent = "Apr";
            apr.onclick = (ev: MouseEvent) => {
                //this.SelectMonth(4);
            }

            may.classList.add("dp-mo-yr-item");
            may.textContent = "May";
            may.onclick = (ev: MouseEvent) => {
                //this.SelectMonth(5);
            }

            jun.classList.add("dp-mo-yr-item");
            jun.textContent = "Jun";
            jun.onclick = (ev: MouseEvent) => {
                //this.SelectMonth(6);
            }

            rowTwo.appendChild(apr);
            rowTwo.appendChild(may);
            rowTwo.appendChild(jun);

            container.appendChild(rowTwo);

            /******************************************************************************************
             *  Row Three -   Jul   |   Aug   |   Sep
             ******************************************************************************************/
            var rowThree: HTMLDivElement = document.createElement("div");

            rowThree.classList.add("datepicker-mo-yr-row");

            var jul: HTMLDivElement = document.createElement("div");
            var aug: HTMLDivElement = document.createElement("div");
            var sep: HTMLDivElement = document.createElement("div");

            jul.classList.add("dp-mo-yr-item");
            jul.textContent = "Jul";
            jul.onclick = (ev: MouseEvent) => {
                //this.SelectMonth(7);
            }

            aug.classList.add("dp-mo-yr-item");
            aug.textContent = "Aug";
            aug.onclick = (ev: MouseEvent) => {
                //this.SelectMonth(8);
            }

            sep.classList.add("dp-mo-yr-item");
            sep.textContent = "Sep";
            sep.onclick = (ev: MouseEvent) => {
                //this.SelectMonth(9);
            }

            rowThree.appendChild(jul);
            rowThree.appendChild(aug);
            rowThree.appendChild(sep);

            container.appendChild(rowThree);

            /******************************************************************************************
             *  Row Four -   Oct   |   Nov   |   Dec
             ******************************************************************************************/
            var rowFour: HTMLDivElement = document.createElement("div");

            rowFour.classList.add("datepicker-mo-yr-row");

            var oct: HTMLDivElement = document.createElement("div");
            var nov: HTMLDivElement = document.createElement("div");
            var dec: HTMLDivElement = document.createElement("div");

            oct.classList.add("dp-mo-yr-item");
            oct.textContent = "Oct";
            oct.onclick = (ev: MouseEvent) => {
                //this.SelectMonth(10);
            }

            nov.classList.add("dp-mo-yr-item");
            nov.textContent = "Nov";
            nov.onclick = (ev: MouseEvent) => {
                //this.SelectMonth(11);
            }

            dec.classList.add("dp-mo-yr-item");
            dec.textContent = "Dec";
            dec.onclick = (ev: MouseEvent) => {
                //this.SelectMonth(12);
            }

            rowFour.appendChild(oct);
            rowFour.appendChild(nov);
            rowFour.appendChild(dec);

            container.appendChild(rowFour);


            return container;

        }

        CreateCalendarRow(itemClass: string, totalItems: number): CalendarItem[] {
            var calRow: CalendarItem[] = new Array<CalendarItem>();

            for (var i = 0; i < totalItems; i++) {
                var div: HTMLDivElement = document.createElement("div");

                div.classList.add(itemClass);
                calRow.push(new CalendarItem(div, ""));

            }

            return calRow;

        }

    }

    export class CalendarItemCollection {
        Control: HTMLDivElement;
        HeaderRow: CalendarItem[];
        Rows: CalendarItem[][];

        constructor(control: HTMLDivElement) {
            var that = this;

            that.Control = control;
            that.HeaderRow = new Array<CalendarItem>();
            that.Rows = new Array<CalendarItem[]>();

        }

    }

    export class CalendarItem {
        Element: HTMLElement;
        Text: string;

        constructor(element: HTMLElement, text: string) {
            var that = this;

            that.Element = element;
            that.Text = text;

        }

    }

    class YearMatrix {
        MinYear: number;
        MaxYear: number;
        Rows: YearRow[];

        constructor(minYear: number, maxYear: number) {
            var that = this;

            that.MinYear = minYear;
            that.MaxYear = maxYear;
            that.Rows = new Array<YearRow>();

        }

        static GetYears(yr: number): YearMatrix {
            var startYear: number = ((yr - 4) < 1900 ? 1900 : (yr - 4));
            var endYear: number = 0;

            if ((yr + 7) > 2099) {
                endYear = 2099;
                startYear = endYear - 11;
            }
            else {
                endYear = yr + 7;
            }

            var years: YearMatrix = new YearMatrix(startYear, endYear);

            for (var r = 0; r < 4; r++) {
                var rowYear: YearRow = new YearRow();

                for (var y = (startYear + (3 * r)); y < ((startYear + (3 * r)) + 3); y++) {
                    years.MinYear = (y < startYear ? y : startYear);
                    years.MaxYear = (y > endYear ? y : endYear);

                    var yearItem: YearItem = new YearItem(y);

                    rowYear.Years.push(yearItem);
                    rowYear.TableRow.appendChild(yearItem.TableCell);

                }

                years.Rows.push(rowYear);

            }

            return years;

        }

    }

    class YearRow extends BaseControl {
        Years: YearItem[];

        TableRow: HTMLTableRowElement;

        constructor() {
            super();

            var that = this;

            that.Years = new Array<YearItem>();
            that.TableRow = document.createElement("tr");
            
        }

    }

    class YearItem extends BaseControl {
        Year: number;

        TableCell: HTMLTableCellElement;

        constructor(year: number) {
            super();

            var that = this;

            that.Year = year;
            that.TableCell = document.createElement("td");

            that.AddClasses(that.TableCell, ["cal-month"]);

        }

    }

    class CalendarMatrix {
        MonthNumber: number;
        MonthName: string;
        MonthAbbrev: string;
        Year: number;
        Weeks: Week[];

        constructor(monthNumber: number, monthName: string, monthAbbrev: string, year: number) {
            var that = this;

            that.MonthNumber = monthNumber;
            that.MonthName = monthName;
            that.MonthAbbrev = monthAbbrev;
            that.Year = year;
            that.Weeks = new Array<Week>();

        }

        static GetCalendar(date: Date): CalendarMatrix {
            var sdate: string = (date.getMonth() + 1) + '/1/' + date.getFullYear();
            var parts: KrodzoneDate = new KrodzoneDate(new Date(sdate));
            var moSmall = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            var moLrg = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

            var calendar: CalendarMatrix = new CalendarMatrix(parts.Month, moLrg[parts.Month - 1], moSmall[parts.Month - 1], parts.Year);

            var daysInWeek: number = 7 - parts.DOW;
            var startDay: number = daysInWeek - 7;
            var weeks: Week[] = new Array<Week>();
            var currentDaysInMonth: number = KrodzoneDate.daysInMonth(parts.CurrentDate);
            var prevDaysInMonth: number = KrodzoneDate.daysInMonth(KrodzoneDate.dateAdd("MONTH", -1, parts.CurrentDate));

            for (var wk = 0; wk < 6; wk++) {
                var week: Week = new Week(wk + 1);

                for (var day = startDay; day < (startDay + 7); day++) {
                    var mo = (day < 0 ? (parts.Month == 1 ? 12 : parts.Month - 1) : parts.Month);
                    var dy = ((parts.Day + (day)) <= 0 ? prevDaysInMonth + (parts.Day + (day)) : (parts.Day + (day)));
                    var yr = (day < 0 ? (parts.Month == 1 ? parts.Year - 1 : parts.Year) : parts.Year);

                    sdate = (mo != calendar.MonthNumber ? mo : (dy > currentDaysInMonth ? (mo == 12 ? 1 : mo + 1) : mo)) + '/' + (mo == calendar.MonthNumber ? (dy > currentDaysInMonth ? dy - currentDaysInMonth : dy) : dy) + '/' + (mo != calendar.MonthNumber ? yr : (dy > currentDaysInMonth ? (mo == 12 ? yr + 1 : yr) : yr));

                    var weekDay = new KrodzoneDate(new Date(sdate));
                    var calendarDay: Day = new Day(weekDay.Day, daysOfWeek[weekDay.DOW], weekDay.CurrentDate, (weekDay.Month == parts.Month), KrodzoneDate.dateDiff("DAY", date, weekDay.CurrentDate) === 0);

                    week.AddDay(calendarDay);

                }

                weeks.push(week);
                startDay += 7;

            }

            calendar.Weeks = weeks;


            return calendar;

        }

    }

    class Week extends BaseControl {
        WeekNumber: number;
        Days: Day[];

        TableRow: HTMLTableRowElement;

        AddDay: (day: Day) => void;

        constructor(weekNumber: number) {
            super();

            var that = this;

            that.WeekNumber = weekNumber;
            that.Days = new Array<Day>();
            that.TableRow = document.createElement("tr");

            that.AddClasses(that.TableRow, ["cal-date"]);

            that.AddDay = (day: Day): void => {
                that.Days.push(day);
                that.TableRow.appendChild(day.TableCell);
            }
            
        }

    }

    class Day extends BaseControl {

        private _onDateSelected: EventDispatcher<Day, EventArgs<Day>> = new EventDispatcher<Day, EventArgs<Day>>();
        get onDateSelected(): IEvent<Day, EventArgs<Day>> {
            return this._onDateSelected;
        }

        Number: number;
        Name: string;
        Date: Date;
        CurrentMonth: boolean;

        TableCell: HTMLTableCellElement;

        constructor(num: number, name: string, date: Date, currentMonth: boolean, currentDate: boolean) {
            super();

            var that = this;

            that.Number = num;
            that.Name = name;
            that.Date = date;
            that.CurrentMonth = currentMonth;

            that.TableCell = document.createElement("td");

            var classes: string[] = new Array<string>();

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

            $$(that.TableCell).on("click", (ev: UIEvent): void => {
                var event = document.createEvent("CustomEvent");

                event.initCustomEvent("dateselected", true, true, new EventArgs<Day>(that.TableCell, that));
                event["data"] = event.detail;

                that.TableCell.dispatchEvent(event);
                
            });

        }

    }

}

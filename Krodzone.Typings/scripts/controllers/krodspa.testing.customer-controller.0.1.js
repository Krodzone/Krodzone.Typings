/// <reference path="../jquery-2.1.4.js" />
/// <reference path="../typings/krodzone/KrodSpa.js" />



var app = KrodSpa.Application.Get("KrodSpaTest");


/*****************************************************************************************************************************************************************************
 * 
 *  Controller: CustomerController
 *  View:       /partials/views/customers.html
 *  Author:     Brian Brown
 *  Purpose:    Provides functionality to maintain customer records
 * 
 *  Change Log:
 * 
 *  Date            Developer               Function                            Description of Change
 *  ----------      -----------------       ------------------------------      ---------------------------------------------------------------------------------------------
 *  
 *****************************************************************************************************************************************************************************/
app.Controller("CustomerController", function ($scope, $webQuery) {


    /************************************************************************************************************************************
     * 
     *  VARIABLE DECLARATIONS & SCOPE INITIALIZATION METHODS
     * 
     ************************************************************************************************************************************/
    $scope.BaseURL = { API: window.location.getAbsolutePath() + "api/", Web: window.location.getAbsolutePath(), Token: "" };

    $scope.SystemUser = JSON.parse(sessionStorage.getItem("SystemUser"));

    $scope.Customers = [];
    $scope.SelectedCustomer;
    $scope.CustomerID = 103;



    $scope.Init = function () {

        if (sessionStorage.getItem("Customers")) {
            $scope.Customers = JSON.parse(sessionStorage.getItem("Customers"));
            return;
        }

        $webQuery.load($scope.BaseURL.Web + "data/Customers.json").then(function (results) {
            $scope.Customers = (typeof results === "object" ? results : (typeof results === "string" ? JSON.parse(results) : undefined));

            var custData = { Customer: undefined, ProjectID: 203 };
            var totalCustomers = getRandomInt(1, 20);

            for (var i = 1; i <= totalCustomers; i++) {
                custData = getCustomer($scope.CustomerID, custData.ProjectID);
                $scope.Customers.push(custData.Customer);
                $scope.CustomerID++;
            }

            sessionStorage.setItem("Customers", JSON.stringify($scope.Customers));

        }).catch(function (error) {
            $scope.Customers = [];
        });

    };

    $scope.ToggleExpandablePanel = function (toggle, body) {

        if (toggle !== undefined && body !== undefined) {

            $(body).toggle();

            if ($(body).is(':visible')) {

                if ($(toggle).hasClass("fa-caret-down")) {
                    $(toggle).removeClass("fa-caret-down");
                    $(toggle).addClass("fa-caret-up");
                }

            }
            else {

                if ($(toggle).hasClass("fa-caret-up")) {
                    $(toggle).removeClass("fa-caret-up");
                    $(toggle).addClass("fa-caret-down");
                }

            }

        }

    };



    /************************************************************************************************************************************
     * 
     *  ADD, EDIT, & REMOVE CUSTOMERS
     * 
     ************************************************************************************************************************************/
    $scope.AddCustomer = function () {
        var editor = "partials/dialogs/customer-editor.html";

        $scope.SelectedCustomer = {
            CustomerID: $scope.CustomerID,
            ParentID: 0,
            Name: "",
            Contact: "",
            Phone: "",
            StatusID: 0,
            Status: "",
            Projects: []
        };


        $webQuery.load($scope.BaseURL.Web + editor).then(function (results) {
            var div = document.createElement("div");

            $(div).html(results);

            $(div).find("#customerStatusID").on("change", function (ev) {

                setTimeout(function () {
                    var statuses = ["", "Active", "Inactive", "Suspended"];

                    if ($scope.SelectedCustomer) {
                        $scope.SelectedCustomer.Status = statuses[$scope.SelectedCustomer.StatusID];
                    }

                }, 500);

            });

            //  Hide Expandable Panel
            $(div).find("#customerProjectPanel").hide();


            $scope.ShowModal(div,
                new KrodSpa.Views.ModalWindowArgs($scope, "modal-550",
                    "Customer Editor",
                    "Adding New Customer",
                    '<i class="fa fa-floppy-o"></i>&nbsp;&nbsp;Save',
                    '<i class="fa fa-ban"></i>&nbsp;&nbsp;Cancel',
                    true,
                    true,
                    function (callback) {
                        $scope.CustomerID++;
                        $scope.SelectedCustomer.CustomerID = $scope.CustomerID;
                        $scope.Customers.push($scope.SelectedCustomer);
                        sessionStorage.setItem("Customers", JSON.stringify($scope.Customers));
                        callback(true, "Customer Data Successfully Saved!");
                    },
                    function (sender) {
                        //  Do Nothing
                    }));


        }).catch(function (error) {

        });

    };

    $scope.EditCustomer = function (cust, params) {
        var editor = "partials/dialogs/customer-editor.html";

        if (params && params.CustomerID) {
            var index = -1;

            for (var i = 0; i < $scope.Customers.length; i++) {
                if ($scope.Customers[i].CustomerID === params.CustomerID) {
                    $scope.SelectedCustomer = $scope.Customers[i];
                    break;
                }
            }

        }
        

        $webQuery.load($scope.BaseURL.Web + editor).then(function (results) {
            var div = document.createElement("div");

            $(div).html(results);

            $(div).find("#customerStatusID").on("change", function (ev) {
                
                setTimeout(function () {
                    var statuses = ["", "Active", "Inactive", "Suspended"];

                    if ($scope.SelectedCustomer) {
                        $scope.SelectedCustomer.Status = statuses[$scope.SelectedCustomer.StatusID];
                    }

                }, 500);

            });

            //  Toggle Expandable Panels
            $(div).find(".header").on("click", function (e) {
                var toggle = $(e.currentTarget).find("span");
                var parent = (e.currentTarget !== undefined ? e.currentTarget.parentElement : undefined);
                var body = $(parent).find(".body");

                $scope.ToggleExpandablePanel(toggle, body)

            });


            $scope.ShowModal(div,
                new KrodSpa.Views.ModalWindowArgs($scope, "modal-550",
                    "Customer Editor",
                    "Editing Customer (" + cust.Name + ")",
                    '<i class="fa fa-floppy-o"></i>&nbsp;&nbsp;Save',
                    '<i class="fa fa-ban"></i>&nbsp;&nbsp;Cancel',
                    true,
                    true,
                    function (callback) {
                        callback(true, "Customer Data Successfully Saved!");
                    },
                    function (sender) {
                        //  Do Nothing
                    }));


        }).catch(function (error) {

        });

    };

    $scope.RemoveCustomer = function (cust, params) {

        if (params && params.CustomerID) {
            
            $scope.ShowMessageBox(
                "Are you sure you want to remove customer <strong>" + cust.Name + "</strong>?",
                "Remove Customer Record",
                KrodSpa.Views.MessageBoxTypeArgs.Question,
                KrodSpa.Views.MessageBoxButtonArgs.YesNo,
                function (result) {

                    if (result === KrodSpa.Views.MessageBoxResultArgs.Yes) {

                        for (var i = 0; i < $scope.Customers.length; i++) {
                            if ($scope.Customers[i].CustomerID === params.CustomerID) {
                                $scope.Customers.splice(i, 1);
                                break;
                            }
                        }

                    }

                });

        }

    };



    /************************************************************************************************************************************
     * 
     *  DISPLAY CUSTOMER PROJECTS
     * 
     ************************************************************************************************************************************/
    $scope.ShowProjects = function (cust, params) {

        if (cust && params && params.CustomerID) {
            var custData = JSON.stringify(cust);

            sessionStorage.setItem("SelectedCustomer", custData);
            window.location.hash = "#/customers/" + params.CustomerID;
        }

    };



    /************************************************************************************************************************************
     * 
     *  USED BY METHOD INIT TO DYNAMICALLY GENERATE DATA
     * 
     ************************************************************************************************************************************/
    function getCustomer(customerID, projectID) {
        var statuses = ["", "Active", "Inactive", "Suspended", "Prospect"];
        var companyFirstNames = ["ACME", "Dispatch", "Billing", "Data Entry", "Report"];
        var companyLastNames = ["Builders", "Construction", "Transportation", "Grocery", "Clothing", "Law Group"];
        var contactFirstNames = ["Bill", "Bob", "Amber", "Jennifer", "Jason", "Carly", "Strom", "Ronald", "David", "Heather"];
        var contactLastNames = ["Green", "Donaldson", "Jefferson", "Madison", "Reagan", "Nugent", "Landry"];
        var company = companyFirstNames[getRandomInt(0, companyFirstNames.length - 1)] + " " + companyLastNames[getRandomInt(0, companyLastNames.length - 1)];
        var contact = contactFirstNames[getRandomInt(0, contactFirstNames.length - 1)] + " " + contactLastNames[getRandomInt(0, contactLastNames.length - 1)];
        var statusID = getRandomInt(1, statuses.length - 1);
        var phone = getRandomInt(100, 999) + "-" + getRandomInt(100, 999) + "-" + getRandomInt(1000, 9999);
        var customer = {
            CustomerID: customerID,
            ParentID: 0,
            Name: company,
            Contact: contact,
            Phone: phone,
            StatusID: statusID,
            Status: statuses[statusID],
            Projects: []
        };

        var totalProjects = getRandomInt(1, 25);

        for (var i = 1; i <= totalProjects; i++) {
            customer.Projects.push(getProject(customerID, projectID));
            projectID++;
        }

        return { Customer: customer, ProjectID: projectID };

    }

    function getProject(customerID, projectID) {
        var statuses = ["Requirements", "Open - Not Started", "Active", "On Hold"];
        var projectFirstNames = ["Excel", "Dispatch", "Billing", "Data Entry", "Report"];
        var projectLastNames = ["Automator", "Creator", "Portal"];
        var projectNotes = ["Lorem ipsum dolor sit amet, consectetur adipiscing elit.", "Integer nec odio.", "Praesent libero.", "Sed cursus ante dapibus diam.", "Sed nisi.", "Nulla quis sem at nibh elementum imperdiet.", "Duis sagittis ipsum."];
        var projectName = projectFirstNames[getRandomInt(0, 4)] + " " + projectLastNames[getRandomInt(0, 2)];
        var estHrs = getRandomInt(40, 1000);
        var cmpHrs = getRandomInt(0, estHrs);
        var remHrs = estHrs - cmpHrs;

        return {
            ProjectID: projectID,
            CustomerID: customerID,
            Name: projectName,
            EstimatedHours: estHrs,
            CompletedHours: cmpHrs,
            RemainingHours: remHrs,
            Status: remHrs === 0 ? "Completed" : statuses[getRandomInt(0, 3)],
            Notes: projectNotes[getRandomInt(0, 6)]
        };

    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    $scope.Init();


});

/// <reference path="../jquery-2.1.4.js" />
/// <reference path="../typings/krodzone/KrodSpa.js" />



var app = KrodSpa.Application.Get("KrodSpaTest");


/*****************************************************************************************************************************************************************************
 * 
 *  Controller: ProjectsController
 *  View:       /partials/views/projects.html
 *  Author:     Brian Brown
 *  Purpose:    Provides functionality to maintain customer projects
 * 
 *  Change Log:
 * 
 *  Date            Developer               Function                            Description of Change
 *  ----------      -----------------       ------------------------------      ---------------------------------------------------------------------------------------------
 *  
 *****************************************************************************************************************************************************************************/
app.Controller("ProjectsController", function ($scope, $webQuery) {


    /************************************************************************************************************************************
     * 
     *  VARIABLE DECLARATIONS & SCOPE INITIALIZATION METHODS
     * 
     ************************************************************************************************************************************/
    $scope.BaseURL = { API: window.location.getAbsolutePath() + "api/", Web: window.location.getAbsolutePath(), Token: "" };

    $scope.SystemUser = JSON.parse(sessionStorage.getItem("SystemUser"));
    $scope.SelectedCustomer = JSON.parse(sessionStorage.getItem("SelectedCustomer"));
    $scope.SelectedProject;

    $scope.ProjectID = 5000;

    $scope.Init = function () {

        if (!$scope.SelectedCustomer) {
            var custData = sessionStorage.getItem("SelectedCustomer");
            window.location.hash = "#/customers";
        }

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
     *  ADD, EDIT, & REMOVE PROJECTS
     * 
     ************************************************************************************************************************************/
    $scope.AddProject = function () {
        var editor = "partials/dialogs/project-editor.html";

        $scope.SelectedProject = {
            ProjectID: $scope.ProjectID,
            CustomerID: $scope.SelectedCustomer.CustomerID,
            Name: "",
            EstimatedHours: 0,
            CompletedHours: 0,
            RemainingHours: 0,
            Status: "",
            Notes: ""
        };


        $webQuery.load($scope.BaseURL.Web + editor).then(function (results) {
            var div = document.createElement("div");

            $(div).html(results);


            $scope.ShowModal(div,
                new KrodSpa.Views.ModalWindowArgs($scope, "modal-550",
                    "Project Editor",
                    "Adding New Project",
                    '<i class="fa fa-floppy-o"></i>&nbsp;&nbsp;Save',
                    '<i class="fa fa-ban"></i>&nbsp;&nbsp;Cancel',
                    true,
                    true,
                    function (callback) {
                        $scope.ProjectID++;
                        $scope.SelectedProject.ProjectID = $scope.ProjectID;
                        $scope.SelectedCustomer.Projects.push($scope.SelectedProject);
                        callback(true, "Project Data Successfully Saved!");
                    },
                    function (sender) {
                        //  Do Nothing
                    }));


        }).catch(function (error) {

        });

    };

    $scope.EditProject = function (proj, params) {
        var editor = "partials/dialogs/project-editor.html";

        if (params && params.ProjectID) {
            var index = -1;

            for (var i = 0; i < $scope.SelectedCustomer.Projects.length; i++) {
                if ($scope.SelectedCustomer.Projects[i].ProjectID === params.ProjectID) {
                    $scope.SelectedProject = $scope.SelectedCustomer.Projects[i];
                    break;
                }
            }

        }


        $webQuery.load($scope.BaseURL.Web + editor).then(function (results) {
            var div = document.createElement("div");

            $(div).html(results);


            $scope.ShowModal(div,
                new KrodSpa.Views.ModalWindowArgs($scope, "modal-550",
                    "Project Editor",
                    "Editing Project (" + proj.Name + ")",
                    '<i class="fa fa-floppy-o"></i>&nbsp;&nbsp;Save',
                    '<i class="fa fa-ban"></i>&nbsp;&nbsp;Cancel',
                    true,
                    true,
                    function (callback) {
                        callback(true, "Project Data Successfully Saved!");
                    },
                    function (sender) {
                        //  Do Nothing
                    }));


        }).catch(function (error) {

        });

    };

    $scope.RemoveProject = function (proj, params) {

        if (params && params.ProjectID) {

            $scope.ShowMessageBox(
                "Are you sure you want to remove project <strong>" + proj.Name + "</strong>?",
                "Remove Project",
                KrodSpa.Views.MessageBoxTypeArgs.Question,
                KrodSpa.Views.MessageBoxButtonArgs.YesNo,
                function (result) {

                    if (result === KrodSpa.Views.MessageBoxResultArgs.Yes) {

                        for (var i = 0; i < $scope.SelectedCustomer.Projects.length; i++) {
                            if ($scope.SelectedCustomer.Projects[i].ProjectID === params.ProjectID) {
                                $scope.SelectedCustomer.Projects.splice(i, 1);
                                break;
                            }
                        }

                    }

                });

        }

    };


    $scope.Init();

});

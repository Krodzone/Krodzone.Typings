/// <reference path="jquery-2.1.4.js" />
/// <reference path="typings/krodzone/KrodSpa.js" />


/*****************************************************************************************************************************************************************************
 * 
 *  Author:     Brian Brown
 *  Purpose:    Create the application and configure Controller/View routing
 * 
 *  Change Log:
 * 
 *  Date            Developer               Function                            Description of Change
 *  ----------      -----------------       ------------------------------      ---------------------------------------------------------------------------------------------
 *  
 *****************************************************************************************************************************************************************************/
var app = KrodSpa.Application.Create("KrodSpaTest")
    .Config([
        {
            Hash: "/",
            Template: "partials/views/login.html",
            //  File:   /scripts/controllers/krodspa.testing.login-controller.0.1.js
            Controller: "LoginController"
        },
        {
            Hash: "/customers",
            Template: "partials/views/customers.html",
            //  File:   /scripts/controllers/krodspa.testing.customer-controller.0.1.js
            Controller: "CustomerController"
        },
        {
            Hash: "/customers/{id}",
            Template: "partials/views/projects.html",
            //  File:   /scripts/controllers/krodspa.testing.projects-controller.0.1.js
            Controller: "ProjectsController"
        }
    ])
    .Default("/");




/*****************************************************************************************************************************************************************************
 * 
 *  Controller: MainController
 *  Page:       /index.html
 *  Author:     Brian Brown
 *  Purpose:    Provides all functionality for the Main Page
 * 
 *  Change Log:
 * 
 *  Date            Developer               Function                            Description of Change
 *  ----------      -----------------       ------------------------------      ---------------------------------------------------------------------------------------------
 *  
 *  
 *****************************************************************************************************************************************************************************/
app.Controller("MainController", function ($scope, $webQuery) {


    /************************************************************************************************************************************
     * 
     *  VARIABLE DECLARATIONS & SCOPE INITIALIZATION METHOD
     * 
     ************************************************************************************************************************************/
    $scope.SystemUser = new Object();
    $scope.IntervalID = 0;

    $(".nav-controls").hide();

    $scope.Init = function () {
        $scope.IntervalID = setInterval(function () {
            $scope.SystemUser = JSON.parse(sessionStorage.getItem("SystemUser"));

            if ($scope.SystemUser && $scope.SystemUser.FullName) {
                clearInterval($scope.IntervalID);
                $(".nav-controls").show();
                window.location.hash = "#/customers";
                return;
            }
            else {
                if (window.location.hash !== "#/") {
                    window.location.hash = "#/";
                }
            }

        }, 500);

    };



    /************************************************************************************************************************************
     * 
     *  HANDLE LOGOUT
     * 
     ************************************************************************************************************************************/
    $scope.Logout = function () {
        $scope.SystemUser = undefined;
        sessionStorage.removeItem("SystemUser");
        sessionStorage.removeItem("Customers");
        sessionStorage.removeItem("SelectedCustomer");
        $(".nav-controls").hide();
        window.location.hash = "#/";
        $scope.Init();
    };

    $scope.Init();

});

/// <reference path="../jquery-2.1.4.js" />
/// <reference path="../typings/krodzone/KrodSpa.js" />



var app = KrodSpa.Application.Get("KrodSpaTest");


/*****************************************************************************************************************************************************************************
 * 
 *  Controller: LoginController
 *  View:       /partials/views/login.html
 *  Author:     Brian Brown
 *  Purpose:    Provides functionality to login
 * 
 *  Change Log:
 * 
 *  Date            Developer               Function                            Description of Change
 *  ----------      -----------------       ------------------------------      ---------------------------------------------------------------------------------------------
 *  
 *****************************************************************************************************************************************************************************/
app.Controller("LoginController", function ($scope, $webQuery) {
    $scope.BaseURL = { API: window.location.getAbsolutePath() + "api/", Web: window.location.getAbsolutePath(), Token: "" };

    $scope.UserCredentials = { Email: "", Password: "" };

    $scope.Users = [];
    

    $scope.Init = function () {

        $webQuery.load($scope.BaseURL.Web + "data/SystemUser.json").then(function (results) {
            $scope.Users = (typeof results === "object" ? results : (typeof results === "string" ? JSON.parse(results) : undefined));
        }).catch(function (error) {
            $scope.Users = [];
        });

    };

    $scope.Login = function () {

        if ($scope.Users && $scope.Users.length) {
            for (var i = 0; i < $scope.Users.length; i++) {
                if (removeEscapeChars($scope.UserCredentials.Email) === $scope.Users[i].Email && removeEscapeChars($scope.UserCredentials.Password) === $scope.Users[i].Password) {
                    sessionStorage.setItem("SystemUser", JSON.stringify($scope.Users[i]));
                    return;
                }
            }
        }
        
    };

    $scope.Init();

});

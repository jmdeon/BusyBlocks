app.controller('SaveGroupEventController', function($scope, $modalInstance){
    $scope.save = function(){
        $modalInstance.close();
    };
	$scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});
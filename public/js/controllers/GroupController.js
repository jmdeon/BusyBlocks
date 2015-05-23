/*
 * FileName: GroupController.js
 * Authors: Joe d'Eon (if you edit this file, add your name to this list)
 * Description: This controller will be used to control the view of a single
 *              group. It will have all attributes and behaviors of a single
 *              group. It will be able to access the database to get said
 *              attributes of a group.
 *
 * Attributes: name     - The name of the group.
 *             currentGroupID     - unique ID of the group
 *             membersList - a list of members with the group leader in 
 *                           position zero. Each element will be a user email.
 *             groupColor - the color of this group, gotten from service
 *
 *             
 *
 * Behaviors: createMeeting() - anyone will be able to create a meeting
 *            freeTime()      - this will be our main algorithm to get the 
 *                              available free time for our group. This will be
 *                              delegated to a function outside of controller.
 *            deleteGroup()   - delete this group
 *            addMembers()    - add members to the group (only group leader)
 *          
 * 
 */

var currentUser = Parse.User.current();

app.controller('GroupController', ['$scope','groupService', '$timeout', 'uiCalendarConfig','$log', '$modal', 
    function($scope, groupService, $timeout, uiCalendarConfig, $log, $modal) { 


    /* DEFAULT COLORS */
      var freeTimeColor = 'green';
      var busyTimeColor = 'black';
    /* Event Id's */
      var freeId = 999;
      var busyId = 1000;


 
      /* Initialize event sources to be an array */
  $scope.eventSources = [
  ];


  /* Color Blind color mode */
  $scope.colorBlindMode = function(){
      freeTimeColor = 'blue';
      busyTimeColor = 'red';
  }

  /* Default Calendar color mode */
  $scope.defaultColorMode = function(){
      freeTimeColor = 'green';
      busyTimeColor = 'pink';
  }
    
  $scope.animationsEnabled = true;    
  /************************************************************************
   * Name:        addMemberModal

   * Purpose:     To create a modal for the user to add a new member to a group.

   * Called In:   index.html

   * Description: Creates a modal for the user to enter new member information
   *              into, so as to add a new member to the group. This function
   *              is in charge of updating the view with the new members
   *              schedule and the new members name.
   ************************************************************************/
  $scope.addMemberModal = function (size) {
    var modalInstance = $modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'addMember.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });
    modalInstance.result.then(function (selectedItem) {
    $scope.selected = selectedItem;
    }, function () {
        $log.info('Modal dismissed at: ' + new Date());
        /* update view after modal is dismissed by addMember() */
        $scope.memberList = groupService.getMemberList();
        var tempSched = groupService.getNewMember().personalSchedule;
        var tempSchedBlack = JSON.parse(JSON.stringify(groupService.getNewMember().personalSchedule));
        for(index = 0; index < tempSched.length; index++){
          tempSched[index].rendering = "inverse-background";
          tempSched[index]._id = freeId;
          tempSched[index].__id = freeId;
          tempSched[index].color = freeTimeColor;

          tempSchedBlack[index].rendering = "background";
          tempSchedBlack[index]._id = busyId;
          tempSchedBlack[index].__id = busyId;
          tempSchedBlack[index].color = busyTimeColor;
        }
        var combinedSched = tempSched.concat(tempSchedBlack);
        $scope.eventSources.push(combinedSched);
    });
  };


         


  /* Group Calendar Settings */
  /* ----------------------- */
  $scope.uiConfig = {
      calendar:{
          height: 795,
          viewRender: function(view, element) {
              //$log.debug("View Changed: ", view.visStart, view.visEnd, view.start, view.end);
          },
  		defaultView: 'agendaWeek',
      slotDuration: '01:00:00',
      minTime: '06:00:00',
      maxTime: '22:00:00',
      dayClick: function(date, jsEvent, view) {
        console.log("Clicked on " + date.format());
      }
      }
  };

  /* END Group Calendar Settings */
  /* --------------------------- */

  //TODO convert to service call
  /* Watch to see if single group view is set to true, if it is, pull down group id*/
  $scope.$watch('singleGroupView', function(){
    if($scope.singleGroupView === false){
      /* clear current group data */
      $scope.groupName = '';
      $scope.eventSources.length = 0;
    }
    if($scope.singleGroupView === true){
      /* get the groupId from service */
      $scope.currentGroupId = groupService.getGroupId();
      $scope.groupColor = groupService.getGroupColor();

      var Group = Parse.Object.extend("Group");
      var query = new Parse.Query(Group);
      query.equalTo("objectId", $scope.currentGroupId);
      query.find({
        success: function(group){
          $scope.groupName = group[0]._serverData.name;
          $scope.memberList = group[0]._serverData.memberList;
          $scope.$apply();


          /* set group calendar to weekly view! */
          var User = Parse.Object.extend("User");
          var query = new Parse.Query(User);
          for(i= 0; i< $scope.memberList.length; i++){

            query.equalTo("username", $scope.memberList[i].email);
            query.find({
              success: function(member){
                var tempSched = member[0]._serverData.personalSchedule;
                var tempSchedBlack = JSON.parse(JSON.stringify(member[0]._serverData.personalSchedule));

                for (index = 0; index < tempSched.length; index++){
                    tempSched[index].rendering = "inverse-background";
                    tempSched[index]._id = freeId;
                    tempSched[index].__id = freeId;
                    tempSched[index].color = freeTimeColor;

                    tempSchedBlack[index].rendering = "background";
                    tempSchedBlack[index]._id = busyId;
                    tempSchedBlack[index].__id = busyId;
                    tempSchedBlack[index].color = busyTimeColor;
                }
                var combinedArray = tempSched.concat(tempSchedBlack);
                if(combinedArray.length !== 0){
                  $scope.eventSources.push(combinedArray);
                }
                $scope.$apply();
              },
              error: function(member, error){
                console.log("MEMBER SCHEDULE UPDATE ERROR");
              }


            });
          }
          console.log($scope.eventSources);
        },
          error: function(group, error){
            console.log("getting group by object id failed");
          }
      });


    }
  });


  /************************************************************************
   * Name:    addMember()

   * Purpose: Add members to group.

   * Called In:   index.html

   * Description: This function queries the database to get the group's memberlist
   *				then updates it with the new member. Once that is done, it 
   *				queries the database to get the groupList associated with the
   *				new member and adds the new group to their list.
   ************************************************************************/
  $scope.addMember = function(){
    groupService.addMember($scope.currentGroupId, $scope.newMemberEmail).then(function(){
      $scope.cancel(); // close the modal, which is in charge of updating view
    })
  };



  /************************************************************************
   * Name:        createEvent()

   * Purpose:     Allows the user to add an event to the group calendar.

   * Called In:   index.html

   * Description: Creates an event on the group calendar. TODO
   ************************************************************************/
  $scope.createEvent = function(){


  }
    }]);

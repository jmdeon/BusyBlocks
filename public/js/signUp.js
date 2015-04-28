/*
 * Filename: signUp.js
 * Primary Author: Saveen
 * Purpose: TODO
 * /




/** Global variables **/
//These are regular expressions (templates) for how the name and the email should look.
var nameRegex = /^[a-z']([a-z'_\s])+$/i, emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

//Anonymous function that gets called once the window loads
window.onload = function() {
  //Link to Parse database - accepts application_ID, JavaScript_Key
  Parse.initialize( "t5hvXf3wJOYnL3MMIffsemMdhLM7f4brACcf0eBa", "UhqQaEDIEQr6cxhO8XS4Fl8BcGU4ir9jL9To7PVO" );

  /********************
    Checks if signed in or not
   ***************/

  if (currentUser) {
    // do stuff with the user
    location.href = '/student';
    setTimeout(function(){alert(currentUser.get("name"));}, 1000);
  } 
  else {
    // show the signup or login page
    location.href = "hipster.parseapp.com";
  }
};




/************************************************************************
 * Name:		dispTab()

 * Purpose:		Changes the UI to display the form requested by the user.

 * Description:	This function changes the background color of the tab
 requested by the user to be white. It also changes the
 background color of the other tab to be grey. Finally,
 it displays the correct form and hides the other tab's 
 form.

 * Called In:   main()
 ************************************************************************/
function dispTab( tabId ) {
  //Declare any necessary variables
  var login = document.getElementById( 'login' ), signup = document.getElementById( 'signup' ),
      sForm = document.getElementById( 'sForm' ), lForm = document.getElementById( 'lForm' );

  //If the user clicked on "Log In" tab
  if ( tabId == 'login' ) {
    //Change the background of "Sign Up" tab gray
    signup.style.background = '#D8D8D8';
    //Change the background of "Log In" tab white
    login.style.background = 'white';
    //Hide the text boxes and buttons for the sign up form
    sForm.style.display = 'none';
    //Display the text boxes and the buttons for the log in form
    lForm.style.display = 'block';
  } else {
    //Change the background of "Log In" tab gray
    login.style.background = '#D8D8D8';
    //Change the background of "Sign Up" tab white
    signup.style.background = 'white';
    //Hide the text boxes and buttons for the log in form
    lForm.style.display = 'none';
    //Display the text boxes and buttons for the sign up form
    sForm.style.display = 'block';
  }
}

/************************************************************************
 * Name:		signup()

 * Purpose:		Allows the user to sign up and get added to the database

 * Description:	This function validates the input of the of the
 text boxes in the signup form. If they are good,
 it calls Parse's signUp function. If the user's
 input is not valid, it updates the tips field
 in the form with the correct error message to
 help the user sign up properly.

 * Called In:   main()
 ************************************************************************/
function signup(){
  //Declare any necessary variables
  var good = true, sName = document.getElementById( 'sName' ), sEmail = document.getElementById( 'sEmail' ), 
      sPass = document.getElementById( 'sPass' ), tips = document.getElementById( 'sTips' );

  //Check if name is within specified length
  good = good && checkLength( sName, 'name', 2, 25, 'sTips' );
  //Check if name uses valid characters
  good = good && valInput( sName, nameRegex, 'name', 'sTips' );

  //If the name is good, change the text box border green
  if ( good ) {
    sName.style.border = '1px solid #c6c6c6';
  }

  //Check if email is within specified length
  good = good && checkLength( sEmail, 'email', 6, 80, 'sTips' );
  //Check if email uses valid characters
  good = good && valInput( sEmail, emailRegex, 'email', 'sTips' );

  //If the email is good, change the text box border green
  if ( good ) {
    sEmail.style.border = '1px solid #c6c6c6';
  }

  //Check if password is within the specified length
  good = good && checkLength( sPass, 'password', 5, 15, 'sTips' );

  //If the password is good, change the text box border green and attempts to add user to database
  if ( good ) {
    sPass.style.border = '1px solid #c6c6c6';
  }

  //good = good && checkAlreadyUser( sEmail.value );

  if ( good ) {
    //Create a reference variable to a new parse user
    var user = new Parse.User(); 

    //Set the user's inputs as database fields
    user.set( 'name', sName.value );
    user.set( 'username', sEmail.value );
    user.set( 'password', sPass.value );

    //Call Parse's signUp function
    user.signUp(null, {
      //If Parse is able to successfully add the user to the database
      success: function( user ) {
        //Clear the text boxes
        sName.value = '';
        sEmail.value = '';
        sPass.value = '';

        //Call sweet alert to notify user of success
        swal({
          title: 'Awesome!',
          text: 'You have successfully signed up!',
          type: 'success',
          confirmButtonColor: '#5858FA',
          confirmButtonText: 'Go to my page!'
        });

        //Reset the tips field back to original
        tips.innerHTML = 'Please fill out the following fields';
        tips.style.background = '#4CAF50';
        tips.style.border = '2px solid #1B5E20';
      },
        //If Parse isn't able to successfully add the user to the database
        error: function( user ) {
          //Update the tips field to let the user know
          updateTips( 'sTips', 'Something is wrong. Please check your inputs and try again!');
        }
    });
  }
}

/************************************************************************
 * Name:		login()

 * Purpose:		Allows the user to login to their profile page.

 * Called In:   main()

 * Description:	This function validates the input of the of the
 text boxes in the login form. If they are good,
 it calls Parse's logIn function. If the user's
 input is not valid, it updates the tips field
 in the form with the correct error message to
 help the user login properly.
 ************************************************************************/
function login() {
  //Declares any necessary variables
  var good = true, lEmail = document.getElementById( 'lEmail' ), lPass = document.getElementById( 'lPass' ),
      tips = document.getElementById( 'lTips' );

  good = good && checkLength( lEmail, 'email', 6, 80, 'lTips' );
  good = good && valInput( lEmail, emailRegex, 'email', 'lTips' );

  if ( good ) {
    lEmail.style.border = '1px solid #c6c6c6';
  }

  good = good && checkLength( lPass, 'password', 5, 15, 'lTips' );

  if ( good ) {
    //Calls the Parse logIn function passing in the user's inputs and what to do on success and error
    Parse.User.logIn( lEmail.value, lPass.value, {
      //If the logIn is successful, notify user via sweet alert
      success: function( user ) {
        lPass.style.border = '1px solid #c6c6c6';
        lEmail.value = '';
        lPass.value = '';

        //Reset the tips field back to original
        tips.innerHTML = 'Please fill out the following fields';
        tips.style.background = '#4CAF50';
        tips.style.border = '2px solid #1B5E20';

        location.href="/home";
      },
      //If the logIn is not successful, notify the user via sweet alert
      error: function( user ) {
        swal({
          title: 'Oops...',
        text: 'Something went wrong. Please try again.',
        type: 'error',
        confirmButtonColor: '#5858FA',
        confirmButtonText: 'Aw man, not again...'
        });
      }
    });
  }
}

/************************************************************************
 * Name:		checkLength()

 * Purpose:		Checks to see if the length of a text field is within
 bounds

 * Description:	Compares the field's input length to the max and min 
 arguments.If invalid, turn border red, and call 
 updateTips() with error message.

 * Called in:   login(), signup()

 * Input:		var input - field that is being checked
 var strName - Name of field being checked. Used in 
 updateTips() to show user where error is.
 var min - The minimum number of characters the length of
 the input must be to be valid. Used in length
 checking and in updateTips() to show user length
 bounds.
 var max - The maximum number of characters the length of
 the input can be to be valid. Used in length
 checking and in updateTips() to show user length
 bounds.
 var tipId - the ID of the tip field for this form. Allows
 updateTips to update the correct tips field.

 * Result:      True if length of input is valid, false if not.
 ************************************************************************/
function checkLength( input, strName, min, max, tipId ) {
  //Check if the length of input doesn't fall in the bounds
  if ( input.value.length > max || input.value.length < min ) {
    //Change the color of the text box red
    input.style.border = '1px solid #F44336';
    //Call update tips to notify the user of their error
    updateTips( tipId, 'Length of ' + strName + ' must be between ' + min + ' and ' + max + ' characters!' );
    return false;
  } else {
    return true;
  }
}

/************************************************************************
 * Name:		updateTips()

 * Purpose:		Updates the value and css of the tip bar at the top of 
 the form if there is an error

 * Description:	Sets the value, background color, and border color of the
 tips bar

 * Called in:   login(), signup(), checkAlreadyUser()

 * Input:		var id - The ID of the tips field to update.
 var newTip - The string to be displayed in the tip bar.
 ************************************************************************/
function updateTips( id, newTip ) {
  var tips = document.getElementById( id );
  //Change the text displayed to the argument
  tips.innerHTML = newTip;
  //Change the background-color and border color of the tips bar.
  tips.style.background  = '#F44336';
  tips.style.border = '2px solid #D50000';
  tips.style.color = 'white';
}

/************************************************************************
 * Name:		valInput()

 * Purpose:		Checks to see if input uses valid characters or not.
 e.g. Name can't have numbers in it...like wtf bro...

 * Description:	Tests the field's input with a regEx argument. If
 not valid, it calls updateTips to display the error
 message.

 * Called in:   login(), signup()

 * Input:		var input - jQuery of field that is being checked
 var name - Name of field being checked. Used in updateTips
 to show user where error is.
 var valChar - The regex that the input is tested against
 var tipId - the ID of the tip field to update.

 * Result:		True if length of input is valid, false if not.
 ************************************************************************/
function valInput( input, valChar, name, tipId ) {
  //Test the users input against the regular expression passed in
  if ( !( valChar.test( input.value ) ) ) {
    //Update the tips with an error message if it fails
    updateTips( tipId, 'That doesn\'t look like an actual ' + name + '...but I don\'t judge' );
    //Change the color of the text box red
    input.style.border = '1px solid #F44336';
    return false;
  } else {
    return true;
  }
}

/************************************************************************
 * Name:		checkAlreadyUser()

 * Purpose:		Checks to see if a user trying to sign up is already in
 the database.

 * Description:	This function calls queries the database checking to see
 if the user's email is already in it. This works because
 the user's email should be unique. If it is in the
 database, the function returns false to break the 'good'
 boolean in the signup function. If the user's email is
 NOT in the database, the function returns true to
 preserve the 'good' boolean in the signup function.

 * Called in:   NOT READY FOR IMPLEMENTATION

 * Input:		var userEmail - The value that the user inputted into
 email field while trying to sign up.

 * Result:      True if email is NOT in database. False if email is in
 database.
 ************************************************************************/
function checkAlreadyUser( userEmail ) {
  //Declare a query reference variable 
  var query = new Parse.Query( 'Post' );
  var result = true;

  //Set the query to only look through the username column for the argument
  query.equalTo( 'email', userEmail );

  //Dispatch the query.
  query.find({
    //If the email is found update the tips bar with an error message and return false.
    success: function( objects ) {
    },
    error: function( error ) {
    }
  });

  return result;
}

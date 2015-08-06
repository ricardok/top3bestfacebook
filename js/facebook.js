// global uid of logged in user
var uid;

/* --------- User Class --------- */

function User(id, name){
    this.id = id;
    this.name = name;
    this.points = 0;
    this.tagged = false; // init to not yet got tagged points in case he's tagged
    this.invited = false; // init to not yet got invited points in case he has been invited to an event
}

User.prototype.addPoints = function(points){
    this.points += points;
}

User.prototype.changeToTagged = function(){
    this.tagged = true;
}

User.prototype.changeToInvited = function(){
    this.invited = true;
}

/* --------- User Class --------- */


// calculate points of users who were tagged on one or more photo of logged user.
function calculate_tagged_users(users_list,callback){  
        FB.api('me/photos?fields=tags{name,id}&type=uploaded',function(response) {

        if(response && !response.error){

        for(var i = 0; i< response.data.length; i++){
                    if(response.data[i].hasOwnProperty('tags')){

                        for(var j = 0; j< response.data[i].tags.data.length; j++){

                        var user_found = $.grep(users_list, function(e){
                        return e.id == response.data[i].tags.data[j].id;
                        });

                        if(user_found.length == 0){
                        if(response.data[i].tags.data[j].id !== uid){
                        var fb_user = new User(response.data[i].tags.data[j].id,response.data[i].tags.data[j].name); // create new user
                        fb_user.addPoints(5); // add points to user
                        fb_user.changeToTagged(); // Mark user as tagged so we dont add points to him
                        users_list.push(fb_user);
                            }
                        }
                        else if(user_found.length == 1){

                            if(user_found[0].tagged == false){
                            user_found[0].addPoints(5); // add points to existing user
                            }

                        }

                        }

                    }
                }
            }

                callback();
            });
}


// calculate points of users who liked last 20 posts
function calculate_likes_users(users_list,callback){


        FB.api('me?fields=posts.limit(20){likes{name,id}}',function(response) {

        if(response && !response.error){

        for(var i = 0; i< response.posts.data.length; i++){
                    if(response.posts.data[i].hasOwnProperty('likes')){

                        for(var j = 0; j< response.posts.data[i].likes.data.length; j++){

                        var user_found = $.grep(users_list, function(e){
                        return e.id == response.posts.data[i].likes.data[j].id;
                        });

                        if(user_found.length == 0){
                        if(response.posts.data[i].likes.data[j].id !== uid){
                        var fb_user = new User(response.posts.data[i].likes.data[j].id,response.posts.data[i].likes.data[j].name); // create new user
                        fb_user.addPoints(1); // add points to user
                        users_list.push(fb_user);
                            }
                        }
                        else if(user_found.length == 1){

                            user_found[0].addPoints(1); // add points to existing user

                        }

                        }

                    }
                }
            }

                callback();
            });


}

// calculate points of users who commented on the last 20 posts
function calculate_comments_users(users_list,callback){


        FB.api('me?fields=posts.limit(20){likes{name,id}}',function(response) {

        if(response && !response.error){

        for(var i = 0; i< response.posts.data.length; i++){
                    if(response.posts.data[i].hasOwnProperty('comments')){

                        for(var j = 0; j< response.posts.data[i].comments.data.length; j++){

                        var user_found = $.grep(users_list, function(e){
                        return e.id == response.posts.data[i].comments.data[j].from.id;
                        });

                        if(user_found.length == 0){

                        if(response.posts.data[i].comments.data[j].from.id !== uid){
                        var fb_user = new User(response.posts.data[i].comments.data[j].from.id,response.posts.data[i].comments.data[j].from.name); // create new user
                        fb_user.addPoints(1); // add points to user
                        users_list.push(fb_user);
                        }

                        }
                        else if(user_found.length == 1){

                            user_found[0].addPoints(1); // add points to existing user

                        }

                        }

                    }
                }
            }

                callback();
            });


}

// a recursive function called as long as response has paging property in order to get next response of events
function calculate_paging_events(users_list,query,callback){


    FB.api(query,function(response) {

        if(response && !response.error){

        for(var i = 0; i< response.data.length; i++){

                        var user_found = $.grep(users_list, function(e){
                        return e.id == response.data[i].owner.id;
                        });

                        if(user_found.length == 0 && response.data[i].rsvp_status == "attending"){

                        if(response.data[i].owner.id !== response.data[i].owner.id){
                        var fb_user = new User(response.data[i].owner.id,response.data[i].owner.name); // create new user
                        fb_user.addPoints(5); // add points to user
                        fb_user.changeToInvited();
                        users_list.push(fb_user);
                            }

                        }
                        else if(user_found.length == 1 && response.data[i].rsvp_status == "attending"){

                            if(user_found[0].invited == false){
                            user_found[0].addPoints(5); // add points to existing user
                            }

                        }

                    
                }

            if(response.hasOwnProperty('paging')){
                if(response.paging.hasOwnProperty('next')){
                    calculate_paging_events(users_list,response.paging.next,callback);

                }
            }
            else{ callback(); }
        }
    });

}


// calculate friends points whom I attended their event
function calculate_events_users(users_list,callback){

        FB.api('me?fields=events{rsvp_status,owner,type}',function(response) {

        if(response && !response.error){

        for(var i = 0; i< response.events.data.length; i++){

                        // find user in user_list by id
                        var user_found = $.grep(users_list, function(e){
                        return e.id == response.events.data[i].owner.id;
                        });

                        if(user_found.length == 0 && response.events.data[i].rsvp_status == "attending"){

                        if(response.events.data[i].owner.id !== uid ){
                        var fb_user = new User(response.events.data[i].owner.id,response.events.data[i].owner.name); // create new user
                        fb_user.addPoints(5); // add points to user
                        fb_user.changeToInvited();
                        users_list.push(fb_user);
                            }

                        }
                        else if(user_found.length == 1 && response.events.data[i].rsvp_status == "attending"){

                            if(user_found[0].invited == false){
                            user_found[0].addPoints(5); // add points to existing user
                            }
                        
                        }

                    
                }

            if(response.events.paging.hasOwnProperty('next')){
                calculate_paging_events(users_list,response.events.paging.next,function(){
                    callback();
                });
            }

            }

            });

}


// gets and sets user profile picture
function set_user_picture(object,id){
                FB.api(id +'/picture?type=large',function(response) {
                    object.find('img').attr("src",response.data.url);
            });
}


// get best friends function
function get_best_friends(){

    // show loading image
    $(".bestfriends-container").append('<div id="loading_friends-img"><img src="images/loading_friends.gif" alt="loading"></div>');

    var users_list = [];

    calculate_tagged_users(users_list, function(){

        //console.log(users_list);

    calculate_likes_users(users_list, function(){

        //console.log(users_list);


    calculate_comments_users(users_list, function(){


    calculate_events_users(users_list, function(){


        users_list.sort(function(a, b) {
        return parseFloat(b.points) - parseFloat(a.points);
        });



        $( ".image-profile" ).each(function(index) {

        set_user_picture($(this),users_list[index].id);

        $(this).find('p').html( (index+1).toString() + ': ' + users_list[index].name );

        });

        $('#results').show();
        $('#loading_friends-img').remove();




    });


    });

    });


    });

}





function change_panelTitle(){
$('.panel-heading .title').html('Login using Facebook');
}


function toggle_elements(){
    $('#loginButton').toggle();
    $('#logout_btn').toggle();
    $('#getFriends').toggle();
    $('.panel-heading').toggleClass('panel-heading-logged-view');
    $('.panel-heading p').toggle();
    $('.panel-heading .title').html('Who are my best friends app!');
}


function change_UIview(useToggle){

    if(useToggle === 1){
    $('.panel').slideToggle('slow',function(){

    toggle_elements();

    }).delay(500).slideToggle('slow');
    }

    else if(useToggle === 0){
    toggle_elements();
    }
}


function fb_logout(){
    FB.logout(function(response) {

    change_UIview(1); // change to loggedout view
    change_panelTitle();
    $('#results').hide(); //hide result
});
}




function check_login_status(){
                FB.getLoginStatus(function(response) {
  if (response.status === 'connected') {
    // the user is logged in and has authenticated your
    // app, and response.authResponse supplies
    // the user's ID, a valid access token, a signed
    // request, and the time the access token 
    // and signed request each expire
    change_UIview(0);

    uid = response.authResponse.userID;
    console.log(uid);

  } else if (response.status === 'not_authorized') {
        change_panelTitle();
    // the user is logged in to Facebook, 
    // but has not authenticated your app
  } else {
    // the user isn't logged in to Facebook.
  }
 });
}

  function fb_login(){
    FB.login(function(response) {

        if (response.authResponse) {
            console.log('Welcome!  Fetching your information.... ');
            uid = response.authResponse.userID; //get FB UID
            change_UIview(1);

        } else {
            //user hit cancel button
            console.log('User cancelled login or did not fully authorize.');

        }
    }, {
        scope: 'publish_actions,user_posts,user_photos,user_events,user_tagged_places'
    });
}
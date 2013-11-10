// client/main.js
Lists = new Meteor.Collection('lists');
Items = new Meteor.Collection("items");
Meteor.subscribe('lists');
//Meteor.subscribe('items');

// ID of currently selected list
Session.setDefault('list_id', null);

var todosHandle = null;
// Always be subscribed to the todos for the selected list.
Deps.autorun(function () {
  var list_id = Session.get('list_id');
  if (list_id)
    todosHandle = Meteor.subscribe('items', list_id);
  else
    todosHandle = null;
});


Template.vanillalists.helpers({
  fullName: function () {
    return Meteor.user().profile.name;
  },
 
  userName: function () {
    return Meteor.user().username;
  },
 
  noOfLists: function () {
    var lists = Lists.find({user_id: Meteor.userId()}),
      retVal;
    if (lists.count() === 1) {
      retVal = "1 List";
    } else {
      retVal = lists.count() + " Lists";
    }
    return retVal;
  },

  lastList: function () {
    var lastList = Lists.findOne({user_id: Meteor.userId()}, {sort: {created_at: -1}}), retVal;
 
    if (lastList) {
      retVal = lastList.list;
    } else {
      retVal = 'This user has no Lists';
    }
 
    return retVal;
  },

  lists: function () {
    return Lists.find({}, {sort: {created_at: -1}});
  },
   
  buddyFullName: function (listUserId) {
    var theUser = Meteor.users.findOne({_id: listUserId});
    return theUser.profile.name;
  },
   
  buddyUserName: function (listUserId) {
    var theUser = Meteor.users.findOne({_id: listUserId});
    return theUser.username;
  },
   
  elapsedTime: function (text) {
    var currentDate = new Date(),
      listDate,
      minutes_elapsed,
      hours_elapsed,
      days_elapsed,
      retVal,
      record = Lists.findOne({list: text});
   
    listDate = new Date(record.created_at);
    minutes_elapsed = (currentDate - listDate) / 60000;
    if (minutes_elapsed > 60) {
      hours_elapsed = minutes_elapsed / 60;
      if (hours_elapsed > 24) {
        days_elapsed = hours_elapsed / 24;
        retVal = parseInt(days_elapsed, 10) + "d";
      } else {
        retVal = parseInt(hours_elapsed, 10) + "h";
      }
    } else {
      retVal = parseInt(minutes_elapsed, 10) + "m";
    }
    return retVal;
  }

});
Template.vanillalists.events({
  'click #createTheList': function (event, template) {
    var listContent= template.find('.listText').value;
 
    Lists.insert({
      user_id: Meteor.user()._id,
      list: listContent,
      created_at: new Date()
    });
    template.find('.listText').value = "";
  },

  'click #deleteList': function (event, template) {
    Lists.remove(this._id);
  },
  'mousedown .listWrapper': function (evt) { // select list
    //Router.setList(this._id);
    Session.set('list_id', this._id);
    console.log("selected list: "+ this._id);
  },
  'click .listWrapper': function (evt) {
    // prevent clicks on <a> from refreshing the page.
    evt.preventDefault();
  },
  'dblclick .listWrapper': function (evt, tmpl) { // start editing list name
    // Session.set('editing_listname', this._id);
    // Deps.flush(); // force DOM redraw, so we can focus the edit field
    // activateInput(tmpl.find("#list-name-input"));
  },
  'click #btnLogOut': function (event, template) {
    if (Meteor.userId()) {
      Meteor.logout();
    }
  }
});

Template.vanillaitems.helpers({
  lastItem: function () {
    var lastItem = Items.findOne({user_id: Meteor.userId()}, {sort: {created_at: -1}}), retVal;
 
    if (lastItem) {
      retVal = lastItem.item;
    } else {
      retVal = 'This user has no Items';
    }
 
    return retVal;
  },
  items: function () {
    return Items.find({}, {sort: {created_at: -1}});
  }
});

Template.vanillaitems.events({
  'click #createTheItem': function (event, template) {
    var itemContent= template.find('.itemText').value;
 
    Items.insert({
      user_id: Meteor.user()._id,
      item: itemContent,
      list_id: Session.get('list_id'),
      created_at: new Date()
    });
    template.find('.itemText').value = "";
  }
});
var tryLogin = function (event, template){
  if (Meteor.userId()) {
    Meteor.logout();
  } else {
    var userName = template.find('#username').value,
      userPassword = template.find('#password').value;
    Meteor.loginWithPassword(userName, userPassword, function (error) {
      if (error) {
        console.log(error);
      }
    });
  }
}
Template.login.events({
  'click #btnLogIn': function (event, template) {
    tryLogin(event, template);
  },
  'click #btnToggleSignup': function (event, template) {
    $('.login').fadeToggle(function() {
      $('.signup').fadeToggle(); 
    });
  },
  'keypress input': function(event, template) {
    if (event.which === 13) {
      tryLogin(event, template);
    };
  }
});

var trySignup = function (event, template){
      var userEmail = template.find('#email').value,
      userName  = template.find('#newusername').value,
      password  = template.find('#newpassword').value,
      password2 = template.find('#password2').value,
      name      = template.find('#fullname').value;
 
    Accounts.createUser({
      username: userName,
      email:    userEmail,
      password: password,
      profile: {
        name: name
      }
    }, function (error) {
      if (error) {
        console.log("Cannot create user");
      }
    });
}
Template.signup.events({
  'click #btnCreateAccount': function (event, template) {
    trySignup(event, template);
  },
  'click #btnToggleSignup': function (event, template) {
    $('.signup').fadeToggle(function() {
      $('.login').fadeToggle(); 
    });
  },
  'keypress input': function(event, template) {
    if (event.which === 13) {
      trySignup(event, template);
    };
  }
});
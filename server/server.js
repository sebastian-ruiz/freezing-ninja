Lists = new Meteor.Collection('lists');
Meteor.publish('lists', function () {
  return Lists.find({});
});

Items = new Meteor.Collection('items');
// Meteor.publish('items', function () {
//   return Items.find({});
// });

// Publish all items for requested list_id.
Meteor.publish('items', function (list_id) {
  check(list_id, String);
  return Items.find({list_id: list_id});
});
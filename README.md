restful-model
=============

A model generator that brings ActiveModel like functionality to javascript, but Restful by default.

Status
------

In the middle of the API design phase. Here's what is functional to date.

Generate a Model Class
----------------------

``` javascript
// You can generate a model class, setting it's class name for later retrospection
var User = RestfulModel.generate('User');

// And optionally pass in a list of accepted fields
var User = RestfulModel.generate('User', ['name', 'age', 'gender']);
```

Create an Instance of the Generated Model Class
-----------------------------------------------

``` javascript
var User = RestfulModel.generate('User', ['name']);
var user = User.new({name: 'Michael Christenson II'});
```

Protect against unwanted attributes
-----------------------------------

``` javascript
var User = RestfulModel.generate('User', ['name']);
var user = User.new({name: 'Michael Christenson II', age: 34}); // This will only store the name attribute
```

See a List of Valid Attribute Names
-----------------------------------

``` javascript
var User = RestfulModel.generate('User', ['name']);
User.attributeNames; // ['name']

var user = User.new({name: 'Michael Christenson II'});
user.attributeNames; // ['name']
```

See an Instance's Attributes
---------------------------

``` javascript
var User = RestfulModel.generate('User', ['name']);
var user = User.new({name: 'Michael Christenson II'});

user.attributes; // {'name': 'Michael Christenson II'}
```

Directly Access the Instance's Attribute
----------------------------------------

``` javascript
var User = RestfulModel.generate('User', ['name']);
var user = User.new({name: 'Michael Christenson II'});

user.name; // 'Michael Christenson II'
```

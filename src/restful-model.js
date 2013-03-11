var RestfulModel = {
  generate: (function(){
    return function(options){
      console.log('Generating model ' + options.className);
      var attributeNames = options.fields;

      var Model = {
        attributesNames: attributeNames,
        restfulURL: options.baseUrl ? options.baseUrl : '/' + options.className,
        build: function(attributes){
          console.log('Building the ' + options.className);
          return new (function(){
            function Model(attributes){
              this.className      = options.className;
              this.attributeNames = attributeNames;
              this.attributes     = {};

              if(attributeNames){
                for(var attribute in attributes){
                  var validAttribute = attributeNames.indexOf(attribute) !== -1;
                  if(validAttribute){
                    this.attributes[attribute] = attributes[attribute];
                    this[attribute] = attributes[attribute];
                  }
                }
              } else {
                this.attributes[attribute] = attributes[attribute];
                this[attribute] = attributes[attribute];
              }
            }

            return Model;
          }())(attributes);
        },
        new: function(attributes){
          console.log('Creating a ' + options.className);
          return this.build(attributes);
        },
        all: function(callback){
          console.log('Returning all the ' + options.className + ' records');
          var allThis = this;
          xhr = new XMLHttpRequest();
          xhr.open('GET', this.restfulURL);
          xhr.onload = function(){
            var models = [];
            var data   = JSON.parse(this.responseText);
            var length = data.length;
            console.log(length + ' ' + options.className + ' records found');
            for(var i=0; i < length; i += 1){
              models.push(allThis.build(data[i]));
            }
            if(callback){
              console.log('Triggering Callback');
              return callback(models);
            } else {
              console.log('Returning models');
              return models;
            }
          };
          xhr.send();
        },
        find: function(id, callback){
          console.log('Searching for a ' + options.className + ' with the id of ' + id);
          var findThis = this;
          xhr = new XMLHttpRequest();
          xhr.open('GET', this.restfulURL + '/' + id);
          xhr.onload = function(){
            data  = JSON.parse(this.responseText);
            model = findThis.build(data);
            if(callback){
              console.log('Triggering Callback from find');
              return callback(model);
            } else {
              console.log('Returning model from find');
              return model;
            }
          }
          xhr.send();
        }
      };

      return Model;
    };
  }())
};

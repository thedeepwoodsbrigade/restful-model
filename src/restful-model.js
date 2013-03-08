var RestfulModel = {
  generate: (function(){
    return function(className){
      console.log('Generating model ' + className);
      var attributeNames = Array.prototype.slice.call(arguments)[1];

      var Model = {
        attributesNames: attributeNames,
        build: function(attributes){
          console.log('Building the ' + className);
          return new (function(){
            function Model(attributes){
              this.className      = className;
              this.attributeNames = attributeNames;
              this.attributes     = {};

              for(var attribute in attributes){
                var validAttribute = attributeNames.indexOf(attribute) !== -1;
                if(validAttribute){
                  this.attributes[attribute] = attributes[attribute];
                  this[attribute] = attributes[attribute];
                }
              }
            }
            return Model;
          }())(attributes);
        },
        new: function(attributes){
          console.log('Creating a ' + className);
          return this.build(attributes);
        },
        all: function(){
          console.log('Returning all the ' + className);
        }
      };

      return Model;
    };
  }())
};

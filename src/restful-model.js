var RestfulModel = {
  generate: (function(){
    return function(options){
      var attributeNames         = options.fields;
      var readOnlyAttributeNames = options.fieldsReadOnly;
      var hooks                  = options.hooks;

      var Model = {
        attributeNames: attributeNames,
        readOnlyAttributeNames: readOnlyAttributeNames,
        restfulURL: options.baseUrl ? options.baseUrl : '/' + options.className,
        requiredData: options.requiredData,
        log: function(message){
          console.log(message);
        },
        jsonToUrlEncoding: function(json, prefix, result){
          result = result || {};
          for(var property in json){
            if(json.hasOwnProperty(property)){
              var value = json[property];
              var name  = prefix ? prefix + '[' + property + ']' : property;
              if(typeof value !== 'object'){
                result[name] = value;
              } else {
                this.jsonToUrlEncoding(value, name, result);
              }
            }
          }
          return result;
        },
        formData: function(){
          var formData = new FormData();
          for(var field in this.requiredData){
            formData.append(field, this.requiredData[field]);
          }
          return formData;
        },
        urlData: function(){
          var data = [];
          for(var field in this.requiredData){
            data.push(field + '=' + this.requiredData[field]);
          }
          return data.join('&');
        },
        appendToUrl: function(url, string){
          var appendedUrl = (url + ((/\?/).test(url) ? '&' : '?') + string);
          return appendedUrl;
        },
        ajax: function(url, options){
          var restfulScope = this;
          var method       = options.method ? options.method.toUpperCase() : 'GET';
          var xhr          = new XMLHttpRequest();

          if(method == 'GET'){
            url = this.appendToUrl(url, this.urlData());
            if(options.attributes){
              for(var attribute in attributes){
                url = this.appendToUrl(url, attribute + '=' + attributes[attribute]);
              }
            }
          }

          if(options.load) {xhr.onload  = options.load; }
          if(options.error){xhr.onerror = options.error;}
          
          xhr.open(method, url);

          if((method == 'PUT') || (method == 'POST')){
            var form = this.formData();
            if(options.attributes){
              var attributes = this.jsonToUrlEncoding(options.attributes);
              for(var attribute in attributes){
                form.append(attribute, attributes[attribute]);
              }
            }
            xhr.send(form);
          } else {
            xhr.send();
          }

          return xhr;
        },
        build: function(attributes){
          var ModelScope = this;
          return new (function(){
            function Model(attributes){
              this.parentClass            = ModelScope;
              this.className              = options.className;
              this.attributeNames         = attributeNames;
              this.readOnlyAttributeNames = readOnlyAttributeNames;
              this.attributes             = {};

              for(var attribute in attributes){
                if(attributeNames){
                  var validAttribute = attributeNames.indexOf(attribute) !== -1;
                  if(validAttribute){
                    this.attributes[attribute] = attributes[attribute];
                    this[attribute] = attributes[attribute];
                  }
                } else {
                  this.attributes[attribute] = attributes[attribute];
                  this[attribute] = attributes[attribute];
                }
              }

              for(var hook in hooks){
                this[hook] = hooks[hook];
              }
            }

            Model.prototype.save = function(callback){
              var instance = this;
              instance.parentClass.save(instance, callback ? callback : instance.parentClass.log);
            };

            Model.prototype.destroy = function(callback){
              var instance = this;
              instance.parentClass.destroy(instance, callback ? callback : instance.parentClass.log);
            };

            return Model;
          }())(attributes);
        },
        new: function(attributes){
          return this.build(attributes);
        },
        destroy: function(model, callback){
          var destroyThis = this;
          var url         = this.restfulURL + '/' + model.id;
          var request     = this.ajax(
            url,
            {
              method: 'DELETE',
              load: function(){
                var data = JSON.parse(this.responseText);
                if(callback){
                  callback(model);
                }
              }
            }
          );
        },
        save: function(model, callback){
          var saveThis = this;
          var method   = 'POST';
          var url      = this.restfulURL;
          var attributes = {};
          attributes[options.className.toLowerCase()] = {};

          if(model.id){
            method = 'PUT';
            url    = (url + '/' + model.id);
          }

          if(attributeNames){
            var length = attributeNames.length;
            for(var i=0; i < length; i += 1){
              var attribute = attributeNames[i];
              if(model[attribute] != undefined){
                attributes[options.className.toLowerCase()][attribute] = model[attribute];
              }
            }
          } else {
            for(attribute in model.attributes){
              if(model[attribute] != undefined){
                attributes[options.className.toLowerCase()][attribute] = model[attribute];
              }
            }
          }

          var request = this.ajax(
            url,
            {
              method: method,
              attributes: attributes,
              load: function(){
                var data = JSON.parse(this.responseText);
                var model = saveThis.build(data);
                if(callback){
                  return callback(model);
                }
              }
            }
          );
          return request;
        },
        all: function(callback){
          var allThis = this;
          var request = this.ajax(
            this.restfulURL,
            {
              load: function(){
                var models = [];
                var data   = JSON.parse(this.responseText);
                var length = data.length;

                for(var i=0; i < length; i += 1){
                  models.push(allThis.build(data[i]));
                }

                if(callback){
                  return callback(models);
                }
              }
            }
          );
          return request;
        },
        find: function(id, callback){
          var findThis = this;
          var url      = this.restfulURL + '/' + id;
          var request  = this.ajax(
            url,
            {
              load: function(){
                var data  = JSON.parse(this.responseText);
                var model = findThis.build(data);
                if(callback){
                  return callback(model);
                }
              }
            }
          );
        }
      };

      return Model;
    };
  }())
};

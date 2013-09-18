class RestfulModel
  constructor: (options = {}) ->
    @attributeNames         = options.fields
    @readOnlyAttributeNames = options.fieldsReadOnly
    @hooks                  = options.hooks
    @requiredData           = options.requiredData
    #This is probably not needed, but I don't think I
    #understand the library well enough.
    @parentClass = ''
    #Didn't like the old way of doing it because its
    # less intuitive for CS. This is not compatible w/
    # older IE. Not too concerned.
    @className = @constructor.name
    @readOnlyAttributeNames = readOnlyAttributeNames
    @attributes = {}
    for attribute of attributes
      if @attributeNames
        validAttribute = attributeNames.indexOf(attribute) isnt -1
        if validAttribute
          @attributes[attribute] = attributes[attribute]
          this[attribute] = attributes[attribute]
      else
        @attributes[attribute] = attributes[attribute]
        this[attribute] = attributes[attribute]
    if @hooks
      for hook of @hooks
        this[hook] = @hooks[hook]
      @hooks.callback this  if @hooks.callback

    #These are class methods, right?
    Model::save = (callback) =>
      @parentClass.save instance, (if callback then callback else instance.parentClass.log)
    Model::destroy = (callback) =>
      @parentClass.destroy instance, (if callback then callback else instance.parentClass.log)

  restfulURL: (if options.baseUrl then options.baseUrl else "/" + options.className)

  log: (message) ->
    console.log message

  jsonToUrlEncoding: (json, prefix, result) ->
    result = result or {}
    for property of json
      if json.hasOwnProperty(property)
        value = json[property]
        name = (if prefix then prefix + "[" + property + "]" else property)
        if typeof value isnt "object"
          result[name] = value
        else
          @jsonToUrlEncoding value, name, result
    result

  formData: ->
    formData = new FormData()
    for field of @requiredData #Only required data?
      formData.append field, @requiredData[field]
    formData

  urlData: ->
    #OPTIMIZE: use escape codes
    data = []
    for field of @requiredData
      data.push field + "=" + @requiredData[field]
    data.join "&"

  appendToUrl: (url, string) ->
    appendedUrl = (url + ((if (/\?/).test(url) then "&" else "?")) + string)
    appendedUrl

  ajax: (url, options) ->
    restfulScope = this
    method = (if options.method then options.method.toUpperCase() else "GET")
    xhr = new XMLHttpRequest()
    if method is "GET"
      url = @appendToUrl(url, @urlData())
      if options.attributes
        for attribute of attributes
          url = @appendToUrl(url, attribute + "=" + attributes[attribute])
    xhr.onload = options.load  if options.load
    xhr.onerror = options.error  if options.error
    xhr.open method, url
    if (method is "PUT") or (method is "POST")
      form = @formData()
      if options.attributes
        attributes = @jsonToUrlEncoding(options.attributes)
        for attribute of attributes
          form.append attribute, attributes[attribute]
      xhr.send form
    else
      xhr.send()
    xhr

  destroy: (model, callback) ->
    destroyThis = this
    url = @restfulURL + "/" + model.id
    request = @ajax(url,
      method: "DELETE"
      load: ->
        data = JSON.parse(@responseText)
        callback model  if callback
    )

  save: (model, callback) ->
    saveThis = this
    method = "POST"
    url = @restfulURL
    attributes = {}
    attributes[options.className.toLowerCase()] = {}
    if model.id
      method = "PUT"
      url = (url + "/" + model.id)
    if attributeNames
      length = attributeNames.length
      i = 0

      while i < length
        attribute = attributeNames[i]
        attributes[options.className.toLowerCase()][attribute] = model[attribute]  unless model[attribute] is `undefined`
        i += 1
    else
      for attribute of model.attributes
        attributes[options.className.toLowerCase()][attribute] = model[attribute]  unless model[attribute] is `undefined`
    request = @ajax(url,
      method: method
      attributes: attributes
      load: ->
        data = JSON.parse(@responseText)
        model = saveThis.build(data)
        callback model  if callback
    )
    request

  all: (callback) ->
    allThis = this
    request = @ajax(@restfulURL,
      load: ->
        models = []
        data = JSON.parse(@responseText)
        length = data.length
        i = 0

        while i < length
          models.push allThis.build(data[i])
          i += 1
        callback models  if callback
    )
    request

  find: (id, callback) ->
    findThis = this
    url = @restfulURL + "/" + id
    request = @ajax(url,
      load: ->
        data = JSON.parse(@responseText)
        model = findThis.build(data)
        callback model  if callback
    )
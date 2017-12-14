(function () {

	function extractData(source) {
		var result;
		if (source instanceof dorado.EntityList) {
			result = [];
			result.$originEntityList = source;
			for (var it = source.iterator(); it.hasNext();) {
				result.push(extractEntity(it.next()));
			}
		} else if (source instanceof dorado.Entity) {
			result = extractEntity(source);
		}
		return result;
	}


	function extractEntity(source) {
		var result = {
			$originEntity: source
		}, dataType = source.dataType;

		var data = source._data;
		for (var property in data) {
			if (!data.hasOwnProperty(property)) continue;
			if (property.charAt(0) === '$') continue;

			var propertyDef = (dataType._propertyDefs) ? dataType._propertyDefs.get(property) : null;
			var value = source._get(property, propertyDef, null, "never");
			if (value != null) {
				if (value instanceof dorado.Entity || value instanceof dorado.EntityList) {
					value = extractData(value);
				} else if (value instanceof Object && value.isDataPipeWrapper) {
					value = undefined;
				}
			}
			if (value !== undefined)
				result[property] = value;
		}

		if (dataType) {
			var propertyDefs = dataType._propertyDefs;
			var items = propertyDefs.items;
			for (var i = 0, len = items.length; i < len; i++) {
				var propertyDef = items[i], property = propertyDef._name;
				if (propertyDef instanceof dorado.Reference && result[property] === undefined) {
					result[property] = (function (property) {
						return function (callback) {
							var entity = this;
							result.$originEntity.getAsync(property, {
								callback: function (success, data) {
									if (success) {
										data = extractData(data);
										ignoreEntityDelegate = true;
										entity.set(property, data);
										ignoreEntityDelegate = false;
									}
									cola.callback(callback, success, data);
								}
							});
						}
					})(property);
				}
			}
		}
		return result;
	}

	var ignoreDataTypeDelegate;

	function transferDataType(model, dataType) {
		var name = dataType._name;

		ignoreDataTypeDelegate = true;
		try {
			if (model.data.definition(name)) return;
		} finally {
			ignoreDataTypeDelegate = false;
		}

		var config = {
			name: name,
			properties: []
		};
		var propertyDefs = dataType._propertyDefs;
		var items = propertyDefs.items;
		for (var i = 0, len = items.length; i < len; i++) {
			var propertyDef = items[i], def = {}, type;
			var colaType = null;
			def.property = propertyDef._name;
			def.caption = propertyDef._label;

			type = propertyDef.get("dataType");

			if (type && type._code) {
				switch (type._code) {
					case 1:
					case 11:
					case 12:
						colaType = "string";
						break;
					case 2:
					case 3:
						colaType = "int";
						break;
					case 4:
					case 5:
						colaType = "float";
						break;
					case 6:
					case 7:
						colaType = "boolean";
						break;
					case 8:
					case 9:
					case 10:
						colaType = "date";
						break;
				}
			}
			if (colaType) def.dataType = colaType;

			config.properties.push(def);
		}
		var properties = [];
		for (var j = 0, length = config.properties.length; j < length; j++) {
			var item = config.properties[j];
			var oldDefinition = model.definition(item.property);
			var dataDefinition = cola.currentScope.definition(item.property);

			if (oldDefinition || dataDefinition) {
				continue;
			}
			properties.push(item);
		}
		config.properties = properties;

		return model.dataType(config);
	}

	function evaluatePath(data, path) {
		if (!data || typeof data != "object")
			return undefined;

		if (path.indexOf(".") > 0) {
			var result;
			for (var i = 0, paths = path.split("."), len = paths.length; i < len; i++) {
				result = (data instanceof dorado.Entity) ? data.get("path") : data[path];
				if (data && typeof data == "object") break;
				data = result;
			}
			return result;
		} else {
			return (data instanceof dorado.Entity) ? data.get("path") : data[path];
		}
	}

	var oldFillData = cola.EntityList.prototype.fillData;
	cola.EntityList.prototype.fillData = function (array) {
		this.$originEntityList = array.$originEntityList;
		return oldFillData.call(this, array);
	};

	var oldInsert = cola.EntityList.prototype.insert;
	cola.EntityList.prototype.insert = function (entity, insertMode, refEntity) {
		if (!ignoreEntityDelegate && this.$originEntityList && entity instanceof cola.Entity) {
			if (entity._data.$originEntity) {
				this.$originEntityList.insert(entity._data.$originEntity, insertMode);
			} else {
				this.$originEntityList.insert(entity.toJSON(), insertMode);
			}
		}
		return oldInsert.call(this, entity, insertMode, refEntity);
	};
	
	var oldSetCurrent = cola.EntityList.prototype.setCurrent;
	cola.EntityList.prototype.setCurrent = function (current) {
		var originEntity = current._data.$originEntity;
		if (originEntity) originEntity.setCurrent();
		return oldSetCurrent.call(this, current);
	};

	var oldSet = cola.Entity.prototype._set, ignoreEntityDelegate;
	cola.Entity.prototype._set = function (prop, value) {
		if (!ignoreEntityDelegate && this._data.$originEntity && prop.charAt(0) != "$") {
			var originEntity = this._data.$originEntity;
			if (value instanceof cola.Entity) {
				if (value.$originEntity) {
					originEntity.set(prop, value.$originEntity);
				} else {
					originEntity.set(prop, value.toJSON());
				}
			} else if (value instanceof cola.EntityList) {
				if (value.$originEntityList) {
					originEntity.set(prop, value.$originEntityList);
				} else {
					originEntity.set(prop, value.toJSON());
				}
			} else {
				originEntity.set(prop, value);
			}
		}
		return oldSet.call(this, prop, value);
	};

	var oldRemove = cola.Entity.prototype.remove;
	cola.Entity.prototype.remove = function (detach) {
		if (!ignoreEntityDelegate && this._data.$originEntity) {
			this._data.$originEntity.remove(detach);
		}
		return oldRemove.call(this, detach);
	};
	
	var oldInit = cola._init;
	cola._init = cola._EMPTY_FUNC;

	cola.delegateDorado = function () {
		var oldRootFunc = cola._rootFunc;
		cola._rootFunc = function () {
			
			var oldInitFunc;
			var initFunc = function (model) {
				if (model._delegated) {
					return oldInitFunc.apply(cola, arguments);
				}
				model._delegated = true;
				
				var rootModel = model;
				while (rootModel.parent) {
					rootModel = rootModel.parent;
				}

				var oldGet = model.data.get;
				model.data.get = function (path, loadMode, context) {
					var callback;
					if (loadMode && (typeof loadMode == "function" || typeof loadMode == "object")) {
						callback = loadMode;
						loadMode = "async";
					}

					if (path) {
						var i = path.indexOf("."), objId, dataPath = null;
						if (i < 0) {
							objId = path;
						} else {
							objId = path.substring(0, i);
							dataPath = path.substring(i + 1);
						}

						var result = oldGet.call(this, objId);

						if (result === undefined && !ignoreEntityDelegate) {
							var dataSet = doradoView.id(objId);
							if (dataSet instanceof dorado.widget.DataSet) {
								var dataType = dataSet.get("dataType");
								if (dataType && !rootModel.data.getDataType(objId)) {
									dataType = transferDataType(rootModel, dataType);
									rootModel.describe(objId, {
										dataType: dataType
									});
								}

								if (loadMode == "async" && callback) {
									dataSet.getDataAsync(null, function (data) {
										var json = extractData(data);
										ignoreEntityDelegate = true;
										rootModel.set(objId, json);
										if (callback) callback(rootModel.get(path));
										ignoreEntityDelegate = false;
									}, loadMode);
									return;
								} else {
									var data = dataSet.getData(null);
									var json = extractData(data);
									ignoreEntityDelegate = true;
									try {
										rootModel.disableObservers();
										rootModel.set(objId, json);
										rootModel.enableObservers();
										return rootModel.get(path);
									}
									finally {
										ignoreEntityDelegate = false;
									}
								}
							}
						}
					}
					return oldGet.apply(this, arguments);
				};

				var oldModelFlush = model.data.flush;
				model.data.flush = function (path, loadMode) {
					if (path) {
						var i = path.indexOf("."), objId, dataPath = null;
						if (i < 0) {
							objId = path;
						} else {
							objId = path.substring(0, i);
							dataPath = path.substring(i + 1);
						}
						
						var dataSet = doradoView.id(objId);
						if (dataSet instanceof dorado.widget.DataSet) {
							if (loadMode == "sync") {
								if (dataPath) {
									var data = dataSet.getData(dataPath);
									data && data.flush();
								}
								else {
									dataSet.flush();
								}
								var json = extractData(dataSet.getData(dataPath));
								ignoreEntityDelegate = true;
								rootModel.set(path, json);
								ignoreEntityDelegate = false;
							} else {
								if (dataPath) {
									var rootData = dataSet.getData("#");
									rootData.reset(dataPath);
									rootData.getAsync(dataPath, function (data) {
										model.data.reset(path);
										var json = extractData(data);
										ignoreEntityDelegate = true;
										rootModel.set(path, json);
										ignoreEntityDelegate = false;
										if (typeof loadMode == "function") {
											loadMode();
										}
									});
								}
								else {
									dataSet.flushAsync(function (data) {
										model.data.reset(path);
										var json = extractData(data);
										ignoreEntityDelegate = true;
										rootModel.set(path, json);
										ignoreEntityDelegate = false;
										if (typeof loadMode == "function") {
											loadMode();
										}
									});
								}
								
							}
						}
						return this;
					}
					return oldModelFlush.call(this, name, loadMode);
				};

				var oldGetDataType = model.data.getDataType;
				model.data.getDataType = function (path) {
					var result = oldGetDataType.call(this, path);
					if (result) return result;

					if (rootModel != model) {
						result = rootModel.data.getDataType(path);
						if (result) return result;
					}
					
					if (!ignoreDataTypeDelegate) {
						var i = path.indexOf(".");
						if (i > 0) {
							dataTypeName = path.substring(0, i);
						}
						else {
							dataTypeName = path;
						}

						var dataType = doradoView.getDataType(dataTypeName);
						if (dataType) {
							transferDataType(rootModel, dataType);
							result = oldGetDataType.call(this, dataTypeName);
						}
					}
					return result;
				};

				var oldDefinition = model.data.definition;
				model.data.definition = function (name) {
					var result = oldDefinition.call(this, name);
					if (result) return result;

					if (rootModel != model) {
						result = rootModel.data.definition(name);
						if (result) return result;
					}
					
					if (!ignoreDataTypeDelegate) {
						var dataType = doradoView.getDataType(name);
						if (dataType) {
							result = transferDataType(rootModel, dataType);
						}
					}
					return result;
				};

				oldInitFunc.apply(cola, arguments);
			};
			
			var newArguments = [];
			for (var i = 0, len = arguments.length; i < len; i++) {
				var arg = arguments[i];
				if (typeof arg === "function") {
					newArguments.push(initFunc);
					oldInitFunc = arg;
				}
				else {
					newArguments.push(arg);
				}
			}
			
			oldRootFunc.apply(this, newArguments);
		};

		if (dorado.onInitFired) {
			window.doradoView = viewMain;
			oldInit();
		} else {
			dorado.onInit(function () {
				window.doradoView = viewMain;
				oldInit();
			});
		}
	}

})();
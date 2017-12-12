cola.defineWidget(cola.Form, {
	tagName: "autoform",
	attributes: {
		bind: null,
		fields: null
	},
	initDom: function (dom) {
		var bind = this.get("bind"), fields = this.get("fields");
		if (fields) {
			var dataType = this.getBindingDataType();

			var childDoms = [], fieldsDom, maxCols = 4, defaultCols = 2, usedCols = maxCols;
			for (var i = 0, len = fields.length; i < len; i++) {
				var field = fields[i], propertyDef, caption, propertyType;

				if (dataType) {
					propertyDef = dataType.getProperty(field.property);
					if (propertyDef) {
						caption = field.caption || propertyDef.get("caption") || field.property;
						propertyType = propertyDef.get("dataType");
					}
					else {
						caption = field.caption || field.property;
						propertyType = null;
					}
				}

				if (usedCols + (field.cols || defaultCols) > maxCols) {
					usedCols = 0;
					fieldsDom = {
						tagName: "fields",
						class: cola.defaultAction.number2Word(maxCols),
						content: []
					};
					childDoms.push(fieldsDom);
				}

				var fieldContent;
				if (field.editContent) {
					fieldContent = [
						{
							tagName: "label",
							content: caption
						},
						field.editContent
					];
				}
				else if (field.type == "checkbox" || propertyType instanceof cola.BooleanDataType) {
					fieldContent = [
						{
							tagName: "label",
							content: caption
						},
						{
							tagName: "c-checkbox",
							bind: "@bind." + field.property
						}
					];
				}
				else if (field.type == "date" || propertyType instanceof cola.DateDataType) {
					fieldContent = [
						{
							tagName: "label",
							content: caption
						},
						{
							tagName: "c-datepicker",
							bind: "@bind." + field.property
						}
					];
				}
				else if (field.type == "textarea") {
					fieldContent = [
						{
							tagName: "label",
							content: caption
						},
						{
							tagName: "c-textarea",
							bind: "@bind." + field.property,
							height: field.height || "4em"
						}
					];
				}
				else {
					fieldContent = [
						{
							tagName: "label",
							content: caption
						},
						{
							tagName: "c-input",
							bind: "@bind." + field.property
						}
					];
				}

				usedCols += field.cols || defaultCols;
				fieldsDom.content.push({
					tagName: "field",
					class: "colspan-" + (field.cols || defaultCols),
					property: field.property,
					content: fieldContent
				});
			}

			childDoms.push({
				tagName: "field",
				content: {
					tagName: "messages"
				}
			});
			$(dom).append(this.xRender(childDoms));
		}
	}
});

cola(function (model) {

	cola.defineWidget({
		tagName: "condition-brief",
		attributes: {
			condition: null
		},
		refreshDom: function (dom) {
			var brief = [], condition = this.get("condition"), fields = $definition.queryFields;
			if (condition && fields) {
				var dataType = model.dataType("dataTypeItem");

				for (var i = 0, len = fields.length; i < len; i++) {
					var field = fields[i], propertyDef, caption, propertyType;

					var value = condition.get(field.property);
					if (value == null || value == "") continue;

					propertyDef = dataType.getProperty(field.property);
					if (propertyDef) {
						caption = field.caption || propertyDef.get("caption");
						propertyType = propertyDef.get("dataType");
					}
					else {
						caption = field.caption || field.property
					}

					brief.push({
						tagName: "label",
						class: "property",
						content: caption
					});

					if (field.type == "boolean" || propertyType instanceof cola.BooleanDataType) {
						brief.push({
							tagName: "label",
							class: "value",
							content: value ? "是" : "否"
						});
					}
					else if (field.type == "date" || propertyType instanceof cola.DateDataType) {
						brief.push({
							tagName: "label",
							class: "value",
							content: cola.defaultAction.format(value, field.format)
						});
					}
					else {
						brief.push({
							tagName: "label",
							class: "value",
							content: value + ""
						});
					}
				}

				if (brief.length > 0) {
					brief.splice(0, 0, {
						tagName: "label",
						class: "title",
						content: "当前查询条件"
					});
				}

				var $dom = $(dom);
				$dom.empty();
				if (brief.length > 1) {
					$dom.xAppend(brief).css("display", "block");
				}
				else {
					$dom.css("display", "none");
				}
			}
		}
	});

	model.set("title", $definition.title);

	var dataType = model.dataType($definition.dataType);

	model.describe("definition", "json");
	model.set("definition", $definition);

	model.describe("items", {
		dataType: dataType,
		provider: $definition.provider
	});
	model.describe("editingItem", dataType);
	model.describe("queryCondition", dataType);

	model.set("queryCondition", {});

	model.action({
		showLayerQuery: function () {
			cola.widget("layerQuery").show();
		},
		add: function () {
			model.set("state", "add");
			model.set("editingItem", new cola.Entity({}, dataType));
			cola.widget("layerEdit").show();
		},
		edit: function () {
			model.set("state", "edit");
			var currentItem = model.get("items").current;
			model.set("editingItem", currentItem.toJSON());
			cola.widget("layerEdit").show();
		},
		del: function () {
			var currentItem = model.get("items").current;
			if (currentItem) {
				cola.confirm("确定要删除当前记录吗?", function () {
					if ($definition.resolver.deleteUrl) {
						$.ajax({
							url: $definition.resolver.deleteUrl + currentItem.get($definition.keyProperty) + "/",
							type: "delete"
						}).then(function () {
							currentItem.remove();
						});
					}
					else {
						currentItem.remove();
					}
				});
			}
		},
		getImageUrl: function (item, property) {
			return item.get(property) ? ($definition.fileOptions.urlPrefix + item.get(property)) : ''
		},
		imageClick: function () {
			cola.widget("layerUpload").show();
		}
	});

	var columns;
	if ($definition.sortable) {
		columns = [{
			width: "40px",
			template: {
				class: "drag-handle"
			}
		}];
		columns = columns.concat($definition.columns);
	}
	else {
		columns = $definition.columns;
	}

	var uploader, uploadFiles, uploadFileIndex;

	model.widgetConfig({
		titleBar: {
			rightItems: $definition.toolBarItems
		},
		pagerItems: {
			class: "secondary",
			bind: "items"
		},
		menuItemSearch: {
			icon: "search",
			caption: "搜索",
			click: function () {
				model.action.showLayerQuery();
			}
		},
		menuItemAdd: {
			icon: "plus",
			caption: "添加",
			class: "red basic",
			click: function () {
				model.action.add();
			}
		},
		menuItemDel: {
			icon: "minus",
			caption: "删除",
			click: function () {
				model.action.del();
				model.get("items.prop1");
			}
		},
		menuItemEdit: {
			icon: "edit",
			caption: "修改",
			click: function () {
				model.action.edit();
			}
		},
		tableItems: {
			bind: "item in items",
			highlightCurrentItem: true,
			changeCurrentItem: true,
			currentPageOnly: true,
			columns: columns,
			itemDoubleClick: function () {
				model.action.edit();
			}
		},
		menuItemEditCancel: {
			icon: "chevron left",
			click: function () {
				cola.widget("layerEdit").hide();
			}
		},
		buttonEditOk: {
			caption: "确定",
			click: function () {
				var editingItem = model.get("editingItem");
				if (!editingItem.validate()) {
					cola.alert("请先完善或修正数据后重试。");
					return;
				}

				function applyEditing(item) {
					if (model.get("state") == "add") {
						model.get("items").insert(item);
					}
					else {
						var currentItem = model.get("items").current;
						currentItem.set(item);
					}
				}

				var persistUrl = (model.get("state") == "add") ? $definition.resolver.insertUrl : $definition.resolver.updateUrl;
				if (persistUrl) {
					$.ajax({
						url: persistUrl,
						type: (model.get("state") == "add") ? "post" : "put",
						contentType: "application/json",
						data: JSON.stringify(editingItem.toJSON())
					}).then(function (item) {
						applyEditing(item || editingItem.toJSON());
					});
				}
				else {
					applyEditing(editingItem.toJSON());
				}
				cola.widget("layerEdit").hide();
			}
		},
		layerEdit: {
			hide: function () {
				model.set("state", null);
			}
		},
		layerQuery: {
			direction: "top",
			modalOpacity: 0,
			size: "auto",
			beforeShow: function () {
				model.set("state", "query");
			},
			hide: function () {
				model.set("state", null);
			}
		},
		buttonResetCondition: {
			caption: "重置条件",
			click: function () {
				model.set("queryCondition", {});
			}
		},
		buttonQuery: {
			caption: "开始查询",
			icon: "search",
			click: function () {
				var queryCondition = model.get("queryCondition");
				cola.widget("conditionBrief").set("condition", queryCondition).refresh();

				model.definition("providerItems").set("parameter", { contain: queryCondition.get("email") } );
				model.flush("items", function () {
					cola.widget("layerQuery").hide();
				});
			}
		},
		layerUpload: {
			direction: "bottom",
			modalOpacity: 0.5,
			size: "320px",
			beforeShow: function (self) {
				model.set("state", "upload");
				if (!uploader) {
					model.set("uploadFiles", []);
					uploadFiles = model.get("uploadFiles");
					uploadFileIndex = cola.util.buildIndex(uploadFiles, "id");

					uploader = WebUploader.create({
						auto: true,
						server: $definition.fileOptions.service,
						pick: {
							id: "#buttonSelectFile",
							caption: "Choose File...",
							multiple: false
						},
						accept: {
							title: "Images",
							extensions: "gif,jpg,jpeg,bmp,png",
							mimeTypes: "image/*"
						},
						compress: $definition.fileOptions.compress
					});

					uploader.on("fileQueued", function (file) {
						var fileItem = uploadFiles.insert({
							id: file.id,
							name: file.name,
							tumb: ""
						});

						uploader.makeThumb(file, function (error, src) {
								fileItem.set("thumb", src);
							},
							$definition.fileOptions.thumbWidth || 100,
							$definition.fileOptions.thumbHeight || 100
						);
					});

					uploader.on("startUpload", function () {
						cola.alert("文件上传的Server端逻辑在本示例中暂未实现。");
						return;
						
						model.set("state", "uploading");
					});

					uploader.on("uploadSuccess", function (file, result) {
						var fileItem = uploadFileIndex.find(file.id);
						fileItem.set("status", "success");
						model.set("items." + $definition.fileOptions.property, result.fileName)
					});

					uploader.on("uploadError", function (file) {
						var fileItem = uploadFileIndex.find(file.id);
						fileItem.set("status", "error");
					});

					uploader.on("uploadFinished", function () {
						model.set("state", "upload");
						uploadFiles.empty();
						self.hide();
					});

					uploader.on("error", function () {
						model.set("state", null);
					});
				}
				else {
					uploadFiles.empty();
				}

				setTimeout(function() {
					uploader.option("formData", {
						itemId: model.get("items.id")
					});
				}, 500);
			},
			beforeHide: function () {
				return !uploader.isInProgress();
			},
			hide: function () {
				model.set("state", null);
			}
		}
	});

	if ($definition.inLayer) {
		$("#titleBar").prepend($.xCreate({
			tagName: "a",
			class: "ui item",
			content: {
				tagName: "i",
				class: "icon chevron left"
			},
			click: function () {
				var layer = cola.findWidget(document, "layer");
				if (layer) layer.hide();
			}
		}));
	}

	setTimeout(function () {
		if ($definition.sortable) {
			$("#tableItems tbody").sortable({
				axis: "y",
				handle: ".drag-handle",
				helper: function (e, tr) {
					var $originals = tr.children();
					var $helper = tr.clone();
					$helper.height("auto").children().each(function (index) {
						$(this).width($originals.eq(index).width());
					});
					return $helper;
				},
				stop: function (e, ui) {
					var itemDom = ui.item[0], nextItemDom = itemDom.nextSibling;
					var item = cola.util.userData(itemDom, "item"), refItem;
					if (!item) return;

					if ($definition.resolver.moveUrl) {
						var parameter = {
							sourceItem: item.get($definition.keyProperty || "id")
						};
						if (nextItemDom) {
							refItem = cola.util.userData(nextItemDom, "item");
							if (!refItem) return;
							parameter.refItem = refItem.get($definition.keyProperty || "id");
						}
						$.post($definition.resolver.moveUrl, parameter).done(function () {
							var items = item.parent;
							items.remove(item, "detach");
							if (refItem) {
								items.insert(item, "before", refItem);
							}
							else {
								items.insert(item);
							}
						});
					}
					else {
						setTimeout(function() {
							cola.alert("拖拽排序的Server端逻辑在本示例中暂未实现。");
						}, 750);
					}
				}
			});
		}
	}, 0);
});

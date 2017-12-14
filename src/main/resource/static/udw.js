cola(function (model) {

	model.set("filterValue", "01");
	model.set("items", [
		{key: "01", value: "全部"},
		{key: "02", value: "高风险"},
		{key: "03", value: "新核保件"},
		{key: "04", value: "跟进核保件"},
		{key: "05", value: "紧急任务"}
	]);

	model.set("user", {name: "叶明哲"});


	model.action({
		translateType: function (value) {
			var source = model.get("items").toJSON();

			for (var i = 0, len = source.length; i < len; i++) {
				if (value == source[i].key) {
					return source[i].value;
				}
			}
			return "其他";
		},
		typeChange: function (self, arg) {

			model.flush("tasks")

		},
		toggleUserSidebar: function () {
			cola.widget("userSidebar").show();

		},
		translatePriority: function (priority) {
			var mapping = {
				50: "一级", 40: "二级", 30: "三级",
				20: "四级", 10: "五级"
			};

			return mapping[priority] || "五级";
		},
		openTask: function (entity) {
			var task = entity.toJSON();
			var option = {
				message: "系统提示框",
				description: "您要打开的保单号是：" + task.businessTaskId,
				showDuration: 3000
			};
			switch (task.priority) {
				case 50:
					cola.NotifyTipManager.error(option);
					break;
				case 40:
					cola.NotifyTipManager.info(option);
					break;
				case 30:
					cola.NotifyTipManager.success(option);
					break;
				default:
					cola.NotifyTipManager.show(option);
			}

		},
		toggleCalculator: function () {
			cola.widget("toolsSidebar").toggle();
		},
		toggleMenu: function () {
			cola.widget("menuSidebar").toggle();
		},
		flushTask: function (self, arg) {
			model.flush("tasks")
		},
		changeMenu: function (menu) {
			var menus= menu.get("menus");
			menus.each(function(item){
				console.log(item.get("label"));
			});
			console.log(menu.get("menus"));
			model.get("menus").setCurrent(menu);
		},
		openLink: function (menu) {
			var data = menu.toJSON();
			if (data.path) {
				//cola.widget("menuSidebar").hide();
				cola.NotifyTipManager.info({
					message: "系统消息",
					description: "您要打开的菜单是：" + data.label,
					showDuration: 3000
				});
			}
		},
		toggleNotes:function () {
			cola.NotifyTipManager.info({
				message: "系统消息",
				description: "记事本功能尚未发布，请等待!",
				showDuration: 3000
			});

		}
	});
	model.describe("tasks", {
		dataType: {
			properties: {
				firstDate: {
					dataType: "date"
				},
				previousDate: {
					dataType: "date"
				}

			}
		},
		provider: {
			url: "/data/tasks.json",
			parameter: {
				keyword: "{{keyword}}"
			},
			pageSize: 5,
			response: function (self, arg) {

			}
		}
	});
	model.describe("menus", {
		provider: {
			url: "/menus"
		}
	});
	model.describe("news", {
		provider: {
			url: "/data/menu.json"
		}
	});


	model.widgetConfig({
		taskTable: {
			bind: "item in tasks", showHeader: true,
			columns: [
				{
					caption: "标题", property: "businessTaskId",
					template: "link", align: "center"
				},
				{caption: "密级", bind: "item.businessType"},
				{caption: "发件人", property: "branchName"},
			//	{caption: "紧急程度", template: "priority"},
				// {caption: "客户等级", property: "businessLevel"},
				{caption: "发件时间", bind: "formatDate(item.firstDate,'yy-MM-dd hh:mm')"}
			//	{caption: "前次核保处理时间", bind: "formatDate(item.previousDate,'yy-MM-dd hh:mm')"},
			//	{caption: "前次核保处理人", property: "previousAssignee"}
			]
		}
	})

	$("#userStatus").popup({
		hoverable: true,
		on: 'hover', position: 'bottom center',
		delay: {
			show: 300, hide: 800
		}
	});


	model.set("time", new XDate(new Date()).toString("hh:mm"));

	setInterval(function () {
		model.set("time", new XDate(new Date()).toString("hh:mm"));
	}, 1000);

})
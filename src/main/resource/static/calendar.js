window.todos = {};

window.getMyTodoLists = function (month) {
	$.ajax({
		url: "./resource/data/tasks.json",
		async: false,
		success: function (data) {
			for (var i = 0; i < data.length; i++) {
				var todo = data[i];
				var planDate = todo.planDate;
				var d = new XDate(planDate).toString("yyyy-MM-dd");
				if (!todos[d]) {
					todos[d] = [];
				}
				todos[d].push(todo);
			}
		}
	});
	var calendar = cola.widget("calendar");
	var date = calendar.get("date");
	cola.model().set("todos", todos[new XDate(date).toString("yyyy-MM-dd")] || []);
	for (var key in todos) {
		if (todos.hasOwnProperty(key)) {
			var cell = calendar.getDateCellDom(new Date(key));
			cell.addClass("todo");
		}
	}
};

cola(function (model) {
	model.action({
		todoIsEmpty:function (items) {
			if (items && items.entityCount) {
				return false
			}
			return true;
		}
	})
	model.widgetConfig({
		calendar: {
			monthChange: function (self, arg) {
				var m = arg.month + 1;
				var y = arg.year;
				var month = (m <= 9 ? "0" + m : m);
				model.set("month", y + "年" + month + "月");
				getMyTodoLists(y + "-" + month);
			},
			refreshCellDom: function (self, arg) {
				$(arg.cell).removeClass("todo")
			},
			cellClick: function (self, arg) {
				var d = new XDate(arg.date).toString("yyyy-MM-dd");
				model.set("todos", todos[d] || [])
			}
		}
	})
})
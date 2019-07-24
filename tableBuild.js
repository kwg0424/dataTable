// ====================================================================================
// 테이블
// ====================================================================================
(function ($) {
	var pluginName = "tableBuild";
	var _defaultCloneRow = null;

	var _defaults = {
		focus: null,
		count: null,
		changeEvent: false,
		noData: true,
		addItem: null,
		delItem: null,
		delAllItem: null,
		moveUpItem: null,
		moveDnItem: null
	};

	function Plugin(element, options) {
		this.element = element;
		this.options = $.extend({}, _defaults, options);
		this._tableIsDataChanged = false;
		this.init();

		return this;
	}

	Plugin.prototype = {
		init: function () {
			var plugin = this;
			var options = plugin.options;

			// 테이블 행 선택
			if(options.focus) {
				plugin.focus();
			}

			// 테이블 입력 상태(insert, update, delete)
			if(options.changeEvent){
				plugin.addStatus();
				plugin.changeStatus();
			}

			// 테이블 행 추가
			if(options.addItem){
				plugin.defaultCloneRow();
				plugin.addItem(options.addItem);
			}

			// 테이블 options.count가 0이면 '데이터 없음'행 추가
			if(options.noData){
				plugin.noData();
			}

			// 테이블 행 제거
			if(options.delItem){
				plugin.delItem(options.delItem);
			}

			// 테이블 전체 행 제거
			if(options.delAllItem){
				plugin.delAllItem(options.delAllItem);
			}

			// 테이블 항목 위로 이동
			if(options.moveUpItem){
				plugin.moveItem(options.moveUpItem, 'up');
			}

			// 테이블 항목 아래로 이동
			if(options.moveDnItem){
				plugin.moveItem(options.moveDnItem, 'down');
			}

			// 테이블 항목 전체 선택
			if(options.checkAllItem){
				plugin.checkAllItem(options.checkAllItem);
			}

			// 테이블 열 데이터에 쉼표 추가
			if(options.currency){
				plugin.currency(options);
			}
		},
		tableInfo: function (filter) {
			var plugin = this;

			if ($(plugin.element).is('table')) {
				if (filter === undefined)
					return $(plugin.element);
				else
					return $(plugin.element).find(filter);
			}
		},
		defaultCloneRow: function () {
			var plugin = this;

			if(_defaultCloneRow === null){
				var $tbody = plugin.tableInfo('tbody');
				var $tr = $tbody.find('tr:last');
				var $tr_new = $tr.clone(true).show().removeClass();
				$tr_new.find(':input:not(input[type=hidden])').val('');
				$tr_new.find('select option').removeAttr("selected");
				$tr_new.find('select :eq(0)').prop("selected", true);
				$tr_new.find('input[name=status]').val('insert');
				_defaultCloneRow = $tr_new;
			}

			return _defaultCloneRow.clone(true);
		},
		focus: function () {
			var plugin = this;

			var highLight = null;
			if(plugin.options.focus === 'row')
				highLight = 'tr';
			else if(plugin.options.focus === 'cell')
				highLight = 'td';

			var $tbody = plugin.tableInfo('tbody');
			$tbody.on('click', highLight, function() {
				$tbody.find(highLight).removeClass('checked');
				$(this).addClass('checked');
			});
		},
		addStatus: function () {
			var plugin = this;

			var $tbody = plugin.tableInfo('tbody');
			var trList = $tbody.find('tr').get();
			$.each(trList, function (i) {
				var $status = $(this).find('input[name=status]');
				if(!$status.length){
					var isNewRow = '';
					if(i === 0 && plugin.options.count === 0)
						isNewRow = 'insert';
					$(this).append('<input type="hidden" name="status" value="' + isNewRow + '">');
				}
			});
		},
		changeStatus: function () {
			var plugin = this;

			var $tbody = plugin.tableInfo('tbody');
			$tbody.find(':input').change(function(){
				var $tr = $(this).closest('tr');
				if($tr.find('input[name=status]').val() === "")
					$tr.find('input[name=status]').val('update');
				if(!plugin._tableIsDataChanged)
					plugin._tableIsDataChanged = true;
			});
		},
		noData: function(){
			var plugin = this;

			var $tbody = plugin.tableInfo('tbody');
			if($tbody.find('tr').length === 0 && plugin.options.count === 0){
				var columnCount = $tbody.siblings('colgroup').children('col').get().length;
				$tbody.append('<tr><td colspan="' + columnCount + '">데이터 없음</td></tr>');
			}
		},
		addItem: function (options) {
			var plugin = this;

			$(options.button).click(function(){
				var $tbody = plugin.tableInfo('tbody');
				if($tbody.find(options.after).length)
					$tbody.find(options.after).after(plugin.defaultCloneRow());
				else if($tbody.find('tr').length)
					$tbody.find('tr:last').after(plugin.defaultCloneRow());
				else
					$tbody.append(plugin.defaultCloneRow());

				if(options.callback) {
					options.callback();
				}
			});
		},
		delItem: function (options) {
			var plugin = this;

			$(options.button).click(function(){
				var $tbody = plugin.tableInfo('tbody');
				var $tr_checked = $tbody.find('tr.checked');
				if($tr_checked.find('input[name=status]').val() === 'insert'){
					$tr_checked.remove();
				}
				else {
					$tr_checked.hide().find('input[name=status]').val('delete');
				}

				if(options.callback) {
					options.callback();
				}
			});
		},
		delAllItem: function (options) {
			var plugin = this;

			$(options.button).click(function(){
				var $tbody = plugin.tableInfo('tbody');
				var $trList = $tbody.find('tr');
				if($trList.find('input[name=status]').val() === 'insert'){
					$trList.remove();
				}
				else {
					$trList.hide().find('input[name=status]').val('delete');
				}

				if(plugin.options.callback) {
					plugin.options.callback();
				}
			});
		},
		moveItem: function (options, moveTo) {
			var plugin = this;

			$(options.button).click(function(){
				var $tbody = plugin.tableInfo('tbody');
				var $tr = {};
				var $tr_checked = $tbody.find('tr.checked');
				if(moveTo === 'up'){
					$tr = $tr_checked.prev();
					$tr.before($tr_checked);
				}
				else if(moveTo === 'down'){
					$tr = $tr_checked.next();
					$tr.after($tr_checked);
				}

				if($tr.find('input[name=status]').val() !== 'insert')
					$tr.find('input[name=status]').val('update');
				if($tr_checked.find('input[name=status]').val() !== 'insert')
					$tr_checked.find('input[name=status]').val('update');

				if(options.callback) {
					options.callback();
				}
			});
		},
		checkAllItem: function (options) {
			var plugin = this;

			var $table = plugin.tableInfo();
			$table.find(options.button).change(function(){
				$table.find(options.checkBox).prop('checked', $(this).prop('checked'));
			});

			$table.find(options.checkBox).change(function () {
				var flag = true;
				$table = $(this).closest('table');
				var checkboxList = $table.find(options.checkBox).get();
				$.each(checkboxList, function(){
					if(!$(this).prop('checked'))
						flag = false;
				});
				$table.find(options.button).prop('checked', flag);
			});
		},

		currency: function (options) {
			var plugin = this;
			var $table = plugin.tableInfo();

			var columnList;
			if(typeof options.currency === 'string' || typeof options.currency === 'number'){
				if(typeof options.currency === 'string'){
					var currencyList = options.currency.split(',');
					for(var i=0; i<currencyList.length; i++){
						var currency = $table.find('thead th:contains("' + currencyList[i].trim() + '")').index();
						plugin.currency({currency: currency});
					}
				}
				else{
					columnList = $table.children().not('thead').find('tr').find('td:eq("' + options.currency + '")').get();
				}
			}else if(Array.isArray(options.currency)){
				for(var i=0; i<options.currency.length; i++)
					plugin.currency({currency: options.currency[i]});
			}
			else if(typeof options.currency === 'object'){
				columnList = $table.find(options.currency).get();
			}

			$.each(columnList, function () {
				if(/^-?[\d]+$/.test($(this).text()))
					$(this).text(Number($(this).text()).toCurrency());
			});
		}
	};

	// 테이블 빈 행 제거
	$.fn.tableFilterEmptyRow = function (options, callback) {
		var item = '';
		if (options){
			for(var i in options)
				item += ':not(' + options[i] + ')';
		}

		var $tbody = this.find('tbody');
		var trList = $tbody.find('tr').get();
		$.each(trList, function(index){
			var inputList = $(this).find(':input:not(input[type=hidden])' + item).get();
			var isTrInputEmpty = true;
			$.each(inputList, function(){
				if($(this).val() !== '') {
					isTrInputEmpty = false;
				}
			});

			if(isTrInputEmpty)
				$(this).remove();

			if((trList.length - 1) === index){
				if(callback) {
					callback();
				}
			}
		});
	};

	// 테이블 데이터 변경 여부
	$.fn.tableIsDataChanged = function () {
		var plugin = $.data(this, "plugin_" + pluginName);
		return plugin._tableIsDataChanged;
	};

	// 테이블 목록 json 형태 배열로 반환
	$.fn.tableJsonList = function () {
		var dataList = {};
		var data = this.find('tbody :input');
		$.each(data, function () {
			if (dataList[this.name] === undefined){
				dataList[this.name] = this.value.trim();
				dataList[this.name] = [dataList[this.name]];
			}
			else{
				dataList[this.name].push(this.value.trim());
			}
		});

		var objList = [];
		var size = 0;
		$.each(dataList, function (index, value) {
			if (value.length > size)
				size = value.length;
		});

		for (var i = 0; i < size; i++) {
			var obj = {};
			$.each(dataList, function (index, value) {
				obj[index] = value[i];
			});
			objList.push(obj);
		}

		return JSON.stringify(objList);
	};

	$.fn[pluginName] = function (options) {
		var plugin = this;
		return plugin.each(function () {
			if (!$.data(plugin, "plugin_" + pluginName)) {
				$.data(plugin, "plugin_" + pluginName, new Plugin(this, options));
			}
		});
	};

})(jQuery);
var deviceWidth = document.documentElement.clientWidth;
if (deviceWidth > 640) deviceWidth = 640;
document.documentElement.style.fontSize = deviceWidth / 6.4 + 'px';

function getElem(str) {
	return document.querySelector(str);
}

function getAllElem(str) {
	return document.querySelectorAll(str);
}

function getQueryString(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
	var r = window.location.search.substr(1).match(reg);
	if (r != null) return unescape(r[2]);
	return null;
}

function getSelectedText(dom) {
	var node = getElem(dom),
		index = node.selectedIndex;

	return node.options[index].text;
}

function fillUserPage() {

	var user_info = getUserInfo.reader_ache();

	var name = user_info['username'],
		dpt_text = getUserInfo.depart();
	var url_ary,
		portrait_url,
		user_url = user_info['headimgurl'] || user_info['wx_avatar'];

	if (!user_url || user_url == null) {
		return;
	}

	url_ary = user_url.split('/');
	url_ary.pop();
	portrait_url = url_ary.join('/') + '/0';

	getElem('.username').innerText = name;
	getElem('.depart_name').innerText = dpt_text;

	//加载头像
	getElem('.portrait').style.background = 'url(' + portrait_url + ') no-repeat center center';
	getElem('.portrait').style.backgroundSize = '100% 100%';
}

// 当前日期
function getNowFormatDate() {
	var date = new Date();
	var seperator1 = "-";
	var year = date.getFullYear();
	var month = date.getMonth() + 1;
	var strDate = date.getDate();
	if (month >= 1 && month <= 9) {
		month = "0" + month;
	}
	if (strDate >= 0 && strDate <= 9) {
		strDate = "0" + strDate;
	}
	var currentdate = year + seperator1 + month + seperator1 + strDate;
	return currentdate;
}

var getUserInfo = {

	'reader_ache': function reader_ache() {
		var storage_info = localStorage.getItem('wxuserInfo');
		var wxuserInfo = JSON.parse(storage_info);
		if (wxuserInfo == null || !wxuserInfo) {
			alert('获取信息失败');
			return;
		}
		return wxuserInfo;
	},

	'depart': function depart() {
		var param = this.reader_ache(),
			dpt1 = param['dpt1_name'] || '外联集团',
			dpt2 = param['dpt2_name'] || '-';

		return dpt1 + dpt2;
	},

	'avatar': function avatar() {
		var param = this.reader_ache(),
			res = param['headimgurl'] || param['wx_avatar'] || '';

		return res;
	},

	'nickname': function nickname() {
		var param = this.reader_ache(),
			res = param['nickname'] || param['wx_nickname'] || '';

		return res;
	},

	'username': function username() {
		var param = this.reader_ache(),
			res = param['username'] || '-';

		return res;
	},

	'mobile': function mobile() {
		var param = this.reader_ache(),
			res = param['mobile'] || '-';

		return res;
	},

	author: function author() {
		var user_info = localStorage.getItem('wxuserInfo'),
			obj = JSON.parse(user_info);

		if (!user_info || user_info == null) {
			alert('获取信息失败');
			return;
		}

		var author = {},
			uid = 'Bearer ' + obj['openid'];

		author['Authorization'] = uid;
		return author;
	}
};

var ele = {

	'hasClass': function hasClass(ele, cls) {
		cls = cls || '';
		if (cls.replace(/\s/g, '').length == 0) return false; //当cls没有参数时，返回false
		return new RegExp(' ' + cls + ' ').test(' ' + ele.className + ' ');
	},

	'addClass': function addClass(ele, cls) {
		if (!this.hasClass(ele, cls)) {
			ele.className = ele.className == '' ? cls : ele.className + ' ' + cls;
		}
	},

	'removeClass': function removeClass(ele, cls) {
		var newClass = ' ' + ele.className.replace(/[\t\r\n]/g, '') + ' ';
		while (newClass.indexOf(' ' + cls + ' ') >= 0) {
			newClass = newClass.replace(' ' + cls + ' ', ' ');
		}
		ele.className = newClass.replace(/^\s+|\s+$/g, '');
	}
};

var question = {

	'count': 0,
	'response_data': [],
	'submit_resutl': {},

	'render_template': function render_template(index, option, max_val, title_id, content_id) {

		var title,
			opt_content = '';

		if (index >= max_val) {
			var result_ary = this.submit_resutl;
			this.applay_answers(result_ary);
			getElem('#next_question').style.display = 'none';
			return false;
		}

		//遍历选项
		var opt_key;
		var json_opt = JSON.parse(option.options) || '';
		for (var i = 0, len = json_opt.length; i < len; i++) {
			//获得选项属性
			for (var j in json_opt[i]) {
				opt_key = j[0];
				break;
			}
			opt_content += "<li class=\"question-item\" data-todayid='" + option['id'] + "' data-select='" + opt_key + "'><span class=\"code\"> " + opt_key + ". </span> " + json_opt[i][opt_key].content + " </li>";
		}

		title = "<div class=\"cl-primary\">\u4ECA\u65E5\u9898\u76EE(" + (index + 1) + "/" + max_val + ")</div><div class=\"mt-sm font16 bold\"> " + option['question_name'] + " </div>";
		getElem(title_id).innerHTML = title;
		getElem(content_id).innerHTML = opt_content;

		if (index == max_val - 1) {
			getElem('#next_question').innerText = '提交';
		}
	},

	'init_current': function init_current(param) {

		//用户选项
		if (param && param != null) {
			this.submit_resutl[param['key']] = param['val'];
		}

		var ary = this.response_data,
			len = ary.length;

		if (len == 0) {
			alert('没有数据哦');
			return false;
		}

		this.render_template(this.count, ary[this.count], len, '.question-title', '.question-list-contain');
		this.count++;
	},

	'loading_ajax': function loading_ajax() {

		var that = this;
		author = getUserInfo.author();

		loadHandle.show();
		axios.get(router['today_question'], {
			headers: author
		}).then(function(res) {
			var code = res.data.status_code,
				msg = res.data.message;

			loadHandle.hide();
			if (code == 0) {
				var questions = res.data.data.questions;

				that.response_data = questions;
				that.init_current();
			} else {
				alert(msg);
				return false;
			}
		}).catch(function(error) {
			var tip = error.response.data;
			loadHandle.hide();
			alert(tip.message);
		});
	},

	'applay_answers': function applay_answers(param) {

		var obj = {
			'question_answers': param
		};

		var author = getUserInfo.author();

		loadHandle.show();
		axios.post(router['apply_question'], obj, {
			headers: author
		}).then(function(res) {
			var msg = res.data.message,
				code = res.data.status_code;

			loadHandle.hide();
			if (code == 0) {
				alert(msg);
				window.location.href = 'question-result.html';
			} else {
				alert(msg);
				window.location.href = 'answer-center.html';
			}
		}).catch(function(error) {
			var tip = error.response.data;
			loadHandle.hide();
			alert(tip.message);
		});
	},

	'init_history': function init_history(callback) {

		var that = this;
		author = getUserInfo.author();

		loadHandle.show();
		axios.get(router['question_detail'], {
			headers: author
		}).then(function(res) {
			var code = res.data.status_code,
				msg = res.data.message;

			loadHandle.hide();
			if (code == 0) {
				var questions = res.data.data.questions,
					correct_rate = res.data.data.correct_rate;

				if (callback) {
					callback(correct_rate);
				}
				that.build_history_tem(questions);
			} else {
				alert(msg);
				return false;
			}
		}).catch(function(error) {
			var tip = error.response.data;
			loadHandle.hide();
			alert(tip.message);
		});
	},

	'build_history_tem': function build_history_tem(questions) {

		var html = '',
			params = questions;
		for (var i = 0, len = params.length; i < len; i++) {
			var desc = "<ul class=\"list" + params[i].id + "\"><li class=\"cl-primary clearfix result-question-title\"><span class=\"fl font-num\">(" + (i + 1) + "/" + len + ")</span><span class=\"fr cl-red\">\u6B63\u786E\u7B54\u6848 " + params[i].answer + "</span></li>",
				title = "<li class=\"mt font16\">" + params[i].question_name + "</li>",
				opt = JSON.parse(params[i].options);

			var opt_html = '';
			for (var j = 0, opt_len = opt.length; j < opt_len; j++) {
				for (var z in opt[j]) {
					var opt_key = z[0];
					var opt_content = opt[j][opt_key];
					opt_html += "<li class=\"question-item question-item" + opt_key + " " + (opt_key == params[i].user_answer ? 'selected-active' : '') + "\"} ><span class=\"code\">" + opt_key + ".</span><span class=\"text\">" + opt_content['content'] + "</span></li>";
					break;
				}
			}

			html += desc + title + opt_html + '</ul>';
		}
		getElem('.result-question-wrap').innerHTML = html;
	}
};

var loadHandle = {

	'show': function show() {
		getElem('.self-load').style.display = 'block';
	},

	'hide': function hide() {
		setTimeout(function() {
			getElem('.self-load').style.display = 'none';
		}, 100);
	},

	//防抖
	'throttle': function throttle(method, context) {
		clearTimeout(method.tId);
		method.tId = setTimeout(function() {
			method.call(context);
		}, 300);
	}
};

var department = {

	'render_option': function render_option(params, dom) {
		var html = '',
			ary = params,
			res_html = '',
			depart1_str = '<option value="">请选择所属事业部</option>',
			depart2_str = '<option value="">请选择所属部门</option>';

		for (var i = 0, len = ary.length; i < len; i++) {
			html += "<option value=\"" + ary[i].id + "\">" + ary[i].name + "</option>";
		}

		res_html = dom == '#dpt2_id' ? depart2_str + html : depart1_str + html;
		getElem(dom).innerHTML = res_html;
	},

	'get': function get(id, dom) {
		var that = this;
		loadHandle.show();
		axios.get(router['department'], {
			params: {
				'parent_id': id
			}
		}).then(function(res) {
			var code = res.data.status_code,
				msg = res.data.message;

			loadHandle.hide();
			if (code == 0) {
				var depart = res.data.data.departments;
				that.render_option(depart, dom);
			} else {
				alert(msg);
			}
		}).catch(function(error) {
			var tip = error.response.data;
			loadHandle.hide();
			alert(tip.message);
		});
	}
};

var answer_history = {

	'author': function author() {
		return getUserInfo.author();
	},

	'build_temp': function build_temp(params, dom) {
		var html = '',
			obj = params,
			len = obj.length;

		if (len == 0) {
			return false;
			alert('暂无答题历史记录');
		}

		for (var i = 0; i < len; i++) {
			html += "<li class=\"center-item " + (obj[i].correct_rate == null ? 'icon-select_wrong' : 'icon-select_right') + " mt clearfix\"><span class=\"date\">" + obj[i].date_at + "</span><span class=\"" + (obj[i].correct_rate == null ? 'wrong_tips' : '') + " right_rate\">" + (obj[i].correct_rate == null ? '未完成' : '正确率 ' + obj[i].correct_rate + '%') + "</span></li>";
		}

		getElem(dom).innerHTML = html;
	},

	'render_list': function render_list(dom) {
		var that = this,
			token = this.author();

		loadHandle.show();
		axios.get(router['accent_record'], {
			headers: token
		}).then(function(res) {
			var code = res.data.status_code,
				msg = res.data.message;

			loadHandle.hide();
			if (code == 0) {
				var record = res.data.data;
				that.build_temp(record, dom);
			} else {
				alert(msg);
			}
		}).catch(function(error) {
			var tip = error.response.data;
			loadHandle.hide();
			alert(tip.message);
		});
	}

};
const express = require('express');
const router = express.Router();
const validator = require("validator");
const crypto = require("crypto");
/* GET users listing. */
router.post('/', function(req, res, next) {

	let {
		db,
		query,
		body
	} = req;
	let {
		action
	} = query;
	//注册验证 
	if(action == "register") {
		let error = {};
		const {
			account,
			passwd,
			phone,
			email
		} = body;
		if(!account) {
			error["account"] = "帐号不能为空";
		} else if(account.length <= 6 || account.length >= 15) {
			error["account"] = "帐号格式不正确";
		}
		if(!passwd) {
			error["passwd"] = "密码不能为空";
		} else if(passwd.length <= 6 || passwd.length >= 20) {
			error["passwd"] = "密码格式不正确";
		}
		if(!phone) {
			error["phone"] = "请输入手机号";
		} else if(!validator.isMobilePhone(phone, "zh-CN")) {
			error["phone"] = "手机号码格式不正确";
		}
		if(!email) {
			error["eamil"] = "请输入邮箱地址";
		} else if(!validator.isEmail(email)) {
			error["eamil"] = "邮箱地址格式不正确";
		}
		if(Object.keys(error).length > 0) {
			res.json({ //发送错误
				status: 0,
				message: "注册失败",
				data: [],
				error: error
			})
		} else {
			db.collection("user_info").find({ //查询是否有已注册过的信息
				$or: [{
						account: account
					},
					{
						phone: phone
					},
					{
						email: email
					}
				]
			}, function(err, result) {
				if(err) throw err;
				if(result.length > 0) {
					result.map(function(key) { //判断哪些信息重复
						if(key.account == account)
							error["account"] = "该账号已被注册";
						if(key.phone == phone)
							error["phone"] = "该手机号已被使用";
						if(key.email == email)
							error["email"] = "该邮箱已被使用";
					})
					res.json({ //发送错误
						status: 0,
						message: "注册失败",
						data: [],
						error: error
					})
				} else {
					let passwd_m = crypto.createHash('md5').update(passwd).digest('hex');
					//密码加密处理
					db.collection("user_info").insert({
						account: account,
						passwd: passwd_m,
						phone: phone,
						email: email
					}, function() {
						res.json({ //发送成功
							status: 1,
							message: "注册成功",
							data: [{
								account: account,
								passwd: passwd_m,
								phone: phone,
								email: email
							}],
							error: null
						})
					})
				}
			})
		}
	}

	//登录验证
	if(action == "login") {
		let error = {};
		let where = {};
		const {
			account,
			passwd
		} = body;
		if(!account) {
			error["account"] = "帐号不能为空";
		}
		if(!passwd) {
			error["passwd"] = "密码不能为空";
		} else if(passwd.length <= 6 || passwd.length >= 20) {
			error["passwd"] = "密码格式不正确";
		}
		if(validator.isMobilePhone(account, "zh-CN")) { //支持手机号码登陆
			where["phone"] = account;
		} else if(validator.isEmail(account)) { //支持电子邮箱登陆
			where["email"] = account;
		} else {
			where["account"] = account;
		}
		if(Object.keys(error).length > 0) {
			res.json({
				status: 0,
				message: "登录失败",
				data: {},
				error: error
			})
		} else {
			db.collection("user_info").find(where, function(err, result) { //查询是否存在此账号信息
				if(result.length > 0) {
					let passwd_m = crypto.createHash('md5').update(passwd).digest('hex'); //密码加密处理
					if(passwd_m == result[0].passwd) {
						req.session.user = result[0];
						req.session.user.login_status = true;
						delete result[0].passwd;
						res.json({
							status: 1,
							message: "登陆成功",
							data: result,
							error: null
						})
					} else {
						res.json({
							status: 0,
							message: "登陆失败",
							data: {},
							error: "密码错误"
						})
					}
				} else {
					res.json({
						status: 0,
						message: "登陆失败",
						data: {},
						error: "账号不存在"
					})
				}
			})

		}
	}

	//退出登陆
	if(action == "login_out") {
		req.session.user = null;
		res.json({
			status: 1,
			message: "退出成功",
			data: {},
			error: {}
		})
	}

});
router.get("/get_info", function(req, res, next) {
	res.json(req.session.user);
})

module.exports = router;
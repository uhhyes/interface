const express = require('express');
const router = express.Router();
const captcha = require("trek-captcha");
const emailjs = require("emailjs");
const validator = require("validator");
/* GET home page. */
router.get('/', function(req, res, next) {
	const {
		db
	} = req;
	//	res.render('index', {
	//		title: 'Express'
	//	});
});

router.get("/test.html", function(req, res, next) {
	if(req.session.user) {
		res.redirect("/home.html");
	} else {
		next();
	}
})

router.get("/home.html", function(req, res, next) {
	if(!req.session.user) {
		res.redirect("/test.html");
	} else {
		next();
	}
})

//图片验证码
router.get("/verifiy", function(req, res, next) {
	const {
		query,
		session
	} = req;
	const {
		verifiy
	} = query;
	if(session.verifiy == verifiy) {
		res.json({
			status: 1,
			message: "验证成功",
			data: {},
			error: null
		})
	} else {
		res.json({
			status: 0,
			message: "验证失败",
			data: {},
			error: null
		})
	}
})
//生成图片验证码
router.get("/verifiy.gif", function(req, res, next) {
	captcha().then(result => {
		req.session.verifiy = result.token
		res.set('Content-Type', 'image/gif')
		res.end(result.buffer);
	})
})

//发送邮箱验证码
const emailServer = emailjs.server.connect({
	user: "775323417@qq.com",
	password: "ujslukbxdlonbebe",
	host: "smtp.qq.com",
	ssl: true
})
router.get("/send_email", function(req, res, next) {
	console.log("准备")
	const {
		query
	} = req;
	const {
		email,
		type
	} = query;
	if(email) {
		if(!validator.isEmail(email)) {
			console.log("邮箱地址不正确")
			res.json({
				status: 0,
				message: "邮箱地址不正确",
				data: {},
				error: {
					email: "邮箱地址不正确"
				}
			})
			return;
		} else {
			if(type == "register") {
				db.collection("info").find({
					email: email
				}, function(err, result) {
					if(result.length > 0) {
						console.log("当前邮箱已被注册")
						res.json({
							status: 0,
							message: '当前邮箱已被注册',
							data: {},
							error: {
								email: "当前邮箱已被注册"
							}
						})
					} else {
						let setCode_len = function(len) {
							let code = '';
							for(let i = 0; i < len; i++) {
								code += Math.floor(Math.random() * 10)
							}
							return code;
						}
						req.session.email_code = setCode_len(6);
						emailServer.send({
							text: "您的验证码是" + req.session.email_code,
							from: '775323417@qq.com',
							to: email,
							subject: '账号注册验证'
						}, function(err, message) {
							console.log("ok")
							res.json({
								status: 1,
								message: '发送成功',
								data: [],
								error: null
							})
						})
					}
				})
			}
		}
	} else {
		res.json({
			status: 0,
			message: "邮箱不存在",
			data: {},
			error: {
				email: "邮箱不存在"
			}
		})
	}
})

//验证邮箱验证码
router.get("/check_email", function(req, res, next) {
	const {
		query
	} = req;
	const {
		email_code
	} = query;
	if(email_code == req.session.email_code) {
		res.json({
			status: 1,
			message: "验证成功",
			data: {},
			error: null
		})
	} else {
		res.json({
			status: 0,
			message: "验证失败",
			data: {},
			error: {
				email: "验证失败"
			}
		})
	}
})
module.exports = router;
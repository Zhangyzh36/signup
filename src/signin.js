/*
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                            href                                             │
├──────────┬──┬─────────────────────┬─────────────────────┬───────────────────────────┬───────┤
│ protocol │  │        auth         │        host         │           path            │ hash  │
│          │  │                     ├──────────────┬──────┼──────────┬────────────────┤       │
│          │  │                     │   hostname   │ port │ pathname │     search     │       │
│          │  │                     │              │      │          ├─┬──────────────┤       │
│          │  │                     │              │      │          │ │    query     │       │
"  https:   //    user   :   pass   @ sub.host.com : 8080   /p/a/t/h  ?  query=string   #hash "
│          │  │          │          │   hostname   │ port │          │                │       │
│          │  │          │          ├──────────────┴──────┤          │                │       │
│ protocol │  │ username │ password │        host         │          │                │       │
├──────────┴──┼──────────┴──────────┼─────────────────────┤          │                │       │
│   origin    │                     │       origin        │ pathname │     search     │ hash  │
├─────────────┴─────────────────────┴─────────────────────┴──────────┴────────────────┴───────┤
│                                            href                                             │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
*/

var http = require('http');
var path = require('path');
var url = require('url');
var fs = require('fs');
var querystring= require('querystring');
var port = 8000;

var users = [];

var server = http.createServer(function(request, response){
	var username = url.parse(request.url, true).query.username;
	if (request.method == 'GET')
	{
		switch(request.url)
		{
			case '/' || '/index.html' || '/signin.html':
				sendFile(response, 'signin.html');
				break;
			case '/signin.css':
				sendFile(response, 'signin.css');
				break;
			case '/script.js':
				sendFile(response, 'script.js');
				break;
			case '/favicon.ico':
				sendFile(response, 'favicon.jpg');
				break;
			default:
				{
					if (username == "undefined")
						sendFile(response, 'signin.html');
					else
					{
						var index = find_user(username);
						if (index == -1)
							sendFile(response, 'signin.html');
						else
							show_user_info(response, index);
					}
				}
				break;
			
		}
	}
	else if (request.method == 'POST')
	{
		var post_data = "";
		request.on('data', function(chunck){
			post_data += chunck;
		});
		request.on('end', function(){
			var new_user = querystring.parse(post_data);

			var error_info = new Object();
			error_info.username = error_info.stuid = error_info.phone = error_info.email = "";
			var valid = validate(error_info, new_user);

			if (valid)
			{
				users.push(new_user);
				show_user_info(response, users.length - 1);
				console.log(new_user);
			}
			else
				show_error(response, error_info);

		})
	}
}).listen(port);

function sendFile(response, fileName) {
	var extra = path.extname(fileName);
	var type = extra.substr(1, extra.length);
	var content_type = (type == 'jpg' ? 'image/' : 'text/');
	fs.readFile(path.join(__dirname, "../static/" + fileName), (error, file)=>{
		if(error)
		{
			response.writeHead('404', {'Content-Type': content_type + 'plain'} );
			response.write(error);
		}
		else
		{
			response.writeHead('200', {'Content-Type': content_type + type} );
			response.write(file);
		}
		response.end();
	});
}

function find_user(username)
{
	for (var i = 0; i < users.length; ++i)
		if (users[i].username == username)
			return i;
	return -1;
}

function find_stuid(stuid)
{
	for (var i = 0; i < users.length; ++i)
		if (users[i].stuid == stuid)
			return i;
	return -1;
}

function find_phone(phone)
{
	for (var i = 0; i < users.length; ++i)
		if (users[i].phone == phone)
			return i;
	return -1;
}

function find_email(email)
{
	for (var i = 0; i < users.length; ++i)
		if (users[i].email == email)
			return i;
	return -1;
}

function validate(error_info, new_user)
{
	
	var flag = true;
	var eng_reg = /[a-zA-Z]/;
	var num_reg = /[1-9]/;
	var name_reg = /^[a-zA-Z][a-zA-Z0-9_]{5,17}$/;
	var id_reg = /^[1-9][0-9]{7}$/;
	var phone_reg = /^[1-9][0-9]{10}$/;
	var mail_reg = /^[a-zA-Z_\-]+@(([a-zA-Z_\-])+\.)+[a-zA-Z]{2,4}$/;
	
	if(new_user.username == "") 
	{
		error_info.username += "用户名不能为空";
		flag = false;
	}
	else if(!eng_reg.test(new_user.username[0]))
	{
		error_info.username += "用户名必须以英文字母开头";
		flag = false;
	}
	else if(!name_reg.test(new_user.username))
	{   
		error_info.username += "用户名必须为6~18位英文字母、数字或下划线";
		flag = false;
	}
	
	if(new_user.stuid == "") 
	{
		error_info.stuid += "学号不能为空";
		flag = false;
	}
	else if(!num_reg.test(new_user.stuid[0])) 
	{
		error_info.stuid += "学号必须以非零数字开头";
		flag = false;
	}
	else if(!id_reg.test(new_user.stuid)) 
	{
		error_info.stuid += "学号必须为8位数字";
		flag = false;
	}


	if(new_user.phone == "") 
	{
		error_info.phone += "电话不能为空";
		flag = false;
	}
	else if(!num_reg.test(new_user.phone[0])) 
	{
		error_info.phone += "电话必须以非零数字开头";
		flag = false;
	}
	else if(!phone_reg.test(new_user.phone)) 
	{
		error_info.phone += "电话必须为11位数字";
		flag = false;
	}

	if(new_user.email == "") 
	{
		error_info.email += "邮箱不能为空";
		flag = false;
	}
	else if(!mail_reg.test(new_user.email)) 
	{
		error_info.email += "邮箱格式错误";
		flag = false;
	}

	if (!flag)
		return false;

	if (find_user(new_user.username) != -1)
	{
		error_info.username += (new_user.username + "已经被注册");
		flag = false;
	}
	if (find_stuid(new_user.stuid) != -1)
	{
		error_info.stuid += (new_user.stuid + "已经被注册");
		flag = false;
	}
	if (find_phone(new_user.phone) != -1)
	{
		error_info.phone += (new_user.phone + "已经被注册");
		flag = false;
	}
	if (find_email(new_user.email) != -1)
	{
		error_info.email += (new_user.email + "已经被注册");
		flag = false;
	}

	return flag;
}

function show_user_info(response, index)
{
	response.write("<!DOCTYPE html>");
	response.write("<html>");
	response.write("<head>");
	response.write("<title>详情</title>");
	response.write("<meta http-equiv='Content-Type' content='text/html;charset=UTF-8'>");
	response.write("<link rel='stylesheet' type='text/css' href='signin.css'>");
	response.write("</head>");
	response.write("<body>");
	response.write("<h1>用户信息</h1>");
	response.write("<table>");
	response.write("<tr>");
	response.write("<td>用户名: </td>");
	response.write("<td>" + users[index].username + "</td>");
	response.write("</tr>");
	response.write("<tr>");
	response.write("<td>学号: </td>");
	response.write("<td>" + users[index].stuid + "</td>");
	response.write("</tr>");
	response.write("<tr>");
	response.write("<td>电话: </td>");
	response.write("<td>" + users[index].phone + "</td>");
	response.write("</tr>");
	response.write("<tr>");
	response.write("<td>邮箱: </td>");
	response.write("<td>" + users[index].email + "</td>");
	response.write("</tr>");
	response.write("</table>");
	response.write("<a href='signin.html'>返回</a>")
	response.write("</body>");
	response.write("</html>");
	response.end();
}

function show_error(response, error_info)
{
	response.write("<!DOCTYPE html>");
	response.write("<html>");
	response.write("<head>");
	response.write("<meta http-equiv='Content-Type' content='text/html;charset=UTF-8' />");
	response.write("<title>登录</title>");
	response.write("<link href='signin.css' type='text/css' rel='stylesheet'/>");
	response.write("<script src='script.js' type='text/javascript'></script>");
	response.write("</head>");
	response.write("<body>");
	response.write("<h1>注册</h1>");
	response.write("<form action='/' method='post'>");
	response.write("<p>用户名<br/><input type='text' name='username' id='username'></p>");
	response.write("<div class='error_field'>" + error_info.username + "</div>");
	response.write("<p>学号<br/><input type='text' name='stuid' id='stuid'/></p>");
	response.write("<div class='error_field'>" + error_info.stuid + "</div>");
	response.write("<p>电话<br/><input type='text' name='phone' id='phone'/></p>");
	response.write("<div class='error_field'>" + error_info.phone + "</div>");
	response.write("<p>邮箱<br/><input type='text' name='email' id='email'/></p>");
	response.write("<div class='error_field'>" + error_info.email + "</div>");
	response.write("<input type='reset' value='重置' id='reset_button' />");
	response.write("<input type='submit' value='提交' id='submit_button'/>");
	response.write("</form>");
	response.write("</body>");
	response.write("</html>");
	response.end();
}

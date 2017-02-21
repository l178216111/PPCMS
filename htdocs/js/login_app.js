		$(function(){

				$("#username").bind("blur",function(){
					//alert("1")
					//验证用户名是否已经存在
					var checkUser=/\s///检查首、末位是否有空格
					var user=$(this).val();//获取username
					console.dir(user);
					console.log(checkUser.test(user));
					if(checkUser.test(user)){//如果包含空格
						$('.login-info').css('display','block');
						$('.login-info').html("no blank in username");
					}
				});
		/*		$("#username").bind('focus',function(){
					$('.login-info').html('');//当user重新获取焦点的时候，将提示内容清除掉
					$('.login-info').css('display','none');
			});
		*/			$("#submit").bind("click",function(){
                                   var l = Ladda.create( document.querySelector('#submit') );
                                                l.start();

					var user=$("#username").val();
					var pwd=$("#password").val();
					$.ajax({
						url:'/cgi-bin/PPCMS/verify.pl',
						data:{
						username:user,
						password:pwd
						},//将用户名加密码传到后台
						type:'post',
						dataType:'json',
/*						beforeSend: function(){  
						$('<div id="msg" />').addClass("loading").html("loading...").css("color","#999").appendTo('.sub'); 
						}, 
*/						success:function(data){ 
							if(data.results=='0'){
l.stop();
							window.location.href="approvement.html";
							}else{
							$("#password").val("");
						//	$('.login-info').css('display','block');
						//	$('.login-info').html("LOGIN FAIL");
           l.stop();
							alert("Login Fail")
							}
						},
						error:function(XMLHttpRequest, textStatus, errorThrown) {
							alert("ajax.state："+XMLHttpRequest.readyState);
							alert("ajax.status："+XMLHttpRequest.status);
							alert("ajax："+textStatus);
						}
						})
					})
				$("#reset").bind("click",function(){//点击submit的时候清除掉username和password中的值
				$("#username").val("");
				$("#password").val("");
				});
			})

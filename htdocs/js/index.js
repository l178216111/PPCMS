			$(function(){
			var id=document.cookie;
			var regex=/CGISESSID=(\w*)/;
			if(regex.test(id)){
			  var sid=RegExp.$1;
			$.ajax({  //这里是用jquery自带的ajax发送请求。    
			type:'POST',
			url:'/cgi-bin/PPCMS/login.pl',
			data:sid=sid,
			dataType:'json',
			async:false,
			success:function(data){    //这里的json就是从后台获取的借口。  
				if(data.result!='0'){
				document.getElementById("user").innerHTML=data.result;
				document.getElementById("username").value = data.result;
				username=data.result;
                                }else{
				alert('Pls Login');
                                window.location.href='login.html';
                                }
			}	
			});	
			}else{
			        alert('Pls Login');
                                window.location.href='login.html';

			}
				$("#submit").bind("click",function(){
					var filter=/[a-zA-Z0-9]{7,}/;
					if($("#ecn").val()==""){
					alert("Pls Complete Ecn");
					}else if($("#device").val()==""){
					alert("Pls Complete Device");
					}else if($("#approver").val()==""){
					alert("Pls Complete Approver");
					}else if(filter.test($("#approver").val())){
					alert("Pls use ; or , to split mail address");
					}else if(filter.test($("#carboncopy").val())){
                                        alert("Pls use ; or , to split mail address");
                                        }else if($("#upload").val()==""){
                                        alert("Pls Complet upload");
                                        }else{	
					var upload=$("#file").val(); 
					var form = document.getElementById('form1');  
					var formdata = new FormData(form);  
					console.log($("#upload").val());
					$.ajax({
						url:'/cgi-bin/PPCMS/request.pl',
						data: formdata,//将用户名加密码传到后台
						type:'post',
						dataType:'json',
						async: false,
						cache: false,  
						processData: false,  
						contentType: false,
						success:function(data){ 
							if(data.msg=="1"){
							$("#ecn").val("");
                                			$("#device").val("");
                                			$("#approver").val("");
                                			$("#carboncopy").val("");
                                			$("#upload").val("");
							alert("Your Request Has Been Submited")
							}else{
							alert(data.msg);}
						},
						error:function(XMLHttpRequest, textStatus, errorThrown) {
							alert("ajax.state："+XMLHttpRequest.readyState);
							alert("ajax.status："+XMLHttpRequest.status);
							alert("ajax："+textStatus);
						}
						})
					}
				});
				$("#reset").bind("click",function(){//点击submit的时候清除掉username和password中的值
				$("#ecn").val("");
				$("#device").val("");
				$("#approver").val("");
				$("#carboncopy").val("");
				$("#upload").val("");
			});
		})
			

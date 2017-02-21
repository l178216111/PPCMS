			$(function(){
                        var id=document.cookie;
                        var regex=/CGISESSID=(\w*)/;
                        if(regex.test(id)){
                          var   sid=RegExp.$1;
                        $.ajax({  //这里是用jquery自带的ajax发送请求。    
                        type:'POST',
                        url:'/cgi-bin/PPCMS/login.pl',
                        data:{sid:sid},
                        dataType:'json',
                        async:false,    
                        success:function(data){    //这里的json就是从后台获取的借口。  
                                if(data.result!='0'){
                                document.getElementById("user").innerHTML=data.result;
                                var username=data.result;
  					$.ajax({
                                                url:'/cgi-bin/PPCMS/myapprovement.pl',
                                                type:'POST',
                                                data:{user:username},
                                                dataType:'json',
						beforeSend:function(){ 
                                                loading('show');
                                                },
                                                success:function(data){ 
						loading('hide');
                     for (var i = 0; i < data.length; i++) {
                                                  var status_color;
                                                        if (data[i].pstatus=="Approved"){
                                                                status_color="#ADFF2F"; 
                                                        }else if(data[i].pstatus=="Rejected"){
                                                                status_color="#F08080";
                                                        }else{
                                                                status_color="#FFF68F";
                                                        }
                                                        if(data[i].category==1){
                                                        data[i].category="New Part Release";
                                                        }else{
                                                        data[i].category="PROD Change";
                                                        }
							var approvertable=mytable(data[i].approver);
							var requestertable=mytable(data[i].username);
                                                        $("#mytable").append(
                                                        '<tr>'+
                                                        '<td class="ecn">'+data[i].ecn+'</td>'+
          						'<td style="word-wrap:break-word;word-break:break-all;" ><a href=/cgi-bin/PPCMS/download.pl?filename='+escape(data[i].filepath)+'>'+data[i].device+'</a></td>'+
                                                        '<td class="createtime">'+data[i].createtime+'</td>'+
                                                        '<td style="word-wrap:break-word;word-break:break-all;" >'+data[i].platform+'</td>'+
							requestertable+
							'<td  style="background:'+status_color+'" class="status"><a href="#" onclick="pstatus('+"'"+data[i].approved+"'"+",'"+data[i].reject+"'"+')" >'+data[i].pstatus+'</a></td>'+
						        approvertable+
                                                        '<td class="category">'+data[i].category+'</td>'+
                                                        '<td class="operate">'+
                                                        "<button type='button' value='approve' onClick=approve('"+escape(data[i].createtime)+"'"+","+"'"+username+"'"+") class='btn btn-primary'><span>Approve</span></button>"+
                                                        "<button type='button' value='reject' onClick=reject('"+escape(data[i].createtime)+"'"+","+"'"+username+"'"+") class='btn btn-success'><span>&nbsp;Reject&nbsp;</span></button>"+
                                                        '</tr>'
                                                        );
                                                        }
                                                },
                                                error:function(XMLHttpRequest, textStatus, errorThrown) {
                                                }
                                                })

                                }else{  
                                alert('Pls Login');
                                window.location.href='login_app.html';
                                }
                        }       
                        });     
                        }else{
                                alert('Pls Login');
                                window.location.href='login_app.html';
                        }
                       });

			       function reject(ct,user){
					ct=unescape(ct);
					document.getElementById("comm").value="";
         				$("#myModal").modal("toggle");
				 	$("#reject").unbind();
					$("#reject").bind("click",function(){
					var comm=document.getElementById("comm").value;
						if (comm==""){
						alert("Pls Input Comment");
						}else{
						$.ajax({  //这里是用jquery自带的ajax发送请求。    
                        			type:'POST',
                        			url:'/cgi-bin/PPCMS/opeart.pl',
                        			data:{
						createtime:ct,
						user:user,
						opt:"reject",
						comment:comm
						},
                        			dataType:'json',
                        			async:false,    
                        			success:function(data){ 
						   if(data.msg=="1"){
                                                        window.location.href='approvement.html';
                                                        }else{
                                                        alert(data.msg);
                                                        }

						 },
	                                          error:function(XMLHttpRequest, textStatus, errorThrown) {
                                                        alert("ajax.state："+XMLHttpRequest.readyState);
                                                        alert("ajax.status："+XMLHttpRequest.status);
                                                        alert("ajax："+textStatus);
                                                }

						});
						}
					});
                                }
				function approve(ct,user){
					ct=unescape(ct);
				         $("#myapprove").modal("show");
					$("#approve").unbind();
                                        $("#approve").bind("click",function(){
					  $.ajax({  //这里是用jquery自带的ajax发送请求。    
                                                type:'POST',
                                                url:'/cgi-bin/PPCMS/opeart.pl',
                                                data:{
                                                createtime:ct,
                                                user:user,
                                                opt:"approve"
                                                },
                                                dataType:'json',
                                                success:function(data){ 
							if(data.msg=="1"){
							window.location.href='approvement.html';
							}else{
							alert(data.msg);
							}
						},
	                                                error:function(XMLHttpRequest, textStatus, errorThrown) {
                                                        alert("ajax.state："+XMLHttpRequest.readyState);
                                                        alert("ajax.status："+XMLHttpRequest.status);
                                                        alert("ajax："+textStatus);
                                                }
                                                });
                  			 });
				}
				function sea(uid){
					 $.ajax({  //这里是用jquery自带的ajax发送请求。    
                                                type:'POST',
                                                url:'/cgi-bin/PPCMS/search.pl',
                                                data:{
						uid:uid
                                                },
                                                dataType:'json',
						beforeSend:function(){ 
	    loading('show');
       						},
                                                success:function(data){ 
					 document.getElementById("modal-phone").innerHTML='Phone:   '+data.phone;
                                         document.getElementById("modal-name").innerHTML='Name: '+data.name;
                                         document.getElementById("modal-mail").innerHTML='Mail:     '+data.mail;
                                         document.getElementById("modal-part").innerHTML='Department:'+data.department;
						loading('hide');
					$("#mymodal").modal("toggle")
                                                }
                                                });
	
				}
function pstatus(appov,rejec){
 document.getElementById("modal-approver").innerHTML='Approver:   '+appov;
 document.getElementById("modal-rejectter").innerHTML='Rejecter: '+rejec;
  $("#mystatus").modal("toggle")
}
				function mytable(uid){
					         myapprover=new Array();
                                                        myapprover=uid.split(/,|;/);
                                                        var approvertable='<td style="word-wrap:break-word;word-break:break-all;">';
                                                        for(var x=0;x<myapprover.length;x++){
							if(myapprover[x]!=""){	
                                                        if (x==0){
                                                        approvertable+='<a href="#" onclick="sea('+"'"+myapprover[x]+"'"+')" >'+myapprover[x]+'</a>';
                                                        }else{
                                                        approvertable+='<span>,</span><a href="#" onclick="sea('+"'"+myapprover[x]+"'"+')" >'+myapprover[x]+'</a>';
                                                        }       }
                                                        }
                                                        approvertable+='</td>';
					return approvertable;
				}
function  loading (opt){
if (opt =='show'){
var height=$(window).height()/2;
$('#loading').css({'left':'50%','top':height});
$('#loading').show();
}
else if (opt == 'hide'){
$('#loading').hide();
}
}


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
                                                url:'/cgi-bin/PPCMS/myrequest.pl',
                                                data:{
                                                user:username
                                                },//将用户名加密码传到后台
                                                type:'post',
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
                                                        }else if(data[i].pstatus=="Canceled"){
                                                                status_color="#DA70D6";
                                                        }else{
                                                                status_color="#FFF68F";
                                                        }

                                                        if(data[i].category==1){
                                                        data[i].category="New Part Release";
                                                        }else{
                                                        data[i].category="PROD Change";
                                                        }
							var approvertable=mytable(data[i].approver);
                                                        $("#mytable").append(
                                                        '<tr>'+
                                                        '<td class="ecn">'+data[i].ecn+'</td>'+
							'<td style="word-wrap:break-word;word-break:break-all;" ><a href=/cgi-bin/PPCMS/download.pl?filename='+escape(data[i].filepath)+'>'+data[i].device+'</a></td>'+
                                                        '<td class="createtime">'+data[i].createtime+'</td>'+
                                                        '<td style="word-wrap:break-word;word-break:break-all;">'+data[i].platform+'</td>'+
'<td  style="background:'+status_color+'" class="status"><a href="#" onclick="pstatus('+"'"+escape(data[i].approved)+"'"+",'"+escape(data[i].reject)+"'"+",'"+escape(data[i].comment)+"'"+",'"+escape(data[i].endtime)+"'"+')" >'+data[i].pstatus+'</a></td>'+
						        approvertable+
                                                        '<td class="category">'+data[i].category+'</td>'+
							'<td class="operate">'+
							"<button type='button' value='cancel' onClick=cancel('"+escape(data[i].createtime)+"'"+","+"'"+username+"'"+") class='btn btn-primary'>Cancel</button>"+
							'</td>'+
                                                        '</tr>'
                                                        );
                                                        }
                                                },
                                                error:function(XMLHttpRequest, textStatus, errorThrown) {
                                                }
                                                });

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
				for(var i=0;i<$(".approver").children("a").length;i++){
					$(".approver").children("a").eq(i).click(function(){
						$("#mymodal").modal("toggle");
					});
				}
			})
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
					$("#mymodal").modal("show");
                                                }
                                                });
	
				}
function pstatus(appov,rejec,comm,endtime){
appov=unescape(appov);
rejec=unescape(rejec);
comm=unescape(comm);
endtime=unescape(endtime);
 document.getElementById("modal-approver").innerHTML='Approver:   '+appov;
 document.getElementById("modal-rejectter").innerHTML='Rejecter: '+rejec;
document.getElementById("modal-comm").innerHTML='Comment: '+comm;
document.getElementById("modal-time").innerHTML='Endtime: '+endtime;
 $("#mystatus").modal("show");
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
                                function cancel(ct,user){
                                        ct=unescape(ct);
                                         $("#mycancel").modal("toggle");
                                        $("#Confirm").unbind();
                                        $("#Confirm").bind("click",function(){
                                        var comm=document.getElementById("comm").value;
                                                if (comm==""){
                                                alert("Pls Input Comment");
                                                }else{
                                          $.ajax({  //这里是用jquery自带的ajax发送请求。    
                                                type:'POST',
                                                url:'/cgi-bin/PPCMS/cancel.pl',
                                                data:{
                                                createtime:ct,
                                                user:user,
                                                opt:"Canceled",
						comment:comm
                                                },
                                                dataType:'json',
                                                success:function(data){
                                                        if(data.msg=="1"){
                                                        window.location.href='myrequest.html';
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


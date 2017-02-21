$(function(){
 			var button= Ladda.create(document.querySelector('#submt'));
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
				$("#submt").bind("click",function(){
					button.start();
					var form = document.getElementById('form1');  
					var formdata = new FormData(form); 
					var tb=document.getElementById('mytable');
                                        var rowNum=tb.rows.length;
                                     	for (i=1;i<rowNum;i++)
     					{		
         					tb.deleteRow(i);
         					rowNum=rowNum-1;
         					i=i-1;
					}
					$.ajax({
						url:'/cgi-bin/PPCMS/query.pl',
						data: formdata,
						type:'post',
						dataType:'json',
						async: true,
						cache: false,  
						processData: false,  
						contentType: false,
						beforeSend:function(){ 
                                                },
						success:function(data){
							if (data == ""){alert("No Records returned");}else{
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
							var approvertable=gentable(data[i].approver);
							var requestertable=gentable(data[i].username);
								if(data[i].category==1){
									data[i].category="New Part Release";
									}else{
									data[i].category="PROD Change";
									}
									$("#mytable").append(
									'<tr>'+
                                                        '<td class="ecn">'+data[i].ecn+'</td>'+
                                                        '<td style="word-wrap:break-word;word-break:break-all;" ><a href=/cgi-bin/PPCMS/download.pl?filename='+escape(data[i].filepath)+'>'+data[i].device+'</a></td>'+
									'<td class="createtime">'+data[i].createtime+'</td>'+
									'<td style="word-wrap:break-word;word-break:break-all;">'+data[i].platform+'</td>'+
									requestertable+
'<td  style="background:'+status_color+'" class="status"><a href="#" onclick="pstatus('+"'"+escape(data[i].approved)+"'"+",'"+escape(data[i].reject)+"'"+",'"+escape(data[i].comment)+"'"+",'"+escape(data[i].endtime)+"'"+')" >'+data[i].pstatus+'</a></td>'+
									approvertable+
									'<td class="category">'+data[i].category+'</td>'+
									'</tr>'
									);
								}
							}
      button.stop();
						},
						error:function(XMLHttpRequest, textStatus, errorThrown) {
				button.stop();
	alert("connected to database fail");
							alert("ajax.state："+XMLHttpRequest.readyState);
							alert("ajax.status："+XMLHttpRequest.status);
							alert("ajax："+textStatus);
						}
						});
					});
			$("#reset").bind("click",function(){//点击submit的时候清除掉username和password中的值
				$("#ecn").val("");
				$("#device").val("");
				$("#approver").val("");
				$("#requester").val("");
			});
                });

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
				function gentable(uid){
					        myarray=new Array();
                                                        myarry=uid.split(/,|;/);
                                                        apptable='<td style="word-wrap:break-word;word-break:break-all;">';
                                                        for(var z=0;z < myarry.length;z++){
							if (myarry[z]!=""){
                                                        if (z==0){
                                                        apptable+='<a href="#" onclick="sea('+"'"+myarry[z]+"'"+')" >'+myarry[z]+'</a>';
                                                        }else{
                                                        apptable+='<span>,</span><a href="#" onclick="sea('+"'"+myarry[z]+"'"+')" >'+myarry[z]+'</a>';
                                                        }       }
                                                        }
                                                        apptable+='</td>';
					return apptable;
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


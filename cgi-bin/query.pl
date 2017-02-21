#!/usr/bin/perl
use MIME::Lite;
use DBI;
use env_unix;
use Data::Dumper;
use lib_cgi;
use POSIX;
use Time::Local;
use JSON;
use CGI;
use CGI::Session;
use CGI qw(:standard);
use Net::LDAP;
require "/exec/apps/bin/lib/perl5/dbconn.pm";
print "Content-type: application/json\n\n";
my $cgi = new CGI;
my %string;
$string{ecn}=trim($cgi->param("ecn"));
$string{pcategory}=trim($cgi->param("category"));
$string{platform}=$cgi->param("platform");
$string{pstatus}=ucfirst($cgi->param("pstatus"));
$string{device}=trim($cgi->param("device"));
$string{approver}=trim($cgi->param("approver"));
$string{requester}=trim($cgi->param("requester"));
my $sql_approve="select ECN,DEVICE,to_char(createtime,'yyyy-mm-dd hh24:mi:ss'),platform,username,filepath,status,approver,approved,pcomment,pcategory,preject,to_char(endtime,'yyyy-mm-dd hh24:mi:ss') from PPCMS where filepath is not null";
if ($string{ecn} ne ""){
$sql_approve.=" and ecn like '%".$string{ecn}."%'";
}if ($string{pcategory}!=0) {
$sql_approve.=" and pcategory='".$string{pcategory}."'";
}if ($string{platform} ne "all"){
$sql_approve.=" and platform='".$string{platform}."'";
}if ($string{pstatus} ne "All"){
$sql_approve.=" and status='".$string{pstatus}."'";
}if ($string{device} ne ""){
$sql_approve.=" and device like '%".$string{device}."%'";
}if ($string{approver} ne ""){
$sql_approve.=" and approver like '%".$string{approver}."%'";
}if ($string{requester} ne ""){
$sql_approve.=" and username like '%".$string{requester}."%'";
}
$sql_approve.=" order by createtime desc";
sub trim{
my $string=shift;
$string=~ s/\s//g;
$string=uc($string);
return $string;
}
my @Storage;
my $dbh_PMIS1=DBI->connect(&getconn('tjn','probeweb','readwrite'));
#my $sql_approve="select * from PPCMS where approver like \'%".$ARGV[0]."%\'";
my $sth_approve = $dbh_PMIS1->prepare($sql_approve);
$sth_approve->execute();
$sth_approve->bind_columns(
	undef,\$ecn,\$device,\$createtime,\$platform,\$username,\$filepath,\$status,\$approver,\$approved,\$pcomment,\$pcategory,\$preject,\$endtime
);
while ( $sth_approve->fetch() ) {
	my $unit={};
	$unit->{ecn}=$ecn;
	$unit->{device}=$device;
	$unit->{createtime}=$createtime;
	$unit->{filepath}=$filepath;
	$unit->{platform}=$platform;
	$unit->{username}=trim($username);
	$unit->{pstatus}=$status;
	$unit->{approver}=trim($approver);
	$unit->{approved}=trim($approved);
	$unit->{comment}=$pcomment;
	$unit->{category}=$pcategory;
	$unit->{reject}=$preject;
	$unit->{endtime}=$endtime;
	push @Storage,$unit;
}
 $json=to_json(\@Storage);
print $json;

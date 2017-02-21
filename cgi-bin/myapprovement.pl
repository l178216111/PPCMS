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
$user=$cgi->param("user");
my @Storage;
my $dbh_PMIS1=DBI->connect(&getconn('tjn','probeweb','readwrite'));
my $sql_approve="select ECN,DEVICE,to_char(createtime,'yyyy-mm-dd hh24:mi:ss'),platform,username,filepath,status,approver,approved,pcomment,pcategory,preject from PPCMS where status='Approving' and approver like '%".$user."%' order by createtime desc";
#my $sql_approve="select * from PPCMS where approver like \'%".$ARGV[0]."%\'";
my $sth_approve = $dbh_PMIS1->prepare($sql_approve);
$sth_approve->execute();
$sth_approve->bind_columns(
	undef,\$ecn,\$device,\$createtime,\$platform,\$username,\$filepath,\$status,\$approver,\$approved,\$pcomment,\$pcategory,\$preject
);
while ( $sth_approve->fetch() ) {
	my $unit={};
	$unit->{ecn}=$ecn;
	$unit->{device}=$device;
	$unit->{createtime}=$createtime;
	$unit->{filepath}=$filepath;
	$unit->{platform}=$platform;
	$unit->{username}=$username;
	$unit->{pstatus}=$status;
	$unit->{approver}=$approver;
	$unit->{approved}=$approved;
	$unit->{comment}=$pcomment;
	$unit->{category}=$pcategory;
	$unit->{reject}=$preject;
	if($unit->{apporved}!~/$user/){
	push @Storage,$unit;
	}
}
 $json=to_json(\@Storage);
print $json;

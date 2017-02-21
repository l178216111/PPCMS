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
my $pathdir="\/probeeng\/webadmin\/cgi\-bin\/PPCMS\/program\/";
my $currenttime = time();
my $cgi = new CGI;
############parameter###################################################
my %unit;
$unit{ecn}=&trim($cgi->param('ecn'));
$unit{category}=$cgi->param('category');
$unit{platform}=$cgi->param('platform');
$unit{device}=&trim($cgi->param('device'));
$unit{username}=&trim($cgi->param("username"));
$unit{approver}=&trim($cgi->param('approver'));
$unit{carbon_copy}=&trim($cgi->param('carboncopy'));
$unit{attachement}=$cgi->param('upload'); 
$unit{filename}=$unit{attachement};
$unit{filename}=~s/^.*(\\|\/)//;
$unit{filepath}=$pathdir.$unit{filename};
$unit{createtime}=strftime('%F %T',localtime($currenttime));
########################################################################
sub trim{
my $string=shift;
$string=~ s/\n*|\r*|^\s*|\s*$//g;
$string=~ s/\s{2}/\s/g;
$string=uc($string);
return $string;
}
sub add2db{
        my $string_ref=shift;
        my %string=%$string_ref;
	my $ecn=$string{ecn};
	my $device=$string{device};
	my $platform=$string{platform};
	my $createtime=$string{createtime};
	my $username=$string{username};
	my $filepath=$string{filepath};
	my $approver=$string{approver};
	my $category=$string{category};
	my $cc=$string{carboncopy};
	my $dbh_PMIS1=DBI->connect(&getconn('tjn','probeweb','readwrite')) or return $!;
	my $sql_approve=qq{INSERT INTO PPCMS (ECN,DEVICE,PLATFORM,CREATETIME,USERNAME,FILEPATH,APPROVER,STATUS,PCATEGORY,CC) VALUES ('$ecn','$device','$platform',to_date('$createtime','YYYY-MM-DD HH24:MI:SS'),'$username','$filepath','$approver','Approving','$category','$cc')};
	my $sth_approve = $dbh_PMIS1->prepare($sql_approve) or return $!;
	$sth_approve->execute() or return $@;
	$dbh_PMIS1->disconnect() or return $@;
return 1;
}
sub get_mail{
	my $mail_add=shift;
	$mail_add=~ s/\s//g;
	my $mail_free;
	my @mail_grp=split(/,|;/,$mail_add);
	foreach my $mail_individ(@mail_grp){
		next if $mail_individ=~/@/;
		$mail_individ.='@freescale.com,';
		$mail_free.=$mail_individ;
		}
#	print "address=$mail_free\n";
	return $mail_free;
}
#&get_mail($ARGV[0]);
#exit;
sub upload{
	my $string_ref=shift;
	my %string=%$string_ref;
	my $file=$string{attachement};
	my $filepath=$string{filepath};
	my $filename=$string{filename};
	if ($file eq "\s"){
		return "$file no file get";
	}
	$filename=~ /.*\.(.*)/;
	if ($1 eq "exe"){
		return "no support file format";
	}
		
	if (-f $filepath){
		return "$filename has exist";
		}
	open(OUTFILE,">$filepath")|| return "$filepath".$!;
	binmode(OUTFILE);
	while(my $bytesread=read($file,my $buffer,1024)){
		print OUTFILE $buffer;
		}	
	close(OUTFILE);
	return '1';
	}
sub send_mail{
	my $string_ref=shift;
	my %string=%$string_ref;
	my $filename=$string{filename};
	my $approver=$string{approver};
	my $carbon_copy=$string{carbon_copy};
	my $ecn=$string{ecn};
	my $device=$string{device};
	my $platform=$string{platform};
	my $category=$string{category};
	if ($category eq 1){
		$category="New Part";
	}else{
		$category="Prod Change";
	}
	if( $approver eq ""){
	return "pls input approver";
	}
	$approver=&get_mail($string{approver});
        $carbon_copy=&get_mail($string{username}.",".$string{carbon_copy});
	$msg = MIME::Lite->new(
		From => 'PPCMS system',
		To => "$approver",
		Cc => "$carbon_copy",
		Type => 'multipart/mixed',
		Subject => "PPCMS-$category-$device"
		);
		$msg->attach(
		Type => 'TEXT',
		Data => "Hello:\n\n".
			"Your approval is required for this \n\n".
			"Category: $category\n".
			"ECN Nbr: $ecn\n".
			"Affect Device: $device\n".
			"Platform: $platform\n\n".
			"Please review with attachement and respond with: http://zch01app04v.ap.freescale.net/PPCMS/login_app.html\n".
			"-Approve\n".
			"-Reject\n\n\n".
			"This is an automatic email sent by the PPCMS system, please do not reply."
	);
	# Attachment
	$msg->attach(
		Type => 'auto',
		Path => "$pathdir"."$filename",
		Filename => "$filename",
		Disposition => 'attachment'
	);
	$msg->send or return $@;
}
#########main process#######################################
my %output;
 $output{msg}=&upload(\%unit);
#$output{msg}=1;
if ($output{msg}==1){
	$output{msg}=&add2db(\%unit);
	if($output{msg}==1){
		$output{msg}=&send_mail(\%unit);
	}	
}
my $json=to_json(\%output);
print "$json";
###########################################################

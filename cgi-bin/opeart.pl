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
my %input;
my $time=strftime('%F %T',localtime(time()));
$input{createtime}=$cgi->param("createtime");
$input{comment}=$cgi->param("comment");
$input{comment}=~ s/(\')/\'$1/g;
$input{user}=uc($cgi->param("user"));
$input{opt}=$cgi->param("opt");
#$input{createtime}='2016-02-04 08:50:46';
#$input{comment}=$cgi->param("comment");
#$input{user}='B44697';
#$input{opt}='rejected';

sub update{
my $string_ref=shift;
my %input=%$string_ref;
my $dbh_PMIS1=DBI->connect(&getconn('tjn','probeweb','readwrite'));
my $sql_approve="select ecn,username,approver,approved,CC,PLATFORM,DEVICE,pcategory from PPCMS where status='Approving' and createtime=to_date(\'".$input{createtime}."',\'yyyy-mm-dd hh24:mi:ss\')";
my $sth_approve = $dbh_PMIS1->prepare($sql_approve);
$sth_approve->execute();
$sth_approve->bind_columns(
	undef,\$ecn,\$username,\$approver,\$approved,\$cc,\$platform,\$device,\$pcategory
);
my %unit;
while ( $sth_approve->fetch() ) {
	$unit{ecn}=$ecn;
	$unit{device}=$device;
	$unit{platform}=$platform;
	$unit{username}=$username;
	$unit{approver}=$approver;
	$unit{approved}=$approved;
	$unit{cc}=$cc;
	$unit{category}=$pcategory;
}
#print Dumper(\%unit);
my $user=$input{user};
if ($unit{approved}!~ /$user/){
my @approver=split(/;|,/,$unit{approver});
my @approved=split(/;|,/,$unit{approved});
push @approved,$input{user};
#print @approved;
@approver=sort(@approver);
#print @approver;
@approved=sort(@approved);
$approved=join(";",@approved);
#print $approved;
my $sql_update;
#print &compare(\@approver,\@approved);
if ($input{opt} eq "approve"){
	if (&compare(\@approver,\@approved)==1){
		$sql_update="UPDATE PPCMS set approved='".$approved."',status='Approved',endtime=to_date('$time','YYYY-MM-DD HH24:MI:SS') where createtime=to_date(\'".$input{createtime}."',\'yyyy-mm-dd hh24:mi:ss\')"; 
		&send_mail(\%unit,'Approved');
		}else{
		$sql_update="UPDATE PPCMS set approved='".$approved."' where createtime=to_date(\'".$input{createtime}."',\'yyyy-mm-dd hh24:mi:ss\')"; 
		}
}else{
	$sql_update="UPDATE PPCMS set status='Rejected',preject='".$input{user}."',pcomment='".$input{comment}."',endtime=to_date('$time','YYYY-MM-DD HH24:MI:SS') where createtime=to_date(\'".$input{createtime}."',\'yyyy-mm-dd hh24:mi:ss\')"; 
         &send_mail(\%unit,'Rejected',$input{comment});
}
my $sth_update= $dbh_PMIS1->prepare($sql_update) or return $!;
$sth_update->execute() or return $!;
$dbh_PMIS1->disconnect() or return $!;
return 1;
}else{
return "You Had Opearated";
}
}
sub compare()
{
        my $flag=0;
        my ($first,$second)=@_;
        if (@$first==@$second) # the number of the array , don't use length() 
        {
                for(my $i=0;$i<@$first;$i++)
                {
                        if($first[$i] ne $second[$i])
                        {
                                $flag=1;
                        }
                }
        }
        else
        {
                $flag=1;
        }
        if( $flag==1)
        {
		return 0;
        }
        else
        {
		return 1;
        }
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
#       print "address=$mail_free\n";
        return $mail_free;
}
sub send_mail{
        my $string_ref=shift;
	my $opt=shift;
	my $comment=shift;
	if ($comment ne "")
	{
		$comment="Reject Comment:$comment\n\n";
	}else{
		$comment="\n";
	}
        my %string=%$string_ref;
        my $approver=$string{approver};
        my $carbon_copy=$string{cc};
        my $ecn=$string{ecn};
        my $device=$string{device};
        my $platform=$string{platform};
	my $category=$string{category};
	if ($category eq "1")
	{
        	$category="New Part ";
	}else 
	{
        $category="Prod Change";
        }
        $approver=&get_mail($string{username});
        $carbon_copy=&get_mail($string{approver}.",".$string{cc});
        $msg = MIME::Lite->new(
                From => 'PPCMS system',
                To => "$approver",
                Cc => "$carbon_copy",
                Type => 'multipart/mixed',
                Subject => "$opt!!!PPCMS-$category-$device"
                );
                $msg->attach(
                Type => 'TEXT',
                Data => "Hello:\n\n".
                        "Your approval has been $opt for this \n\n".
			"Category: $category\n".
                        "ECN Nbr: $ecn\n".
                        "Affect Device: $device\n".
                        "Platform: $platform\n".
			$comment.
                        "Please review the with: http://zch01app04v.ap.freescale.net/PPCMS/login.html\n\n".
                        "This is an automatic email sent by the PPCMS system, please do not reply."
        );
        $msg->send or return $@;
}
my %output;
$output{msg}=&update(\%input);
my $json=to_json(\%output);
print $json;

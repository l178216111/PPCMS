#!/usr/local/bin/perl
use Time::Local;
use JSON; 
use CGI;
use CGI::Session;
use CGI qw(:standard);
print "Content-type: application/json\n\n";
my $cgi=new CGI;
my $id=$cgi->param('sid');
$id=~ s/CGISESSID=//g;
my %output;
my $session=CGI::Session->load("driver:db_file", $id,{Directory=>'/cgisession/PS'});
#my $session=CGI::Session->load("$id");
    if ( $session->is_expired or $session->is_empty ) {
	$output{result}='0';
    }else{
	$output{result}=$session->param("user");
	}
my $json=to_json(\%output);
print $json;

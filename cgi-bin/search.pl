#!/usr/local/bin/perl
use Net::LDAP;
use JSON;
use CGI;
use Data::Dumper;
print "Content-type: application/json\n\n";
my $cgi=new CGI;
my $uid=$cgi->param('uid');
my $ldaps_url ='ldaps://fsl-ids.freescale.net:636';
my $base = "ou=people,ou=intranet,dc=motorola,dc=com";
my $attributes = ["uid","department","cn","telephoneNumber","mail"];
my $service_dn ="cn=tjnprobe_srvc_acct,ou=application users,ou=applications,ou=intranet,dc=motorola,dc=com";
my $service_pwd ="ProbeAppsWeb01#";
$ldap = Net::LDAP->new( $ldaps_url ) or die "$@";
$mesg = $ldap->bind( $service_dn, password => $service_pwd );
$mesg->code && die $mesg->error;
$results = $ldap->search( base  =>$base,
                       filter =>"(uid=$uid)",
                       attrs =>$attributes
                     );
@msg=$results->entries;
my %output;
foreach my $search(@msg){
 $output{department}=$search->get_value('department');
 $output{name}=$search->get_value('cn');
 $output{phone}=$search->get_value('telephoneNumber');
  $output{mail}=$search->get_value('mail');
}
$mesg=$ldap->unbind;
my $json=to_json(\%output);
print $json;

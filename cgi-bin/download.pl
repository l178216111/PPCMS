#!/usr/local/bin/perl
use File::Basename;
use File::stat;
use CGI;
use URI::Escape;
my $html= new CGI;
my $pathdir="\/probeeng\/webadmin\/cgi\-bin\/PPCMS\/program\/";
my $filename =  $html->param('filename');
$filename=uri_unescape($filename);
#my $filename='BG OUTPUT2.xlsx';
if (-f $filename){
sendFileToBrowser($html,$filename);
}else{
print "Content-type: application/json\n\n";
print "can't locate the filename:$filename";
}
sub sendFileToBrowser {
        my $self        = shift;
        my $zipFilePath = shift;
        my $zipFileName = basename($zipFilePath);
	$zipFileName=~ s/\s//g;
        my $zipSize     = stat($zipFilePath)->size;

        # do the header ourselfs
#       $self->header_type('none');
        print "Content-Type: application/octet-stream\n";
        print "Content-Length: $zipSize\n";
        print "Content-Disposition: attachment; filename=$zipFileName\n\n";
        open( FH, "<$zipFilePath" )
          ||  die       "Could not open $zipFilePath for reading. Exiting.";
        binmode FH;
        binmode STDOUT;
        local $/ = \10240;    # set read blocks to 10k
        print while (<FH>);
        close FH;

        return;
}


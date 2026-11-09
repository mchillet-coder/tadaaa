#!/usr/bin/perl
# Convertit le catalogue Excel Tadaaa en data/catalogue.json (+ data/catalogue.js).
#
# Usage (depuis le dossier site/) :
#   perl outils/xlsx-vers-json.pl ../Tadaaa-catalogue-Paris-200-cadeaux.xlsx
#
# Aucun module à installer : Perl et unzip sont fournis avec macOS.
# Lit les onglets « Catalogue » et « Boutiques Paris ». Les colonnes calculées
# (Budget, Lien suivi) sont lues telles qu'enregistrées par Excel/LibreOffice :
# pensez à enregistrer le fichier après avoir changé l'onglet Réglages.
use strict;
use warnings;
use utf8;
use File::Temp qw(tempdir);
use File::Basename qw(dirname);
use File::Spec;
use JSON::PP;

my $xlsx = shift or die "Usage : perl outils/xlsx-vers-json.pl chemin/vers/catalogue.xlsx\n";
-f $xlsx or die "Fichier introuvable : $xlsx\n";
my $root = File::Spec->rel2abs(File::Spec->catdir(dirname(__FILE__), '..'));
my $tmp  = tempdir(CLEANUP => 1);
system('unzip', '-q', '-o', $xlsx, '-d', $tmp) == 0 or die "unzip a échoué\n";

sub slurp { local $/; open my $f, '<:encoding(UTF-8)', $_[0] or die "$_[0] : $!\n"; my $s = <$f>; close $f; $s }
sub unesc {
  my $s = shift;
  $s =~ s/&lt;/</g; $s =~ s/&gt;/>/g; $s =~ s/&quot;/"/g; $s =~ s/&apos;/'/g;
  $s =~ s/&#(\d+);/chr($1)/ge; $s =~ s/&#x([0-9a-f]+);/chr(hex $1)/gie; $s =~ s/&amp;/&/g;
  $s;
}
sub trim { my $s = shift // ''; $s =~ s/^\s+|\s+$//g; $s }

# --- chaînes partagées
my @ss;
if (-f "$tmp/xl/sharedStrings.xml") {
  my $sx = slurp("$tmp/xl/sharedStrings.xml");
  while ($sx =~ m{<si>(.*?)</si>}gs) {
    my $si = $1; my $t = '';
    $si =~ s{<rPh\b.*?</rPh>}{}gs;
    while ($si =~ m{<t(?:\s[^>]*)?>(.*?)</t>}gs) { $t .= $1 }
    push @ss, unesc($t);
  }
}

# --- onglets : nom -> fichier
my %rel;
my $rels = slurp("$tmp/xl/_rels/workbook.xml.rels");
while ($rels =~ m{<Relationship\b([^>]*)/?>}g) {
  my $a = $1; my ($id) = $a =~ /\bId="([^"]+)"/; my ($t) = $a =~ /\bTarget="([^"]+)"/;
  $t =~ s{^/?xl/}{}; $rel{$id} = $t;
}
my %sheet;
my $wb = slurp("$tmp/xl/workbook.xml");
while ($wb =~ m{<sheet\b([^>]*)/>}g) {
  my $a = $1; my ($n) = $a =~ /\bname="([^"]+)"/; my ($id) = $a =~ /\br:id="([^"]+)"/;
  $sheet{unesc($n)} = "$tmp/xl/$rel{$id}";
}

sub col2n { my $n = 0; $n = $n * 26 + (ord($_) - 64) for split //, shift; $n - 1 }

# Renvoie la liste des lignes (tableaux de cellules) d'un onglet.
sub read_sheet {
  my $name = shift;
  my $file = $sheet{$name} or die "Onglet « $name » introuvable\n";
  my $x = slurp($file);
  my @rows;
  while ($x =~ m{<row\b[^>]*>(.*?)</row>}gs) {
    my $rx = $1; my @cells;
    while ($rx =~ m{<c\b([^>]*?)(?:/>|>(.*?)</c>)}gs) {
      my ($a, $in) = ($1, $2 // '');
      my ($ref) = $a =~ /\br="([A-Z]+)\d+"/; my ($t) = $a =~ /\bt="(\w+)"/; $t //= 'n';
      my $v;
      if ($t eq 'inlineStr') { my $s = ''; $s .= $1 while $in =~ m{<t[^>]*>(.*?)</t>}gs; $v = unesc($s) }
      elsif ($in =~ m{<v>(.*?)</v>}s) { $v = $1; $v = $t eq 's' ? $ss[$v] : unesc($v) }
      $cells[col2n($ref)] = trim($v) if defined $v;
    }
    push @rows, \@cells if grep { defined && $_ ne '' } @cells;
  }
  return @rows;
}

# Transforme les lignes en objets clé -> valeur à partir de la ligne d'en-tête.
sub as_records {
  my ($head, @rows) = @_;
  my @h = map { trim($_) } @$head;
  return map { my $r = $_; +{ map { $h[$_] ne '' ? ($h[$_] => $r->[$_]) : () } 0 .. $#h } } @rows;
}
sub list { [ grep { $_ ne '' } map { trim($_) } split /,/, (shift // '') ] }

# --- boutiques
my %boutiques;
for my $b (as_records(read_sheet('Boutiques Paris'))) {
  my $nom = $b->{'Boutique'} or next;
  next unless $b->{'Site'};
  $boutiques{$nom} = {
    nom            => $nom,
    arrondissement => $b->{'Arrondissement'} // '',
    adresse        => $b->{'Adresse'} // '',
    univers        => $b->{'Univers'} // '',
    site           => $b->{'Site'} // '',
  };
}

# --- catalogue
my @cadeaux;
for my $c (as_records(read_sheet('Catalogue'))) {
  next unless ($c->{'ID'} // '') =~ /^TDA-/;
  my $type = $c->{'Type de boutique'} // '';
  my $occ  = $c->{'Occasion'} // '';
  my @occasions;
  push @occasions, 'Noël'         if $occ =~ /No[eë]l/i;
  push @occasions, 'Anniversaire' if $occ =~ /anniversaire/i;
  # Zones : « paris » = boutique ou atelier physique à Paris,
  #         « en-ligne » = commandable et livré (boutiques parisiennes avec e-shop + enseignes en ligne).
  my @zones;
  push @zones, 'paris'    if $type =~ /parisien/i;
  push @zones, 'en-ligne' if $type =~ /Boutique parisienne|en ligne/i;
  my $prix = $c->{'Prix (€)'};
  $prix = (defined $prix && $prix =~ /^[\d.]+$/) ? 0 + sprintf('%.2f', $prix) : undef;
  push @cadeaux, {
    id           => $c->{'ID'},
    nom          => $c->{'Cadeau'},
    boutique     => $c->{'Boutique'},
    typeBoutique => $type,
    categorie    => $c->{'Catégorie'},
    pourQui      => list($c->{'Pour qui'}),
    univers      => list($c->{'Univers'}),
    occasion     => \@occasions,
    budget       => $c->{'Budget'} || $c->{'Budget estimé'} || '',
    prix         => $prix,
    lienSuivi    => $c->{'Lien suivi'} || $c->{'Lien produit'},
    affiliation  => (($c->{'Rémunération'} // '') =~ /Amazon/ ? JSON::PP::true : JSON::PP::false),
    zones        => \@zones,
  };
}

my $data = {
  source    => (File::Spec->splitpath($xlsx))[2],
  genereLe  => do { my @t = localtime; sprintf '%04d-%02d-%02d', $t[5] + 1900, $t[4] + 1, $t[3] },
  budgets   => ['Moins de 25 €', '25–50 €', '50–100 €', '100–200 €', '200 € et plus'],
  boutiques => \%boutiques,
  cadeaux   => \@cadeaux,
};
my $json = JSON::PP->new->canonical->pretty->encode($data);

mkdir "$root/data";
for (['catalogue.json', $json], ['catalogue.js', "// Fichier généré par outils/xlsx-vers-json.pl : ne pas modifier à la main.\n// Copie de catalogue.json pour ouvrir le site sans serveur (file://).\nwindow.TADAAA_CATALOGUE = $json;\n"]) {
  open my $f, ">:encoding(UTF-8)", "$root/data/$_->[0]" or die $!; print $f $_->[1]; close $f;
}
binmode STDOUT, ':encoding(UTF-8)';
printf "%d cadeaux et %d boutiques écrits dans data/catalogue.json\n", scalar @cadeaux, scalar keys %boutiques;
my $tag = grep { $_->{lienSuivi} =~ /votretag-21/ } @cadeaux;
print "Attention : $tag liens Amazon utilisent encore le tag d'exemple « votretag-21 » (onglet Réglages).\n" if $tag;

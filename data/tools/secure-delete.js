window.TS_DATA=window.TS_DATA||{};
window.TS_DATA["Secure Delete"]=[
{n:'czkawka_gui',t:'GUI',p:'GUI file deduplication and secure-delete utility',s:'Identify duplicate copies of suspect files and securely wipe test artifacts before sharing evidence.',c:'Secure Delete',sub:'',ev:['Disk Image'],oss:true},
{n:'shred',t:'CLI',p:'Overwrite file contents to make recovery harder',s:'Demonstrate secure removal of analyst extracts when sanitizing a workstation after triage.',c:'Secure Delete',sub:'',ev:['Disk Image'],oss:true},
{n:'wipe',t:'CLI',p:'Securely erase files/partitions (multiple passes)',s:'Remove redundant sensitive copies from a lab disk prior to disposal.',c:'Secure Delete',sub:'',ev:['Disk Image'],oss:true},
{n:'sdmem',t:'CLI',p:'Securely wipe memory-backed files / swap',s:'Ensure sensitive decrypted artifacts are not left in swap during analysis.',c:'Secure Delete',sub:'',ev:['Disk Image'],oss:true},
{n:'sfill',t:'CLI',p:'Securely wipe free space on mounted filesystems',s:'Clean free space in a forensic clone after extracting only necessary artifacts.',c:'Secure Delete',sub:'',ev:['Disk Image'],oss:true},
{n:'srm',t:'CLI',p:'Secure remove (overwrite files before unlink)',s:'Remove local copies of decrypted attachments after analysis to reduce residual risk.',c:'Secure Delete',sub:'',ev:['Disk Image'],oss:true},
{n:'czkawka_cli',t:'CLI',p:'Command-line duplicate and empty file finder',s:'',c:'Secure Delete',sub:'',ev:['Disk Image'],oss:true},
{n:'sswap',t:'CLI',p:'Securely wipe swap space',s:'',c:'Secure Delete',sub:'',ev:['Disk Image'],oss:true},
];

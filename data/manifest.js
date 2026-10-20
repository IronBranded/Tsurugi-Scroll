const CAT={
'Imaging':{i:'💾',c:'#c0392b',d:'Forensic disk acquisition'},
'Image Formats':{i:'📦',c:'#e07b39',d:'AFF · EWF · RAW image utilities'},
'Hashing':{i:'#️⃣',c:'#d4aa70',d:'Integrity verification & hash tools'},
'Fuzzy Hashing':{i:'〰️',c:'#a07850',d:'Similarity-based hashing'},
'Mounting':{i:'🔗',c:'#8b4513',d:'Filesystem mounting & encryption'},
'Timeline':{i:'📅',c:'#b8860b',d:'Event reconstruction & super-timelines'},
'Artifacts':{i:'🔍',c:'#cd853f',d:'Browser · Registry · Email · Filesystem'},
'Data Recovery':{i:'🔄',c:'#daa520',d:'Deleted file & partition recovery'},
'Memory':{i:'🧠',c:'#a0522d',d:'RAM acquisition & volatile analysis'},
'Malware':{i:'☠️',c:'#8b1a1a',d:'Binary · PE · Office · PDF malware analysis'},
'Passwords':{i:'🔑',c:'#c87941',d:'Hash cracking & brute-force utilities'},
'Network':{i:'🌐',c:'#7a8c6e',d:'PCAP · Zeek · Wireless · Log analysis'},
'Office & Docs':{i:'📄',c:'#8a7a6a',d:'Office document forensics & CSV tools'},
'Multimedia':{i:'🎬',c:'#b8960c',d:'Graphics · Audio · Video tools'},
'Reporting':{i:'📋',c:'#96a060',d:'Case documentation & evidence reporting'},
'Steganography':{i:'🖼️',c:'#7a6a8a',d:'Image analysis · Stego detection'},
'OSINT':{i:'🕵️',c:'#806878',d:'Email · Social · Web · Dark web intel'},
'AI & Vision':{i:'🤖',c:'#907880',d:'Face recognition · OCR · Object detection'},
'Mobile':{i:'📱',c:'#6a8090',d:'Android · iOS · WhatsApp · Telegram'},
'Cloud':{i:'☁️',c:'#608070',d:'AWS · GCP · Azure cloud forensics'},
'Virtual & Crypto':{i:'🖥️',c:'#a09050',d:'VM · Container · Blockchain forensics'},
'NFC':{i:'📡',c:'#608898',d:'NFC card & MIFARE analysis'},
'Secure Delete':{i:'🗑️',c:'#905050',d:'Wiping & secure removal tools'},
'Diff Tools':{i:'🔀',c:'#8a7050',d:'File & binary comparison tools'},
'Tunnels & Remote':{i:'🔒',c:'#607080',d:'VPN · Proxy · RDP · SSH tunneling'},
'System Tools':{i:'⚙️',c:'#787060',d:'Admin · Terminals · System diagnostics'}
};

// Tab groups for improved navigation
const TAB_GROUPS=[
  {label:'Home',tabs:['__home__']},
  {label:'Acquire',tabs:['Imaging','Image Formats','Hashing','Fuzzy Hashing','Mounting','Memory']},
  {label:'Analyze',tabs:['Timeline','Artifacts','Data Recovery','Malware','Passwords']},
  {label:'Network',tabs:['Network','OSINT','AI & Vision','Steganography']},
  {label:'Evidence',tabs:['Office & Docs','Multimedia','Reporting','Diff Tools']},
  {label:'Mobile/Cloud',tabs:['Mobile','Cloud','Virtual & Crypto','NFC']},
  {label:'System',tabs:['System Tools','Secure Delete','Tunnels & Remote']},
  {label:'Runbooks',tabs:['__runbooks__']}
];

const SUBCATS={
'Image Formats':['AFF','EWF','RAW'],
'Mounting':['Filesystem','BitLocker','Cloud Storage','Shadow Copy','Virtual Disk'],
'Timeline':['Plaso','Timesketch / TSK'],
'Artifacts':['Apple / Mac','Boot Code','Browser','Email','APFS','BTRFS','FAT','HFS','NTFS','XFS','ZFS','Files','Google Takeout','Jump Lists','Metadata','Office Docs','P2P','Prefetch','Registry','Recycle Bin','Windows Logs'],
'Malware':['PE / ReadPE','Binary / Radare2','Debugger','Decoder','Flash','JavaScript','Network','Office Malware','PDF','Sandbox','AV / Scanner','XOR / Encoding','Other'],
'Passwords':['Offline','Online','Wordlists','Misc'],
'Office & Docs':['CSV','Apps'],
'Multimedia':['Graphics','Sound & Video','Accessories'],
'Network':['Log Visualization','Zeek / Bro','PCAP','Wireless'],
'AI & Vision':['Face Detection / Landmarks','Face Recognition Web Gui','Face Recognition — Knn','Face Encoding / Dataset Prep','Face Dirlist / Video Processing','Object Detection','OCR','Tesseract Training'],
'Mobile':['WhatsApp','Telegram','Android','BlackBerry','iOS','Sysdiagnose (iOS)','SQLite / Backup'],
'OSINT':['General','Email','Network','Phone','Social Media','Tor / Dark Web','Web'],
'Virtual & Crypto':['VM / Container','Cryptocurrency'],
'System Tools':['Misc','Diagnostics','Connectivity','Accessibility']
};

const EV_TYPES=["Disk Image","Memory Dump","PCAP","Registry Hive","Browser Artifacts","Mobile Backup","Log Files","Email","Office Documents"];

// Category → default evidence types for backfill (#13)
const CAT_EV_DEFAULTS={
'OSINT':['Log Files','Email'],
'AI & Vision':['Disk Image','Mobile Backup'],
'Cloud':['Log Files','Disk Image'],
'NFC':[],
'Reporting':[],
'Diff Tools':['Disk Image'],
'Tunnels & Remote':[],
'System Tools':[]
};

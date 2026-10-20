window.TS_DATA=window.TS_DATA||{};
window.TS_DATA["Imaging"]=[
{n:'Cyclone',t:'CLI',p:'Forensic disk imaging',s:'Used to image large drives in parallel. Ideal for quick forensic duplication with integrity verification.',c:'Imaging',sub:'',ev:['Disk Image'],oss:true},
{n:'dc3dd',t:'CLI',p:'Enhanced dd for DFIR with hashing and logging',s:'Acquire disk images with built-in hashing and split logging to maintain chain of custody.',c:'Imaging',sub:'',ev:['Disk Image'],oss:true},
{n:'dcfldd',t:'CLI',p:'Disk imaging with hashing support',s:'Use for imaging when needing multiple hash outputs during acquisition.',c:'Imaging',sub:'',ev:['Disk Image'],oss:true},
{n:'dd',t:'CLI',p:'Standard disk cloning and imaging',s:'Perform raw disk cloning or byte-for-byte copies for low-level forensic preservation.',c:'Imaging',sub:'',ev:['Disk Image'],oss:true},
{n:'dd_rescue',t:'CLI',p:'Recovery-focused disk imaging',s:'Imaging failing drives where read errors are common, preserving as much data as possible.',c:'Imaging',sub:'',ev:['Disk Image'],oss:true},
{n:'ddrescue',t:'CLI',p:'Intelligent data recovery imaging',s:'Recover data from damaged media with automated retry and log tracking.',c:'Imaging',sub:'',ev:['Disk Image'],oss:true},
{n:'DDRescue-GUI',t:'GUI',p:'Frontend for ddrescue operations',s:'Use graphical interface for easier control of recovery tasks and progress tracking.',c:'Imaging',sub:'',ev:['Disk Image'],oss:true},
{n:'ewfacquire',t:'CLI',p:'EWF (EnCase) image acquisition',s:'Capture forensic images in EWF format for EnCase or X-Ways compatibility.',c:'Imaging',sub:'',ev:['Disk Image'],oss:true},
{n:'ewfacquirestream',t:'CLI',p:'Streaming EWF image acquisition',s:'Stream live disk acquisitions directly to a remote storage or evidence server.',c:'Imaging',sub:'',ev:['Disk Image'],oss:true},
{n:'ftkimager',t:'GUI',p:'Disk imaging, file preview, and acquisition',s:'Quickly create forensic images or preview files before acquisition.',c:'Imaging',sub:'',ev:['Disk Image'],oss:false},
{n:'guymager',t:'GUI',p:'Forensic disk imaging with verification',s:'Ideal for fast, multi-threaded imaging with built-in integrity verification.',c:'Imaging',sub:'',ev:['Disk Image'],oss:true},
];

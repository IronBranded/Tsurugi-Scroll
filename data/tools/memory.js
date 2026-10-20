window.TS_DATA=window.TS_DATA||{};
window.TS_DATA["Memory"]=[
{n:'aeskeyfind',t:'CLI',p:'Scan memory dumps for AES key schedules and possible AES keys',s:'Locate AES keys in a RAM capture to decrypt disk volumes or intercepted ciphertext used by the attacker.',c:'Memory',sub:'',ev:['Memory Dump'],oss:true},
{n:'avml',t:'CLI',p:'Acquire volatile memory from Windows systems with minimal footprint',s:'Perform a live memory capture from a suspected compromised host for immediate triage.',c:'Memory',sub:'',ev:['Memory Dump'],oss:true},
{n:'avml-convert',t:'CLI',p:'Convert AVML output into other memory image formats (e.g., raw)',s:'Convert an AVML capture to raw format for analysis in Volatility3 or other tools.',c:'Memory',sub:'',ev:['Memory Dump'],oss:true},
{n:'pypykatz',t:'CLI',p:'Extract credentials, hashes, and tickets from memory or registry hives',s:'Recover NTLM hashes, plaintext credentials, and Kerberos tickets from a memory dump to assess lateral movement capability.',c:'Memory',sub:'',ev:['Memory Dump'],oss:true},
{n:'rsakeyfind',t:'CLI',p:'Search memory images for RSA private keys and parameters',s:'Find private RSA keys in RAM that could decrypt exfiltrated data or enable impersonation.',c:'Memory',sub:'',ev:['Memory Dump'],oss:true},
{n:'Volatility3',t:'CLI',p:'Framework for extracting artifacts from memory images (processes, network, handles, DLLs, etc.)',s:'Use Volatility3 to enumerate kernel objects, list running processes, and extract injected DLLs from a compromised host.',c:'Memory',sub:'',ev:['Memory Dump'],oss:true},
{n:'volshell',t:'CLI',p:'Interactive memory analysis shell for Volatility',s:'Manually inspect suspicious process objects, stack frames, or plugin output during deep-dive analysis.',c:'Memory',sub:'',ev:['Memory Dump'],oss:true},
{n:'WinSuperMem',t:'CLI',p:'Commercial/advanced Windows memory acquisition and analysis tool',s:'Use when standard imaging fails — acquire memory from locked or protected hosts during an active intrusion.',c:'Memory',sub:'',ev:['Memory Dump'],oss:false},
{n:'yarp-memcarver',t:'CLI',p:'Carve structured artifacts from memory images',s:'Recover volatile registry keys, credentials, and small file artifacts from RAM to reconstruct attacker actions.',c:'Memory',sub:'',ev:['Memory Dump'],oss:true},
{n:'vshot',t:'CLI',p:'',s:'',c:'Memory',sub:'',ev:['Memory Dump'],oss:true},
];

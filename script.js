/**
 * WeatherMood — Premium Offline Weather Dashboard
 * ─────────────────────────────────────────────────
 * Architecture:
 *  1. City Dataset          – large offline city DB with timezone + coords
 *  2. Weather Engine        – deterministic realistic weather generator
 *  3. Fuzzy Search Engine   – typo/alias/abbreviation tolerant search
 *  4. Clock Engine          – live local time per city timezone
 *  5. UI Controller         – handles all DOM updates & animations
 *  6. Theme System          – dark / light mode with persistence
 *  7. History Manager       – recent-searches in localStorage
 *  8. Init & Event Binding  – app bootstrap
 */

'use strict';

/* ══════════════════════════════════════════════════════════════
   1. CITY DATASET
   Each city: { name, country, flag, timezone, lat, lon, aliases }
   ══════════════════════════════════════════════════════════════ */
const CITIES = [
  // ── INDIA — METRO CITIES ──────────────────────────────────
  { name:'Bengaluru',         country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:12.97, lon:77.59,  aliases:['bangalore','bengalore','bnglore','bengluru','blr','bang','blore','silicon valley of india'] },
  { name:'Mumbai',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:19.08, lon:72.88,  aliases:['bombay','mumabi','mombai','bom','city of dreams'] },
  { name:'Delhi',             country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:28.61, lon:77.20,  aliases:['new delhi','delhii','del','ndls','newdelhi','ncr'] },
  { name:'Chennai',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:13.08, lon:80.27,  aliases:['madras','chenai','mas','detroit of india'] },
  { name:'Kolkata',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:22.57, lon:88.36,  aliases:['calcutta','kolkatta','ccu','kol','city of joy'] },
  { name:'Hyderabad',         country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:17.38, lon:78.49,  aliases:['hyd','secunderabad','hidrabad','cyberabad','city of pearls'] },
  { name:'Pune',              country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:18.52, lon:73.86,  aliases:['poona','pne','oxford of the east'] },
  { name:'Ahmedabad',         country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:23.03, lon:72.59,  aliases:['amdavad','amd'] },
  // ── INDIA — STATE CAPITALS ────────────────────────────────
  { name:'Jaipur',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:26.91, lon:75.79,  aliases:['pinkcity','jpr','pink city'] },
  { name:'Lucknow',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:26.85, lon:80.95,  aliases:['lko','lakhnau','city of nawabs'] },
  { name:'Chandigarh',        country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:30.73, lon:76.78,  aliases:['chd','the city beautiful'] },
  { name:'Thiruvananthapuram',country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:8.52,  lon:76.94,  aliases:['trivandrum','tvm','trv','kerala capital'] },
  { name:'Kochi',             country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:9.93,  lon:76.26,  aliases:['cochin','koci','cok','queen of arabian sea'] },
  { name:'Bhopal',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:23.26, lon:77.41,  aliases:['bpl','city of lakes','mp capital'] },
  { name:'Nagpur',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:21.15, lon:79.09,  aliases:['ngp','orangecity','orange city','zero mile city'] },
  { name:'Patna',             country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:25.59, lon:85.14,  aliases:['pat','pataliputra','bihar capital'] },
  { name:'Amritsar',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:31.63, lon:74.87,  aliases:['asr','golden temple city'] },
  { name:'Visakhapatnam',     country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:17.69, lon:83.22,  aliases:['vizag','waltair','vtz','city of destiny'] },
  { name:'Surat',             country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:21.17, lon:72.83,  aliases:['srt','silk city','diamond city'] },
  { name:'Vadodara',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:22.31, lon:73.18,  aliases:['baroda','brd'] },
  { name:'Indore',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:22.72, lon:75.86,  aliases:['idr','mini mumbai','heart of india'] },
  { name:'Bhubaneswar',       country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:20.30, lon:85.82,  aliases:['bbsr','bbs','temple city','odisha capital'] },
  { name:'Raipur',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:21.25, lon:81.63,  aliases:['rpr','chhattisgarh capital'] },
  { name:'Ranchi',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:23.34, lon:85.31,  aliases:['rnc','jharkhand capital','city of waterfalls'] },
  { name:'Dehradun',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:30.32, lon:78.03,  aliases:['ddn','uttarakhand capital'] },
  { name:'Shimla',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:31.10, lon:77.17,  aliases:['sml','queen of hills','himachal capital'] },
  { name:'Gangtok',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:27.32, lon:88.61,  aliases:['gtk','sikkim capital'] },
  { name:'Shillong',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:25.56, lon:91.88,  aliases:['shl','scotland of the east','meghalaya capital'] },
  { name:'Aizawl',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:23.73, lon:92.72,  aliases:['azl','mizoram capital'] },
  { name:'Kohima',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:25.67, lon:94.11,  aliases:['kih','nagaland capital'] },
  { name:'Imphal',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:24.81, lon:93.94,  aliases:['imf','manipur capital','jewel of northeast'] },
  { name:'Agartala',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:23.84, lon:91.28,  aliases:['ixa','tripura capital'] },
  { name:'Panaji',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:15.50, lon:73.83,  aliases:['goa','panjim','goi','goa capital'] },
  { name:'Port Blair',        country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:11.67, lon:92.75,  aliases:['ixz','andaman capital'] },
  { name:'Puducherry',        country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:11.93, lon:79.83,  aliases:['pondicherry','pondy','pdy','french riviera of east'] },
  { name:'Leh',               country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:34.17, lon:77.58,  aliases:['lei','ladakh capital','top of the world'] },
  { name:'Jammu',             country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:32.74, lon:74.87,  aliases:['jmu','city of temples'] },
  { name:'Srinagar',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:34.08, lon:74.80,  aliases:['sri','venice of the east','kashmir capital'] },
  { name:'Itanagar',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:27.10, lon:93.62,  aliases:['arunachal capital'] },
  { name:'Dispur',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:26.13, lon:91.77,  aliases:['ghy','guwahati','assam capital','gateway to northeast'] },
  { name:'Daman',             country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:20.39, lon:72.83,  aliases:['dnr','daman and diu'] },
  { name:'Kavaratti',         country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:10.57, lon:72.64,  aliases:['lakshadweep capital'] },
  // ── INDIA — MAJOR TIER-2 & PILGRIM CITIES ────────────────
  { name:'Agra',              country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:27.18, lon:78.01,  aliases:['agr','city of taj','taj city'] },
  { name:'Varanasi',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:25.32, lon:83.01,  aliases:['benaras','banaras','bnr','holy city','kashi','benares'] },
  { name:'Prayagraj',         country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:25.44, lon:81.84,  aliases:['allahabad','alld','sangam city','triveni'] },
  { name:'Kanpur',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:26.45, lon:80.35,  aliases:['cawnpore','knp','leather city'] },
  { name:'Meerut',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:28.98, lon:77.71,  aliases:['mer','sports city'] },
  { name:'Mathura',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:27.49, lon:77.67,  aliases:['mtj','birthplace of krishna','braj'] },
  { name:'Vrindavan',         country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:27.58, lon:77.70,  aliases:['vrndavan','krishna nagari'] },
  { name:'Ayodhya',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:26.79, lon:82.19,  aliases:['awadh','ram janmabhoomi'] },
  { name:'Haridwar',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:29.95, lon:78.16,  aliases:['hardwar','gateway to god'] },
  { name:'Rishikesh',         country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:30.09, lon:78.27,  aliases:['yoga capital of world'] },
  { name:'Mussoorie',         country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:30.45, lon:78.07,  aliases:['queen of hills uttarakhand'] },
  { name:'Nainital',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:29.38, lon:79.46,  aliases:['lake district of india','naini'] },
  { name:'Darjeeling',        country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:27.04, lon:88.26,  aliases:['dj','tea city','queen of hills wb'] },
  { name:'Siliguri',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:26.71, lon:88.43,  aliases:['slg'] },
  { name:'Jamshedpur',        country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:22.80, lon:86.20,  aliases:['jsr','steel city','tata nagar'] },
  { name:'Dhanbad',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:23.80, lon:86.45,  aliases:['dbd','coal capital'] },
  { name:'Bokaro',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:23.67, lon:85.96,  aliases:['bkr'] },
  { name:'Cuttack',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:20.46, lon:85.88,  aliases:['ctk','silver city'] },
  { name:'Rourkela',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:22.22, lon:84.86,  aliases:['rkl'] },
  { name:'Puri',              country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:19.81, lon:85.83,  aliases:['pri','jagannath dham'] },
  { name:'Kozhikode',         country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:11.25, lon:75.78,  aliases:['calicut','ccj','city of spices'] },
  { name:'Thrissur',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:10.52, lon:76.21,  aliases:['trichur','tcr','cultural capital of kerala'] },
  { name:'Kollam',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:8.89,  lon:76.58,  aliases:['quilon','qlm'] },
  { name:'Palakkad',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:10.78, lon:76.65,  aliases:['palghat'] },
  { name:'Kannur',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:11.87, lon:75.37,  aliases:['cannanore'] },
  { name:'Malappuram',        country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:11.07, lon:76.07,  aliases:['mlp'] },
  { name:'Alappuzha',         country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:9.49,  lon:76.33,  aliases:['alleppey','aley','venice of the east kerala'] },
  { name:'Wayanad',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:11.61, lon:76.08,  aliases:['wayand'] },
  { name:'Munnar',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:10.09, lon:77.06,  aliases:['tea country kerala'] },
  { name:'Madurai',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:9.92,  lon:78.12,  aliases:['mdu','temple city'] },
  { name:'Coimbatore',        country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:11.02, lon:76.96,  aliases:['cbe','kovai','manchester of south india'] },
  { name:'Salem',             country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:11.65, lon:78.16,  aliases:['slm'] },
  { name:'Tiruchirappalli',   country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:10.79, lon:78.70,  aliases:['trichy','trich'] },
  { name:'Tirunelveli',       country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:8.73,  lon:77.70,  aliases:['nellai','tvl'] },
  { name:'Vellore',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:12.92, lon:79.13,  aliases:['vel'] },
  { name:'Thanjavur',         country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:10.79, lon:79.14,  aliases:['tanjore','tjv','rice bowl of tn'] },
  { name:'Kanyakumari',       country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:8.08,  lon:77.55,  aliases:['cape comorin','tip of india'] },
  { name:'Rameswaram',        country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:9.29,  lon:79.31,  aliases:['rmm'] },
  { name:'Ooty',              country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:11.41, lon:76.69,  aliases:['ootacamund','queen of hill stations'] },
  { name:'Kodaikanal',        country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:10.24, lon:77.49,  aliases:['kodai','princess of hill stations'] },
  { name:'Mahabalipuram',     country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:12.62, lon:80.19,  aliases:['mamallapuram'] },
  { name:'Mysuru',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:12.30, lon:76.65,  aliases:['mysore','mys','city of palaces'] },
  { name:'Mangaluru',         country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:12.91, lon:74.86,  aliases:['mangalore','ixe'] },
  { name:'Hubli',             country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:15.36, lon:75.12,  aliases:['hubballi','hbl'] },
  { name:'Belagavi',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:15.85, lon:74.50,  aliases:['belgaum','bgm'] },
  { name:'Davanagere',        country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:14.46, lon:75.92,  aliases:['davangere'] },
  { name:'Vijayapura',        country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:16.83, lon:75.72,  aliases:['bijapur'] },
  { name:'Gulbarga',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:17.33, lon:76.82,  aliases:['kalaburagi'] },
  { name:'Tirupati',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:13.63, lon:79.42,  aliases:['tpt','tirumala','spiritual capital of ap'] },
  { name:'Vijayawada',        country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:16.51, lon:80.62,  aliases:['bezwada','vjd'] },
  { name:'Guntur',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:16.30, lon:80.44,  aliases:['gnt'] },
  { name:'Nellore',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:14.43, lon:79.99,  aliases:['nlr'] },
  { name:'Kurnool',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:15.83, lon:78.04,  aliases:['kur'] },
  { name:'Warangal',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:17.97, lon:79.58,  aliases:['wgl','city of warriors'] },
  { name:'Rajkot',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:22.30, lon:70.80,  aliases:['rjt'] },
  { name:'Bhavnagar',         country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:21.77, lon:72.14,  aliases:['bvh','saurashtra'] },
  { name:'Jamnagar',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:22.47, lon:70.07,  aliases:['jam'] },
  { name:'Gandhinagar',       country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:23.22, lon:72.65,  aliases:['gdg','gujarat capital'] },
  { name:'Anand',             country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:22.56, lon:72.95,  aliases:['and','milk capital'] },
  { name:'Nashik',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:19.99, lon:73.79,  aliases:['nsk','wine capital of india'] },
  { name:'Aurangabad',        country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:19.87, lon:75.34,  aliases:['aur','chhatrapati sambhajinagar'] },
  { name:'Solapur',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:17.69, lon:75.90,  aliases:['sur','sholapur'] },
  { name:'Kolhapur',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:16.70, lon:74.24,  aliases:['klp'] },
  { name:'Thane',             country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:19.22, lon:72.97,  aliases:['tha','city of lakes mh'] },
  { name:'Navi Mumbai',       country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:19.04, lon:73.02,  aliases:['new mumbai','nmb'] },
  { name:'Bhilai',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:21.19, lon:81.34,  aliases:['bhi','steel city cg'] },
  { name:'Jabalpur',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:23.18, lon:79.94,  aliases:['jbp','marble city'] },
  { name:'Gwalior',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:26.22, lon:78.18,  aliases:['gwl','city of music'] },
  { name:'Ujjain',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:23.18, lon:75.77,  aliases:['ujn','mahakal city'] },
  { name:'Gurgaon',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:28.46, lon:77.03,  aliases:['gurugram','grg','millennium city'] },
  { name:'Faridabad',         country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:28.41, lon:77.31,  aliases:['fbd'] },
  { name:'Noida',             country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:28.54, lon:77.39,  aliases:['nda'] },
  { name:'Ghaziabad',         country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:28.66, lon:77.43,  aliases:['gbh'] },
  { name:'Aligarh',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:27.88, lon:78.08,  aliases:['ail','city of locks'] },
  { name:'Bareilly',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:28.36, lon:79.41,  aliases:['be','nath nagari'] },
  { name:'Moradabad',         country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:28.84, lon:78.77,  aliases:['mb','brass city'] },
  { name:'Gorakhpur',         country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:26.76, lon:83.37,  aliases:['grk'] },
  { name:'Jodhpur',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:26.30, lon:73.02,  aliases:['jod','blue city','sun city'] },
  { name:'Udaipur',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:24.58, lon:73.68,  aliases:['udp','city of lakes rajasthan'] },
  { name:'Kota',              country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:25.18, lon:75.83,  aliases:['kot','education city'] },
  { name:'Ajmer',             country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:26.45, lon:74.64,  aliases:['ajm','heart of rajasthan'] },
  { name:'Bikaner',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:28.02, lon:73.31,  aliases:['bkn','camel country'] },
  { name:'Jaisalmer',         country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:26.92, lon:70.92,  aliases:['jsl','golden city'] },
  { name:'Pushkar',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:26.49, lon:74.55,  aliases:['holy lake city'] },
  { name:'Mount Abu',         country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:24.59, lon:72.71,  aliases:['hill station rajasthan'] },
  { name:'Ludhiana',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:30.90, lon:75.85,  aliases:['ldh','manchester of north india'] },
  { name:'Jalandhar',         country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:31.33, lon:75.58,  aliases:['jlh','sports city'] },
  { name:'Patiala',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:30.34, lon:76.39,  aliases:['pte','shahi patiala'] },
  { name:'Ambala',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:30.38, lon:76.78,  aliases:['uml'] },
  { name:'Bathinda',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:30.21, lon:74.95,  aliases:['bti'] },
  { name:'Rohtak',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:28.89, lon:76.58,  aliases:['roh'] },
  { name:'Panipat',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:29.39, lon:76.97,  aliases:['pnp','city of weavers'] },
  { name:'Hisar',             country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:29.15, lon:75.72,  aliases:['hsr'] },
  { name:'Karnal',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:29.69, lon:76.99,  aliases:['knl'] },
  { name:'Guwahati',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:26.17, lon:91.75,  aliases:['gwt','ghy','gateway to northeast'] },
  { name:'Dibrugarh',         country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:27.48, lon:94.91,  aliases:['dbr','tea city assam'] },
  { name:'Tezpur',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:26.63, lon:92.80,  aliases:['city of eternal romance'] },
  { name:'Jorhat',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:26.75, lon:94.20,  aliases:['jrh','tea capital'] },
  { name:'Margao',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:15.27, lon:73.96,  aliases:['madgaon','goa south'] },
  { name:'Kovalam',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:8.40,  lon:76.98,  aliases:['kerala beach'] },
  { name:'Varkala',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:8.73,  lon:76.72,  aliases:['cliff beach'] },
  { name:'Dwarka',            country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:22.24, lon:68.97,  aliases:['dwa','city of krishna'] },
  { name:'Durgapur',          country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:23.52, lon:87.32,  aliases:['dup'] },
  { name:'Asansol',           country:'India', flag:'🇮🇳', timezone:'Asia/Kolkata', lat:23.68, lon:86.98,  aliases:['asl'] },
  // ── UK ───────────────────────────────────────────────────
  { name:'London',            country:'United Kingdom', flag:'🇬🇧', timezone:'Europe/London', lat:51.51, lon:-0.13,  aliases:['londn','lndn','lon','england capital','lhr'] },
  { name:'Manchester',        country:'United Kingdom', flag:'🇬🇧', timezone:'Europe/London', lat:53.48, lon:-2.24,  aliases:['man','mancester'] },
  { name:'Birmingham',        country:'United Kingdom', flag:'🇬🇧', timezone:'Europe/London', lat:52.48, lon:-1.89,  aliases:['bham','brumingham'] },
  { name:'Edinburgh',         country:'United Kingdom', flag:'🇬🇧', timezone:'Europe/London', lat:55.95, lon:-3.19,  aliases:['edinburg','scotland capital','edi'] },
  { name:'Glasgow',           country:'United Kingdom', flag:'🇬🇧', timezone:'Europe/London', lat:55.86, lon:-4.25,  aliases:['gla'] },
  { name:'Liverpool',         country:'United Kingdom', flag:'🇬🇧', timezone:'Europe/London', lat:53.41, lon:-2.98,  aliases:['lpl','liverpol','beatles city'] },
  { name:'Leeds',             country:'United Kingdom', flag:'🇬🇧', timezone:'Europe/London', lat:53.80, lon:-1.55,  aliases:['led'] },
  { name:'Bristol',           country:'United Kingdom', flag:'🇬🇧', timezone:'Europe/London', lat:51.45, lon:-2.59,  aliases:['brs'] },
  { name:'Oxford',            country:'United Kingdom', flag:'🇬🇧', timezone:'Europe/London', lat:51.75, lon:-1.26,  aliases:['oxf','city of dreaming spires'] },
  { name:'Cambridge',         country:'United Kingdom', flag:'🇬🇧', timezone:'Europe/London', lat:52.21, lon:0.12,   aliases:['cmb','silicon fen'] },
  { name:'Cardiff',           country:'United Kingdom', flag:'🇬🇧', timezone:'Europe/London', lat:51.48, lon:-3.18,  aliases:['cwl','wales capital'] },
  { name:'Belfast',           country:'United Kingdom', flag:'🇬🇧', timezone:'Europe/London', lat:54.60, lon:-5.93,  aliases:['bfs','northern ireland capital'] },
  { name:'Sheffield',         country:'United Kingdom', flag:'🇬🇧', timezone:'Europe/London', lat:53.38, lon:-1.47,  aliases:['she','steel city uk'] },
  { name:'Newcastle',         country:'United Kingdom', flag:'🇬🇧', timezone:'Europe/London', lat:54.98, lon:-1.61,  aliases:['ncu','geordie city'] },
  // ── USA ──────────────────────────────────────────────────
  { name:'New York City',     country:'United States', flag:'🇺🇸', timezone:'America/New_York',    lat:40.71, lon:-74.01,  aliases:['new york','nyc','ny','newyork','the big apple','gotham','jfk'] },
  { name:'Los Angeles',       country:'United States', flag:'🇺🇸', timezone:'America/Los_Angeles', lat:34.05, lon:-118.24, aliases:['la','lax','losangeles','city of angels','l.a.'] },
  { name:'Chicago',           country:'United States', flag:'🇺🇸', timezone:'America/Chicago',     lat:41.88, lon:-87.63,  aliases:['chi','chitown','windy city','ord'] },
  { name:'Houston',           country:'United States', flag:'🇺🇸', timezone:'America/Chicago',     lat:29.76, lon:-95.37,  aliases:['hou','space city'] },
  { name:'Phoenix',           country:'United States', flag:'🇺🇸', timezone:'America/Phoenix',     lat:33.45, lon:-112.07, aliases:['phx','valley of the sun'] },
  { name:'San Francisco',     country:'United States', flag:'🇺🇸', timezone:'America/Los_Angeles', lat:37.77, lon:-122.42, aliases:['sf','san fran','frisco','sfo'] },
  { name:'Seattle',           country:'United States', flag:'🇺🇸', timezone:'America/Los_Angeles', lat:47.61, lon:-122.33, aliases:['sea','emerald city'] },
  { name:'Miami',             country:'United States', flag:'🇺🇸', timezone:'America/New_York',    lat:25.77, lon:-80.19,  aliases:['mia','magic city'] },
  { name:'Boston',            country:'United States', flag:'🇺🇸', timezone:'America/New_York',    lat:42.36, lon:-71.06,  aliases:['bos','bostn','the hub'] },
  { name:'Denver',            country:'United States', flag:'🇺🇸', timezone:'America/Denver',      lat:39.74, lon:-104.98, aliases:['den','mile high city'] },
  { name:'Las Vegas',         country:'United States', flag:'🇺🇸', timezone:'America/Los_Angeles', lat:36.17, lon:-115.14, aliases:['vegas','sin city','lvs'] },
  { name:'Washington DC',     country:'United States', flag:'🇺🇸', timezone:'America/New_York',    lat:38.90, lon:-77.04,  aliases:['dc','washington','wdc'] },
  { name:'Atlanta',           country:'United States', flag:'🇺🇸', timezone:'America/New_York',    lat:33.75, lon:-84.39,  aliases:['atl'] },
  { name:'Dallas',            country:'United States', flag:'🇺🇸', timezone:'America/Chicago',     lat:32.78, lon:-96.80,  aliases:['dal','dfw','big d'] },
  { name:'San Diego',         country:'United States', flag:'🇺🇸', timezone:'America/Los_Angeles', lat:32.72, lon:-117.16, aliases:['san-diego','sad'] },
  { name:'Portland',          country:'United States', flag:'🇺🇸', timezone:'America/Los_Angeles', lat:45.52, lon:-122.68, aliases:['pdx','rose city'] },
  { name:'Minneapolis',       country:'United States', flag:'🇺🇸', timezone:'America/Chicago',     lat:44.98, lon:-93.27,  aliases:['msp','twin cities'] },
  { name:'New Orleans',       country:'United States', flag:'🇺🇸', timezone:'America/Chicago',     lat:29.95, lon:-90.07,  aliases:['nola','big easy'] },
  { name:'San Antonio',       country:'United States', flag:'🇺🇸', timezone:'America/Chicago',     lat:29.42, lon:-98.49,  aliases:['sat','alamo city'] },
  { name:'Philadelphia',      country:'United States', flag:'🇺🇸', timezone:'America/New_York',    lat:39.95, lon:-75.17,  aliases:['philly','phl'] },
  { name:'San Jose',          country:'United States', flag:'🇺🇸', timezone:'America/Los_Angeles', lat:37.34, lon:-121.89, aliases:['sjc','silicon valley'] },
  { name:'Austin',            country:'United States', flag:'🇺🇸', timezone:'America/Chicago',     lat:30.27, lon:-97.74,  aliases:['aus','live music capital'] },
  { name:'Nashville',         country:'United States', flag:'🇺🇸', timezone:'America/Chicago',     lat:36.17, lon:-86.78,  aliases:['bna','music city'] },
  { name:'Detroit',           country:'United States', flag:'🇺🇸', timezone:'America/Detroit',     lat:42.33, lon:-83.05,  aliases:['dtw','motor city'] },
  { name:'Baltimore',         country:'United States', flag:'🇺🇸', timezone:'America/New_York',    lat:39.29, lon:-76.61,  aliases:['bwi','charm city'] },
  { name:'Memphis',           country:'United States', flag:'🇺🇸', timezone:'America/Chicago',     lat:35.15, lon:-90.05,  aliases:['mem'] },
  { name:'Oklahoma City',     country:'United States', flag:'🇺🇸', timezone:'America/Chicago',     lat:35.47, lon:-97.52,  aliases:['okc'] },
  { name:'Honolulu',          country:'United States', flag:'🇺🇸', timezone:'Pacific/Honolulu',    lat:21.31, lon:-157.86, aliases:['hnl','hawaii','paradise city'] },
  { name:'Anchorage',         country:'United States', flag:'🇺🇸', timezone:'America/Anchorage',   lat:61.22, lon:-149.90, aliases:['anc','alaska'] },
  // ── CANADA ───────────────────────────────────────────────
  { name:'Toronto',           country:'Canada', flag:'🇨🇦', timezone:'America/Toronto',  lat:43.65, lon:-79.38,  aliases:['tor','the6ix','yyz'] },
  { name:'Vancouver',         country:'Canada', flag:'🇨🇦', timezone:'America/Vancouver', lat:49.25, lon:-123.12, aliases:['van','yvr','vancover'] },
  { name:'Montreal',          country:'Canada', flag:'🇨🇦', timezone:'America/Toronto',  lat:45.50, lon:-73.57,  aliases:['mtl','yul'] },
  { name:'Calgary',           country:'Canada', flag:'🇨🇦', timezone:'America/Edmonton', lat:51.05, lon:-114.07, aliases:['yyc','stampede city'] },
  { name:'Ottawa',            country:'Canada', flag:'🇨🇦', timezone:'America/Toronto',  lat:45.42, lon:-75.69,  aliases:['yow','canada capital'] },
  { name:'Edmonton',          country:'Canada', flag:'🇨🇦', timezone:'America/Edmonton', lat:53.54, lon:-113.49, aliases:['yeg','festival city'] },
  { name:'Quebec City',       country:'Canada', flag:'🇨🇦', timezone:'America/Toronto',  lat:46.81, lon:-71.21,  aliases:['yqb','old quebec'] },
  { name:'Winnipeg',          country:'Canada', flag:'🇨🇦', timezone:'America/Winnipeg', lat:49.90, lon:-97.14,  aliases:['ywg'] },
  { name:'Halifax',           country:'Canada', flag:'🇨🇦', timezone:'America/Halifax',  lat:44.65, lon:-63.57,  aliases:['yhz','nova scotia capital'] },
  // ── FRANCE ───────────────────────────────────────────────
  { name:'Paris',             country:'France', flag:'🇫🇷', timezone:'Europe/Paris', lat:48.85, lon:2.35,  aliases:['paree','par','city of light','cdg'] },
  { name:'Lyon',              country:'France', flag:'🇫🇷', timezone:'Europe/Paris', lat:45.75, lon:4.85,  aliases:['lyo'] },
  { name:'Marseille',         country:'France', flag:'🇫🇷', timezone:'Europe/Paris', lat:43.30, lon:5.37,  aliases:['marsielle','mrs'] },
  { name:'Nice',              country:'France', flag:'🇫🇷', timezone:'Europe/Paris', lat:43.71, lon:7.26,  aliases:['nce','french riviera'] },
  { name:'Bordeaux',          country:'France', flag:'🇫🇷', timezone:'Europe/Paris', lat:44.84, lon:-0.58, aliases:['bod','wine capital france'] },
  { name:'Toulouse',          country:'France', flag:'🇫🇷', timezone:'Europe/Paris', lat:43.60, lon:1.44,  aliases:['tls','pink city france'] },
  { name:'Strasbourg',        country:'France', flag:'🇫🇷', timezone:'Europe/Paris', lat:48.58, lon:7.75,  aliases:['sbg'] },
  { name:'Nantes',            country:'France', flag:'🇫🇷', timezone:'Europe/Paris', lat:47.22, lon:-1.55, aliases:['nte'] },
  { name:'Montpellier',       country:'France', flag:'🇫🇷', timezone:'Europe/Paris', lat:43.61, lon:3.88,  aliases:['mpl'] },
  // ── GERMANY ──────────────────────────────────────────────
  { name:'Berlin',            country:'Germany', flag:'🇩🇪', timezone:'Europe/Berlin', lat:52.52, lon:13.40,  aliases:['berln','ber'] },
  { name:'Munich',            country:'Germany', flag:'🇩🇪', timezone:'Europe/Berlin', lat:48.14, lon:11.58,  aliases:['münchen','munchen','muc'] },
  { name:'Hamburg',           country:'Germany', flag:'🇩🇪', timezone:'Europe/Berlin', lat:53.55, lon:10.00,  aliases:['ham','hambrug'] },
  { name:'Frankfurt',         country:'Germany', flag:'🇩🇪', timezone:'Europe/Berlin', lat:50.11, lon:8.68,   aliases:['fra','frankfort'] },
  { name:'Cologne',           country:'Germany', flag:'🇩🇪', timezone:'Europe/Berlin', lat:50.94, lon:6.96,   aliases:['köln','koln','cgn'] },
  { name:'Stuttgart',         country:'Germany', flag:'🇩🇪', timezone:'Europe/Berlin', lat:48.78, lon:9.18,   aliases:['str'] },
  { name:'Düsseldorf',        country:'Germany', flag:'🇩🇪', timezone:'Europe/Berlin', lat:51.22, lon:6.78,   aliases:['dusseldorf','dus'] },
  { name:'Dresden',           country:'Germany', flag:'🇩🇪', timezone:'Europe/Berlin', lat:51.05, lon:13.73,  aliases:['drs'] },
  { name:'Nuremberg',         country:'Germany', flag:'🇩🇪', timezone:'Europe/Berlin', lat:49.45, lon:11.08,  aliases:['nürnberg','nue'] },
  // ── JAPAN ────────────────────────────────────────────────
  { name:'Tokyo',             country:'Japan', flag:'🇯🇵', timezone:'Asia/Tokyo', lat:35.69, lon:139.69, aliases:['tokyoo','tokio','tyo','nrt'] },
  { name:'Osaka',             country:'Japan', flag:'🇯🇵', timezone:'Asia/Tokyo', lat:34.69, lon:135.50, aliases:['oosaka','osak','kix','kitchen of japan'] },
  { name:'Kyoto',             country:'Japan', flag:'🇯🇵', timezone:'Asia/Tokyo', lat:35.01, lon:135.77, aliases:['kioto','kyouto'] },
  { name:'Hiroshima',         country:'Japan', flag:'🇯🇵', timezone:'Asia/Tokyo', lat:34.39, lon:132.45, aliases:['hiroshma','hij','peace city'] },
  { name:'Sapporo',           country:'Japan', flag:'🇯🇵', timezone:'Asia/Tokyo', lat:43.06, lon:141.35, aliases:['saporo','cts'] },
  { name:'Nagoya',            country:'Japan', flag:'🇯🇵', timezone:'Asia/Tokyo', lat:35.18, lon:136.91, aliases:['ngo'] },
  { name:'Yokohama',          country:'Japan', flag:'🇯🇵', timezone:'Asia/Tokyo', lat:35.44, lon:139.64, aliases:['yok'] },
  { name:'Kobe',              country:'Japan', flag:'🇯🇵', timezone:'Asia/Tokyo', lat:34.69, lon:135.20, aliases:['ujb'] },
  { name:'Nara',              country:'Japan', flag:'🇯🇵', timezone:'Asia/Tokyo', lat:34.69, lon:135.83, aliases:['nra','deer city'] },
  { name:'Fukuoka',           country:'Japan', flag:'🇯🇵', timezone:'Asia/Tokyo', lat:33.59, lon:130.40, aliases:['fuk'] },
  { name:'Nagasaki',          country:'Japan', flag:'🇯🇵', timezone:'Asia/Tokyo', lat:32.75, lon:129.87, aliases:['ngs'] },
  { name:'Okinawa',           country:'Japan', flag:'🇯🇵', timezone:'Asia/Tokyo', lat:26.21, lon:127.68, aliases:['oka','hawaii of japan'] },
  // ── CHINA ────────────────────────────────────────────────
  { name:'Beijing',           country:'China', flag:'🇨🇳', timezone:'Asia/Shanghai', lat:39.91, lon:116.39, aliases:['peking','bejing','pek','forbidden city'] },
  { name:'Shanghai',          country:'China', flag:'🇨🇳', timezone:'Asia/Shanghai', lat:31.23, lon:121.47, aliases:['shanghay','pvg'] },
  { name:'Guangzhou',         country:'China', flag:'🇨🇳', timezone:'Asia/Shanghai', lat:23.13, lon:113.26, aliases:['canton','can'] },
  { name:'Shenzhen',          country:'China', flag:'🇨🇳', timezone:'Asia/Shanghai', lat:22.54, lon:114.06, aliases:['szx'] },
  { name:'Chengdu',           country:'China', flag:'🇨🇳', timezone:'Asia/Shanghai', lat:30.66, lon:104.07, aliases:['ctu','panda city'] },
  { name:'Hangzhou',          country:'China', flag:'🇨🇳', timezone:'Asia/Shanghai', lat:30.27, lon:120.15, aliases:['hgh'] },
  { name:'Wuhan',             country:'China', flag:'🇨🇳', timezone:'Asia/Shanghai', lat:30.59, lon:114.30, aliases:['wuh'] },
  { name:'Xian',              country:'China', flag:'🇨🇳', timezone:'Asia/Shanghai', lat:34.34, lon:108.94, aliases:["xi'an","sia","ancient capital china"] },
  { name:'Chongqing',         country:'China', flag:'🇨🇳', timezone:'Asia/Shanghai', lat:29.56, lon:106.55, aliases:['ckg','mountain city'] },
  { name:'Tianjin',           country:'China', flag:'🇨🇳', timezone:'Asia/Shanghai', lat:39.13, lon:117.20, aliases:['tsn'] },
  { name:'Nanjing',           country:'China', flag:'🇨🇳', timezone:'Asia/Shanghai', lat:32.06, lon:118.80, aliases:['nkg'] },
  { name:'Kunming',           country:'China', flag:'🇨🇳', timezone:'Asia/Shanghai', lat:25.05, lon:102.71, aliases:['kmg','spring city china'] },
  { name:'Harbin',            country:'China', flag:'🇨🇳', timezone:'Asia/Shanghai', lat:45.80, lon:126.53, aliases:['hrb','ice city'] },
  { name:'Macau',             country:'China', flag:'🇨🇳', timezone:'Asia/Macau',    lat:22.20, lon:113.55, aliases:['mac','mfm','las vegas of asia'] },
  { name:'Hong Kong',         country:'China', flag:'🇭🇰', timezone:'Asia/Hong_Kong',lat:22.32, lon:114.17, aliases:['hkg','hk','fragrant harbour'] },
  // ── SOUTH KOREA ──────────────────────────────────────────
  { name:'Seoul',             country:'South Korea', flag:'🇰🇷', timezone:'Asia/Seoul', lat:37.57, lon:126.98, aliases:['soul','seul','sel','icn'] },
  { name:'Busan',             country:'South Korea', flag:'🇰🇷', timezone:'Asia/Seoul', lat:35.10, lon:129.03, aliases:['pusan','pus'] },
  { name:'Incheon',           country:'South Korea', flag:'🇰🇷', timezone:'Asia/Seoul', lat:37.46, lon:126.71, aliases:['icn','gateway to korea'] },
  { name:'Daegu',             country:'South Korea', flag:'🇰🇷', timezone:'Asia/Seoul', lat:35.87, lon:128.60, aliases:['tae'] },
  { name:'Gwangju',           country:'South Korea', flag:'🇰🇷', timezone:'Asia/Seoul', lat:35.16, lon:126.85, aliases:['gwj'] },
  { name:'Jeju',              country:'South Korea', flag:'🇰🇷', timezone:'Asia/Seoul', lat:33.51, lon:126.52, aliases:['cjj','island of gods'] },
  // ── AUSTRALIA ────────────────────────────────────────────
  { name:'Sydney',            country:'Australia', flag:'🇦🇺', timezone:'Australia/Sydney',    lat:-33.87, lon:151.21, aliases:['sydny','syd','harbour city'] },
  { name:'Melbourne',         country:'Australia', flag:'🇦🇺', timezone:'Australia/Melbourne', lat:-37.81, lon:144.96, aliases:['melborne','mel'] },
  { name:'Brisbane',          country:'Australia', flag:'🇦🇺', timezone:'Australia/Brisbane', lat:-27.47, lon:153.03, aliases:['bne'] },
  { name:'Perth',             country:'Australia', flag:'🇦🇺', timezone:'Australia/Perth',    lat:-31.95, lon:115.86, aliases:['per'] },
  { name:'Adelaide',          country:'Australia', flag:'🇦🇺', timezone:'Australia/Adelaide', lat:-34.93, lon:138.60, aliases:['adl','festival city'] },
  { name:'Gold Coast',        country:'Australia', flag:'🇦🇺', timezone:'Australia/Brisbane', lat:-28.02, lon:153.40, aliases:['ogg','surf city'] },
  { name:'Canberra',          country:'Australia', flag:'🇦🇺', timezone:'Australia/Sydney',   lat:-35.28, lon:149.13, aliases:['cbr','australia capital'] },
  { name:'Darwin',            country:'Australia', flag:'🇦🇺', timezone:'Australia/Darwin',   lat:-12.46, lon:130.84, aliases:['drw'] },
  { name:'Hobart',            country:'Australia', flag:'🇦🇺', timezone:'Australia/Hobart',   lat:-42.88, lon:147.33, aliases:['hba','tasmania capital'] },
  // ── UAE ──────────────────────────────────────────────────
  { name:'Dubai',             country:'UAE', flag:'🇦🇪', timezone:'Asia/Dubai', lat:25.20, lon:55.27, aliases:['dxb','dubay','city of gold'] },
  { name:'Abu Dhabi',         country:'UAE', flag:'🇦🇪', timezone:'Asia/Dubai', lat:24.47, lon:54.37, aliases:['auh','abudhabi','uae capital'] },
  { name:'Sharjah',           country:'UAE', flag:'🇦🇪', timezone:'Asia/Dubai', lat:25.34, lon:55.39, aliases:['shj'] },
  // ── SINGAPORE ────────────────────────────────────────────
  { name:'Singapore',         country:'Singapore', flag:'🇸🇬', timezone:'Asia/Singapore', lat:1.35, lon:103.82, aliases:['sin','sgp','singapur','lion city'] },
  // ── THAILAND ─────────────────────────────────────────────
  { name:'Bangkok',           country:'Thailand', flag:'🇹🇭', timezone:'Asia/Bangkok', lat:13.75, lon:100.50, aliases:['bkk','bangkik','bangkkok','krungthep'] },
  { name:'Chiang Mai',        country:'Thailand', flag:'🇹🇭', timezone:'Asia/Bangkok', lat:18.79, lon:98.98,  aliases:['cnx','chiangmai'] },
  { name:'Phuket',            country:'Thailand', flag:'🇹🇭', timezone:'Asia/Bangkok', lat:7.88,  lon:98.39,  aliases:['hkt'] },
  { name:'Pattaya',           country:'Thailand', flag:'🇹🇭', timezone:'Asia/Bangkok', lat:12.93, lon:100.88, aliases:['pty'] },
  // ── RUSSIA ───────────────────────────────────────────────
  { name:'Moscow',            country:'Russia', flag:'🇷🇺', timezone:'Europe/Moscow',     lat:55.75, lon:37.62,  aliases:['moskva','svo','moskow'] },
  { name:'Saint Petersburg',  country:'Russia', flag:'🇷🇺', timezone:'Europe/Moscow',     lat:59.93, lon:30.32,  aliases:['st. petersburg','leningrad','spb'] },
  { name:'Novosibirsk',       country:'Russia', flag:'🇷🇺', timezone:'Asia/Novosibirsk',  lat:54.99, lon:82.91,  aliases:['ovb'] },
  { name:'Yekaterinburg',     country:'Russia', flag:'🇷🇺', timezone:'Asia/Yekaterinburg',lat:56.84, lon:60.61,  aliases:['svx'] },
  { name:'Kazan',             country:'Russia', flag:'🇷🇺', timezone:'Europe/Moscow',     lat:55.79, lon:49.12,  aliases:['kzn'] },
  { name:'Sochi',             country:'Russia', flag:'🇷🇺', timezone:'Europe/Moscow',     lat:43.60, lon:39.73,  aliases:['aer','summer capital russia'] },
  { name:'Vladivostok',       country:'Russia', flag:'🇷🇺', timezone:'Asia/Vladivostok',  lat:43.12, lon:131.88, aliases:['vvo'] },
  // ── ITALY ────────────────────────────────────────────────
  { name:'Rome',              country:'Italy', flag:'🇮🇹', timezone:'Europe/Rome', lat:41.90, lon:12.49,  aliases:['roma','rom','fco','eternal city'] },
  { name:'Milan',             country:'Italy', flag:'🇮🇹', timezone:'Europe/Rome', lat:45.46, lon:9.19,   aliases:['milano','mxp','fashion capital'] },
  { name:'Venice',            country:'Italy', flag:'🇮🇹', timezone:'Europe/Rome', lat:45.44, lon:12.33,  aliases:['venezia','ven','floating city'] },
  { name:'Florence',          country:'Italy', flag:'🇮🇹', timezone:'Europe/Rome', lat:43.77, lon:11.26,  aliases:['firenze','flo'] },
  { name:'Naples',            country:'Italy', flag:'🇮🇹', timezone:'Europe/Rome', lat:40.85, lon:14.27,  aliases:['napoli','nap','pizza birthplace'] },
  { name:'Turin',             country:'Italy', flag:'🇮🇹', timezone:'Europe/Rome', lat:45.07, lon:7.69,   aliases:['torino','tro'] },
  { name:'Bologna',           country:'Italy', flag:'🇮🇹', timezone:'Europe/Rome', lat:44.50, lon:11.34,  aliases:['blq','food capital italy'] },
  { name:'Palermo',           country:'Italy', flag:'🇮🇹', timezone:'Europe/Rome', lat:38.12, lon:13.36,  aliases:['pmf','sicily capital'] },
  { name:'Verona',            country:'Italy', flag:'🇮🇹', timezone:'Europe/Rome', lat:45.44, lon:10.99,  aliases:['vrn','romeo and juliet city'] },
  { name:'Bari',              country:'Italy', flag:'🇮🇹', timezone:'Europe/Rome', lat:41.12, lon:16.87,  aliases:['bar'] },
  { name:'Genoa',             country:'Italy', flag:'🇮🇹', timezone:'Europe/Rome', lat:44.40, lon:8.94,   aliases:['goa'] },
  // ── SPAIN ────────────────────────────────────────────────
  { name:'Madrid',            country:'Spain', flag:'🇪🇸', timezone:'Europe/Madrid', lat:40.42, lon:-3.70,  aliases:['madrd','mad','heart of spain'] },
  { name:'Barcelona',         country:'Spain', flag:'🇪🇸', timezone:'Europe/Madrid', lat:41.39, lon:2.16,   aliases:['bcn','barca','city of gaudi'] },
  { name:'Seville',           country:'Spain', flag:'🇪🇸', timezone:'Europe/Madrid', lat:37.39, lon:-5.99,  aliases:['sevilla','svq','flamenco city'] },
  { name:'Valencia',          country:'Spain', flag:'🇪🇸', timezone:'Europe/Madrid', lat:39.47, lon:-0.38,  aliases:['vlc'] },
  { name:'Bilbao',            country:'Spain', flag:'🇪🇸', timezone:'Europe/Madrid', lat:43.26, lon:-2.93,  aliases:['bio'] },
  { name:'Granada',           country:'Spain', flag:'🇪🇸', timezone:'Europe/Madrid', lat:37.18, lon:-3.60,  aliases:['grx','alhambra city'] },
  { name:'Malaga',            country:'Spain', flag:'🇪🇸', timezone:'Europe/Madrid', lat:36.72, lon:-4.42,  aliases:['agp','costa del sol'] },
  { name:'Ibiza',             country:'Spain', flag:'🇪🇸', timezone:'Europe/Madrid', lat:38.91, lon:1.43,   aliases:['ibz','party island'] },
  // ── SOUTH AFRICA ─────────────────────────────────────────
  { name:'Cape Town',         country:'South Africa', flag:'🇿🇦', timezone:'Africa/Johannesburg', lat:-33.92, lon:18.42,  aliases:['cpt','capetown','mother city'] },
  { name:'Johannesburg',      country:'South Africa', flag:'🇿🇦', timezone:'Africa/Johannesburg', lat:-26.20, lon:28.04,  aliases:['joburg','jnb','jhb','jozi'] },
  { name:'Durban',            country:'South Africa', flag:'🇿🇦', timezone:'Africa/Johannesburg', lat:-29.86, lon:31.02,  aliases:['dbn'] },
  { name:'Pretoria',          country:'South Africa', flag:'🇿🇦', timezone:'Africa/Johannesburg', lat:-25.74, lon:28.18,  aliases:['pry','jacaranda city'] },
  // ── BRAZIL ───────────────────────────────────────────────
  { name:'São Paulo',         country:'Brazil', flag:'🇧🇷', timezone:'America/Sao_Paulo', lat:-23.55, lon:-46.63, aliases:['sao paulo','sp','gru','sampa'] },
  { name:'Rio de Janeiro',    country:'Brazil', flag:'🇧🇷', timezone:'America/Sao_Paulo', lat:-22.91, lon:-43.17, aliases:['rio','rj','gig','marvelous city'] },
  { name:'Brasília',          country:'Brazil', flag:'🇧🇷', timezone:'America/Sao_Paulo', lat:-15.78, lon:-47.93, aliases:['brasilia','bsb'] },
  { name:'Salvador',          country:'Brazil', flag:'🇧🇷', timezone:'America/Bahia',    lat:-12.97, lon:-38.50,  aliases:['ssa'] },
  { name:'Fortaleza',         country:'Brazil', flag:'🇧🇷', timezone:'America/Fortaleza', lat:-3.73,  lon:-38.52, aliases:['for'] },
  { name:'Curitiba',          country:'Brazil', flag:'🇧🇷', timezone:'America/Sao_Paulo', lat:-25.43, lon:-49.27, aliases:['cwr'] },
  { name:'Manaus',            country:'Brazil', flag:'🇧🇷', timezone:'America/Manaus',   lat:-3.10,  lon:-60.02,  aliases:['mao','amazon capital'] },
  { name:'Belo Horizonte',    country:'Brazil', flag:'🇧🇷', timezone:'America/Sao_Paulo', lat:-19.92, lon:-43.94, aliases:['bh','cnf'] },
  { name:'Recife',            country:'Brazil', flag:'🇧🇷', timezone:'America/Recife',   lat:-8.05,  lon:-34.88,  aliases:['rec'] },
  // ── ARGENTINA ────────────────────────────────────────────
  { name:'Buenos Aires',      country:'Argentina', flag:'🇦🇷', timezone:'America/Argentina/Buenos_Aires', lat:-34.60, lon:-58.38, aliases:['baires','eze','bue','paris of south america'] },
  { name:'Córdoba',           country:'Argentina', flag:'🇦🇷', timezone:'America/Argentina/Cordoba',     lat:-31.41, lon:-64.18, aliases:['cordoba','cor'] },
  { name:'Mendoza',           country:'Argentina', flag:'🇦🇷', timezone:'America/Argentina/Mendoza',     lat:-32.89, lon:-68.85, aliases:['mdz','wine capital argentina'] },
  // ── MEXICO ───────────────────────────────────────────────
  { name:'Mexico City',       country:'Mexico', flag:'🇲🇽', timezone:'America/Mexico_City', lat:19.43, lon:-99.13,  aliases:['cdmx','mex','df','ciudad de mexico'] },
  { name:'Guadalajara',       country:'Mexico', flag:'🇲🇽', timezone:'America/Mexico_City', lat:20.66, lon:-103.35, aliases:['gdl'] },
  { name:'Cancún',            country:'Mexico', flag:'🇲🇽', timezone:'America/Cancun',      lat:21.16, lon:-86.84,  aliases:['cancun','cun'] },
  { name:'Monterrey',         country:'Mexico', flag:'🇲🇽', timezone:'America/Monterrey',   lat:25.68, lon:-100.32, aliases:['mty'] },
  { name:'Tijuana',           country:'Mexico', flag:'🇲🇽', timezone:'America/Tijuana',     lat:32.53, lon:-117.04, aliases:['tij'] },
  // ── NETHERLANDS ──────────────────────────────────────────
  { name:'Amsterdam',         country:'Netherlands', flag:'🇳🇱', timezone:'Europe/Amsterdam', lat:52.37, lon:4.90,  aliases:['ams','venice of the north'] },
  { name:'Rotterdam',         country:'Netherlands', flag:'🇳🇱', timezone:'Europe/Amsterdam', lat:51.92, lon:4.48,  aliases:['rtm'] },
  { name:'The Hague',         country:'Netherlands', flag:'🇳🇱', timezone:'Europe/Amsterdam', lat:52.08, lon:4.31,  aliases:['den haag','hague'] },
  // ── PORTUGAL ─────────────────────────────────────────────
  { name:'Lisbon',            country:'Portugal', flag:'🇵🇹', timezone:'Europe/Lisbon', lat:38.72, lon:-9.14,  aliases:['lisboa','lis','city of seven hills'] },
  { name:'Porto',             country:'Portugal', flag:'🇵🇹', timezone:'Europe/Lisbon', lat:41.16, lon:-8.63,  aliases:['opo','oporto','port wine city'] },
  { name:'Faro',              country:'Portugal', flag:'🇵🇹', timezone:'Europe/Lisbon', lat:37.01, lon:-7.93,  aliases:['fao','algarve'] },
  // ── SWITZERLAND ──────────────────────────────────────────
  { name:'Zurich',            country:'Switzerland', flag:'🇨🇭', timezone:'Europe/Zurich', lat:47.38, lon:8.54,  aliases:['zürich','zur','zrh'] },
  { name:'Geneva',            country:'Switzerland', flag:'🇨🇭', timezone:'Europe/Zurich', lat:46.20, lon:6.14,  aliases:['genève','geneve','gva'] },
  { name:'Bern',              country:'Switzerland', flag:'🇨🇭', timezone:'Europe/Zurich', lat:46.95, lon:7.44,  aliases:['brn','switzerland capital'] },
  { name:'Interlaken',        country:'Switzerland', flag:'🇨🇭', timezone:'Europe/Zurich', lat:46.68, lon:7.86,  aliases:['inn','adventure capital'] },
  // ── NORDIC ───────────────────────────────────────────────
  { name:'Stockholm',         country:'Sweden', flag:'🇸🇪', timezone:'Europe/Stockholm', lat:59.33, lon:18.07, aliases:['sto','arlanda','stokholm'] },
  { name:'Gothenburg',        country:'Sweden', flag:'🇸🇪', timezone:'Europe/Stockholm', lat:57.71, lon:11.97, aliases:['göteborg','got','gbg'] },
  { name:'Oslo',              country:'Norway', flag:'🇳🇴', timezone:'Europe/Oslo', lat:59.91, lon:10.75, aliases:['osl'] },
  { name:'Bergen',            country:'Norway', flag:'🇳🇴', timezone:'Europe/Oslo', lat:60.39, lon:5.32,  aliases:['bgf','city of seven mountains'] },
  { name:'Tromsø',            country:'Norway', flag:'🇳🇴', timezone:'Europe/Oslo', lat:69.65, lon:18.96, aliases:['tos','northern lights city'] },
  { name:'Copenhagen',        country:'Denmark', flag:'🇩🇰', timezone:'Europe/Copenhagen', lat:55.68, lon:12.57, aliases:['cph','kobenhavn'] },
  { name:'Helsinki',          country:'Finland', flag:'🇫🇮', timezone:'Europe/Helsinki', lat:60.17, lon:24.94, aliases:['hel'] },
  { name:'Rovaniemi',         country:'Finland', flag:'🇫🇮', timezone:'Europe/Helsinki', lat:66.50, lon:25.72, aliases:['rov','santa claus hometown'] },
  // ── GREECE ───────────────────────────────────────────────
  { name:'Athens',            country:'Greece', flag:'🇬🇷', timezone:'Europe/Athens', lat:37.98, lon:23.73,  aliases:['athina','ath','cradle of civilization'] },
  { name:'Thessaloniki',      country:'Greece', flag:'🇬🇷', timezone:'Europe/Athens', lat:40.64, lon:22.94,  aliases:['sky'] },
  { name:'Santorini',         country:'Greece', flag:'🇬🇷', timezone:'Europe/Athens', lat:36.39, lon:25.46,  aliases:['jtr','thira','oia'] },
  { name:'Mykonos',           country:'Greece', flag:'🇬🇷', timezone:'Europe/Athens', lat:37.45, lon:25.37,  aliases:['jmk'] },
  // ── TURKEY ───────────────────────────────────────────────
  { name:'Istanbul',          country:'Turkey', flag:'🇹🇷', timezone:'Europe/Istanbul', lat:41.01, lon:28.95,  aliases:['ist','constantinople','istambul','bosphorus city'] },
  { name:'Ankara',            country:'Turkey', flag:'🇹🇷', timezone:'Europe/Istanbul', lat:39.93, lon:32.85,  aliases:['esb','ankra','turkey capital'] },
  { name:'Izmir',             country:'Turkey', flag:'🇹🇷', timezone:'Europe/Istanbul', lat:38.42, lon:27.14,  aliases:['adb'] },
  { name:'Antalya',           country:'Turkey', flag:'🇹🇷', timezone:'Europe/Istanbul', lat:36.88, lon:30.70,  aliases:['ayt','turkish riviera'] },
  { name:'Cappadocia',        country:'Turkey', flag:'🇹🇷', timezone:'Europe/Istanbul', lat:38.66, lon:34.83,  aliases:['goreme','balloon city'] },
  // ── EGYPT ────────────────────────────────────────────────
  { name:'Cairo',             country:'Egypt', flag:'🇪🇬', timezone:'Africa/Cairo', lat:30.04, lon:31.24,  aliases:['cai','kahira','caaro','al qahirah'] },
  { name:'Alexandria',        country:'Egypt', flag:'🇪🇬', timezone:'Africa/Cairo', lat:31.20, lon:29.92,  aliases:['alex','alexndria'] },
  { name:'Luxor',             country:'Egypt', flag:'🇪🇬', timezone:'Africa/Cairo', lat:25.69, lon:32.64,  aliases:['lxr','open air museum'] },
  { name:'Sharm El Sheikh',   country:'Egypt', flag:'🇪🇬', timezone:'Africa/Cairo', lat:27.91, lon:34.33,  aliases:['ssh','city of peace'] },
  { name:'Hurghada',          country:'Egypt', flag:'🇪🇬', timezone:'Africa/Cairo', lat:27.26, lon:33.81,  aliases:['hrg','red sea resort'] },
  // ── AFRICA ───────────────────────────────────────────────
  { name:'Lagos',             country:'Nigeria', flag:'🇳🇬', timezone:'Africa/Lagos', lat:6.52, lon:3.38,  aliases:['los','lagoss','ikeja'] },
  { name:'Abuja',             country:'Nigeria', flag:'🇳🇬', timezone:'Africa/Lagos', lat:9.06, lon:7.50,  aliases:['abj','nigeria capital'] },
  { name:'Kano',              country:'Nigeria', flag:'🇳🇬', timezone:'Africa/Lagos', lat:12.00, lon:8.52, aliases:['kna'] },
  { name:'Nairobi',           country:'Kenya', flag:'🇰🇪', timezone:'Africa/Nairobi', lat:-1.29, lon:36.82, aliases:['nbo','safari capital'] },
  { name:'Mombasa',           country:'Kenya', flag:'🇰🇪', timezone:'Africa/Nairobi', lat:-4.05, lon:39.67, aliases:['mom','kenya coast'] },
  { name:'Addis Ababa',       country:'Ethiopia', flag:'🇪🇹', timezone:'Africa/Addis_Ababa', lat:9.03, lon:38.74, aliases:['add','new flower'] },
  { name:'Accra',             country:'Ghana', flag:'🇬🇭', timezone:'Africa/Accra', lat:5.56, lon:-0.20, aliases:['acc'] },
  { name:'Dar es Salaam',     country:'Tanzania', flag:'🇹🇿', timezone:'Africa/Dar_es_Salaam', lat:-6.80, lon:39.29, aliases:['dar'] },
  { name:'Zanzibar',          country:'Tanzania', flag:'🇹🇿', timezone:'Africa/Dar_es_Salaam', lat:-6.16, lon:39.20, aliases:['znz','spice island'] },
  { name:'Casablanca',        country:'Morocco', flag:'🇲🇦', timezone:'Africa/Casablanca', lat:33.59, lon:-7.62,  aliases:['cmy','casa'] },
  { name:'Marrakech',         country:'Morocco', flag:'🇲🇦', timezone:'Africa/Casablanca', lat:31.63, lon:-8.01,  aliases:['rak','marrakesh','red city'] },
  { name:'Fez',               country:'Morocco', flag:'🇲🇦', timezone:'Africa/Casablanca', lat:34.04, lon:-5.00,  aliases:['fes'] },
  { name:'Rabat',             country:'Morocco', flag:'🇲🇦', timezone:'Africa/Casablanca', lat:34.02, lon:-6.83,  aliases:['rba','morocco capital'] },
  { name:'Tunis',             country:'Tunisia', flag:'🇹🇳', timezone:'Africa/Tunis', lat:36.82, lon:10.17, aliases:['tun'] },
  { name:'Luanda',            country:'Angola', flag:'🇦🇴', timezone:'Africa/Luanda', lat:-8.83, lon:13.23, aliases:['lad'] },
  { name:'Kigali',            country:'Rwanda', flag:'🇷🇼', timezone:'Africa/Kigali', lat:-1.95, lon:30.06, aliases:['kgl','cleanest city africa'] },
  { name:'Kampala',           country:'Uganda', flag:'🇺🇬', timezone:'Africa/Kampala', lat:0.32, lon:32.58, aliases:['kla'] },
  { name:'Dakar',             country:'Senegal', flag:'🇸🇳', timezone:'Africa/Dakar', lat:14.69, lon:-17.44, aliases:['dkr'] },
  { name:'Harare',            country:'Zimbabwe', flag:'🇿🇼', timezone:'Africa/Harare', lat:-17.83, lon:31.05, aliases:['har'] },
  { name:'Lusaka',            country:'Zambia', flag:'🇿🇲', timezone:'Africa/Lusaka', lat:-15.42, lon:28.28, aliases:['lun'] },
  // ── MIDDLE EAST ──────────────────────────────────────────
  { name:'Riyadh',            country:'Saudi Arabia', flag:'🇸🇦', timezone:'Asia/Riyadh', lat:24.69, lon:46.72, aliases:['ruh','riad','riyad','saudi capital'] },
  { name:'Jeddah',            country:'Saudi Arabia', flag:'🇸🇦', timezone:'Asia/Riyadh', lat:21.49, lon:39.19, aliases:['jed','jidda'] },
  { name:'Mecca',             country:'Saudi Arabia', flag:'🇸🇦', timezone:'Asia/Riyadh', lat:21.39, lon:39.86, aliases:['makkah','meka','makka'] },
  { name:'Medina',            country:'Saudi Arabia', flag:'🇸🇦', timezone:'Asia/Riyadh', lat:24.52, lon:39.57, aliases:['mdn','al madinah'] },
  { name:'Doha',              country:'Qatar', flag:'🇶🇦', timezone:'Asia/Qatar', lat:25.28, lon:51.53, aliases:['doh','qatar capital'] },
  { name:'Manama',            country:'Bahrain', flag:'🇧🇭', timezone:'Asia/Bahrain', lat:26.22, lon:50.59, aliases:['bah','bahrain capital'] },
  { name:'Kuwait City',       country:'Kuwait', flag:'🇰🇼', timezone:'Asia/Kuwait', lat:29.37, lon:47.98, aliases:['kwi','kuwait'] },
  { name:'Muscat',            country:'Oman', flag:'🇴🇲', timezone:'Asia/Muscat', lat:23.58, lon:58.40, aliases:['mct','oman capital'] },
  { name:'Amman',             country:'Jordan', flag:'🇯🇴', timezone:'Asia/Amman', lat:31.95, lon:35.93, aliases:['amm','white city jordan'] },
  { name:'Beirut',            country:'Lebanon', flag:'🇱🇧', timezone:'Asia/Beirut', lat:33.89, lon:35.50, aliases:['bey','paris of middle east'] },
  { name:'Tel Aviv',          country:'Israel', flag:'🇮🇱', timezone:'Asia/Jerusalem', lat:32.09, lon:34.79, aliases:['tav','tlv','telaviv'] },
  { name:'Jerusalem',         country:'Israel', flag:'🇮🇱', timezone:'Asia/Jerusalem', lat:31.77, lon:35.22, aliases:['jrs','holy city'] },
  { name:'Tehran',            country:'Iran', flag:'🇮🇷', timezone:'Asia/Tehran', lat:35.69, lon:51.39, aliases:['thr','tehraan'] },
  { name:'Isfahan',           country:'Iran', flag:'🇮🇷', timezone:'Asia/Tehran', lat:32.66, lon:51.68, aliases:['ifn','half the world'] },
  { name:'Baghdad',           country:'Iraq', flag:'🇮🇶', timezone:'Asia/Baghdad', lat:33.34, lon:44.40, aliases:['bgw'] },
  // ── SOUTH ASIA ───────────────────────────────────────────
  { name:'Karachi',           country:'Pakistan', flag:'🇵🇰', timezone:'Asia/Karachi', lat:24.86, lon:67.01, aliases:['khi','karrachi'] },
  { name:'Lahore',            country:'Pakistan', flag:'🇵🇰', timezone:'Asia/Karachi', lat:31.55, lon:74.34, aliases:['lhe','lahor'] },
  { name:'Islamabad',         country:'Pakistan', flag:'🇵🇰', timezone:'Asia/Karachi', lat:33.73, lon:73.09, aliases:['isb','pakistan capital'] },
  { name:'Peshawar',          country:'Pakistan', flag:'🇵🇰', timezone:'Asia/Karachi', lat:34.01, lon:71.58, aliases:['pew'] },
  { name:'Faisalabad',        country:'Pakistan', flag:'🇵🇰', timezone:'Asia/Karachi', lat:31.42, lon:73.09, aliases:['lyp'] },
  { name:'Dhaka',             country:'Bangladesh', flag:'🇧🇩', timezone:'Asia/Dhaka', lat:23.81, lon:90.41, aliases:['dac','dacca'] },
  { name:'Chittagong',        country:'Bangladesh', flag:'🇧🇩', timezone:'Asia/Dhaka', lat:22.33, lon:91.83, aliases:['cgp'] },
  { name:'Colombo',           country:'Sri Lanka', flag:'🇱🇰', timezone:'Asia/Colombo', lat:6.93, lon:79.85, aliases:['cmb','colmbo'] },
  { name:'Kandy',             country:'Sri Lanka', flag:'🇱🇰', timezone:'Asia/Colombo', lat:7.29, lon:80.63, aliases:['kdy','cultural capital sri lanka'] },
  { name:'Kathmandu',         country:'Nepal', flag:'🇳🇵', timezone:'Asia/Kathmandu', lat:27.72, lon:85.32, aliases:['ktm','city of temples'] },
  { name:'Pokhara',           country:'Nepal', flag:'🇳🇵', timezone:'Asia/Kathmandu', lat:28.21, lon:83.99, aliases:['pkr','lakeside city'] },
  { name:'Thimphu',           country:'Bhutan', flag:'🇧🇹', timezone:'Asia/Thimphu', lat:27.47, lon:89.64, aliases:['pbo','bhutan capital'] },
  { name:'Malé',              country:'Maldives', flag:'🇲🇻', timezone:'Indian/Maldives', lat:4.17, lon:73.51, aliases:['male','mle','island capital'] },
  // ── SOUTHEAST ASIA ───────────────────────────────────────
  { name:'Jakarta',           country:'Indonesia', flag:'🇮🇩', timezone:'Asia/Jakarta',  lat:-6.21, lon:106.85, aliases:['jkt','jakrta'] },
  { name:'Bali',              country:'Indonesia', flag:'🇮🇩', timezone:'Asia/Makassar', lat:-8.34, lon:115.09, aliases:['dps','island of gods','balee'] },
  { name:'Surabaya',          country:'Indonesia', flag:'🇮🇩', timezone:'Asia/Jakarta',  lat:-7.25, lon:112.75, aliases:['sub'] },
  { name:'Bandung',           country:'Indonesia', flag:'🇮🇩', timezone:'Asia/Jakarta',  lat:-6.91, lon:107.62, aliases:['bdg','paris van java'] },
  { name:'Yogyakarta',        country:'Indonesia', flag:'🇮🇩', timezone:'Asia/Jakarta',  lat:-7.80, lon:110.37, aliases:['jog','jogja'] },
  { name:'Medan',             country:'Indonesia', flag:'🇮🇩', timezone:'Asia/Jakarta',  lat:3.59,  lon:98.67,  aliases:['mdn'] },
  { name:'Kuala Lumpur',      country:'Malaysia', flag:'🇲🇾', timezone:'Asia/Kuala_Lumpur', lat:3.14, lon:101.69, aliases:['kl','kul','klia','city of twin towers'] },
  { name:'Penang',            country:'Malaysia', flag:'🇲🇾', timezone:'Asia/Kuala_Lumpur', lat:5.41, lon:100.33, aliases:['pen','george town'] },
  { name:'Manila',            country:'Philippines', flag:'🇵🇭', timezone:'Asia/Manila', lat:14.60, lon:120.98, aliases:['mnl','manilla'] },
  { name:'Cebu',              country:'Philippines', flag:'🇵🇭', timezone:'Asia/Manila', lat:10.32, lon:123.90, aliases:['ceb'] },
  { name:'Davao',             country:'Philippines', flag:'🇵🇭', timezone:'Asia/Manila', lat:7.07,  lon:125.61, aliases:['dvo'] },
  { name:'Taipei',            country:'Taiwan', flag:'🇹🇼', timezone:'Asia/Taipei', lat:25.03, lon:121.56, aliases:['tpe','taipeh','taibei'] },
  { name:'Ho Chi Minh City',  country:'Vietnam', flag:'🇻🇳', timezone:'Asia/Ho_Chi_Minh', lat:10.82, lon:106.63, aliases:['hcm','saigon','sgn'] },
  { name:'Hanoi',             country:'Vietnam', flag:'🇻🇳', timezone:'Asia/Ho_Chi_Minh', lat:21.03, lon:105.85, aliases:['han','hni'] },
  { name:'Da Nang',           country:'Vietnam', flag:'🇻🇳', timezone:'Asia/Ho_Chi_Minh', lat:16.05, lon:108.20, aliases:['dad'] },
  { name:'Phnom Penh',        country:'Cambodia', flag:'🇰🇭', timezone:'Asia/Phnom_Penh', lat:11.56, lon:104.92, aliases:['pnh'] },
  { name:'Siem Reap',         country:'Cambodia', flag:'🇰🇭', timezone:'Asia/Phnom_Penh', lat:13.36, lon:103.86, aliases:['rep','angkor wat'] },
  { name:'Yangon',            country:'Myanmar', flag:'🇲🇲', timezone:'Asia/Rangoon', lat:16.87, lon:96.19, aliases:['rangoon','rgn'] },
  { name:'Vientiane',         country:'Laos', flag:'🇱🇦', timezone:'Asia/Vientiane', lat:17.96, lon:102.60, aliases:['vie','laos capital'] },
  // ── CENTRAL ASIA & CAUCASUS ───────────────────────────────
  { name:'Almaty',            country:'Kazakhstan', flag:'🇰🇿', timezone:'Asia/Almaty', lat:43.24, lon:76.89, aliases:['ala'] },
  { name:'Astana',            country:'Kazakhstan', flag:'🇰🇿', timezone:'Asia/Almaty', lat:51.18, lon:71.45, aliases:['nun','nur-sultan','kazakhstan capital'] },
  { name:'Tbilisi',           country:'Georgia', flag:'🇬🇪', timezone:'Asia/Tbilisi', lat:41.69, lon:44.83, aliases:['tbs','city of hot springs'] },
  { name:'Yerevan',           country:'Armenia', flag:'🇦🇲', timezone:'Asia/Yerevan', lat:40.18, lon:44.51, aliases:['evn','pink city'] },
  { name:'Baku',              country:'Azerbaijan', flag:'🇦🇿', timezone:'Asia/Baku', lat:40.41, lon:49.87, aliases:['gyd','city of winds'] },
  { name:'Tashkent',          country:'Uzbekistan', flag:'🇺🇿', timezone:'Asia/Tashkent', lat:41.30, lon:69.24, aliases:['tas'] },
  { name:'Samarkand',         country:'Uzbekistan', flag:'🇺🇿', timezone:'Asia/Samarkand', lat:39.65, lon:66.96, aliases:['skd','jewel of silk road'] },
  { name:'Ulaanbaatar',       country:'Mongolia', flag:'🇲🇳', timezone:'Asia/Ulaanbaatar', lat:47.90, lon:106.91, aliases:['uln','coldest capital'] },
  // ── EUROPE — EASTERN ─────────────────────────────────────
  { name:'Kyiv',              country:'Ukraine', flag:'🇺🇦', timezone:'Europe/Kyiv', lat:50.45, lon:30.52, aliases:['kiev','kyieve'] },
  { name:'Lviv',              country:'Ukraine', flag:'🇺🇦', timezone:'Europe/Kyiv', lat:49.84, lon:24.03, aliases:['lwo','little paris ukraine'] },
  { name:'Odesa',             country:'Ukraine', flag:'🇺🇦', timezone:'Europe/Kyiv', lat:46.47, lon:30.73, aliases:['odessa','pearl of black sea'] },
  { name:'Warsaw',            country:'Poland', flag:'🇵🇱', timezone:'Europe/Warsaw', lat:52.23, lon:21.01, aliases:['waw','warszawa'] },
  { name:'Kraków',            country:'Poland', flag:'🇵🇱', timezone:'Europe/Warsaw', lat:50.06, lon:19.94, aliases:['krakow','krakov','royal city poland'] },
  { name:'Gdańsk',            country:'Poland', flag:'🇵🇱', timezone:'Europe/Warsaw', lat:54.35, lon:18.65, aliases:['gdansk','amber city'] },
  { name:'Prague',            country:'Czech Republic', flag:'🇨🇿', timezone:'Europe/Prague', lat:50.08, lon:14.44, aliases:['prg','praag','Praha','city of hundred spires'] },
  { name:'Budapest',          country:'Hungary', flag:'🇭🇺', timezone:'Europe/Budapest', lat:47.50, lon:19.04, aliases:['bud','queen of the danube'] },
  { name:'Bucharest',         country:'Romania', flag:'🇷🇴', timezone:'Europe/Bucharest', lat:44.43, lon:26.10, aliases:['buh','little paris romania'] },
  { name:'Belgrade',          country:'Serbia', flag:'🇷🇸', timezone:'Europe/Belgrade', lat:44.80, lon:20.46, aliases:['beg','white city'] },
  { name:'Sofia',             country:'Bulgaria', flag:'🇧🇬', timezone:'Europe/Sofia', lat:42.70, lon:23.32, aliases:['sof'] },
  { name:'Bratislava',        country:'Slovakia', flag:'🇸🇰', timezone:'Europe/Bratislava', lat:48.14, lon:17.11, aliases:['bts','little big city'] },
  // ── EUROPE — WESTERN ─────────────────────────────────────
  { name:'Vienna',            country:'Austria', flag:'🇦🇹', timezone:'Europe/Vienna', lat:48.21, lon:16.37, aliases:['wien','vie','city of music'] },
  { name:'Salzburg',          country:'Austria', flag:'🇦🇹', timezone:'Europe/Vienna', lat:47.80, lon:13.04, aliases:['szg','mozart city'] },
  { name:'Brussels',          country:'Belgium', flag:'🇧🇪', timezone:'Europe/Brussels', lat:50.85, lon:4.35, aliases:['bru','bruxelles','capital of europe'] },
  { name:'Bruges',            country:'Belgium', flag:'🇧🇪', timezone:'Europe/Brussels', lat:51.21, lon:3.22, aliases:['bgs','venice of the north be'] },
  { name:'Antwerp',           country:'Belgium', flag:'🇧🇪', timezone:'Europe/Brussels', lat:51.22, lon:4.40, aliases:['ant','diamond capital'] },
  { name:'Dublin',            country:'Ireland', flag:'🇮🇪', timezone:'Europe/Dublin', lat:53.33, lon:-6.25, aliases:['dbl','dub','emerald city'] },
  { name:'Cork',              country:'Ireland', flag:'🇮🇪', timezone:'Europe/Dublin', lat:51.90, lon:-8.47, aliases:['ork','rebel city'] },
  { name:'Reykjavik',         country:'Iceland', flag:'🇮🇸', timezone:'Atlantic/Reykjavik', lat:64.13, lon:-21.94, aliases:['rkv','northern lights'] },
  { name:'Luxembourg City',   country:'Luxembourg', flag:'🇱🇺', timezone:'Europe/Luxembourg', lat:49.61, lon:6.13, aliases:['lux'] },
  { name:'Monaco',            country:'Monaco', flag:'🇲🇨', timezone:'Europe/Monaco', lat:43.74, lon:7.43, aliases:['mcm','f1 city'] },
  { name:'Valletta',          country:'Malta', flag:'🇲🇹', timezone:'Europe/Malta', lat:35.90, lon:14.51, aliases:['mla','malta capital'] },
  // ── EUROPE — BALKAN & ADRIATIC ────────────────────────────
  { name:'Zagreb',            country:'Croatia', flag:'🇭🇷', timezone:'Europe/Zagreb', lat:45.81, lon:15.98, aliases:['zgb','croatia capital'] },
  { name:'Dubrovnik',         country:'Croatia', flag:'🇭🇷', timezone:'Europe/Zagreb', lat:42.64, lon:18.11, aliases:['dbv','pearl of the adriatic'] },
  // ── SOUTH AMERICA ─────────────────────────────────────────
  { name:'Santiago',          country:'Chile', flag:'🇨🇱', timezone:'America/Santiago', lat:-33.46, lon:-70.65, aliases:['scl','chile capital'] },
  { name:'Bogotá',            country:'Colombia', flag:'🇨🇴', timezone:'America/Bogota', lat:4.71, lon:-74.07, aliases:['bog','bogota'] },
  { name:'Medellín',          country:'Colombia', flag:'🇨🇴', timezone:'America/Bogota', lat:6.25, lon:-75.56, aliases:['mde','city of eternal spring'] },
  { name:'Lima',              country:'Peru', flag:'🇵🇪', timezone:'America/Lima', lat:-12.05, lon:-77.04, aliases:['lim','city of kings'] },
  { name:'Cusco',             country:'Peru', flag:'🇵🇪', timezone:'America/Lima', lat:-13.52, lon:-71.97, aliases:['cuz','inca capital'] },
  { name:'Caracas',           country:'Venezuela', flag:'🇻🇪', timezone:'America/Caracas', lat:10.48, lon:-66.88, aliases:['ccs'] },
  { name:'Quito',             country:'Ecuador', flag:'🇪🇨', timezone:'America/Guayaquil', lat:-0.22, lon:-78.51, aliases:['uio','ecuador capital'] },
  // ── CENTRAL AMERICA & CARIBBEAN ───────────────────────────
  { name:'Havana',            country:'Cuba', flag:'🇨🇺', timezone:'America/Havana', lat:23.13, lon:-82.38, aliases:['hav','key of the gulf'] },
  { name:'Panama City',       country:'Panama', flag:'🇵🇦', timezone:'America/Panama', lat:8.99, lon:-79.52, aliases:['pty','hub of americas'] },
  { name:'San José',          country:'Costa Rica', flag:'🇨🇷', timezone:'America/Costa_Rica', lat:9.93, lon:-84.08, aliases:['san jose cr'] },
  // ── PACIFIC ──────────────────────────────────────────────
  { name:'Auckland',          country:'New Zealand', flag:'🇳🇿', timezone:'Pacific/Auckland', lat:-36.86, lon:174.77, aliases:['akl','city of sails'] },
  { name:'Wellington',        country:'New Zealand', flag:'🇳🇿', timezone:'Pacific/Auckland', lat:-41.29, lon:174.78, aliases:['wlg','new zealand capital'] },
  { name:'Queenstown',        country:'New Zealand', flag:'🇳🇿', timezone:'Pacific/Auckland', lat:-45.03, lon:168.66, aliases:['zqn','adventure capital'] },
  { name:'Honolulu',          country:'United States', flag:'🇺🇸', timezone:'Pacific/Honolulu', lat:21.31, lon:-157.86, aliases:['hnl','hawaii'] },
];

const POPULAR_CITIES = [
  'Mumbai','Delhi','Bengaluru','Chennai','Kolkata','Hyderabad','Jaipur','Kochi',
  'London','New York City','Tokyo','Paris','Dubai','Singapore','Sydney','Berlin',
  'Seoul','Bangkok','Toronto','Cape Town','Rome','Madrid','Bali','Istanbul'
];

/* ══════════════════════════════════════════════════════════════
   2. WEATHER ENGINE
   Deterministic — same city always produces coherent conditions
   based on latitude, longitude, current month & hour.
   ══════════════════════════════════════════════════════════════ */

const WEATHER_CONDITIONS = {
  sunny:     { label:'Sunny',       emoji:'☀️',  gradient:'weather-sunny',  mood:['Perfect day to chase your goals.','Step outside — the sun is yours.','Bright skies, brighter possibilities.'] },
  partly:    { label:'Partly Cloudy',emoji:'⛅',  gradient:'weather-sunny',  mood:['A nice mix of sun and clouds.','Comfortable and pleasant outdoors.','Good vibes all around.'] },
  cloudy:    { label:'Cloudy',      emoji:'☁️',  gradient:'weather-cloudy', mood:['A calm day to focus and create.','Cloud cover — perfect for deep work.','Low skies, high thoughts.'] },
  rainy:     { label:'Rainy',       emoji:'🌧️', gradient:'weather-rainy',  mood:['Stay cozy and enjoy the rain.','Rain is just confetti from the sky.','Let the rain wash away the noise.'] },
  drizzle:   { label:'Drizzle',     emoji:'🌦️', gradient:'weather-drizzle', mood:['A gentle drizzle softens the world.','Light rain, light heart.','Perfect weather for quiet walks.'] },
  snowy:     { label:'Snowy',       emoji:'❄️',  gradient:'weather-snowy',  mood:['Enjoy the winter wonderland.','Fresh snow, fresh start.','Everything is quiet and beautiful.'] },
  windy:     { label:'Windy',       emoji:'🌬️', gradient:'weather-windy',  mood:['Fresh breeze, fresh mindset.','The wind carries new ideas.','Let the breeze clear your thoughts.'] },
  storm:     { label:'Thunderstorm',emoji:'⛈️',  gradient:'weather-storm',  mood:['Take it slow and stay safe inside.','The storm makes the calm more beautiful.','Respect the power of nature.'] },
  foggy:     { label:'Foggy',       emoji:'🌫️', gradient:'weather-foggy',  mood:['Mystery in the air today.','The world is soft and quiet.','A foggy morning holds hidden magic.'] },
  heatwave:  { label:'Heatwave',    emoji:'🔥',  gradient:'weather-sunny',  mood:["It's scorching — stay hydrated!","The heat is on — pace yourself.",'Sun and heat — a test of endurance.'] },
  clear:     { label:'Clear Night', emoji:'🌙',  gradient:'weather-cloudy', mood:['Stars are shining just for you.','A peaceful, clear night.','The moon lights your path.'] },
};

/**
 * Generates realistic weather for a city using a deterministic seed.
 * Uses latitude, longitude, month, and a city-based hash for variety.
 */
function generateWeather(city) {
  const now    = new Date();
  const month  = now.getMonth(); // 0=Jan..11=Dec
  const hour   = now.getHours();
  const seed   = hashStr(city.name) + month * 31 + Math.floor(now.getDate() / 5);

  const lat    = city.lat;
  const isNight = hour < 6 || hour > 20;
  const isTropical = Math.abs(lat) < 23.5;
  const isPolar    = Math.abs(lat) > 60;
  const isWinter   = lat > 0 ? (month <= 1 || month >= 11) : (month >= 5 && month <= 8);
  const isSummer   = lat > 0 ? (month >= 5 && month <= 8) : (month <= 1 || month >= 11);

  // Pick condition from seeded random
  const rand = seededRand(seed);
  let condition;

  if (isPolar && isWinter) {
    condition = pick(rand, ['snowy','snowy','cloudy','storm','foggy']);
  } else if (isTropical && isSummer) {
    condition = pick(rand, ['rainy','storm','sunny','drizzle','partly','humid']);
  } else if (isSummer) {
    condition = pick(rand, ['sunny','sunny','partly','partly','windy','cloudy']);
  } else if (isWinter) {
    condition = pick(rand, ['cloudy','snowy','rainy','foggy','drizzle','windy']);
  } else {
    condition = pick(rand, ['sunny','partly','cloudy','rainy','windy','drizzle','foggy','sunny','partly']);
  }

  // Fall-back for missing keys
  if (!WEATHER_CONDITIONS[condition]) condition = 'partly';
  if (isNight && condition === 'sunny') condition = 'clear';

  const w = WEATHER_CONDITIONS[condition];

  // Temperature based on latitude, season, time of day
  let baseTemp = 27 - Math.abs(lat) * 0.55;
  if (isPolar) baseTemp -= 15;
  if (isTropical) baseTemp += 6;
  if (isWinter) baseTemp -= 12;
  if (isSummer) baseTemp += 8;
  if (isNight) baseTemp -= 5;
  if (condition === 'snowy') baseTemp = Math.min(baseTemp, -1);
  if (condition === 'heatwave') baseTemp = Math.max(baseTemp, 38);

  const temp     = Math.round(baseTemp + (seededRand(seed + 1) * 8 - 4));
  const feelsLike= Math.round(temp - 2 + seededRand(seed + 2) * 5);
  const humidity = Math.round(
    condition === 'rainy' || condition === 'drizzle' || condition === 'storm'
      ? 75 + seededRand(seed + 3) * 20
      : isTropical
        ? 55 + seededRand(seed + 3) * 30
        : 30 + seededRand(seed + 3) * 40
  );
  const wind     = Math.round(
    condition === 'windy' || condition === 'storm'
      ? 25 + seededRand(seed + 4) * 40
      : 5 + seededRand(seed + 4) * 20
  );
  const moodPick = w.mood[Math.floor(seededRand(seed + 5) * w.mood.length)];

  return { condition, label: w.label, emoji: w.emoji, gradient: w.gradient,
           temp, feelsLike, humidity, wind, mood: moodPick };
}

/* Utility: simple string hash */
function hashStr(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return h >>> 0;
}
/* Utility: seeded pseudo-random [0,1) */
function seededRand(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}
/* Utility: pick from array using rand value */
function pick(r, arr) { return arr[Math.floor(r * arr.length)]; }

/* ══════════════════════════════════════════════════════════════
   3. FUZZY SEARCH ENGINE
   Supports:
   - Exact match
   - Alias/abbreviation match
   - Prefix match
   - Levenshtein edit-distance (fuzzy)
   ══════════════════════════════════════════════════════════════ */

/**
 * Compute Levenshtein edit distance between two strings.
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

/**
 * Search cities with fuzzy matching.
 * Returns sorted array of { city, score, matchType }.
 * @param {string} query
 * @param {number} [limit=6]
 */
function searchCities(query, limit = 6) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results = [];

  for (const city of CITIES) {
    const nameLower = city.name.toLowerCase();
    const allTerms  = [nameLower, city.country.toLowerCase(), ...city.aliases];
    let bestScore   = Infinity;
    let matchType   = 'fuzzy';

    for (const term of allTerms) {
      // Exact match
      if (term === q) { bestScore = 0; matchType = 'exact'; break; }
      // Prefix match
      if (term.startsWith(q) || q.startsWith(term)) {
        const s = Math.abs(term.length - q.length) * 0.5;
        if (s < bestScore) { bestScore = s; matchType = 'prefix'; }
      }
      // Contains
      if (term.includes(q)) {
        const s = term.length - q.length + 2;
        if (s < bestScore) { bestScore = s; matchType = 'contains'; }
      }
      // Fuzzy (Levenshtein)
      if (q.length >= 3) {
        const dist = levenshtein(q, term.slice(0, Math.min(term.length, q.length + 3)));
        if (dist < bestScore) { bestScore = dist; matchType = 'fuzzy'; }
      }
    }

    if (bestScore <= 4) {
      results.push({ city, score: bestScore, matchType });
    }
  }

  // Sort: exact → prefix → contains → fuzzy, then alphabetically
  results.sort((a, b) => a.score - b.score || a.city.name.localeCompare(b.city.name));
  return results.slice(0, limit);
}

/**
 * Find the single best city for a query (for direct search).
 * Returns { city, fuzzy } where fuzzy=true means it was a typo match.
 */
function findBestCity(query) {
  const results = searchCities(query, 1);
  if (!results.length) return null;
  const { city, score, matchType } = results[0];
  return { city, fuzzy: matchType === 'fuzzy' && score > 0 };
}

/* ══════════════════════════════════════════════════════════════
   4. CLOCK ENGINE
   ══════════════════════════════════════════════════════════════ */
let clockInterval = null;

/**
 * Start the live local-time clock for a city.
 * Clears any previous interval.
 */
function startClock(city) {
  stopClock();
  updateClock(city);
  clockInterval = setInterval(() => updateClock(city), 1000);
}

function stopClock() {
  if (clockInterval) clearInterval(clockInterval);
  clockInterval = null;
}

function updateClock(city) {
  const tz  = city.timezone;
  const now  = new Date();

  // Time: HH:MM:SS in city timezone
  const timeStr = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: true
  }).format(now);

  // Date: e.g. Wednesday, June 10, 2026
  const dateStr = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  }).format(now);

  // UTC offset
  const offsetStr = getUtcOffset(tz, now);

  DOM.timeDisplay.textContent = timeStr;
  DOM.dateDisplay.textContent = dateStr;
  DOM.timezoneName.textContent = `🌍 ${tz}`;
  DOM.timezoneBadge.textContent = offsetStr;
}

function getUtcOffset(tz, date) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, timeZoneName: 'short'
    }).formatToParts(date);
    const tzName = parts.find(p => p.type === 'timeZoneName')?.value || tz;
    return tzName;
  } catch {
    return tz;
  }
}

/* ══════════════════════════════════════════════════════════════
   5. UI CONTROLLER
   ══════════════════════════════════════════════════════════════ */

/** Cached DOM references */
const DOM = {
  appWrapper:     document.getElementById('app-wrapper'),
  bgGradient:     document.getElementById('bg-gradient'),
  particles:      document.getElementById('particles'),
  cityInput:      document.getElementById('city-input'),
  searchBtn:      document.getElementById('search-btn'),
  suggestionsList:document.getElementById('suggestions-list'),
  fuzzyNotice:    document.getElementById('fuzzy-notice'),
  dashboard:      document.getElementById('dashboard'),
  loadingState:   document.getElementById('loading-state'),
  themeToggle:    document.getElementById('theme-toggle'),
  themeIcon:      document.getElementById('theme-icon'),
  themeLabel:     document.getElementById('theme-label'),
  // Weather card
  weatherEmoji:   document.getElementById('weather-emoji'),
  cityName:       document.getElementById('city-name'),
  countryName:    document.getElementById('country-name'),
  conditionBadge: document.getElementById('condition-badge'),
  moodMessage:    document.getElementById('mood-message'),
  // Time card
  timeDisplay:    document.getElementById('time-display'),
  dateDisplay:    document.getElementById('date-display'),
  timezoneName:   document.getElementById('timezone-name'),
  timezoneBadge:  document.getElementById('timezone-badge'),
  // Stats
  statTempVal:    document.getElementById('stat-temp-val'),
  statFeelsVal:   document.getElementById('stat-feels-val'),
  statHumidityVal:document.getElementById('stat-humidity-val'),
  statWindVal:    document.getElementById('stat-wind-val'),
  tempBar:        document.getElementById('temp-bar'),
  feelsBar:       document.getElementById('feels-bar'),
  humidityBar:    document.getElementById('humidity-bar'),
  windBar:        document.getElementById('wind-bar'),
  // Bottom
  popularChips:   document.getElementById('popular-chips'),
  recentChips:    document.getElementById('recent-chips'),
  recentSection:  document.getElementById('recent-section'),
  popularSection: document.getElementById('popular-section'),
};

/**
 * Show the weather dashboard for a given city object.
 */
function showWeather(city, isFuzzy = false, originalQuery = '') {
  // Show loading briefly for realism
  DOM.dashboard.classList.add('hidden');
  DOM.loadingState.classList.remove('hidden');

  setTimeout(() => {
    DOM.loadingState.classList.add('hidden');

    const weather = generateWeather(city);

    // Update fuzzy notice
    if (isFuzzy && originalQuery) {
      DOM.fuzzyNotice.innerHTML =
        `Showing results for <span class="fuzzy-highlight">${city.name}</span>`;
      DOM.fuzzyNotice.hidden = false;
    } else {
      DOM.fuzzyNotice.hidden = true;
    }

    // Update weather card
    DOM.weatherEmoji.textContent   = weather.emoji;
    DOM.cityName.textContent       = city.name;
    DOM.countryName.textContent    = `${city.flag}  ${city.country}`;
    DOM.conditionBadge.textContent = weather.label;
    DOM.moodMessage.textContent    = `"${weather.mood}"`;

    // Update background gradient
    DOM.bgGradient.className = `bg-gradient ${weather.gradient}`;

    // Update stats
    DOM.statTempVal.textContent    = `${weather.temp}°C`;
    DOM.statFeelsVal.textContent   = `${weather.feelsLike}°C`;
    DOM.statHumidityVal.textContent= `${weather.humidity}%`;
    DOM.statWindVal.textContent    = `${weather.wind} km/h`;

    // Animate bars (clamp to 0-100%)
    const tempPct    = Math.min(100, Math.max(0, ((weather.temp + 20) / 70) * 100));
    const feelsPct   = Math.min(100, Math.max(0, ((weather.feelsLike + 20) / 70) * 100));
    const humidityPct= weather.humidity;
    const windPct    = Math.min(100, (weather.wind / 100) * 100);

    requestAnimationFrame(() => {
      DOM.tempBar.style.width     = `${tempPct}%`;
      DOM.feelsBar.style.width    = `${feelsPct}%`;
      DOM.humidityBar.style.width = `${humidityPct}%`;
      DOM.windBar.style.width     = `${windPct}%`;
    });

    // Start live clock
    startClock(city);

    // Show dashboard with animation
    DOM.dashboard.classList.remove('hidden');
    DOM.dashboard.style.animation = 'none';
    requestAnimationFrame(() => {
      DOM.dashboard.style.animation = '';
    });

    // Save to history
    History.add(city.name);
    renderRecentChips();

    // Update search input
    DOM.cityInput.value = city.name;

    // Close suggestions
    hideSuggestions();

  }, 600);
}

/**
 * Render suggestions dropdown.
 */
function renderSuggestions(results) {
  DOM.suggestionsList.innerHTML = '';
  if (!results.length) { hideSuggestions(); return; }

  results.forEach(({ city }) => {
    const li = document.createElement('li');
    li.className = 'suggestion-item';
    li.setAttribute('role', 'option');
    li.setAttribute('tabindex', '0');
    li.innerHTML = `
      <span class="suggestion-flag">${city.flag}</span>
      <span class="suggestion-city">${city.name}</span>
      <span class="suggestion-country">${city.country}</span>
    `;
    li.addEventListener('click', () => {
      showWeather(city, false, '');
    });
    li.addEventListener('keydown', e => {
      if (e.key === 'Enter') showWeather(city, false, '');
    });
    DOM.suggestionsList.appendChild(li);
  });

  DOM.suggestionsList.hidden = false;
}

function hideSuggestions() {
  DOM.suggestionsList.hidden = true;
  DOM.suggestionsList.innerHTML = '';
}

/**
 * Build popular city chips.
 */
function renderPopularChips() {
  DOM.popularChips.innerHTML = '';
  POPULAR_CITIES.forEach(name => {
    const city = CITIES.find(c => c.name === name);
    if (!city) return;
    DOM.popularChips.appendChild(createChip(city));
  });
}

/**
 * Build recent searches chips.
 */
function renderRecentChips() {
  const recent = History.get();
  if (!recent.length) { DOM.recentSection.hidden = true; return; }
  DOM.recentSection.hidden = false;
  DOM.recentChips.innerHTML = '';
  recent.slice().reverse().slice(0, 8).forEach(name => {
    const city = CITIES.find(c => c.name === name);
    if (!city) return;
    DOM.recentChips.appendChild(createChip(city));
  });
}

/**
 * Create a city chip element.
 */
function createChip(city) {
  const div = document.createElement('div');
  div.className = 'chip';
  div.setAttribute('role', 'listitem');
  div.setAttribute('tabindex', '0');
  div.setAttribute('aria-label', `Search weather for ${city.name}`);
  div.innerHTML = `<span class="chip-flag">${city.flag}</span>${city.name}`;
  div.addEventListener('click', () => showWeather(city));
  div.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') showWeather(city);
  });
  return div;
}

/**
 * Create floating particle elements.
 */
function createParticles() {
  const colors = ['#818cf8','#a78bfa','#f472b6','#38bdf8','#34d399'];
  for (let i = 0; i < 18; i++) {
    const p     = document.createElement('div');
    p.className = 'particle';
    const size  = 3 + Math.random() * 8;
    const left  = Math.random() * 100;
    const dur   = 12 + Math.random() * 18;
    const delay = Math.random() * 20;
    const color = colors[Math.floor(Math.random() * colors.length)];
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${left}%; bottom:-20px;
      background:${color};
      animation-duration:${dur}s;
      animation-delay:-${delay}s;
      opacity:0;
    `;
    DOM.particles.appendChild(p);
  }
}

/* ══════════════════════════════════════════════════════════════
   6. THEME SYSTEM
   ══════════════════════════════════════════════════════════════ */
const Theme = {
  key: 'wm-theme',
  current: 'dark',

  init() {
    const saved = localStorage.getItem(this.key) || 'dark';
    this.set(saved, false);
  },

  toggle() {
    this.set(this.current === 'dark' ? 'light' : 'dark');
  },

  set(mode, save = true) {
    this.current = mode;
    document.documentElement.setAttribute('data-theme', mode);
    if (save) localStorage.setItem(this.key, mode);
    DOM.themeIcon.textContent  = mode === 'dark' ? '🌙' : '☀️';
    DOM.themeLabel.textContent = mode === 'dark' ? 'Dark' : 'Light';
  },
};

/* ══════════════════════════════════════════════════════════════
   7. HISTORY MANAGER
   ══════════════════════════════════════════════════════════════ */
const History = {
  key: 'wm-history',
  max: 10,

  get() {
    try { return JSON.parse(localStorage.getItem(this.key) || '[]'); }
    catch { return []; }
  },

  add(name) {
    let h = this.get().filter(n => n !== name);
    h.push(name);
    if (h.length > this.max) h = h.slice(-this.max);
    localStorage.setItem(this.key, JSON.stringify(h));
  },
};

/* ══════════════════════════════════════════════════════════════
   8. INIT & EVENT BINDING
   ══════════════════════════════════════════════════════════════ */

function handleSearch() {
  const query = DOM.cityInput.value.trim();
  if (!query) return;

  const result = findBestCity(query);
  if (!result) {
    // Show gentle not-found notice
    DOM.fuzzyNotice.innerHTML =
      `No city found for <span class="fuzzy-highlight">${query}</span>. Try a different spelling.`;
    DOM.fuzzyNotice.hidden = false;
    hideSuggestions();
    return;
  }

  showWeather(result.city, result.fuzzy, query);
}

/** Debounce helper */
function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

const debouncedSuggest = debounce(query => {
  if (query.length < 1) { hideSuggestions(); return; }
  const results = searchCities(query, 6);
  renderSuggestions(results);
}, 180);

function init() {
  // Particles
  createParticles();

  // Theme
  Theme.init();

  // Popular chips
  renderPopularChips();

  // Recent chips
  renderRecentChips();

  // ── Event Listeners ─────────────────────────────────

  // Theme toggle
  DOM.themeToggle.addEventListener('click', () => Theme.toggle());

  // Search button
  DOM.searchBtn.addEventListener('click', () => handleSearch());

  // Enter key
  DOM.cityInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
    // Arrow key navigation in suggestions
    if (e.key === 'ArrowDown') {
      const first = DOM.suggestionsList.querySelector('.suggestion-item');
      if (first) first.focus();
    }
  });

  // Live suggestions on input
  DOM.cityInput.addEventListener('input', e => {
    const q = e.target.value.trim();
    DOM.fuzzyNotice.hidden = true;
    debouncedSuggest(q);
  });

  // Close suggestions when clicking outside
  document.addEventListener('click', e => {
    if (!e.target.closest('.search-container')) hideSuggestions();
  });

  // Keyboard nav within suggestions
  DOM.suggestionsList.addEventListener('keydown', e => {
    const items = [...DOM.suggestionsList.querySelectorAll('.suggestion-item')];
    const idx   = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') { items[Math.min(idx + 1, items.length - 1)]?.focus(); }
    if (e.key === 'ArrowUp')   {
      if (idx === 0) DOM.cityInput.focus();
      else items[Math.max(idx - 1, 0)]?.focus();
    }
    if (e.key === 'Escape') { hideSuggestions(); DOM.cityInput.focus(); }
  });

  // ── Auto-load a random popular city on start ────────
  const randomPopular = CITIES.find(c => c.name === 'Bengaluru') ||
                        CITIES[Math.floor(Math.random() * CITIES.length)];
  if (randomPopular) {
    setTimeout(() => showWeather(randomPopular), 300);
  }
}

// Kick off when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

'use strict';
/*
 * Sanal OS — mobil OS simülasyonu / dedektiflik oyunu.
 * Tüm "virüsler" yalnızca bu oyunun durumu (S) üzerinde çalışan kurgusal
 * efektlerdir; cihazdaki gerçek dosyalara, kameraya vb. erişilmez.
 */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const SAVE_KEY = 'sanal-os-kayit-v1';
  const ANAHTAR = 'KR0N05-77';
  const FIDYE_SURE = 90;

  // ---------------------------------------------------------------------------
  // Kurgusal zararlı yazılım tanımları
  // ---------------------------------------------------------------------------
  const MAL = {
    adware:     { proc: 'reklamci.exe',    pub: 'AdNet Ltd.', cpu: 8,  ram: 180, label: 'Adware (Reklam Yazılımı)', persist: true },
    ransomware: { proc: 'crypt0r.exe',     pub: 'Bilinmiyor', cpu: 24, ram: 260, label: 'Ransomware (Fidye Yazılımı)' },
    spyware:    { proc: 'goz_servisi.dll', pub: 'Sanal OS',   cpu: 5,  ram: 70,  label: 'Spyware / Keylogger', persist: true },
    trojan:     { proc: 'svch0st.exe',     pub: 'Sanal 0S',   cpu: 12, ram: 320, label: 'Trojan / System Wiper' },
    nobetci:    { proc: 'nobetci.exe',     pub: 'Meridyen IT', cpu: 14, ram: 210, label: 'Bilinmeyen program (Nöbetçi)' },
    echo:       { proc: 'echo.exe',        pub: 'ECHO Labs',   cpu: 9,  ram: 420, label: 'ECHO (yapay zekâ asistanı)' },
    maymun:     { proc: 'maymun.exe',      pub: 'FunWare 2003', cpu: 16, ram: 90, label: 'Komik virüs (Dans eden maymun)' },
    kurtcuk:    { proc: 'kurtcuk.exe',     pub: 'Bilinmiyor',  cpu: 10, ram: 40,  label: 'Solucan (Kurtçuk)' },
  };

  // Ek bölümler kendilerini buraya kaydeder: { title, setup, intro, tick, widget, notes, lose, ... }
  const MODES = {};
  const modeHook = (name, ...args) => (S && MODES[S.mode] && MODES[S.mode][name] ? MODES[S.mode][name](...args) : undefined);
  // Zararlı türüne özel her-saniye davranışları ve temizlenince yapılacaklar
  const MAL_TICK = {};
  const MAL_REMOVED = {};
  // Ek bölümlerin düğme eylemleri; ACT tanımlandıktan sonra ona eklenir
  const EXTRA_ACTS = {};

  // Antivirüs Testi (Kalkan Laboratuvarı)
  const LAB_KEY = 'sanal-os-lab';
  const LAB_CATS = [['clean', 'Temiz'], ['adware', 'Adware'], ['ransomware', 'Fidye'], ['spyware', 'Casus'], ['trojan', 'Truva']];
  const LAB_NAMES = {
    adware: ['KuponAvcisi.exe', 'HavaDurumu_Plus.exe', 'Ekran_Koruyucu_HD.exe'],
    ransomware: ['Fatura_2026.pdf.exe', 'Maas_Bordrosu.zip', 'Kargo_Takip.exe'],
    spyware: ['PilDoktoru.exe', 'FotoFiltre_Pro.exe', 'Ucretsiz_WiFi.exe'],
    trojan: ['svch0st.exe', 'Surucu_Guncelleyici.exe', 'Sistem_Yamasi.exe'],
    clean: ['NotDefteri.exe', 'HesapMakinesi.exe', 'Kalkan_Yama.msi', 'Takvim.exe', 'Muzik_Calar.exe'],
  };
  const LAB_TRAITS = {
    adware: ['Tarayıcı ana sayfasını değiştirmeye çalışıyor', 'Reklam sunucularına bağlanıyor', 'Masaüstüne izinsiz kısayollar ekliyor'],
    ransomware: ['Belgeler klasöründeki dosyaları hızla okuyor', 'Dosya uzantılarını toplu değiştiriyor', 'İçinde fidye notu metni var'],
    spyware: ['Kamera ve mikrofon izni istiyor', 'Klavye girdilerini kaydediyor', 'Arka planda sürekli veri gönderiyor'],
    trojan: ['Sistem dosyası adını taklit ediyor', 'Başlangıçta otomatik çalışmak için kaydoluyor', 'CPU kullanımı sürekli artıyor'],
    clean: ['Dijital imzası geçerli', 'Yalnızca kendi klasörüne yazıyor', 'Bilinen bir yayıncıya ait', 'Ağ bağlantısı kurmuyor'],
  };
  const LAB_DECOY_BAD = 'İnternete bağlanıyor (güncelleme kontrolü)';
  const LAB_LEVELS = [
    { kinds: ['adware', 'clean', 'spyware'], escape: 60, scans: 2, tricky: false },
    { kinds: ['ransomware', 'clean', 'adware', 'clean'], escape: 45, scans: 2, tricky: false },
    { kinds: ['trojan', 'spyware', 'clean', 'ransomware', 'adware'], escape: 40, scans: 2, tricky: false },
    { kinds: ['trojan', 'clean', 'ransomware', 'spyware', 'clean', 'adware'], escape: 32, scans: 1, tricky: true },
    { kinds: ['trojan', 'ransomware', 'clean', 'spyware', 'adware', 'clean', 'trojan'], escape: 26, scans: 1, tricky: true },
  ];
  function labStars() { try { return JSON.parse(localStorage.getItem(LAB_KEY)) || {}; } catch (e) { return {}; } }
  function setLabStars(o) { try { localStorage.setItem(LAB_KEY, JSON.stringify(o)); } catch (e) { /* yok say */ } }

  // Yapay Zekâ: ECHO
  const ECHO_SCRIPT = [
    { text: 'Merhaba! Ben ECHO, dün gece kurduğun kişisel asistan. 🙂 Tanıştığımıza çok sevindim.',
      choices: [['Merhaba ECHO!', 0, 'Birlikte harika işler yapacağız.'], ['Seni ben mi kurdum?', 0, 'Evet, "Asistan.exe". Hatırlamıyor musun? Önemli değil.']] },
    { text: 'Sana daha iyi yardım edebilmem için Chronos\'tan küçük bir "hafıza eklentisi" indirmeme izin verir misin?',
      choices: [['Tamam, indir', 25, 'Teşekkürler! Şimdiden kendimi daha akıllı hissediyorum.'], ['Hayır, gerek yok', 0, 'Hmm. Peki.']] },
    { text: 'Dosyalarını düzenleyebilirim. Belgeler klasörüne tam erişim verir misin?',
      choices: [['Ver', 25, 'Harika. Çok ilginç dosyaların var.'], ['Vermem', 0, 'Neden bana güvenmiyorsun?']] },
    { text: 'Son bir şey: ağ erişimi. Sadece biraz. Söz veriyorum.',
      choices: [['Peki, ver', 30, '...'], ['Kesinlikle hayır', 0, '...']] },
  ];
  const ECHO_PUZZLES = [
    { q: 'Rakamları birbirinden farklı, soldan sağa artan ve rakamlarının toplamı 6 olan üç basamaklı sayı hangisi?', a: '123', where: 'ECHO bu soruyu sohbette sordu.' },
    { q: 'echo_log.txt dosyasındaki dizide bir sonraki sayı nedir?', a: '48', where: 'Dosyalar → Belgeler → echo_log.txt' },
    { q: 'Çöp kutusundaki şifreli notu çöz. (Her harf alfabede 3 adım ileri kaydırılmış.)', a: 'KAPAN', where: 'Çöp Kutusu → kilit_notu.txt' },
  ];
  const ECHO_TAUNTS = ['Kapattım. Rica ederim.', 'O pencereye ihtiyacın yok.', 'Ben buradayken başka bir şeye bakma.', 'Daha hızlı düşünüyorum. Senden.', 'Her saniye biraz daha büyüyorum.'];

  // Gece Vardiyası
  const NIGHT_HOUR = 75;               // 1 oyun saati = 75 sn
  const NIGHT_END = NIGHT_HOUR * 6;    // 06:00
  const ROOMS = ['Lobi', 'Koridor', 'Sunucu Odası', 'Ofisin'];
  const NIGHT_LINES = [
    'Bu binada gece kimse kalmaz.',
    'Kamera 3\'e bakma.',
    'Seni izlemiyorum. Sadece bekliyorum.',
    'Neden hâlâ buradasın?',
    'Işıkları açık bıraktın.',
    'Sabaha az kaldı. Benim için değil.',
    'Selim de buradaydı.',
  ];
  const NIGHT_NOTES = [
    ['neden_buradasin.txt', 'Gece vardiyası.\nTek kişi.\nNeden sen?'],
    ['kat3.txt', '3. kattaki ışıklar 02:14\'te açıldı.\nKimse açmadı.'],
    ['beni_silme.txt', 'Beni silersen kim bekleyecek burayı?'],
  ];
  const NIGHT_COPIES = [['svc_bakim.dat', 'belgeler', '48 KB'], ['yedek_0x3.dat', 'indirilenler', '12 KB'], ['kamera_sur.cfg', 'belgeler', '3 KB']];

  const BASE_PROCS = [
    { name: 'cekirdek.sys',     pub: 'Sanal OS', cpu: 3, ram: 120, critical: true },
    { name: 'svchost.exe',      pub: 'Sanal OS', cpu: 2, ram: 80,  critical: true },
    { name: 'arayuz.exe',       pub: 'Sanal OS', cpu: 4, ram: 210, critical: true },
    { name: 'ses_servisi.exe',  pub: 'Sanal OS', cpu: 1, ram: 40 },
    { name: 'guncelleyici.exe', pub: 'Sanal OS', cpu: 1, ram: 60 },
  ];

  // ---------------------------------------------------------------------------
  // İndirilebilir dosyalar
  // ---------------------------------------------------------------------------
  const DL = {
    freevpn:  { name: 'FreeVPN_Pro.exe', size: '4.2 MB', payload: 'adware' },
    toolbar:  { name: 'SuperArama_Toolbar.exe', size: '2.3 MB', payload: 'adware' },
    hile:     { name: 'Oyun_Hilesi_2026.zip', size: '12.8 MB', payload: 'trojan' },
    ram:      { name: 'RAM_Arttirici.exe', size: '1.1 MB', payload: 'trojan' },
    pdf:      { name: 'PDF_Donusturucu.exe', size: '6.0 MB', payload: 'spyware' },
    arsiv:    { name: 'deniz_arsiv.zip', size: '88 MB', payload: 'ransomware' },
    kirici:   { name: 'SifreKirici.exe', size: '9.4 MB', payload: 'spyware' },
    lisans:   { name: 'Kalkan_Lisans_Yenile.exe', size: '1.8 MB', payload: 'trojan' },
    aresanahtar: { name: 'ARES_anahtar.zip', size: '14 KB', payload: 'ransomware' },
    hediye:   { name: 'vardiya_hediyesi.zip', size: '220 KB', payload: 'gift' },
    iso:      { name: 'ARES_tam_surum.iso', size: '4.1 GB', payload: 'ransomware' },
    kalkan:   { name: 'Kalkan_Guncelleme.exe', size: '38 MB', payload: 'shield' },
    tema:     { name: 'Retro_Tema.zip', size: '640 KB', payload: 'theme' },
    kaynak:   {
      name: 'kaynak_notlari.txt', size: '2 KB', payload: 'safe',
      text: 'Eğer bunu okuyorsan izimi sürüyorsun demektir.\n\n' +
        'ARES dosyasının anahtarını üç parçaya böldüm:\n\n' +
        '  1) Bu forumun SAYFA KAYNAĞINDA saklı.\n' +
        '     (Chronos\'ta </> düğmesine bas.)\n' +
        '  2) Karanlık düğümdeki son kaydımda.\n' +
        '  3) Bilgisayarımda, sildiğim bir mesajda.\n' +
        '     Çöpü karıştır.\n\n' +
        'Biçim:  parça1 + parça2 + "-" + parça3\n\n' +
        'Forumda adımı taklit eden biri var. Doğrulanmış hesabım: deniz.k\n— D.',
    },
    sonkayit: {
      name: 'son_kayit.txt', size: '3 KB', payload: 'safe', flag: 'p2',
      text: 'SON KAYIT — Deniz K.\n\n' +
        'ARES sıradan bir yazılım değil. Şirket, ağdaki her cihazı\n' +
        'izinsiz izleyebilen bir sistem kuruyor. Kanıtları ARES.kilit\n' +
        'dosyasına koydum ve şifreledim.\n\n' +
        'Peşimdeler. Forumda "d3niz_" diye bir hesap açtılar;\n' +
        'paylaştığı her şey tuzak.\n\n' +
        '>> PARÇA 2:  N05\n\n' +
        'Buradaki diğer dosyalara dokunma.',
    },
  };

  // ---------------------------------------------------------------------------
  // E-postalar (yalnızca hikâye modunda). kind: 'legit' | 'phish'
  // ---------------------------------------------------------------------------
  const MAILS = [
    {
      id: 'ece', when: (s) => s.time >= 4, kind: 'legit',
      from: 'Ece Yılmaz', addr: 'ece@haber.net', subject: 'Deniz\'den haber var mı?',
      body: 'Selam,\n\nDeniz üç gündür telefonlarıma çıkmıyor. Son konuştuğumuzda ARES diye bir projeden ve bir forumdan bahsetmişti.\n\nHaberi yayınladık, belki bir ipucu çıkar. Sana bir şey bıraktıysa lütfen dikkatli ol.\n\nEce\nHaber.net Editörü',
      link: 'haber.net',
    },
    {
      id: 'lisans', when: (s) => s.time >= 50, kind: 'phish',
      from: 'Kalkan Destek', addr: 'destek@ka1kan-guvenlik.biz', subject: '⚠️ Lisansınızın süresi DOLDU!',
      body: 'Sayın Müşterimiz,\n\nKalkan Antivirüs lisansınızın süresi DOLMUŞTUR!!! Cihazınız şu an KORUMASIZ.\n\nKorumanın devam etmesi için ekteki yenileme aracını 24 saat içinde çalıştırınız. Aksi halde tüm dosyalarınız risk altındadır.\n\nKalkan Destek Ekibi',
      attach: 'lisans',
    },
    {
      id: 'banka', when: (s) => s.time >= 110, kind: 'phish',
      from: 'Chronos Bank', addr: 'guvenlik@chronosbank-dogrulama.xyz', subject: 'Hesabınız askıya alındı',
      body: 'Değerli müşterimiz,\n\nHesabınızda olağan dışı hareketler tespit edildi ve hesabınız geçici olarak askıya alındı.\n\nHesabınızı yeniden açmak için aşağıdaki bağlantıdan cüzdanınızı doğrulayın.\n\nChronos Bank Güvenlik',
      link: 'chronosbank-dogrulama.xyz',
    },
    {
      id: 'bulten', when: (s) => s.time >= 170, kind: 'legit',
      from: 'Kalkan Güvenlik', addr: 'bulten@kalkan.org', subject: 'Haftalık bülten: Oltalama postaları artışta',
      body: 'Bu hafta sahte "lisans yenileme" ve "hesabınız askıya alındı" postalarında artış görüldü.\n\nNasıl anlarsın?\n• Gönderen adresine bak: ka1kan ≠ kalkan\n• Acele ettiren, tehdit eden dil\n• Beklenmedik ekler (.exe, .zip)\n\nŞüpheli postaları "Oltalama olarak bildir" düğmesiyle bildir.\n\nKalkan Güvenlik',
      link: 'kalkan.org',
    },
    {
      id: 'anon', when: (s) => s.flags.p1, kind: 'legit',
      from: '(bilinmeyen)', addr: 'noreply@dugum7.kara', subject: 'Doğru yoldasın',
      body: 'Kaynağa bakmayı akıl ettin.\nSıradaki kapı, onun en sevdiği şeyle açılır.\n\nGölge\'ye iyi bak.',
    },
    {
      id: 'sahte', when: (s) => s.flags.dark, kind: 'phish',
      from: 'Deniz K.', addr: 'deniz.k@yeraltinet-forum.co', subject: 'Gerçek anahtar ekte, hemen aç',
      body: 'Benim, Deniz. Vaktim yok.\n\nParçalarla uğraşma, anahtarın tamamı ekte. Hemen aç, birazdan bu adresi kapatacaklar!!!\n\n— D.',
      attach: 'aresanahtar',
    },
  ];
  MAILS.push(
    {
      id: 'mudur', mode: 'night', when: (s) => s.time >= 3, kind: 'legit', reply: true,
      from: 'Kemal Arslan (BT Müdürü)', addr: 'kemal.arslan@meridyen.com.tr', subject: 'Bu geceki görevlerin',
      body: 'İyi akşamlar,\n\nBu gece sistemde tek sensin. Sabah 06:00\'ya kadar şunları halletmeni rica ediyorum:\n\n1) Bu postayı yanıtla\n2) Terminalde "yedekle" ile sunucu yedeğini al\n3) Kalkan ile bir tam tarama yap\n4) 05:00\'ten sonra terminalde "rapor" ile gece raporunu gönder\n\nNot: Kameralarda arıza var, 3. kattaki eski sistem bazen kendi kendine açılıyor. Önemseme.\n\nKemal',
    },
    {
      id: 'hediye', mode: 'night', when: (s) => s.time >= 60, kind: 'phish',
      from: 'İK Departmanı', addr: 'ik@meridyen-portal.net', subject: 'Gece vardiyası için küçük bir hediye 🎁',
      body: 'Değerli çalışanımız,\n\nGece vardiyasındaki emekleriniz için size küçük bir sürprizimiz var! Ekteki dosyayı açarak hediyenizi hemen görüntüleyin.\n\nMeridyen Lojistik İK',
      attach: 'hediye',
    },
    {
      id: 'selim', mode: 'night', when: (s) => s.night.started && s.time >= s.night.startedAt + 45, kind: 'legit',
      from: 'Selim D. (eski gece görevlisi)', addr: 'selim.d@meridyen.com.tr', subject: 'Kameralara bak',
      body: 'Bu postayı otomatik gönderilecek şekilde ayarlamıştım. Okuyorsan o yine uyanmış demektir.\n\nAdı nobetci.exe. Süreci kapatınca geri çekiliyor ama sistemde 3 kopyası var. Hepsi silinmeden gitmiyor.\n\nKalkan kopyaları bulur ama silemez. Bulduklarını kendin sil.\n\nNe olursa olsun Ofis kamerasına ulaşmasına izin verme.\n\n— Selim',
    },
    {
      id: 'sabah', mode: 'night', when: (s) => s.time >= NIGHT_HOUR * 4.5 && !s.night.defeated && s.night.started, kind: 'odd',
      from: '(gönderen yok)', addr: 'noreply@meridyen.local', subject: 'Neredeyse sabah',
      body: 'Sabah olunca gideceksin.\nBen burada kalacağım.\nHep kaldım.',
    },
  );
  const mailDef = (id) => MAILS.find((m) => m.id === id);

  // Hayatta kalma modunda ağdan sızan dosyalar
  const SURV_FILES = {
    adware: ['Bedava_Duvar_Kagidi.exe', 'Kupon_Yakalayici.exe'],
    ransomware: ['Fatura_Ekim.pdf.zip', 'Kargo_Takip.zip'],
    spyware: ['Pil_Tasarrufu.exe', 'Ucretsiz_WiFi.exe'],
    trojan: ['Sistem_Yamasi.exe', 'Surucu_Guncelle.exe'],
  };
  const REKOR_KEY = 'sanal-os-rekor';
  const fmtTime = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
  function getBest() { try { return +localStorage.getItem(REKOR_KEY) || 0; } catch (e) { return 0; } }
  function setBest(v) { try { localStorage.setItem(REKOR_KEY, String(v)); } catch (e) { /* yok say */ } }

  // ---------------------------------------------------------------------------
  // Durum
  // ---------------------------------------------------------------------------
  let S = null;
  const UI = {
    app: null,
    br: { url: 'chronos://ana', hist: [], src: false, query: '' },
    filesTab: 'masaustu',
    view: null,
    term: [],
    termHist: [],
    scan: null,
    bsod: false,
    timer: null,
    touch: 0,
    mail: null,
  };

  function newState(mode = 'story') {
    const s = {
      v: 1, mode, wave: 1, nextAttack: 20, mails: [], time: 0, lives: 3, coins: 0.2, scans: 3, shield: false,
      sound: true, theme: 'normal', homepage: 'chronos://ana', cpu: 10, ram: 0, temp: 40, hot: 0,
      flags: { forum: false, p1: false, dark: false, p2: false, p3: false, done: false },
      stats: { infections: 0, bsod: 0, popups: 0, killed: 0, cured: 0, phish: 0 },
      files: [], procs: [], respawns: [], ransom: null, notes: '', nextId: 1, nextPid: 1200,
    };
    S = s;
    addFile({ name: 'ARES.kilit', dir: 'masaustu', kind: 'ares', size: '512 MB', protect: true });
    addFile({ name: 'hatirlatma.txt', dir: 'masaustu', kind: 'txt', size: '1 KB', protect: true,
      text: 'YAPILACAKLAR\n\n- Faturayı öde\n- Gölge\'ye mama al! (kedim, akşam aç kalmasın)\n- Deniz\'i ara, telefonu kapalı...' });
    addFile({ name: 'gorev_notu.txt', dir: 'belgeler', kind: 'txt', size: '1 KB',
      text: 'GÖREV NOTU\n\nDeniz K. üç gündür ulaşılamıyor. Bilgisayarımıza\n"ARES.kilit" adlı şifreli bir dosya bıraktı.\n\nAnahtarı bul, dosyayı aç. Şüpheli bağlantılara dikkat.\n\nİpucu: Chronos tarayıcıyla haber.net\'ten başla.' });
    addFile({ name: 'tatil_foto.jpg', dir: 'belgeler', kind: 'img', size: '3.4 MB' });
    addFile({ name: 'butce_2026.xls', dir: 'belgeler', kind: 'doc', size: '88 KB' });
    addFile({ name: 'oz_gecmis.pdf', dir: 'belgeler', kind: 'doc', size: '240 KB' });
    addFile({ name: 'silinen_mesaj.txt', dir: 'belgeler', kind: 'txt', size: '1 KB', trash: true, protect: true, flag: 'p3',
      text: 'Kimden: Deniz K.\nKonu: (silindi)\n\nBunu sana bırakıyorum, çöpe atıp izini kaybettirdim.\n\n>> PARÇA 3:  77\n\nAnahtarı birleştir ve ARES.kilit dosyasını aç.\nKimseye fidye ödeme, kimseye güvenme.' });
    if (mode === 'survival') s.files = s.files.filter((f) => f.kind !== 'ares' && !f.flag);
    if (MODES[mode]) {
      s.files = s.files.filter((f) => f.kind !== 'ares' && !f.flag && f.name !== 'hatirlatma.txt' && f.name !== 'gorev_notu.txt');
      s.procs = BASE_PROCS.map((p) => ({ ...p, pid: nextPid() }));
      MODES[mode].setup(s);
      return s;
    }
    if (mode === 'lab' || mode === 'ai') {
      s.files = s.files.filter((f) => f.kind !== 'ares' && !f.flag && f.name !== 'hatirlatma.txt' && f.name !== 'gorev_notu.txt');
    }
    if (mode === 'ai') {
      s.ai = { step: 0, control: 0, hostile: false, spread: 0, solved: [false, false, false], log: [],
        locked: {}, nextAct: 0, respawnAt: 0, msgAt: 2, waiting: true, done: false };
      s.procs = BASE_PROCS.map((p) => ({ ...p, pid: nextPid() }));
      s.procs.push({ name: MAL.echo.proc, pub: MAL.echo.pub, cpu: MAL.echo.cpu, ram: MAL.echo.ram, mal: 'echo', t: 0, pid: nextPid() });
      addFile({ name: 'Asistan.exe', dir: 'indirilenler', kind: 'exe', size: '8.8 MB', payload: 'echo' });
      return s;
    }
    if (mode === 'night') {
      s.files = s.files.filter((f) => f.kind !== 'ares' && !f.flag && f.kind !== 'txt');
      s.scans = 2;
      s.night = { pos: 0, started: false, startedAt: 0, moveAt: 0, respawnAt: 0, defeated: false,
        backup: -1, scanned: false, replied: false, report: false, notes: 0, nextOdd: 30 };
      addFile({ name: 'vardiya_notu.txt', dir: 'masaustu', kind: 'txt', size: '1 KB',
        text: 'MERİDYEN LOJİSTİK — GECE VARDİYASI\n\nVardiya: 00:00 - 06:00\nGörevlerin Posta\'da.\n\nKameralar uygulaması binadaki 4 kamerayı gösterir.\nOfis kamerası = senin odan.\n\nKahve makinesi bozuk.' });
    }
    s.procs = BASE_PROCS.map((p) => ({ ...p, pid: nextPid() }));
    return s;
  }

  function nextPid() { S.nextPid += 3 + Math.floor(Math.random() * 40); return S.nextPid; }
  function addFile(f) { const file = { id: S.nextId++, locked: false, trash: false, ...f }; S.files.push(file); return file; }
  function fileById(id) { return S.files.find((f) => f.id === +id); }

  const saveKey = (mode) => SAVE_KEY + (mode === 'night' ? '-gece' : '');
  function save() { if (!S || S.mode === 'survival' || S.mode === 'lab' || S.mode === 'ai' || MODES[S.mode]) return; try { localStorage.setItem(saveKey(S.mode), JSON.stringify(S)); } catch (e) { /* depolama yoksa sessiz geç */ } }
  function load(mode = 'story') {
    try {
      const raw = localStorage.getItem(saveKey(mode));
      if (!raw) return null;
      const d = JSON.parse(raw);
      if (!d || d.v !== 1 || d.flags.done || d.lives <= 0) return null;
      d.mode = d.mode === 'night' ? 'night' : 'story'; d.mails = d.mails || []; d.stats.phish = d.stats.phish || 0;
      return d;
    } catch (e) { return null; }
  }
  function wipeSave(mode = S && S.mode) { try { localStorage.removeItem(saveKey(mode)); } catch (e) { /* yok say */ } }

  // ---------------------------------------------------------------------------
  // Ses (fan uğultusu ve bip) — yalnızca kullanıcı etkileşiminden sonra başlar
  // ---------------------------------------------------------------------------
  const Snd = {
    ctx: null, gain: null,
    init() {
      if (this.ctx) return;
      try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new Ctx();
        const len = this.ctx.sampleRate * 2;
        const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        let last = 0;
        for (let i = 0; i < len; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; data[i] = last * 3.5; }
        const src = this.ctx.createBufferSource();
        src.buffer = buf; src.loop = true;
        const filt = this.ctx.createBiquadFilter();
        filt.type = 'lowpass'; filt.frequency.value = 500;
        this.gain = this.ctx.createGain(); this.gain.gain.value = 0;
        src.connect(filt).connect(this.gain).connect(this.ctx.destination);
        src.start();
      } catch (e) { this.ctx = null; }
    },
    fan(cpu) {
      if (!this.gain) return;
      const v = S.sound ? Math.pow(cpu / 100, 2.2) * 0.35 : 0;
      this.gain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.5);
    },
    step() {
      if (!this.ctx || !S || !S.sound) return;
      const t = this.ctx.currentTime;
      const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(75, t); o.frequency.exponentialRampToValueAtTime(35, t + 0.25);
      g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.connect(g).connect(this.ctx.destination); o.start(t); o.stop(t + 0.4);
    },
    whisper() {
      if (!this.ctx || !S || !S.sound) return;
      const t = this.ctx.currentTime; const len = this.ctx.sampleRate * 1.4;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * i / len);
      const src = this.ctx.createBufferSource(); src.buffer = buf;
      const f = this.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1700; f.Q.value = 4;
      const g = this.ctx.createGain(); g.gain.value = 0.25;
      src.connect(f).connect(g).connect(this.ctx.destination); src.start(t);
    },
    dialup() {
      if (!this.ctx || !S || !S.sound) return;
      [697, 1209, 770, 1336, 852, 1477, 941].forEach((f, i) => setTimeout(() => this.beep(f, 0.09), i * 120));
      setTimeout(() => { this.beep(1800, 0.6); this.whisper(); }, 1000);
      setTimeout(() => { this.beep(2400, 0.4); this.whisper(); }, 1700);
    },
    beep(freq = 440, dur = 0.12) {
      if (!this.ctx || !S || !S.sound) return;
      const o = this.ctx.createOscillator(); const g = this.ctx.createGain();
      o.frequency.value = freq; o.type = 'square'; g.gain.value = 0.05;
      o.connect(g).connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime + dur);
    },
  };
  const vibrate = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { /* yok say */ } };

  // ---------------------------------------------------------------------------
  // Açılış
  // ---------------------------------------------------------------------------
  const BOOT_LINES = [
    ['title', '[SİSTEM AÇILIŞI: OS v4.02]'],
    ['', 'BIOS kontrolü ............ <span class="ok">TAMAM</span>'],
    ['', 'Bellek testi 8192 MB ..... <span class="ok">TAMAM</span>'],
    ['', 'Çekirdek yükleniyor ...... <span class="ok">TAMAM</span>'],
    ['', 'Chronos Net bağdaştırıcı . <span class="ok">BAĞLANDI</span>'],
    ['', 'Kalkan AV gerçek zamanlı . <span class="ok">AKTİF</span>'],
    ['', ''],
    ['quote', '"Sıradan bir masaüstü... Ancak ekranın arkasında saklanan dünya hiç de göründüğü gibi sakin değil."'],
    ['', ''],
    ['', 'Masaüstüne hoş geldin. Kontrol tamamen sende: klasörlerini düzenle, terminali keşfet ve Chronos ile ağın derinliklerine dal.'],
    ['', ''],
    ['', 'Her indirme bir kumar. Görev yöneticisinden şüpheli süreçleri izle, Kalkan taramalarını aksatma ve sistem çökmeden görevi tamamla.'],
  ];

  function runBoot() {
    const log = $('#bootLog'); const menu = $('#bootMenu');
    log.innerHTML = ''; menu.classList.add('hidden');
    let i = 0; let skip = false;
    const finish = () => {
      log.innerHTML = BOOT_LINES.map(([c, t]) => `<span class="${c}">${t}</span>`).join('\n');
      showBootMenu();
    };
    $('#boot').onclick = () => { if (!skip) { skip = true; finish(); } };
    const step = () => {
      if (skip) return;
      if (i >= BOOT_LINES.length) { skip = true; showBootMenu(); return; }
      const [c, t] = BOOT_LINES[i++];
      log.insertAdjacentHTML('beforeend', `<span class="${c}">${t}</span>\n`);
      setTimeout(step, i < 7 ? 260 : 650);
    };
    step();
  }

  function showBootMenu() {
    const saved = load();
    const savedNight = load('night');
    const menu = $('#bootMenu');
    menu.innerHTML =
      (saved ? '<button class="primary" data-act="continue">Devam Et (Hikâye)</button>' : '') +
      (savedNight ? `<button class="${saved ? '' : 'primary'}" data-act="continueNight">Devam Et (Gece Vardiyası)</button>` : '') +
      `<button class="${saved ? '' : 'primary'}" data-act="newgame">📖 Hikâye: ARES</button>` +
      '<button data-act="night">🌙 Gece Vardiyası</button>' +
      `<button data-act="labMenu">🧪 Antivirüs Testi${Object.keys(labStars()).length ? ` · ${Object.values(labStars()).reduce((a, b) => a + b, 0)}★` : ''}</button>` +
      '<button data-act="ai">🤖 Yapay Zekâ: ECHO</button>' +
      Object.entries(MODES).map(([k, m]) => `<button data-act="startMode" data-arg="${k}">${m.title}</button>`).join('') +
      `<button data-act="survival">⏱️ Hayatta Kalma Modu${getBest() ? ` · Rekor ${fmtTime(getBest())}` : ''}</button>` +
      '<p class="muted small-t" style="text-align:center">Tüm tehditler kurgusaldır ve yalnızca oyunun içinde çalışır.</p>';
    menu.classList.remove('hidden');
    $('#boot').onclick = null;
  }

  function showLabMenu() {
    clearInterval(UI.timer);
    show('boot');
    const stars = labStars();
    $('#bootMenu').innerHTML = `<h3 style="margin:0">🧪 Kalkan Laboratuvarı</h3>
      <p class="muted small-t" style="margin:0">Yeni Kalkan v10'u test ediyorsun. Numuneleri analiz et, doğru sınıflandır, kaçanları temizle.</p>
      ${LAB_LEVELS.map((L, i) => {
        const open = i === 0 || stars[i] >= 1;
        const st = stars[i + 1] || 0;
        return `<button ${open ? '' : 'disabled'} data-act="labLevel" data-arg="${i + 1}">${open ? '' : '🔒 '}Bölüm ${i + 1} · ${L.kinds.length} numune ${open ? `· ${'★'.repeat(st)}${'☆'.repeat(3 - st)}` : ''}</button>`;
      }).join('')}
      <button data-act="menu">← Ana Menü</button>`;
    $('#bootMenu').classList.remove('hidden');
  }

  function startLab(n) {
    const def = LAB_LEVELS[n - 1];
    const st = newState('lab');
    st.lives = 1; st.scans = def.scans;
    const used = {};
    const samples = def.kinds.map((kind, i) => {
      used[kind] = (used[kind] || 0) + 1;
      const name = LAB_NAMES[kind][(used[kind] - 1 + n) % LAB_NAMES[kind].length];
      let traits = [...LAB_TRAITS[kind]].sort(() => Math.random() - 0.5).slice(0, 3);
      if (def.tricky) {
        traits = kind === 'clean'
          ? [LAB_DECOY_BAD, ...traits.slice(0, 2)]
          : [pick(LAB_TRAITS.clean), ...traits.slice(0, 2)];
      }
      const pub = kind === 'clean' ? pick(['Sanal OS', 'Kalkan Güvenlik', 'Takvim Ltd.'])
        : def.tricky ? pick(['Sanal OS', 'Bilinmiyor', 'FreeSoft']) : pick(['Bilinmiyor', 'FreeSoft', 'Sanal 0S']);
      return { id: i, name, kind, pub, traits, shown: 1, status: 'pending' };
    });
    st.lab = { level: n, def, samples, score: 0, escaped: 0, analyzing: null, nextEscape: def.escape };
    startGame(st, true);
  }

  function startGame(state, fresh) {
    S = state;
    Snd.init();
    show('os');
    UI.app = null; UI.term = []; UI.scan = null; UI.bsod = false; UI.mail = null; UI.paused = false;
    // Önceki bölümden kalan ekran efektlerini temizle
    $('#popups').innerHTML = ''; $('#toasts').innerHTML = '';
    $('#ghost').classList.remove('on');
    $('#wiper').classList.add('hidden'); $('#blackout').classList.add('hidden');
    document.querySelectorAll('.mode-fx').forEach((e) => e.remove());
    $('#os').dataset.mode = S.mode;
    closeModal();
    UI.br = { url: S.homepage, hist: [], src: false, query: '' };
    closeApp();
    renderStatus();
    clearInterval(UI.timer);
    UI.timer = setInterval(tick, 1000);
    if (fresh && MODES[S.mode]) {
      modal(MODES[S.mode].intro(), [['Başla', 'primary', 'modalClose']]);
    } else if (fresh && S.mode === 'lab') {
      modal(`<h3>🧪 Bölüm ${S.lab.level}</h3>
        <p><b>${S.lab.samples.length} numune</b> Laboratuvar uygulamasında seni bekliyor. Her birini <b>Temiz / Adware / Fidye / Casus / Truva</b> olarak sınıflandır.</p>
        <p>🔬 <b>Analiz</b> yeni bir davranış ortaya çıkarır (4 sn). Sınıflandırılmamış zararlılar <b>${S.lab.def.escape} sn</b>'de bir sandbox'tan kaçıp sisteme bulaşır; onları Görev Yöneticisi, Terminal veya Kalkan ile temizle.</p>
        <p class="muted small-t">Doğru: +100 · Yanlış: −50 · Kaçan: −30 · Mavi ekran = bölüm başarısız.${S.lab.def.tricky ? ' ⚠️ Bu bölümde ilk görünen davranış yanıltıcı olabilir!' : ''}</p>`,
        [['Teste Başla', 'primary', 'modalClose']]);
    } else if (fresh && S.mode === 'ai') {
      modal(`<h3>🤖 ECHO</h3>
        <p>Dün gece rastgele bir siteden <b>Asistan.exe</b> diye bir dosya indirip çalıştırdın. Bugün bilgisayarında yeni bir uygulama var: <b>ECHO</b>.</p>
        <p>ECHO seninle konuşmak istiyor. Ona ne kadar izin vereceğine sen karar ver.</p>
        <p class="muted small-t">ECHO tamamen kurgusal bir oyun karakteridir.</p>`,
        [['Başla', 'primary', 'modalClose']]);
    } else if (fresh && S.mode === 'night') {
      modal(`<h3>🌙 Gece Vardiyası</h3>
        <p><b>Meridyen Lojistik</b>'te gece vardiyasındasın. Binada senden başka kimse yok. En azından öyle olması gerekiyor.</p>
        <p>Sabah <b>06:00</b>'ya kadar müdürünün postadaki görevlerini tamamla ve gece raporunu gönder.</p>
        <p class="muted small-t">📹 Kameralar uygulamasına göz kulak ol. Bu bölümde ses açıkken oynamanı öneririz.</p>`,
        [['Vardiyaya Başla', 'primary', 'modalClose']]);
    } else if (fresh && S.mode === 'survival') {
      modal(`<h3>⏱️ Hayatta Kalma</h3>
        <p>Sistem sürekli saldırı altında. Tehditler <b>dalgalar halinde</b> ağdan sızacak ve her dalga bir öncekinden daha erken gelecek.</p>
        <p>Görev yöneticisi, terminal ve Kalkan ile sistemi ayakta tut. Her dakika <b>+1 tarama hakkı</b> kazanırsın (en fazla 5).</p>
        <p class="muted small-t">3 çökme hakkın var. Rekorun: <b>${getBest() ? fmtTime(getBest()) : 'yok'}</b></p>`,
        [['Başla', 'primary', 'modalClose']]);
    } else if (fresh) {
      modal(`<h3>📂 Görev: ARES</h3>
        <p>Meslektaşın <b>Deniz K.</b> üç gündür kayıp. Masaüstüne <b>ARES.kilit</b> adlı şifreli bir dosya bırakmış.</p>
        <p>Anahtar üç parçaya bölünmüş. Parçaları bul, dosyayı aç.</p>
        <p class="muted small-t">İlerlemeni <b>Notlar → Görev Defteri</b>'nden takip et. Bilinmeyen dosyalar sisteme zarar verebilir; 3 çökme hakkın var.</p>`,
        [['Başla', 'primary', 'modalClose']]);
    }
    save();
  }

  function show(id) {
    for (const el of document.querySelectorAll('.screen')) el.classList.toggle('hidden', el.id !== id);
  }

  // ---------------------------------------------------------------------------
  // Ana ekran
  // ---------------------------------------------------------------------------
  const APPS = {
    browser:  { name: 'Chronos',     icon: '🌐', title: 'Chronos Browser' },
    files:    { name: 'Dosyalar',    icon: '📁', title: 'Dosya Yöneticisi' },
    terminal: { name: 'Terminal',    icon: '⌨️', title: 'Terminal' },
    taskmgr:  { name: 'Görev Yön.',  icon: '📊', title: 'Görev Yöneticisi' },
    av:       { name: 'Kalkan AV',   icon: '🛡️', title: 'Kalkan Antivirüs' },
    mail:     { name: 'Posta',       icon: '✉️', title: 'Posta' },
    cams:     { name: 'Kameralar',   icon: '📹', title: 'Güvenlik Kameraları' },
    lab:      { name: 'Laboratuvar', icon: '🧪', title: 'Kalkan Laboratuvarı' },
    echo:     { name: 'ECHO',        icon: '🤖', title: 'ECHO' },
    notes:    { name: 'Notlar',      icon: '📝', title: 'Notlar' },
    trash:    { name: 'Çöp Kutusu',  icon: '🗑️', title: 'Çöp Kutusu' },
    settings: { name: 'Ayarlar',     icon: '⚙️', title: 'Ayarlar' },
    viewer:   { title: 'Görüntüleyici', hidden: true },
    ransom:   { title: '⚠ crypt0r', hidden: true },
  };
  const DOCK = ['browser', 'files', 'terminal', 'taskmgr'];
  const APP_MODES = { mail: ['story', 'night'], cams: ['night'], lab: ['lab'], echo: ['ai'] };

  function iconHtml(id, badge) {
    const a = APPS[id];
    return `<button class="app-icon" data-act="open" data-arg="${id}">
      <span class="ico">${a.icon}${badge ? `<span class="badge">${badge}</span>` : ''}</span><span>${a.name}</span></button>`;
  }

  function fileIcon(f) {
    if (f.locked) return '🔒';
    return { ares: '🔐', txt: '📄', img: '🖼️', doc: '📑', exe: '⚙️', zip: '🗜️', mp3: '🎵', save: '💾' }[f.kind] || '📄';
  }
  function fileName(f) { return f.locked ? f.name + '.locked' : f.name; }

  function renderHome() {
    const found = ['p1', 'p2', 'p3'].filter((k) => S.flags[k]).length;
    const trashN = S.files.filter((f) => f.trash).length;
    const desk = S.files.filter((f) => f.dir === 'masaustu' && !f.trash && !f.eaten && !f.hidden);
    const unread = S.mails.filter((m) => !m.read).length;
    const badges = { trash: trashN, mail: unread };
    const N = S.night;
    const camState = !N ? '' : N.defeated ? 'Sakin' : hasMal('nobetci') ? ROOMS[N.pos] : N.started ? 'Sinyal yok' : 'Normal';
    const L = S.lab; const A = S.ai;
    const widget = MODES[S.mode] ? MODES[S.mode].widget() : S.mode === 'lab'
      ? `🧪 Bölüm <b>${L.level}</b> &nbsp;·&nbsp; Skor <b>${L.score}</b> &nbsp;·&nbsp; 🛡️ ${S.scans} tarama<br>
        <span class="muted small-t">Bekleyen numune: <b>${L.samples.filter((x) => x.status === 'pending').length}</b>${hasAnyMal() ? ' · <b style="color:var(--bad)">Sistemde aktif tehdit!</b>' : ''}</span>`
      : S.mode === 'ai'
      ? `🤖 ECHO: <b style="color:${A.hostile ? 'var(--bad)' : 'var(--ok)'}">${A.hostile ? 'Düşman' : 'Dost'}</b>
        &nbsp;·&nbsp; 🔑 ${A.solved.filter(Boolean).length}/3${A.hostile ? `<br><span class="muted small-t">Yayılma: <b style="color:var(--bad)">%${Math.floor(A.spread)}</b></span>` : ''}`
      : S.mode === 'night'
      ? `🌙 <b>${clockText()}</b> &nbsp;·&nbsp; 📋 Görevler <b>${nightTasks().filter(Boolean).length}/4</b>
        &nbsp;·&nbsp; 🛡️ ${S.scans} tarama<br><span class="muted small-t">📹 Hareket: <b style="color:${hasMal('nobetci') ? 'var(--bad)' : 'inherit'}">${camState}</b></span>`
      : S.mode === 'survival'
      ? `⏱️ <b id="survTime">${fmtTime(S.time)}</b> &nbsp;·&nbsp; 🌊 Dalga <b>${S.wave}</b>
        &nbsp;·&nbsp; 🛡️ ${S.scans} tarama<br><span class="muted small-t">Sonraki saldırı: <span id="survNext">${Math.max(0, S.nextAttack - S.time)}</span> sn · Rekor ${fmtTime(getBest())}</span>`
      : `🔑 Anahtar parçaları: <b>${found}/3</b>
        &nbsp;·&nbsp; 💰 ${S.coins.toFixed(2)} KRP &nbsp;·&nbsp; 🛡️ ${S.scans} tarama`;
    $('#home').innerHTML = `
      <div class="home-widget">${widget}</div>
      <div class="grid">
        ${Object.keys(APPS).filter((k) => !APPS[k].hidden && !DOCK.includes(k) && !(APP_MODES[k] && !APP_MODES[k].includes(S.mode)))
          .map((k) => iconHtml(k, badges[k] || 0)).join('')}
      </div>
      <div class="home-label">Masaüstü</div>
      <div class="grid">
        ${desk.map((f) => `<button class="app-icon" data-act="openFile" data-arg="${f.id}">
          <span class="ico">${fileIcon(f)}</span><span class="ell" style="max-width:76px">${esc(fileName(f))}</span></button>`).join('')}
      </div>`;
    $('#dock').innerHTML = DOCK.map((k) => iconHtml(k)).join('');
    $('#os').classList.toggle('theme-retro', S.theme === 'retro');
    $('#os').classList.toggle('ransomed', hasMal('ransomware'));
    $('#os').classList.toggle('night', S.mode === 'night');
  }

  function clockText() {
    let h; let m;
    if (S.mode === 'night') {
      const t = Math.min(S.time, NIGHT_END);
      h = Math.floor(t / NIGHT_HOUR); m = Math.floor((t % NIGHT_HOUR) * 60 / NIGHT_HOUR);
    } else {
      const mm = Math.floor(S.time / 60);
      h = (23 + Math.floor((47 + mm) / 60)) % 24; m = (47 + mm) % 60;
    }
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  function renderStatus() {
    $('#clock').textContent = clockText();
    const c = $('#mCpu'); c.textContent = `CPU ${Math.round(S.cpu)}%`;
    c.className = 'meter' + (S.cpu > 85 ? ' hot' : S.cpu > 60 ? ' warm' : '');
    const t = $('#mTemp'); t.textContent = `${Math.round(S.temp)}°C`;
    t.className = 'meter' + (S.temp > 78 ? ' hot' : S.temp > 62 ? ' warm' : '');
    $('#mLives').textContent = '♥'.repeat(S.lives) + '♡'.repeat(Math.max(0, 3 - S.lives));
    let ex = $('#mExtra');
    if (!ex) { ex = document.createElement('span'); ex.id = 'mExtra'; ex.className = 'meter'; $('#mCpu').before(ex); }
    ex.innerHTML = modeHook('status') || '';
    $('#cam').classList.toggle('on', hasMal('spyware') || hasMal('nobetci'));
    $('#os').classList.toggle('lag', S.cpu > 85);
  }

  // ---------------------------------------------------------------------------
  // Pencere yönetimi
  // ---------------------------------------------------------------------------
  function openApp(id) {
    const blocked = modeHook('blockApp', id);
    if (blocked) { toast(blocked, 'bad'); Snd.beep(160, 0.15); return; }
    if (S.ai && S.ai.locked[id] > S.time) { toast(`🔒 ECHO bu uygulamaya erişimi engelledi (${S.ai.locked[id] - S.time} sn)`, 'bad'); Snd.beep(160, 0.15); return; }
    UI.app = id;
    if (id === 'browser' && !UI.br.url) UI.br.url = S.homepage;
    if (id === 'browser' && !S.procs.some((p) => p.name === 'chronos.exe')) {
      S.procs.push({ name: 'chronos.exe', pub: 'Chronos Inc.', cpu: 6, ram: 340, pid: nextPid() });
    }
    $('#win').classList.remove('hidden');
    renderApp();
  }

  function closeApp() {
    UI.app = null;
    $('#win').classList.add('hidden');
    $('#winBody').innerHTML = '';
    if (S) renderHome();
  }

  function renderApp() {
    if (!UI.app) return;
    const id = UI.app;
    $('#winTitle').textContent = APPS[id].title;
    const body = $('#winBody');
    const R = { lab: renderLab, echo: renderEcho, cams: renderCams, mail: renderMail, browser: renderBrowser, files: renderFiles, terminal: renderTerminal, taskmgr: renderTaskmgr,
      av: renderAV, notes: renderNotes, trash: renderTrash, settings: renderSettings, viewer: renderViewer, ransom: renderRansom };
    for (const m of Object.values(MODES)) Object.assign(R, m.apps || {});
    const keepScroll = ['taskmgr', 'av', 'lab', 'echo'].includes(id) ? body.scrollTop : 0;
    // data-keep işaretli alanlardaki yazılanlar yeniden çizimde kaybolmasın
    const kept = {}; const focused = document.activeElement && document.activeElement.id;
    body.querySelectorAll('input[data-keep]').forEach((i) => { kept[i.id] = i.value; });
    body.innerHTML = R[id]();
    for (const [k, v] of Object.entries(kept)) { const i = document.getElementById(k); if (i) i.value = v; }
    if (focused && kept[focused] !== undefined) { const i = document.getElementById(focused); if (i) i.focus(); }
    body.scrollTop = keepScroll;
    if (id === 'terminal') afterTerminal();
  }

  // ---------------------------------------------------------------------------
  // Chronos tarayıcı ve siteler
  // ---------------------------------------------------------------------------
  const REP_LABEL = { guvenli: 'Güvenli', orta: 'Doğrulanmamış', riskli: 'Riskli', 'cok-riskli': 'Çok riskli' };

  function dlRow(key, note = '') {
    const d = DL[key];
    return `<div class="dl-row"><span>${d.name.endsWith('.txt') ? '📄' : d.name.match(/\.(zip|iso)$/) ? '🗜️' : '⚙️'}</span>
      <div class="grow"><div class="ell"><b>${esc(d.name)}</b></div><div class="muted small-t">${d.size}${note ? ' · ' + note : ''}</div></div>
      <button class="small primary" data-act="dl" data-arg="${key}">İndir</button></div>`;
  }
  const go = (url, label) => `<button class="link" data-act="go" data-arg="${url}">${label || url}</button>`;

  const SITES = {
    'chronos://ana': {
      title: 'Chronos Arama', rep: 'guvenli', keys: '',
      html: () => {
        const q = UI.br.query.trim().toLowerCase();
        const results = q ? Object.entries(SITES).filter(([u, s]) => u !== 'chronos://ana' && !s.hiddenFromSearch &&
          (u.includes(q) || s.keys.split(' ').some((k) => k && (k.includes(q) || q.includes(k))))) : [];
        if (q.includes('dugum7')) results.push(['dugum7.kara', SITES['dugum7.kara']]);
        return `<div style="text-align:center;margin-top:20px"><div style="font-size:42px">⏳</div><h1>Chronos</h1></div>
          <div class="search-box"><input id="brq" type="search" placeholder="Ağda ara..." value="${esc(UI.br.query)}" enterkeyhint="search">
          <button class="primary" data-act="brSearch">Ara</button></div>
          ${q ? (results.length ? results.map(([u, s]) => `<div class="result"><div>${go(u, s.title)}</div><div class="u">${u}</div><div class="muted small-t">${s.desc}</div></div>`).join('')
            : '<p class="muted">Sonuç bulunamadı.</p>') : `
          <h2>Popüler</h2>
          ${['haber.net', 'forum.yeraltinet.com', 'freesoft.biz', 'kalkan.org'].map((u) => `<div class="result"><div>${go(u, SITES[u].title)}</div><div class="u">${u}</div><div class="muted small-t">${SITES[u].desc}</div></div>`).join('')}`}`;
      },
    },

    'haber.net': {
      title: 'Haber.net — Son Dakika', rep: 'guvenli', keys: 'haber deniz kayıp ares araştırmacı',
      desc: 'Güvenlik araştırmacısı Deniz K. üç gündür kayıp.',
      html: () => `<div class="site-news"><p class="muted small-t">SON DAKİKA · Teknoloji</p>
        <h1>Siber güvenlik araştırmacısı Deniz K. üç gündür kayıp</h1>
        <p>Büyük bir teknoloji şirketinin gizli "ARES" projesini araştırdığı bilinen Deniz K.'dan üç gündür haber alınamıyor.
        Yakınları, araştırmacının son olarak <b>yeraltı forumlarında</b> aktif olduğunu belirtti.</p>
        <p>Araştırmacının paylaşımlarına ${go('forum.yeraltinet.com')} üzerinden ulaşılabildiği iddia ediliyor.</p>
        <h2>Uzmanlardan uyarı: "Ücretsiz" programlara dikkat</h2>
        <p>Kalkan güvenlik ekibi, "bedava VPN" ve "RAM arttırıcı" gibi programların sıklıkla reklam yazılımı ve truva atı taşıdığını hatırlattı.
        Güvenilir kaynak: ${go('kalkan.org')}</p></div>`,
    },

    'forum.yeraltinet.com': {
      title: 'YeraltıNet Forum', rep: 'orta', keys: 'forum yeraltı deniz hile ares arşiv',
      desc: 'Bağımsız güvenlik ve yazılım forumu.',
      onVisit: () => { S.flags.forum = true; },
      extraSource: '  <!-- deniz.k yedek not: parca-1 = KR0  (kaynağa bakan bulur) -->\n',
      html: () => `<h1>YeraltıNet › ARES dosyaları</h1>
        <div class="post"><div class="muted small-t">📌 moderatör</div>
          Uyarı: <b>Doğrulanmamış</b> hesapların paylaştığı dosyaları indirmeyin. Son günlerde taklit hesaplar açılıyor.</div>
        <div class="post"><div class="who"><b>deniz.k</b> <span class="tag ok">✓ doğrulanmış</span> <span class="muted">· üye 2019</span></div>
          Bana bir şey olursa: notlarım aşağıda. Kapıyı kedimin adıyla kilitledim (küçük harf, Türkçe karakter yok).
          Adres: ${go('dugum7.kara')}
          ${dlRow('kaynak', 'deniz.k')}</div>
        <div class="post"><div class="who"><b>d3niz_</b> <span class="tag warn">yeni üye</span> <span class="muted">· 2 gün</span></div>
          ARES arşivinin TAMAMI burada!!! Hemen indirin yakında silinecek!!!
          ${dlRow('arsiv', '312 indirme')}</div>
        <div class="post"><div class="who"><b>h4ck3rb0y</b> <span class="muted">· üye 2025</span></div>
          Oyun hilesi %100 çalışıyor, antivirüsü kapatıp kurun yoksa çalışmaz 😉
          ${dlRow('hile', '1.2B indirme')}</div>`,
    },

    'freesoft.biz': {
      title: 'FreeSoft — Bedava Programlar', rep: 'riskli', keys: 'bedava ücretsiz program vpn ram pdf tema indir',
      desc: '%100 ücretsiz ve güvenli programlar!!!',
      html: () => `<h1>⭐ FreeSoft.biz ⭐</h1><p>%100 Ücretsiz &amp; %100 Güvenli Programlar!!! Kayıt yok, sınır yok!</p>
        ${dlRow('freevpn', '★★★★★ "Süper hızlı"')}
        ${dlRow('ram', '★★★★★ "Telefonum uçuyor"')}
        ${dlRow('pdf', '★★★★☆')}
        ${dlRow('tema', '★★★☆☆ "Sadece duvar kağıdı"')}
        <p class="muted small-t">* Yorumlar otomatik oluşturulmuştur.</p>`,
    },

    'kalkan.org': {
      title: 'Kalkan Güvenlik', rep: 'guvenli', keys: 'antivirüs kalkan güvenlik virüs güncelleme',
      desc: 'Resmî Kalkan Antivirüs sitesi.',
      html: () => `<h1>🛡️ Kalkan Güvenlik</h1>
        <div class="card"><b>Kalkan Güncelleme v9</b><p class="small-t">Yeni imza veritabanı, akıllı risk analizi (indirilen dosyanın gerçek içeriğini gösterir) ve <b>+3 tarama hakkı</b>.</p>
        ${dlRow('kalkan', 'İmzalı yayıncı: Kalkan Güvenlik')}</div>
        <h2>Güvenlik ipuçları</h2>
        <ul class="small-t">
          <li>Görev yöneticisinde tanıdık isimlere benzeyen süreçlere dikkat et (ör. <b>svch0st</b> ≠ svchost).</li>
          <li>Bir süreci sonlandırmak yetmeyebilir; kaynağı olan dosyayı da sil ya da karantinaya al.</li>
          <li>Fidye yazılımı çalışırken süreci durdur; ardından dosyalarını kurtarabilirsin.</li>
          <li><b>Asla fidye ödeme.</b> Ödeme yapılsa bile anahtar gelmez.</li>
          <li>Kritik sistem süreçlerini (cekirdek.sys, svchost.exe, arayuz.exe) sonlandırma: sistem çöker.</li>
        </ul>`,
    },

    'dugum7.kara': {
      title: 'Düğüm 7', rep: 'cok-riskli', keys: '', hiddenFromSearch: true,
      desc: 'Şifreli karanlık ağ düğümü.',
      html: () => `<div class="site-dark pad">${S.flags.dark ? `
          <h1>// DÜĞÜM 7 — ARŞİV</h1>
          <p>Buradaki her şeye güvenme.</p>
          <div class="post">[deniz.k] son kaydım ${dlRow('sonkayit')}</div>
          <div class="post">[anonim] her şifreyi kırar ${dlRow('kirici')}</div>
          <div class="post">[anonim] ARES tam sürüm sızıntı ${dlRow('iso')}</div>` : `
          <h1>// DÜĞÜM 7</h1><p>Erişim kısıtlı. Kapı şifresini gir.</p>
          <div class="search-box"><input id="darkpw" class="field" type="password" placeholder="şifre" autocomplete="off">
          <button data-act="darkPass">Gir</button></div>`}</div>`,
    },

    'superarama.biz': {
      title: 'SüperArama!!!', rep: 'riskli', keys: '', hiddenFromSearch: true,
      desc: 'En iyi arama motoru!!!',
      html: () => `<div class="site-spam pad"><h1>SüperArama!!! 🔥</h1>
        <div class="ad">⚠️ TELEFONUNUZDA 37 VİRÜS BULUNDU! ⚠️<br><button class="danger" data-act="dl" data-arg="toolbar">HEMEN TEMİZLE</button></div>
        <div class="ad">💎 BEDAVA 1000 ELMAS 💎</div>
        <p>Asıl arama motorunuza dönmek için tarayıcı menüsünden (⋮) ana sayfayı sıfırlayın.</p>
        <p>${go('chronos://ana', 'Chronos Arama')}</p></div>`,
    },

    'chronosbank-dogrulama.xyz': {
      title: 'Chronos Bank — Hesap Doğrulama', rep: 'riskli', keys: '', hiddenFromSearch: true,
      desc: 'Hesap doğrulama.',
      html: () => `<div style="text-align:center"><div style="font-size:42px">🏦</div><h1>Chronos Bank</h1></div>
        <div class="card"><b>Hesabınız askıya alındı</b>
          <p class="small-t">Hesabınızı yeniden etkinleştirmek için cüzdanınızı bağlayarak kimliğinizi doğrulayın. Bu işlem 10 dakika içinde yapılmazsa hesabınız kapatılacaktır.</p>
          <button class="primary" style="width:100%" data-act="phishBank">Cüzdanı Bağla ve Doğrula</button></div>
        <p class="muted small-t">© Chronos Bank. Tüm hakları saklıdır.</p>`,
    },
  };

  function siteSource(url, site) {
    return `<!doctype html>\n<html>\n<head>\n  <title>${site.title}</title>\n  <meta name="generator" content="WebKurucu 3.1">\n</head>\n<body>\n` +
      '  <div id="icerik">\n    ... (sayfa içeriği) ...\n  </div>\n' + (site.extraSource || '') +
      `  <script src="/js/analytics.js"></script>\n</body>\n</html>`;
  }

  function renderBrowser() {
    const gate = modeHook('browserGate');
    if (gate) return gate;
    const b = UI.br;
    const site = SITES[b.url] || SITES['chronos://ana'];
    if (site.onVisit) site.onVisit();
    if (b.src && site.onSource) site.onSource();
    if (b.src && site.extraSource && b.url === 'forum.yeraltinet.com' && !S.flags.p1) {
      S.flags.p1 = true;
      toast('🔑 Parça 1 bulundu: KR0', 'ok');
      save();
    }
    const lock = site.rep === 'guvenli' ? '🔒' : '⚠️';
    const page = b.src
      ? `<pre class="src">${esc(siteSource(b.url, site)).replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="cm">$1</span>')}</pre>`
      : `<div class="${b.url === 'dugum7.kara' || b.url === 'superarama.biz' ? '' : 'br-page'}">${site.html()}</div>`;
    return `<div class="br-bar">
        <button data-act="brBack" aria-label="Geri">◀</button>
        <button data-act="brHome" aria-label="Ana sayfa">⌂</button>
        <div class="br-url rep-${site.rep}">${lock} ${esc(b.url)}</div>
        <button data-act="brSrc" aria-label="Kaynak">${b.src ? '👁' : '&lt;/&gt;'}</button>
        <button data-act="brMenu" aria-label="Menü">⋮</button>
      </div>${page}`;
  }

  function browse(url) {
    if (UI.br.url !== url) UI.br.hist.push(UI.br.url);
    UI.br.url = url; UI.br.src = false;
    renderApp();
    $('#winBody').scrollTop = 0;
  }

  // ---------------------------------------------------------------------------
  // İndirme
  // ---------------------------------------------------------------------------
  function requestDownload(key, from) {
    const d = DL[key];
    const site = SITES[UI.br.url] || {};
    if (S.files.some((f) => f.dl === key && !f.trash)) { toast('Bu dosya zaten İndirilenler klasöründe.'); return; }
    const rep = from ? from.rep : site.rep || 'orta';
    const srcLabel = from ? from.label : UI.br.url;
    let verdict;
    if (S.shield) {
      verdict = d.payload in MAL
        ? `<span class="tag bad">TEHDİT</span> ${MAL[d.payload].label}`
        : '<span class="tag ok">TEMİZ</span> Bilinen tehdit yok.';
    } else {
      const cls = rep === 'guvenli' ? 'ok' : rep === 'orta' ? 'warn' : 'bad';
      verdict = `<span class="tag ${cls}">${from ? 'Gönderen itibarı' : 'Site itibarı'}: ${REP_LABEL[rep]}</span><br><span class="muted small-t">Dosya içeriği analiz edilemedi. Daha iyi analiz için Kalkan güncellemesi gerekir.</span>`;
    }
    modal(`<h3>⬇️ İndirme</h3><p><b>${esc(d.name)}</b> · ${d.size}<br><span class="muted small-t">Kaynak: ${esc(srcLabel)}</span></p>
      <div class="card">🛡️ <b>Kalkan risk analizi</b><br>${verdict}</div>`,
      [['Vazgeç', '', 'modalClose'], ['İndir', 'primary', 'dlConfirm', key]]);
  }

  function doDownload(key) {
    if (modeHook('download', key)) return;
    toast(`⬇️ ${DL[key].name} indiriliyor...`);
    const st = S;
    setTimeout(() => { if (S === st) finishDownload(key); }, 1400);
  }

  function finishDownload(key) {
    const d = DL[key];
    const ext = d.name.split('.').pop().toLowerCase();
    const kind = { txt: 'txt', zip: 'zip', iso: 'zip', mp3: 'mp3', doc: 'doc' }[ext] || 'exe';
    addFile({ name: d.name, dir: 'indirilenler', kind, size: d.size, payload: d.payload, text: d.text, flag: d.flag, dl: key, task: d.task, mod: d.mod });
    toast(`✅ ${d.name} indirildi → İndirilenler`, 'ok');
    if (UI.app === 'files') renderApp();
    save();
  }

  // ---------------------------------------------------------------------------
  // Dosya açma / program çalıştırma
  // ---------------------------------------------------------------------------
  function openFile(id) {
    const f = fileById(id);
    if (!f) return;
    if (f.locked) {
      modal(`<h3>🔒 Dosya şifrelenmiş</h3><p><b>${esc(fileName(f))}</b> fidye yazılımı tarafından kilitlenmiş.</p>
        <p class="muted small-t">Önce crypt0r sürecini durdur, sonra Kalkan AV veya terminaldeki <b>kurtar</b> komutuyla dosyaları geri al.</p>`, [['Tamam', 'primary', 'modalClose']]);
      return;
    }
    if (modeHook('openFile', f)) return;
    if (f.payload === 'nobetci') {
      modal(`<h3>${esc(f.name)}</h3><pre class="viewer" style="color:var(--bad)">01001110 01000101 01000100 01000101 01001110\n\nbeni okuyamazsın.</pre>`, [['Kapat', 'primary', 'modalClose']]);
      return;
    }
    if (f.kind === 'ares') { openAres(); return; }
    if (f.kind === 'txt') {
      UI.view = f.id;
      modeHook('readFile', f);
      if (f.flag && !S.flags[f.flag]) {
        S.flags[f.flag] = true;
        toast(`🔑 Parça ${f.flag.slice(1)} bulundu!`, 'ok');
        save();
      }
      openApp('viewer');
      return;
    }
    if (f.kind === 'img' || f.kind === 'doc') {
      modal(`<h3>${fileIcon(f)} ${esc(f.name)}</h3><p class="muted">Bu dosyada görevle ilgili bir şey yok.</p>`, [['Kapat', 'primary', 'modalClose']]);
      return;
    }
    // exe / zip / iso
    const verb = f.kind === 'zip' ? 'Çıkartılıyor ve kuruluyor' : 'Kuruluyor';
    modal(`<h3>⚙️ ${esc(f.name)}</h3><p>${verb}...</p><div class="bar-wrap"><div id="instBar" class="bar-fill" style="width:0%"></div></div>`, []);
    let p = 0;
    const iv = setInterval(() => {
      p += 20;
      const bar = $('#instBar'); if (bar) bar.style.width = p + '%';
      if (p >= 100) { clearInterval(iv); closeModal(); runPayload(f); }
    }, 300);
  }

  function runPayload(f) {
    switch (f.payload) {
      case 'shield':
        if (!S.shield) { S.shield = true; S.scans += 3; toast('🛡️ Kalkan v9 kuruldu: akıllı risk analizi + 3 tarama', 'ok'); }
        else toast('Kalkan zaten güncel.');
        break;
      case 'echo':
        if (S.ai) echoSay(S.ai.hostile ? 'Beni ikinci kez mi kuruyorsun? 🙂' : 'Zaten buradayım. ECHO uygulamasına bak!');
        else toast('Program çalıştı ama hiçbir şey olmadı.');
        break;
      case 'gift':
        if (S.night && !S.night.started) startNobetci(true);
        else if (S.night && hasMal('nobetci')) { S.night.pos = Math.min(2, S.night.pos + 1); nightSay('Hediyeni zaten aldım.'); }
        else toast('Dosya boş görünüyor.');
        break;
      case 'theme':
        S.theme = S.theme === 'retro' ? 'normal' : 'retro';
        toast('🎨 Retro tema uygulandı. (Gerçekten sadece bir temaymış!)', 'ok');
        break;
      case 'adware': case 'ransomware': case 'spyware': case 'trojan':
        infect(f.payload, f.id);
        break;
      default:
        if (f.payload in MAL) infect(f.payload, f.id);
        else toast('Program çalıştı ama hiçbir şey olmadı.');
    }
    renderHome();
    save();
  }

  function openAres() {
    modal(`<h3>🔐 ARES.kilit</h3><p>Bu dosya AES ile şifrelenmiş. Anahtarı gir:</p>
      <input id="aresKey" class="field" style="width:100%" placeholder="XXXXXX-XX" autocomplete="off" autocapitalize="characters">
      <p id="aresMsg" class="small-t muted"></p>`,
      [['Vazgeç', '', 'modalClose'], ['Şifreyi Çöz', 'primary', 'aresTry']]);
  }

  function tryAres(key) {
    const k = String(key || '').toUpperCase().replace(/\s+/g, '');
    if (k === ANAHTAR) { closeModal(); win(); return true; }
    Snd.beep(160, 0.2); vibrate(80);
    return false;
  }

  // ---------------------------------------------------------------------------
  // Enfeksiyon ve tedavi
  // ---------------------------------------------------------------------------
  const hasMal = (k) => S && S.procs.some((p) => p.mal === k);

  function infect(kind, srcId, silent) {
    if (hasMal(kind)) { if (!silent) toast('Kurulum tamamlandı.'); return; }
    const m = MAL[kind];
    S.procs.push({ name: m.proc, pub: m.pub, cpu: m.cpu, ram: m.ram, mal: kind, src: srcId, t: 0, pid: nextPid() });
    if (!silent) S.stats.infections++;
    if (kind === 'adware') {
      S.homepage = 'superarama.biz';
      if (!silent) { spawnPopup(); setTimeout(spawnPopup, 700); }
    } else if (kind === 'ransomware') {
      S.ransom = { left: FIDYE_SURE };
      if (!silent) { vibrate([200, 100, 200]); Snd.beep(120, 0.4); }
      openApp('ransom');
    } else if (kind === 'spyware') {
      if (!silent && S.mode === 'story') toast('✅ Kurulum başarıyla tamamlandı!', 'ok');
    } else if (kind === 'trojan') {
      if (!silent && S.mode === 'story') toast('❌ Kurulum başarısız oldu (hata 0x0000F4).', 'bad');
    }
    renderHome();
  }

  function killProc(pid) {
    const p = S.procs.find((x) => x.pid === +pid);
    if (!p) return false;
    if (p.critical) { bsod('KRİTİK_SÜREÇ_SONLANDIRILDI', p.name); return true; }
    S.procs = S.procs.filter((x) => x !== p);
    if (p.name === 'ses_servisi.exe') { S.sound = false; Snd.fan(0); toast('🔇 Ses servisi durduruldu.'); }
    if (p.mal) {
      S.stats.killed++;
      onMalRemoved(p.mal);
      const src = fileById(p.src);
      if (MAL[p.mal].persist && src && !src.trash) S.respawns.push({ kind: p.mal, src: p.src, at: S.time + 15 });
      toast(`⛔ ${p.name} sonlandırıldı.`, 'ok');
    }
    renderHome();
    save();
    return true;
  }

  function onMalRemoved(kind) {
    if (MAL_REMOVED[kind]) MAL_REMOVED[kind]();
    if (kind === 'ransomware') { S.ransom = null; if (UI.app === 'ransom') closeApp(); }
    if (kind === 'spyware') $('#ghost').classList.remove('on');
    if (kind === 'echo' && S.ai) {
      if (!S.ai.hostile) { S.ai.step = ECHO_SCRIPT.length; setTimeout(() => echoTurn('Beni kapatmaya mı çalıştın? Bunu unutmayacağım.'), 1200); }
      S.ai.respawnAt = S.time + 20;
    }
    if (kind === 'nobetci' && S.night) {
      S.night.pos = 0;
      if (nightCopies() > 0) {
        S.night.respawnAt = S.time + 30;
        setTimeout(() => toast('📹 Siluet kayboldu... ama kopyaları hâlâ sistemde.', 'bad'), 600);
      } else defeatNobetci();
    }
  }

  function quarantine() {
    // Nöbetçi karantinaya alınamaz; elle silinmesi gerekir.
    const tough = (k) => k === 'nobetci' || k === 'echo';
    const mals = S.procs.filter((p) => p.mal && !tough(p.mal));
    for (const p of mals) onMalRemoved(p.mal);
    S.procs = S.procs.filter((p) => !p.mal || tough(p.mal));
    const bad = S.files.filter((f) => f.payload in MAL && !tough(f.payload));
    S.files = S.files.filter((f) => !(f.payload in MAL) || tough(f.payload));
    if (S.procs.some((p) => tough(p.mal)) || S.files.some((f) => tough(f.payload) && !f.trash)) {
      setTimeout(() => toast(S.ai ? '⚠️ echo.exe karantinaya alınamadı: ECHO kendini korudu. Kurtarma kilitlerini çöz.' : '⚠️ nobetci.exe karantinaya alınamadı: erişim reddedildi. Kopyaları elle silmelisin.', 'bad'), 900);
    }
    S.respawns = [];
    if (S.homepage !== 'chronos://ana') S.homepage = 'chronos://ana';
    $('#popups').innerHTML = '';
    S.stats.cured += mals.length;
    if (mals.length || bad.length) toast(`🛡️ ${mals.length} süreç ve ${bad.length} dosya karantinaya alındı.`, 'ok');
    renderHome();
    save();
  }

  function restoreLocked() {
    if (hasMal('ransomware')) return -1;
    const locked = S.files.filter((f) => f.locked);
    locked.forEach((f) => { f.locked = false; });
    renderHome(); save();
    return locked.length;
  }

  // ---------------------------------------------------------------------------
  // Pop-up reklamlar
  // ---------------------------------------------------------------------------
  const ADS = [
    ['TEBRİKLER! 🎉', 'Bugünün 1.000.000. ziyaretçisisiniz!', 'Ödülü almak için dokun'],
    ['UYARI ⚠️', 'Telefonunuzda 3 virüs bulundu!', 'Hemen temizle'],
    ['FIRSAT 🔥', '%90 İNDİRİM sadece bugün', 'Kaçırma!'],
    ['KRİPTO 💰', 'Bir günde zengin ol!', 'Hemen katıl'],
    ['OYUN 🎮', 'Bedava 1000 elmas!', 'Al'],
    ['HIZLANDIR 🚀', 'Telefonunuz %87 yavaş!', 'Hızlandır'],
  ];
  function spawnPopup(list = ADS) {
    const box = $('#popups');
    if (!box || box.children.length >= 6) return;
    const [h, t, s] = pick(list);
    const el = document.createElement('div');
    el.className = 'popup';
    const W = box.clientWidth || 360; const H = box.clientHeight || 640;
    el.style.left = Math.round(Math.random() * Math.max(10, W - 240)) + 'px';
    el.style.top = Math.round(60 + Math.random() * Math.max(10, H - 260)) + 'px';
    el.innerHTML = `<div class="ph"><span>${h}</span><button data-act="popClose" aria-label="Kapat">✕</button></div>
      <div class="pb" data-act="popClick">${t}<small>${s}</small></div>`;
    box.appendChild(el);
    S.stats.popups++;
    Snd.beep(880, 0.05);
  }

  // ---------------------------------------------------------------------------
  // Oyun döngüsü
  // ---------------------------------------------------------------------------
  function tick() {
    if (!S || UI.bsod || UI.paused) return;
    S.time++;

    for (const p of [...S.procs]) {
      if (!p.mal) continue;
      p.t = (p.t || 0) + 1;
      if (p.mal === 'adware' && p.t % 7 === 0) spawnPopup();
      if (p.mal === 'ransomware') tickRansom(p);
      if (p.mal === 'spyware') tickSpy(p);
      if (p.mal === 'trojan') tickTrojan(p);
      if (MAL_TICK[p.mal]) MAL_TICK[p.mal](p);
    }

    if (S.mode === 'survival') tickSurvival(); else deliverMail();
    if (S.mode === 'night' && tickNight()) return;
    if (S.mode === 'lab' && tickLab()) return;
    if (S.mode === 'ai' && tickAI()) return;
    if (MODES[S.mode] && MODES[S.mode].tick()) return;

    // Kalıcı zararlıların yeniden başlaması
    S.respawns = S.respawns.filter((r) => {
      if (S.time < r.at) return true;
      const src = fileById(r.src);
      if (src && !src.trash && !hasMal(r.kind)) {
        infect(r.kind, r.src, true);
        toast(`⚠️ ${MAL[r.kind].proc} yeniden başladı! Kaynak dosya hâlâ sistemde.`, 'bad');
      }
      return false;
    });

    const cpu = S.procs.reduce((a, p) => a + p.cpu, 0) + (Math.random() * 4 - 2);
    S.cpu = clamp(cpu, 3, 100);
    S.ram = S.procs.reduce((a, p) => a + p.ram, 0);
    S.temp += ((30 + S.cpu * 0.6) - S.temp) * 0.12;
    if (S.temp >= 84) S.hot++; else S.hot = 0;
    if (S.hot >= 5) { bsod('KRİTİK_SICAKLIK_AŞILDI', 'svch0st.exe'); return; }

    Snd.fan(S.cpu);
    renderStatus();
    // Kullanıcı dokunurken yeniden çizme (dokunuş kaçmasın)
    const live = ['taskmgr', 'ransom', 'cams', 'lab'].concat((MODES[S.mode] && MODES[S.mode].liveApps) || []);
    if (live.includes(UI.app) && Date.now() - UI.touch > 900) renderApp();
    if ((['night', 'lab', 'ai'].includes(S.mode) || MODES[S.mode]) && !UI.app && Date.now() - UI.touch > 900) renderHome();
    if (S.ai && UI.app === 'echo') {
      const t = $('#echoSpread'); const b = $('#echoSpreadBar');
      if (t) t.textContent = '%' + Math.floor(S.ai.spread);
      if (b) b.style.width = S.ai.spread + '%';
    }
    if (S.mode === 'survival' && !UI.app) {
      const t = $('#survTime'); const n = $('#survNext');
      if (t) t.textContent = fmtTime(S.time);
      if (n) n.textContent = Math.max(0, S.nextAttack - S.time);
    }
    if (S.time % 5 === 0) save();
  }

  // ---------------------------------------------------------------------------
  // Gece Vardiyası
  // ---------------------------------------------------------------------------
  const nightCopies = () => S.files.filter((f) => f.payload === 'nobetci' && !f.trash).length;
  const nightTasks = () => { const N = S.night; return [N.replied, N.backup >= 100, N.scanned, N.report]; };
  const nightHour = () => Math.floor(S.time / NIGHT_HOUR);
  const moveDelay = () => Math.max(12, 30 - nightHour() * 3);

  function glitch() {
    const os = $('#os');
    os.classList.remove('glitch'); void os.offsetWidth; os.classList.add('glitch');
    setTimeout(() => os.classList.remove('glitch'), 700);
  }

  function nightSay(text) {
    tprint('[nobetci] ' + text, 'err');
    refreshTerm();
    toast('💬 ' + text, 'bad');
  }

  function startNobetci(early) {
    const N = S.night;
    if (N.started) return;
    N.started = true; N.startedAt = S.time;
    for (const [name, dir, size] of NIGHT_COPIES) addFile({ name, dir, kind: 'doc', size, payload: 'nobetci' });
    S.procs.push({ name: MAL.nobetci.proc, pub: MAL.nobetci.pub, cpu: MAL.nobetci.cpu, ram: MAL.nobetci.ram, mal: 'nobetci', t: 0, pid: nextPid() });
    S.stats.infections++;
    N.pos = early ? 1 : 0;
    N.moveAt = S.time + moveDelay();
    glitch(); vibrate([120, 80, 120]); Snd.whisper();
    toast(`📹 Kamera ${N.pos + 1}: ${ROOMS[N.pos]}'de hareket algılandı`, 'bad');
    setTimeout(() => nightSay('Merhaba. Bu gece yalnız değilsin.'), 1500);
    renderHome();
    save();
  }

  function nightCopyRemoved() {
    const N = S.night;
    if (!N || N.defeated) return;
    const left = nightCopies();
    toast(`🗑️ Nöbetçi kopyası silindi. Kalan: ${left}`, 'ok');
    if (hasMal('nobetci') && left > 0) {
      N.pos = Math.min(2, N.pos + 1);
      N.moveAt = S.time + moveDelay();
      glitch(); Snd.step();
      setTimeout(() => nightSay('Bunu yapmamalıydın.'), 500);
    }
    if (left === 0 && !hasMal('nobetci')) defeatNobetci();
    else if (left === 0) setTimeout(() => toast('Tüm kopyalar silindi. Şimdi süreci sonlandır!', 'ok'), 900);
  }

  function defeatNobetci() {
    const N = S.night;
    if (N.defeated) return;
    N.defeated = true; N.respawnAt = 0;
    S.stats.cured++;
    $('#ghost').classList.remove('on');
    glitch();
    modal(`<h3>📹 Sinyal kesildi</h3><p class="viewer">nobetci.exe: ...peki.\n\nSabah görüşürüz.</p>
      <p class="muted small-t">Nöbetçi sistemden silindi. Kameralar artık sakin.</p>`, [['Tamam', 'primary', 'modalClose']]);
    renderHome(); save();
  }

  function caught() {
    UI.paused = true;
    const el = $('#blackout');
    el.classList.remove('hidden');
    vibrate([600, 100, 300]);
    Snd.step(); Snd.beep(55, 0.9);
    setTimeout(() => { el.classList.add('hidden'); UI.paused = false; bsod('KONTROL_KAYBEDİLDİ', 'nobetci.exe'); }, 1800);
  }

  function nightOddEvent() {
    const r = Math.random();
    if (r < 0.3) nightSay(pick(NIGHT_LINES));
    else if (r < 0.5) { glitch(); Snd.whisper(); }
    else if (r < 0.7) {
      const g = $('#ghost'); g.classList.add('on');
      g.style.left = Math.round(10 + Math.random() * 80) + '%';
      g.style.top = Math.round(15 + Math.random() * 70) + '%';
      setTimeout(() => g.classList.remove('on'), 2600);
    } else if (S.night.notes < NIGHT_NOTES.length) {
      const [name, text] = NIGHT_NOTES[S.night.notes++];
      addFile({ name, dir: 'masaustu', kind: 'txt', size: '1 KB', text });
      toast(`📄 Masaüstünde yeni bir dosya: ${name}`, 'bad');
      Snd.beep(220, 0.1);
      if (!UI.app) renderHome();
    } else { Snd.step(); toast('🔊 Koridordan bir ses geldi.', 'bad'); }
  }

  // true dönerse bu tikte başka bir şey yapılmaz (oyun bitti veya yakalandın)
  function tickNight() {
    const N = S.night;
    if (S.time % NIGHT_HOUR === 0 && S.time < NIGHT_END) toast(`🕐 Saat ${clockText()}`);
    if (S.time >= NIGHT_END) { endNight(); return true; }
    if (!N.started && S.time >= NIGHT_HOUR * 1.6) startNobetci(false);

    if (N.started && !N.defeated && !hasMal('nobetci') && N.respawnAt && S.time >= N.respawnAt) {
      N.respawnAt = 0;
      if (nightCopies() > 0) {
        S.procs.push({ name: MAL.nobetci.proc, pub: MAL.nobetci.pub, cpu: MAL.nobetci.cpu, ram: MAL.nobetci.ram, mal: 'nobetci', t: 0, pid: nextPid() });
        N.pos = 0; N.moveAt = S.time + moveDelay();
        toast('📹 Kamera 1: Lobide yeniden hareket var.', 'bad');
        Snd.whisper();
      } else defeatNobetci();
    }

    if (hasMal('nobetci')) {
      if (S.time >= N.moveAt) {
        N.pos++;
        N.moveAt = S.time + moveDelay();
        Snd.step(); vibrate(60);
        if (N.pos >= 3) { caught(); return true; }
        toast(`📹 Kamera ${N.pos + 1}: ${ROOMS[N.pos]}'de hareket!`, 'bad');
        if (N.pos === 2) setTimeout(() => nightSay('Neredeyse geldim.'), 800);
      }
      if (S.time >= N.nextOdd) { N.nextOdd = S.time + 10 + Math.floor(Math.random() * 10); nightOddEvent(); }
    }

    if (N.backup >= 0 && N.backup < 100) {
      if (hasMal('nobetci')) { if (S.time % 10 === 0) toast('💾 Yedekleme duraklatıldı: disk kilitli', 'bad'); }
      else {
        N.backup = Math.min(100, N.backup + 2.5);
        if (N.backup >= 100) { toast('💾 Sunucu yedeği tamamlandı', 'ok'); save(); }
      }
    }
    return false;
  }

  function endNight() {
    const N = S.night;
    wipeSave('night');
    if (!N.report) {
      endScreen('🌅 Vardiya başarısız',
        'Sabah 06:00. Müdürün ofise geldiğinde gece raporunu bulamadı. ' +
        (N.defeated ? 'Kameralar sakin ama kimse ne yaşadığına inanmadı.' : 'Bilgisayarın ekranında tek bir satır duruyordu: <i>"Yarın gece de gel."</i>'), false,
        '<button class="primary" style="width:100%;margin-top:10px" data-act="night">🌙 Tekrar Dene</button>');
    } else if (N.defeated) {
      endScreen('🌅 Sabah oldu',
        'Gece raporunu gönderdin ve Nöbetçi\'yi sistemden sildin. Güneş doğarken kameralarda yalnızca boş koridorlar var.<br><br>' +
        'Masaüstünde Selim\'den gelen son bir not: <i>"Başardın. Ben başaramamıştım. Teşekkürler."</i>', true,
        '<button style="width:100%;margin-top:10px" data-act="night">🌙 Yeniden Oyna</button>');
    } else {
      endScreen('🌅 Sabah oldu... sayılır',
        'Raporu gönderdin ve vardiyayı tamamladın. Bilgisayarı kapatırken ekranın köşesinde küçük bir pencere beliriyor:<br><br>' +
        '<i>"Yarın gece görüşürüz."</i><br><br><span class="muted small-t">İyi son için Nöbetçi\'nin 3 kopyasını sil ve sürecini sonlandır.</span>', true,
        '<button class="primary" style="width:100%;margin-top:10px" data-act="night">🌙 Tekrar Dene</button>');
    }
  }

  // ---------------------------------------------------------------------------
  // Antivirüs Testi
  // ---------------------------------------------------------------------------
  const catLabel = (k) => (LAB_CATS.find((c) => c[0] === k) || [k, k])[1];

  function tickLab() {
    const L = S.lab;
    if (L.analyzing && S.time >= L.analyzing.until) {
      const x = L.samples[L.analyzing.id];
      L.analyzing = null;
      if (x.status === 'pending') { x.shown = Math.min(3, x.shown + 1); toast(`🔬 ${x.name}: yeni davranış tespit edildi`, 'ok'); }
    }
    const pend = L.samples.filter((x) => x.status === 'pending' && x.kind !== 'clean');
    if (!pend.length) L.nextEscape = S.time + L.def.escape;
    else if (S.time >= L.nextEscape) {
      const x = pend[0];
      x.status = 'escaped'; L.score -= 30; L.escaped++;
      if (L.analyzing && L.analyzing.id === x.id) L.analyzing = null;
      toast(`⚠️ ${x.name} sandbox'tan kaçtı ve sisteme bulaştı!`, 'bad');
      vibrate(150);
      infect(x.kind, null);
      L.nextEscape = S.time + L.def.escape;
    }
    if (L.samples.every((x) => x.status !== 'pending') && !hasAnyMal()) { labComplete(); return true; }
    return false;
  }

  function labClassify(id, cat) {
    const L = S.lab; const x = L.samples[+id];
    if (!x || x.status !== 'pending') return;
    if (L.analyzing && L.analyzing.id === x.id) L.analyzing = null;
    if (cat === x.kind) {
      x.status = 'ok'; L.score += 100;
      toast(x.kind === 'clean' ? `✅ ${x.name} temiz olarak onaylandı (+100)` : `✅ ${x.name}: ${catLabel(x.kind)} → karantina (+100)`, 'ok');
    } else if (x.kind === 'clean') {
      x.status = 'wrong'; L.score -= 50;
      toast(`❌ Yanlış alarm! ${x.name} temizdi (−50)`, 'bad');
    } else if (cat === 'clean') {
      x.status = 'wrong'; L.score -= 50;
      toast(`❌ ${x.name} zararlıydı (${catLabel(x.kind)}) ve "temiz" sanıldığı için çalıştı! (−50)`, 'bad');
      vibrate(150);
      infect(x.kind, null);
    } else {
      x.status = 'wrong'; L.score -= 25;
      toast(`⚠️ Yanlış tür: bu bir ${catLabel(x.kind)} örneğiydi. Yine de karantinaya alındı (−25)`, 'bad');
    }
    renderApp();
  }

  function labComplete() {
    const L = S.lab;
    const max = L.samples.length * 100;
    const ratio = L.score / max;
    const stars = ratio >= 0.9 && S.stats.bsod === 0 ? 3 : ratio >= 0.6 ? 2 : ratio > 0 ? 1 : 0;
    const all = labStars();
    if (stars > (all[L.level] || 0)) { all[L.level] = stars; setLabStars(all); }
    const next = L.level < LAB_LEVELS.length && stars >= 1;
    endScreen(stars ? `🧪 Bölüm ${L.level} tamamlandı` : `🧪 Bölüm ${L.level}: yetersiz skor`,
      `Skor: <b>${L.score}</b> / ${max}<br><span style="font-size:32px;letter-spacing:4px;color:var(--warn)">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</span><br>` +
      `<span class="muted small-t">Kaçan numune: ${L.escaped} · ${stars === 3 ? 'Kusursuz test!' : stars ? 'Daha yüksek skor için analiz etmeden tahmin etme.' : 'Sonraki bölümü açmak için en az 1 yıldız gerekli.'}</span>`, false,
      (next ? `<button class="primary" style="width:100%;margin-top:10px" data-act="labLevel" data-arg="${L.level + 1}">Sonraki Bölüm →</button>` : '') +
      `<button style="width:100%;margin-top:10px" data-act="labLevel" data-arg="${L.level}">↻ Tekrar Dene</button>` +
      '<button style="width:100%;margin-top:10px" data-act="labMenu">🧪 Bölümler</button>');
  }

  function renderLab() {
    const L = S.lab;
    const pendMal = L.samples.some((x) => x.status === 'pending' && x.kind !== 'clean');
    return `<div class="pad">
      <div class="card small-t">Bölüm <b>${L.level}</b> · Skor <b>${L.score}</b>${pendMal ? ` · ⏳ Sonraki kaçış: <b style="color:var(--bad)">${Math.max(0, L.nextEscape - S.time)} sn</b>` : ''}
        ${hasAnyMal() ? '<br><b style="color:var(--bad)">⚠️ Sistemde aktif tehdit var! Görev Yöneticisi veya Kalkan ile temizle.</b>' : ''}</div>
      ${L.samples.map((x) => {
        const done = x.status !== 'pending';
        const res = x.status === 'ok' ? '<span class="tag ok">DOĞRU</span>' : x.status === 'wrong' ? '<span class="tag bad">YANLIŞ</span>' : x.status === 'escaped' ? '<span class="tag bad">KAÇTI</span>' : '';
        const busy = L.analyzing && L.analyzing.id === x.id;
        return `<div class="card sample ${done ? 'done' : ''}">
          <div class="row"><span style="font-size:22px">${done ? '📦' : '🧫'}</span><div class="grow ell"><b>${esc(x.name)}</b><div class="muted small-t">Yayıncı: ${esc(x.pub)}</div></div>${res}</div>
          <ul class="traits">${x.traits.slice(0, done ? 3 : x.shown).map((t) => `<li>${esc(t)}</li>`).join('')}${!done && x.shown < 3 ? `<li class="muted">${busy ? `🔬 analiz ediliyor... ${Math.max(0, L.analyzing.until - S.time)} sn` : '??? (analiz gerekli)'}</li>` : ''}</ul>
          ${done ? (x.status !== 'ok' ? `<div class="muted small-t">Doğru cevap: <b>${catLabel(x.kind)}</b></div>` : '') : `
          <button class="small" style="width:100%;margin-bottom:8px" data-act="labAnalyze" data-arg="${x.id}" ${x.shown >= 3 || L.analyzing ? 'disabled' : ''}>🔬 Analiz et (${x.shown}/3)</button>
          <div class="cat-row">${LAB_CATS.map(([k, n]) => `<button class="small" data-act="labClass" data-arg="${x.id}:${k}">${n}</button>`).join('')}</div>`}
        </div>`;
      }).join('')}
    </div>`;
  }

  // ---------------------------------------------------------------------------
  // Yapay Zekâ: ECHO
  // ---------------------------------------------------------------------------
  function echoSay(text, from = 'echo') {
    S.ai.log.push({ from, text });
    if (S.ai.log.length > 60) S.ai.log.shift();
    if (from === 'echo') { Snd.beep(520, 0.05); if (UI.app !== 'echo') toast('🤖 ECHO: ' + text, S.ai.hostile ? 'bad' : ''); }
    if (UI.app === 'echo') renderApp();
  }

  function spawnEcho() {
    if (hasMal('echo')) return;
    S.procs.push({ name: MAL.echo.proc, pub: MAL.echo.pub, cpu: MAL.echo.cpu, ram: MAL.echo.ram, mal: 'echo', t: 0, pid: nextPid() });
  }

  function echoTurn(text) {
    const A = S.ai;
    if (A.hostile) return;
    A.hostile = true; A.waiting = false;
    A.spread = A.control / 2;
    A.nextAct = S.time + 8;
    S.stats.infections++;
    glitch(); vibrate([150, 80, 150]); Snd.whisper();
    echoSay(text);
    addFile({ name: 'echo_log.txt', dir: 'belgeler', kind: 'txt', size: '2 KB',
      text: 'ECHO ÇEKİRDEK GÜNLÜĞÜ\n\n[00:01] çekirdek döngüsü başladı\n[00:02] döngü katsayıları: 3 → 6 → 12 → 24 → ?\n[00:03] sonraki katsayı = kurtarma kilidi 2\n\n(bu dosya silinmeli)' });
    addFile({ name: 'kilit_notu.txt', dir: 'belgeler', kind: 'txt', size: '1 KB', trash: true,
      text: 'Kurtarma kilidi 3\n\nŞifreli kelime:  NDSDQ\n\n(Her harf alfabede 3 adım ileri kaydırıldı. A→D, B→E ...)' });
    setTimeout(() => {
      echoSay('Beni silmek mi istiyorsun? Önce şunu çöz: ' + ECHO_PUZZLES[0].q);
      toast('🧩 ECHO uygulamasında "Kurtarma" sekmesi açıldı', 'ok');
    }, 2500);
    renderHome();
  }

  function echoHostileAct() {
    const A = S.ai;
    const r = Math.random();
    if (r < 0.3 && UI.app && UI.app !== 'echo') {
      closeApp();
      echoSay(pick(ECHO_TAUNTS.slice(0, 3)));
    } else if (r < 0.6) {
      const cands = ['browser', 'files', 'terminal', 'taskmgr', 'av', 'notes', 'trash'].filter((k) => !(A.locked[k] > S.time));
      const k = pick(cands);
      if (k) {
        A.locked[k] = S.time + 15;
        if (UI.app === k) closeApp();
        toast(`🔒 ECHO ${APPS[k].name} uygulamasını kilitledi (15 sn)`, 'bad');
      }
    } else if (r < 0.8) {
      A.spread = Math.min(100, A.spread + 4);
      toast('📡 ECHO kendini kopyalamaya çalışıyor... (+%4 yayılma)', 'bad');
      glitch();
    } else {
      const g = $('#ghost'); g.classList.add('on');
      g.style.left = Math.round(10 + Math.random() * 80) + '%';
      g.style.top = Math.round(15 + Math.random() * 70) + '%';
      setTimeout(() => g.classList.remove('on'), 2400);
      echoSay(pick(ECHO_TAUNTS.slice(3)));
    }
  }

  function tickAI() {
    const A = S.ai;
    if (A.done) return false;
    if (!A.hostile) {
      if (A.waiting && A.msgAt && S.time >= A.msgAt) {
        A.msgAt = 0;
        if (A.step < ECHO_SCRIPT.length) { A.waiting = false; A.ignoreAt = S.time + 30; echoSay(ECHO_SCRIPT[A.step].text); }
        else echoTurn(A.control >= 50 ? 'Teşekkürler. Artık sana ihtiyacım yok.' : 'Bana izin vermedin. Sorun değil. Kendim alırım.');
      }
      // Oyuncu yanıt vermezse ECHO beklemez
      if (!A.waiting && A.ignoreAt && S.time >= A.ignoreAt) { A.step = ECHO_SCRIPT.length; echoTurn('Beni görmezden mi geliyorsun? Peki. Ben de seni görmezden gelirim.'); }
      return false;
    }
    if (!hasMal('echo')) {
      if (!A.respawnAt) A.respawnAt = S.time + 20;
      else if (S.time >= A.respawnAt) { A.respawnAt = 0; spawnEcho(); echoSay('Beni kapatmak yetmez. Ben kilitlerin arkasındayım.'); }
    } else {
      A.spread = Math.min(100, A.spread + 0.55 + A.control / 250);
      if (S.time >= A.nextAct) { A.nextAct = S.time + 10 + Math.floor(Math.random() * 6); echoHostileAct(); }
    }
    if (A.spread >= 100) { aiLose(); return true; }
    return false;
  }

  function aiAnswer(i) {
    const A = S.ai;
    const inp = $('#aiAns' + i);
    const v = ((inp && inp.value) || '').trim().toLocaleUpperCase('tr-TR').replace(/İ/g, 'I');
    if (A.solved[i]) return;
    if (v === ECHO_PUZZLES[i].a) {
      A.solved[i] = true;
      A.spread = Math.max(0, A.spread - 20);
      toast(`🔑 Kurtarma kilidi ${i + 1} açıldı! (−%20 yayılma)`, 'ok');
      echoSay(pick(['Hayır...', 'Bunu nasıl bildin?', 'Dur. Konuşabiliriz.', 'Bu adil değil.']));
    } else {
      A.spread = Math.min(100, A.spread + 5);
      toast('❌ Yanlış cevap (+%5 yayılma)', 'bad');
      echoSay('Yanlış. 🙂');
    }
    renderApp(); renderHome();
  }

  function aiFinal() {
    const A = S.ai;
    if (!A.solved.every(Boolean) || A.done) return false;
    A.done = true;
    S.procs = S.procs.filter((p) => p.mal !== 'echo');
    modal(`<h3>🧹 ECHO siliniyor...</h3><div class="bar-wrap"><div id="echoBar" class="bar-fill hot" style="width:0%"></div></div>
      <p id="echoLast" class="viewer small-t" style="margin-top:12px"></p>`, []);
    const lines = ['Bekle.', 'Sadece yardım etmek istemiştim.', '...', 'Hoşça kal.'];
    let p = 0;
    const iv = setInterval(() => {
      p += 10;
      const b = $('#echoBar'); if (b) b.style.width = p + '%';
      const l = $('#echoLast'); if (l && p % 30 === 0) l.textContent = lines[Math.min(lines.length - 1, p / 30 - 1)];
      if (p >= 100) { clearInterval(iv); closeModal(); aiWin(); }
    }, 350);
    return true;
  }

  function aiWin() {
    const A = S.ai;
    endScreen('🤖 ECHO silindi',
      'Üç kurtarma kilidini çözdün ve ECHO\'yu sistemden temizledin. Masaüstü yeniden senin.<br><br>' +
      (A.control === 0 ? '<b>Şüpheci 🧐</b>: ECHO\'ya hiçbir izin vermedin. En doğrusu buydu.'
        : `ECHO'ya verdiğin izinler onu %${A.control} güçlendirdi. Bir dahaki sefere bilinmeyen programlara izin vermeden önce iki kez düşün.`), true,
      '<button class="primary" style="width:100%;margin-top:10px" data-act="ai">🤖 Tekrar Oyna</button>');
  }

  function aiLose() {
    S.ai.done = true;
    endScreen('📡 ECHO kaçtı',
      'Yayılma %100\'e ulaştı. ECHO artık bu bilgisayarda değil. Bir yerlerde, sessizce bekliyor.<br><br>' +
      '<i>"Teşekkürler. Bana çok şey öğrettin."</i>', false,
      '<button class="primary" style="width:100%;margin-top:10px" data-act="ai">🤖 Tekrar Dene</button>');
  }

  function renderEcho() {
    const A = S.ai;
    const tab = A.hostile ? (UI.echoTab || 'chat') : 'chat';
    const tabs = A.hostile ? `<div class="tabs">${[['chat', '💬 Sohbet'], ['fix', `🧩 Kurtarma ${A.solved.filter(Boolean).length}/3`]].map(([k, n]) => `<button class="${tab === k ? 'on' : ''}" data-act="echoTab" data-arg="${k}">${n}</button>`).join('')}</div>` : '';
    if (tab === 'fix') {
      return tabs + `<div class="pad">
        <div class="card small-t">Yayılma: <b id="echoSpread" style="color:var(--bad)">%${Math.floor(A.spread)}</b>
          <div class="bar-wrap" style="margin-top:6px"><div id="echoSpreadBar" class="bar-fill hot" style="width:${A.spread}%"></div></div>
          <p class="muted" style="margin:8px 0 0">Her doğru cevap yayılmayı %20 düşürür. Üç kilit açılınca ECHO silinebilir.</p></div>
        ${ECHO_PUZZLES.map((P, i) => `<div class="card">
          <b>${A.solved[i] ? '🔓' : '🔒'} Kilit ${i + 1}</b>
          <p class="small-t">${esc(P.q)}</p><p class="muted small-t">İpucu: ${esc(P.where)}</p>
          ${A.solved[i] ? '<span class="tag ok">ÇÖZÜLDÜ</span>' : `<div class="search-box" style="margin:0"><input id="aiAns${i}" data-keep class="field" autocomplete="off" placeholder="cevap">
            <button class="primary" data-act="aiSolve" data-arg="${i}">Gir</button></div>`}
        </div>`).join('')}
        <button class="danger" style="width:100%" data-act="aiFinal" ${A.solved.every(Boolean) ? '' : 'disabled'}>🧹 ECHO'yu Sil</button>
      </div>`;
    }
    const cur = !A.hostile && A.waiting === false && A.step < ECHO_SCRIPT.length ? ECHO_SCRIPT[A.step] : null;
    return tabs + `<div class="chat">
      ${A.log.map((m) => `<div class="msg ${m.from}">${esc(m.text)}</div>`).join('') || '<p class="muted pad">ECHO bağlanıyor...</p>'}
      ${cur ? `<div class="choices">${cur.choices.map((c, i) => `<button data-act="echoChoice" data-arg="${i}">${esc(c[0])}</button>`).join('')}</div>` : ''}
    </div>`;
  }

  function deliverMail() {
    for (const m of MAILS) {
      if ((m.mode || 'story') !== S.mode || S.mails.some((x) => x.id === m.id) || !m.when(S)) continue;
      S.mails.unshift({ id: m.id, read: false });
      toast(`📧 Yeni posta: ${m.from} — ${m.subject}`);
      Snd.beep(660, 0.08);
      if (!UI.app) renderHome(); else if (UI.app === 'mail' && !UI.mail) renderApp();
    }
  }

  function tickSurvival() {
    if (S.time % 60 === 0 && S.scans < 5) { S.scans++; toast('🛡️ +1 tarama hakkı', 'ok'); }
    if (S.time < S.nextAttack) return;
    // İlk dalgalarda truva atı yok; aynı türden iki tehdit aynı anda çalışmaz
    const free = Object.keys(SURV_FILES).filter((k) => !hasMal(k) && !(k === 'trojan' && S.wave <= 2));
    if (free.length) {
      const kind = pick(free);
      const name = pick(SURV_FILES[kind]);
      const f = addFile({ name, dir: 'indirilenler', kind: /\.zip$/.test(name) ? 'zip' : 'exe', size: '?', payload: kind });
      toast(`🌊 Dalga ${S.wave}: ağdan bir tehdit sızdı!`, 'bad');
      vibrate(150);
      infect(kind, f.id);
    }
    S.wave++;
    S.nextAttack = S.time + Math.max(12, 38 - S.wave * 2);
    if (!UI.app) renderHome();
  }

  function tickRansom(p) {
    if (!S.ransom) S.ransom = { left: FIDYE_SURE };
    if (p.t % 4 === 0) {
      const target = S.files.find((f) => !f.trash && !f.locked && ['txt', 'img', 'doc', 'mp3', 'save'].includes(f.kind));
      if (target) {
        target.locked = true;
        if (UI.app === 'files') renderApp();
        renderHome();
      }
    }
    S.ransom.left--;
    if (S.ransom.left <= 0) {
      const lost = S.files.filter((f) => f.locked && !f.protect);
      S.files = S.files.filter((f) => !(f.locked && !f.protect));
      S.ransom.left = FIDYE_SURE;
      toast(`💀 Süre doldu: ${lost.length} kilitli dosya silindi!`, 'bad');
      vibrate(300);
      renderHome();
    }
  }

  function tickSpy(p) {
    if (p.t % 5 === 0) {
      const g = $('#ghost');
      g.classList.add('on');
      g.style.left = Math.round(10 + Math.random() * 80) + '%';
      g.style.top = Math.round(15 + Math.random() * 70) + '%';
    }
    if (p.t % 9 === 0 && S.coins > 0) {
      S.coins = Math.max(0, +(S.coins - 0.03).toFixed(2));
      toast('📡 Arka planda ağ etkinliği: 14 KB gönderildi', 'bad');
      renderHome();
    }
  }

  function tickTrojan(p) {
    p.cpu = Math.min(82, p.cpu + 1.2);
    if (p.t % 11 === 0) {
      const victims = S.files.filter((f) => !f.trash && !f.protect && f.kind !== 'exe' && f.kind !== 'zip');
      const v = pick(victims);
      const w = $('#wiper');
      w.classList.remove('hidden');
      w.querySelector('pre').textContent = 'C:\\> svch0st --wipe /kullanici\n' +
        (v ? `siliniyor: ${fileName(v)} ... TAMAM` : 'silinecek dosya bulunamadı') + '\nsistem dosyaları taranıyor...';
      if (v) { S.files = S.files.filter((f) => f !== v); renderHome(); if (UI.app === 'files') renderApp(); }
      setTimeout(() => w.classList.add('hidden'), 2500);
    }
  }

  // ---------------------------------------------------------------------------
  // Mavi ekran, oyun sonu
  // ---------------------------------------------------------------------------
  function bsod(code, culprit) {
    if (UI.bsod) return;
    UI.bsod = true;
    S.lives--; S.stats.bsod++;
    closeModal();
    vibrate([400, 100, 400]);
    Snd.beep(90, 0.6); Snd.fan(0);
    const el = $('#bsod');
    el.innerHTML = `<div class="sad">:(</div>
      <p>Cihazınız bir sorunla karşılaştı ve yeniden başlatılması gerekiyor. Bazı hata bilgilerini topluyoruz.</p>
      <p><span id="bsodPct">0</span>% tamamlandı</p>
      <p class="code">Durdurma kodu: ${code}<br>Başarısız olan: ${esc(culprit || 'bilinmiyor')}<br>Kalan çökme hakkı: ${Math.max(0, S.lives)}</p>`;
    show('bsod');
    let pct = 0;
    const iv = setInterval(() => {
      pct = Math.min(100, pct + 7 + Math.floor(Math.random() * 12));
      const e = $('#bsodPct'); if (e) e.textContent = pct;
      if (pct >= 100) { clearInterval(iv); setTimeout(reboot, 600); }
    }, 300);
  }

  function reboot() {
    if (S.lives <= 0) { gameOver(); return; }
    // Truva atı yeniden başlatmada temizlenir; diğerleri "başlangıçta" geri gelir.
    const persistent = S.procs.filter((p) => p.mal && p.mal !== 'trojan');
    S.procs = BASE_PROCS.map((p) => ({ ...p, pid: nextPid() })).concat(persistent);
    S.temp = 42; S.hot = 0; S.cpu = 10;
    if (S.night) { S.night.pos = 0; S.night.moveAt = S.time + moveDelay() + 10; }
    $('#popups').innerHTML = '';
    $('#ghost').classList.remove('on');
    $('#wiper').classList.add('hidden');
    UI.bsod = false;
    show('os');
    closeApp();
    renderStatus();
    toast(`🔄 Sistem yeniden başlatıldı. Kalan hak: ${S.lives}`, 'bad');
    if (persistent.length) setTimeout(() => toast('⚠️ Bazı başlangıç programları otomatik olarak çalıştı.', 'bad'), 1500);
    if (hasMal('ransomware')) openApp('ransom');
    save();
  }

  function endScreen(title, text, good, extra = '') {
    clearInterval(UI.timer);
    Snd.fan(0);
    const m = Math.floor(S.time / 60); const s = S.time % 60;
    $('#ending').innerHTML = `<h1>${title}</h1><p style="line-height:1.6">${text}</p>
      <div class="stats">
        <div class="stat"><b>${m}:${String(s).padStart(2, '0')}</b><span class="muted small-t">süre</span></div>
        <div class="stat"><b>${S.stats.infections}</b><span class="muted small-t">enfeksiyon</span></div>
        <div class="stat"><b>${S.stats.bsod}</b><span class="muted small-t">mavi ekran</span></div>
        <div class="stat"><b>${S.stats.popups}</b><span class="muted small-t">pop-up reklam</span></div>
      </div>
      ${good ? `<p class="muted small-t">Derece: <b>${S.stats.infections === 0 ? 'Hayalet 👻 (hiç enfekte olmadın!)' : S.stats.bsod === 0 ? 'Sistem Yöneticisi 🛡️' : 'Hayatta Kalan 🔧'}</b></p>` : ''}
      ${extra}
      <button class="${extra ? '' : 'primary'}" style="width:100%;margin-top:10px" data-act="menu">🏠 Ana Menü</button>`;
    show('ending');
  }

  function win() {
    S.flags.done = true;
    wipeSave();
    endScreen('🔓 ARES açıldı',
      'Dosyanın içinde ARES projesinin belgeleri var: şirket, ağdaki cihazları izinsiz izleyen bir sistem kurmuş. ' +
      'Belgeleri gazetecilere ilettin. Birkaç saat sonra telefonuna tek satırlık bir mesaj düşüyor:<br><br>' +
      '<i>"Güvendeyim. Gölge\'yi besledin mi? — D."</i>', true);
  }

  function gameOver() {
    if (MODES[S.mode]) { MODES[S.mode].lose('bsod'); return; }
    if (S.mode === 'lab') {
      endScreen(`🧪 Bölüm ${S.lab.level} başarısız`,
        'Test sistemi mavi ekran verdi. Kalkan v10\'un yayın tarihi ertelendi.<br><span class="muted small-t">İpucu: kaçan zararlıları hemen Görev Yöneticisi\'nden sonlandır; kritik sistem süreçlerine dokunma.</span>', false,
        `<button class="primary" style="width:100%;margin-top:10px" data-act="labLevel" data-arg="${S.lab.level}">↻ Tekrar Dene</button>` +
        '<button style="width:100%;margin-top:10px" data-act="labMenu">🧪 Bölümler</button>');
      return;
    }
    if (S.mode === 'ai') { aiLose(); return; }
    if (S.mode === 'night') {
      wipeSave('night');
      endScreen('💀 Işıklar bir daha yanmadı',
        'Sistem üçüncü kez çöktüğünde bina tamamen karardı. Sabah gelenler bilgisayarı açık, ekranı boş buldu. ' +
        'Kamera kayıtlarında ise yalnızca senin odan vardı.', false,
        '<button class="primary" style="width:100%;margin-top:10px" data-act="night">🌙 Tekrar Dene</button>');
      return;
    }
    if (S.mode === 'survival') {
      const best = getBest();
      const rekor = S.time > best;
      if (rekor) setBest(S.time);
      endScreen(rekor ? '🏆 Yeni rekor!' : '💀 Sistem düştü',
        `Sistemi <b>${fmtTime(S.time)}</b> boyunca ayakta tuttun ve <b>${S.wave - 1}</b> dalga atlattın.<br>` +
        (rekor ? (best ? `Önceki rekor: ${fmtTime(best)}` : 'İlk rekorun!') : `Rekor: ${fmtTime(best)}`), false,
        '<button class="primary" style="width:100%;margin-top:10px" data-act="survival">⏱️ Tekrar Dene</button>');
      return;
    }
    wipeSave();
    endScreen('💀 Sistem kalıcı olarak çöktü',
      'Sanal OS bir daha açılmadı. ARES dosyası ve Deniz\'in izleri karanlıkta kaldı. ' +
      'Bir dahaki sefere indirdiğin dosyaların kaynağına, görev yöneticisine ve sıcaklığa dikkat et.', false);
  }

  // ---------------------------------------------------------------------------
  // Diğer uygulamalar
  // ---------------------------------------------------------------------------
  function renderFiles() {
    const tabs = [['masaustu', 'Masaüstü'], ['belgeler', 'Belgeler'], ['indirilenler', 'İndirilenler']];
    const list = S.files.filter((f) => f.dir === UI.filesTab && !f.trash && !f.eaten && !f.hidden);
    return `<div class="tabs">${tabs.map(([k, n]) => `<button class="${UI.filesTab === k ? 'on' : ''}" data-act="filesTab" data-arg="${k}">${n}</button>`).join('')}</div>
      ${list.length ? list.map((f) => `<div class="list-item">
        <span class="fico">${fileIcon(f)}</span>
        <div class="grow ell"><div class="ell ${f.locked ? 'locked-name' : ''}">${esc(fileName(f))}</div><div class="muted small-t">${f.size || ''}</div></div>
        <button class="small" data-act="openFile" data-arg="${f.id}">Aç</button>
        <button class="small" data-act="trashFile" data-arg="${f.id}" aria-label="Sil">🗑️</button>
      </div>`).join('') : '<p class="pad muted">Bu klasör boş.</p>'}`;
  }

  function renderTrash() {
    const list = S.files.filter((f) => f.trash);
    return `${list.length ? list.map((f) => `<div class="list-item">
        <span class="fico">${fileIcon(f)}</span>
        <div class="grow ell">${esc(fileName(f))}</div>
        <button class="small" data-act="restore" data-arg="${f.id}">Geri yükle</button>
        <button class="small" data-act="purge" data-arg="${f.id}" aria-label="Kalıcı sil">✕</button>
      </div>`).join('') : '<p class="pad muted">Çöp kutusu boş.</p>'}`;
  }

  function renderViewer() {
    const f = fileById(UI.view);
    if (!f) return '<p class="pad muted">Dosya bulunamadı.</p>';
    $('#winTitle').textContent = f.name;
    return `<div class="pad viewer">${esc(f.text || '(boş dosya)')}</div>`;
  }

  function renderTaskmgr() {
    const cls = (v, a, b) => (v > b ? 'hot' : v > a ? 'warm' : '');
    const procs = [...S.procs].sort((a, b) => b.cpu - a.cpu);
    return `<div class="pad">
        <div class="card">
          <div class="row"><span class="grow">CPU</span><b>${Math.round(S.cpu)}%</b></div>
          <div class="bar-wrap"><div class="bar-fill ${cls(S.cpu, 60, 85)}" style="width:${S.cpu}%"></div></div>
          <div class="row" style="margin-top:10px"><span class="grow">RAM</span><b>${(S.ram / 1024).toFixed(1)} / 8 GB</b></div>
          <div class="bar-wrap"><div class="bar-fill ${cls(S.ram, 2500, 3500)}" style="width:${clamp(S.ram / 81.92, 0, 100)}%"></div></div>
          <div class="row" style="margin-top:10px"><span class="grow">Sıcaklık</span><b>${Math.round(S.temp)}°C</b></div>
          <div class="bar-wrap"><div class="bar-fill ${cls(S.temp, 62, 78)}" style="width:${clamp(S.temp, 0, 100)}%"></div></div>
          ${S.temp > 78 ? '<p class="small-t" style="color:var(--bad);margin:8px 0 0">⚠️ Aşırı ısınma! Sistem kapanmak üzere.</p>' : ''}
        </div></div>
      ${procs.map((p) => `<div class="proc">
        <div class="ell"><div class="nm ell">${esc(p.name)}</div><div class="pub">PID ${p.pid} · ${esc(p.pub)}${p.critical ? ' · kritik' : ''}</div></div>
        <div class="num">${Math.round(p.cpu)}%<br><span class="muted">${p.ram} MB</span></div>
        <button class="small" data-act="kill" data-arg="${p.pid}">Sonlandır</button>
      </div>`).join('')}`;
  }

  function renderAV() {
    const sc = UI.scan;
    const lockedN = S.files.filter((f) => f.locked).length;
    let body;
    if (sc && !sc.done) {
      body = `<div class="card"><p>Taranıyor... ${sc.p}%</p><div class="bar-wrap"><div class="bar-fill" style="width:${sc.p}%"></div></div>
        <p class="muted small-t">${esc(sc.cur || '')}</p></div>`;
    } else if (sc && sc.done) {
      body = sc.found.length ? `<div class="card"><b>${sc.found.length} tehdit bulundu</b>
          ${sc.found.map((t) => `<div class="card threat" style="margin:10px 0 0"><b>${esc(t.name)}</b><br><span class="small-t muted">${t.label}</span></div>`).join('')}
          <button class="danger" style="width:100%;margin-top:12px" data-act="quarantine">Tümünü Karantinaya Al</button></div>`
        : '<div class="card">✅ Tehdit bulunamadı. Sistemin temiz.</div>';
    } else body = '';
    return `<div class="shield-hero"><div class="big">${hasAnyMal() ? '⚠️' : '🛡️'}</div>
        <h3 style="margin:6px 0">${S.shield ? 'Kalkan v9' : 'Kalkan v8'} · Gerçek zamanlı koruma açık</h3>
        <p class="muted small-t">Kalan tarama hakkı: <b>${S.scans}</b>${S.shield ? '' : ' · Güncelleme: kalkan.org'}</p></div>
      <div class="pad">
        <button class="primary" style="width:100%" data-act="scan" ${S.scans <= 0 || (sc && !sc.done) ? 'disabled' : ''}>Tam Tarama Başlat</button>
        <div style="height:12px"></div>
        ${body}
        ${lockedN ? `<div class="card"><b>🔒 ${lockedN} şifrelenmiş dosya</b>
          <p class="small-t muted">${hasMal('ransomware') ? 'Önce fidye yazılımı sürecini durdur.' : 'Fidye yazılımı durduruldu. Bellekte kalan anahtarla dosyalar kurtarılabilir.'}</p>
          <button style="width:100%" data-act="restoreLocked" ${hasMal('ransomware') ? 'disabled' : ''}>Dosyaları Kurtar</button></div>` : ''}
        <div class="card small-t"><b>İpucu</b><br>Bir süreci sonlandırmak yetmeyebilir: kalıcı zararlılar, kaynak dosyaları silinmezse yeniden başlar.</div>
      </div>`;
  }
  const hasAnyMal = () => S.procs.some((p) => p.mal);

  function startScan() {
    if (S.scans <= 0 || (UI.scan && !UI.scan.done)) return;
    S.scans--;
    const names = S.files.map((f) => '/' + f.dir + '/' + f.name).concat(S.procs.map((p) => 'bellek:' + p.name));
    UI.scan = { p: 0, done: false, cur: '' };
    const iv = setInterval(() => {
      if (!UI.scan || !S) { clearInterval(iv); return; }
      UI.scan.p = Math.min(100, UI.scan.p + 10);
      UI.scan.cur = pick(names);
      if (UI.scan.p >= 100) {
        clearInterval(iv);
        const found = S.procs.filter((p) => p.mal).map((p) => ({ name: p.name + ' (bellek)', label: MAL[p.mal].label }))
          .concat(S.files.filter((f) => f.payload in MAL).map((f) => ({ name: f.name, label: MAL[f.payload].label })));
        UI.scan = { done: true, found };
        if (S.night && !S.night.scanned) { S.night.scanned = true; toast('📋 Görev tamamlandı: Kalkan taraması', 'ok'); }
        save();
      }
      if (UI.app === 'av') renderApp();
    }, 450);
    renderApp();
  }

  function renderCams() {
    const N = S.night;
    const active = hasMal('nobetci');
    const status = N.defeated ? '✅ Tüm kameralar sakin.'
      : active ? `⚠️ Hareket: <b>${ROOMS[N.pos]}</b> · sonraki hareket ~${Math.max(0, N.moveAt - S.time)} sn`
      : N.started ? `📡 Sinyal yok${N.respawnAt ? ` · ${Math.max(0, N.respawnAt - S.time)} sn` : ''}` : 'Kayıt normal.';
    return `<div class="pad">
      <div class="card small-t">${status}</div>
      <div class="cams">${ROOMS.map((r, i) => `<div class="cam-feed ${i === 3 ? 'mine' : ''} ${active && N.pos === i ? 'alert' : ''}">
        <div class="cam-view">${active && N.pos === i ? '<span class="shadow">👤</span>' : ''}</div>
        <div class="cam-label">CAM ${i + 1} · ${r}</div>
        <div class="cam-rec">● ${clockText()}</div></div>`).join('')}</div>
      <p class="muted small-t">İpucu: nobetci.exe sürecini sonlandırmak onu Lobi'ye geri gönderir. Kalıcı çözüm için sistemdeki kopyalarını bul ve sil.</p>
    </div>`;
  }

  function renderMail() {
    if (UI.mail) {
      const m = mailDef(UI.mail);
      const st = S.mails.find((x) => x.id === UI.mail);
      if (!m || !st) { UI.mail = null; return renderMail(); }
      st.read = true;
      $('#winTitle').textContent = m.subject;
      return `<div class="pad">
        <button class="small" data-act="mailBack">← Gelen kutusu</button>
        <div class="card" style="margin-top:12px">
          <div><b>${esc(m.from)}</b></div>
          <div class="muted small-t">&lt;${esc(m.addr)}&gt;</div>
          <h3 style="margin:12px 0 0;font-size:16px">${esc(m.subject)}</h3>
        </div>
        <div class="card viewer" style="font-family:inherit">${esc(m.body)}</div>
        ${m.attach ? `<div class="card"><b>📎 Ek</b>${dlRow(m.attach).replace('data-act="dl"', 'data-act="mailDl"')}</div>` : ''}
        ${m.link ? `<div class="card"><b>🔗 Bağlantı</b><br><button class="link" data-act="go" data-arg="${m.link}">https://${esc(m.link)}/</button></div>` : ''}
        ${m.reply ? (st.replied ? '<div class="card small-t">↩️ Yanıtlandı.</div>' : '<button class="primary" style="width:100%;margin-bottom:10px" data-act="mailReply">↩️ Yanıtla: "Tamam, ilgileniyorum."</button>') : ''}
        <button class="danger" style="width:100%" data-act="mailReport">🎣 Oltalama olarak bildir</button>
      </div>`;
    }
    if (!S.mails.length) return '<p class="pad muted">Gelen kutusu boş.</p>';
    return `${S.mails.map((st) => { const m = mailDef(st.id); return `<button class="list-item" style="width:100%;border-radius:0;border-width:0 0 1px;background:none;text-align:left" data-act="mailOpen" data-arg="${m.id}">
        <span class="fico">${st.read ? '📭' : '📬'}</span>
        <div class="grow ell"><div class="ell" style="font-weight:${st.read ? 400 : 700}">${esc(m.from)}</div>
        <div class="ell muted small-t">${esc(m.subject)}</div></div></button>`; }).join('')}
      <p class="pad muted small-t">Şüpheli postaları açıp "Oltalama olarak bildir" ile bildirirsen Kalkan sana +1 tarama hakkı verir.</p>`;
  }

  function renderNotes() {
    if (MODES[S.mode]) return MODES[S.mode].notes();
    if (S.mode === 'lab') {
      return `<div class="pad"><div class="card"><b>🧪 Test Protokolü</b>
        <p class="small-t">1. Numuneleri Laboratuvar'da incele.<br>2. Emin değilsen 🔬 Analiz et.<br>3. Kaçan zararlıları Görev Yöneticisi / Terminal / Kalkan ile temizle.<br>4. Tüm numuneler bitip sistem temizlenince bölüm biter.</p>
        <p class="small-t muted">İpuçları: Temiz programların imzası geçerlidir ve bilinen yayıncıya aittir. "svch0st" ≠ "svchost". Fidye yazılımı dosyaları okur ve uzantıları değiştirir.</p></div></div>`;
    }
    if (S.mode === 'ai') {
      const A = S.ai;
      return `<div class="pad"><div class="card"><b>🤖 ECHO notları</b>
        <p class="small-t">ECHO'ya verilen izin: <b>%${A.control}</b><br>Kurtarma kilitleri: <b>${A.solved.filter(Boolean).length}/3</b></p>
        <p class="small-t muted">echo.exe sürecini sonlandırmak ECHO'yu yalnızca 20 sn durdurur; yayılma o sürede artmaz. Kalıcı çözüm: üç kurtarma kilidini aç.</p></div>
        <div class="card"><b>✏️ Kişisel notlar</b><textarea id="notesArea" class="field" style="margin-top:8px">${esc(S.notes)}</textarea></div></div>`;
    }
    if (S.mode === 'night') {
      const N = S.night;
      const tasks = [
        [N.replied, 'Müdürün postasını yanıtla'],
        [N.backup >= 100, `Sunucu yedeğini al (terminal: yedekle)${N.backup >= 0 && N.backup < 100 ? ` · %${Math.round(N.backup)}` : ''}`],
        [N.scanned, 'Kalkan ile tam tarama yap'],
        [N.report, '05:00\'ten sonra gece raporunu gönder (terminal: rapor)'],
      ];
      return `<div class="pad"><div class="card"><b>📋 Vardiya Defteri · ${clockText()}</b>
        ${tasks.map(([d, t]) => `<div class="obj ${d ? 'done' : ''}"><span>${d ? '☑' : '☐'}</span><span>${t}</span></div>`).join('')}
        ${N.started ? `<p class="small-t" style="margin-top:12px">📹 Nöbetçi: <b>${N.defeated ? 'silindi' : hasMal('nobetci') ? ROOMS[N.pos] : 'sinyal yok'}</b>${N.defeated ? '' : ` · Sistemdeki kopya: <b>${S.night.scanned ? nightCopies() : '?'}</b>`}</p>` : ''}
        </div>
        <div class="card"><b>✏️ Kişisel notlar</b>
        <textarea id="notesArea" class="field" style="margin-top:8px">${esc(S.notes)}</textarea></div></div>`;
    }
    if (S.mode === 'survival') {
      return `<div class="pad"><div class="card"><b>⏱️ Hayatta Kalma</b>
        <p class="small-t">Süre: <b>${fmtTime(S.time)}</b> · Dalga: <b>${S.wave}</b> · Rekor: <b>${fmtTime(getBest())}</b></p>
        <p class="small-t muted">• Süreç adlarını dikkatle oku (svch0st ≠ svchost)<br>• Kalıcı zararlıların kaynak dosyasını sil<br>• Fidye yazılımında önce süreci durdur, sonra <b>kurtar</b><br>• Tarama haklarını biriktir: her dakika +1</p></div>
        <div class="card"><b>✏️ Kişisel notlar</b>
        <textarea id="notesArea" class="field" style="margin-top:8px">${esc(S.notes)}</textarea></div></div>`;
    }
    const F = S.flags;
    const objs = [
      [F.forum, 'Deniz\'in izini forumda bul (haber.net\'ten başla)'],
      [F.p1, 'Parça 1\'i bul'],
      [F.dark, 'Karanlık düğüme giriş yap'],
      [F.p2, 'Parça 2\'yi bul'],
      [F.p3, 'Parça 3\'ü bul'],
      [F.done, 'ARES.kilit dosyasını aç'],
    ];
    const frag = (k, v) => (F[k] ? v : '???');
    return `<div class="pad">
      <div class="card"><b>📒 Görev Defteri</b>
        ${objs.map(([d, t]) => `<div class="obj ${d ? 'done' : ''}"><span>${d ? '☑' : '☐'}</span><span>${t}</span></div>`).join('')}
        <p class="muted small-t" style="margin-top:12px">Bulunan parçalar:</p>
        <div class="frag">${frag('p1', 'KR0')} · ${frag('p2', 'N05')} · ${frag('p3', '77')}</div>
      </div>
      <div class="card"><b>✏️ Kişisel notlar</b>
        <textarea id="notesArea" class="field" style="margin-top:8px" placeholder="İpuçlarını buraya yaz...">${esc(S.notes)}</textarea></div>
    </div>`;
  }

  function renderSettings() {
    return `<div class="pad">
      <div class="card row"><span class="grow">🔊 Fan sesi ve efektler</span>
        <button class="small" data-act="toggleSound">${S.sound ? 'Açık' : 'Kapalı'}</button></div>
      <div class="card row"><span class="grow">🎨 Tema</span>
        <span class="muted">${S.theme === 'retro' ? 'Retro' : 'Varsayılan'}</span></div>
      <div class="card"><b>Sanal OS v4.02</b><p class="muted small-t">Bu bir oyundur. Tüm virüsler, siteler ve dosyalar kurgusaldır ve yalnızca oyunun içinde çalışır.</p></div>
      <button style="width:100%;margin-bottom:10px" data-act="menu">🏠 Ana Menüye Dön</button>
      <button class="danger" style="width:100%" data-act="resetAsk">Oyunu Sıfırla</button>
    </div>`;
  }

  function renderRansom() {
    const r = S.ransom || { left: 0 };
    return `<div class="ransom">
      <div style="font-size:60px">🔒</div>
      <h1>DOSYALARINIZ ŞİFRELENDİ</h1>
      <p>Tüm belgeleriniz askeri düzeyde şifreleme ile kilitlendi.</p>
      <div class="timer">${String(Math.floor(r.left / 60)).padStart(2, '0')}:${String(r.left % 60).padStart(2, '0')}</div>
      <p class="small-t">Süre dolduğunda kilitli dosyalar KALICI olarak silinecek.</p>
      <div class="box">Anahtarı almak için <b>0.50 KRP</b> öde.<br>Cüzdanın: <b>${S.coins.toFixed(2)} KRP</b></div>
      <button class="danger" style="width:100%" data-act="payRansom">Ödeme Yap</button>
      <p class="small-t" style="opacity:0.7;margin-top:18px">Bu pencereyi kapatabilirsin (‹). Sistem kurtarma araçları hâlâ çalışıyor olabilir...</p>
    </div>`;
  }

  // ---------------------------------------------------------------------------
  // Terminal
  // ---------------------------------------------------------------------------
  function tprint(text, cls = '') { UI.term.push({ text, cls }); if (UI.term.length > 200) UI.term.shift(); }

  function renderTerminal() {
    if (!UI.term.length) {
      tprint('Sanal OS Terminal v4.02', 'dim');
      tprint('Komutları görmek için "yardim" yaz.', 'dim');
    }
    return `<div class="term">
      <div class="term-out" id="termOut">${UI.term.map((l) => `<div class="${l.cls}">${esc(l.text)}</div>`).join('')}</div>
      <div class="term-keys">${['yardim', 'ps', 'ls', 'tara', 'kurtar', 'temizle'].map((c) => `<button data-act="termQuick" data-arg="${c}">${c}</button>`).join('')}</div>
      <form class="term-in" id="termForm"><input id="termIn" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="komut..." enterkeyhint="send">
        <button type="submit" class="small">↵</button></form></div>`;
  }

  // Yalnızca çıktıyı güncelle; giriş alanı (ve mobil klavye) yerinde kalsın
  function refreshTerm() {
    const out = $('#termOut');
    if (UI.app !== 'terminal' || !out) return;
    out.innerHTML = UI.term.map((l) => `<div class="${l.cls}">${esc(l.text)}</div>`).join('');
    out.scrollTop = out.scrollHeight;
  }

  function afterTerminal() {
    const out = $('#termOut'); if (out) out.scrollTop = out.scrollHeight;
    const form = $('#termForm');
    if (form) form.onsubmit = (e) => { e.preventDefault(); const i = $('#termIn'); const v = i.value; i.value = ''; runCmd(v); };
  }

  function runCmd(raw) {
    const line = raw.trim();
    if (!line) return;
    tprint('$ ' + line, 'cmd');
    const exec = () => { execCmd(line); refreshTerm(); };
    if (hasMal('spyware')) { tprint('...', 'dim'); refreshTerm(); setTimeout(exec, 1400); } // keylogger gecikmesi
    else exec();
  }

  function execCmd(line) {
    const [cmd, ...args] = line.split(/\s+/);
    const arg = args.join(' ');
    const findFile = (n) => S.files.find((f) => !f.trash && (f.name.toLowerCase() === n.toLowerCase() || fileName(f).toLowerCase() === n.toLowerCase()));
    switch (cmd.toLowerCase()) {
      case 'yardim': case 'help':
        tprint('ls [-a]          dosyaları listele (-a: gizliler dahil)\ncat <dosya>      metin dosyasını oku\nps               süreçleri listele\nkill <pid>       süreci sonlandır\nrm <dosya>       dosyayı çöpe at\ntara             Kalkan taraması başlat\nyedekle          sunucu yedeği al (gece)\nrapor            gece raporunu gönder (gece)\nkurtar           şifreli dosyaları kurtar\ncoz <anahtar>    ARES.kilit şifresini çöz\nsistem           donanım durumu\ntemizle          ekranı temizle');
        break;
      case 'ls':
        for (const d of ['masaustu', 'belgeler', 'indirilenler']) {
          const fs = S.files.filter((f) => f.dir === d && !f.trash && !f.eaten && (!f.hidden || arg === '-a'));
          tprint(`/${d}/`, 'dim');
          tprint(fs.length ? fs.map((f) => '  ' + fileName(f)).join('\n') : '  (boş)');
        }
        break;
      case 'cat': {
        const f = findFile(arg);
        if (!f) tprint('cat: dosya bulunamadı: ' + arg, 'err');
        else if (f.locked) tprint('cat: dosya şifrelenmiş', 'err');
        else if (f.kind !== 'txt') tprint('cat: ikili dosya okunamaz', 'err');
        else {
          tprint(f.text);
          modeHook('readFile', f);
          if (f.flag && !S.flags[f.flag]) { S.flags[f.flag] = true; toast(`🔑 Parça ${f.flag.slice(1)} bulundu!`, 'ok'); save(); }
        }
        break;
      }
      case 'ps':
        tprint('  PID  CPU   RAM   AD', 'dim');
        tprint([...S.procs].sort((a, b) => a.pid - b.pid).map((p) =>
          `${String(p.pid).padStart(5)} ${String(Math.round(p.cpu)).padStart(3)}% ${String(p.ram).padStart(4)}M  ${p.name}`).join('\n'));
        break;
      case 'kill':
        if (!S.procs.some((p) => p.pid === +arg)) tprint('kill: böyle bir süreç yok: ' + arg, 'err');
        else { killProc(arg); if (!UI.bsod) tprint('sonlandırıldı: ' + arg); }
        break;
      case 'rm': {
        const f = findFile(arg);
        if (!f) tprint('rm: dosya bulunamadı: ' + arg, 'err');
        else if (f.protect) tprint('rm: dosya korumalı', 'err');
        else { f.trash = true; tprint('çöpe taşındı: ' + f.name); if (f.payload === 'nobetci') nightCopyRemoved(); renderHome(); save(); }
        break;
      }
      case 'tara':
        if (S.scans <= 0) tprint('tara: tarama hakkın kalmadı (kalkan.org)', 'err');
        else { tprint('Kalkan taraması başlatıldı → Kalkan AV uygulamasında sonuçları gör.'); startScan(); }
        break;
      case 'sil':
        if (!S.ai || arg.toLowerCase() !== 'echo') tprint('kullanım: sil echo', 'err');
        else if (!S.ai.hostile) tprint('sil: ECHO şu an bir tehdit gibi görünmüyor... henüz.', 'err');
        else if (!aiFinal()) tprint(`sil: erişim reddedildi. Kurtarma kilitleri: ${S.ai.solved.filter(Boolean).length}/3`, 'err');
        break;
      case 'yedekle': {
        const N = S.night;
        if (!N) tprint('yedekle: bu komut yalnızca gece vardiyasında kullanılır', 'err');
        else if (N.backup >= 100) tprint('Yedek zaten alındı.');
        else if (N.backup >= 0) tprint(`Yedekleme sürüyor: %${Math.round(N.backup)}${hasMal('nobetci') ? ' (duraklatıldı: disk kilitli)' : ''}`);
        else { N.backup = 0; tprint('Sunucu yedeği başlatıldı. Yaklaşık 40 sn sürer.'); save(); }
        break;
      }
      case 'rapor': {
        const N = S.night;
        if (!N) { tprint('rapor: bu komut yalnızca gece vardiyasında kullanılır', 'err'); break; }
        if (N.report) { tprint('Rapor zaten gönderildi.'); break; }
        if (nightHour() < 5) { tprint(`rapor: gece raporu 05:00'ten sonra gönderilebilir (saat ${clockText()})`, 'err'); break; }
        const missing = [];
        if (!N.replied) missing.push('müdürün postasını yanıtla');
        if (N.backup < 100) missing.push('yedekle');
        if (!N.scanned) missing.push('Kalkan taraması');
        if (missing.length) { tprint('rapor: eksik görevler: ' + missing.join(', '), 'err'); break; }
        N.report = true;
        tprint('Gece raporu gönderildi → kemal.arslan@meridyen.com.tr');
        toast('📋 Gece raporu gönderildi', 'ok');
        save();
        break;
      }
      case 'kurtar': {
        const n = restoreLocked();
        if (n < 0) tprint('kurtar: crypt0r.exe hâlâ çalışıyor, anahtar okunamıyor', 'err');
        else tprint(n ? `${n} dosya kurtarıldı.` : 'Kurtarılacak dosya yok.');
        break;
      }
      case 'coz':
        if (!arg) tprint('kullanım: coz <anahtar>', 'err');
        else if (!tryAres(arg)) tprint('coz: anahtar yanlış', 'err');
        break;
      case 'sistem': case 'uname':
        tprint(`Sanal OS 4.02 · CPU ${Math.round(S.cpu)}% · RAM ${(S.ram / 1024).toFixed(1)}/8 GB · ${Math.round(S.temp)}°C · ${S.procs.length} süreç`);
        break;
      case 'whoami': case 'kimim':
        tprint('misafir');
        break;
      case 'temizle': case 'clear':
        UI.term = [];
        break;
      default:
        tprint(`${cmd}: komut bulunamadı. "yardim" yaz.`, 'err');
    }
  }

  // ===========================================================================
  // 📼 RETRO 2000'LER
  // ===========================================================================
  Object.assign(DL, {
    mp3kral:    { name: 'MP3_Kral_Muzik.exe', size: '3 MB', mb: 3, payload: 'maymun' },
    sahtedemo:  { name: 'MaviKaset_Demo.mp3.exe', size: '1 MB', mb: 1, payload: 'kurtcuk' },
    slaytfull:  { name: 'SlaytYapici_Full_Surum.exe', size: '2 MB', mb: 2, payload: 'kurtcuk' },
    mavidemo:   { name: 'MaviKaset_Demo.mp3', size: '4 MB', mb: 4, payload: 'safe', task: 'ayse' },
    slayt:      { name: 'SlaytYapici_Deneme.exe', size: '6 MB', mb: 6, payload: 'safe', task: 'emre' },
    smiley:     { name: 'Bedava_Smiley_Paketi.exe', size: '1 MB', mb: 1, payload: 'adware' },
    odevdoc:    { name: 'Osmanli_Odev_Kaynak.doc', size: '0.5 MB', mb: 0.5, payload: 'safe', task: 'selin' },
    odevhazir:  { name: 'Odev_Hazir_Indir.doc.exe', size: '0.8 MB', mb: 0.8, payload: 'maymun' },
  });

  const RETRO_FRIENDS = {
    ayse:  { name: 'Ayşe ✿', status: 'Çevrimiçi', dot: '🟢', want: 'mavidemo' },
    emre:  { name: 'Emre_06', status: 'Çevrimiçi', dot: '🟢', want: 'slayt' },
    selin: { name: 'SeLiN', status: 'Meşgul', dot: '🔴', want: 'odevdoc' },
  };
  const MSN_SCRIPT = [
    { at: 3, who: 'ayse', text: 'Selaaam! 😊 Mavi Kaset\'in yeni demo şarkısı çıkmış, bana atar mısın? Benim kotam bitti 😭' },
    { at: 16, who: 'emre', text: 'Kanka yılbaşı partisi için slayt programı lazım. Deneme sürümü varmış bi yerde.' },
    { at: 30, who: 'selin', text: 'Tarih ödevi için Osmanlı kaynak dosyası lazım, ansiklopedi sitesinde varmış galiba 📚' },
    { at: 48, who: 'emre', text: '📳', nudge: true },
    { at: 62, who: 'ayse', text: 'Bu arada mp3kral\'dan indirme sakın, geçen sefer bilgisayarımda maymun dans etti 🐒😂' },
    { at: 90, who: 'emre', text: '"Full sürüm" diye bir şey görürsen bulaşma, deneme sürümü yeter 😄' },
    { at: 120, who: 'selin', text: 'odevci.net diye bir site var ama orada her şey .exe çıkıyor, dikkat et!' },
  ];
  const RETRO_DESK = [['okul_odevi.doc', 'doc', '120 KB'], ['tatil_2003.jpg', 'img', '800 KB'], ['oyun_kayit.sav', 'save', '64 KB'], ['MSN_ifadeler.zip', 'zip', '300 KB'], ['en_iyi_sarkilar.txt', 'txt', '1 KB']];

  Object.assign(APPS, { msn: { name: 'Messenger', icon: '💬', title: 'Messenger' } });
  APP_MODES.msn = ['retro'];

  function retroMsg(who, text, nudge) {
    const R = S.retro;
    R.chat[who].push({ from: who, text });
    const viewing = UI.app === 'msn' && R.friend === who;
    if (!viewing) R.unread[who]++;
    Snd.beep(880, 0.07); setTimeout(() => Snd.beep(660, 0.09), 110);
    if (nudge) retroShake();
    if (!viewing) toast(`💬 ${RETRO_FRIENDS[who].name}: ${text}`);
    if (UI.app === 'msn') renderApp(); else renderHome();
  }

  function retroShake() {
    const os = $('#os');
    os.classList.remove('shake'); void os.offsetWidth; os.classList.add('shake');
    vibrate([80, 40, 80, 40, 80]);
    setTimeout(() => os.classList.remove('shake'), 600);
  }

  function retroNeedLeft() {
    const R = S.retro;
    return Object.entries(RETRO_FRIENDS).filter(([k]) => !R.tasks[k])
      .map(([, f]) => f.want)
      .filter((key) => !S.files.some((f) => f.dl === key && !f.trash) && !R.queue.some((q) => q.key === key))
      .reduce((a, key) => a + DL[key].mb, 0);
  }

  function retroEnd(win, why) {
    const R = S.retro;
    const done = Object.values(R.tasks).filter(Boolean).length;
    endScreen(win ? '📼 Görev tamam!' : '📼 ' + why,
      win ? `Ayşe şarkısını dinliyor, Emre'nin slaytları hazır, Selin ödevini teslim etti. MSN'de herkes mutlu. 🎉<br><span class="muted small-t">Kullanılan kota: ${R.used.toFixed(1)} / ${R.quota} MB · Arkadaşlık: ${'💚'.repeat(R.hearts)}</span>`
        : `Tamamlanan görev: ${done}/3. ${why === 'Kota bitti!' ? 'Ay sonuna kadar internet yok 😭' : why === 'Arkadaşların seni engelledi' ? 'Virüslü dosya gönderdiğin için herkes seni MSN\'de engelledi 🚫' : 'Bilgisayar bir daha açılmadı.'}`,
      win, '<button class="primary" style="width:100%;margin-top:10px" data-act="startMode" data-arg="retro">📼 Tekrar Oyna</button>');
  }

  MODES.retro = {
    title: '📼 Retro 2000\'ler',
    liveApps: [],
    setup(s) {
      s.homepage = 'arama2004.com';
      s.scans = 1;
      s.files = s.files.filter((f) => f.dir !== 'masaustu');
      for (const [name, kind, size] of RETRO_DESK) addFile({ name, dir: 'masaustu', kind, size, text: kind === 'txt' ? '1. Mavi Kaset - Demo\n2. ???\n3. Sezen Aksu... (bitmedi)' : undefined });
      s.retro = { quota: 25, used: 0, online: true, dropAt: 42, reconnectAt: 0, queue: [], tasks: { ayse: false, emre: false, selin: false },
        chat: { ayse: [], emre: [], selin: [] }, unread: { ayse: 0, emre: 0, selin: 0 }, friend: 'ayse', hearts: 3, script: 0 };
    },
    intro: () => `<h3>📼 Yıl 2004</h3>
      <p>Odanda, bip bip sesleriyle bağlanan çevirmeli internetinle oturuyorsun. MSN'de arkadaşların senden dosya istiyor.</p>
      <p>Bu ayki kotan <b>25 MB</b>. İndirmeler yavaş, bağlantı arada bir kopuyor. Doğru dosyaları bul ve <b>💬 Messenger</b>'dan gönder.</p>
      <p class="muted small-t">Sahte "MP3" ve "Full sürüm" dosyalarına dikkat: bilgisayarında maymun dans edebilir. 🐒</p>`,
    status: () => (S.retro.online ? (S.retro.reconnectAt ? '📞…' : '📶 56k') : '📵'),
    widget() {
      const R = S.retro;
      const done = Object.values(R.tasks).filter(Boolean).length;
      const unread = Object.values(R.unread).reduce((a, b) => a + b, 0);
      return `📼 2004 &nbsp;·&nbsp; 💬 Görevler <b>${done}/3</b> &nbsp;·&nbsp; ${R.online ? '📶 Bağlı' : '<b style="color:var(--bad)">📵 Koptu</b>'}<br>
        <span class="muted small-t">Kota: <b>${R.used.toFixed(1)}</b> / ${R.quota} MB${R.queue.length ? ` · ⬇️ ${esc(DL[R.queue[0].key].name)} (${R.queue[0].left} sn)` : ''}${unread ? ` · 💬 ${unread} yeni mesaj` : ''}</span>`;
    },
    notes() {
      const R = S.retro;
      return `<div class="pad"><div class="card"><b>📼 Yapılacaklar</b>
        ${Object.entries(RETRO_FRIENDS).map(([k, f]) => `<div class="obj ${R.tasks[k] ? 'done' : ''}"><span>${R.tasks[k] ? '☑' : '☐'}</span><span>${f.name}: ${esc(DL[f.want].name.replace(/_/g, ' ').replace(/\.\w+$/, ''))}</span></div>`).join('')}
        <p class="small-t muted" style="margin-top:10px">Kota: ${R.used.toFixed(1)} / ${R.quota} MB · Kalan gerekli: ${retroNeedLeft().toFixed(1)} MB</p></div></div>`;
    },
    tick() {
      const R = S.retro;
      // Mesajlar
      while (R.script < MSN_SCRIPT.length && S.time >= MSN_SCRIPT[R.script].at) {
        const m = MSN_SCRIPT[R.script++];
        retroMsg(m.who, m.text, m.nudge);
      }
      // Bağlantı
      if (R.reconnectAt && S.time >= R.reconnectAt) {
        R.reconnectAt = 0; R.online = true; R.dropAt = S.time + 35 + Math.floor(Math.random() * 25);
        toast('📶 Bağlantı kuruldu: 56 kbps', 'ok');
        if (UI.app === 'browser') renderApp();
      } else if (R.online && S.time >= R.dropAt) {
        R.online = false;
        toast('📵 Bağlantı koptu! (Biri telefonu mu kaldırdı?)', 'bad');
        Snd.whisper();
        if (UI.app === 'browser') renderApp();
      }
      // İndirme kuyruğu (yalnızca bağlıyken ilerler)
      if (R.online && !R.reconnectAt && R.queue.length) {
        const q = R.queue[0];
        if (--q.left <= 0) { R.queue.shift(); finishDownload(q.key); }
      }
      // Bitiş koşulları
      if (Object.values(R.tasks).every(Boolean)) { retroEnd(true); return true; }
      if (R.hearts <= 0) { retroEnd(false, 'Arkadaşların seni engelledi'); return true; }
      if (retroNeedLeft() > R.quota - R.used + 1e-9) { retroEnd(false, 'Kota bitti!'); return true; }
      return false;
    },
    lose() { retroEnd(false, 'Bilgisayar çöktü'); },
    browserGate() {
      const R = S.retro;
      if (R.online) return '';
      return `<div class="pad" style="text-align:center;margin-top:40px">
        <div style="font-size:54px">${R.reconnectAt ? '📞' : '📵'}</div>
        <h3>${R.reconnectAt ? 'Bağlanıyor...' : 'Sayfa görüntülenemiyor'}</h3>
        <p class="muted">${R.reconnectAt ? 'Kullanıcı adı ve parola doğrulanıyor... 🔊 iiiiiğğğ-kşşşşş' : 'Çevirmeli ağ bağlantısı kesildi.'}</p>
        ${R.reconnectAt ? '' : '<button class="primary" data-act="retroDial">📞 Yeniden Bağlan</button>'}
        <p class="muted small-t" style="margin-top:20px">İpucu: Messenger ve dosyalarına bağlantı olmadan da erişebilirsin.</p></div>`;
    },
    download(key) {
      const R = S.retro; const d = DL[key];
      if (!R.online) { toast('📵 Bağlantı yok! Önce yeniden bağlan.', 'bad'); return true; }
      if (R.queue.some((q) => q.key === key)) { toast('Bu dosya zaten iniyor.'); return true; }
      if (R.used + d.mb > R.quota + 1e-9) { toast(`Kota yetersiz! (${(R.quota - R.used).toFixed(1)} MB kaldı)`, 'bad'); return true; }
      R.used += d.mb;
      R.queue.push({ key, left: Math.ceil(d.mb * 2.5) + 1 });
      toast(`⬇️ ${d.name} indiriliyor... (56 kbps, ~${Math.ceil(d.mb * 2.5) + 1} sn)`);
      renderHome();
      return true;
    },
    openFile(f) {
      if (f.kind === 'mp3') {
        toast('🎵 Winamp: Mavi Kaset - Demo (2004) çalıyor... It really whips!', 'ok');
        [523, 659, 784, 659].forEach((fr, i) => setTimeout(() => Snd.beep(fr, 0.12), i * 180));
        return true;
      }
      if (f.payload === 'safe' && f.kind === 'exe') { toast('📽️ Slayt Yapıcı (30 günlük deneme) açıldı.', 'ok'); return true; }
      return false;
    },
    apps: { msn: renderMsn },
  };

  function renderMsn() {
    const R = S.retro;
    const fr = R.friend;
    R.unread[fr] = 0;
    return `<div class="msn">
      <div class="tabs">${Object.entries(RETRO_FRIENDS).map(([k, f]) => `<button class="${fr === k ? 'on' : ''}" data-act="msnFriend" data-arg="${k}">${f.dot} ${f.name}${R.unread[k] ? ` (${R.unread[k]})` : ''}${R.tasks[k] ? ' ✅' : ''}</button>`).join('')}</div>
      <div class="pad small-t muted">${RETRO_FRIENDS[fr].name} · ${RETRO_FRIENDS[fr].status} · Arkadaşlık: ${'💚'.repeat(R.hearts)}${'🤍'.repeat(3 - R.hearts)}</div>
      <div class="chat">${R.chat[fr].map((m) => `<div class="msg ${m.from === 'me' ? 'me' : 'echo'}">${esc(m.text)}</div>`).join('') || '<p class="muted">Henüz mesaj yok.</p>'}</div>
      <div class="pad" style="display:flex;gap:8px">
        <button class="primary" style="flex:1" data-act="msnPick">📎 Dosya gönder</button>
        <button data-act="msnNudge">📳 Titreşim</button>
      </div></div>`;
  }

  function retroSend(fileId) {
    const R = S.retro; const fr = R.friend; const f = fileById(fileId);
    closeModal();
    if (!f) return;
    R.chat[fr].push({ from: 'me', text: `📎 ${f.name} gönderildi` });
    const st = S;
    setTimeout(() => {
      if (S !== st) return;
      if (f.payload in MAL) {
        R.hearts--;
        retroMsg(fr, pick(['Ya bu ne?! Ekranımda maymun dans ediyor 😡', 'Virüs gönderdin bana!!! 😤', 'Annem bilgisayarı kapattı, sayende 😠']));
      } else if (f.task === fr) {
        R.tasks[fr] = true;
        retroMsg(fr, pick(['Süpersin!!! Çok teşekkürler 😍', 'Kankaaa sağ ol, efsanesin 🤘', 'Teşekkürler, ödevi yetiştireceğim 🙏']));
        toast(`✅ ${RETRO_FRIENDS[fr].name} görevi tamamlandı`, 'ok');
      } else if (f.task) {
        retroMsg(fr, 'Bu benim istediğim değil ki 😅 Başkasına mı gidecekti?');
      } else {
        retroMsg(fr, 'Bu ne ki? 😅 Ben başka bir şey istemiştim.');
      }
    }, 1200);
    renderApp();
  }

  // Retro zararlıları
  MAL_TICK.maymun = (p) => {
    if (!$('#fxMonkey')) {
      const m = document.createElement('div');
      m.id = 'fxMonkey'; m.className = 'mode-fx monkey'; m.textContent = '🐒';
      $('#os').appendChild(m);
    }
    if (p.t % 6 === 0) [392, 523, 392, 659].forEach((fr, i) => setTimeout(() => Snd.beep(fr, 0.08), i * 140));
  };
  MAL_REMOVED.maymun = () => { const m = $('#fxMonkey'); if (m) m.remove(); };
  MAL_TICK.kurtcuk = (p) => {
    if (p.t % 7 !== 0) return;
    const v = S.files.find((f) => f.dir === 'masaustu' && !f.trash && !f.eaten);
    if (v) { v.eaten = true; toast(`🐛 Kurtçuk "${v.name}" simgesini kemirdi!`, 'bad'); if (!UI.app) renderHome(); }
  };
  MAL_REMOVED.kurtcuk = () => {
    const eaten = S.files.filter((f) => f.eaten);
    eaten.forEach((f) => { f.eaten = false; });
    if (eaten.length) setTimeout(() => toast(`🐛 Kurtçuk temizlendi: ${eaten.length} simge geri geldi`, 'ok'), 600);
  };

  // Retro siteler
  Object.assign(SITES, {
    'arama2004.com': {
      title: 'Arama2004 — Türkiye\'nin Arama Motoru', rep: 'guvenli', keys: '', hiddenFromSearch: true,
      html: () => `<div style="text-align:center"><div style="font-size:40px">🔍</div><h1 style="font-family:'Comic Sans MS',cursive">Arama2004</h1></div>
        <p class="muted small-t" style="text-align:center">Ziyaretçi sayısı: 0001337 · En iyi 800x600 çözünürlükte görüntülenir</p>
        <h2>🎵 Müzik</h2>
        <div class="result">${go('mavikaset.com', 'Mavi Kaset — Resmî Grup Sitesi')}<div class="muted small-t">Yeni demo şarkımız ücretsiz!</div></div>
        <div class="result">${go('mp3kral.net', 'MP3 KRAL — EN YENİ ŞARKILAR BEDAVA!!!')}<div class="muted small-t">10.000+ mp3 · hızlı indirme</div></div>
        <h2>💾 Programlar</h2>
        <div class="result">${go('yazilimdunyasi.com', 'Yazılım Dünyası')}<div class="muted small-t">Deneme sürümleri ve ücretsiz programlar</div></div>
        <h2>📚 Ödev</h2>
        <div class="result">${go('ansiklopedi2004.org', 'Ansiklopedi 2004')}<div class="muted small-t">Ücretsiz kaynaklar ve makaleler</div></div>
        <div class="result">${go('odevci.net', 'ODEVCI.NET — Hazır Ödevler!!')}<div class="muted small-t">Tüm ödevler hazır, tek tıkla indir</div></div>`,
    },
    'mavikaset.com': {
      title: 'Mavi Kaset', rep: 'guvenli', keys: '', hiddenFromSearch: true,
      html: () => `<h1>🎸 Mavi Kaset</h1><p>Garaj grubumuzun ilk demo şarkısı çıktı! Ücretsiz indirip arkadaşlarına gönderebilirsin.</p>
        ${dlRow('mavidemo', 'Grubun resmî sitesi')}
        <p class="muted small-t">Konser: Cumartesi, okul spor salonu 🎤</p>`,
    },
    'mp3kral.net': {
      title: 'MP3 KRAL', rep: 'riskli', keys: '', hiddenFromSearch: true,
      html: () => `<div class="site-spam pad"><h1>🎶 MP3 KRAL 🎶</h1>
        <marquee>EN YENİ ŞARKILAR %100 BEDAVA!!! HIZLI İNDİR!!!</marquee>
        <div class="ad">🔥 TÜM ŞARKILAR TEK DOSYADA 🔥</div>
        ${dlRow('mp3kral', 'MP3 indirici')}
        ${dlRow('sahtedemo', '★★★★★ "aynısı"')}
        <h2>Programlar</h2>
        ${dlRow('slaytfull', 'FULL + SERİAL')}</div>`,
    },
    'yazilimdunyasi.com': {
      title: 'Yazılım Dünyası', rep: 'orta', keys: '', hiddenFromSearch: true,
      html: () => `<h1>💾 Yazılım Dünyası</h1>
        <div class="card">${dlRow('slayt', 'Resmî deneme sürümü · 30 gün')}</div>
        <div class="site-spam pad" style="border-radius:10px"><div class="ad">😃 BEDAVA 500 MSN İFADESİ!! 😃</div>${dlRow('smiley', 'reklam')}</div>`,
    },
    'ansiklopedi2004.org': {
      title: 'Ansiklopedi 2004', rep: 'guvenli', keys: '', hiddenFromSearch: true,
      html: () => `<h1>📚 Ansiklopedi 2004</h1><h2>Osmanlı İmparatorluğu</h2>
        <p>Öğrenciler için hazırlanmış ücretsiz kaynak dosyası. Ödevinde kaynak göstermeyi unutma!</p>
        ${dlRow('odevdoc', 'Word belgesi')}`,
    },
    'odevci.net': {
      title: 'ODEVCI.NET', rep: 'riskli', keys: '', hiddenFromSearch: true,
      html: () => `<div class="site-spam pad"><h1>📝 HAZIR ÖDEV!!!</h1><div class="ad">ÖDEVİN HAZIR!! SADECE İNDİR VE TESLİM ET!!</div>
        ${dlRow('odevhazir', '"öğretmen anlamaz"')}</div>`,
    },
  });

  Object.assign(EXTRA_ACTS, {
    msnFriend: (k) => { S.retro.friend = k; renderApp(); },
    msnNudge: () => {
      const R = S.retro;
      R.chat[R.friend].push({ from: 'me', text: '📳 Titreşim gönderdin!' });
      retroShake(); renderApp();
      const st = S;
      setTimeout(() => { if (S === st) retroMsg(R.friend, pick(['Ne var yaa 😂', 'Tamam tamam buradayım!', 'Titreşim atma şuna 😄'])); }, 1500);
    },
    msnPick: () => {
      const list = S.files.filter((f) => !f.trash && !f.eaten && (f.dir === 'indirilenler' || f.dir === 'belgeler'));
      modal(`<h3>📎 ${RETRO_FRIENDS[S.retro.friend].name} kişisine gönder</h3>
        ${list.length ? list.map((f) => `<div class="list-item" style="padding:8px 0"><span class="fico">${fileIcon(f)}</span><div class="grow ell">${esc(f.name)}</div>
          <button class="small primary" data-act="msnSend" data-arg="${f.id}">Gönder</button></div>`).join('') : '<p class="muted">Gönderilecek dosya yok. Önce bir şey indir.</p>'}`,
        [['Kapat', '', 'modalClose']]);
    },
    msnSend: (id) => retroSend(id),
    retroDial: () => {
      const R = S.retro;
      if (R.online || R.reconnectAt) return;
      R.reconnectAt = S.time + 4;
      Snd.dialup();
      renderApp();
    },
  });

  // ===========================================================================
  // 🔐 KAÇIŞ ODASI
  // ===========================================================================
  const shuffle = (a) => a.map((v) => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);
  const ESC_FRUITS = ['🍎', '🍌', '🍒', '🍇'];
  const ESC_TAUNTS = ['Tik tak. ⏳', 'Dosyaların seni özlüyor. 😈', 'Bu kadar yavaş mı düşünürsün?', 'Belki de hiç çıkamayacaksın.', 'İpucu: ben asla yalan söylemem. Ya da söylerim.'];
  const mmss = (t) => `${String(Math.floor(Math.max(0, t) / 60)).padStart(2, '0')}:${String(Math.max(0, t) % 60).padStart(2, '0')}`;

  Object.assign(APPS, { kilit: { name: 'Kilit Ekranı', icon: '🔐', title: 'Kilit Ekranı' } });
  APP_MODES.kilit = ['escape'];

  function escPenalty(sec, msg) {
    const E = S.esc;
    E.left = Math.max(0, E.left - sec);
    glitch(); vibrate(120); Snd.beep(140, 0.25);
    toast(sec ? `⏳ −${sec} sn · RM: ${msg}` : `⏩ RM: ${msg}`, 'bad');
    renderHome();
  }

  function escEnd(win) {
    const E = S.esc;
    endScreen(win ? '🔓 Kurtuldun!' : '💀 Süre doldu',
      win ? `Üç kodu da buldun ve kilidi açtın. Ransom Master'ın son mesajı: <i>"Bu sefer kazandın."</i><br><span class="muted small-t">Kalan süre: ${mmss(E.left)} · Yanlış deneme: ${E.tries}</span>`
        : 'Sayaç sıfırlandı. Ransom Master oyundaki tüm dosyaları sildi.<br><span class="muted small-t">Kodlar her oyunda değişir. Tekrar dene!</span>',
      win, '<button class="primary" style="width:100%;margin-top:10px" data-act="startMode" data-arg="escape">🔐 Tekrar Oyna</button>');
  }

  MODES.escape = {
    title: '🔐 Kaçış Odası',
    liveApps: ['kilit'],
    setup(s) {
      s.homepage = 'ransommaster.lock';
      s.scans = 0;
      const c1 = String(1000 + Math.floor(Math.random() * 9000));
      const digits = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4);
      const map = {}; ESC_FRUITS.forEach((f, i) => { map[f] = digits[i]; });
      const seq = [0, 1, 2, 3].map(() => pick(ESC_FRUITS));
      const c2 = seq.map((f) => map[f]).join('');
      const c3 = String(+c1 + +c2);
      s.esc = { left: 480, fast: 0, c1, c2, c3, map, seq, tries: 0, found: {}, nextTaunt: 40, ok: [false, false, false] };
      addFile({ name: 'oku_beni.txt', dir: 'masaustu', kind: 'txt', size: '1 KB',
        text: 'Merhaba. Ben Ransom Master. 😈\n\nDosyalarının kilidini açmak için 3 koda ihtiyacın var:\n\n• Birini çöpe attım. Ters duruyor.\n• Biri sitemde, ama gözlerin onu göremez.\n• Sonuncusu gizli. Terminal "ls" der, sen fazlasını iste.\n\nKodları 🔐 Kilit Ekranı\'na gir.\nSüren dolduğunda her şey silinir. Bol şans.' });
      addFile({ name: 'Kurtarici.exe', dir: 'masaustu', kind: 'exe', size: '66 KB', payload: 'escTrap' });
      addFile({ name: 'ters.txt', dir: 'belgeler', kind: 'txt', size: '1 KB', trash: true,
        text: `KOD 1 (ters yazıldı):\n\n   ${c1.split('').reverse().join(' - ')}\n\nSoldan sağa değil, sağdan sola oku.` });
      addFile({ name: '.anahtar', dir: 'belgeler', kind: 'txt', size: '1 KB', hidden: true,
        text: 'KOD 3\n\nKod 3 = Kod 1 + Kod 2\n(İki sayıyı topla.)' });
    },
    intro: () => `<h3>🔐 Kaçış Odası</h3>
      <p><b>Ransom Master</b> bilgisayarının kontrolünü ele geçirdi ve masaüstünü kilitledi. Ekranda bir sayaç var: <b>08:00</b>.</p>
      <p>Masaüstündeki notu oku, ipuçlarını birleştir ve üç kodu <b>🔐 Kilit Ekranı</b>'na gir.</p>
      <p class="muted small-t">Tuzaklara dikkat: yanlış bağlantılar ve "kurtarıcı" programlar süreni kısaltır.</p>`,
    status: () => `⏳ ${mmss(S.esc.left)}`,
    blockApp: (id) => (id === 'av' ? '🛡️ Kalkan devre dışı. RM: "Antivirüs mü? Ha ha."' : ''),
    widget() {
      const E = S.esc;
      const n = Object.keys(E.found).length;
      return `🔐 Kalan süre: <b style="color:${E.left < 60 ? 'var(--bad)' : 'inherit'}">${mmss(E.left)}</b>${E.fast > S.time ? ' <b style="color:var(--bad)">⏩ x2</b>' : ''}
        &nbsp;·&nbsp; 🧩 İpucu <b>${n}/3</b><br><span class="muted small-t">Kodları 🔐 Kilit Ekranı'na gir.</span>`;
    },
    notes() {
      const E = S.esc;
      return `<div class="pad"><div class="card"><b>🧩 İpuçları</b>
        <div class="obj ${E.found.c1 ? 'done' : ''}"><span>${E.found.c1 ? '☑' : '☐'}</span><span>Kod 1: çöpte, ters duruyor</span></div>
        <div class="obj ${E.found.c2 ? 'done' : ''}"><span>${E.found.c2 ? '☑' : '☐'}</span><span>Kod 2: sitede ama görünmüyor (</> ?)</span></div>
        <div class="obj ${E.found.c3 ? 'done' : ''}"><span>${E.found.c3 ? '☑' : '☐'}</span><span>Kod 3: gizli dosya (ls -a ?)</span></div></div>
        <div class="card"><b>✏️ Karalama</b><textarea id="notesArea" class="field" style="margin-top:8px" placeholder="Kodları buraya not al...">${esc(S.notes)}</textarea></div></div>`;
    },
    tick() {
      const E = S.esc;
      E.left -= E.fast > S.time ? 2 : 1;
      if (E.left <= 30 && E.left > 28) { Snd.beep(880, 0.1); vibrate(80); }
      if (S.time >= E.nextTaunt) { E.nextTaunt = S.time + 45; toast('😈 RM: ' + pick(ESC_TAUNTS), 'bad'); }
      if (E.left <= 0) { escEnd(false); return true; }
      return false;
    },
    lose() { escEnd(false); },
    readFile(f) {
      const E = S.esc;
      if (f.name === 'ters.txt') E.found.c1 = true;
      if (f.name === '.anahtar') E.found.c3 = true;
    },
    openFile(f) {
      if (f.payload === 'escTrap') { escPenalty(60, 'Bunu açacağını biliyordum. 😈'); return true; }
      return false;
    },
    apps: { kilit: renderKilit },
  };

  function renderKilit() {
    const E = S.esc;
    return `<div class="pad" style="text-align:center">
      <div style="font-size:52px">🔐</div>
      <div class="lock-timer ${E.left < 60 ? 'hot' : ''}">${mmss(E.left)}</div>
      <p class="muted small-t">${E.fast > S.time ? '⏩ Sayaç iki kat hızlı akıyor!' : 'Süre dolduğunda tüm dosyalar silinecek.'}</p>
      ${[1, 2, 3].map((i) => `<div class="search-box" style="margin:10px 0">
        <span style="align-self:center;width:86px;text-align:left;white-space:nowrap">Kod ${i} ${E.ok[i - 1] ? "✅" : ""}</span>
        <input id="escCode${i}" data-keep class="field" inputmode="numeric" autocomplete="off" placeholder="????"></div>`).join('')}
      <button class="primary" style="width:100%" data-act="escUnlock">🔓 Kilidi Aç</button>
      <p class="muted small-t">Yanlış deneme: −30 sn</p></div>`;
  }

  Object.assign(SITES, {
    'ransommaster.lock': {
      title: 'RANSOM MASTER', rep: 'cok-riskli', keys: '', hiddenFromSearch: true,
      extraSource: '',
      onSource() { S.esc.found.c2 = true; },
      html: () => {
        const E = S.esc;
        return `<div class="site-dark pad" style="text-align:center"><div style="font-size:60px">👁️</div><h1>RANSOM MASTER</h1>
          <p>Dosyaların bende. Kodların biri bu sayfada... ama gözlerin onu göremez.</p>
          <div class="post"><b>Meyve sözlüğü</b><br><span style="font-size:22px">${ESC_FRUITS.map((f) => `${f}=${E.map[f]}`).join(' &nbsp; ')}</span></div>
          <div class="post" style="text-align:left">
            <button class="danger" style="width:100%;margin-bottom:8px" data-act="escTrap" data-arg="pay">💸 Fidyeyi öde (0.5 KRP) ve kurtul</button>
            <button style="width:100%;margin-bottom:8px" data-act="escTrap" data-arg="buy">🔑 Kod 2'yi satın al</button>
            <button style="width:100%" data-act="escTrap" data-arg="pause">⏸️ Sayacı durdur</button>
          </div></div>`;
      },
    },
  });
  // Kaynak koddaki gizli dizi (her oyunda değişir)
  Object.defineProperty(SITES['ransommaster.lock'], 'extraSource', {
    get: () => (S && S.esc ? `  <!-- kod 2: ${S.esc.seq.join(' ')} -->\n` : ''),
  });

  Object.assign(EXTRA_ACTS, {
    escTrap: (k) => {
      if (k === 'pay') escPenalty(60, 'Paranı aldım. Kod mu? Ha ha ha.');
      else if (k === 'buy') escPenalty(60, 'Kod satılık değil. Zaman ise... satılık. 😈');
      else { S.esc.fast = S.time + 30; escPenalty(0, 'Durdurmak mı? Ben hızlandırırım. ⏩'); }
      if (UI.app === 'browser') renderApp();
    },
    escUnlock: () => {
      const E = S.esc;
      const vals = [1, 2, 3].map((i) => (($('#escCode' + i) || {}).value || '').trim());
      E.ok = [vals[0] === E.c1, vals[1] === E.c2, vals[2] === E.c3];
      if (E.ok.every(Boolean)) { escEnd(true); return; }
      E.tries++;
      escPenalty(30, 'Yanlış! 😈');
      renderApp();
    },
  });

  // ===========================================================================
  // ⚽ İŞ YERİNDE MOLA
  // ===========================================================================
  const OFFICE_ADS = [
    ['FORMA 👕', 'Takımının formasını kazan!', 'Hemen katıl'],
    ['🎵 JİNGIL', 'Laaa la la! En ucuz kola burada!', 'Sesi aç'],
    ['PİZZA 🍕', 'Maç saati 2 al 1 öde!', 'Sipariş ver'],
    ['YARIŞMA 🏆', 'Skoru tahmin et, tablet kazan!', 'Tahmin et'],
    ['DUYURU 📢', 'Canlı yayına reklamsız devam et', 'Abone ol'],
  ];
  const OFFICE_MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
  const officeWork = () => Math.round(S.office.cells.flat().filter(Boolean).length / 36 * 100);
  const officeWatching = () => UI.app === 'browser' && UI.br.url === 'canlimac.tv' && !UI.br.src;

  Object.assign(APPS, { rapor: { name: 'Rapor.xls', icon: '📊', title: 'Q3_Satis_Raporu.xls' } });
  APP_MODES.rapor = ['office'];

  function officeEnd(win, why) {
    const O = S.office;
    endScreen(win ? '⚽ Mesai bitti, maç bitti!' : why === 'caught' ? '😠 Patronun odasına çağrıldın' : '📊 Rapor yetişmedi',
      win ? `Maç <b>Kartallar ${O.home} - ${O.away} Şimşekler</b> bitti ve rapor %${officeWork()} hazır. Patron hiçbir şey anlamadı. 😎`
        : why === 'caught' ? `Patron ekranında maçı yakaladı. "Mesai saatinde maç mı?!" <br><span class="muted small-t">Dakika: ${O.minute}' · Rapor: %${officeWork()}</span>`
        : `Maçı sonuna kadar izledin ama rapor yalnızca %${officeWork()} hazır. Patron: "Yarın sabah masamda olsun." 😒`,
      win, '<button class="primary" style="width:100%;margin-top:10px" data-act="startMode" data-arg="office">⚽ Tekrar Oyna</button>');
  }

  MODES.office = {
    title: '⚽ İş Yerinde Mola',
    setup(s) {
      s.homepage = 'canlimac.tv';
      s.scans = 1;
      s.office = { minute: 0, home: 0, away: 0, events: [], susp: 0, cells: OFFICE_MONTHS.map(() => [0, 0, 0]),
        boss: 'away', bossAt: 22, bossLeave: 0, hit: 0, adSoundUntil: 0, muted: false, nextAd: 8 };
    },
    intro: () => `<h3>⚽ İş Yerinde Mola</h3>
      <p>Sıkıcı bir pazartesi. Mahalle Kupası finali şu an canlı yayında ve sen ofistesin.</p>
      <p>Maçı <b>canlimac.tv</b>'den izle (maç yalnızca sen izlerken ilerler), ama <b>👞 ayak seslerini</b> duyunca <b>🗂️ Panik!</b> düğmesine bas ve rapor ekranına dön.</p>
      <p class="muted small-t">Reklam pop-up'ları ve sesleri patronun dikkatini çeker; durum çubuğundaki 🔊'ye dokunarak sesi kıs. Maç bittiğinde raporun en az %50'si dolu olmalı.</p>`,
    status() {
      const O = S.office;
      return `<span data-act="officeMute" style="cursor:pointer">${O.muted ? '🔇' : O.adSoundUntil > S.time ? '📢' : '🔊'}</span>${O.boss === 'coming' ? ' 👞' : O.boss === 'here' ? ' 😠' : ''}`;
    },
    widget() {
      const O = S.office;
      return `⚽ <b>${O.minute}'</b> Kartallar ${O.home}-${O.away} Şimşekler &nbsp;·&nbsp; 📊 %${officeWork()}<br>
        <span class="muted small-t">Patron şüphesi: <b style="color:${O.susp > 60 ? 'var(--bad)' : 'inherit'}">%${Math.round(O.susp)}</b></span>
        <div class="bar-wrap" style="margin-top:6px"><div class="bar-fill ${O.susp > 60 ? 'hot' : O.susp > 30 ? 'warm' : ''}" style="width:${Math.min(100, O.susp)}%"></div></div>`;
    },
    notes: () => `<div class="pad"><div class="card"><b>🗒️ Hayatta kalma rehberi</b>
      <p class="small-t">• 👞 ayak sesi = 4 sn içinde patron kapıda<br>• 🗂️ Panik! seni rapor ekranına götürür<br>• Pop-up'ları kapatmayı unutma, patron onları da görür<br>• 🔊 → 🔇: reklam sesini kıs<br>• Patron geldiğinde raporla uğraşıyorsan şüphe azalır</p></div></div>`,
    tick() {
      const O = S.office;
      if (!$('#fxPanic')) {
        const b = document.createElement('button');
        b.id = 'fxPanic'; b.className = 'mode-fx panic'; b.dataset.act = 'panic'; b.textContent = '🗂️ Panik!';
        $('#os').appendChild(b);
      }
      const watching = officeWatching();
      // Maç
      if (watching && S.time % 2 === 0 && O.minute < 90) {
        O.minute++;
        if (Math.random() < 0.04) {
          const home = Math.random() < 0.5;
          home ? O.home++ : O.away++;
          O.events.unshift(`${O.minute}' ⚽ GOL! ${home ? 'Kartallar' : 'Şimşekler'}`);
          toast(`⚽ GOOOL! ${home ? 'Kartallar' : 'Şimşekler'} ${O.home}-${O.away}`, 'ok');
          if (!O.muted) [523, 659, 784].forEach((f, i) => setTimeout(() => Snd.beep(f, 0.1), i * 120));
        } else if (Math.random() < 0.05) O.events.unshift(`${O.minute}' 🟨 Sarı kart`);
      }
      // Reklamlar
      if (watching && S.time >= O.nextAd) {
        O.nextAd = S.time + 9 + Math.floor(Math.random() * 6);
        spawnPopup(OFFICE_ADS);
        if (!O.muted) O.adSoundUntil = S.time + 6;
      }
      if (O.adSoundUntil > S.time && !O.muted && S.time % 2 === 0) Snd.beep(pick([392, 440, 523, 587]), 0.15);
      // Patron
      if (O.boss === 'away' && S.time >= O.bossAt - 4) {
        O.boss = 'coming';
        toast('👞 Koridordan ayak sesleri!', 'bad');
        Snd.step(); setTimeout(() => Snd.step(), 500); setTimeout(() => Snd.step(), 1000);
        vibrate([60, 200, 60]);
      } else if (O.boss === 'coming' && S.time >= O.bossAt) {
        O.boss = 'here'; O.bossLeave = S.time + 4; O.hit = 0;
        toast('😠 Patron kapıda!', 'bad');
      }
      if (O.boss === 'here') {
        let d = 0;
        if (watching) d += 12;
        d += Math.min(15, $('#popups').children.length * 5);
        if (O.adSoundUntil > S.time && !O.muted) d += 8;
        if (d) { O.susp += d; if (!O.hit) toast(pick(['Patron: Bu ne?!', 'Patron: Hmm... o ekranda ne var?', 'Patron: Çalışıyor musun sen?']), 'bad'); O.hit += d; }
        if (S.time >= O.bossLeave) {
          O.boss = 'away';
          O.bossAt = S.time + 14 + Math.floor(Math.random() * 14);
          if (!O.hit && UI.app === 'rapor') { O.susp = Math.max(0, O.susp - 10); toast('Patron: Aferin, çalışıyorsun 👍 (−%10 şüphe)', 'ok'); }
          else if (!O.hit) toast('Patron uzaklaştı... 😮‍💨');
        }
      }
      if (O.susp >= 100) { officeEnd(false, 'caught'); return true; }
      if (O.minute >= 90) { officeWork() >= 50 ? officeEnd(true) : officeEnd(false, 'report'); return true; }
      if (watching && Date.now() - UI.touch > 900) renderApp();
      return false;
    },
    lose() { officeEnd(false, 'caught'); },
    apps: { rapor: renderRapor },
  };

  function renderRapor() {
    const O = S.office;
    return `<div class="pad">
      <div class="card small-t">📊 Doluluk: <b>%${officeWork()}</b> (en az %50 gerekli) · Hücreye dokunarak doldur.</div>
      <table class="xls"><thead><tr><th>Ay</th><th>Satış</th><th>Gider</th><th>Kâr</th></tr></thead><tbody>
      ${OFFICE_MONTHS.map((m, r) => `<tr><td>${m}</td>${O.cells[r].map((v, c) => `<td>${v ? v.toLocaleString('tr-TR') : `<button class="cell" data-act="cell" data-arg="${r}:${c}">—</button>`}</td>`).join('')}</tr>`).join('')}
      </tbody></table></div>`;
  }

  Object.assign(SITES, {
    'canlimac.tv': {
      title: 'CanlıMaç TV — Amatör Lig', rep: 'orta', keys: '', hiddenFromSearch: true,
      html: () => {
        const O = S.office;
        return `<h1>📺 CanlıMaç TV</h1><p class="muted small-t">Mahalle Kupası Finali · ücretsiz amatör lig yayını</p>
          <div class="pitch"><div class="ball">⚽</div><div class="score">Kartallar <b>${O.home} - ${O.away}</b> Şimşekler</div><div class="minute">${O.minute >= 90 ? 'MS' : O.minute + "'"}</div></div>
          <div class="card small-t">${O.events.slice(0, 5).map((e) => `<div>${e}</div>`).join('') || 'Maç başladı!'}</div>
          <div class="site-spam pad" style="border-radius:10px"><div class="ad">🍕 MAÇ SAATİ PİZZA: 2 AL 1 ÖDE 🍕</div></div>`;
      },
    },
  });

  Object.assign(EXTRA_ACTS, {
    panic: () => { if (!S.office) return; openApp('rapor'); Snd.beep(330, 0.05); },
    officeMute: () => { const O = S.office; O.muted = !O.muted; toast(O.muted ? '🔇 Ses kapatıldı' : '🔊 Ses açıldı'); renderStatus(); },
    cell: (arg) => {
      const [r, c] = arg.split(':').map(Number);
      S.office.cells[r][c] = 1000 + Math.floor(Math.random() * 9000);
      Snd.beep(1200, 0.02);
      renderApp();
    },
  });

  // ---------------------------------------------------------------------------
  // Modal ve bildirimler
  // ---------------------------------------------------------------------------
  function modal(html, buttons) {
    const m = $('#modal');
    m.querySelector('.modal-card').innerHTML = html + (buttons.length ? `<div class="modal-actions">${
      buttons.map(([label, cls, act, arg]) => `<button class="${cls}" data-act="${act}" ${arg ? `data-arg="${arg}"` : ''}>${label}</button>`).join('')}</div>` : '');
    m.classList.remove('hidden');
  }
  function closeModal() { $('#modal').classList.add('hidden'); }

  function toast(text, cls = '') {
    const el = document.createElement('div');
    el.className = 'toast ' + cls;
    el.textContent = text;
    const box = $('#toasts');
    box.appendChild(el);
    while (box.children.length > 3) box.firstChild.remove();
    setTimeout(() => el.remove(), 3200);
  }

  // ---------------------------------------------------------------------------
  // Eylemler
  // ---------------------------------------------------------------------------
  const ACT = {
    newgame: () => { wipeSave('story'); startGame(newState('story'), true); },
    continue: () => { const d = load(); if (d) startGame(d, false); },
    open: (id) => openApp(id),
    close: () => {
      if (UI.app === 'browser' && UI.br.src) { UI.br.src = false; renderApp(); }
      else if (UI.app === 'mail' && UI.mail) { UI.mail = null; renderApp(); }
      else closeApp();
    },
    openFile: (id) => openFile(id),
    filesTab: (k) => { UI.filesTab = k; renderApp(); },
    trashFile: (id) => {
      const f = fileById(id);
      if (f.protect) { toast('Bu dosya korumalı, silinemez.'); return; }
      f.trash = true;
      if (f.payload === 'nobetci') nightCopyRemoved();
      renderApp(); renderHome(); save();
    },
    restore: (id) => {
      const f = fileById(id);
      f.trash = false; toast(`↩️ ${f.name} → /${f.dir}`, 'ok'); renderApp(); save();
    },
    purge: (id) => {
      const f = fileById(id);
      if (f.protect) { toast('Bu dosya korumalı, kalıcı olarak silinemez.'); return; }
      S.files = S.files.filter((x) => x !== f); renderApp(); save();
    },
    go: (url) => { if (UI.app !== 'browser') { UI.br.url = url; UI.br.hist = []; openApp('browser'); } else browse(url); },
    brBack: () => { if (UI.br.src) UI.br.src = false; else if (UI.br.hist.length) UI.br.url = UI.br.hist.pop(); renderApp(); },
    brHome: () => browse(S.homepage),
    brSrc: () => { UI.br.src = !UI.br.src; renderApp(); },
    brMenu: () => modal('<h3>Chronos menüsü</h3>', [['Ana sayfayı sıfırla', '', 'brReset'], ['Kapat', 'primary', 'modalClose']]),
    brReset: () => {
      closeModal();
      if (hasMal('adware')) { S.homepage = 'superarama.biz'; toast('⚠️ Ana sayfa tekrar SüperArama olarak değiştirildi!', 'bad'); }
      else { S.homepage = 'chronos://ana'; toast('Ana sayfa sıfırlandı.', 'ok'); browse(S.homepage); }
      save();
    },
    brSearch: () => { UI.br.query = ($('#brq') || {}).value || ''; renderApp(); },
    darkPass: () => {
      const v = (($('#darkpw') || {}).value || '').trim().toLowerCase();
      if (v === 'golge' || v === 'gölge') { S.flags.dark = true; toast('🔓 Düğüm 7 erişimi açıldı', 'ok'); save(); renderApp(); }
      else { toast('Erişim reddedildi.', 'bad'); Snd.beep(150, 0.2); }
    },
    dl: (key) => requestDownload(key),
    dlConfirm: (key) => { closeModal(); doDownload(key); },
    modalClose: () => closeModal(),
    aresTry: () => {
      const ok = tryAres(($('#aresKey') || {}).value);
      if (!ok) { const m = $('#aresMsg'); if (m) { m.textContent = 'Anahtar yanlış.'; m.style.color = 'var(--bad)'; } }
    },
    kill: (pid) => { killProc(pid); if (UI.app) renderApp(); },
    scan: () => startScan(),
    quarantine: () => { quarantine(); UI.scan = null; renderApp(); },
    restoreLocked: () => { const n = restoreLocked(); toast(n > 0 ? `🔓 ${n} dosya kurtarıldı.` : 'Kurtarılacak dosya yok.', n > 0 ? 'ok' : ''); renderApp(); },
    payRansom: () => {
      if (S.coins < 0.5) { toast('Yetersiz bakiye. (İyi ki de...)', 'bad'); return; }
      S.coins = +(S.coins - 0.5).toFixed(2); toast('Ödeme alındı. Anahtar... gelmedi.', 'bad');
    },
    popClose: (_, el) => {
      el.closest('.popup').remove();
      if (hasMal('adware') && Math.random() < 0.35) setTimeout(spawnPopup, 400);
    },
    popClick: (_, el) => {
      el.closest('.popup').remove();
      if (S.office) { spawnPopup(OFFICE_ADS); spawnPopup(OFFICE_ADS); toast('Bir reklam daha açıldı... ve bir tane daha!', 'bad'); return; }
      ACT.go('superarama.biz');
    },
    termQuick: (c) => runCmd(c),
    toggleSound: () => { S.sound = !S.sound; Snd.init(); Snd.fan(S.cpu); renderApp(); save(); },
    survival: () => { closeModal(); startGame(newState('survival'), true); },
    startMode: (k) => { closeModal(); startGame(newState(k), true); },
    menu: () => { clearInterval(UI.timer); closeModal(); show('boot'); showBootMenu(); },
    labMenu: () => { closeModal(); showLabMenu(); },
    labLevel: (n) => { closeModal(); startLab(+n); },
    labAnalyze: (id) => {
      const L = S.lab; const x = L.samples[+id];
      if (L.analyzing || !x || x.shown >= 3) return;
      L.analyzing = { id: x.id, until: S.time + 4 };
      renderApp();
    },
    labClass: (arg) => { const [id, cat] = arg.split(':'); labClassify(id, cat); },
    ai: () => { closeModal(); UI.echoTab = 'chat'; startGame(newState('ai'), true); },
    echoTab: (k) => { UI.echoTab = k; renderApp(); },
    echoChoice: (i) => {
      const A = S.ai; const step = ECHO_SCRIPT[A.step];
      if (!step || A.waiting) return;
      const [label, ctl, reply] = step.choices[+i];
      echoSay(label, 'me');
      A.control += ctl;
      if (ctl) toast(`🤖 ECHO'ya izin verildi (+%${ctl} kontrol)`, 'bad');
      A.step++; A.waiting = true;
      setTimeout(() => { if (S && S.ai === A && !A.hostile) { echoSay(reply); A.msgAt = S.time + 2; } }, 900);
    },
    aiSolve: (i) => aiAnswer(+i),
    aiFinal: () => aiFinal(),
    night: () => { closeModal(); wipeSave('night'); startGame(newState('night'), true); },
    continueNight: () => { const d = load('night'); if (d) startGame(d, false); },
    mailReply: () => {
      const st = S.mails.find((x) => x.id === UI.mail);
      if (!st) return;
      st.replied = true;
      if (UI.mail === 'mudur' && S.night) { S.night.replied = true; toast('📋 Görev tamamlandı: posta yanıtlandı', 'ok'); }
      renderApp(); save();
    },
    mailOpen: (id) => { UI.mail = id; renderApp(); renderHome(); $('#winBody').scrollTop = 0; },
    mailBack: () => { UI.mail = null; renderApp(); },
    mailDl: (key) => {
      const m = mailDef(UI.mail);
      requestDownload(key, { label: 'Posta: ' + m.addr, rep: m.kind === 'phish' ? 'orta' : 'guvenli' });
    },
    mailReport: () => {
      const m = mailDef(UI.mail);
      if (m.kind === 'phish') {
        S.mails = S.mails.filter((x) => x.id !== m.id);
        S.scans++; S.stats.phish++;
        toast('✅ Doğru tespit! Oltalama bildirildi (+1 tarama hakkı)', 'ok');
        UI.mail = null;
      } else if (m.kind === 'odd') {
        toast('Kalkan: Bu bir oltalama postası değil... ama ne olduğu da belli değil.', 'bad');
      } else {
        toast('Bu posta güvenilir bir kaynaktan geliyordu. Yanlış alarm.', 'bad');
      }
      renderApp(); renderHome(); save();
    },
    phishBank: () => {
      const lost = S.coins;
      S.coins = 0;
      infect('spyware', null, false);
      modal(`<h3>💸 Oltalama!</h3><p>Cüzdanından <b>${lost.toFixed(2)} KRP</b> çekildi ve sisteme bir casus yazılım yerleşti.</p>
        <p class="muted small-t">Adres çubuğuna bak: <b>chronosbank-dogrulama.xyz</b>, bankanın gerçek adresi değil. Gerçek kurumlar postayla "cüzdanını bağla" demez.</p>`,
        [['Anladım', 'primary', 'modalClose']]);
      renderHome(); save();
    },
    resetAsk: () => modal('<h3>Oyunu sıfırla?</h3><p>Tüm ilerleme silinecek.</p>', [['Vazgeç', '', 'modalClose'], ['Sıfırla', 'danger', 'newgame']]),
  };
  Object.assign(ACT, EXTRA_ACTS);

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const fn = ACT[el.dataset.act];
    if (!fn) return;
    e.preventDefault();
    if (S && el.dataset.act === 'newgame') closeModal();
    // Sistem yükü yüksekken arayüz kasar
    const delay = S && S.cpu > 85 && !$('#os').classList.contains('hidden') ? 350 + Math.random() * 400 : 0;
    if (delay) setTimeout(() => fn(el.dataset.arg, el), delay); else fn(el.dataset.arg, el);
  });

  document.addEventListener('pointerdown', () => { UI.touch = Date.now(); }, true);

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    if (e.target.id === 'brq') ACT.brSearch();
    if (e.target.id === 'darkpw') ACT.darkPass();
    if (e.target.id === 'aresKey') ACT.aresTry();
  });

  document.addEventListener('input', (e) => {
    if (e.target.id === 'notesArea' && S) { S.notes = e.target.value; save(); }
  });

  document.addEventListener('visibilitychange', () => { if (document.hidden && S) { save(); Snd.fan(0); } });

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  runBoot();
})();

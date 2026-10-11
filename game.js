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
  };

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
  function save() { if (!S || S.mode === 'survival') return; try { localStorage.setItem(saveKey(S.mode), JSON.stringify(S)); } catch (e) { /* depolama yoksa sessiz geç */ } }
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
      `<button class="${saved ? '' : 'primary'}" data-act="newgame">Yeni Oyun (Hikâye)</button>` +
      '<button data-act="night">🌙 Gece Vardiyası</button>' +
      `<button data-act="survival">⏱️ Hayatta Kalma Modu${getBest() ? ` · Rekor ${fmtTime(getBest())}` : ''}</button>` +
      '<p class="muted small-t" style="text-align:center">Tüm tehditler kurgusaldır ve yalnızca oyunun içinde çalışır.</p>';
    menu.classList.remove('hidden');
    $('#boot').onclick = null;
  }

  function startGame(state, fresh) {
    S = state;
    Snd.init();
    show('os');
    UI.app = null; UI.term = []; UI.scan = null; UI.bsod = false; UI.mail = null; UI.paused = false;
    UI.br = { url: S.homepage, hist: [], src: false, query: '' };
    closeApp();
    renderStatus();
    clearInterval(UI.timer);
    UI.timer = setInterval(tick, 1000);
    if (fresh && S.mode === 'night') {
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
    notes:    { name: 'Notlar',      icon: '📝', title: 'Notlar' },
    trash:    { name: 'Çöp Kutusu',  icon: '🗑️', title: 'Çöp Kutusu' },
    settings: { name: 'Ayarlar',     icon: '⚙️', title: 'Ayarlar' },
    viewer:   { title: 'Görüntüleyici', hidden: true },
    ransom:   { title: '⚠ crypt0r', hidden: true },
  };
  const DOCK = ['browser', 'files', 'terminal', 'taskmgr'];

  function iconHtml(id, badge) {
    const a = APPS[id];
    return `<button class="app-icon" data-act="open" data-arg="${id}">
      <span class="ico">${a.icon}${badge ? `<span class="badge">${badge}</span>` : ''}</span><span>${a.name}</span></button>`;
  }

  function fileIcon(f) {
    if (f.locked) return '🔒';
    return { ares: '🔐', txt: '📄', img: '🖼️', doc: '📑', exe: '⚙️', zip: '🗜️' }[f.kind] || '📄';
  }
  function fileName(f) { return f.locked ? f.name + '.locked' : f.name; }

  function renderHome() {
    const found = ['p1', 'p2', 'p3'].filter((k) => S.flags[k]).length;
    const trashN = S.files.filter((f) => f.trash).length;
    const desk = S.files.filter((f) => f.dir === 'masaustu' && !f.trash);
    const unread = S.mails.filter((m) => !m.read).length;
    const badges = { trash: trashN, mail: unread };
    const N = S.night;
    const camState = !N ? '' : N.defeated ? 'Sakin' : hasMal('nobetci') ? ROOMS[N.pos] : N.started ? 'Sinyal yok' : 'Normal';
    const widget = S.mode === 'night'
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
        ${Object.keys(APPS).filter((k) => !APPS[k].hidden && !DOCK.includes(k) && !(k === 'mail' && S.mode === 'survival') && !(k === 'cams' && S.mode !== 'night'))
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
    $('#cam').classList.toggle('on', hasMal('spyware') || hasMal('nobetci'));
    $('#os').classList.toggle('lag', S.cpu > 85);
  }

  // ---------------------------------------------------------------------------
  // Pencere yönetimi
  // ---------------------------------------------------------------------------
  function openApp(id) {
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
    const R = { cams: renderCams, mail: renderMail, browser: renderBrowser, files: renderFiles, terminal: renderTerminal, taskmgr: renderTaskmgr,
      av: renderAV, notes: renderNotes, trash: renderTrash, settings: renderSettings, viewer: renderViewer, ransom: renderRansom };
    const keepScroll = id === 'taskmgr' || id === 'av' ? body.scrollTop : 0;
    body.innerHTML = R[id]();
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
    const b = UI.br;
    const site = SITES[b.url] || SITES['chronos://ana'];
    if (site.onVisit) site.onVisit();
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
    const d = DL[key];
    const ext = d.name.split('.').pop();
    const kind = ext === 'txt' ? 'txt' : (ext === 'zip' || ext === 'iso') ? 'zip' : 'exe';
    toast(`⬇️ ${d.name} indiriliyor...`);
    setTimeout(() => {
      if (!S) return;
      addFile({ name: d.name, dir: 'indirilenler', kind, size: d.size, payload: d.payload, text: d.text, flag: d.flag, dl: key });
      toast(`✅ ${d.name} indirildi → İndirilenler`, 'ok');
      if (UI.app === 'files') renderApp();
      save();
    }, 1400);
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
    if (f.payload === 'nobetci') {
      modal(`<h3>${esc(f.name)}</h3><pre class="viewer" style="color:var(--bad)">01001110 01000101 01000100 01000101 01001110\n\nbeni okuyamazsın.</pre>`, [['Kapat', 'primary', 'modalClose']]);
      return;
    }
    if (f.kind === 'ares') { openAres(); return; }
    if (f.kind === 'txt') {
      UI.view = f.id;
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
        toast('Program çalıştı ama hiçbir şey olmadı.');
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
    if (kind === 'ransomware') { S.ransom = null; if (UI.app === 'ransom') closeApp(); }
    if (kind === 'spyware') $('#ghost').classList.remove('on');
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
    const tough = (k) => k === 'nobetci';
    const mals = S.procs.filter((p) => p.mal && !tough(p.mal));
    for (const p of mals) onMalRemoved(p.mal);
    S.procs = S.procs.filter((p) => !p.mal || tough(p.mal));
    const bad = S.files.filter((f) => f.payload in MAL && !tough(f.payload));
    S.files = S.files.filter((f) => !(f.payload in MAL) || tough(f.payload));
    if (S.procs.some((p) => tough(p.mal)) || S.files.some((f) => tough(f.payload) && !f.trash)) {
      setTimeout(() => toast('⚠️ nobetci.exe karantinaya alınamadı: erişim reddedildi. Kopyaları elle silmelisin.', 'bad'), 900);
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
  function spawnPopup() {
    const box = $('#popups');
    if (!box || box.children.length >= 6) return;
    const [h, t, s] = pick(ADS);
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
    }

    if (S.mode === 'survival') tickSurvival(); else deliverMail();
    if (S.mode === 'night' && tickNight()) return;

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
    if ((UI.app === 'taskmgr' || UI.app === 'ransom' || UI.app === 'cams') && Date.now() - UI.touch > 900) renderApp();
    if (S.mode === 'night' && !UI.app && Date.now() - UI.touch > 900) renderHome();
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
      const target = S.files.find((f) => !f.trash && !f.locked && ['txt', 'img', 'doc'].includes(f.kind));
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
      <button class="${extra ? '' : 'primary'}" style="width:100%;margin-top:10px" data-act="newgame">Yeni Oyun (Hikâye)</button>`;
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
    const list = S.files.filter((f) => f.dir === UI.filesTab && !f.trash);
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
        tprint('ls               dosyaları listele\ncat <dosya>      metin dosyasını oku\nps               süreçleri listele\nkill <pid>       süreci sonlandır\nrm <dosya>       dosyayı çöpe at\ntara             Kalkan taraması başlat\nyedekle          sunucu yedeği al (gece)\nrapor            gece raporunu gönder (gece)\nkurtar           şifreli dosyaları kurtar\ncoz <anahtar>    ARES.kilit şifresini çöz\nsistem           donanım durumu\ntemizle          ekranı temizle');
        break;
      case 'ls':
        for (const d of ['masaustu', 'belgeler', 'indirilenler']) {
          const fs = S.files.filter((f) => f.dir === d && !f.trash);
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
    popClick: (_, el) => { el.closest('.popup').remove(); ACT.go('superarama.biz'); },
    termQuick: (c) => runCmd(c),
    toggleSound: () => { S.sound = !S.sound; Snd.init(); Snd.fan(S.cpu); renderApp(); save(); },
    survival: () => { closeModal(); startGame(newState('survival'), true); },
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

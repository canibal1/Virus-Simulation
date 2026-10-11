# Sanal OS 📱🦠

Sanal bir telefon işletim sistemi içinde geçen, mobil için tasarlanmış bir **dedektiflik + hayatta kalma** oyunu.
*Hypnospace Outlaw*, *Mainlining* ve *Welcome to the Game* gibi "masaüstü simülasyonu" oyunlarından esinlenmiştir.

> Oyundaki tüm virüsler, siteler ve dosyalar **kurgusaldır**. Yalnızca oyunun kendi durumu üzerinde çalışırlar;
> cihazınızdaki gerçek dosyalara, kameraya veya ağa dokunmazlar.

## Hikâye

Meslektaşın **Deniz K.** üç gündür kayıp. Bilgisayarına `ARES.kilit` adında şifreli bir dosya bırakmış.
Anahtar üç parçaya bölünmüş. Chronos Browser ile sanal ağda gezin, forumlarda iz sür, karanlık düğüme sız
ve parçaları topla. Ama dikkat: her indirme bir kumar.

## Uygulamalar

| Uygulama | Ne işe yarar |
|---|---|
| 🌐 **Chronos Browser** | Sanal siteler, arama, `</>` ile sayfa kaynağını görme, indirmeler |
| 📁 **Dosyalar** | Masaüstü / Belgeler / İndirilenler, dosya açma ve silme |
| ⌨️ **Terminal** | `ls`, `cat`, `ps`, `kill`, `rm`, `tara`, `kurtar`, `coz`, `sistem` |
| 📊 **Görev Yöneticisi** | CPU / RAM / sıcaklık ve süreçleri izleme, süreç sonlandırma |
| 🛡️ **Kalkan AV** | Tarama (sınırlı hak), karantina, şifreli dosya kurtarma |
| ✉️ **Posta** | Hikâyeyi ilerleten postalar ve kurgusal oltalama postaları. Doğru bildirim +1 tarama hakkı verir |
| 📝 **Notlar** | Görev defteri, bulunan parçalar ve kişisel notlar |
| 🗑️ **Çöp Kutusu** | Silinen dosyaları geri yükleme |

## Oyun modları

- **Hikâye:** ARES dosyasının anahtarını bul. İlerleme otomatik kaydedilir ve açılışta "Devam Et" ile sürdürülür.
- **⏱️ Hayatta Kalma:** Tehditler dalgalar halinde ağdan sızar ve her dalga bir öncekinden daha erken gelir (38 sn'den 12 sn'ye kadar).
  Her dakika +1 tarama hakkı kazanılır (en fazla 5). Skor, sistemin ayakta kaldığı süredir ve en iyi süre rekor olarak saklanır.

## Oltalama (phishing) postaları

| Posta | İpucu |
|---|---|
| "Lisansınızın süresi DOLDU!" | Gönderen `ka1kan-guvenlik.biz`, gerçek adres `kalkan.org`. Ekte `.exe` var |
| "Hesabınız askıya alındı" | `chronosbank-dogrulama.xyz` alan adı, acele ettiren dil, "cüzdanını bağla" isteği |
| "Gerçek anahtar ekte" | `yeraltinet-forum.co`, gerçek forum `yeraltinet.com` |

## Tehditler (kurgusal)

| Tür | Süreç | Etki | Çözüm |
|---|---|---|---|
| **Adware** | `reklamci.exe` | Pop-up yağmuru, tarayıcı ana sayfası SüperArama'ya döner | Süreci sonlandır **ve** kaynak dosyayı sil, yoksa 15 sn sonra geri gelir |
| **Ransomware** | `crypt0r.exe` | Dosyalar `.locked` olur, kırmızı duvar kâğıdı, 90 sn geri sayım, fidye talebi | Süreci durdur, sonra `kurtar` ile dosyaları geri al. Fidye ödemek işe yaramaz |
| **Spyware / Keylogger** | `goz_servisi.dll` | Kamera ışığı yanar, hayalet imleç, terminal girişleri gecikir, cüzdandan para sızar | Süreci sonlandır ve kaynağı sil |
| **Trojan / Wiper** | `svch0st.exe` | CPU ve sıcaklık tırmanır, terminal açılıp dosya siler, sonunda mavi ekran | Gerçek `svchost.exe` ile karıştırma. Sahtesini sonlandır |

Diğer mekanikler:
- **3 çökme hakkı.** Aşırı ısınma veya kritik bir sistem sürecini (`cekirdek.sys`, `svchost.exe`, `arayuz.exe`) sonlandırmak mavi ekrana yol açar.
- CPU %85'i geçince arayüz **kasar** ve fan sesi yükselir (Web Audio, Ayarlar'dan kapatılabilir).
- İndirmeden önce Kalkan bir risk analizi gösterir. kalkan.org'daki güncelleme kurulmadan yalnızca sitenin itibarına bakar.
- Her "bedava" dosya virüs değildir: `Retro_Tema.zip` gerçekten yalnızca bir temadır.
- İlerleme otomatik kaydedilir (`localStorage`).

<details><summary>⚠️ Çözüm (spoiler)</summary>

1. haber.net → forum.yeraltinet.com. Sayfa kaynağında (`</>`) **Parça 1: KR0** saklı.
2. `hatirlatma.txt` dosyasına göre kedinin adı Gölge. `dugum7.kara` şifresi `golge`. `son_kayit.txt` içinde **Parça 2: N05** var.
3. Çöp kutusundaki `silinen_mesaj.txt` dosyasında **Parça 3: 77** var.
4. Anahtar: `KR0N05-77`. ARES.kilit dosyasını aç ya da terminalde `coz KR0N05-77` yaz.
</details>

## Çalıştırma

Derleme adımı yoktur: saf HTML + CSS + JavaScript.

```bash
python3 -m http.server 8000
# Telefondan aynı ağda: http://<bilgisayar-ip>:8000
```

### GitHub Pages ile yayınlama

`.github/workflows/pages.yml`, `main` dalına yapılan her push'ta oyunu yayınlar. Bir kereye mahsus
**Settings → Pages → Build and deployment → Source: GitHub Actions** ayarını seçmek gerekir.
Oyun ardından `https://<kullanıcı-adı>.github.io/<depo-adı>/` adresinde açılır.

Telefonda tarayıcı menüsünden **"Ana ekrana ekle"** seçilirse tam ekran, çevrimdışı çalışan bir uygulama (PWA) olarak yüklenir.

### Uygulama mağazası için paketleme (isteğe bağlı)

[Capacitor](https://capacitorjs.com/) ile Android/iOS paketine dönüştürülebilir:

```bash
npm init -y && npm i @capacitor/core @capacitor/cli @capacitor/android
mkdir www && cp -r index.html style.css game.js manifest.json sw.js icons www/
npx cap init "Sanal OS" com.ornek.sanalos --web-dir www
npx cap add android && npx cap open android
```

## Dosya yapısı

```
index.html     ekran iskeleti
style.css      mobil arayüz
game.js        oyun mantığı (uygulamalar, siteler, tehditler, döngü)
manifest.json  PWA tanımı
sw.js          çevrimdışı önbellek (önce ağ, ağ yoksa önbellek)
.github/       GitHub Pages yayın iş akışı
icons/icon.svg uygulama ikonu
```

## Genişletme fikirleri

- Yeni siteler: `game.js` içinde `SITES` nesnesine bir giriş ekleyin.
- Yeni indirilebilir dosyalar: `DL` nesnesine ekleyin (`payload`: `safe`, `adware`, `ransomware`, `spyware`, `trojan`, `shield`, `theme`).
- Yeni tehdit türleri: `MAL` tanımı ve `tick()` içinde bir davranış fonksiyonu ekleyin.

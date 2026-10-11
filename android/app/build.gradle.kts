plugins {
    id("com.android.application")
}

// Oyunun web dosyaları depo kökünden APK'nın assets/www klasörüne kopyalanır.
val webDir = layout.buildDirectory.dir("generated/web")
val copyWeb by tasks.registering(Sync::class) {
    from(rootProject.file("..")) {
        include("index.html", "style.css", "game.js", "manifest.json", "icons/**")
    }
    into(webDir.map { it.dir("www") })
}

android {
    namespace = "com.sanalos.oyun"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.sanalos.oyun"
        minSdk = 26
        targetSdk = 35
        versionCode = (System.getenv("GITHUB_RUN_NUMBER") ?: "1").toInt()
        versionName = "1.0.${System.getenv("GITHUB_RUN_NUMBER") ?: "0"}"
    }

    // İmza: KEYSTORE_FILE ortam değişkeni varsa onu, yoksa debug anahtarını kullanır.
    val ksFile = System.getenv("KEYSTORE_FILE")
    signingConfigs {
        if (ksFile != null) {
            create("release") {
                storeFile = file(ksFile)
                storePassword = System.getenv("KEYSTORE_PASSWORD")
                keyAlias = System.getenv("KEY_ALIAS")
                keyPassword = System.getenv("KEY_PASSWORD")
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            signingConfig = if (ksFile != null) signingConfigs.getByName("release") else signingConfigs.getByName("debug")
        }
    }

    sourceSets["main"].assets.srcDir(webDir)

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

tasks.named("preBuild") { dependsOn(copyWeb) }

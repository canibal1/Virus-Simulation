package com.sanalos.oyun;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/** Oyunu (assets/www) tam ekran bir WebView içinde çalıştırır. */
public class MainActivity extends Activity {

    private WebView web;

    // Android geri tuşu: açık modal/uygulama penceresini kapatır; yoksa uygulamayı arka plana alır.
    private static final String BACK_JS =
            "(function(){"
            + "var m=document.querySelector('#modal:not(.hidden) .modal-actions button');"
            + "if(m){m.click();return true;}"
            + "var b=document.querySelector('#os:not(.hidden) #win:not(.hidden) .win-back');"
            + "if(b){b.click();return true;}"
            + "return false;})()";

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window w = getWindow();
        w.setStatusBarColor(Color.parseColor("#0b0f17"));
        w.setNavigationBarColor(Color.parseColor("#0b0f17"));

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#0b0f17"));
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);           // kayıt dosyası (localStorage)
        s.setAllowFileAccess(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setTextZoom(100);
        web.setWebViewClient(new WebViewClient());
        setContentView(web);

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl("file:///android_asset/www/index.html");
    }

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        web.saveState(outState);
    }

    @Override
    protected void onPause() {
        super.onPause();
        web.onPause();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.onResume();
    }

    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        web.evaluateJavascript(BACK_JS, handled -> {
            if (!"true".equals(handled)) moveTaskToBack(true);
        });
    }
}

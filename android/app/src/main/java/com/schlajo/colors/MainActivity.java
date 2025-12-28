package com.schlajo.colors;

import android.webkit.WebSettings;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onStart() {
        super.onStart();
        
        // Enable text zooming to respect system font size settings
        WebSettings webSettings = this.bridge.getWebView().getSettings();
        webSettings.setTextZoom(100); // Use system default (100%)
        webSettings.setSupportZoom(true);
    }
}

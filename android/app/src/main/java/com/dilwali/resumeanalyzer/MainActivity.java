package com.dilwali.resumeanalyzer;

import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.WebView;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private static final int CREAM_BG = Color.parseColor("#FBF4EB");

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        applyCreamStatusBar();
    }

    @Override
    public void onResume() {
        super.onResume();
        applyCreamStatusBar();
    }

    @Override
    public void onStart() {
        super.onStart();
        applyCreamStatusBar();
        WebView webView = this.bridge != null ? this.bridge.getWebView() : null;
        if (webView != null) {
            webView.setBackgroundColor(CREAM_BG);
        }
    }

    private void applyCreamStatusBar() {
        Window window = getWindow();
        if (window == null) {
            return;
        }
        // Keep the WebView strictly below the system status bar (never overlap battery/clock)
        WindowCompat.setDecorFitsSystemWindows(window, true);
        window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        window.setStatusBarColor(CREAM_BG);
        window.setNavigationBarColor(CREAM_BG);

        View decorView = window.getDecorView();
        if (decorView != null) {
            decorView.setBackgroundColor(CREAM_BG);
            WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(window, decorView);
            if (controller != null) {
                controller.setAppearanceLightStatusBars(true);
                controller.setAppearanceLightNavigationBars(true);
            }
        }
    }
}

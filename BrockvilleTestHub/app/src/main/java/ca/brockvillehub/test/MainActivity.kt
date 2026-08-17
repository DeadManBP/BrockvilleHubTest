package ca.brockvillehub.test

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        webView = WebView(this)
        webView.settings.javaScriptEnabled = true
        webView.settings.domStorageEnabled = true
        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView, url: String) {
                super.onPageFinished(view, url)
                view.evaluateJavascript("""
                    (function(){
                      if(document.getElementById('brockville-visual-polish')) return;
                      const s=document.createElement('style');
                      s.id='brockville-visual-polish';
                      s.textContent=`
                        .tile{-webkit-tap-highlight-color:transparent;transition:transform .10s ease,filter .10s ease,box-shadow .10s ease}
                        .tile:active{transform:scale(.982);filter:brightness(1.08)}
                        .tile:focus-visible{outline:2px solid #7ce0e9;outline-offset:2px}
                        .bottom{padding:7px 8px}
                        .bottom button{border-radius:13px;padding:4px 2px;transition:transform .10s ease,background .10s ease,color .10s ease}
                        .bottom button:active{transform:scale(.93);background:#102f42}
                        .bottom .active{background:#0d293a}
                        .bottom button:first-line{font-size:20px}
                      `;
                      document.head.appendChild(s);
                    })();
                """.trimIndent(), null)
            }

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url.toString()
                if (url.startsWith("https://www.facebook.com/") ||
                    url.startsWith("https://facebook.com/")) {
                    val uri = Uri.parse(url)
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, uri).apply {
                            setPackage("com.facebook.katana")
                        })
                    } catch (_: Exception) {
                        startActivity(Intent(Intent.ACTION_VIEW, uri))
                    }
                    return true
                }
                if (url.startsWith("https://www.google.com/maps/") ||
                    url.startsWith("https://maps.google.com/") ||
                    url.startsWith("geo:") ||
                    url.startsWith("intent:")) {
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                    } catch (_: Exception) {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com/maps/search/?api=1&query=Brockville+Ontario")))
                    }
                    return true
                }
                return false
            }
        }
        webView.webChromeClient = WebChromeClient()
        setContentView(webView)
        webView.loadUrl("file:///android_asset/index.html")

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.url == "file:///android_asset/index.html") {
                    webView.evaluateJavascript(
                        "document.querySelector('.bottom .active')?.dataset?.p || 'home'"
                    ) { page ->
                        if (page.contains("home")) {
                            isEnabled = false
                            onBackPressedDispatcher.onBackPressed()
                        } else {
                            webView.evaluateJavascript("history.back()", null)
                        }
                    }
                } else if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }
}

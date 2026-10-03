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
                view.evaluateJavascript("window.HUB_VERSION_CODE=" + BuildConfig.VERSION_CODE + ";window.HUB_VERSION_NAME='" + BuildConfig.VERSION_NAME + "';", null)
                view.evaluateJavascript("""
                    (function(){
                      if(document.getElementById('brockville-visual-polish')) return;
                      const s=document.createElement('style');
                      s.id='brockville-visual-polish';
                      s.textContent=`
                        .tile{-webkit-tap-highlight-color:transparent;transition:transform .10s ease,filter .10s ease,box-shadow .10s ease}
                        .tile:active{transform:scale(.982);filter:brightness(1.08)}
                        .tile:focus-visible{outline:2px solid #7ce0e9;outline-offset:2px}
                        .tile .hub-icon{display:inline-grid;place-items:center;width:52px;height:58px;margin:0 0 8px;border-radius:26px 26px 10px 10px;background:linear-gradient(180deg,#143E55,#0B2C40);border:1px solid #285366;border-bottom:3px solid #166B8F;font-size:24px;line-height:1;box-shadow:0 6px 14px rgba(0,0,0,.28)} .tile[data-kind="river"] .hub-icon{background:linear-gradient(180deg,#166B8F,#0F4C66)} .tile[data-kind="heritage"] .hub-icon{background:linear-gradient(180deg,#F2E8D0,#D9C7A5)} .tile[data-kind="alert"] .hub-icon{background:linear-gradient(180deg,#C25E33,#9A4526)}
                        .tile.primary .hub-icon{background:rgba(7,27,42,.22);border-color:rgba(255,255,255,.18)}
                        .tile b{position:relative;z-index:1}
                        .bottom{padding:7px 8px}
                        .bottom button{border-radius:13px;padding:4px 2px;transition:transform .10s ease,background .10s ease,color .10s ease}
                        .bottom button:active{transform:scale(.93);background:#102f42}
                        .bottom .active{background:#0d293a}
                        .bottom button:first-line{font-size:20px}
                      `;
                      document.head.appendChild(s);
                      function polishIcons(){
                        document.querySelectorAll('.tile').forEach(function(tile){
                          if(tile.querySelector('.hub-icon')) return;
                          const node=tile.firstChild;
                          if(!node || node.nodeType!==3) return;
                          const text=node.nodeValue || '';
                          const match=text.match(/^(\\p{Extended_Pictographic}(?:\\uFE0F|\\u200D\\p{Extended_Pictographic})*)/u);
                          if(!match) return;
                          const icon=document.createElement('span');
                          icon.className='hub-icon';
                          icon.textContent=match[1];
                          node.nodeValue=text.slice(match[1].length);
                          tile.insertBefore(icon,node);
                        });
                      }
                      polishIcons();
                      new MutationObserver(polishIcons).observe(document.getElementById('m')||document.body,{subtree:true,childList:true,characterData:true});
                    })();
                """.trimIndent(), null)
            }

            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url.toString()
                if (url.contains("/releases/download/") || url.endsWith(".apk")) {
                    // App update download: hand to the browser so Android can download and install it.
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                    } catch (_: Exception) {
                        return false
                    }
                    return true
                }
                val lowerUrl = url.lowercase()
                if (lowerUrl.endsWith(".pdf") || lowerUrl.contains(".pdf?") || lowerUrl.contains(".pdf#")) {
                    // PDFs (transit route map, collection calendars): the WebView cannot
                    // render them, so hand them to the browser/PDF viewer instead.
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                    } catch (_: Exception) {
                        return false
                    }
                    return true
                }
                if (url.startsWith("https://www.facebook.com/") ||
                    url.startsWith("https://facebook.com/") ||
                    url.startsWith("https://m.facebook.com/")) {
                    // Open the specific Facebook Page (e.g. BrockvilleON), not the main feed.
                    // The Facebook app ignores the Page path on both https and facewebmodal links
                    // and lands on News Feed, so open the full Page URL in a real browser instead.
                    // Find a browser package (anything that handles https but is not Facebook / this app).
                    try {
                        val probe = Intent(Intent.ACTION_VIEW, Uri.parse("https://www.example.com/"))
                        val handlers = view.context.packageManager.queryIntentActivities(probe, android.content.pm.PackageManager.MATCH_ALL)
                        var browserPkg: String? = null
                        for (info in handlers) {
                            val pkg = info.activityInfo.packageName
                            if (pkg != "com.facebook.katana" && pkg != "com.facebook.lite" && pkg != view.context.packageName) {
                                browserPkg = pkg
                                break
                            }
                        }
                        val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        if (browserPkg != null) {
                            browserIntent.setPackage(browserPkg)
                        }
                        startActivity(browserIntent)
                    } catch (_: Exception) {
                        // No browser found; let the WebView load the Page itself rather than the app feed.
                        return false
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
                if (url.startsWith("https://calendar.google.com/")) {
                    // Event reminders: open Google Calendar in the browser/app where the
                    // user is signed in, not inside the WebView.
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                    } catch (_: Exception) {
                        return false
                    }
                    return true
                }
                if (url.startsWith("tel:") || url.startsWith("sms:") || url.startsWith("mailto:")) {
                    // Phone, text and email links: hand to the dialer, messaging or mail app.
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                    } catch (_: Exception) {
                        return false
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

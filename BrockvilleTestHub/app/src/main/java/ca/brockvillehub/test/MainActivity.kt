package ca.brockvillehub.test
import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity

class MainActivity: AppCompatActivity() {
 @SuppressLint("SetJavaScriptEnabled")
 override fun onCreate(savedInstanceState: Bundle?) {
  super.onCreate(savedInstanceState)
  val w=WebView(this)
  w.settings.javaScriptEnabled=true
  w.settings.domStorageEnabled=true
  w.webViewClient=WebViewClient()
  w.webChromeClient=WebChromeClient()
  setContentView(w)
  w.loadUrl("file:///android_asset/index.html")
 }
}

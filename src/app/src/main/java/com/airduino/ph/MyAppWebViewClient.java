package com.airduino.ph;

import android.webkit.*;
import android.net.*;
import android.content.*;
import android.widget.*;

public class MyAppWebViewClient extends WebViewClient {

	@Override
	public boolean shouldOverrideUrlLoading(WebView view, String url) {

		if(Uri.parse(url).getHost().endsWith("000webhostapp.com")) {
			return false;
		}

		Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
		view.getContext().startActivity(intent);
		return true;
	}
}

package com.sentencebaseapp;

import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.os.Message;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class ClipboardListener extends ReactContextBaseJavaModule {

    private static final String EVENT_NAME = "clipboardUpdate";
    private static ReactApplicationContext reactApplicationContext;
    private ClipboardManager clipboardManager;
    private ClipboardManager.OnPrimaryClipChangedListener clipChangedListener = null;
    private Handler handler;

    ClipboardListener(ReactApplicationContext reactApplicationContext) {
        super(reactApplicationContext);
        ClipboardListener.reactApplicationContext = reactApplicationContext;

        clipboardManager = (ClipboardManager) reactApplicationContext.getSystemService(
                Context.CLIPBOARD_SERVICE);

        clipChangedListener = () -> {
            ClipData clipData = clipboardManager.getPrimaryClip();

            if (clipData != null && clipData.getItemCount() > 0) {
                reactApplicationContext
                        .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit(EVENT_NAME, clipData.getItemAt(0).coerceToText(
                                reactApplicationContext));
            }
        };
        clipboardManager.addPrimaryClipChangedListener(clipChangedListener);
    }

    @NonNull
    @Override
    public String getName() {
        return "ClipboardListener";
    }

    @Override
    protected void finalize() throws Throwable {
        super.finalize();
        clipboardManager.removePrimaryClipChangedListener(clipChangedListener);
    }
}

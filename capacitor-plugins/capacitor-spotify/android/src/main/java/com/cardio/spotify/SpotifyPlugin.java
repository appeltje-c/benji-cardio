package com.cardio.spotify;

import android.app.Activity;
import android.content.Intent;

import androidx.activity.result.ActivityResult;
import androidx.annotation.NonNull;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.spotify.android.appremote.api.ConnectionParams;
import com.spotify.android.appremote.api.Connector;
import com.spotify.android.appremote.api.SpotifyAppRemote;
import com.spotify.protocol.types.PlayerState;
import com.spotify.protocol.types.Track;
import com.spotify.sdk.android.auth.AuthorizationClient;
import com.spotify.sdk.android.auth.AuthorizationRequest;
import com.spotify.sdk.android.auth.AuthorizationResponse;

@CapacitorPlugin(name = "Spotify")
public class SpotifyPlugin extends Plugin {

    private SpotifyAppRemote appRemote;
    private String clientId = "";
    private String redirectUri = "";
    private PluginCall pendingConnectCall;

    @PluginMethod
    public void initialize(PluginCall call) {
        clientId = call.getString("clientId", "");
        redirectUri = call.getString("redirectUri", "");

        if (clientId.isEmpty() || redirectUri.isEmpty()) {
            call.reject("clientId and redirectUri are required");
            return;
        }
        call.resolve();
    }

    @PluginMethod
    public void connect(PluginCall call) {
        if (clientId.isEmpty()) {
            call.reject("Plugin not initialized. Call initialize() first.");
            return;
        }

        pendingConnectCall = call;

        AuthorizationRequest.Builder builder = new AuthorizationRequest.Builder(
                clientId,
                AuthorizationResponse.Type.TOKEN,
                redirectUri
        );
        builder.setScopes(new String[]{
                "app-remote-control",
                "user-modify-playback-state",
                "user-read-playback-state",
                "user-read-currently-playing"
        });

        Intent authIntent = AuthorizationClient.createLoginActivityIntent(
                getActivity(),
                builder.build()
        );

        startActivityForResult(call, authIntent, "handleAuthResult");
    }

    @ActivityCallback
    private void handleAuthResult(PluginCall call, ActivityResult result) {
        if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
            AuthorizationResponse response = AuthorizationClient.getResponse(
                    result.getResultCode(),
                    result.getData()
            );

            if (response.getType() == AuthorizationResponse.Type.TOKEN) {
                connectToAppRemote(response.getAccessToken(), call);
            } else if (response.getType() == AuthorizationResponse.Type.ERROR) {
                call.reject("Authorization error: " + response.getError());
            } else {
                call.reject("Authorization cancelled");
            }
        } else {
            call.reject("Authorization cancelled");
        }
    }

    private void connectToAppRemote(String accessToken, PluginCall call) {
        ConnectionParams params = new ConnectionParams.Builder(clientId)
                .setRedirectUri(redirectUri)
                .showAuthView(false)
                .build();

        SpotifyAppRemote.connect(getContext(), params, new Connector.ConnectionListener() {
            @Override
            public void onConnected(SpotifyAppRemote remote) {
                appRemote = remote;
                subscribeToPlayerState();

                JSObject result = new JSObject();
                result.put("displayName", "Spotify User");
                call.resolve(result);

                JSObject status = new JSObject();
                status.put("connected", true);
                notifyListeners("connectionStatusChanged", status);
            }

            @Override
            public void onFailure(Throwable error) {
                call.reject("Connection failed: " + error.getMessage());

                JSObject status = new JSObject();
                status.put("connected", false);
                notifyListeners("connectionStatusChanged", status);
            }
        });
    }

    private void subscribeToPlayerState() {
        if (appRemote == null) return;

        appRemote.getPlayerApi().subscribeToPlayerState().setEventCallback(playerState -> {
            notifyListeners("playerStateChanged", playerStateToJS(playerState));
        });
    }

    @PluginMethod
    public void disconnect(PluginCall call) {
        if (appRemote != null) {
            SpotifyAppRemote.disconnect(appRemote);
            appRemote = null;
        }

        JSObject status = new JSObject();
        status.put("connected", false);
        notifyListeners("connectionStatusChanged", status);

        call.resolve();
    }

    @PluginMethod
    public void isConnected(PluginCall call) {
        JSObject result = new JSObject();
        result.put("connected", appRemote != null && appRemote.isConnected());
        call.resolve(result);
    }

    @PluginMethod
    public void play(PluginCall call) {
        if (!ensureConnected(call)) return;

        String uri = call.getString("uri");
        if (uri == null || uri.isEmpty()) {
            call.reject("uri is required");
            return;
        }

        appRemote.getPlayerApi().play(uri).setResultCallback(empty -> {
            Integer positionMs = call.getInt("positionMs");
            if (positionMs != null && positionMs > 0) {
                appRemote.getPlayerApi().seekTo(positionMs);
            }
            call.resolve();
        }).setErrorCallback(error -> call.reject(error.getMessage()));
    }

    @PluginMethod
    public void resume(PluginCall call) {
        if (!ensureConnected(call)) return;
        appRemote.getPlayerApi().resume()
                .setResultCallback(empty -> call.resolve())
                .setErrorCallback(error -> call.reject(error.getMessage()));
    }

    @PluginMethod
    public void pause(PluginCall call) {
        if (!ensureConnected(call)) return;
        appRemote.getPlayerApi().pause()
                .setResultCallback(empty -> call.resolve())
                .setErrorCallback(error -> call.reject(error.getMessage()));
    }

    @PluginMethod
    public void next(PluginCall call) {
        if (!ensureConnected(call)) return;
        appRemote.getPlayerApi().skipNext()
                .setResultCallback(empty -> call.resolve())
                .setErrorCallback(error -> call.reject(error.getMessage()));
    }

    @PluginMethod
    public void previous(PluginCall call) {
        if (!ensureConnected(call)) return;
        appRemote.getPlayerApi().skipPrevious()
                .setResultCallback(empty -> call.resolve())
                .setErrorCallback(error -> call.reject(error.getMessage()));
    }

    @PluginMethod
    public void seek(PluginCall call) {
        if (!ensureConnected(call)) return;
        Integer positionMs = call.getInt("positionMs");
        if (positionMs == null) {
            call.reject("positionMs is required");
            return;
        }
        appRemote.getPlayerApi().seekTo(positionMs)
                .setResultCallback(empty -> call.resolve())
                .setErrorCallback(error -> call.reject(error.getMessage()));
    }

    @PluginMethod
    public void getPlayerState(PluginCall call) {
        if (!ensureConnected(call)) return;
        appRemote.getPlayerApi().getPlayerState()
                .setResultCallback(state -> call.resolve(playerStateToJS(state)))
                .setErrorCallback(error -> call.reject(error.getMessage()));
    }

    private boolean ensureConnected(PluginCall call) {
        if (appRemote == null || !appRemote.isConnected()) {
            call.reject("Not connected to Spotify");
            return false;
        }
        return true;
    }

    private JSObject playerStateToJS(@NonNull PlayerState state) {
        JSObject obj = new JSObject();
        Track track = state.track;
        obj.put("trackName", track != null ? track.name : "");
        obj.put("artistName", track != null && track.artist != null ? track.artist.name : "");
        obj.put("albumName", track != null && track.album != null ? track.album.name : "");
        obj.put("albumArtUrl", "");
        obj.put("durationMs", track != null ? track.duration : 0);
        obj.put("positionMs", state.playbackPosition);
        obj.put("isPaused", state.isPaused);
        obj.put("uri", track != null ? track.uri : "");
        return obj;
    }
}

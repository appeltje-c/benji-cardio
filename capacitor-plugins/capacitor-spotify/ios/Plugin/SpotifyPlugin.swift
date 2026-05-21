import Foundation
import Capacitor
import SpotifyiOS

@objc(SpotifyPlugin)
public class SpotifyPlugin: CAPPlugin, CAPBridgedPlugin, SPTAppRemoteDelegate, SPTAppRemotePlayerStateDelegate {
    public let identifier = "SpotifyPlugin"
    public let jsName = "Spotify"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "initialize", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "connect", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "disconnect", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isConnected", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "play", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "resume", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "pause", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "next", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "previous", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "seek", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getPlayerState", returnType: CAPPluginReturnPromise),
    ]

    private var appRemote: SPTAppRemote?
    private var connectCall: CAPPluginCall?
    private var clientId: String = ""
    private var redirectUri: String = ""

    override public func load() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleSpotifyCallback(_:)),
            name: NSNotification.Name("SpotifyCallback"),
            object: nil
        )
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleAppDidBecomeActive),
            name: UIApplication.didBecomeActiveNotification,
            object: nil
        )
    }

    @objc func initialize(_ call: CAPPluginCall) {
        guard let clientId = call.getString("clientId"),
              let redirectUri = call.getString("redirectUri") else {
            call.reject("clientId and redirectUri are required")
            return
        }
        self.clientId = clientId
        self.redirectUri = redirectUri

        let configuration = SPTConfiguration(clientID: clientId, redirectURL: URL(string: redirectUri)!)
        appRemote = SPTAppRemote(configuration: configuration, logLevel: .debug)
        appRemote?.delegate = self

        call.resolve()
    }

    @objc func connect(_ call: CAPPluginCall) {
        guard let appRemote = appRemote else {
            call.reject("Plugin not initialized. Call initialize() first.")
            return
        }

        connectCall = call

        // Set access token placeholder to trigger auth
        appRemote.connectionParameters.accessToken = ""
        appRemote.authorizeAndPlayURI("")

        // The actual connection happens in handleSpotifyCallback after OAuth redirect
    }

    @objc func disconnect(_ call: CAPPluginCall) {
        appRemote?.disconnect()
        call.resolve()
    }

    @objc func isConnected(_ call: CAPPluginCall) {
        call.resolve(["connected": appRemote?.isConnected ?? false])
    }

    @objc func play(_ call: CAPPluginCall) {
        guard let uri = call.getString("uri") else {
            call.reject("uri is required")
            return
        }
        guard let playerAPI = appRemote?.playerAPI else {
            call.reject("Not connected to Spotify")
            return
        }

        playerAPI.play(uri) { _, error in
            if let error = error {
                call.reject(error.localizedDescription)
            } else {
                if let positionMs = call.getInt("positionMs"), positionMs > 0 {
                    playerAPI.seek(toPosition: positionMs) { _, _ in }
                }
                call.resolve()
            }
        }
    }

    @objc func resume(_ call: CAPPluginCall) {
        appRemote?.playerAPI?.resume { _, error in
            if let error = error {
                call.reject(error.localizedDescription)
            } else {
                call.resolve()
            }
        }
    }

    @objc func pause(_ call: CAPPluginCall) {
        appRemote?.playerAPI?.pause { _, error in
            if let error = error {
                call.reject(error.localizedDescription)
            } else {
                call.resolve()
            }
        }
    }

    @objc func next(_ call: CAPPluginCall) {
        appRemote?.playerAPI?.skip(toNext: { _, error in
            if let error = error {
                call.reject(error.localizedDescription)
            } else {
                call.resolve()
            }
        })
    }

    @objc func previous(_ call: CAPPluginCall) {
        appRemote?.playerAPI?.skip(toPrevious: { _, error in
            if let error = error {
                call.reject(error.localizedDescription)
            } else {
                call.resolve()
            }
        })
    }

    @objc func seek(_ call: CAPPluginCall) {
        guard let positionMs = call.getInt("positionMs") else {
            call.reject("positionMs is required")
            return
        }
        appRemote?.playerAPI?.seek(toPosition: positionMs) { _, error in
            if let error = error {
                call.reject(error.localizedDescription)
            } else {
                call.resolve()
            }
        }
    }

    @objc func getPlayerState(_ call: CAPPluginCall) {
        appRemote?.playerAPI?.getPlayerState { state, error in
            if let error = error {
                call.reject(error.localizedDescription)
                return
            }
            guard let state = state as? SPTAppRemotePlayerState else {
                call.reject("Could not get player state")
                return
            }
            call.resolve(self.playerStateToDict(state))
        }
    }

    // MARK: - SPTAppRemoteDelegate

    public func appRemoteDidEstablishConnection(_ appRemote: SPTAppRemote) {
        appRemote.playerAPI?.delegate = self
        appRemote.playerAPI?.subscribe(toPlayerState: { _, _ in })

        // Resolve pending connect call
        if let call = connectCall {
            call.resolve(["displayName": "Spotify User"])
            connectCall = nil
        }

        notifyListeners("connectionStatusChanged", data: ["connected": true])
    }

    public func appRemote(_ appRemote: SPTAppRemote, didFailConnectionAttemptWithError error: Error?) {
        if let call = connectCall {
            call.reject(error?.localizedDescription ?? "Connection failed")
            connectCall = nil
        }
        notifyListeners("connectionStatusChanged", data: ["connected": false])
    }

    public func appRemote(_ appRemote: SPTAppRemote, didDisconnectWithError error: Error?) {
        notifyListeners("connectionStatusChanged", data: ["connected": false])
    }

    // MARK: - SPTAppRemotePlayerStateDelegate

    public func playerStateDidChange(_ playerState: SPTAppRemotePlayerState) {
        notifyListeners("playerStateChanged", data: playerStateToDict(playerState))
    }

    // MARK: - Helpers

    @objc private func handleSpotifyCallback(_ notification: Notification) {
        guard let url = notification.object as? URL else { return }

        let params = appRemote?.authorizationParameters(from: url)
        if let accessToken = params?[SPTAppRemoteAccessTokenKey] {
            appRemote?.connectionParameters.accessToken = accessToken
            appRemote?.connect()
        } else if let error = params?[SPTAppRemoteErrorDescriptionKey] {
            if let call = connectCall {
                call.reject(error)
                connectCall = nil
            }
        }
    }

    @objc private func handleAppDidBecomeActive() {
        if let appRemote = appRemote,
           !appRemote.isConnected,
           appRemote.connectionParameters.accessToken != nil,
           !appRemote.connectionParameters.accessToken!.isEmpty {
            appRemote.connect()
        }
    }

    private func playerStateToDict(_ state: SPTAppRemotePlayerState) -> [String: Any] {
        return [
            "trackName": state.track.name,
            "artistName": state.track.artist.name,
            "albumName": state.track.album.name,
            "albumArtUrl": "",
            "durationMs": state.track.duration,
            "positionMs": state.playbackPosition,
            "isPaused": state.isPaused,
            "uri": state.track.uri,
        ]
    }
}

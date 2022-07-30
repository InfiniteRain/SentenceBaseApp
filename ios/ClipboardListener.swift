import Foundation
import React
import UIKit

@objc(ClipboardListener)
class ClipboardListener: RCTEventEmitter {
    lazy var timer = Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { [weak self] t in
        guard let self = self else { return }
        self.run()
    }
    let pasteboard = UIPasteboard.general
    var lastChangeCount = 0
    var hasListener = false

    func run() {
        guard lastChangeCount != pasteboard.changeCount && hasListener else {
            return
        }

        let diff = pasteboard.changeCount - lastChangeCount
        lastChangeCount = pasteboard.changeCount

        if diff != 1 {
            return
        }

        sendEvent(withName: "clipboardUpdate", body: UIPasteboard.general.string ?? "")
    }

    deinit {
        timer.invalidate()
    }

    override func startObserving() {
        hasListener = true
    }

    override func stopObserving() {
        hasListener = false
    }

    static override func moduleName() -> String! {
        "ClipboardListener"
    }

    static override func requiresMainQueueSetup() -> Bool {
        true
    }

    @objc
    override func supportedEvents() -> [String]! {
        ["clipboardUpdate"]
    }
}

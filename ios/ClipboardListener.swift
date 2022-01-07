import Foundation
import React
import UIKit

@objc(ClipboardListener)
class ClipboardListener: RCTEventEmitter {
  var timer: Timer!
  let pasteboard: UIPasteboard = .general
  var lastChangeCount: Int = 0
  var hasListener: Bool = false

  override init() {
    super.init()

    timer = Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { [weak self] (t) in
      guard let self = self else { return }
      self.run()
    }
  }

  func run() {
    if lastChangeCount == pasteboard.changeCount || !hasListener {
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

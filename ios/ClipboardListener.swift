//
//  ClipboardListener.swift
//  SentenceBaseApp
//
//  Created by David Lõssenko on 11/28/21.
//

import Foundation
import React
import UIKit

@objc(ClipboardListener)
class ClipboardListener: RCTEventEmitter {
  var timer: Timer!
  let pasteboard: UIPasteboard = .general
  var lastChangeCount: Int = 0
  var hasListener: Bool = false;
  
  override init() {
    super.init()
    
    timer = Timer.scheduledTimer(withTimeInterval: 0.05, repeats: true) { (t) in
      if self.lastChangeCount == self.pasteboard.changeCount || !self.hasListener {
        return
      }
      
      let diff = self.pasteboard.changeCount - self.lastChangeCount
      self.lastChangeCount = self.pasteboard.changeCount

      if diff != 1 {
        return
      }

      self.sendEvent(
        withName: "clipboardUpdate",
        body: UIPasteboard.general.string ?? ""
      )
    }
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
    return "ClipboardListener";
  }
  
  static override func requiresMainQueueSetup() -> Bool {
    return true;
  }
  
  @objc
  override func supportedEvents() -> [String]! {
    return ["clipboardUpdate"];
  }
}

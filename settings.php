<?php
namespace MergeFeed;

class Settings {
  // Keys
  public const KEY_BRIDGE_URL           = "MERGEFEED_RSSBRIDGE_HOST";
  public const KEY_BRIDGE_NAME          = "MERGEFEED_RSSBRIDGE_NAME";
  public const KEY_LABEL_FEED           = "MERGEFEED_LABEL_TEXT";
  public const KEY_LABEL_FEED_MERGE     = "MERGEFEED_LABEL_TEXT_MERGE";
  public const KEY_LIMIT                = "MERGEFEED_BRIDGE_LIMIT";
  public const KEY_AUTO_UPDATE          = "MERGEFEED_AUTO_UPDATE";
  
  // Defaults
  private const DEFAULT_BRIDGE_URL       = "https://rss-bridge.org/bridge01";
  private const DEFAULT_BRIDGE_NAME      = "FeedMergeBridge";
  private const DEFAULT_LABEL_FEED       = "Feed URL";
  private const DEFAULT_LABEL_FEED_MERGE = "Feed URL (Merge)";
  private const DEFAULT_LIMIT            = -1;
  private const DEFAULT_AUTO_UPDATE      = true;
  
  // Fields
  public $settings;
  private $shouldSave = false;
  
  public function __construct($settings) {
    $this->applyOrDefault(self::KEY_BRIDGE_URL,       $settings, $this->getRssBridgeUrl());
    $this->applyOrDefault(self::KEY_BRIDGE_NAME,      $settings, $this->getRssBridgeName());
    $this->applyOrDefault(self::KEY_LABEL_FEED,       $settings, $this->getLabelFeed());
    $this->applyOrDefault(self::KEY_LABEL_FEED_MERGE, $settings, $this->getLabelFeedMerge());
    $this->applyOrDefault(self::KEY_LIMIT,            $settings, $this->getRssBridgeLimit());
    $this->applyOrDefault(self::KEY_AUTO_UPDATE,      $settings, $this->getAutoUpdateFields());
  }
  
  public function getSettings() {
    return $this->settings;
  }
  
  public function shouldSave() {
    return $this->shouldSave;
  }
  
  private function applyOrDefault($key, $settings, $default) {
    if (is_null($settings[$key])) {
      $this->settings[$key] = $default;
      $this->shouldSave = true;
    }
    else {
      $this->settings[$key] = $settings[$key];  
    }
  }
  
  public function getRssBridgeUrl() {
    return $this->settings[self::KEY_BRIDGE_URL] ?? static::DEFAULT_BRIDGE_URL;
  }
  
  public function getRssBridgeName() {
    return $this->settings[self::KEY_BRIDGE_NAME] ?? static::DEFAULT_BRIDGE_NAME;
  }
  
  public function getLabelFeed() {
    return $this->settings[self::KEY_LABEL_FEED] ?? static::DEFAULT_LABEL_FEED;
  }
  
  public function getLabelFeedMerge() {
    return $this->settings[self::KEY_LABEL_FEED_MERGE] ?? static::DEFAULT_LABEL_FEED_MERGE;
  }
  
  public function getRssBridgeLimit() {
    return (int)$this->settings[self::KEY_LIMIT] ?? static::DEFAULT_LIMIT;
  }
  
  public function getAutoUpdateFields() {
    return $this->settings[self::KEY_AUTO_UPDATE] ?? static::DEFAULT_AUTO_UPDATE;
  }
}
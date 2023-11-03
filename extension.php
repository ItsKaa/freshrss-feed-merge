<?php
require "settings.php";
use MergeFeed\Settings;

class MergeFeedsExtension extends Minz_Extension {
  public Settings $settings;
  private $isSystemSettings;
  
  public function init() {
    $this->isSystemSettings = $this->getType() == "system";
    $this->initSettings();
    
    // Write default settings if needed.
    $this->writeSettings($this->settings->shouldSave());
    
    // Add styles and scripts.
    Minz_View::appendStyle($this->getFileUrl('style.css', 'css'));
    Minz_View::appendScript($this->getFileUrl($this->getConfigFileName(), 'js'));
    Minz_View::appendScript($this->getFileUrl('script.js', 'js'));
  }

  public function handleConfigureAction() {
    $this->registerTranslates();
  
    if (Minz_Request::isPost()) {
      $this->applySettings([
        $this->settings::KEY_BRIDGE_URL => trim(rtrim(Minz_Request::param('rss_bridge_url', $this->settings->DEFAULT_BRIDGE_URL), '/')),
        $this->settings::KEY_BRIDGE_NAME => trim(Minz_Request::param('rss_bridge_name', $this->settings->DEFAULT_BRIDGE_NAME)),
        $this->settings::KEY_LABEL_FEED => trim(Minz_Request::param('label_feed', $this->settings->DEFAULT_LABEL_FEED)),
        $this->settings::KEY_LABEL_FEED_MERGE => trim(Minz_Request::param('label_feed_merge', $this->settings->DEFAULT_LABEL_FEED_MERGE)),
        $this->settings::KEY_LIMIT => trim(Minz_Request::param('rss_bridge_limit', $this->settings->DEFAULT_LIMIT)),
        // Checkboxes do not pass through the checked state in the request, only the name.
        $this->settings::KEY_AUTO_UPDATE => is_null(Minz_Request::param('auto_update_fields', null)) == false,
      ]);
    }
  }
  
  private function getStaticDir() {
    return join_path($this->getPath(), 'static');
  }
  
  private function getConfigFileName() {
    if ($this->isSystemSettings) {
      return 'config.js';
    }
    else {
      return 'config_'.Minz_Session::param('currentUser').'.js';
    }
  }
  
  private function getConfigFilePath() {
    return join_path($this->getStaticDir(), $this->getConfigFileName());
  }
  
  private function initSettings() {
    if ($this->isSystemSettings) {
      $this->settings = new Settings($this->getSystemConfiguration());
    }
    else {
      $this->settings = new Settings($this->getUserConfiguration());
    }
  }
  
  private function applySettings($settings) {
    if ($this->isSystemSettings) {
      $this->setSystemConfiguration($settings);
    }
    else {
      $this->setUserConfiguration($settings);
    }
    
    $this->settings = new Settings($settings);
    $this->writeSettings(true);
  }
  
  private function writeSettings($override) {
    $filePath = $this->getConfigFilePath();
    
      // Check the permissions.
      if (!is_writable($this->getStaticDir()) || (file_exists($filePath) && !is_writable($filePath))) {
        Minz_Log::error("Failed to write the file: ".$filePath);
        $this->error_write = $filePath;
        return;
      }
    
    if ($override || !file_exists($filePath)) {
      // Retrieve the system settings.
      $settings = $this->settings->getSettings();
      
      // Update array to represent the string values.
      array_walk($settings, function(&$value, $key) {
        if (is_numeric($value))
          $value = "$key = $value;";
        else if(is_bool($value))
          $value = $key.' = '.($value ? 'true' : 'false').';';
        else
          $value = "$key = \"$value\";";
      });
      
      // Write array to file.
      file_put_contents($filePath, join("\n", $settings));
    }
  }
}
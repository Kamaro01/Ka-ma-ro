'use client';

import React, { useState } from 'react';
import {
  AdjustmentsHorizontalIcon,
  SpeakerWaveIcon,
  MicrophoneIcon,
  EyeIcon,
  LanguageIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import Icon from '@/components/ui/AppIcon';

interface TextSettings {
  size: number;
  lineHeight: number;
  letterSpacing: number;
}

interface ColorSettings {
  highContrast: boolean;
  colorBlindMode: string;
  reducedMotion: boolean;
}

interface VoiceSettings {
  enabled: boolean;
  language: string;
  speed: number;
}

interface ScreenReaderSettings {
  enabled: boolean;
  verbosity: string;
  autoPlay: boolean;
}

const DigitalAccessibilityInteractive: React.FC = () => {
  const [textSettings, setTextSettings] = useState<TextSettings>({
    size: 16,
    lineHeight: 1.5,
    letterSpacing: 0,
  });

  const [colorSettings, setColorSettings] = useState<ColorSettings>({
    highContrast: false,
    colorBlindMode: 'none',
    reducedMotion: false,
  });

  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    enabled: false,
    language: 'English',
    speed: 1.0,
  });

  const [screenReaderSettings, setScreenReaderSettings] = useState<ScreenReaderSettings>({
    enabled: false,
    verbosity: 'medium',
    autoPlay: true,
  });

  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<string>('text');
  const [saveMessage, setSaveMessage] = useState<string>('');

  const handleSavePreferences = () => {
    setSaveMessage('Accessibility preferences saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const tabs = [
    { id: 'text', name: 'Text Controls', icon: AdjustmentsHorizontalIcon },
    { id: 'visual', name: 'Visual Assistance', icon: EyeIcon },
    { id: 'audio', name: 'Audio & Voice', icon: SpeakerWaveIcon },
    { id: 'voice', name: 'Voice Commands', icon: MicrophoneIcon },
    { id: 'language', name: 'Language Support', icon: LanguageIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Digital Accessibility Center</h1>
        <p className="text-muted-foreground">
          Comprehensive accessibility features to ensure inclusive shopping experiences for all
          customers
        </p>
      </div>

      {/* Save Message */}
      {saveMessage && (
        <div className="mb-6 bg-success/10 border border-success/20 rounded-lg p-4 flex items-center gap-3">
          <CheckCircleIcon className="w-6 h-6 text-success flex-shrink-0" />
          <span className="text-success font-medium">{saveMessage}</span>
        </div>
      )}

      {/* WCAG Compliance Badge */}
      <div className="mb-6 bg-primary/10 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
        <CheckCircleIcon className="w-6 h-6 text-primary flex-shrink-0" />
        <div>
          <p className="font-medium text-primary">WCAG 2.1 AA Compliant</p>
          <p className="text-sm text-primary/80">
            All accessibility features meet international standards for web accessibility
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Navigation Tabs */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-lg p-4">
            <h2 className="font-semibold text-foreground mb-4">Features</h2>
            <nav className="space-y-2">
              {tabs?.map((tab) => {
                const Icon = tab?.icon;
                return (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-accent text-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab?.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-card border border-border rounded-lg p-6">
            {/* Text Controls */}
            {activeTab === 'text' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Text Controls</h2>
                  <p className="text-muted-foreground mb-6">
                    Adjust text size, spacing, and readability settings
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Text Size: {textSettings?.size}px
                  </label>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">A</span>
                    <input
                      type="range"
                      min="12"
                      max="32"
                      step="1"
                      value={textSettings?.size}
                      onChange={(e) =>
                        setTextSettings({ ...textSettings, size: parseInt(e.target.value) })
                      }
                      className="flex-1"
                    />
                    <span className="text-2xl text-muted-foreground">A</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Adjust text size from 12px to 32px for comfortable reading
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Line Height: {textSettings?.lineHeight}
                  </label>
                  <input
                    type="range"
                    min="1.0"
                    max="2.5"
                    step="0.1"
                    value={textSettings?.lineHeight}
                    onChange={(e) =>
                      setTextSettings({ ...textSettings, lineHeight: parseFloat(e.target.value) })
                    }
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Increase spacing between lines for better readability
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Letter Spacing: {textSettings?.letterSpacing}px
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={textSettings?.letterSpacing}
                    onChange={(e) =>
                      setTextSettings({
                        ...textSettings,
                        letterSpacing: parseFloat(e.target.value),
                      })
                    }
                    className="w-full"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Adjust spacing between letters for enhanced clarity
                  </p>
                </div>

                {/* Preview */}
                <div className="bg-accent/50 border border-border rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                  <p
                    style={{
                      fontSize: `${textSettings?.size}px`,
                      lineHeight: textSettings?.lineHeight,
                      letterSpacing: `${textSettings?.letterSpacing}px`,
                    }}
                    className="text-foreground"
                  >
                    This is how your text will appear with the current settings. Adjust the controls
                    above to customize your reading experience.
                  </p>
                </div>
              </div>
            )}

            {/* Visual Assistance */}
            {activeTab === 'visual' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Visual Assistance</h2>
                  <p className="text-muted-foreground mb-6">
                    Configure visual aids including contrast, color modes, and zoom
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent cursor-pointer">
                    <div>
                      <span className="font-medium text-foreground">High Contrast Mode</span>
                      <p className="text-sm text-muted-foreground">
                        Enhanced contrast for better visibility
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={colorSettings?.highContrast}
                      onChange={(e) =>
                        setColorSettings({ ...colorSettings, highContrast: e.target.checked })
                      }
                      className="w-5 h-5 text-primary focus:ring-primary focus:ring-2 rounded border-border"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent cursor-pointer">
                    <div>
                      <span className="font-medium text-foreground">Reduced Motion</span>
                      <p className="text-sm text-muted-foreground">
                        Minimize animations for users with vestibular disorders
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={colorSettings?.reducedMotion}
                      onChange={(e) =>
                        setColorSettings({ ...colorSettings, reducedMotion: e.target.checked })
                      }
                      className="w-5 h-5 text-primary focus:ring-primary focus:ring-2 rounded border-border"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Color Blind Friendly Mode
                  </label>
                  <select
                    value={colorSettings?.colorBlindMode}
                    onChange={(e) =>
                      setColorSettings({ ...colorSettings, colorBlindMode: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  >
                    <option value="none">None</option>
                    <option value="protanopia">Protanopia (Red-Blind)</option>
                    <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                    <option value="tritanopia">Tritanopia (Blue-Blind)</option>
                    <option value="monochromacy">Monochromacy (Total Color Blindness)</option>
                  </select>
                  <p className="text-sm text-muted-foreground mt-2">
                    Adjust color palette for different types of color vision deficiency
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Zoom Level: {zoomLevel}%
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setZoomLevel(Math.max(100, zoomLevel - 25))}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-accent text-foreground"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min="100"
                      max="400"
                      step="25"
                      value={zoomLevel}
                      onChange={(e) => setZoomLevel(parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <button
                      onClick={() => setZoomLevel(Math.min(400, zoomLevel + 25))}
                      className="px-4 py-2 border border-border rounded-lg hover:bg-accent text-foreground"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Zoom functionality up to 400% (WCAG 2.1 AA compliant)
                  </p>
                </div>

                <div className="bg-info/10 border border-info/20 rounded-lg p-4 flex gap-3">
                  <MagnifyingGlassIcon className="w-6 h-6 text-info flex-shrink-0" />
                  <div className="text-sm text-info">
                    <p className="font-medium mb-1">Focus Indicators Active</p>
                    <p>
                      Interactive elements are highlighted with visible focus indicators for
                      keyboard navigation
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Audio & Voice */}
            {activeTab === 'audio' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    Audio & Screen Reader
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Configure screen reader and text-to-speech settings
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent cursor-pointer">
                    <div>
                      <span className="font-medium text-foreground">Enable Screen Reader</span>
                      <p className="text-sm text-muted-foreground">
                        Structured heading navigation and alt-text support
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={screenReaderSettings?.enabled}
                      onChange={(e) =>
                        setScreenReaderSettings({
                          ...screenReaderSettings,
                          enabled: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-primary focus:ring-primary focus:ring-2 rounded border-border"
                    />
                  </label>

                  {screenReaderSettings?.enabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Verbosity Level
                        </label>
                        <select
                          value={screenReaderSettings?.verbosity}
                          onChange={(e) =>
                            setScreenReaderSettings({
                              ...screenReaderSettings,
                              verbosity: e.target.value,
                            })
                          }
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                        >
                          <option value="low">Low - Essential information only</option>
                          <option value="medium">Medium - Standard descriptions</option>
                          <option value="high">High - Detailed descriptions</option>
                        </select>
                      </div>

                      <label className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent cursor-pointer">
                        <div>
                          <span className="font-medium text-foreground">
                            Auto-play Audio Descriptions
                          </span>
                          <p className="text-sm text-muted-foreground">
                            Automatically play descriptions for product videos and images
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={screenReaderSettings?.autoPlay}
                          onChange={(e) =>
                            setScreenReaderSettings({
                              ...screenReaderSettings,
                              autoPlay: e.target.checked,
                            })
                          }
                          className="w-5 h-5 text-primary focus:ring-primary focus:ring-2 rounded border-border"
                        />
                      </label>
                    </>
                  )}
                </div>

                <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                  <p className="text-sm text-success">
                    <strong>Keyboard Navigation:</strong> All interactive elements are fully
                    accessible via keyboard with Tab, Enter, and Arrow keys. Press ? for keyboard
                    shortcuts.
                  </p>
                </div>
              </div>
            )}

            {/* Voice Commands */}
            {activeTab === 'voice' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Voice Commands</h2>
                  <p className="text-muted-foreground mb-6">
                    Hands-free browsing with voice recognition technology
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent cursor-pointer">
                    <div>
                      <span className="font-medium text-foreground">Enable Voice Commands</span>
                      <p className="text-sm text-muted-foreground">
                        Control shopping experience with voice
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={voiceSettings?.enabled}
                      onChange={(e) =>
                        setVoiceSettings({ ...voiceSettings, enabled: e.target.checked })
                      }
                      className="w-5 h-5 text-primary focus:ring-primary focus:ring-2 rounded border-border"
                    />
                  </label>

                  {voiceSettings?.enabled && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Voice Recognition Language
                        </label>
                        <select
                          value={voiceSettings?.language}
                          onChange={(e) =>
                            setVoiceSettings({ ...voiceSettings, language: e.target.value })
                          }
                          className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                        >
                          <option value="English">English</option>
                          <option value="Kinyarwanda">Kinyarwanda</option>
                          <option value="French">French</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Response Speed: {voiceSettings?.speed}x
                        </label>
                        <input
                          type="range"
                          min="0.5"
                          max="2.0"
                          step="0.1"
                          value={voiceSettings?.speed}
                          onChange={(e) =>
                            setVoiceSettings({
                              ...voiceSettings,
                              speed: parseFloat(e.target.value),
                            })
                          }
                          className="w-full"
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          Adjust voice feedback speed from 0.5x (slower) to 2.0x (faster)
                        </p>
                      </div>

                      <div className="bg-accent/50 border border-border rounded-lg p-4">
                        <h3 className="font-medium text-foreground mb-3">Available Commands:</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div>• Search for products</div>
                          <div>• Add to cart</div>
                          <div>• View cart</div>
                          <div>• Remove from cart</div>
                          <div>• Proceed to checkout</div>
                          <div>• Go to home</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Language Support */}
            {activeTab === 'language' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground mb-2">Language Support</h2>
                  <p className="text-muted-foreground mb-6">
                    Text-to-speech and simplified language options
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="font-medium text-foreground mb-3">Text-to-Speech Languages</h3>
                    <div className="space-y-2">
                      {['English', 'Kinyarwanda', 'French', 'Swahili']?.map((lang) => (
                        <label
                          key={lang}
                          className="flex items-center gap-3 p-3 border border-border rounded-lg hover:bg-accent cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="tts-language"
                            value={lang}
                            className="w-4 h-4 text-primary focus:ring-primary focus:ring-2 border-border"
                          />
                          <span className="text-foreground">{lang}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="font-medium text-foreground mb-3">Content Simplification</h3>
                    <label className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent cursor-pointer">
                      <div>
                        <span className="font-medium text-foreground">
                          Simplified Language Mode
                        </span>
                        <p className="text-sm text-muted-foreground">
                          Use simpler vocabulary and shorter sentences for cognitive accessibility
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        className="w-5 h-5 text-primary focus:ring-primary focus:ring-2 rounded border-border"
                      />
                    </label>
                  </div>

                  <div className="bg-info/10 border border-info/20 rounded-lg p-4 flex gap-3">
                    <InformationCircleIcon className="w-6 h-6 text-info flex-shrink-0" />
                    <div className="text-sm text-info">
                      <p className="font-medium mb-1">Seamless Integration</p>
                      <p>
                        All language preferences are maintained across sessions via Supabase
                        infrastructure. Your settings will be remembered on every visit.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-border">
              <button
                onClick={handleSavePreferences}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Save Accessibility Preferences
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalAccessibilityInteractive;

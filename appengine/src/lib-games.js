/**
 * @license
 * Copyright 2013 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Common support code for all games and the index.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('BlocklyGames');

goog.require('Blockly.utils.math');
goog.require('BlocklyGames.Msg');


/**
 * Lookup for names of languages.  Keys should be in ISO 639 format.
 */
BlocklyGames.LANGUAGE_NAME = {
//  'ace': 'بهسا اچيه',
//  'af': 'Afrikaans',
  'am': 'አማርኛ',
  'ar': 'العربية',
//  'az': 'Azərbaycanca',
  'be': 'беларускі',
  'be-tarask': 'Taraškievica',
  'bg': 'български език',
  'bn': 'বাংলা',
  'br': 'Brezhoneg',
  'ca': 'Català',
//  'cdo': '閩東語',
  'cs': 'Česky',
  'da': 'Dansk',
  'de': 'Deutsch',
  'el': 'Ελληνικά',
  'en': 'English',
  'eo': 'Esperanto',
  'es': 'Español',
  'eu': 'Euskara',
  'fa': 'فارسی',
  'fi': 'Suomi',
  'fo': 'Føroyskt',
  'fr': 'Français',
//  'frr': 'Frasch',
  'gl': 'Galego',
  'ha': 'Hausa',
//  'hak': '客家話',
  'he': 'עברית',
  'hi': 'हिन्दी',
  'hr': 'Hrvatski',
//  'hrx': 'Hunsrik',
  'hu': 'Magyar',
  'hy': 'հայերէն',
  'ia': 'Interlingua',
  'id': 'Bahasa Indonesia',
  'ig': 'Asụsụ Igbo',
  'is': 'Íslenska',
  'it': 'Italiano',
  'ja': '日本語',
//  'ka': 'ქართული',
  'kab': 'Taqbaylit',
//  'km': 'ភាសាខ្មែរ',
  'kn': 'ಕನ್ನಡ',
  'ko': '한국어',
//  'ksh': 'Ripoarėsch',
//  'ky': 'Кыргызча',
//  'la': 'Latine',
//  'lb': 'Lëtzebuergesch',
  'lt': 'Lietuvių',
  'lv': 'Latviešu',
//  'mg': 'Malagasy',
//  'ml': 'മലയാളം',
//  'mk': 'Македонски',
//  'mr': 'मराठी',
  'ms': 'Bahasa Melayu',
  'my': 'မြန်မာစာ',
//  'mzn': 'مازِرونی',
  'nb': 'Norsk Bokmål',
  'nl': 'Nederlands, Vlaams',
//  'oc': 'Lenga d\'òc',
//  'pa': 'पंजाबी',
  'pl': 'Polski',
  'pms': 'Piemontèis',
//  'ps': 'پښتو',
  'pt': 'Português',
  'pt-br': 'Português Brasileiro',
  'ro': 'Română',
  'ru': 'Русский',
  'sc': 'Sardu',
//  'sco': 'Scots',
//  'si': 'සිංහල',
  'sk': 'Slovenčina',
  'sl': 'Slovenščina',
  'sq': 'Shqip',
  'sr': 'Српски',
  'sr-latn': 'Srpski',
  'sv': 'Svenska',
//  'sw': 'Kishwahili',
//  'ta': 'தமிழ்',
  'th': 'ภาษาไทย',
  'ti': 'ትግርኛ',
//  'tl': 'Tagalog',
  'tr': 'Türkçe',
  'uk': 'Українська',
  'ur': 'اُردُو‬',
  'vi': 'Tiếng Việt',
  'yo': 'Èdè Yorùbá',
  'zh-hans': '简体中文',
  'zh-hant': '正體中文',
};

/**
 * List of RTL languages.
 */
BlocklyGames.LANGUAGE_RTL = ['ace', 'ar', 'fa', 'he', 'mzn', 'ps', 'ur'];

/**
 * User's language (e.g. "en").
 * @type string
 */
BlocklyGames.LANG = window['BlocklyGamesLang'];

/**
 * List of languages supported by this app.  Values should be in ISO 639 format.
 * @type !Array<string>
 */
BlocklyGames.LANGUAGES = window['BlocklyGamesLanguages'];

/**
 * Is the current language (BlocklyGames.LANG) an RTL language?
 * @type boolean
 */
BlocklyGames.IS_RTL = BlocklyGames.LANGUAGE_RTL.includes(BlocklyGames.LANG);

/**
 * Is the site being served as raw HTML files, as opposed to on App Engine.
 * @type boolean
 */
BlocklyGames.IS_HTML = /\.html$/.test(window.location.pathname);

/**
 * Report client-side errors back to the server.
 * @param {!ErrorEvent} event Error event.
 */
BlocklyGames.errorReporter = function(event) {
  try {
    //if (Math.random() > 0.5) return;
    // 3rd party script errors (likely plugins) have no useful info.
    if (!event.lineno && !event.colno) return;
    // Rate-limit the reports to once every 10 seconds.
    const now = Date.now();
    if (BlocklyGames.errorReporter.lastHit_ + 10 * 1000 > now) return;
    BlocklyGames.errorReporter.lastHit_ = now;
    const req = new XMLHttpRequest();
    // Try to use the experimental 'event.error.stack',
    // otherwise, use standard properties.
    const report = (event.error && event.error.stack) ||
        `${event.message} ${event.filename} ${event.lineno}:${event.colno}`;
    const params = "error=" + encodeURIComponent(report) +
        '&amp;url=' + encodeURIComponent(window.location);
    req.open("POST", "/errorReporter");
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.send(params);
    console.log('Error reported.');
  } catch(e) {
    // Error in error reporter.  Do NOT recursively call the error reporter.
    console.log(event.error);
  }
};
BlocklyGames.errorReporter.lastHit_ = 0;
if (!BlocklyGames.IS_HTML) {
  window.addEventListener('error', BlocklyGames.errorReporter);
}

/**
 * Extracts a parameter from the URL.
 * If the parameter is absent default_value is returned.
 * @param {string} name The name of the parameter.
 * @param {string} defaultValue Value to return if parameter not found.
 * @returns {string} The parameter value or the default value if not found.
 */
BlocklyGames.getStringParamFromUrl = function(name, defaultValue) {
  const val =
      window.location.search.match(new RegExp('[?&]' + name + '=([^&]+)'));
  return val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : defaultValue;
};

/**
 * Extracts an integer parameter from the URL.
 * If the parameter is absent or less than min_value, min_value is
 * returned.  If it is greater than max_value, max_value is returned.
 * @param {string} name The name of the parameter.
 * @param {number} minValue The minimum legal value.
 * @param {number} maxValue The maximum legal value.
 * @returns {number} A number in the range [min_value, max_value].
 */
BlocklyGames.getIntegerParamFromUrl = function(name, minValue, maxValue) {
  const val = Math.floor(Number(BlocklyGames.getStringParamFromUrl(name, 'NaN')));
  return isNaN(val) ? minValue :
      Blockly.utils.math.clamp(minValue, val, maxValue);
};

/**
 * Name of app (maze, bird, ...).
 */
BlocklyGames.NAME;

/**
 * Maximum number of levels.  Common to all apps.
 */
BlocklyGames.MAX_LEVEL = 10;

/**
 * User's level (e.g. 5).
 * @type number
 */
BlocklyGames.LEVEL =
    BlocklyGames.getIntegerParamFromUrl('level', 1, BlocklyGames.MAX_LEVEL);

/**
 * Common startup tasks for all apps.
 * @param {string} title Text for the page title.
 */
BlocklyGames.init = function(title) {
  document.title = BlocklyGames.esc(BlocklyGames.Msg['Games.name']) +
      (title && ' : ') + title;

  // Set the HTML's language and direction.
  document.dir = BlocklyGames.IS_RTL ? 'rtl' : 'ltr';
  document.head.parentElement.setAttribute('lang', BlocklyGames.LANG);

  // Populate the language selection menu.
  const languageMenu = document.getElementById('languageMenu');
  if (languageMenu) {
    // Sort languages alphabetically.
    const languages = [];
    for (const lang of BlocklyGames.LANGUAGES) {
      languages.push([BlocklyGames.LANGUAGE_NAME[lang], lang]);
    }
    const comp = function(a, b) {
      // Sort based on first argument ('English', 'Русский', '简体字', etc).
      if (a[0] > b[0]) return 1;
      if (a[0] < b[0]) return -1;
      return 0;
    };
    languages.sort(comp);
    languageMenu.options.length = 0;
    for (const [name, iso639] of languages) {
      const option = new Option(name, iso639);
      if (iso639 === BlocklyGames.LANG) {
        option.selected = true;
      }
      languageMenu.options.add(option);
    }
    if (languageMenu.options.length <= 1) {
      // No choices.  Hide the language menu.
      languageMenu.style.display = 'none';
    }
  }

  // Highlight levels that have been completed.
  for (let i = 1; i <= BlocklyGames.MAX_LEVEL; i++) {
    const link = document.getElementById('level' + i);
    const done = !!BlocklyGames.loadFromLocalStorage(BlocklyGames.NAME, i);
    if (link && done) {
      link.className += ' level_done';
    }
  }

  // Fixes viewport for small screens.
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport && screen.availWidth < 725) {
    viewport.setAttribute('content',
        'width=725, initial-scale=.35, user-scalable=no');
  }

  // Lazy-load Google Analytics.
  if (!BlocklyGames.IS_HTML) {
    setTimeout(BlocklyGames.importAnalytics3_, 1);
    setTimeout(BlocklyGames.importAnalytics4_, 1);
  }
};

/**
 * Reload with a different language.
 */
BlocklyGames.changeLanguage = function() {
  const languageMenu = document.getElementById('languageMenu');
  const newLang = encodeURIComponent(
      languageMenu.options[languageMenu.selectedIndex].value);
  let search = window.location.search;
  if (search.length <= 1) {
    search = '?lang=' + newLang;
  } else if (/[?&]lang=[^&]*/.test(search)) {
    search = search.replace(/([?&]lang=)[^&]*/, '$1' + newLang);
  } else {
    search = search.replace(/\?/, '?lang=' + newLang + '&');
  }

  window.location = window.location.protocol + '//' +
      window.location.host + window.location.pathname + search;
};

/**
 * Attempt to fetch the saved blocks for a level.
 * May be used to simply determine if a level is complete.
 * @param {string} name Name of app (maze, bird, ...).
 * @param {number} level Level (1-10).
 * @returns {string|undefined} Serialized XML, or undefined.
 */
BlocklyGames.loadFromLocalStorage = function(name, level) {
  let xml;
  try {
    xml = window.localStorage[name + level];
  } catch (e) {
    // Firefox sometimes throws a SecurityError when accessing localStorage.
    // Restarting Firefox fixes this, so it looks like a bug.
  }
  return xml;
};

/**
 * Bind a function to a button's click event.
 * On touch-enabled browsers, ontouchend is treated as equivalent to onclick.
 * @param {Element|string} el Button element or ID thereof.
 * @param {!Function} func Event handler to bind.
 */
BlocklyGames.bindClick = function(el, func) {
  if (!el) {
    throw TypeError('Element not found: ' + el);
  }
  if (typeof el === 'string') {
    el = document.getElementById(el);
  }
  el.addEventListener('click', func, true);
  function touchFunc(e) {
    // Prevent code from being executed twice on touchscreens.
    e.preventDefault();
    func(e);
  }
  el.addEventListener('touchend', touchFunc, true);
};

/**
 * Normalizes an angle to be in range [0-360]. Angles outside this range will
 * be normalized to be the equivalent angle with that range.
 * @param {number} angle Angle in degrees.
 * @returns {number} Standardized angle.
 */
BlocklyGames.normalizeAngle = function(angle) {
  angle %= 360;
  if (angle < 0) {
    angle += 360;
  }
  return angle;
};

/**
 * Escape HTML to make the text safe.
 * @param {string} text Unsafe text, possibly with HTML tags.
 * @returns {string} Safe text, with <>&'" escaped.
 */
BlocklyGames.esc = function(text) {
  return text.replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
};

/**
 * Load the Google Analytics 3.
 * Delete this in July 1, 2023.
 * @private
 */
BlocklyGames.importAnalytics3_ = function() {
  const gaName = 'GoogleAnalyticsFunction';
  window['GoogleAnalyticsObject'] = gaName;
  /**
   * Load command onto Google Analytics queue.
   * @param {...string} var_args Commands.
   */
  const gaObject = function(var_args) {
    (gaObject['q'] = gaObject['q'] || []).push(arguments);
  };
  window[gaName] = gaObject;
  gaObject['l'] = 1 * new Date();
  const script = document.createElement('script');
  script.async = 1;
  script.src = '//www.google-analytics.com/analytics.js';
  document.head.appendChild(script);

  gaObject('create', 'UA-50448074-1', 'auto');
  gaObject('send', 'pageview');
};

/**
 * Load the Google Analytics 4.
 * @private
 */
BlocklyGames.importAnalytics4_ = function() {
  const script = document.createElement('script');
  script.async = 1;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-TBYKRK7JYW';
  document.head.appendChild(script);
  window['dataLayer'] = window['dataLayer'] || [];
  function gtag(){window['dataLayer'].push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-TBYKRK7JYW');
};

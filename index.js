const consoleOutputAnsiColors = function () {
  function DOMReady (fn) {
    if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  /*  ansi_up.js
   *  author : Dru Nelson
   *  license : MIT
   *  http://github.com/drudru/ansi_up
   */
  function rgx (tmplObj) {
    let subst = [];
    for (let _i = 1; _i < arguments.length; _i++) {
      subst[_i - 1] = arguments[_i];
    }
    let regexText = tmplObj.raw[0];
    let wsrgx = /^\s+|\s+\n|\s+#[\s\S]+?\n/gm;
    let txt2 = regexText.replace(wsrgx, '');
    return new RegExp(txt2, 'm');
  }
  function AnsiUp () {
    this.VERSION = '2.0.2';
    this.ansi_colors = [
      [
        { rgb: [0, 0, 0], class_name: 'ansi-black' },
        { rgb: [187, 0, 0], class_name: 'ansi-red' },
        { rgb: [0, 187, 0], class_name: 'ansi-green' },
        { rgb: [187, 187, 0], class_name: 'ansi-yellow' },
        { rgb: [0, 0, 187], class_name: 'ansi-blue' },
        { rgb: [187, 0, 187], class_name: 'ansi-magenta' },
        { rgb: [0, 187, 187], class_name: 'ansi-cyan' },
        { rgb: [255, 255, 255], class_name: 'ansi-white' }
      ],
      [
        { rgb: [85, 85, 85], class_name: 'ansi-bright-black' },
        { rgb: [255, 85, 85], class_name: 'ansi-bright-red' },
        { rgb: [0, 255, 0], class_name: 'ansi-bright-green' },
        { rgb: [255, 255, 85], class_name: 'ansi-bright-yellow' },
        { rgb: [85, 85, 255], class_name: 'ansi-bright-blue' },
        { rgb: [255, 85, 255], class_name: 'ansi-bright-magenta' },
        { rgb: [85, 255, 255], class_name: 'ansi-bright-cyan' },
        { rgb: [255, 255, 255], class_name: 'ansi-bright-white' }
      ]
    ];
    this.htmlFormatter = {
      transform: function (fragment, instance) {
        let txt = fragment.text;
        if (txt.length === 0) {
          return txt;
        }
        if (instance._escape_for_html) {
          txt = instance.old_escape_for_html(txt);
        }
        if (!fragment.bright && fragment.fg === null && fragment.bg === null) {
          return txt;
        }
        let styles = [];
        let classes = [];
        let fg = fragment.fg;
        let bg = fragment.bg;
        if (fg === null && fragment.bright) {
          fg = instance.ansi_colors[1][7];
        }
        if (!instance._use_classes) {
          if (fg) {
            styles.push('color: rgb(' + fg.rgb.join(',') + ')');
          }
          if (bg) {
            styles.push('background-color: rgb(' + bg.rgb + ')');
          }
        } else {
          if (fg) {
            if (fg.class_name !== 'truecolor') {
              classes.push(fg.class_name + '-fg');
            } else {
              styles.push('color:rgb(' + fg.rgb.join(',') + ')');
            }
          }
          if (bg) {
            if (bg.class_name !== 'truecolor') {
              classes.push(bg.class_name + '-bg');
            } else {
              styles.push('background-color:rgb(' + bg.rgb.join(',') + ')');
            }
          }
        }
        let class_string = '';
        let style_string = '';
        if (classes.length) {
          class_string = ' class="' + classes.join(' ') + '"';
        }
        if (styles.length) {
          style_string = ' style="' + styles.join(';') + '"';
        }
        return '<span' + class_string + style_string + '>' + txt + '</span>';
      },
      compose: function (segments) {
        return segments.join('');
      }
    };
    /*
      this.textFormatter = {
        transform: function (fragment) {
          return fragment.text;
        },
        compose: function (segments) {
          return segments.join('');
        }
      };
    */
    this.setup_256_palette();
    this._use_classes = false;
    this._escape_for_html = true;
    this.bright = false;
    this.fg = this.bg = null;
    this._buffer = '';
  }
  Object.defineProperty(AnsiUp.prototype, 'use_classes', {
    get: function () {
      return this._use_classes;
    },
    set: function (arg) {
      this._use_classes = arg;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(AnsiUp.prototype, 'escape_for_html', {
    get: function () {
      return this._escape_for_html;
    },
    set: function (arg) {
      this._escape_for_html = arg;
    },
    enumerable: true,
    configurable: true
  });
  AnsiUp.prototype.setup_256_palette = function () {
    let _this = this;
    this.palette_256 = [];
    this.ansi_colors.forEach(function (palette) {
      palette.forEach(function (rec) {
        _this.palette_256.push(rec);
      });
    });
    let levels = [0, 95, 135, 175, 215, 255];
    for (let r = 0; r < 6; ++r) {
      for (let g = 0; g < 6; ++g) {
        for (let b = 0; b < 6; ++b) {
          let col = { rgb: [levels[r], levels[g], levels[b]], class_name: 'truecolor' };
          this.palette_256.push(col);
        }
      }
    }
    let grey_level = 8;
    for (let i = 0; i < 24; ++i, grey_level += 10) {
      let gry = { rgb: [grey_level, grey_level, grey_level], class_name: 'truecolor' };
      this.palette_256.push(gry);
    }
  };
  AnsiUp.prototype.old_escape_for_html = function (txt) {
    return txt.replace(/[&<>]/gm, function (str) {
      let stringMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
      };
      return stringMap[str];
    });
  };
  AnsiUp.prototype.old_linkify = function (txt) {
    return txt.replace(/(https?:\/\/[^\s]+)/gm, function (str) {
      return '<a href="' + str + '">' + str + '</a>';
    });
  };
  AnsiUp.prototype.detect_incomplete_ansi = function (txt) {
    return !(/.*?[\x40-\x7e]/.test(txt));
  };
  /*
    AnsiUp.prototype.detect_incomplete_link = function (txt) {
      let found = false;
      let i;
      for (i = txt.length - 1; i > 0; i--) {
        if (/\s|\x1B/.test(txt[i])) {
          found = true;
          break;
        }
      }
      if (!found) {
        if (/(https?:\/\/[^\s]+)/.test(txt)) {
          return 0;
        } else {
          return -1;
        }
      }
      let prefix = txt.substr(i + 1, 4);
      if (prefix.length === 0) {
        return -1;
      }
      if ('http'.indexOf(prefix) === 0) {
        return (i + 1);
      }
    };
  */
  AnsiUp.prototype.ansi_to = function (txt, formatter) {
    let pkt = this._buffer + txt;
    this._buffer = '';
    let raw_text_pkts = pkt.split(/\x1B\[/);
    if (raw_text_pkts.length === 1) {
      raw_text_pkts.push('');
    }
    this.handle_incomplete_sequences(raw_text_pkts);
    let first_chunk = this.with_state(raw_text_pkts.shift());
    let blocks = new Array(raw_text_pkts.length);
    for (let i = 0, len = raw_text_pkts.length; i < len; ++i) {
      blocks[i] = (formatter.transform(this.process_ansi(raw_text_pkts[i]), this));
    }
    if (first_chunk.text.length > 0) {
      blocks.unshift(formatter.transform(first_chunk, this));
    }
    return formatter.compose(blocks, this);
  };
  AnsiUp.prototype.ansi_to_html = function (txt) {
    return this.ansi_to(txt, this.htmlFormatter);
  };
  /*
    AnsiUp.prototype.ansi_to_text = function (txt) {
      return this.ansi_to(txt, this.textFormatter);
    };
  */
  AnsiUp.prototype.with_state = function (text) {
    return {
      bright: this.bright,
      fg: this.fg,
      bg: this.bg,
      text: text
    };
  };
  AnsiUp.prototype.handle_incomplete_sequences = function (chunks) {
    let last_chunk = chunks[chunks.length - 1];
    if ((last_chunk.length > 0) && this.detect_incomplete_ansi(last_chunk)) {
      this._buffer = '\x1B[' + last_chunk;
      chunks.pop();
      chunks.push('');
    } else {
      if (last_chunk.slice(-1) === '\x1B') {
        this._buffer = '\x1B';
        chunks.pop();
        chunks.push(last_chunk.substr(0, last_chunk.length - 1));
      }
      if (chunks.length === 2 &&
        chunks[1] === '' &&
        chunks[0].slice(-1) === '\x1B') {
        this._buffer = '\x1B';
        last_chunk = chunks.shift();
        chunks.unshift(last_chunk.substr(0, last_chunk.length - 1));
      }
    }
  };
  AnsiUp.prototype.process_ansi = function (block) {
    let _a;
    if (!this._sgr_regex) {
      this._sgr_regex = (
        _a = [`
        ^                           # beginning of line
        ([!<-?]?)             # a private-mode char (!, <, =, >, ?)
        ([d;]*)                    # any digits or semicolons
        ([ -/]?               # an intermediate modifier
        [@-~])                # the command
        ([sS]*)                   # any text following this CSI sequence
      `],
        _a.raw = [`
        ^                           # beginning of line
        ([!\\x3c-\\x3f]?)             # a private-mode char (!, <, =, >, ?)
        ([\\d;]*)                    # any digits or semicolons
        ([\\x20-\\x2f]?               # an intermediate modifier
        [\\x40-\\x7e])                # the command
        ([\\s\\S]*)                   # any text following this CSI sequence
      `],
        rgx(_a)
      );
    }
    let matches = block.match(this._sgr_regex);
    if (!matches) {
      return this.with_state(block);
    }
    let orig_txt = matches[4];
    if (matches[1] !== '' || matches[3] !== 'm') {
      return this.with_state(orig_txt);
    }
    let sgr_cmds = matches[2].split(';');
    while (sgr_cmds.length > 0) {
      let sgr_cmd_str = sgr_cmds.shift();
      let num = parseInt(sgr_cmd_str, 10);
      if (isNaN(num) || num === 0) {
        this.fg = this.bg = null;
        this.bright = false;
      } else if (num === 1) {
        this.bright = true;
      } else if (num === 22) {
        this.bright = false;
      } else if (num === 39) {
        this.fg = null;
      } else if (num === 49) {
        this.bg = null;
      } else if ((num >= 30) && (num < 38)) {
        let bidx = this.bright ? 1 : 0;
        this.fg = this.ansi_colors[bidx][(num - 30)];
      } else if ((num >= 90) && (num < 98)) {
        this.fg = this.ansi_colors[1][(num - 90)];
      } else if ((num >= 40) && (num < 48)) {
        this.bg = this.ansi_colors[0][(num - 40)];
      } else if ((num >= 100) && (num < 108)) {
        this.bg = this.ansi_colors[1][(num - 100)];
      } else if (num === 38 || num === 48) {
        if (sgr_cmds.length > 0) {
          let is_foreground = num === 38;
          let mode_cmd = sgr_cmds.shift();
          if (mode_cmd === '5' && sgr_cmds.length > 0) {
            let palette_index = parseInt(sgr_cmds.shift(), 10);
            if (palette_index >= 0 && palette_index <= 255) {
              if (is_foreground) {
                this.fg = this.palette_256[palette_index];
              } else {
                this.bg = this.palette_256[palette_index];
              }
            }
          }
          if (mode_cmd === '2' && sgr_cmds.length > 2) {
            let r = parseInt(sgr_cmds.shift(), 10);
            let g = parseInt(sgr_cmds.shift(), 10);
            let b = parseInt(sgr_cmds.shift(), 10);
            if (
              (r >= 0 && r <= 255) &&
              (g >= 0 && g <= 255) &&
              (b >= 0 && b <= 255)
            ) {
              let c = {
                rgb: [r, g, b],
                class_name: 'truecolor'
              };
              if (is_foreground) {
                this.fg = c;
              } else {
                this.bg = c;
              }
            }
          }
        }
      }
    }
    return this.with_state(orig_txt);
  };

  function domPreperation (element) {
    element.style.background = '#000';
    element.style.color = '#B6B6B6';

    function insertAfter (newNode, referenceNode) {
      referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }

    const links = document.querySelectorAll('.console-output a');
    links.forEach(function (link) {
      const markdown = '[0m[1m[[32m' + link.innerText + '[0m[1m]([0m[32m' + link.href + '[0m[1m)[0m';
      const textNode = document.createTextNode(markdown);
      insertAfter(textNode, link);
      link.remove();
    });
  }

  DOMReady(function () {
    const element = document.querySelector('.console-output');
    if (element) {
      domPreperation(element);

      // init ansi colors
      let ansiUp = new AnsiUp;
      let entities = {
        'amp': '&',
        'apos': '\'',
        '#x27': '\'',
        '#x2F': '/',
        '#39': '\'',
        '#47': '/',
        'lt': '<',
        'gt': '>',
        'nbsp': ' ',
        'quot': '"'
      };
      let decodeHTMLEntities = function (text) {
        return text.replace(/&([^;]+);/gm, function (match, entity) {
          return entities[entity] || match;
        });
      };
      let colorizeFn = function () {
        element.innerHTML = decodeHTMLEntities(ansiUp.ansi_to_html(element.innerHTML));
      };

      colorizeFn();
      // create prototype.js global ajax handle responder
      window.Ajax.Responders.register({
        onComplete: function (req, res) {
          if (req.body.indexOf('start=') != -1 && res.status == 200 && res.responseText != '') {
            colorizeFn();
          }
        }
      });
    }
  });
};

consoleOutputAnsiColors();

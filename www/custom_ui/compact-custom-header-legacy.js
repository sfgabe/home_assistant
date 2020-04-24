(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CchConditionsEditor = exports.CchExceptionEditor = exports.CchConfigEditor = exports.CompactCustomHeaderEditor = void 0;

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const LitElement = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitElement.prototype.html;

const fireEvent = (node, type, detail, options) => {
  options = options || {};
  detail = detail === null || detail === undefined ? {} : detail;
  const event = new Event(type, {
    bubbles: options.bubbles === undefined ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === undefined ? true : options.composed
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};

const buttonOptions = ["show", "hide", "clock", "overflow"];
const overflowOptions = ["show", "hide", "clock"];
const defaultConfig = {
  header: true,
  menu: "show",
  notifications: "show",
  voice: "show",
  options: "show",
  clock_format: 12,
  clock_am_pm: true,
  clock_date: false,
  disable: false,
  main_config: false,
  chevrons: false,
  redirect: true,
  hide_tabs: [],
  show_tabs: [],
  kiosk_mode: false,
  sidebar_swipe: true,
  sidebar_closed: false
};

class CompactCustomHeaderEditor extends LitElement {
  setConfig(config) {
    this._config = config;
    this.requestUpdate();
  }

  static get properties() {
    return {
      _config: {}
    };
  }

  firstUpdated() {
    this.parentElement.parentElement.querySelector("hui-card-preview").style.display = "none";
    this.parentElement.parentElement.parentElement.parentElement.style.maxWidth = "650px";
  }

  render() {
    const mwc_button = customElements.get("mwc-button") ? true : false;
    const clear_cache_button = mwc_button ? html`
          <mwc-button
            style="margin-left:-15px"
            class="toggle-button"
            @click="${localStorage.removeItem("cchCache")}"
            >Clear CCH Cache</mwc-button
          >
        ` : html`
          <paper-button
            class="toggle-button"
            @click="${localStorage.removeItem("cchCache")}"
            >Clear CCH Cache</paper-button
          >
        `;
    return html`
      ${this.renderStyle()}
      <cch-config-editor
        .defaultConfig="${defaultConfig}"
        .config="${this._config}"
        @cch-config-changed="${this._configChanged}"
      >
      </cch-config-editor>
      <h3>Exceptions:</h3>
      ${this._config.exceptions ? this._config.exceptions.map((exception, index) => {
      return html`
              <cch-exception-editor
                .config="${this._config}"
                .exception="${exception}"
                .index="${index}"
                @cch-exception-changed="${this._exceptionChanged}"
                @cch-exception-delete="${this._exceptionDelete}"
              >
              </cch-exception-editor>
            `;
    }) : ""}
      <br />
      ${mwc_button ? html`
            <mwc-button raised @click="${this._addException}"
              >Add Exception
            </mwc-button>
          ` : html`
            <paper-button raised @click="${this._addException}"
              >Add Exception
            </paper-button>
          `}
      <br />
      <br />
      <hr />
      <h3>Current User:</h3>
      ${this.hass.user.name}
      <br />
      <h3>Current User Agent:</h3>
      ${navigator.userAgent}
      <br />
      ${!this.exception ? html`
            <br />
            ${clear_cache_button}
          ` : ""}
    `;
  }

  _addException() {
    let newExceptions;

    if (this._config.exceptions) {
      newExceptions = this._config.exceptions.slice(0);
      newExceptions.push({
        conditions: {},
        config: {}
      });
    } else {
      newExceptions = [{
        conditions: {},
        config: {}
      }];
    }

    this._config = _objectSpread({}, this._config, {
      exceptions: newExceptions
    });
    fireEvent(this, "config-changed", {
      config: this._config
    });
  }

  _configChanged(ev) {
    if (!this._config) {
      return;
    }

    this._config = _objectSpread({}, this._config, ev.detail.config);
    fireEvent(this, "config-changed", {
      config: this._config
    });
  }

  _exceptionChanged(ev) {
    if (!this._config) {
      return;
    }

    const target = ev.target.index;

    const newExceptions = this._config.exceptions.slice(0);

    newExceptions[target] = ev.detail.exception;
    this._config = _objectSpread({}, this._config, {
      exceptions: newExceptions
    });
    fireEvent(this, "config-changed", {
      config: this._config
    });
  }

  _exceptionDelete(ev) {
    if (!this._config) {
      return;
    }

    const target = ev.target;

    const newExceptions = this._config.exceptions.slice(0);

    newExceptions.splice(target.index, 1);
    this._config = _objectSpread({}, this._config, {
      exceptions: newExceptions
    });
    fireEvent(this, "config-changed", {
      config: this._config
    });
    this.requestUpdate();
  }

  renderStyle() {
    return html`
      <style>
        h3,
        h4 {
          margin-bottom: 0;
          text-decoration: underline;
        }
        paper-button {
          margin: 0;
          background-color: var(--primary-color);
          color: var(--text-primary-color, #fff);
        }
        .toggle-button {
          margin: 4px;
          background-color: transparent;
          color: var(--primary-color);
        }
        .user_agent {
          display: block;
          margin-left: auto;
          margin-right: auto;
          padding: 5px;
          border: 0;
          resize: none;
          width: 100%;
        }
      </style>
    `;
  }

}

exports.CompactCustomHeaderEditor = CompactCustomHeaderEditor;
customElements.define("compact-custom-header-editor", CompactCustomHeaderEditor);

class CchConfigEditor extends LitElement {
  static get properties() {
    return {
      defaultConfig: {},
      config: {},
      exception: {}
    };
  }

  get _hide_tabs() {
    return this.config.hide_tabs || this.defaultConfig.hide_tabs || "";
  }

  get _show_tabs() {
    return this.config.show_tabs || this.defaultConfig.show_tabs || "";
  }

  get _clock() {
    return this._menu == "clock" || this._voice == "clock" || this._notifications == "clock" || this._options == "clock";
  }

  get _clock_format() {
    return this.config.clock_format || this.defaultConfig.clock_format;
  }

  get _clock_am_pm() {
    return this.config.clock_am_pm !== undefined ? this.config.clock_am_pm : this.defaultConfig.clock_am_pm;
  }

  get _clock_date() {
    return this.config.clock_date !== undefined ? this.config.clock_date : this.defaultConfig.clock_date;
  }

  get _main_config() {
    return this.config.main_config !== undefined ? this.config.main_config : this.defaultConfig.main_config;
  }

  get _disable() {
    return this.config.disable !== undefined ? this.config.disable : this.defaultConfig.disable;
  }

  get _header() {
    return this.config.header !== undefined ? this.config.header : this.defaultConfig.header;
  }

  get _chevrons() {
    return this.config.chevrons !== undefined ? this.config.chevrons : this.defaultConfig.chevrons;
  }

  get _redirect() {
    return this.config.redirect !== undefined ? this.config.redirect : this.defaultConfig.redirect;
  }

  get _kiosk_mode() {
    return this.config.kiosk_mode !== undefined ? this.config.kiosk_mode : this.defaultConfig.kiosk_mode;
  }

  get _sidebar_closed() {
    return this.config.sidebar_closed !== undefined ? this.config.sidebar_closed : this.defaultConfig.sidebar_closed;
  }

  get _sidebar_swipe() {
    return this.config.sidebar_swipe !== undefined ? this.config.sidebar_swipe : this.defaultConfig.sidebar_swipe;
  }

  get _menu() {
    return this.config.menu || this.defaultConfig.menu;
  }

  get _voice() {
    return this.config.voice !== undefined ? this.config.voice : this.defaultConfig.voice;
  }

  get _notifications() {
    return this.config.notifications !== undefined ? this.config.notifications : this.defaultConfig.notifications;
  }

  get _options() {
    return this.config.options !== undefined ? this.config.options : this.defaultConfig.options;
  }

  render() {
    this.exception = this.exception !== undefined && this.exception !== false;
    return html`
      ${!this.exception ? html`
            <div class="warning">
              <iron-icon icon="hass:alert"></iron-icon>
              Hiding the header or options button will remove your ability to
              edit from the UI.
            </div>
          ` : ""}
      ${!this.exception && !this._main_config ? html`
            <div class="alert">
              <iron-icon icon="hass:alert"></iron-icon>
              This card is not the main configuration card. Edits made here will
              not have an effect.
            </div>
          ` : ""}
      ${this.renderStyle()}
      <div class="side-by-side">
        ${!this.exception ? html`
              <paper-toggle-button
                ?checked="${this._main_config !== false}"
                .configValue="${"main_config"}"
                @change="${this._valueChanged}"
                title="Enable this on your first Lovelace view."
              >
                Main Config
              </paper-toggle-button>
            ` : ""}
        <paper-toggle-button
          class="${this.exception && this.config.disable === undefined ? "inherited" : ""}"
          ?checked="${this._disable !== false}"
          .configValue="${"disable"}"
          @change="${this._valueChanged}"
          title="Completely disable CCH. Useful for exceptions."
        >
          Disable CCH
        </paper-toggle-button>
        <paper-toggle-button
          class="${this.exception && this.config.header === undefined ? "inherited" : ""}"
          ?checked="${this._header !== false}"
          .configValue="${"header"}"
          @change="${this._valueChanged}"
          title="Hides the header completely."
        >
          Display Header
        </paper-toggle-button>
        <paper-toggle-button
          class="${this.exception && this.config.chevrons === undefined ? "inherited" : ""}"
          ?checked="${this._chevrons !== false}"
          .configValue="${"chevrons"}"
          @change="${this._valueChanged}"
          title="Toggles visibility of view scrolling arrows in header."
        >
          Display Tab Chevrons
        </paper-toggle-button>
        <paper-toggle-button
          class="${this.exception && this.config.redirect === undefined ? "inherited" : ""}"
          ?checked="${this._redirect !== false}"
          .configValue="${"redirect"}"
          @change="${this._valueChanged}"
          title="Toggles the automatic redirect away from hidden tabs."
        >
          Hidden Tab Redirect
        </paper-toggle-button>
        <paper-toggle-button
          class="${this.exception && this.config.kiosk_mode === undefined ? "inherited" : ""}"
          ?checked="${this._kiosk_mode !== false}"
          .configValue="${"kiosk_mode"}"
          @change="${this._valueChanged}"
          title="Hide the header, close the sidebar, and disable sidebar swipe."
        >
          Kiosk Mode
        </paper-toggle-button>
        <paper-toggle-button
          class="${this.exception && this.config.sidebar_closed === undefined ? "inherited" : ""}"
          ?checked="${this._sidebar_closed !== false || this._kiosk_mode !== false}"
          .configValue="${"sidebar_closed"}"
          @change="${this._valueChanged}"
          title="Closes the sidebar if open on load."
        >
          Close Sidebar
        </paper-toggle-button>
        <paper-toggle-button
          class="${this.exception && this.config.sidebar_swipe === undefined ? "inherited" : ""}"
          ?checked="${this._sidebar_swipe !== false && this._kiosk_mode == false}"
          .configValue="${"sidebar_swipe"}"
          @change="${this._valueChanged}"
          title="Toggles swipe to open sidebar on mobile devices."
        >
          Swipe Open Sidebar
        </paper-toggle-button>
      </div>

      <h4>Button Visibility:</h4>
      <div class="buttons side-by-side">
        <div
          class="${this.exception && this.config.menu === undefined ? "inherited" : ""}"
        >
          <iron-icon icon="hass:menu"></iron-icon>
          <paper-dropdown-menu
            @value-changed="${this._valueChanged}"
            label="Menu Button:"
            .configValue="${"menu"}"
          >
            <paper-listbox
              slot="dropdown-content"
              .selected="${buttonOptions.indexOf(this._menu)}"
            >
              ${buttonOptions.map(option => {
      return html`
                  <paper-item>${option}</paper-item>
                `;
    })}
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
        <div
          class="${this.exception && this.config.notifications === undefined ? "inherited" : ""}"
        >
          <iron-icon icon="hass:bell"></iron-icon>
          <paper-dropdown-menu
            @value-changed="${this._valueChanged}"
            label="Notifications Button:"
            .configValue="${"notifications"}"
          >
            <paper-listbox
              slot="dropdown-content"
              .selected="${buttonOptions.indexOf(this._notifications)}"
            >
              ${buttonOptions.map(option => {
      return html`
                  <paper-item>${option}</paper-item>
                `;
    })}
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
        <div
          class="${this.exception && this.config.voice === undefined ? "inherited" : ""}"
        >
          <iron-icon icon="hass:microphone"></iron-icon>
          <paper-dropdown-menu
            @value-changed="${this._valueChanged}"
            label="Voice Button:"
            .configValue="${"voice"}"
          >
            <paper-listbox
              slot="dropdown-content"
              .selected="${buttonOptions.indexOf(this._voice)}"
            >
              ${buttonOptions.map(option => {
      return html`
                  <paper-item>${option}</paper-item>
                `;
    })}
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
        <div
          class="${this.exception && this.config.options === undefined ? "inherited" : ""}"
        >
          <iron-icon icon="hass:dots-vertical"></iron-icon>
          <paper-dropdown-menu
            @value-changed="${this._valueChanged}"
            label="Options Button:"
            .configValue="${"options"}"
          >
            <paper-listbox
              slot="dropdown-content"
              .selected="${overflowOptions.indexOf(this._options)}"
            >
              ${overflowOptions.map(option => {
      return html`
                  <paper-item>${option}</paper-item>
                `;
    })}
            </paper-listbox>
          </paper-dropdown-menu>
        </div>
      </div>
      ${this._clock ? html`
            <h4>Clock Options:</h4>
            <div class="side-by-side">
              <paper-dropdown-menu
                class="${this.exception && this.config.clock_format === undefined ? "inherited" : ""}"
                label="Clock format"
                @value-changed="${this._valueChanged}"
                .configValue="${"clock_format"}"
              >
                <paper-listbox
                  slot="dropdown-content"
                  .selected="${this._clock_format === "24" ? 1 : 0}"
                >
                  <paper-item>12</paper-item>
                  <paper-item>24</paper-item>
                </paper-listbox>
              </paper-dropdown-menu>
              <div class="side-by-side">
              <paper-toggle-button
                class="${this.exception && this.config.clock_am_pm === undefined ? "inherited" : ""}"
                ?checked="${this._clock_am_pm !== false}"
                .configValue="${"clock_am_pm"}"
                @change="${this._valueChanged}"
              >
                AM / PM</paper-toggle-button
              >
              <paper-toggle-button
                class="${this.exception && this.config.clock_date === undefined ? "inherited" : ""}"
                ?checked="${this._clock_date !== false}"
                .configValue="${"clock_date"}"
                @change="${this._valueChanged}"
              >
                Date</paper-toggle-button
              >
              </div>
            </div>
          ` : ""}
      <h4>Tab Visibility:</h4>
      <paper-dropdown-menu id="tabs" @value-changed="${this._tabVisibility}">
        <paper-listbox
          slot="dropdown-content"
          .selected="${this._show_tabs.length > 0 ? "1" : "0"}"
        >
          <paper-item>Hide Tabs</paper-item>
          <paper-item>Show Tabs</paper-item>
        </paper-listbox>
      </paper-dropdown-menu>
      <div
        id="show"
        style="display:${this._show_tabs.length > 0 ? "initial" : "none"}"
      >
        <paper-input
          class="${this.exception && this.config.show_tabs === undefined ? "inherited" : ""}"
          label="Comma-separated list of tab numbers to show:"
          .value="${this._show_tabs}"
          .configValue="${"show_tabs"}"
          @value-changed="${this._valueChanged}"
        >
        </paper-input>
      </div>
      <div
        id="hide"
        style="display:${this._show_tabs.length > 0 ? "none" : "initial"}"
      >
        <paper-input
          class="${this.exception && this.config.hide_tabs === undefined ? "inherited" : ""}"
          label="Comma-separated list of tab numbers to hide:"
          .value="${this._hide_tabs}"
          .configValue="${"hide_tabs"}"
          @value-changed="${this._valueChanged}"
        >
        </paper-input>
      </div>
    `;
  }

  _tabVisibility() {
    let show = this.shadowRoot.querySelector('[id="show"]');
    let hide = this.shadowRoot.querySelector('[id="hide"]');

    if (this.shadowRoot.querySelector('[id="tabs"]').value == "Hide Tabs") {
      show.style.display = "none";
      hide.style.display = "initial";
    } else {
      hide.style.display = "none";
      show.style.display = "initial";
    }
  }

  _valueChanged(ev) {
    if (!this.config) {
      return;
    }

    const target = ev.target;

    if (this[`_${target.configValue}`] === target.value) {
      return;
    }

    if (target.configValue) {
      if (target.value === "") {
        delete this.config[target.configValue];
      } else {
        this.config = _objectSpread({}, this.config, {
          [target.configValue]: target.checked !== undefined ? target.checked : target.value
        });
      }
    }

    fireEvent(this, "cch-config-changed", {
      config: this.config
    });
  }

  renderStyle() {
    return html`
      <style>
        h3,
        h4 {
          margin-bottom: 0;
          text-decoration: underline;
        }
        paper-toggle-button {
          padding-top: 16px;
        }
        iron-icon {
          padding-right: 5px;
        }
        iron-input {
          max-width: 115px;
        }
        .inherited {
          opacity: 0.4;
        }
        .inherited:hover {
          opacity: 1;
        }
        .side-by-side {
          display: flex;
          flex-wrap: wrap;
        }
        .side-by-side > * {
          flex: 1;
          padding-right: 4px;
          flex-basis: 33%;
        }
        .buttons > div {
          display: flex;
          align-items: center;
        }
        .buttons > div paper-dropdown-menu {
          flex-grow: 1;
        }
        .buttons > div iron-icon {
          padding-right: 15px;
          padding-top: 20px;
          margin-left: -3px;
        }
        .buttons > div:nth-of-type(2n) iron-icon {
          padding-left: 20px;
        }
        .warning {
          background-color: #455a64;
          padding: 10px;
          color: #ffcd4c;
          border-radius: 5px;
        }
        .alert {
          margin-top: 5px;
          background-color: #eb5f59;
          padding: 10px;
          color: #fff;
          border-radius: 5px;
        }
      </style>
    `;
  }

}

exports.CchConfigEditor = CchConfigEditor;
customElements.define("cch-config-editor", CchConfigEditor);

class CchExceptionEditor extends LitElement {
  static get properties() {
    return {
      config: {},
      exception: {},
      _closed: {}
    };
  }

  constructor() {
    super();
    this._closed = true;
  }

  render() {
    if (!this.exception) {
      return html``;
    }

    return html`
      ${this.renderStyle()}
      <custom-style>
        <style is="custom-style">
          .card-header {
            margin-top: -5px;
            @apply --paper-font-headline;
          }
          .card-header paper-icon-button {
            margin-top: -5px;
            float: right;
          }
        </style>
      </custom-style>
      <paper-card ?closed=${this._closed}>
        <div class="card-content">
          <div class="card-header">
            ${Object.values(this.exception.conditions).join(", ") || "New Exception"}
            <paper-icon-button
              icon="${this._closed ? "mdi:chevron-down" : "mdi:chevron-up"}"
              @click="${this._toggleCard}"
            >
            </paper-icon-button>
            <paper-icon-button
              ?hidden=${this._closed}
              icon="mdi:delete"
              @click="${this._deleteException}"
            >
            </paper-icon-button>
          </div>
          <h4>Conditions</h4>
          <cch-conditions-editor
            .conditions="${this.exception.conditions}"
            @cch-conditions-changed="${this._conditionsChanged}"
          >
          </cch-conditions-editor>
          <h4>Config</h4>
          <cch-config-editor
            exception
            .defaultConfig="${_objectSpread({}, defaultConfig, this.config)}"
            .config="${this.exception.config}"
            @cch-config-changed="${this._configChanged}"
          >
          </cch-config-editor>
        </div>
      </paper-card>
    `;
  }

  renderStyle() {
    return html`
      <style>
        [closed] {
          overflow: hidden;
          height: 52px;
        }
        paper-card {
          margin-top: 10px;
          width: 100%;
          transition: all 0.5s ease;
        }
      </style>
    `;
  }

  _toggleCard() {
    this._closed = !this._closed;
    fireEvent(this, "iron-resize");
  }

  _deleteException() {
    fireEvent(this, "cch-exception-delete");
  }

  _conditionsChanged(ev) {
    if (!this.exception) {
      return;
    }

    const newException = _objectSpread({}, this.exception, {
      conditions: ev.detail.conditions
    });

    fireEvent(this, "cch-exception-changed", {
      exception: newException
    });
  }

  _configChanged(ev) {
    ev.stopPropagation();

    if (!this.exception) {
      return;
    }

    const newException = _objectSpread({}, this.exception, {
      config: ev.detail.config
    });

    fireEvent(this, "cch-exception-changed", {
      exception: newException
    });
  }

}

exports.CchExceptionEditor = CchExceptionEditor;
customElements.define("cch-exception-editor", CchExceptionEditor);

class CchConditionsEditor extends LitElement {
  static get properties() {
    return {
      conditions: {}
    };
  }

  get _user() {
    return this.conditions.user || "";
  }

  get _user_agent() {
    return this.conditions.user_agent || "";
  }

  get _media_query() {
    return this.conditions.media_query || "";
  }

  render() {
    if (!this.conditions) {
      return html``;
    }

    return html`
      <paper-input
        label="User"
        .value="${this._user}"
        .configValue="${"user"}"
        @value-changed="${this._valueChanged}"
      >
      </paper-input>
      <paper-input
        label="User agent"
        .value="${this._user_agent}"
        .configValue="${"user_agent"}"
        @value-changed="${this._valueChanged}"
      >
      </paper-input>
      <paper-input
        label="Media query"
        .value="${this._media_query}"
        .configValue="${"media_query"}"
        @value-changed="${this._valueChanged}"
      >
      </paper-input>
    `;
  }

  _valueChanged(ev) {
    if (!this.conditions) {
      return;
    }

    const target = ev.target;

    if (this[`_${target.configValue}`] === target.value) {
      return;
    }

    if (target.configValue) {
      if (target.value === "") {
        delete this.conditions[target.configValue];
      } else {
        this.conditions = _objectSpread({}, this.conditions, {
          [target.configValue]: target.value
        });
      }
    }

    fireEvent(this, "cch-conditions-changed", {
      conditions: this.conditions
    });
  }

}

exports.CchConditionsEditor = CchConditionsEditor;
customElements.define("cch-conditions-editor", CchConditionsEditor);


},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultConfig = exports.fireEvent = exports.html = exports.LitElement = void 0;

require("./compact-custom-header-editor.js");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const LitElement = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
exports.LitElement = LitElement;
const html = LitElement.prototype.html;
exports.html = html;

const fireEvent = (node, type, detail, options) => {
  options = options || {};
  detail = detail === null || detail === undefined ? {} : detail;
  const event = new Event(type, {
    bubbles: options.bubbles === undefined ? true : options.bubbles,
    cancelable: Boolean(options.cancelable),
    composed: options.composed === undefined ? true : options.composed
  });
  event.detail = detail;
  node.dispatchEvent(event);
  return event;
};

exports.fireEvent = fireEvent;
const defaultConfig = {
  header: true,
  menu: "show",
  notifications: "show",
  voice: "show",
  options: "show",
  clock_format: 12,
  clock_am_pm: true,
  clock_date: false,
  date_locale: false,
  disable: false,
  main_config: false,
  chevrons: false,
  redirect: true,
  background: "",
  hide_tabs: [],
  show_tabs: [],
  kiosk_mode: false,
  sidebar_swipe: true,
  sidebar_closed: false,
  tab_color: {},
  button_color: {}
};
exports.defaultConfig = defaultConfig;

if (!customElements.get("compact-custom-header")) {
  class CompactCustomHeader extends LitElement {
    static get properties() {
      return {
        config: {},
        hass: {},
        editMode: {},
        showUa: {}
      };
    }

    constructor() {
      super();
      this.firstRun = true;
      this.editMode = false;
    }

    static getConfigElement() {
      return _asyncToGenerator(function* () {
        return document.createElement("compact-custom-header-editor");
      })();
    }

    static getStubConfig() {
      return {};
    }

    setConfig(config) {
      this.config = config;
    }

    updated() {
      if (this.config && this.hass && this.firstRun) {
        this.buildConfig();
      }
    }

    render() {
      if (!this.editMode) {
        return html``;
      }

      return html`
        ${this.renderStyle()}
        <ha-card>
          <svg viewBox="0 0 24 24">
            <path
              d="M12,7L17,12H14V16H10V12H7L12,7M19,
                      21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,
                      3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,
                      21M19,19V5H5V19H19Z"
            ></path>
          </svg>
          <h2>Compact Custom Header</h2>
        </ha-card>
      `;
    }

    renderStyle() {
      return html`
        <style>
          [hidden] {
            display: none;
          }
          h2 {
            margin: auto;
            padding: 20px;
            background-color: var(--primary-color);
            color: var(--text-primary-color);
          }
          svg {
            float: left;
            height: 30px;
            padding: 15px 5px 15px 15px;
            fill: var(--text-primary-color);
          }
          .user_agent {
            display: block;
            margin-left: auto;
            margin-right: auto;
            padding: 5px;
            border: 0;
            resize: none;
            width: 100%;
          }
        </style>
      `;
    }

    buildConfig() {
      if (window.location.href.includes("clear_cch_cache")) {
        localStorage.removeItem("cchCache");
        window.location.replace(window.location.href.replace("?clear_cch_cache", ""));
      }

      if (this.firstRun) {
        this.firstRun = false;
        this.userVars = {
          user: this.hass.user.name,
          user_agent: navigator.userAgent
        };
      }

      if (this.config.main_config) {
        let cache = this.config ? Object.assign({}, this.config) : null;
        delete cache.main_config;
        localStorage.setItem("cchCache", JSON.stringify(cache));
      } else if (localStorage.getItem("cchCache")) {
        this.config = JSON.parse(localStorage.getItem("cchCache"));
      }

      let exceptionConfig = {};
      let highestMatch = 0;

      if (this.config.exceptions) {
        this.config.exceptions.forEach(exception => {
          const matches = this.countMatches(exception.conditions);

          if (matches > highestMatch) {
            highestMatch = matches;
            exceptionConfig = exception.config;
          }
        });
      }

      this.cchConfig = _objectSpread({}, defaultConfig, this.config, exceptionConfig);
      this.run();
    }

    countMatches(conditions) {
      let count = 0;

      for (const condition in conditions) {
        if (this.userVars[condition] == conditions[condition] || condition == "user_agent" && this.userVars[condition].includes(conditions[condition]) || condition == "media_query" && window.matchMedia(conditions[condition]).matches) {
          count++;
        } else {
          return 0;
        }
      }

      return count;
    }

    getCardSize() {
      return 0;
    }

    run() {
      const root = this.rootElement;
      const header = root.querySelector("app-header");
      const buttons = this.getButtonElements(root);
      const tabContainer = root.querySelector("paper-tabs");
      const tabs = tabContainer ? Array.from(tabContainer.querySelectorAll("paper-tab")) : [];
      const view = root.querySelector("ha-app-layout").querySelector('[id="view"]');
      this.editMode = root.querySelector("app-toolbar").className == "edit-mode";
      let hidden_tabs;
      if (!this.editMode) this.hideCard();

      if (this.editMode && !this.cchConfig.disable) {
        this.removeStyles(tabContainer, header, view, root, tabs);
        if (buttons.options) this.insertEditMenu(buttons.options, tabs);
      } else if (!this.cchConfig.disable && !window.location.href.includes("disable_cch")) {
        this.styleButtons(buttons, tabs, root);
        this.styleHeader(root, tabContainer, header, view, tabs);

        if (this.cchConfig.hide_tabs && tabContainer) {
          hidden_tabs = this.hideTabs(tabContainer, tabs);
        }

        this.restoreTabs(tabs, hidden_tabs);
        this.defaultTab(tabs, tabContainer);

        for (const button in buttons) {
          if (this.cchConfig[button] == "clock") {
            this.insertClock(buttons, buttons[button].querySelector("paper-icon-button") ? buttons[button] : buttons[button].shadowRoot);
          }
        }

        const conditionals = this.cchConfig.conditional_styles;

        const monitorNotifications = () => {
          for (const key in conditionals) {
            if (conditionals[key].entity == "notifications") return true;
          }

          return false;
        };

        if (conditionals && !this.editMode) {
          this.conditionalStyling(header, buttons, tabs, root);

          if (monitorNotifications) {
            this.notifMonitor(header, buttons, tabs, root);
          }

          this.hass.connection.socket.addEventListener("message", event => {
            if (root.querySelector("app-toolbar").className != "edit-mode") {
              this.conditionalStyling(header, buttons, tabs, root);
            }
          });
        }

        if (this.cchConfig.swipe) {
          this.swipeNavigation(root, tabs, tabContainer, view);
        }

        this.sidebarMod(buttons);
        if (!this.editMode) this.tabContainerMargin(buttons, tabContainer);
        fireEvent(this, "iron-resize");
      }
    }

    tabContainerMargin(buttons, tabContainer) {
      let marginRight = 0;
      let marginLeft = 15;

      for (const button in buttons) {
        if (this.cchConfig[button] == "show" && buttons[button].style.display !== "none") {
          if (button == "menu") {
            marginLeft += 45;
          } else {
            marginRight += 45;
          }
        } else if (this.cchConfig[button] == "clock" && buttons[button].style.display !== "none") {
          const clockWidth = this.cchConfig.clock_format == 12 && this.cchConfig.clock_am_pm || this.cchConfig.clock_date ? 90 : 80;

          if (button == "menu") {
            marginLeft += clockWidth + 15;
          } else {
            marginRight += clockWidth;
          }
        }
      }

      if (tabContainer) {
        tabContainer.style.marginRight = marginRight + "px";
        tabContainer.style.marginLeft = marginLeft + "px";
      }
    }

    get rootElement() {
      try {
        let panelResolver = document.querySelector("home-assistant").shadowRoot.querySelector("home-assistant-main").shadowRoot.querySelector("app-drawer-layout partial-panel-resolver");

        if (panelResolver.shadowRoot) {
          return panelResolver.shadowRoot.querySelector("ha-panel-lovelace").shadowRoot.querySelector("hui-root").shadowRoot;
        } else {
          return document.querySelector("home-assistant").shadowRoot.querySelector("home-assistant-main").shadowRoot.querySelector("ha-panel-lovelace").shadowRoot.querySelector("hui-root").shadowRoot;
        }
      } catch (e) {
        console.log("Can't find 'hui-root', going to walk the DOM to find it.");
      }

      this.recursiveWalk(document, "HUI-ROOT", node => {
        return node.nodeName == "HUI-ROOT" ? node.shadowRoot : null;
      });
    }

    insertEditMenu(optionsBtn, tabs) {
      if (this.cchConfig.hide_tabs) {
        let show_tabs = document.createElement("paper-item");
        show_tabs.setAttribute("id", "show_tabs");
        show_tabs.addEventListener("click", () => {
          for (let i = 0; i < tabs.length; i++) {
            tabs[i].style.removeProperty("display");
          }
        });
        show_tabs.innerHTML = "Show all tabs";
        this.insertMenuItem(optionsBtn.querySelector("paper-listbox"), show_tabs);
      }
    }

    getButtonElements(root) {
      const buttons = {};
      buttons.options = root.querySelector("paper-menu-button");

      if (!this.editMode) {
        buttons.menu = root.querySelector("ha-menu-button");
        buttons.voice = root.querySelector("ha-start-voice-button");
        buttons.notifications = root.querySelector("hui-notifications-button");
      }

      return buttons;
    }

    removeStyles(tabContainer, header, view, root, tabs) {
      let header_colors = root.querySelector('[id="cch_header_colors"]');

      if (tabContainer) {
        tabContainer.style.marginLeft = "";
        tabContainer.style.marginRight = "";
      }

      header.style.background = null;
      view.style.marginTop = "0px";
      view.querySelectorAll("*")[0].style.display = "initial";

      if (root.querySelector('[id="cch_iron_selected"]')) {
        root.querySelector('[id="cch_iron_selected"]').outerHTML = "";
      }

      if (header_colors) header_colors.parentNode.removeChild(header_colors);

      for (let i = 0; i < tabs.length; i++) {
        tabs[i].style.color = "";
      }
    }

    styleHeader(root, tabContainer, header, view, tabs) {
      if (!this.cchConfig.header && !this.editMode || this.cchConfig.kiosk_mode) {
        header.style.display = "none";
      } else if (!this.editMode) {
        view.style.marginTop = "-48.5px";

        if (view.querySelector("hui-view")) {
          view.querySelector("hui-view").style.paddingTop = "55px";
        } else {
          view.querySelectorAll("*")[0].style.paddingTop = "55px";
          view.querySelectorAll("*")[0].style.display = "block";
        }

        let cchThemeBg = getComputedStyle(document.body).getPropertyValue("--cch-background");
        header.style.background = this.cchConfig.background || cchThemeBg || "var(--primary-color)";
      }

      view.style.minHeight = "100vh"; // Add top margin to unused-entities page.

      if (!view.parentNode.querySelector('[id="cch_unused"]')) {
        let style = document.createElement("style");
        style.setAttribute("id", "cch_unused");
        style.innerHTML = `
          hui-unused-entities {
            display: inline-block;
            padding-top:50px;
          }
        `;
        view.parentNode.appendChild(style);
      } // Style all icons, all tab icons, and selection indicator.


      let indicator = this.cchConfig.tab_indicator_color;
      let all_tabs_color = this.cchConfig.all_tabs_color || "var(--cch-all-tabs-color)";

      if (indicator && !root.querySelector('[id="cch_header_colors"]') && !this.editMode) {
        let style = document.createElement("style");
        style.setAttribute("id", "cch_header_colors");
        style.innerHTML = `
          paper-tabs {
            ${indicator ? `--paper-tabs-selection-bar-color: ${indicator} !important` : "var(--cch-tab-indicator-color) !important"}
          }
        `;
        root.appendChild(style);
      } // Style active tab icon color.


      let conditionalTabs = this.cchConfig.conditional_styles ? JSON.stringify(this.cchConfig.conditional_styles).includes("tab") : false;

      if (!root.querySelector('[id="cch_iron_selected"]') && !this.editMode && !conditionalTabs && tabContainer) {
        let style = document.createElement("style");
        style.setAttribute("id", "cch_iron_selected");
        style.innerHTML = `
            .iron-selected {
              ${this.cchConfig.active_tab_color ? `color: ${this.cchConfig.active_tab_color + " !important"}` : "var(--cch-active-tab-color)"}
            }
          `;
        tabContainer.appendChild(style);
      } // Style tab icon color.


      if (this.cchConfig.tab_color && Object.keys(this.cchConfig.tab_color).length) {
        for (let i = 0; i < tabs.length; i++) {
          tabs[i].style.color = this.cchConfig.tab_color[i] || all_tabs_color;
        }
      }

      if (tabContainer) {
        // Shift the header up to hide unused portion.
        root.querySelector("app-toolbar").style.marginTop = "-64px";

        if (!this.cchConfig.chevrons) {
          // Hide chevrons.
          let chevron = tabContainer.shadowRoot.querySelectorAll('[icon^="paper-tabs:chevron"]');
          chevron[0].style.display = "none";
          chevron[1].style.display = "none";
        } else {
          // Remove space taken up by "not-visible" chevron.
          let style = document.createElement("style");
          style.setAttribute("id", "cch_chevron");
          style.innerHTML = `
            .not-visible {
              display:none;
            }
          `;
          tabContainer.shadowRoot.appendChild(style);
        }
      }
    }

    styleButtons(buttons, tabs, root) {
      let topMargin = tabs.length > 0 ? "margin-top:111px;" : "";

      for (const button in buttons) {
        if (button == "options" && this.cchConfig[button] == "overflow") {
          this.cchConfig[button] = "show";
        }

        if (this.cchConfig[button] == "show" || this.cchConfig[button] == "clock") {
          buttons[button].style.cssText = `
              z-index:1;
              ${topMargin}
              ${button == "options" ? "margin-right:-5px; padding:0;" : ""}
            `;
        } else if (this.cchConfig[button] == "overflow") {
          const paperIconButton = buttons[button].querySelector("paper-icon-button") ? buttons[button].querySelector("paper-icon-button") : buttons[button].shadowRoot.querySelector("paper-icon-button");

          if (paperIconButton.hasAttribute("hidden")) {
            continue;
          }

          const menu_items = buttons.options.querySelector("paper-listbox");
          const id = `menu_item_${button}`;

          if (!menu_items.querySelector(`[id="${id}"]`)) {
            const wrapper = document.createElement("paper-item");
            wrapper.setAttribute("id", id);
            wrapper.innerText = this.getTranslation(button);
            wrapper.appendChild(buttons[button]);
            wrapper.addEventListener("click", () => {
              paperIconButton.click();
            });
            paperIconButton.style.pointerEvents = "none";
            this.insertMenuItem(menu_items, wrapper);

            if (button == "notifications") {
              let style = document.createElement("style");
              style.innerHTML = `
                .indicator {
                  top: 5px;
                  right: 0px;
                  width: 10px;
                  height: 10px;
                  ${this.cchConfig.notify_indicator_color ? `background-color:${this.cchConfig.notify_indicator_color}` : ""}
                }
                .indicator > div{
                  display:none;
                }
              `;
              paperIconButton.parentNode.appendChild(style);
            }
          }
        } else if (this.cchConfig[button] == "hide") {
          buttons[button].style.display = "none";
        }
      } // Use button colors vars set in HA theme.


      buttons.menu.style.color = "var(--cch-button-color-menu)";
      buttons.notifications.style.color = "var(--cch-button-color-notifications)";
      buttons.voice.style.color = "var(--cch-button-color-voice)";
      buttons.options.style.color = "var(--cch-button-color-options)";

      if (this.cchConfig.all_buttons_color) {
        root.querySelector("app-toolbar").style.color = this.cchConfig.all_buttons_color || "var(--cch-all-buttons-color)";
      } // Use button colors set in config.


      for (const button in buttons) {
        if (this.cchConfig.button_color[button]) {
          buttons[button].style.color = this.cchConfig.button_color[button];
        }
      }

      if (this.cchConfig.notify_indicator_color && this.cchConfig.notifications == "show") {
        let style = document.createElement("style");
        style.innerHTML = `
          .indicator {
            background-color:${this.cchConfig.notify_indicator_color || "var(--cch-notify-indicator-color)"} !important;
            color: ${this.cchConfig.notify_text_color || "var(--cch-notify-text-color), var(--primary-text-color)"};
          }
        `;
        buttons.notifications.shadowRoot.appendChild(style);
      }
    }

    getTranslation(button) {
      switch (button) {
        case "notifications":
          return this.hass.localize("ui.notification_drawer.title");

        default:
          return button.charAt(0).toUpperCase() + button.slice(1);
      }
    }

    defaultTab(tabs, tabContainer) {
      if (this.cchConfig.default_tab && !window.cchDefaultTab) {
        let default_tab = this.cchConfig.default_tab;
        let activeTab = tabs.indexOf(tabContainer.querySelector(".iron-selected"));

        if (activeTab != default_tab && activeTab == 0 && !this.cchConfig.hide_tabs.includes(default_tab)) {
          tabs[default_tab].click();
        }

        window.cchDefaultTab = true;
      }
    }

    sidebarMod(buttons) {
      let menu = buttons.menu.querySelector("paper-icon-button");
      let sidebar = document.querySelector("home-assistant").shadowRoot.querySelector("home-assistant-main").shadowRoot.querySelector("app-drawer");

      if (!this.cchConfig.sidebar_swipe || this.cchConfig.kiosk_mode) {
        sidebar.removeAttribute("swipe-open");
      }

      if (this.cchConfig.sidebar_closed || this.cchConfig.kiosk_mode) {
        if (sidebar.hasAttribute("opened")) menu.click();
      }
    } // Restore hidden tabs if config has changed.


    restoreTabs(tabs, hidden_tabs) {
      for (let i = 0; i < tabs.length; i++) {
        let hidden = hidden_tabs.includes(i);

        if (tabs[i].style.display == "none" && !hidden) {
          tabs[i].style.removeProperty("display");
        }
      }
    }

    hideTabs(tabContainer, tabs) {
      let hidden_tabs = String(this.cchConfig.hide_tabs).length ? String(this.cchConfig.hide_tabs).replace(/\s+/g, "").split(",") : null;
      let shown_tabs = String(this.cchConfig.show_tabs).length ? String(this.cchConfig.show_tabs).replace(/\s+/g, "").split(",") : null; // Set the tab config source.

      if (!hidden_tabs && shown_tabs) {
        let all_tabs = [];
        shown_tabs = this.buildRanges(shown_tabs);

        for (let i = 0; i < tabs.length; i++) all_tabs.push(i); // Invert shown_tabs to hidden_tabs.


        hidden_tabs = all_tabs.filter(el => !shown_tabs.includes(el));
      } else {
        hidden_tabs = this.buildRanges(hidden_tabs);
      } // Hide tabs.


      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = hidden_tabs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          const tab = _step.value;
          if (!tabs[tab]) continue;
          tabs[tab].style.display = "none";
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      if (this.cchConfig.redirect) {
        // Check if current tab is a hidden tab.
        const activeTab = tabContainer.querySelector("paper-tab.iron-selected");
        const activeTabIndex = tabs.indexOf(activeTab);

        if (hidden_tabs.includes(activeTabIndex) && hidden_tabs.length != tabs.length) {
          let i = 0; // Find the first visible tab and navigate.

          while (hidden_tabs.includes(i)) {
            i++;
          }

          tabs[i].click();
        }
      }

      return hidden_tabs;
    } // If this card is the only one in a column hide column outside edit mode.


    hideCard() {
      if (this.parentNode.children.length == 1) {
        this.parentNode.style.display = "none";
      }

      this.style.display = "none";
    } // Insert items into overflow menu.


    insertMenuItem(menu_items, element) {
      let first_item = menu_items.querySelector("paper-item");

      if (!menu_items.querySelector(`[id="${element.id}"]`)) {
        first_item.parentNode.insertBefore(element, first_item);
      }
    }

    insertClock(buttons, clock_button) {
      const clockIcon = clock_button.querySelector("paper-icon-button");
      const clockIronIcon = clockIcon.shadowRoot.querySelector("iron-icon");
      const clockWidth = this.cchConfig.clock_format == 12 && this.cchConfig.clock_am_pm || this.cchConfig.clock_date ? 90 : 80;

      if (this.cchConfig.notifications == "clock" && this.cchConfig.clock_date && !buttons.notifications.shadowRoot.querySelector('[id="cch_indicator"]')) {
        let style = document.createElement("style");
        style.setAttribute("id", "cch_indicator");
        style.innerHTML = `
          .indicator {
            top: unset;
            bottom: -3px;
            right: 0px;
            width: 90%;
            height: 3px;
            border-radius: 0;
            ${this.cchConfig.notify_indicator_color ? `background-color:${this.cchConfig.notify_indicator_color}` : ""}
          }
          .indicator > div{
            display:none;
          }
        `;
        buttons.notifications.shadowRoot.appendChild(style);
      }

      let clockElement = clockIronIcon.parentNode.getElementById("cch_clock");

      if (!clockElement) {
        clockIcon.style.cssText = `
              margin-right:-5px;
              width:${clockWidth}px;
              text-align: center;
            `;
        clockElement = document.createElement("p");
        clockElement.setAttribute("id", "cch_clock");
        let clockAlign = "center";
        let padding = "";
        let fontSize = "";

        if (this.cchConfig.clock_date && this.cchConfig.menu == "clock") {
          clockAlign = "left";
          padding = "margin-right:-20px";
          fontSize = "font-size:12pt";
        } else if (this.cchConfig.clock_date) {
          clockAlign = "right";
          padding = "margin-left:-20px";
          fontSize = "font-size:12pt";
        }

        let marginTop = this.cchConfig.clock_date ? "-4px" : "2px";
        clockElement.style.cssText = `
              margin-top: ${marginTop};
              text-align: ${clockAlign};
              ${padding};
              ${fontSize};
            `;
        clockIronIcon.parentNode.insertBefore(clockElement, clockIronIcon);
        clockIronIcon.style.display = "none";
      }

      const clockFormat = {
        hour12: this.cchConfig.clock_format != 24,
        hour: "2-digit",
        minute: "2-digit"
      };
      this.updateClock(clockElement, clockFormat);
    }

    updateClock(clock, clockFormat) {
      let date = new Date();
      let locale = this.cchConfig.date_locale || this.hass.language;
      let time = date.toLocaleTimeString([], clockFormat);
      let options = {
        weekday: "short",
        month: "2-digit",
        day: "2-digit"
      };
      date = this.cchConfig.clock_date ? `</br>${date.toLocaleDateString(locale, options)}` : "";

      if (!this.cchConfig.clock_am_pm && this.cchConfig.clock_format == 12) {
        clock.innerHTML = time.slice(0, -3) + date;
      } else {
        clock.innerHTML = time + date;
      }

      window.setTimeout(() => this.updateClock(clock, clockFormat), 60000);
    }

    conditionalStyling(header, buttons, tabs, root) {
      if (window.cchState == undefined) window.cchState = [];
      if (this.prevColor == undefined) this.prevColor = {};
      if (this.prevState == undefined) this.prevState = [];
      const conditional_styles = this.cchConfig.conditional_styles;
      let tabContainer = tabs[0] ? tabs[0].parentNode : "";
      let elem, color, bg, hide, onIcon, offIcon, iconElem;

      const styleElements = (elem, color, hide, bg, onIcon, iconElem) => {
        if (bg && elem == "background") {
          header.style.background = bg;
        } else if (color) {
          elem.style.color = color;
        }

        if (onIcon && iconElem) iconElem.setAttribute("icon", onIcon);

        if (hide && elem !== "background" && !this.editMode) {
          elem.style.display = "none";
        }
      };

      const getElements = (key, elemArray, i, obj, styling) => {
        elem = elemArray[key];
        color = styling[i][obj][key].color;
        onIcon = styling[i][obj][key].on_icon;
        offIcon = styling[i][obj][key].off_icon;
        hide = styling[i][obj][key].hide;

        if (!this.prevColor[key]) {
          this.prevColor[key] = window.getComputedStyle(elem, null).getPropertyValue("color");
        }
      };

      let styling = [];

      if (Array.isArray(conditional_styles)) {
        for (let i = 0; i < conditional_styles.length; i++) {
          styling.push(Object.assign({}, conditional_styles[i]));
        }
      } else {
        styling.push(Object.assign({}, conditional_styles));
      }

      for (let i = 0; i < styling.length; i++) {
        let template = styling[i].template;

        if (template) {
          if (!template.length) template = [template];

          for (let x = 0; x < template.length; x++) {
            this.templateConditional(template[x], header, buttons, tabs);
          }

          continue;
        }

        let entity = styling[i].entity;

        if (this.hass.states[entity] == undefined && entity !== "notifications") {
          throw new Error(`${entity} does not exist.`);
        }

        if (entity == "notifications") {
          window.hassConnection.then(function (result) {
            window.cchState[i] = !!result.conn._ntf.state.length;
          });
        } else {
          window.hassConnection.then(function (result) {
            window.cchState[i] = result.conn._ent.state[entity].state;
          });
        }

        if (window.cchState[i] == undefined) {
          window.setTimeout(() => {
            if (root.querySelector("app-toolbar").className != "edit-mode") {
              this.conditionalStyling(header, buttons, tabs, root);
            }
          }, 100);
          return;
        }

        if (window.cchState[i] !== this.prevState[i] || !window.cchState.length) {
          this.prevState[i] = window.cchState[i];
          let above = styling[i].condition.above;
          let below = styling[i].condition.below;

          for (const obj in styling[i]) {
            let key;

            if (styling[i][obj]) {
              key = Object.keys(styling[i][obj])[0];
            }

            if (obj == "background") {
              elem = "background";
              color = styling[i][obj].color;
              bg = styling[i][obj];
              iconElem = false;

              if (!this.prevColor[obj]) {
                this.prevColor[obj] = window.getComputedStyle(header, null).getPropertyValue("background");
              }
            } else if (obj == "button") {
              getElements(key, buttons, i, obj, styling);

              if (key == "menu") {
                iconElem = elem.querySelector("paper-icon-button").shadowRoot.querySelector("iron-icon");
              } else {
                iconElem = elem.shadowRoot.querySelector("paper-icon-button").shadowRoot.querySelector("iron-icon");
              }
            } else if (obj == "tab") {
              getElements(key, tabs, i, obj, styling);
              iconElem = elem.querySelector("ha-icon");
            }

            if (window.cchState[i] == styling[i].condition.state) {
              styleElements(elem, color, hide, bg, onIcon, iconElem);
            } else if (above !== undefined && below !== undefined && window.cchState[i] > above && window.cchState[i] < below) {
              styleElements(elem, color, hide, bg, onIcon, iconElem);
            } else if (above !== undefined && below == undefined && window.cchState[i] > above) {
              styleElements(elem, color, hide, bg, onIcon, iconElem);
            } else if (above == undefined && below !== undefined && window.cchState[i] < below) {
              styleElements(elem, color, hide, bg, onIcon, iconElem);
            } else {
              if (elem !== "background" && hide && elem.style.display == "none") {
                elem.style.display = "";
              }

              if (bg && elem == "background") {
                header.style.background = this.prevColor[obj];
              } else if (obj !== "background" && obj !== "entity" && obj !== "condition") {
                elem.style.color = this.prevColor[key];
              }

              if (onIcon && offIcon) {
                iconElem.setAttribute("icon", offIcon);
              }
            }
          }
        }
      }

      this.tabContainerMargin(buttons, tabContainer);
      fireEvent(this, "iron-resize");
    }

    templateConditional(template, header, buttons, tabs) {
      // Get entity states.
      window.hassConnection.then(function (result) {
        window.cchEntity = result.conn._ent.state;
      });

      if (!window.cchEntity) {
        window.setTimeout(() => {
          this.templateConditional(template, header, buttons, tabs);
        }, 100);
        return;
      } // Variables for templates.


      let states = window.cchEntity;
      let entity = window.cchEntity;

      const templateEval = (template, entity) => {
        try {
          if (template.includes("return")) {
            return eval(`(function() {${template}}())`);
          } else {
            return eval(template);
          }
        } catch (e) {
          console.log(e);
        }
      };

      for (const condition in template) {
        if (condition == "tab") {
          for (const tab in template[condition]) {
            if (!template[condition][tab].length) {
              template[condition][tab] = [template[condition][tab]];
            }

            for (let i = 0; i < template[condition][tab].length; i++) {
              let tabIndex = parseInt(Object.keys(template[condition]));
              let styleTarget = Object.keys(template[condition][tab][i]);
              let tempCond = template[condition][tab][i][styleTarget];

              if (styleTarget == "icon") {
                tabs[tabIndex].querySelector("ha-icon").setAttribute("icon", templateEval(tempCond, entity));
              } else if (styleTarget == "color") {
                tabs[tabIndex].style.color = templateEval(tempCond, entity);
              } else if (styleTarget == "display") {
                templateEval(tempCond, entity) == "show" ? tabs[tabIndex].style.display = "" : tabs[tabIndex].style.display = "none";
              }
            }
          }
        } else if (condition == "button") {
          for (const button in template[condition]) {
            if (!template[condition][button].length) {
              template[condition][button] = [template[condition][button]];
            }

            for (let i = 0; i < template[condition][button].length; i++) {
              let buttonName = Object.keys(template[condition]);
              let styleTarget = Object.keys(template[condition][button][i]);
              let buttonElem = buttons[buttonName];
              let iconTarget = buttonElem.shadowRoot ? buttonElem.shadowRoot.querySelector("paper-icon-button") : buttonElem.querySelector("paper-icon-button");
              let target = iconTarget.shadowRoot.querySelector("iron-icon");
              let tempCond = template[condition][button][i][styleTarget];

              if (styleTarget == "icon") {
                iconTarget.setAttribute("icon", templateEval(tempCond, entity));
              } else if (styleTarget == "color") {
                target.style.color = templateEval(tempCond, entity);
              } else if (styleTarget == "display") {
                templateEval(tempCond, entity) == "show" ? buttons[buttonName].style.display = "" : buttons[buttonName].style.display = "none";
              }
            }
          }
        } else if (condition == "background") {
          header.style.background = templateEval(template[condition], entity);
        }
      }

      entity = null;
    } // Use notification indicator element to monitor notification status.


    notifMonitor(header, buttons, tabs, root) {
      let notification = !!buttons.notifications.shadowRoot.querySelector(".indicator");

      if (window.cchNotification == undefined) {
        window.cchNotification = notification;
      } else if (notification !== window.cchNotification) {
        if (root.querySelector("app-toolbar").className != "edit-mode") {
          this.conditionalStyling(header, buttons, tabs, root);
        }

        window.cchNotification = notification;
      }

      window.setTimeout(() => this.notifMonitor(header, buttons, tabs, root), 1000);
    } // Walk the DOM to find element.


    recursiveWalk(node, element, func) {
      let done = func(node) || node.nodeName == element;
      if (done) return true;

      if ("shadowRoot" in node && node.shadowRoot) {
        done = this.recursiveWalk(node.shadowRoot, element, func);
        if (done) return true;
      }

      node = node.firstChild;

      while (node) {
        done = this.recursiveWalk(node, element, func);
        if (done) return true;
        node = node.nextSibling;
      }
    } // Get range (e.g., "5 to 9") and build (5,6,7,8,9).


    buildRanges(array) {
      if (!array) array = [];

      const sortNumber = (a, b) => a - b;

      const range = (start, end) => new Array(end - start + 1).fill(undefined).map((_, i) => i + start);

      for (let i = 0; i < array.length; i++) {
        if (array[i].length > 1 && array[i].includes("to")) {
          let split = array[i].split("to");
          array.splice(i, 1);
          array = array.concat(range(parseInt(split[0]), parseInt(split[1])));
        }
      }

      for (let i = 0; i < array.length; i++) array[i] = parseInt(array[i]);

      return array.sort(sortNumber);
    }

    swipeNavigation(root, tabs, tabContainer, view) {
      let swipe_amount = this.cchConfig.swipe_amount || 15;
      let animate = this.cchConfig.swipe_animate || "none";
      let skip_tabs = this.cchConfig.swipe_skip ? this.buildRanges(this.cchConfig.swipe_skip.split(",")) : [];
      let wrap = this.cchConfig.swipe_wrap != undefined ? this.cchConfig.swipe_wrap : true;
      let prevent_default = this.cchConfig.swipe_prevent_default != undefined ? this.cchConfig.swipe_prevent_default : false;
      swipe_amount /= Math.pow(10, 2);
      const appLayout = root.querySelector("ha-app-layout");
      let xDown, yDown, xDiff, yDiff, activeTab, firstTab, lastTab, left;
      appLayout.addEventListener("touchstart", handleTouchStart, {
        passive: true
      });
      appLayout.addEventListener("touchmove", handleTouchMove, {
        passive: false
      });
      appLayout.addEventListener("touchend", handleTouchEnd, {
        passive: true
      });

      function handleTouchStart(event) {
        let ignored = ["APP-HEADER", "HA-SLIDER", "SWIPE-CARD"];
        let path = event.composedPath && event.composedPath() || event.path;

        if (path) {
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = path[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              let element = _step2.value;
              if (element.nodeName == "HUI-VIEW") break;else if (ignored.indexOf(element.nodeName) > -1) return;
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }
        }

        xDown = event.touches[0].clientX;
        yDown = event.touches[0].clientY;
        if (!lastTab) filterTabs();
        activeTab = tabs.indexOf(tabContainer.querySelector(".iron-selected"));
      }

      function handleTouchMove(event) {
        if (xDown && yDown) {
          xDiff = xDown - event.touches[0].clientX;
          yDiff = yDown - event.touches[0].clientY;

          if (Math.abs(xDiff) > Math.abs(yDiff) && prevent_default) {
            event.preventDefault();
          }
        }
      }

      function handleTouchEnd() {
        if (activeTab < 0 || Math.abs(xDiff) < Math.abs(yDiff)) {
          xDown = yDown = xDiff = yDiff = null;
          return;
        }

        if (xDiff > Math.abs(screen.width * swipe_amount)) {
          left = false;
          activeTab == tabs.length - 1 ? click(firstTab) : click(activeTab + 1);
        } else if (xDiff < -Math.abs(screen.width * swipe_amount)) {
          left = true;
          activeTab == 0 ? click(lastTab) : click(activeTab - 1);
        }

        xDown = yDown = xDiff = yDiff = null;
      }

      function filterTabs() {
        tabs = tabs.filter(element => {
          return !skip_tabs.includes(tabs.indexOf(element)) && getComputedStyle(element, null).display != "none";
        });
        firstTab = wrap ? 0 : null;
        lastTab = wrap ? tabs.length - 1 : null;
      }

      function click(index) {
        if (activeTab == 0 && !wrap && left || activeTab == tabs.length - 1 && !wrap && !left) {
          return;
        }

        if (animate == "swipe") {
          let _in = left ? `${screen.width / 1.5}px` : `-${screen.width / 1.5}px`;

          let _out = left ? `-${screen.width / 1.5}px` : `${screen.width / 1.5}px`;

          view.style.transitionDuration = "200ms";
          view.style.opacity = 0;
          view.style.transform = `translateX(${_in})`;
          view.style.transition = "transform 0.20s, opacity 0.20s";
          setTimeout(function () {
            tabs[index].dispatchEvent(new MouseEvent("click", {
              bubbles: false,
              cancelable: true
            }));
            view.style.transitionDuration = "0ms";
            view.style.transform = `translateX(${_out})`;
            view.style.transition = "transform 0s";
          }, 210);
          setTimeout(function () {
            view.style.transitionDuration = "200ms";
            view.style.opacity = 1;
            view.style.transform = `translateX(0px)`;
            view.style.transition = "transform 0.20s, opacity 0.20s";
          }, 215);
        } else if (animate == "fade") {
          view.style.transitionDuration = "200ms";
          view.style.transition = "opacity 0.20s";
          view.style.opacity = 0;
          setTimeout(function () {
            tabs[index].dispatchEvent(new MouseEvent("click", {
              bubbles: false,
              cancelable: true
            }));
            view.style.transitionDuration = "0ms";
            view.style.opacity = 0;
            view.style.transition = "opacity 0s";
          }, 210);
          setTimeout(function () {
            view.style.transitionDuration = "200ms";
            view.style.transition = "opacity 0.20s";
            view.style.opacity = 1;
          }, 250);
        } else if (animate == "flip") {
          view.style.transitionDuration = "200ms";
          view.style.transform = "rotatey(90deg)";
          view.style.transition = "transform 0.20s, opacity 0.20s";
          view.style.opacity = 0.25;
          setTimeout(function () {
            tabs[index].dispatchEvent(new MouseEvent("click", {
              bubbles: false,
              cancelable: true
            }));
          }, 210);
          setTimeout(function () {
            view.style.transitionDuration = "200ms";
            view.style.transform = "rotatey(0deg)";
            view.style.transition = "transform 0.20s, opacity 0.20s";
            view.style.opacity = 1;
          }, 250);
        } else {
          tabs[index].dispatchEvent(new MouseEvent("click", {
            bubbles: false,
            cancelable: true
          }));
        }
      }
    }

  }

  customElements.define("compact-custom-header", CompactCustomHeader);
}


},{"./compact-custom-header-editor.js":1}]},{},[2]);
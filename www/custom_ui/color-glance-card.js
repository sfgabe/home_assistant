class ColorGlanceCard extends Polymer.Element {

  static get template() {
    return Polymer.html`
      <hui-glance-card id="glance" hass="[[hass]]" style="
        --paper-card-background-color:var(--primary-color);
        --paper-item-icon-color:var(--text-primary-color);
        color:var(--text-primary-color);
      "></hui-glance-card>
    `;
  }

  ready() {
    super.ready();
    this.$.glance.setConfig(this._config);
  }

  setConfig(config) {
    this._config = config;
  }

  getCardSize() {
    return this.$.glance.getCardSize();
  }
}
customElements.define('color-glance-card', ColorGlanceCard);

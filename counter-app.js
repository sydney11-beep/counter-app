/**
 * Copyright 2026 Sydney Anne Reiter
 * @license Apache-2.0, see LICENSE for full text.
 */
import { LitElement, html, css } from "lit";
import { DDDSuper } from "@haxtheweb/d-d-d/d-d-d.js";
import { I18NMixin } from "@haxtheweb/i18n-manager/lib/I18NMixin.js";

/**
 * `counter-app`
 * This component shows a counter with plus and minus buttons.
 * It also supports min and max values and confetti at 21.
 *
 * @demo index.html
 * @element counter-app
 */
export class CounterApp extends DDDSuper(I18NMixin(LitElement)) {
  // This is the HTML tag name for the web component
  static get tag() {
    return "counter-app";
  }

  constructor() {
    super();

    // Basic text and translation setup
    this.title = "";
    this.t = this.t || {};
    this.t = {
      ...this.t,
      title: "Title",
    };

    // This connects the component to its localization files
    this.registerLocalization({
      context: this,
      localesPath:
        new URL("./locales/counter-app.ar.json", import.meta.url).href + "/../",
    });

    // Default values so <counter-app></counter-app> works right away
    this.min = -5;
    this.max = 25;
    this.counter = this.min;
  }

  // These are the reactive properties for Lit
  // reflect true means the value also shows up as an HTML attribute
  static get properties() {
    return {
      ...super.properties,
      title: { type: String },
      counter: { type: Number, reflect: true },
      min: { type: Number, reflect: true },
      max: { type: Number, reflect: true },
    };
  }

  /**
   * updated runs after Lit updates the DOM.
   * We use it to clamp the counter when min or max changes.
   * We also use it to detect when the counter hits 21 so we can pop confetti.
   */
  updated(changedProperties) {
    if (super.updated) {
      super.updated(changedProperties);
    }

    // If min or max changes, make sure they are in the right order
    // Then force counter to stay inside the bounds
    if (changedProperties.has("min") || changedProperties.has("max")) {
      if (this.min > this.max) {
        const temp = this.min;
        this.min = this.max;
        this.max = temp;
      }
      if (this.counter < this.min) this.counter = this.min;
      if (this.counter > this.max) this.counter = this.max;
    }

    // If the counter changes and hits 21, trigger the confetti
    if (changedProperties.has("counter")) {
      if (this.counter === 21) {
        this.makeItRain();
      }
    }
  }

  /**
   * This loads the confetti container only when we need it.
   * After it loads, we set the "popped" attribute to trigger the animation.
   */
  makeItRain() {
    import("@haxtheweb/multiple-choice/lib/confetti-container.js").then(() => {
      setTimeout(() => {
        const confetti = this.shadowRoot.querySelector("#confetti");
        if (!confetti) return;

        // Remove then add so the animation can run more than once
        confetti.removeAttribute("popped");
        confetti.setAttribute("popped", "");
      }, 0);
    });
  }

  // Styles for the component using DDD variables
  static get styles() {
    return [
      super.styles,
      css`
        :host {
          display: block;
          color: var(--ddd-theme-primary);
          background-color: var(--ddd-theme-accent);
          font-family: var(--ddd-font-navigation);
        }

        .wrapper {
          margin: var(--ddd-spacing-4);
          padding: var(--ddd-spacing-4);
          border-radius: var(--ddd-radius-lg);
          text-align: center;
        }

        /* The main counter number */
        h3 {
          font-size: var(--ddd-font-size-xl);
          line-height: var(--ddd-lh-120);
          margin: 0 0 var(--ddd-spacing-4) 0;
          transition: color 0.2s ease;
        }

        /* Change color at specific values */
        :host([counter="18"]) h3 {
          color: var(--ddd-theme-default-keystoneYellow);
        }

        :host([counter="21"]) h3 {
          color: var(--ddd-theme-default-wonderPurple);
        }

        /* Change color at min or max */
        h3.at-min {
          color: var(--ddd-theme-default-original87Pink);
        }

        h3.at-max {
          color: var(--ddd-theme-default-skyBlue);
        }

        /* Buttons row */
        .buttons {
          display: flex;
          justify-content: center;
          gap: var(--ddd-spacing-2);
        }

        /* Button styling */
        button {
          font-size: var(--ddd-font-size-s);
          padding: var(--ddd-spacing-2) var(--ddd-spacing-3);
          border-radius: var(--ddd-radius-md);
          border: var(--ddd-border-sm);
          background-color: var(--ddd-theme-default-white);
          color: var(--ddd-theme-primary);
          cursor: pointer;
          transition: transform 120ms ease, background-color 0.2s ease;
        }

        /* Hover state */
        button:hover:not([disabled]) {
          transform: translateY(-1px);
          background-color: var(--ddd-theme-default-linkLight);
        }

        /* Focus state for keyboard users */
        button:focus-visible {
          outline: var(--ddd-border-md);
          outline-color: var(--ddd-theme-default-link);
          outline-offset: var(--ddd-spacing-1);
        }

        /* Disabled state */
        button[disabled] {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `,
    ];
  }

  /**
   * render builds the HTML in the shadow root.
   * It also decides if we are at min or max so we can style the number.
   */
  render() {
    const atMin = this.counter <= this.min;
    const atMax = this.counter >= this.max;
    const numberClass = atMin ? "at-min" : atMax ? "at-max" : "";

    return html`
      <confetti-container id="confetti">
        <div class="wrapper">
          <h3 class=${numberClass}>${this.counter}</h3>

          <div class="buttons">
            <button
              @click=${this.increment}
              ?disabled=${this.counter === this.max}
              aria-label="Increase counter"
            >
              +
            </button>

            <button
              @click=${this.decrement}
              ?disabled=${this.counter === this.min}
              aria-label="Decrease counter"
            >
              -
            </button>
          </div>

          <slot></slot>
        </div>
      </confetti-container>
    `;
  }

  /**
   * Adds 1 to the counter but stops at max.
   */
  increment() {
    if (this.counter < this.max) {
      this.counter++;
    }
  }

  /**
   * Subtracts 1 from the counter but stops at min.
   */
  decrement() {
    if (this.counter > this.min) {
      this.counter--;
    }
  }

  /**
   * This tells HAX where to find the haxProperties file for this component.
   */
  static get haxProperties() {
    return new URL(`./lib/${this.tag}.haxProperties.json`, import.meta.url).href;
  }
}

globalThis.customElements.define(CounterApp.tag, CounterApp);
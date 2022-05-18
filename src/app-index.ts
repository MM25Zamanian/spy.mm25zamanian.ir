import {initialI18n} from '@alwatr/i18n';
import {router} from '@alwatr/router';
import {SignalInterface} from '@alwatr/signal';
import {css, html, nothing} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {state} from 'lit/decorators/state.js';

import '@mmzmk/iconsax';

import {AppElement} from './app-debt/app-element';
import {mainNavigation} from './config';
import globalStyleSheets, {init} from './global.css';

import './elements/page-home';
import './elements/page-game';
import './elements/page-about';

import type {RoutesConfig} from '@alwatr/router';
import type {ListenerInterface} from '@alwatr/signal';
import type {TemplateResult} from 'lit';

declare global {
  interface HTMLElementTagNameMap {
    'app-index': AppIndex;
  }
}

init();
// initialI18n({
//   defaultLocal: {code: 'en-US', language: 'en', direction: 'ltr'},
// });
initialI18n({
  defaultLocal: {code: 'fa-IR', language: 'fa', direction: 'rtl'},
});

/**
 * APP PWA Root Element
 *
 * ```html
 * <app-index></app-index>
 * ```
 */
@customElement('app-index')
export class AppIndex extends AppElement {
  static override styles = [
    globalStyleSheets,
    css`
      :host {
        inset: 0;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        display: flex;
        position: absolute;
        flex-direction: column;
        justify-content: space-between;
        contain: layout size style;
        overflow: hidden;
        z-index: 0;
      }
      .page-container {
        position: relative;
        flex-grow: 1;
        flex-shrink: 1;
        flex-basis: 0%;
        contain: size layout style;
      }
      ion-tab-bar {
        height: 56px;
      }
      ion-tab-button {
        letter-spacing: 0;
        font-size: 12px;
        font-weight: 400;
      }
      ion-tab-button ion-icon {
        font-size: 22px;
      }
      page-home,
      page-about {
        inset: 0;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        display: flex;
        position: absolute;
        flex-direction: column;
        justify-content: space-between;
        contain: layout size style;
        overflow: hidden;
        z-index: 0;
      }
      /* This will be displayed only on lazy loading. */
      [unresolved]::after {
        content: '...';
        display: block;
        font-size: 2em;
        padding-top: 30vh;
        letter-spacing: 3px;
        text-align: center;
      }
    `,
  ];

  constructor() {
    super();
    router.initial();
  }

  @state()
  protected _hideNavigation = true;

  protected _hideNavigationSignal = new SignalInterface('hide-navigation');

  protected _activePage = 'home';

  protected _routes: RoutesConfig = {
    // TODO: refactor route, we need to get active page!
    // TODO: ability to redirect!
    map: (route) => (this._activePage = route.sectionList[0]?.toString().trim() || 'home'),
    list: {
      home: {
        render: () => html`<page-home></page-home>`,
      },
      game: {
        render: () => html`<page-game></page-game>`,
      },
      about: {
        render: () => html`<page-about></page-about>`,
      },
    },
  };

  protected _listenerList: Array<unknown> = [];

  override connectedCallback(): void {
    super.connectedCallback();
    this._listenerList.push(
        router.signal.addListener(
            (route) => {
              this._logger.logMethodArgs('routeChanged', {route});
              this._activePage = route.sectionList[0]?.toString().trim() || 'home';
              this.requestUpdate();
            },
            {receivePrevious: true},
        ),
        this._hideNavigationSignal.addListener((_hideNavigation) => {
          this._hideNavigation = _hideNavigation;
        }),
    );
    this._hideNavigationSignal.dispatch(false);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._listenerList.forEach((listener) => (listener as ListenerInterface<keyof AlwatrSignals>).remove());
  }

  override render(): TemplateResult {
    return html`
      ${this._renderNavigation()}
      <main class="page-container">${router.outlet(this._routes)}</main>
    `;
  }

  protected _renderNavigation(): TemplateResult | typeof nothing {
    if (this._hideNavigation) return nothing;

    const listTemplate = mainNavigation.map((item) => {
      const selected = this._activePage === item.id;
      return html`
        <ion-button href="${router.makeUrl({sectionList: [item.id]})}" ?hidden="${selected}">
          <mmzmk-iconsax slot="icon-only" name="${item.icon}" category="broken"></mmzmk-iconsax>
        </ion-button>
      `;
    });

    return html`
      <ion-header>
        <ion-toolbar color="primary">
          <ion-buttons slot="secondary">${listTemplate}</ion-buttons>
          <ion-title>Secondary Toolbar</ion-title>
        </ion-toolbar>
      </ion-header>
    `;
  }
}

// import '@ionic/core/dist/types/components';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(
        function(registration) {
        // Registration was successful
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        },
        function(err) {
        // registration failed :(
          console.log('ServiceWorker registration failed: ', err);
        },
    );
  });
}

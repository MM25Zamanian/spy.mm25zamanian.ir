import {localize} from '@alwatr/i18n';
import {css, html, CSSResultGroup} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';

import {AppElement} from '../app-debt/app-element';
import globalStyleSheets from '../global.css';

import type {ListenerInterface} from '@alwatr/signal';
import type {TemplateResult} from 'lit';

declare global {
  interface HTMLElementTagNameMap {
    'page-about': PageAbout;
  }
}

/**
 * APP PWA About Page Element
 *
 * ```html
 * <page-about></page-about>
 * ```
 */
@customElement('page-about')
export class PageAbout extends AppElement {
  static override styles: CSSResultGroup = [
    globalStyleSheets,
    css`
      :host {
        display: flex;
        flex-direction: column;
      }
      .main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding: 1rem;
      }
      .main .about {
        display: flex;
        flex-direction: column;
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0 12px 32px 0 #0003;
        padding: 1rem;
        min-width: 320px;
      }
    `,
  ];

  protected _listenerList: Array<unknown> = [];

  override connectedCallback(): void {
    super.connectedCallback();
    // this._listenerList.push(router.signal.addListener(() => this.requestUpdate()));
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._listenerList.forEach((listener) => (listener as ListenerInterface<keyof AlwatrSignals>).remove());
  }

  protected override render(): TemplateResult {
    return html`
      <div class="main">
        <div class="about">
          <h1>${localize('spy_game_web_app')}</h1>
          <p>${localize('developer')}: mm25zamanian@gmail.com</p>
        </div>
      </div>
    `;
  }
}

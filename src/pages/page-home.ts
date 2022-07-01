import {router} from '@alwatr/router';
import {SignalInterface} from '@alwatr/signal';
import {LocalizeController} from '@shoelace-style/localize/dist/index.js';
import {css, html} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';

import {AppElement} from '../app-debt/app-element';
import globalStyleSheets from '../global.css';

import type {ListenerInterface} from '@alwatr/signal';
import type {RangeChangeEventDetail} from '@ionic/core';
import type {TemplateResult} from 'lit';

import '@erbium/iconsax';

type settingsNames = 'spies' | 'players' | 'time';
type settings = Record<settingsNames, number>;
type re = CustomEvent<RangeChangeEventDetail>; // re => Range Event

declare global {
  interface HTMLElementTagNameMap {
    'page-home': PageHome;
  }
}

/**
 * APP PWA Home Page Element
 *
 * ```html
 * <page-home></page-home>
 * ```
 */
@customElement('page-home')
export class PageHome extends AppElement {
  static override styles = [
    globalStyleSheets,
    css`
      .main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding: 1rem;
      }
      .main .settings {
        display: flex;
        flex-direction: column;
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0 12px 32px 0 #0003;
        padding: 1rem;
      }
      .main .settings .settings__ranges {
        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: center;
        padding: 0 4px 18px;
      }
      .main .settings .settings__ranges .settings__ranges-info {
        display: flex;
        flex-grow: 2;
      }
      .main .settings .settings__ranges .settings__ranges-icon {
        margin: 0 8px;
        --er-iconsax-md-fs: 28px;
      }
      .main .settings .settings__ranges .settings__ranges-text {
        margin: 0;
        flex-grow: 1;
      }
      .main .settings .settings__ranges .settings__ranges-range {
        width: 24vw;
        min-width: 256px;
        max-width: 684px;
        padding: 0 16px;
      }
      .main .settings .settings__ranges .settings__ranges-range ion-range {
        padding: 0;
      }
      .main .settings .settings-start {
        display: flex;
        width: 100%;
        padding-top: 24px;
      }
      .main .settings .settings-start ion-button {
        width: 100%;
      }

      @media (max-width: 768px) {
        .main .settings .settings__ranges .settings__ranges-range {
          flex-grow: 1;
        }
      }

      @media (max-width: 576px) {
        .main .settings {
          width: 95%;
        }
      }
    `,
  ];

  protected _settings: settings = {players: 3, spies: 1, time: 5};
  protected _listenerList: Array<unknown> = [];
  protected _settingsSignal = new SignalInterface('game-settings');
  protected _wordsSignal = new SignalInterface('game-words');
  protected _localize = new LocalizeController(this);

  override connectedCallback(): void {
    super.connectedCallback();
    this._wordsSignal.dispatch(<string[]> this._localize.term('words'));
    // this._listenerList.push(router.signal.addListener(() => this.requestUpdate()));
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._listenerList.forEach((listener) => (listener as ListenerInterface<keyof AlwatrSignals>).remove());
  }

  override render(): TemplateResult {
    return html`
      <div class="main">
        <div class="settings">
          <div class="settings__ranges">
            <div class="settings__ranges-info">
              <er-iconsax name="user-remove" category="broken" class="settings__ranges-icon"></er-iconsax>
              <p class="settings__ranges-text">${this._localize.term('number_of_spies')}: ${this._settings.spies}</p>
            </div>
            <div class="settings__ranges-range">
              <ion-range
                min="1"
                max="10"
                name="spies"
                @ionChange="${(e: re): void => this._changeSettings('spies', <number>e.detail.value)}"
              >
              </ion-range>
            </div>
          </div>
          <div class="settings__ranges">
            <div class="settings__ranges-info">
              <er-iconsax name="user" category="broken" class="settings__ranges-icon"></er-iconsax>
              <p class="settings__ranges-text">
                ${this._localize.term('number_of_players')}: ${this._settings.players}
              </p>
            </div>
            <div class="settings__ranges-range">
              <ion-range
                min="3"
                max="25"
                name="players"
                @ionChange="${(e: re): void => this._changeSettings('players', <number>e.detail.value)}"
              >
              </ion-range>
            </div>
          </div>
          <div class="settings__ranges">
            <div class="settings__ranges-info">
              <er-iconsax name="timer-1" category="broken" class="settings__ranges-icon"></er-iconsax>
              <p class="settings__ranges-text">${this._localize.term('time')}: ${this._settings.time}</p>
            </div>
            <div class="settings__ranges-range">
              <ion-range
                min="5"
                max="30"
                step="5"
                snaps
                name="time"
                @ionChange="${(e: re): void => this._changeSettings('time', <number>e.detail.value)}"
              >
              </ion-range>
            </div>
          </div>
          <div class="settings-start">
            <ion-button
              size="large"
              @click="${this._startGame}"
              ?disabled="${this._settings.spies + 2 > this._settings.players}"
              >${this._localize.term('start')}</ion-button
            >
          </div>
        </div>
      </div>
    `;
  }

  protected _changeSettings(setting: settingsNames, value: number): void {
    this._settings[setting] = value;
    this.requestUpdate();
  }

  protected _startGame(): void {
    this._settingsSignal.dispatch(this._settings);
    if (!this._wordsSignal.dispatched) {
      return;
    }
    router.signal.dispatch({sectionList: ['game'], queryParamList: {}, hash: ''}, {debounce: true});
  }
}

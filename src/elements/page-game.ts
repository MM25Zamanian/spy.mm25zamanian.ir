import {l10nResourceChangeSignal, localize} from '@alwatr/i18n';
import {router} from '@alwatr/router';
import {SignalInterface} from '@alwatr/signal';
import {css, html} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {when} from 'lit/directives/when.js';

import {AppElement} from '../app-debt/app-element';
import globalStyleSheets from '../global.css';
import './spy-timer';

import type {ListenerInterface} from '@alwatr/signal';
import type {TemplateResult} from 'lit';

declare global {
  interface HTMLElementTagNameMap {
    'page-game': PageGame;
  }
}

/**
 * APP PWA Home Page Element
 *
 * ```html
 * <page-game></page-game>
 * ```
 */
@customElement('page-game')
export class PageGame extends AppElement {
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
      .main .game {
        display: flex;
        flex-direction: column;
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0 12px 32px 0 #0003;
        padding: 1rem;
        min-width: 320px;
      }
      .main .game .game-next {
        display: flex;
        justify-content: center;
        width: 100%;
        padding-top: 24px;
      }
      .main .game .game-next ion-button {
        width: 100%;
      }

      @media (max-width: 576px) {
        .main .game {
          width: 95%;
        }
      }
    `,
  ];

  protected _listenerList: Array<unknown> = [];
  protected _settingsSignal = new SignalInterface('game-settings');
  protected _wordsSignal = new SignalInterface('game-words');
  protected _words: string[] = [];
  protected _wordActive = 0;
  protected _hideWord = true;
  protected _showTime = false;
  protected _timeSeconds = 0;

  override connectedCallback(): void {
    super.connectedCallback();
    if (this._settingsSignal.value === undefined || this._wordsSignal.value === undefined) {
      router.signal.dispatch({sectionList: [''], queryParamList: {}, hash: ''}, {debounce: true});
      return;
    } else {
      const game = this._settingsSignal.value;
      const nodeWords = this._wordsSignal.value;
      const word = nodeWords[Math.floor(Math.random() * nodeWords.length)];
      const words = [];

      for (let i = 0; i < game.players - game.spies; i++) {
        words.push(word);
      }
      for (let i = 0; i < game.spies; i++) {
        words.push('spy');
      }
      this._words = words
          .map((value) => ({value, sort: Math.random()}))
          .sort((a, b) => a.sort - b.sort)
          .map(({value}) => value);
    }
    if (l10nResourceChangeSignal.dispatched) {
      this._l10n();
    }
    this._listenerList.push(
        l10nResourceChangeSignal.addListener(() => {
          this._l10n();
          this.requestUpdate();
        }),
    );
    // this._listenerList.push(router.signal.addListener(() => this.requestUpdate()));
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this._settingsSignal.dispatch(undefined);
    this._listenerList.forEach((listener) => (listener as ListenerInterface<keyof AlwatrSignals>).remove());
  }

  override render(): TemplateResult {
    return html`
      <div class="main">
        <div class="game">
          ${when(
      this._showTime,
      () => html`
              <h1 class="ion-text-center">
                <spy-timer duration="${this._timeSeconds}"></spy-timer>
              </h1>
              <div class="game-next">
                <ion-button color="danger" @click="${this._back}">${localize('back')}</ion-button>
              </div>
            `,
      () =>
        html`${when(
            this._hideWord,
            () => html`
                  <h1 class="ion-text-center">${localize('next_person')}</h1>
                  <div class="game-next">
                    <ion-button size="large" color="tertiary" @click="${this._show}">
                      ${localize('show_word')}
                    </ion-button>
                  </div>
                `,
            () => html`
                  <h1 class="ion-text-center">${this._words[this._wordActive]}</h1>
                  <div class="game-next">
                    <ion-button size="large" @click="${this._hide}">${localize('hide')}</ion-button>
                  </div>
                `,
        )}`,
  )}
        </div>
      </div>
    `;
  }

  protected _back(): void {
    router.signal.dispatch({sectionList: [], queryParamList: {}, hash: ''}, {debounce: true});
  }

  protected _show(): void {
    this._hideWord = !this._hideWord;
    this.requestUpdate();
  }

  protected _hide(): void {
    this._hideWord = !this._hideWord;
    if (this._words.length - 1 > this._wordActive) {
      this._wordActive++;
    } else {
      const _timeMinutes = this._settingsSignal.value?.time;
      this._timeSeconds = _timeMinutes !== undefined ? _timeMinutes * 60 + 1 : 0;
      this._showTime = true;
    }
    this.requestUpdate();
  }

  protected _l10n(): void {
    this._words = this._words.map((word) => {
      if (word === 'spy') {
        return localize('spy');
      }
      return word;
    });
  }
}

/* html`<ion-range min="0" max="100" dualKnobspin snaps step="1" ticks value="0" color="primary"> `*/

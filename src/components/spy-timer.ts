import {LitElement, html} from 'lit';
import {customElement} from 'lit/decorators/custom-element.js';
import {property} from 'lit/decorators/property.js';
import {state} from 'lit/decorators/state.js';

import type {TemplateResult} from 'lit';

declare global {
  interface HTMLElementTagNameMap {
    'spy-timer': SpyTimer;
  }
}

@customElement('spy-timer')
export class SpyTimer extends LitElement {
  @property({type: Number}) duration = 60;
  @state() private end: number | null = null;
  @state() private remaining = 0;

  override render(): TemplateResult {
    const {remaining} = this;
    const min = Math.floor(remaining / 60000);
    const sec = pad(min, Math.floor((remaining / 1000) % 60));
    const hun = pad(true, Math.floor((remaining % 1000) / 10));
    return html` ${min ? `${min}:${sec}` : `${sec}.${hun}`} `;
  }
  /* playground-fold */

  private start(): void {
    this.end = Date.now() + this.remaining;
    this.tick();
  }

  private reset(): void {
    const running = this.running;
    this.remaining = this.duration * 1000;
    this.end = running ? Date.now() + this.remaining : null;
  }

  private tick(): void {
    if (this.running && this.end !== null) {
      this.remaining = Math.max(0, this.end - Date.now());
      requestAnimationFrame(() => this.tick());
    }
  }

  get running(): number | null {
    return this.end && this.remaining;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.reset();
    this.start();
  }
}

function pad(pad: unknown, val: number): string | number {
  return pad ? String(val).padStart(2, '0') : val;
}

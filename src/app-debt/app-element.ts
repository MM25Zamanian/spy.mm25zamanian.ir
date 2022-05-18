import {createLogger} from '@alwatr/logger';
import {LitElement} from 'lit';

import type {Logger} from '@alwatr/logger/type';
import type {PropertyValues} from 'lit';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
type Constructor<ClassType = {}> = new (...args: any[]) => ClassType;

export declare class LoggableMixinInterface extends LitElement {
  protected _logger: Logger;
}

export function LoggableMixin<ClassType extends Constructor<LitElement>>(
    superClass: ClassType,
): Constructor<LoggableMixinInterface> & ClassType {
  class LoggableMixinClass extends superClass {
    protected _logger = createLogger(`<${this.tagName.toLowerCase()}>`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    constructor(...args: any[]) {
      super(...args);
      this._logger.logMethod('constructor');
    }

    override connectedCallback(): void {
      this._logger.logMethod('connectedCallback');
      super.connectedCallback();
    }

    override disconnectedCallback(): void {
      this._logger.logMethod('disconnectedCallback');
      super.disconnectedCallback();
    }

    // protected override createRenderRoot(): Element | ShadowRoot {
    //   return this;
    // }

    protected override update(_changedProperties: PropertyValues): void {
      this._logger.logMethod('update');
      super.update(_changedProperties);
    }

    protected override firstUpdated(_changedProperties: PropertyValues): void {
      this._logger.logMethod('firstUpdated');
      super.firstUpdated(_changedProperties);
      this.removeAttribute('unresolved');
    }

    override dispatchEvent(event: CustomEvent | Event): boolean {
      this._logger.logMethodArgs('dispatchEvent', {type: event.type});
      return super.dispatchEvent(event);
    }
  }
  return LoggableMixinClass as unknown as Constructor<LoggableMixinInterface> & ClassType;
}

export const AppElement = LoggableMixin(LitElement);

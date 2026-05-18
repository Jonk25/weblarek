import { Component } from '../base/Component';

export class Counter extends Component<number> {
    constructor(container: HTMLElement) {
        super(container);
    }

    render(count?: number): HTMLElement {
        if (count !== undefined) {
            this.container.textContent = String(count);
            this.container.classList.toggle('hidden', count === 0);
        }
        return this.container;
    }
}
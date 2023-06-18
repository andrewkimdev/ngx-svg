/**
 * Import Angular libraries.
 */
import { Directive, Input, ElementRef } from '@angular/core';

/**
 * Import third-party libraries.
 */
import { Line } from '@svgdotjs/svg.js';

/**
 * Import custom components.
 */
import { SvgContainerComponent } from '../components';
import { SvgBaseDirective } from './svg-base.directive';

@Directive({
  selector: 'svg-line'
})
export class SvgLineDirective extends SvgBaseDirective {
  /**
   * Globally used variables within the directive.
   */
  override _shape: Line | null = null;

  /**
   * Import variables for the line directive.
   */
  @Input() borderSize = 0; // Size of the border.
  @Input() borderColor = '#000'; // Color of the line.
  @Input() x0 = 0; // Starting point on x-axis.
  @Input() y0 = 0; // Starting point on y-axis.
  @Input() x1 = 1; // Ending point on x-axis.
  @Input() y1 = 1; // Ending point on y-axis.

  /**
   * Create SVG Line directive.
   * @param _svgContainer - Host SVG Container Component object instance.
   * @param _elRef - Angular element reference object instance.
   */
  constructor(
    _svgContainer: SvgContainerComponent,
    _elRef: ElementRef
  ) {
    super(_svgContainer, _elRef);
  }

  /**
   * Update line object within the SVG container.
   */
  override updateShape(): void {
    const line = this._shape;
    if (!line) {
      return;
    }
    line
      .plot(this.x0, this.y0, this.x1, this.y1) // Create the line at specific position
      .stroke({ color: this.borderColor, width: this.borderSize }); // Set the border for the line

    // Let's set element in a correct position
    this.setCorrectPosition();
    this.addRemoveClasses(this.classes);
  }

  /**
   * Create line object within the SVG container.
   */
  override createShape(): void {
    const container = this._svgContainer.getContainer();
    if (!container) {
      return;
    }
    this._shape = container
      .line(this.x0, this.y0, this.x1, this.y1) // Create the line at specific position
      .stroke({ color: this.borderColor, width: this.borderSize }) // Set the border for the line
      .on('click', (evt: Event) => this.clickEvent.emit(evt)) // Assign click event
      .on('dblclick', (evt: Event) => this.doubleClickEvent.emit(evt)) // Assign double click event
      .on('mouseover', (evt: Event) => this.mouseOverEvent.emit(evt)) // Assign mouse over event
      .on('mouseout', (evt: Event) => this.mouseOutEvent.emit(evt)); // Assign mouse out event

    this.setCorrectPosition();
    this.addRemoveClasses(this.classes);
    this.onInitialize.emit(this._shape);
  }
}

/**
 * Import Angular libraries.
 */
import { Directive, Input, ElementRef } from '@angular/core';

/**
 * Import third-party libraries.
 */
import { Ellipse } from '@svgdotjs/svg.js';

/**
 * Import custom components.
 */
import { SvgContainerComponent } from '../components';
import { SvgBaseDirective } from './svg-base.directive';

@Directive({
  selector: 'svg-ellipse'
})
export class SvgEllipseDirective extends SvgBaseDirective {
  /**
   * Globally used variables within the directive.
   */
  override _shape: Ellipse | null = null;

  /**
   * Import variables for the ellipse directive.
   */
  @Input() x = 0; // Starting point on x-axis.
  @Input() y = 0; // Starting point on y-axis.
  @Input() height = 0; // Height of the ellipse.
  @Input() width = 0; // Width of the ellipse.

  /**
   * Create SVG Ellipse directive.
   * @param _svgContainer - Host SVG Container Component object instance.
   * @param _elRef - Angular element reference object instance.
   */
  constructor(
    override _svgContainer: SvgContainerComponent,
    override _elRef: ElementRef
  ) {
    super(_svgContainer, _elRef);
  }

  /**
   * Update ellipse object within the SVG container.
   */
  override updateShape(): void {
    this.setAttributes();
  }

  /**
   * Create ellipse object within the SVG container.
   */
  override createShape(): void {
    const container = this._svgContainer.getContainer();
    if (!container) {
      return;
    }

    this._shape = container
      .ellipse(this.width, this.height) // Set height and width of the ellipse
      .on('click', (evt: Event) => this.clickEvent.emit(evt)) // Assign click event
      .on('dblclick', (evt: Event) => this.doubleClickEvent.emit(evt)) // Assign double click event
      .on('mouseover', (evt: Event) => this.mouseOverEvent.emit(evt)) // Assign mouse over event
      .on('mouseout', (evt: Event) => this.mouseOutEvent.emit(evt)); // Assign mouse out event

    this.setAttributes();
    this.onInitialize.emit(this._shape);
  }

  private setAttributes(): void {
    this._shape.size(this.width, this.height) // Update the width and height
      .fill(this.color) // Update the color
      .attr('cx', this.x + this.width / 2) // Set x position
      .attr('cy', this.y + this.height / 2); // Set y position

    // Let's set element in a correct position
    this.setCorrectPosition();
    this.addRemoveClasses(this.classes);
  }
}

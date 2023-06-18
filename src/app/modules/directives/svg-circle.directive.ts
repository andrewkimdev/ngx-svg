/**
 * Import Angular libraries.
 */
import { Directive, Input, ElementRef } from '@angular/core';

/**
 * Import third-party libraries.
 */
import { Circle } from '@svgdotjs/svg.js';

/**
 * Import custom components.
 */
import { SvgBaseDirective } from './svg-base.directive';
import { SvgContainerComponent } from '../components';

@Directive({
  selector: 'svg-circle'
})
export class SvgCircleDirective extends SvgBaseDirective {
  /**
   * Globally used variables within the directive.
   */
  override _shape: Circle | null = null;
  /**
   * Import variables for the circle directive.
   */
  @Input() diameter = 0; // Diameter of the circle
  @Input() x = 0; // Starting point on x-axis.
  @Input() y = 0; // Starting point on y-axis.
  /**
   * Create SVG Circle directive.
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
   * Update circle object within the SVG container.
   */
  override updateShape(): void {
    this.setAttributes();
  }

  /**
   * Create circle object within the SVG container.
   */
  override createShape(): void {
    const container = this._svgContainer.getContainer();
    if (!container) {
      return;
    }

    this._shape = container
      .circle(this.diameter) // Create the circle with diameter (twice the radius)
      .on('click', (evt: Event) => this.clickEvent.emit(evt)) // Assign click event
      .on('dblclick', (evt: Event) => this.doubleClickEvent.emit(evt)) // Assign double click event
      .on('mouseover', (evt: Event) => this.mouseOverEvent.emit(evt)) // Assign mouse over event
      .on('mouseout', (evt: Event) => this.mouseOutEvent.emit(evt)); // Assign mouse out event

    this.setAttributes();
    this.onInitialize.emit(this._shape);
  }

  private setAttributes() {
    this._shape
      ?.size(this.diameter) // Set the diameter (twice the radius)
      .fill(this.color) // Set the fill color
      .attr('cx', Number(this.x) + this.diameter / 2) // Set x position
      .attr('cy', Number(this.y) + this.diameter / 2); // Set y position

    this.setCorrectPosition(); // Set the correct position
    this.addRemoveClasses(this.classes); // Add classes to the circle
  }
}

/**
 * Import Angular libraries.
 */
import { Directive, Input, ElementRef } from '@angular/core';

/**
 * Import third-party libraries.
 */
import { Polyline, PointArrayAlias } from '@svgdotjs/svg.js';

/**
 * Import custom components.
 */
import { SvgContainerComponent } from '../components';
import { SvgBaseDirective } from './svg-base.directive';

@Directive({
  selector: 'svg-polyline'
})
export class SvgPolylineDirective extends SvgBaseDirective {
  /**
   * Globally used variables within the directive.
   */
  override _shape: Polyline | null = null;

  /**
   * Input variables for the polyline directive.
   */
  @Input() points: PointArrayAlias | null = null; // Array with points in format [[x, y], [x1, y1], [x2, y2], ..., [xn, yn]].
  @Input() borderSize = 0; // Size of the border.
  @Input() borderColor = '#000'; // Color of the polyline.
  @Input() fill = '#000'; // Color of the polyline body

  /**
   * Create SVG Polyline directive.
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
   * Update polyline object within the SVG container.
   */
  override updateShape(): void {
    if (!this._shape || !this.points) {
      return;
    }
    this._shape
      .plot(this.points) // Update the polyline object
      .fill(this.fill) // Fill color of the polyline
      .stroke({ color: this.borderColor, width: this.borderSize }); // Set the border for the polyline

    // Add classes to the polyline
    this.addRemoveClasses(this.classes);

    // Let's set element in a correct position
    this.setCorrectPosition();
  }

  /**
   * Create polyline object within the SVG container.
   */
  override createShape(): void {
    const container = this._svgContainer.getContainer();
    const points = this.points;
    if (!container || !points) {
      return;
    }
    this._shape = container
      .polyline(points) // Create the polyline object
      .fill(this.fill) // Fill color of the polyline
      .stroke({ color: this.borderColor, width: this.borderSize }) // Set the border for the polyline
      .on('click', (evt: Event) => this.clickEvent.emit(evt)) // Assign click event
      .on('dblclick', (evt: Event) => this.doubleClickEvent.emit(evt)) // Assign double click event
      .on('mouseover', (evt: Event) => this.mouseOverEvent.emit(evt)) // Assign mouse over event
      .on('mouseout', (evt: Event) => this.mouseOutEvent.emit(evt)); // Assign mouse out event

    // Let's set element in a correct position
    this.setCorrectPosition();

    // Add classes to the polyline
    this.addRemoveClasses(this.classes);

    // Let's output the polyline element
    this.onInitialize.emit(this._shape);
  }
}

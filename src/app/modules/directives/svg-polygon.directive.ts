/**
 * Import Angular libraries.
 */
import { Directive, Input, ElementRef } from '@angular/core';

/**
 * Import third-party libraries.
 */
import { Polygon, PointArrayAlias } from '@svgdotjs/svg.js';

/**
 * Import custom components.
 */
import { SvgContainerComponent } from 'app/modules/components';
import { SvgBaseDirective } from 'app/modules/directives/svg-base.directive';

@Directive({
  selector: 'svg-polygon'
})
export class SvgPolygonDirective extends SvgBaseDirective {
  /**
   * Globally used variables within the directive.
   */
  override _shape: Polygon | null = null;

  /**
   * Import variables for the polygon directive.
   */
  @Input() points: PointArrayAlias | null = []; // Array with points in format [[x, y], [x1, y1], [x2, y2], ..., [xn, yn]].
  @Input() borderSize = 0; // Size of the border.
  @Input() borderColor = '#000'; // Color of the polygon.
  @Input() fill = '#000'; // Color of the polygon body.

  /**
   * Create SVG Polygon directive.
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
   * Update polygon object within the SVG container.
   */
  override updateShape(): void {
    const polygon = this._shape;
    const points = this.points;
    if (!polygon || !points) {
      return;
    }
    polygon
      .plot(points) // Update the polygon object
      .fill(this.fill) // Fill color of the polygon
      .stroke({ color: this.borderColor, width: this.borderSize }); // Set the border for the polygon

    this.addRemoveClasses(this.classes);
    // Let's set element in a correct position
    this.setCorrectPosition();
  }

  /**
   * Create polygon object within the SVG container.
   */
  override createShape(): void {
    const container = this._svgContainer.getContainer();
    const points = this.points;
    if (!container || !points) {
      return;
    }
    this._shape = container
      .polygon(points) // Create the polygon object
      .fill(this.fill) // Fill color of the polygon
      .stroke({ color: this.borderColor, width: this.borderSize }) // Set the border for the polygon
      .on('click', (evt: Event) => this.clickEvent.emit(evt)) // Assign click event
      .on('dblclick', (evt: Event) => this.doubleClickEvent.emit(evt)) // Assign double click event
      .on('mouseover', (evt: Event) => this.mouseOverEvent.emit(evt)) // Assign mouse over event
      .on('mouseout', (evt: Event) => this.mouseOutEvent.emit(evt)); // Assign mouse out event

    // Let's set element in a correct position
    this.setCorrectPosition();

    // Add classes to the polygon
    this.addRemoveClasses(this.classes);

    // Let's output the polygon element
    this.onInitialize.emit(this._shape);
  }
}

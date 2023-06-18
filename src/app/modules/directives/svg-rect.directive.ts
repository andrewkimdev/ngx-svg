/**
 * Import Angular libraries.
 */
import {
  Directive,
  Input,
  ElementRef
} from '@angular/core';

/**
 * Import third-party libraries.
 */
import { Rect } from '@svgdotjs/svg.js';

/**
 * Import custom components.
 */
import { SvgContainerComponent } from '../components';
import { SvgBaseDirective } from './svg-base.directive';

@Directive({
  selector: 'svg-rect'
})
export class SvgRectDirective extends SvgBaseDirective {
  /**
   * Globally used variables within the directive.
   */
  override _shape: Rect | null = null;

  /**
   * Import variables for the rectangular directive.
   */
  @Input() height = 0; // Height of the rectangular.
  @Input() width = 0; // Width of the rectangular.
  @Input() x = 0; // Starting point on x-axis.
  @Input() y = 0; // Starting point on y-axis.
  @Input() rx = 0; // Radius for x axis.
  @Input() ry = 0; // Radius for y axis.

  /**
   * Create SVG Rect directive.
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
   * Update rectangular object within the SVG container.
   */
  override updateShape(): void {
    const rect = this._shape;
    if (!rect) {
      return;
    }
    this.setAttributes();
    rect
      .size(this.width, this.height); // Update the width and height

    // Add classes to the rect
    this.addRemoveClasses(this.classes);

    // Let's set element in a correct position
    this.setCorrectPosition();
  }

  /**
   * Create rectangular object within the SVG container.
   */
  override createShape(): void {
    const container = this._svgContainer.getContainer();
    if (!container) {
      return;
    }
    this._shape = container.rect(this.width, this.height); // Set height and width of the rect
    this.setAttributes();
    this._shape
      .on('click', (evt: Event) => this.clickEvent.emit(evt)) // Assign click event
      .on('dblclick', (evt: Event) => this.doubleClickEvent.emit(evt)) // Assign double click event
      .on('mouseover', (evt: Event) => this.mouseOverEvent.emit(evt)) // Assign mouse over event
      .on('mouseout', (evt: Event) => this.mouseOutEvent.emit(evt)); // Assign mouse out event

    // Let's set element in a correct position
    this.setCorrectPosition();

    // Add classes to the rect
    this.addRemoveClasses(this.classes);

    // Let's output the rect element
    this.onInitialize.emit(this._shape);
  }

  setAttributes(): void {
    const rect = this._shape;
    if (!rect) {
      return;
    }
    rect
      .fill(this.color) // Update the color
      .radius(this.rx, this.ry) // Update the radius
      .move(this.x, this.y); // Update the coordinates
  }
}

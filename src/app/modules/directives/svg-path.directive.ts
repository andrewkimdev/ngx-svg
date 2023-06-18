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
import { Path } from '@svgdotjs/svg.js';

/**
 * Import custom components.
 */
import { SvgContainerComponent } from '../components';
import { SvgBaseDirective } from './svg-base.directive';

@Directive({
  selector: 'svg-path'
})
export class SvgPathDirective extends SvgBaseDirective {
  /**
   * Globally used variables within the directive.
   */
  override _shape: Path | null = null;

  /**
   * Import variables for the path directive.
   */
  @Input() path = ''; // Path which needs to be displayed.
  @Input() borderColor = '#000'; // Color of the border.
  @Input() borderSize = 2; // Size of the border.
  @Input() x = 0; // Starting point on x-axis.
  @Input() y = 0; // Starting point on y-axis.
  @Input() fill = ''; // Fill color of the path.

  /**
   * Create SVG Path directive.
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
   * Update path object within the SVG container.
   */
  override updateShape(): void {
    this.setAttributes();
    this.addRemoveClasses(this.classes);
    this.setCorrectPosition();
  }

  /**
   * Create path object within the SVG container.
   */
  override createShape(): void {
    const container = this._svgContainer.getContainer();
    if (!container) {
      return;
    }
    this._shape = container.path(this.path); // Set the path for the element

    this.setAttributes();

    this._shape
      .on('click', (evt: Event) => this.clickEvent.emit(evt)) // Assign click event
      .on('dblclick', (evt: Event) => this.doubleClickEvent.emit(evt)) // Assign double click event
      .on('mouseover', (evt: Event) => this.mouseOverEvent.emit(evt)) // Assign mouse over event
      .on('mouseout', (evt: Event) => this.mouseOutEvent.emit(evt)); // Assign mouse out event

    // Let's set element in a correct position
    this.setCorrectPosition();

    // Add classes to the path
    this.addRemoveClasses(this.classes);

    // Let's output the path element
    this.onInitialize.emit(this._shape);
  }

  private setAttributes(): void {
    const path = this._shape;
    if (!path) {
      return;
    }
    path.plot(this.path) // Set the path for the element
      .stroke({ color: this.borderColor, width: this.borderSize }) // Set the border for the path
      .fill(this.fill || 'rgba(0, 0, 0, 0)') // Set fill of the path
      .move(this.x, this.y); // Set the location of the path
  }
}

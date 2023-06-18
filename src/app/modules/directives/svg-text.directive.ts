/**
 * Import Angular libraries.
 */
import { Directive, Input, ElementRef } from '@angular/core';

/**
 * Import third-party libraries.
 */
import { Text } from '@svgdotjs/svg.js';

/**
 * Import custom components.
 */
import { SvgContainerComponent } from 'app/modules/components';
import { SvgShapeBaseDirective } from 'app/modules/directives/svg-shape-base.directive';

@Directive({
  selector: 'svg-text'
})
export class SvgTextDirective extends SvgShapeBaseDirective {
  /**
   * Globally used variables within the directive.
   */
  protected _shape: Text | null = null;
  protected shapeType = 'text';

  /**
   * Import variables for the text directive.
   */
  @Input() text = ''; // Text which needs to be displayed.
  @Input() x = 0; // Starting point on x-axis.
  @Input() y = 0; // Starting point on y-axis.
  @Input() size = 10; // Size of the text.

  /**
   * Create SVG Text directive.
   * @param _svgContainer - Host SVG Container Component object instance.
   * @param _elRef - Angular element reference object instance.
   */
  constructor(
    _svgContainer: SvgContainerComponent,
    _elRef: ElementRef,
  ) {
    super(_svgContainer, _elRef);
  }

  /**
   * Update text object within the SVG container.
   */
  override updateShape(): void {
    this.setAttributes();
    this.addRemoveClasses(this.classes);
    this.setCorrectPosition();
  }

  /**
   * Create text object within the SVG container.
   */
  override createShape(): void {
    const container = this._svgContainer.getContainer();
    if (!container) {
      return;
    }
    this._shape = container.text(this.text); // Set the text for the element
    this.setAttributes();
    this._shape
      .on('click', (evt: Event) => this.clickEvent.emit(evt)) // Assign click event
      .on('dblclick', (evt: Event) => this.doubleClickEvent.emit(evt)) // Assign double click event
      .on('mouseover', (evt: Event) => this.mouseOverEvent.emit(evt)) // Assign mouse over event
      .on('mouseout', (evt: Event) => this.mouseOutEvent.emit(evt)); // Assign mouse out event

    // Let's set element in a correct position
    this.setCorrectPosition();

    // Add classes to the text
    this.addRemoveClasses(this.classes);

    // Let's output the text element
    this.onInitialize.emit(this._shape);
  }

  setAttributes(): void {
    const _text = this._shape;
    const text = this.text;
    if (!_text || !text) {
      return;
    }
    _text
      .text(text) // Update the text for the element
      .fill(this.color) // Update the color of the text
      .font({
        size: this.size // Update the size of the text
      })
      .move(this.x, this.y); // Update the location of the text
  }
}

/**
 * Import Angular libraries.
 */
import { Directive, Input, OnChanges, SimpleChanges, ElementRef } from '@angular/core';

/**
 * Import third-party libraries.
 */
import { Image } from '@svgdotjs/svg.js';

/**
 * Import custom components.
 */
import { SvgContainerComponent } from '../components';
import { SvgBaseDirective } from './svg-base.directive';
import { getClassesToAddAndRemove } from '../util/handle-class-changes.util';

@Directive({
  selector: 'svg-image'
})

export class SvgImageDirective extends SvgBaseDirective implements OnChanges {
  /**
   * Globally used variables within the directive.
   */
  override _shape: Image | null = null;

  /**
   * Import variables for the image directive.
   */
  @Input() x = 0; // Starting point on x-axis.
  @Input() y = 0; // Starting point on y-axis.
  @Input() imageUrl = ''; // Path to the image for SVG image.
  @Input() height = 100; // Height of the image.
  @Input() width = 100; // Width of the image.

  /**
   * Create SVG image directive.
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
   * Is called when changes are made to the image object.
   * @param changes - Angular Simple Changes object containing all the changes.
   */
  override ngOnChanges(changes: SimpleChanges): void {
    // Make sure we check it only when image is initialized
    const { x, y, width, height, imageUrl } = changes;
    if (this._shape) {
      // Update image also in case image url has changed
      if (imageUrl && imageUrl.currentValue !== imageUrl.previousValue) {
        // Update image properties and image itself
        this.updateImage(true);
      } else if (
        (x && x.currentValue !== x.previousValue) ||
        (y && y.currentValue !== y.previousValue) ||
        (width && width.currentValue !== width.previousValue) ||
        (height && height.currentValue !== height.previousValue)
      ) {
        // Update only image properties
        this.updateImage(false);
      }

      // Check if classes were changed
      const { classesToAdd, classesToRemove } = getClassesToAddAndRemove(changes);
      if (!!classesToAdd || !!classesToRemove) {
        // Add and remove classes
        this.addRemoveClasses(classesToAdd, classesToRemove);
      }
    }
  }

  /**
   * Update image object within the SVG container.
   * @param reloadImage - Boolean indicator if image should be reloaded.
   */
  private updateImage(reloadImage: boolean): void {
    const image = this._shape;
    if (!image) {
      return;
    }
    // Check if we have to update only image properties, or also image itself
    if (reloadImage) {
      this.loadImage(image);
    } else { // Update just image properties
      image.size(this.width, this.height) // Update image size
           .move(this.x, this.y); // Update image position
    }
    // Let's set element in a correct position
    this.setCorrectPosition();
  }

  /**
   * Create image object within the SVG container.
   */
  override createShape(): void {
    const container = this._svgContainer.getContainer();
    if (!container) {
      return;
    }

    this._shape = container.image(); // Assign image object
    this.loadImage(this._shape);

    // Let's set element in a correct position
    this.setCorrectPosition();

    // Add classes to the image
    this.addRemoveClasses(this.classes);

    // Let's output the image element
    this.onInitialize.emit(this._shape);
  }

  private loadImage(image: Image): void {
    image
      .load(this.imageUrl) // Load image
      .size(this.width, this.height) // Assign image size
      .move(this.x, this.y) // Assign position
      .on('click', (evt: Event) => this.clickEvent.emit(evt)) // Assign click event
      .on('dblclick', (evt: Event) => this.doubleClickEvent.emit(evt)) // Assign double click event
      .on('mouseover', (evt: Event) => this.mouseOverEvent.emit(evt)) // Assign mouse over event
      .on('mouseout', (evt: Event) => this.mouseOutEvent.emit(evt)); // Assign mouse out event
  }

}

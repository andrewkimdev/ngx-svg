/**
 * Import Angular libraries.
 */
import { Directive, Input, Output, AfterViewChecked, OnDestroy, EventEmitter, OnChanges, SimpleChanges, ElementRef } from '@angular/core';

/**
 * Import third-party libraries.
 */
import { Image } from '@svgdotjs/svg.js';

/**
 * Import custom components.
 */
import { SvgContainerComponent } from 'app/modules/components';
import { getClassesToAddAndRemove } from 'app/modules/util/handle-class-changes.util';

@Directive({
  selector: 'svg-image'
})
export class SvgImageDirective implements AfterViewChecked, OnDestroy, OnChanges {
  /**
   * Globally used variables within the directive.
   */
  private _image: Image | null = null;

  /**
   * Import variables for the image directive.
   */
  @Input() imageUrl: string; // Path to the image for SVG image.
  @Input() x = 0; // Starting point on x-axis.
  @Input() y = 0; // Starting point on y-axis.
  @Input() height = 100; // Height of the image.
  @Input() width = 100; // Width of the image.
  @Input() classes: string[] = []; // List of CSS classes which needs to be added.

  /**
   * Output variables for the image directive.
   */
  @Output() clickEvent: EventEmitter<Event> = new EventEmitter();
  @Output() doubleClickEvent: EventEmitter<Event> = new EventEmitter();
  @Output() mouseOverEvent: EventEmitter<Event> = new EventEmitter();
  @Output() mouseOutEvent: EventEmitter<Event> = new EventEmitter();
  @Output() onInitialize: EventEmitter<Image> = new EventEmitter();

  /**
   * Create SVG image directive.
   * @param _svgContainer - Host SVG Container Component object instance.
   * @param _elRef - Angular element reference object instance.
   */
  constructor(
    private _svgContainer: SvgContainerComponent,
    private _elRef: ElementRef
  ) {
    this.imageUrl = '';
  }

  /**
   * Creates the image object within the container.
   */
  ngAfterViewChecked(): void {
    // Check if container is created and no image object is created
    if (this._svgContainer.getContainer() && !this._image) {
      this.createImage();
    }
  }

  /**
   * Does all required pre-requisites before destroying the component.
   */
  ngOnDestroy(): void {
    this._image?.remove();
  }

  /**
   * Is called when changes are made to the image object.
   * @param changes - Angular Simple Changes object containing all the changes.
   */
  ngOnChanges(changes: SimpleChanges): void {
    // Make sure we check it only when image is initialized
    const { x, y, width, height, imageUrl } = changes;
    if (this._image) {
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
    const image = this._image;
    if (!image) {
      return;
    }
    // Check if we have to update only image properties, or also image itself
    if (reloadImage) {
      image
        .load(this.imageUrl) // Update image
        .size(this.width, this.height) // Update image size
        .move(this.x, this.y); // Update image position
    } else { // Update just image properties
      image
        .size(this.width, this.height) // Update image size
        .move(this.x, this.y); // Update image position
    }
    // Let's set element in a correct position
    this.setCorrectPosition();
  }

  /**
   * Create image object within the SVG container.
   */
  private createImage(): void {
    const container = this._svgContainer.getContainer();
    if (!container) {
      return;
    }

    this._image = container
      .image() // Assign image object
      .load(this.imageUrl) // Load image
      .size(this.width, this.height) // Assign image size
      .move(this.x, this.y) // Assign position
      .on('click', (evt: Event) => this.clickEvent.emit(evt)) // Assign click event
      .on('dblclick', (evt: Event) => this.doubleClickEvent.emit(evt)) // Assign double click event
      .on('mouseover', (evt: Event) => this.mouseOverEvent.emit(evt)) // Assign mouse over event
      .on('mouseout', (evt: Event) => this.mouseOutEvent.emit(evt)); // Assign mouse out event

    // Let's set element in a correct position
    this.setCorrectPosition();

    // Add classes to the image
    this.addRemoveClasses(this.classes);

    // Let's output the image element
    this.onInitialize.emit(this._image);
  }

  /**
   * Sets correct position for the element.
   */
  private setCorrectPosition() {
    const container = this._svgContainer.getContainer();
    const image: Image | null = this._image;
    if (!container || !image) {
      return;
    }
    // Find position of an element within the parent container
    const position = Array.prototype.slice.call(this._elRef.nativeElement.parentElement.children).indexOf(this._elRef.nativeElement);

    // Let's update and insert element in a correct position.
    if (container.get(position) && image?.position() !== position) {
      image.insertBefore(container.get(position));
    }
  }

  /**
   * Adds classes to the image object.
   * @param classesToAdd - List of classes, which needs to be added.
   * @param classesToRemove - List of classes, which needs to be removed.
   */
  private addRemoveClasses(classesToAdd: string[], classesToRemove: string[] = []): void {
    // First let's remove classes, that are not necessary anymore
    for (const classToRemove of classesToRemove) {
      this._image
        ?.removeClass(classToRemove);
    }
    // Now let's add new classes
    for (const classToAdd of classesToAdd) {
      this._image
        ?.addClass(classToAdd);
    }
  }
}

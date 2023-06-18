/**
 * Import Angular libraries.
 */
import { Directive, Input, Output, AfterViewChecked, EventEmitter, OnDestroy, OnChanges, SimpleChanges, ElementRef } from '@angular/core';

/**
 * Import third-party libraries.
 */
import { Polyline, PointArrayAlias } from '@svgdotjs/svg.js';

/**
 * Import custom components.
 */
import { SvgContainerComponent } from 'app/modules/components';

@Directive({
  selector: 'svg-polyline'
})
export class SvgPolylineDirective implements AfterViewChecked, OnChanges, OnDestroy {
  /**
   * Globally used variables within the directive.
   */
  private _polyline: Polyline | null;

  /**
   * Input variables for the polyline directive.
   */
  @Input() points: PointArrayAlias | null; // Array with points in format [[x, y], [x1, y1], [x2, y2], ..., [xn, yn]].
  @Input() borderSize: number; // Size of the border.
  @Input() borderColor = '#000'; // Color of the polyline.
  @Input() fill = '#000'; // Color of the polyline body
  @Input() classes: string[] = []; // List of CSS classes which needs to be added.

  /**
   * Output variables for the polyline directive.
   */
  @Output() clickEvent: EventEmitter<Event> = new EventEmitter();
  @Output() doubleClickEvent: EventEmitter<Event> = new EventEmitter();
  @Output() mouseOverEvent: EventEmitter<Event> = new EventEmitter();
  @Output() mouseOutEvent: EventEmitter<Event> = new EventEmitter();
  @Output() onInitialize: EventEmitter<Polyline> = new EventEmitter();

  /**
   * Create SVG Polyline directive.
   * @param _svgContainer - Host SVG Container Component object instance.
   * @param _elRef - Angular element reference object instance.
   */
  constructor(
    private _svgContainer: SvgContainerComponent,
    private _elRef: ElementRef
  ) {
    this._polyline = null;
    this.points = null;
    this.borderSize = 0;
  }

  /**
   * Creates or updates the polyline object within the container.
   */
  ngAfterViewChecked(): void {
    // Check if container is created and no polyline object is created
    if (this._svgContainer.getContainer() && !this._polyline) {
      this.createPolyline();
    }
  }

  /**
   * Does all required pre-requisites before destroying the component.
   */
  ngOnDestroy(): void {
    this._polyline?.remove();
  }

  /**
   * Is called when changes are made to the polyline object.
   * @param changes - Angular Simple Changes object containing all of the changes.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (this._polyline) {
      // If we have already created the object, update it.
      this.updatePolyline();

      const { classes } = changes;

      // Check if classes were changed
      if (classes && classes.currentValue !== classes.previousValue) {
        // Get classes that needs to be removed
        const classesToRemove = classes.previousValue.filter((previousClass: string) =>
          !classes.currentValue.some((currentClass: string) => currentClass === previousClass)
        );

        // Get classes that needs to be added
        const classesToAdd = classes.currentValue.filter((currentClass: string) =>
          !classes.previousValue.some((previousClass: string) => currentClass === previousClass)
        );

        // Add and remove classes
        this.addRemoveClasses(classesToAdd, classesToRemove);
      }
    }
  }

  /**
   * Update polyline object within the SVG container.
   */
  private updatePolyline(): void {
    if (!this._polyline || !this.points) {
      return;
    }
    this._polyline
      .plot(this.points) // Update the polyline object
      .fill(this.fill) // Fill color of the polyline
      .stroke({ color: this.borderColor, width: this.borderSize }); // Set the border for the polyline

    // Let's set element in a correct position
    this.setCorrectPosition();
  }

  /**
   * Create polyline object within the SVG container.
   */
  private createPolyline(): void {
    const container = this._svgContainer.getContainer();
    const points = this.points;
    if (!container || !points) {
      return;
    }
    this._polyline = container
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
    this.onInitialize.emit(this._polyline);
  }

  /**
   * Sets correct position for the element.
   */
  private setCorrectPosition() {
    const container = this._svgContainer.getContainer();
    const polyline = this._polyline;
    if (!container || !polyline) {
      return;
    }
    // Find position of an element within the parent container
    const position = Array.prototype.slice.call(this._elRef.nativeElement.parentElement.children).indexOf(this._elRef.nativeElement);

    // Let's update and insert element in a correct position.
    if (container.get(position) && polyline.position() !== position) {
      polyline.insertBefore(container.get(position));
    }
  }

  /**
   * Adds classes to the polyline object.
   * @param classesToAdd - List of classes, which needs to be added.
   * @param classesToRemove - List of classes, which needs to be removed.
   */
  private addRemoveClasses(classesToAdd: string[], classesToRemove: string[] = []): void {
    // First let's remove classes, that are not necessary anymore
    for (const classToRemove of classesToRemove) {
      this._polyline?.removeClass(classToRemove);
    }

    // Now let's add new classes
    for (const classToAdd of classesToAdd) {
      this._polyline?.addClass(classToAdd);
    }
  }
}

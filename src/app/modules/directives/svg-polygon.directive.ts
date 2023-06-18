/**
 * Import Angular libraries.
 */
import { Directive, Input, Output, AfterViewChecked, EventEmitter, OnDestroy, OnChanges, SimpleChanges, ElementRef } from '@angular/core';

/**
 * Import third-party libraries.
 */
import { Polygon, PointArrayAlias } from '@svgdotjs/svg.js';

/**
 * Import custom components.
 */
import { SvgContainerComponent } from 'app/modules/components';
import { getClassesToAddAndRemove } from 'app/modules/util/handle-class-changes.util';

@Directive({
  selector: 'svg-polygon'
})
export class SvgPolygonDirective implements AfterViewChecked, OnChanges, OnDestroy {
  /**
   * Globally used variables within the directive.
   */
  private _polygon: Polygon | null;

  /**
   * Import variables for the polygon directive.
   */
  @Input() points: PointArrayAlias | null; // Array with points in format [[x, y], [x1, y1], [x2, y2], ..., [xn, yn]].
  @Input() borderSize: number; // Size of the border.
  @Input() borderColor = '#000'; // Color of the polygon.
  @Input() fill = '#000'; // Color of the polygon body.
  @Input() classes: string[] = []; // List of CSS classes which needs to be added.

  /**
   * Output variables for the polygon directive.
   */
  @Output() clickEvent: EventEmitter<Event> = new EventEmitter();
  @Output() doubleClickEvent: EventEmitter<Event> = new EventEmitter();
  @Output() mouseOverEvent: EventEmitter<Event> = new EventEmitter();
  @Output() mouseOutEvent: EventEmitter<Event> = new EventEmitter();
  @Output() onInitialize: EventEmitter<Polygon> = new EventEmitter();

  /**
   * Create SVG Polygon directive.
   * @param _svgContainer - Host SVG Container Component object instance.
   * @param _elRef - Angular element reference object instance.
   */
  constructor(
    private _svgContainer: SvgContainerComponent,
    private _elRef: ElementRef
  ) {
    this._polygon = null;
    this.points = null;
    this.borderSize = 0;
  }

  /**
   * Creates or updates the polygon object within the container.
   */
  ngAfterViewChecked(): void {
    // Check if container is created and no polygon object is created
    if (this._svgContainer.getContainer() && !this._polygon) {
      this.createPolygon();
    }
  }

  /**
   * Does all required pre-requisites before destroying the component.
   */
  ngOnDestroy(): void {
    this._polygon?.remove();
  }

  /**
   * Is called when changes are made to the polygon object.
   * @param changes - Angular Simple Changes object containing all the changes.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (this._polygon) {
      const { classes } = changes;
      // If we have already created the object, update it.
      this.updatePolygon();

      // Check if classes were changed
      const { classesToAdd, classesToRemove } = getClassesToAddAndRemove(changes);
      if (!!classesToAdd || !!classesToRemove) {
        // Add and remove classes
        this.addRemoveClasses(classesToAdd, classesToRemove);
      }
    }
  }

  /**
   * Update polygon object within the SVG container.
   */
  private updatePolygon(): void {
    const polygon = this._polygon;
    const points = this.points;
    if (!polygon || !points) {
      return;
    }
    polygon
      .plot(points) // Update the polygon object
      .fill(this.fill) // Fill color of the polygon
      .stroke({ color: this.borderColor, width: this.borderSize }); // Set the border for the polygon

    // Let's set element in a correct position
    this.setCorrectPosition();
  }

  /**
   * Create polygon object within the SVG container.
   */
  private createPolygon(): void {
    const container = this._svgContainer.getContainer();
    const points = this.points;
    if (!container || !points) {
      return;
    }
    this._polygon = container
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
    this.onInitialize.emit(this._polygon);
  }

  /**
   * Sets correct position for the element.
   */
  private setCorrectPosition() {
    const container = this._svgContainer.getContainer();
    const polygon = this._polygon;
    if (!container || !polygon) {
      return;
    }
    // Find position of an element within the parent container
    const position = Array.prototype.slice.call(this._elRef.nativeElement.parentElement.children).indexOf(this._elRef.nativeElement);

    // Let's update and insert element in a correct position.
    if (container.get(position) && polygon.position() !== position) {
      polygon.insertBefore(container.get(position));
    }
  }

  /**
   * Adds classes to the polygon object.
   * @param classesToAdd - List of classes, which needs to be added.
   * @param classesToRemove - List of classes, which needs to be removed.
   */
  private addRemoveClasses(classesToAdd: string[], classesToRemove: string[] = []): void {
    // First let's remove classes, that are not necessary anymore
    for (const classToRemove of classesToRemove) {
      this._polygon?.removeClass(classToRemove);
    }
    // Now let's add new classes
    for (const classToAdd of classesToAdd) {
      this._polygon?.addClass(classToAdd);
    }
  }
}

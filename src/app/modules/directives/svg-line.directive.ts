/**
 * Import Angular libraries.
 */
import { Directive, Input, Output, AfterViewChecked, OnDestroy, EventEmitter, OnChanges, SimpleChanges, ElementRef } from '@angular/core';

/**
 * Import third-party libraries.
 */
import { Line } from '@svgdotjs/svg.js';

/**
 * Import custom components.
 */
import { SvgContainerComponent } from 'app/modules/components';

@Directive({
  selector: 'svg-line'
})
export class SvgLineDirective implements AfterViewChecked, OnChanges, OnDestroy {
  /**
   * Globally used variables within the directive.
   */
  private _line: Line | null;

  /**
   * Import variables for the line directive.
   */
  @Input() borderSize: number; // Size of the border.
  @Input() borderColor = '#000'; // Color of the line.
  @Input() x0 = 0; // Starting point on x axis.
  @Input() y0 = 0; // Starting point on y axis.
  @Input() x1 = 1; // Ending point on x axis.
  @Input() y1 = 1; // Ending point on y axis.
  @Input() classes: string[] = []; // List of CSS classes which needs to be added.
  /**
   * Output variables for the line directive.
   */
  @Output() clickEvent: EventEmitter<Event> = new EventEmitter();
  @Output() doubleClickEvent: EventEmitter<Event> = new EventEmitter();
  @Output() mouseOverEvent: EventEmitter<Event> = new EventEmitter();
  @Output() mouseOutEvent: EventEmitter<Event> = new EventEmitter();
  @Output() onInitialize: EventEmitter<Line> = new EventEmitter();

  /**
   * Create SVG Line directive.
   * @param _svgContainer - Host SVG Container Component object instance.
   * @param _elRef - Angular element reference object instance.
   */
  constructor(
    private _svgContainer: SvgContainerComponent,
    private _elRef: ElementRef
  ) {
    this.borderSize = 0;
    this._line = null;
  }

  /**
   * Creates or updates the line object within the container.
   */
  ngAfterViewChecked(): void {
    // Check if container is created and no line object is created
    if (this._svgContainer.getContainer() && !this._line) {
      this.createLine();
    }
  }

  /**
   * Does all required pre-requisites before destroying the component.
   */
  ngOnDestroy(): void {
    this._line?.remove();
  }

  /**
   * Is called when changes are made to the line object.
   * @param changes - Angular Simple Changes object containing all of the changes.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (this._line) {
      // If we have already created the object, update it.
      this.updateLine();

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
   * Update line object within the SVG container.
   */
  private updateLine(): void {
    const line = this._line;
    if (!line) {
      return;
    }
    line
      .plot(this.x0, this.y0, this.x1, this.y1) // Create the line at specific position
      .stroke({ color: this.borderColor, width: this.borderSize }); // Set the border for the line

    // Let's set element in a correct position
    this.setCorrectPosition();
  }

  /**
   * Create line object within the SVG container.
   */
  private createLine(): void {
    const container = this._svgContainer.getContainer();
    if (!container) {
      return;
    }
    this._line = container
      .line(this.x0, this.y0, this.x1, this.y1) // Create the line at specific position
      .stroke({ color: this.borderColor, width: this.borderSize }) // Set the border for the line
      .on('click', (evt: Event) => this.clickEvent.emit(evt)) // Assign click event
      .on('dblclick', (evt: Event) => this.doubleClickEvent.emit(evt)) // Assign double click event
      .on('mouseover', (evt: Event) => this.mouseOverEvent.emit(evt)) // Assign mouse over event
      .on('mouseout', (evt: Event) => this.mouseOutEvent.emit(evt)); // Assign mouse out event

    // Let's set element in a correct position
    this.setCorrectPosition();

    // Add classes to the line
    this.addRemoveClasses(this.classes);

    // Let's output the line element
    this.onInitialize.emit(this._line);
  }

  /**
   * Sets correct position for the element.
   */
  private setCorrectPosition() {
    const container = this._svgContainer.getContainer();
    const line = this._line;
    if (!container || !line) {
      return;
    }

    // Find position of an element within the parent container
    const position = Array.prototype.slice.call(this._elRef.nativeElement.parentElement.children).indexOf(this._elRef.nativeElement);

    // Let's update and insert element in a correct position.
    if (container.get(position) && line.position() !== position) {
      line.insertBefore(container.get(position));
    }
  }

  /**
   * Adds classes to the line object.
   * @param classesToAdd - List of classes, which needs to be added.
   * @param classesToRemove - List of classes, which needs to be removed.
   */
  private addRemoveClasses(classesToAdd: string[], classesToRemove: string[] = []): void {
    // First let's remove classes, that are not necessary anymore
    for (const classToRemove of classesToRemove) {
      this._line
        ?.removeClass(classToRemove);
    }

    // Now let's add new classes
    for (const classToAdd of classesToAdd) {
      this._line
        ?.addClass(classToAdd);
    }
  }
}

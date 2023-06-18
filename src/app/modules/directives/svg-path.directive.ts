/**
 * Import Angular libraries.
 */
import {
  Directive,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  AfterViewChecked,
  OnChanges,
  SimpleChanges,
  ElementRef
} from '@angular/core';

/**
 * Import third-party libraries.
 */
import { Path } from '@svgdotjs/svg.js';

/**
 * Import custom components.
 */
import { SvgContainerComponent } from 'app/modules/components';
import { getClassesToAddAndRemove } from 'app/modules/util/handle-class-changes.util';

@Directive({
  selector: 'svg-path'
})
export class SvgPathDirective implements AfterViewChecked, OnChanges, OnDestroy {
  /**
   * Globally used variables within the directive.
   */
  private _path: Path | null;

  /**
   * Import variables for the path directive.
   */
  @Input() path = ''; // Path which needs to be displayed.
  @Input() borderColor = '#000'; // Color of the border.
  @Input() borderSize = 2; // Size of the border.
  @Input() x = 0; // Starting point on x-axis.
  @Input() y = 0; // Starting point on y-axis.
  @Input() fill = ''; // Fill color of the path.
  @Input() classes: string[] = []; // List of CSS classes which needs to be added.

  /**
   * Output variables for the path directive.
   */
  @Output() clickEvent: EventEmitter<Event> = new EventEmitter();
  @Output() doubleClickEvent: EventEmitter<Event> = new EventEmitter();
  @Output() mouseOverEvent: EventEmitter<Event> = new EventEmitter();
  @Output() mouseOutEvent: EventEmitter<Event> = new EventEmitter();
  @Output() onInitialize: EventEmitter<Path> = new EventEmitter();

  /**
   * Create SVG Path directive.
   * @param _svgContainer - Host SVG Container Component object instance.
   * @param _elRef - Angular element reference object instance.
   */
  constructor(
    private _svgContainer: SvgContainerComponent,
    private _elRef: ElementRef
  ) {
    this._path = null;
  }

  /**
   * Creates the path object within the container.
   */
  ngAfterViewChecked(): void {
    // Check if container is created and no path object is created
    if (this._svgContainer.getContainer() && !this._path) {
      this.createPath();
    }
  }

  /**
   * Does all required pre-requisites before destroying the component.
   */
  ngOnDestroy(): void {
    this._path?.remove();
  }

  /**
   * Is called when changes are made to the path object.
   * @param changes - Angular Simple Changes object containing all the changes.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (this._path) {
      // If we have already created the object, update it.
      this.updatePath();

      // Check if classes were changed
      const { classesToAdd, classesToRemove } = getClassesToAddAndRemove(changes);
      if (!!classesToAdd || !!classesToRemove) {
        // Add and remove classes
        this.addRemoveClasses(classesToAdd, classesToRemove);
      }
    }
  }

  /**
   * Update path object within the SVG container.
   */
  private updatePath(): void {
    const path = this._path;
    if (!path) {
      return;
    }
    path.plot(this.path) // Update the path for the element
      .stroke({ color: this.borderColor, width: this.borderSize }) // Update the border for the
      .fill(this.fill || 'rgba(0, 0, 0, 0)') // Update fill of the path
      .move(this.x, this.y); // Update the location of the path

    // Let's set element in a correct position
    this.setCorrectPosition();
  }

  /**
   * Create path object within the SVG container.
   */
  private createPath(): void {
    const container = this._svgContainer.getContainer();
    if (!container) {
      return;
    }
    this._path = container
      .path(this.path) // Set the path for the element
      .stroke({ color: this.borderColor, width: this.borderSize }) // Set the border for the path
      .fill(this.fill || 'rgba(0, 0, 0, 0)') // Set fill of the path
      .move(this.x, this.y) // Set the location of the path
      .on('click', (evt: Event) => this.clickEvent.emit(evt)) // Assign click event
      .on('dblclick', (evt: Event) => this.doubleClickEvent.emit(evt)) // Assign double click event
      .on('mouseover', (evt: Event) => this.mouseOverEvent.emit(evt)) // Assign mouse over event
      .on('mouseout', (evt: Event) => this.mouseOutEvent.emit(evt)); // Assign mouse out event

    // Let's set element in a correct position
    this.setCorrectPosition();

    // Add classes to the path
    this.addRemoveClasses(this.classes);

    // Let's output the path element
    this.onInitialize.emit(this._path);
  }

  /**
   * Sets correct position for the element.
   */
  private setCorrectPosition() {
    const container = this._svgContainer.getContainer();
    const path = this._path;
    if (!container || !path) {
      return;
    }
    // Find position of an element within the parent container
    const position = Array.prototype.slice.call(this._elRef.nativeElement.parentElement.children).indexOf(this._elRef.nativeElement);

    // Let's update and insert element in a correct position.
    if (container.get(position) && path.position() !== position) {
      path.insertBefore(container.get(position));
    }
  }

  /**
   * Adds classes to the path object.
   * @param classesToAdd - List of classes, which needs to be added.
   * @param classesToRemove - List of classes, which needs to be removed.
   */
  private addRemoveClasses(classesToAdd: string[], classesToRemove: string[] = []): void {
    // First let's remove classes, that are not necessary anymore
    for (const classToRemove of classesToRemove) {
      this._path
        ?.removeClass(classToRemove);
    }

    // Now let's add new classes
    for (const classToAdd of classesToAdd) {
      this._path
        ?.addClass(classToAdd);
    }
  }
}

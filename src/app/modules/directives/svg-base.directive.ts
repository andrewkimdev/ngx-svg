import { AfterViewChecked, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';

import { Shape } from '@svgdotjs/svg.js';

import { SvgContainerComponent } from 'app/modules/components';
import { getClassesToAddAndRemove } from 'app/modules/util/handle-class-changes.util';

export class SvgBaseDirective implements AfterViewChecked, OnChanges, OnDestroy {
  @Input() protected color = '#000'; // Color of the shape background
  @Input() protected classes: string[] = []; // List of CSS classes which needs to be added.

  @Output() public clickEvent: EventEmitter<Event> = new EventEmitter();
  @Output() public doubleClickEvent: EventEmitter<Event> = new EventEmitter();
  @Output() public mouseOverEvent: EventEmitter<Event> = new EventEmitter();
  @Output() public mouseOutEvent: EventEmitter<Event> = new EventEmitter();
  @Output() public onInitialize: EventEmitter<Shape> = new EventEmitter();

  protected _shape: Shape | null = null;

  constructor(
    protected _svgContainer: SvgContainerComponent,
    protected _elRef: ElementRef
  ) {
  }
  /**
   * This method is meant to be overridden by child classes to create the specific SVG shape
   * User must implement how a shape is created.
   */
  protected createShape(): void {}

  /**
   * This method is meant to be overridden by child classes to create the specific SVG shape
   * User must implement how a shape is updated.
   */
  protected updateShape(): void {}

  /**
   * This method is meant to be overridden by child classes to create the specific SVG shape
   * User must implement to make the code drier.
   */

  // protected setAttributes(): void {}


  /**
   * Adds classes to the shape object.
   * @param classesToAdd - List of classes, which needs to be added.
   * @param classesToRemove - List of classes, which needs to be removed.
   */
  protected addRemoveClasses(classesToAdd: string[], classesToRemove: string[] = []): void {
    // First let's remove classes, that are not necessary anymore
    for (const classToRemove of classesToRemove) {
      this._shape?.removeClass(classToRemove.trim());
    }

    // Now let's add new classes
    for (const classToAdd of classesToAdd) {
      this._shape?.addClass(classToAdd.trim());
    }
  }

  /**
   * Sets correct position for the element.
   */
  protected setCorrectPosition() {
    const container = this._svgContainer.getContainer();
    const shape = this._shape;
    if (!container || !shape) {
      return;
    }
    // Find position of an element within the parent container
    const position = Array.prototype.slice.call(this._elRef.nativeElement.parentElement.children).indexOf(this._elRef.nativeElement);

    // Let's update and insert element in a correct position.
    if (container.get(position) && shape.position() !== position) {
      shape.insertBefore(container.get(position));
    }
  }

  /**
   * Is called when changes are made to the shape object.
   * @param changes - Angular Simple Changes object containing all the changes.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (this._shape) {
      // If we have already created the object, update it.
      this.updateShape();

      // Check if classes were changed
      const { classesToAdd, classesToRemove } = getClassesToAddAndRemove(changes);
      if (!!classesToAdd || !!classesToRemove) {
        // Add and remove classes
        this.addRemoveClasses(classesToAdd, classesToRemove);
      }
    }
  }

  ngAfterViewChecked(): void {
    if (this._svgContainer.getContainer() && !this._shape) {
      this.createShape();
    }
  }

  /**
   * Does all required pre-requisites before destroying the component.
   */
  ngOnDestroy(): void {
    this._shape?.remove();
  }
}

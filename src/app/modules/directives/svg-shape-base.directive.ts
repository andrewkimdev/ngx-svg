import { ElementRef } from '@angular/core';
import { Element as SvgElement } from '@svgdotjs/svg.js';
import { SvgContainerComponent } from 'app/modules/components';

import { SvgBaseDirective } from './svg-base.directive';

export abstract class SvgShapeBaseDirective extends SvgBaseDirective {
  protected abstract _shape: SvgElement | null;
  protected abstract shapeType: string;

  constructor(
    _svgContainer: SvgContainerComponent,
    _elRef: ElementRef
  ) {
    super(_svgContainer, _elRef);
  }

  protected abstract setAttributes(): void;

  override createShape(): void {
    const container = this._svgContainer.getContainer();
    if (!container) {
      return;
    }
    this._shape = container[this.shapeType]();
    this.setAttributes();

    this._shape
      .on('click', (evt: Event) => this.clickEvent.emit(evt)) // Assign click event
      .on('dblclick', (evt: Event) => this.doubleClickEvent.emit(evt)) // Assign double click event
      .on('mouseover', (evt: Event) => this.mouseOverEvent.emit(evt)) // Assign mouse over event
      .on('mouseout', (evt: Event) => this.mouseOutEvent.emit(evt)); // Assign mouse out event

    // Let's set element in a correct position
    this.setCorrectPosition();

    // Add classes to the shape
    this.addRemoveClasses(this.classes);

    // Let's output the shape element
    this.onInitialize.emit(this._shape);
  }
}

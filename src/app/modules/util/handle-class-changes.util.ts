import { SimpleChanges } from '@angular/core';

export function getClassesToAddAndRemove(changes: SimpleChanges) {
  const { classes } = changes;
  let classesToAdd = [];
  let classesToRemove = [];

  if (classes && classes.currentValue !== classes.previousValue) {
    // Get classes that needs to be removed
    classesToRemove = classes.previousValue.filter((previousClass: string) =>
      !classes.currentValue.some((currentClass: string) => currentClass === previousClass)
    );

    // Get classes that needs to be added
    classesToAdd = classes.currentValue.filter((currentClass: string) =>
      !classes.previousValue.some((previousClass: string) => currentClass === previousClass)
    );
  }

  return { classesToAdd, classesToRemove };
}

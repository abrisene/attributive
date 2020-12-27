/*
 # utilities/index.ts
 # Attributive Utilities Index
 */

/*
 # Module Imports
 */

/*
 # Interfaces
 */

/*
 # Module Exports
 */

export async function asyncForEach(
  array: any[],
  callback: (item: any, i: number, array: any[]) => Promise<void>
) {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array);
  }
}

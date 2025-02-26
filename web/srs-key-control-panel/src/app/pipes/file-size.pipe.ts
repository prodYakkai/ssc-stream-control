/**
 * @license
 * Copyright (c) 2019 Jonathan Catmull.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { Pipe, PipeTransform } from '@angular/core';

type unit = 'bytes' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB';
type unit8 = 'bits' | 'Kb' | 'Mb' | 'Gb' | 'Tb' | 'Pb';
type unitPrecisionMap = {
  [u in unit]: number;
};

type unitPrecisionMap8 = {
  [u in unit8]: number;
};


const defaultPrecisionMap: unitPrecisionMap = {
  bytes: 0,
  KB: 0,
  MB: 1,
  GB: 1,
  TB: 2,
  PB: 2
};

const defaultPrecisionMap8: unitPrecisionMap8 = {
  bits: 0,
  Kb: 0,
  Mb: 1,
  Gb: 1,
  Tb: 2,
  Pb: 2
};

/*
 * Convert bytes into largest possible unit.
 * Takes an precision argument that can be a number or a map for each unit.
 * Usage:
 *   bytes | fileSize:precision
 * @example
 * // returns 1 KB
 * {{ 1500 | fileSize }}
 * @example
 * // returns 2.1 GB
 * {{ 2100000000 | fileSize }}
 * @example
 * // returns 1.46 KB
 * {{ 1500 | fileSize:2 }}
 */
@Pipe({ name: 'fileSize', standalone: true })
export class FileSizePipe implements PipeTransform {
  private readonly units: unit[] = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  private readonly units8: unit8[] = ['bits', 'Kb', 'Mb', 'Gb', 'Tb', 'Pb'];


  transform(size: number = 0, bit: boolean = false, precision?: number): string {
    if (isNaN(parseFloat(String(size))) || !isFinite(size)) return '?';

    let unitIndex = 0;

    while (size >= 1024) {
      size /= 1024;
      unitIndex++;
    }

    if (bit) {
      const unit8 = this.units8[unitIndex];
      if (typeof precision === 'number') {
        return `${size.toFixed(+precision)} ${unit8}`;
      }
      return `${size.toFixed(defaultPrecisionMap8[unit8])} ${unit8}`;
    }

    const unit = this.units[unitIndex];
    if (typeof precision === 'number') {
      return `${size.toFixed(+precision)} ${unit}`;
    }
    return `${size.toFixed(defaultPrecisionMap[unit])} ${unit}`;

  }
}
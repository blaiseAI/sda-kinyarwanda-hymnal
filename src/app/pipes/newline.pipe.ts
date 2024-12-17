import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'newline'
})
export class NewlinePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string): any {
    if (!value) return value;
    
    const text = value
      // Replace multiple spaces with a single space
      .replace(/\s{2,}/g, ' ')
      // Add line breaks after semicolons
      .replace(/\s*;\s*/g, ';<br>')
      // Add line breaks after periods followed by a space
      .replace(/\.\s+/g, '.<br>')
      // Add line breaks after commas followed by specific words
      .replace(/,\s*(Kandi|Ndetse|Kuko|Ariko|None|Maze|Kandi|Nuko)\s+/g, ',<br>$1 ')
      // Trim any extra whitespace
      .trim();
      
    return this.sanitizer.bypassSecurityTrustHtml(text);
  }
} 
export interface ConversionRule {
  pattern: RegExp;
  replacement: string | ((match: RegExpMatchArray) => string);
}

export interface Converter {
  name: string;
  convert: (markdown: string) => string;
}
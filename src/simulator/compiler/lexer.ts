export interface token {
  type: string;
  value: string;
  pos: number;
}

/**
 * Lexical analyizer for Turing-lang
 */
export class Lexer {
  private terminalAlphabet: string[] = [
    'start',
    'blank',
    'end',
    ':=',
    '->',
    ',',
    ';',
    '{',
    '}',
    '<',
    '>',
    '-',
  ];
  private tokens: token[];
  private source: string;
  private len: number;
  private pos: number;

  constructor() {
    this.tokens = [];
    this.source = '';
    this.len = 0;
    this.pos = 0;
  }

  /**
   * Checks if input pointer is still in bounds
   * @return in input bounds
   */
  private inBounds(): boolean {
    return this.pos < this.len;
  }

  /**
   * Get the current character in the input that is pointed to by pos
   * @return current char
   */
  private getChar(): string {
    return this.source.charAt(this.pos);
  }

  /**
   * Checks if given character is a newline or carriage return char
   * @param char The character to check
   * @return Char is a newline char
   */
  private isNewline(char: string): boolean {
    return char == '\r' || char == '\n';
  }

  /**
   * Checks if given character is a space or tab char
   * @param char The character to check
   * @return Char is a space char
   */
  private isSpace(char: string): boolean {
    return char == ' ' || char == '\t';
  }

  /**
   * Checks if given character is an alphanumeric value
   * @param char The character to check
   * @return Char is an alphanumeric value
   */
  private isAplhaNumeric(char: string): boolean {
    return (char >= 'a' && char <= 'z') ||
           (char >= 'A' && char <= 'Z') ||
           (char >= '0' && char <= '9');
  }

  /**
   * Get the terminalAlphabet index of the next input
   * Returns -1 if the next input is not a terminal symbol
   * @return terminalAlphabet index of input
   */
  private alphabetIndex(): number {
    let alphIndex: number = -1;
    let iPos: number;
    let tPos: number;
    let match: boolean;
    let index: number;
    for (index = 0; index < this.terminalAlphabet.length; index++) {
      let terminal = this.terminalAlphabet[index];
      iPos = this.pos;
      tPos = 0;
      match = true;
      while (match && tPos < terminal.length && iPos < this.source.length) {
        match = match && this.source.charAt(iPos) == terminal.charAt(tPos);
        iPos++;
        tPos++;
      }
      if (match && iPos - this.pos == tPos) {
        return index;
      }
    }
    return alphIndex;
  }

  /**
   * Skips whitespaces and newline characters in the input
   */
  private skipWhiteSpaces(): void {
    let char: string = this.getChar();
    while (this.inBounds() && (this.isSpace(char) || this.isNewline(char))) {
      this.pos++;
      char = this.getChar();
    }
  }

  /**
   * Skips all input that is marked as a comment by a leading '/'
   * a comment ends at the next newline character
   */
  private parseComment(): void {
    let char: string = this.getChar();
    while (this.inBounds() && !this.isNewline(char)) {
      this.pos++;
      char = this.getChar();
    }
  }

  /**
   * Parses the next input as an identifier
   * and returns a token describing the identifier.
   * An identifier is an alphanumeric sequence including '_'.
   * @return a token containing the next identifier
   */
  private parseIdentifier(): token {
    let tok: token;
    let start: number = this.pos;
    let char: string = this.getChar();
    while (this.inBounds() && (this.isAplhaNumeric(char) || char == '_')) {
      this.pos++;
      char = this.getChar();
    }
    tok = {
      type: 'IDENTIFIER',
      value: this.source.substring(start, this.pos),
      pos: start
    }
    return tok;
  }

  /**
   * The scanner method to tokenize the given input.
   * Throws an Error on unexpected input.
   * @param source The source code to tokenize
   * @return an array of tokens
   */
  tokenize(source: string): token[] {
    this.source = source;
    this.len = source.length;
    this.pos = 0;
    while (this.inBounds()) {
      this.skipWhiteSpaces();
      let tok: token;
      let char: string = this.getChar();
      let alphIndex: number = this.alphabetIndex();
      if (char === '/') {
        this.parseComment();
      } else if (alphIndex != -1) {
        let terminal: string = this.terminalAlphabet[alphIndex];
        tok = {
          type: 'TERMINAL',
          value: this.terminalAlphabet[alphIndex],
          pos: this.pos
        }
        this.pos += terminal.length;
        this.tokens.push(tok);
      } else if ((this.isAplhaNumeric(char) || char == '_')) {
        this.tokens.push(this.parseIdentifier());
      } else {
        throw new Error('Unexpected character: ' + char);
      }
    }
    return this.tokens;
  }
}
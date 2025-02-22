import type { FixedLengthArray } from 'type-fest'
/**
 * A Direction specifies the direction of the entries for a set of clues.
 *
 * Diagonal = Diagonal clues which go down and to the right
 * Diagonal Up = Diagonal clues which go up and to the right
 * Diagonal Down = Diagonal clues which go down and to the right
 * Diagonal Up Left = Diagonal clues which go up and to the left
 * Diagonal Down Left = Diagonal clues which go down and to the left
 * Zones = Clues for explicitly-specified zones
 * Clues = Pre-ordered clues (usually alphabetical)
 *
 * A direction can optionally specify a different string to be shown to solvers. E.g.:
 * Diagonal:Southeast = Diagonal clues labeled as "Southeast"
 * Across:Horizontales = Across clues in a Spanish puzzle
 */
export type Direction =
  | 'Across'
  | 'Down'
  | 'Diagonal'
  | 'Diagonal Up'
  | 'Diagonal Down'
  | 'Diagonal Up Left'
  | 'Diagonal Down Left'
  | 'Zones'
  | 'Clues'

/* Label or clue number */
export type ClueNum = string | number
/* A CrossReference is a dictionary specifying an entry in the puzzle */
export type CrossReference = {
  direction: Direction
  number: ClueNum
}

export type LabeledCellPrimitive<
  EmptyValue extends string = '0',
  BlockValue extends string = '#',
> = null | EmptyValue | BlockValue | ClueNum
export type LabeledCell<EmptyValue extends string = '0', BlockValue extends string = '#'> =
  | LabeledCellPrimitive<EmptyValue, BlockValue>
  | {
      cell: LabeledCellPrimitive<EmptyValue, BlockValue>
      style: StyleSpec
      /* Initial value the cell */
      value: string
    }

export type GroupSpec = {
  /* Cells defined by a bounding rectangle */
  rect?: [number, number, number, number]
  /* Cells in a line, delta values are -1,0,1 */
  line?: [[number, number], [number, number], number]
  /* An explicit list of cells */
  cells?: [number, number][]
  /* The style for the cell */
  style?: StyleSpec
}

export type Clue =
  | string
  | [ClueNum, string]
  | {
      /* The clue number (matches number in cell) */
      number?: ClueNum
      /* Clue numbers for clues that are for multiple entries */
      numbers?: ClueNum[]
      /* Text to display in the list of clues instead of the clue number */
      label?: string
      /* Cells, in order, this clue is for. Syntax: [col1, row1][] */
      cells?: [number, number][]
      /* The clue, can contain HTML syntax */
      clue?: string
      /* A series of hints which replace the clue, can contain HTML syntax */
      hints?: string[]
      /* Image to show for the clue (clue text becomes alt text) */
      image?: string
      /**
       * The answer.
       * Normally, the enumeration and answer for a clue are automatically calculated from the grid. If this cannot be done for some reason (e.g., phrases or variant cryptic crosswords with special rules), the proper values can be supplied with the clue
       */
      answer?: string
      /* The enumeration of the answer */
      enumeration?: Enumeration
      /* Where this clue continues in the grid */
      continued?: CrossReference[]
      /* Other clues referenced by this clue */
      references?: CrossReference[]
      /* Type of the clue, displayed after successful solve or as a hint */
      type?: string
      /* Explanation, displayed after successful solve or as a hint. Can contain HTML syntax */
      explanation?: string
      /* Tags (e.g., &lit), displayed after successful solve or as a hint */
      tags?: string[]
      /* `true` to highlight the clue */
      highlight?: boolean
      /* Clue location for an ArrowWord puzzle. Syntax: [col, row] */
      location?: [number, number]
    }

/**
 * An Enumeration expression specifies what a value or solution looks like.
 *
 * Example values:
 * `7` - solution has 7 letters, e.g.: EXAMPLE
 * `1-4` - e.g.: U-TURN
 * `5 1.1.` - e.g.: THREE A.M.
 *
 * For more details, see:
 * @see https://www.puzzazz.com/ipuz#:~:text=used%20with%20continued.-,Enumeration,-An%20Enumeration%20specifies
 */
export type Enumeration = string

export type StyleSpec = null | StyleSpecObject

export interface StyleSpecObject {
  /* Background shape in cell (see note below) */
  shapebg: 'circle'
  /* Highlighted (implementation defined) */
  highlight: boolean
  /* Name of group is shown up to first occurence of delimiter */
  named: string | null
  /* Thickness of border around cell or group (multiplier) */
  border: number
  /* Subdivision in the cell (note \ is doubled for JSON) */
  divided: '-' | '|' | '/' | '\\' | '+' | 'x'
  /* Large centered text label (e.g., for 15 puzzle) */
  label: string
  /**
   * Small text label that appears in the corner (TL|TR|BL|BR)
   * or in the miggle of the cell side (T|L|R|B)
   * or in the center of the cell (C)
   */
  mark: Record<'TL' | 'TR' | 'BL' | 'BR' | 'T' | 'L' | 'R' | 'B' | 'C', string>
  /* URL of the background image */
  imagebg: string
  /* URL of the image to show (replaces text, if any) */
  image: string
  /**
   * Slice of image to show (e.g., for picture 15 puzzle)
   * in order: col1, row1, col2, row2
   */
  slice: [number, number, number, number]
  /**
   * Solid bar top, left, right, bottom (any combination)
   * T (top) | R (right) | B (bottom) | L (left)
   * e.g. "TR" would mean a top-right placement
   */
  barred: 'T' | 'R' | 'B' | 'L'
  /**
   * Dotted bar top, left, right, bottom (any combination)
   * T (top) | R (right) | B (bottom) | L (left)
   * e.g. "TR" would mean a top-right placement
   */
  dotted: 'T' | 'R' | 'B' | 'L'
  /**
   * Dashed bar top, left, right, bottom (any combination)
   * T (top) | R (right) | B (bottom) | L (left)
   * e.g. "TR" would mean a top-right placement
   */
  dashed: 'T' | 'R' | 'B' | 'L'
  /**
   * Show a < constraint on top, left, right, bottom (any combination)
   * T (top) | R (right) | B (bottom) | L (left)
   * e.g. "TR" would mean a top-right placement
   */
  lessthan: 'T' | 'R' | 'B' | 'L'
  /**
   * Show a > constraint on top, left, right, bottom (any combination)
   * T (top) | R (right) | B (bottom) | L (left)
   * e.g. "TR" would mean a top-right placement
   */
  greaterthan: 'T' | 'R' | 'B' | 'L'
  /**
   * Show a = constraint on top, left, right, bottom (any combination)
   * T (top) | R (right) | B (bottom) | L (left)
   * e.g. "TR" would mean a top-right placement
   */
  equal: 'T' | 'R' | 'B' | 'L'
  /**
   * Background color
   * number is an unique color automatically selected from a predefined table of puzzle colors which are implementation-defined
   * string is expected to be in the 6-sign HEX format (without presceding #)
   */
  color: number | string
  /**
   * Text color
   * number is an unique color automatically selected from a predefined table of puzzle colors which are implementation-defined
   * string is expected to be in the 6-sign HEX format (without presceding #)
   */
  colortext: number | string
  /**
   * Border color
   * number is an unique color automatically selected from a predefined table of puzzle colors which are implementation-defined
   * string is expected to be in the 6-sign HEX format (without presceding #)
   */
  colorborder: number | string
  /**
   * Bar color
   * number is an unique color automatically selected from a predefined table of puzzle colors which are implementation-defined
   * string is expected to be in the 6-sign HEX format (without presceding #)
   */
  colorbar: number | string
}

export type CrosswordValuePrimitive<
  EmptyValue extends string = '0',
  BlockValue extends string = '#',
> = null | BlockValue | EmptyValue | string | CrosswordValue<EmptyValue, BlockValue>[]

export type CrosswordValue<EmptyValue extends string = '0', BlockValue extends string = '#'> =
  | CrosswordValuePrimitive<EmptyValue, BlockValue>
  | ({ [k in Direction]: CrosswordValue<EmptyValue, BlockValue> } & {
      value: CrosswordValuePrimitive<EmptyValue, BlockValue>
      style: StyleSpec
    })

/* Grid puzzle that uses clues for entries */
export type PuzzleKindCrossword = 'http://ipuz.org/crossword'
/* Sudoku-style logic */
export type PuzzleKindSudoku = 'http://ipuz.org/sudoku'
/* Grid puzzle that gets filled in, possibly by moving letters from a bank or other location */
export type PuzzleKindFill = 'http://ipuz.org/fill'
/* Grid puzzle with two grids, one of which has clues, in which there is a correspondence between the letters that in the two grids */
export type PuzzleKindAcrostic = 'http://ipuz.org/acrostic'
/* Puzzle with blocks that move */
export type PuzzleKindBlock = 'http://ipuz.org/block'
/* Puzzle with a question and answer */
export type PuzzleKindAnswer = 'http://ipuz.org/answer'
/* Puzzle with one or more words to be found in the grid */
export type PuzzleKindWordsearch = 'http://ipuz.org/wordsearch'

export type PuzzleKind =
  | PuzzleKindCrossword
  | PuzzleKindSudoku
  | PuzzleKindFill
  | PuzzleKindAcrostic
  | PuzzleKindBlock
  | PuzzleKindAnswer
  | PuzzleKindWordsearch
  | string

export interface CommonPuzzle<EmptyValue extends string = '0', BlockValue extends string = '#'> {
  /* Version of ipuz for this puzzle */
  version: 'http://ipuz.org/v2'
  /* Kind of this puzzle (must have at least one kind) */
  kind: PuzzleKind[]
  /* Copyright information */
  copyright?: string
  /* Name and/or reference for a publisher, can contain HTML syntax */
  publisher?: string
  /* Bibliographic reference for a published puzzle, can contain HTML syntax */
  publication?: string
  /* Permanent URL for the puzzle */
  url?: string
  /* Globally unique identifier for the puzzle */
  uniqueid?: string
  /* Title of puzzle, can contain HTML syntax */
  title?: string
  /* Text displayed above puzzle, can contain HTML syntax */
  intro?: string
  /* Text displayed after successful solve, can contain HTML syntax */
  explanation?: string
  /* Non-displayed annotation */
  annotation?: string
  /* Author of puzzle, can contain HTML syntax */
  author?: string
  /* Editor of puzzle, can contain HTML syntax */
  editor?: string
  /**
   * Date of puzzle or publication date
   * Syntax ISO 8601
   */
  date?: string
  /* Notes about the puzzle, can contain HTML syntax */
  notes?: string
  /* Informational only, there is no standard for difficulty, can contain HTML syntax */
  difficulty?: 'HTML text'
  /**
   * Characters that can be entered in the puzzle
   * E.g. "1234567890"
   */
  charset?: string
  /* Program-specific information from program that wrote this file */
  origin?: string
  /* Text value which represents a block (defaults to "#") */
  block?: BlockValue
  /* Value which represents an empty cell (defaults to 0) */
  empty?: EmptyValue
  /* Named styles for the puzzle */
  styles?: Record<string, StyleSpec>
  /**
   * Array of string containing:
   * - salt as a first item,
   * - hash of the puzzle solution(s) as any other item(s).
   * Used only for puzzles with solver-entered solutions or answers.
   * For puzzles which have multiple correct solutions, multiple SHA1 hashes can be supplied.
   * All hashes for the same puzzle use the same salt.
   * For Crossword and Sudoku puzzles, the correct solution is the string formed by
   * concatenating all values in the correct solution (taken as strings and uppercased),
   * in reading order from top to bottom and left to right.
   * For WordSearch puzzles, the correct solution is the string formed by
   * concatenating all found entries in alphabetical order.
   */
  checksum?: string[]
  /* Partially saved solve, data format defined by the type of puzzle */
  saved?: unknown
}

/**
 * Crossword puzzle.
 * `kind` is required to contain string: 'http://ipuz.org/crossword'
 */
export interface CrosswordPuzzle<
  Dimensions extends { width: number; height: number },
  EmptyValue extends string = '0',
  BlockValue extends string = '#',
> extends CommonPuzzle<EmptyValue, BlockValue> {
  /* Dimensions of the puzzle grid */
  dimensions: Dimensions
  /**
   * Puzzle grid as a two-dimensional array.
   * First dimension are puzzle rows then columns, e.g. puzzle[y][x].
   */
  puzzle: FixedLengthArray<
    FixedLengthArray<LabeledCell<EmptyValue, BlockValue>, Dimensions['width']>,
    Dimensions['height']
  >
  /* Current solve state of the puzzle */
  saved?: CrosswordValue<EmptyValue, BlockValue>[][]
  /* Correct solution */
  solution?: CrosswordValue<EmptyValue, BlockValue>[][]
  /* Arbitrarily-shaped entries overlaid on the grid */
  zones?: GroupSpec[]
  /* Clue sets */
  clues?: Record<Direction, Clue[]>

  /* Show enumerations with clues */
  showenumerations?: boolean
  /**
   * Where to put clues
   * null = auto
   * "blocks" = put clues in blocks adjacent to entry
   */
  clueplacement?: 'before' | 'after' | 'blocks' | null
  /* The final answer to the puzzle */
  answer?: string
  /* The final answer to the puzzle in case there are more than one */
  answers?: string[]
  /* Enumeration of the final answer to the puzzle */
  enumeration?: Enumeration
  /* List of enumerations for final answers to the puzzle in case there are more than one */
  enumerations?: Enumeration[]
  /**
   * Object of hints to be given for misses.
   * `key` = the value user tried to guess
   * `value` = the hint
   */
  misses?: Record<string, string>
}

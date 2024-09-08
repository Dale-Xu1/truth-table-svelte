export enum TokenType
{
    IDENTIFIER,
    NOT,
    CONJUNCTION, DISJUNCTION,
    CONDITION, BICONDITION,
    XOR,
    PAREN_OPEN, PAREN_CLOSE,
    END_OF_INPUT
}

export class Token
{

    public constructor(public readonly location: number, public readonly type: TokenType, public readonly value: string) { }

}

export default class Lexer
{

    private static readonly rules: [RegExp, TokenType][] =
    [
        [/^[a-zA-Z]+/, TokenType.IDENTIFIER ],
        [/^!/,         TokenType.NOT        ],
        [/^&/,         TokenType.CONJUNCTION],
        [/^\|/,        TokenType.DISJUNCTION],
        [/^->/,        TokenType.CONDITION  ],
        [/^<->/,       TokenType.BICONDITION],
        [/^\^/,        TokenType.XOR        ],
        [/^\(/,        TokenType.PAREN_OPEN ],
        [/^\)/,        TokenType.PAREN_CLOSE]
    ]


    private readonly tokens: Token[]
    private index = 0

    public constructor(input: string) { this.tokens = this.tokenize(input) }


    private tokenize(input: string): Token[]
    {
        let tokens: Token[] = [], index = 0
        while (input.length > 0)
        {
            // Match beginning of input against token regular expressions
            let whitespace = input.match(/^[ \t\r\n]+/)?.[0]
            let length: number

            exit: if (whitespace) length = whitespace.length // Ignore whitespace
            else
            {
                for (let [regex, type] of Lexer.rules)
                {
                    let result = input.match(regex)?.[0]
                    if (result)
                    {
                        tokens.push(new Token(index, type, result))
                        length = result.length

                        break exit
                    }
                }

                throw new Error(`[${index}] Invalid character: '${input[0]}'`) // Raise error if no tokens match
            }

            input = input.slice(length)
            index += length
        }

        tokens.push(new Token(index, TokenType.END_OF_INPUT, " "))
        return tokens
    }

    public get current(): Token { return this.tokens[this.index] }
    public next(): Token
    {
        let token = this.current
        if (this.index < this.tokens.length - 1) this.index++

        return token
    }


    public match(expected: TokenType): boolean
    {
        // Tests if current token is of a certain type
        if (this.current.type !== expected) return false
        this.next() // Moves onto next token if successful

        return true
    }

    public expect(expected: TokenType): void
    {
        // Results in error if match fails
        let token = this.current
        if (!this.match(expected)) throw new Error(`[${token.location}] Expected [${TokenType[expected]}] but got [${TokenType[token.type]}] "${token.value}"`)
    }

}

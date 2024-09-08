import Lexer, { TokenType } from "./Lexer"
import Tree, { IdentifierTree, UnaryTree, BinaryTree } from "./Tree"

const enum Precedence
{
    XOR,
    BICONDITION,
    CONDITION,
    DISJUNCTION,
    CONJUNCTION,
    NOT
}

class Parser
{

    private lexer!: Lexer

    public constructor(private readonly input: string) { }


    private getPrecedence(type: TokenType): Precedence | null
    {
        switch (type)
        {
            case TokenType.CONJUNCTION: return Precedence.CONJUNCTION
            case TokenType.DISJUNCTION: return Precedence.DISJUNCTION

            case TokenType.CONDITION:   return Precedence.CONDITION
            case TokenType.BICONDITION: return Precedence.BICONDITION

            case TokenType.XOR:         return Precedence.XOR

            default: return null
        }
    }

    private parsePrimary(): Tree
    {
        let token = this.lexer.current

        // Identifiers are the only type of literal
        if (this.lexer.match(TokenType.IDENTIFIER)) return new IdentifierTree(token.value)
        else if (this.lexer.match(TokenType.NOT)) return new UnaryTree(TokenType.NOT, this.parseTree(Precedence.NOT))
        else if (this.lexer.match(TokenType.PAREN_OPEN))
        {
            // Returns precedence back to root
            let tree = this.parseTree()
            this.lexer.expect(TokenType.PAREN_CLOSE)

            return tree
        }

        throw new Error(`[${token.location}] Unexpected [${TokenType[token.type]}] "${token.value}"`)
    }
    
    private parseTree(precedence: Precedence = Precedence.XOR): Tree
    {
        let left = this.parsePrimary()
        while (true)
        {
            // Exit if precedence of next operator is too low
            let token = this.lexer.current, p = this.getPrecedence(token.type)
            if (p === null || p < precedence) break

            this.lexer.next()
            left = new BinaryTree(token.type, left, this.parseTree(p + 1)) // Inner expression must have higher precedence
        }

        return left
    }


    public parse(): Tree | string
    {
        try
        {
            this.lexer = new Lexer(this.input)

            // Parse expression and expect equation to end
            let tree = this.parseTree()
            this.lexer.expect(TokenType.END_OF_INPUT)

            return tree
        }
        catch (e) { return (e as Error).message }
    }

}

export default Parser

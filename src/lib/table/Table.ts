import { TokenType } from "../parser/Lexer"
import Tree, { BinaryTree, IdentifierTree, UnaryTree } from "../parser/Tree"

export abstract class Column
{

    public readonly column: boolean[] = []

    public constructor(public readonly tree: Tree, public readonly string: string) { }

    public abstract initialize(): void

}

export class IdentifierColumn extends Column
{

    public constructor(tree: IdentifierTree) { super(tree, tree.name) }

    public add(row: boolean): void { this.column.push(row) }
    public initialize(): void { } // Initialized instead in Table.ts

}

export class UnaryColumn extends Column
{

    public constructor(tree: UnaryTree, private readonly expression: Column)
    {
        // Generate string representation
        let operator: string
        switch (tree.operator)
        {
            case TokenType.NOT: operator = "￢"; break
            default: throw new Error("Invalid unary operator")
        }

        super(tree, operator + expression.string)
    }

    public initialize(): void
    {
        // Apply operator
        for (let row of this.expression.column) switch ((this.tree as UnaryTree).operator)
        {
            case TokenType.NOT: this.column.push(!row); break
        }
    }

}

export class BinaryColumn extends Column
{

    public constructor(tree: BinaryTree, private readonly left: Column, private readonly right: Column)
    {
        let operator: string
        switch (tree.operator)
        {
            case TokenType.CONJUNCTION: operator = "∧"; break
            case TokenType.DISJUNCTION: operator = "∨"; break

            case TokenType.CONDITION:   operator = "→"; break
            case TokenType.BICONDITION: operator = "↔"; break

            case TokenType.XOR:         operator = "⊕"; break

            default: throw new Error("Invalid binary operator")
        }

        // Generate string representation
        let leftString = left.string
        let rightString = right.string

        if (left instanceof BinaryColumn) leftString = `(${leftString})`
        if (right instanceof BinaryColumn) rightString = `(${rightString})`

        super(tree, `${leftString} ${operator} ${rightString}`)
    }

    public initialize(): void
    {
        // Apply operator
        let left = this.left.column, right = this.right.column
        for (let i = 0; i < left.length; i++) switch ((this.tree as BinaryTree).operator)
        {
            case TokenType.CONJUNCTION: this.column.push(left[i] && right[i]); break
            case TokenType.DISJUNCTION: this.column.push(left[i] || right[i]); break

            case TokenType.CONDITION:   this.column.push(!left[i] || right[i]); break
            case TokenType.BICONDITION: this.column.push(left[i] === right[i]); break

            case TokenType.XOR:         this.column.push(left[i] !== right[i]); break
        }
    }

}

export default class Table
{

    public readonly identifiers: IdentifierColumn[] = []
    public readonly columns: Column[] = []


    public compile(tree: Tree, order: string[]): void
    {
        tree.compile(this)

        let sorted: IdentifierColumn[] = []
        for (let name of order)
        {
            for (let column of this.recordedIdentifiers) if (column.string === name) sorted.push(column)
        }

        this.identifiers.push(...sorted, ...this.recordedIdentifiers.filter(column => !order.includes(column.string)))

        this.initializeIdentifiers()
        this.initializeColumns()
    }

    private initializeIdentifiers(...row: boolean[]): void
    {
        if (row.length < this.identifiers.length)
        {
            // Recursive pattern produces all combinations of true/false values
            this.initializeIdentifiers(...row, true)
            this.initializeIdentifiers(...row, false)
        }
        else
        {
            // Row has been generated and can be added to table
            for (let i = 0; i < row.length; i++) this.identifiers[i].add(row[i])
        }
    }

    private initializeColumns(): void
    {
        for (let column of this.columns) column.initialize()
    }


    private recordedIdentifiers: IdentifierColumn[] = []
    public addIdentifier(identifier: IdentifierColumn): IdentifierColumn
    {
        // Check to see if matching identifier exists
        for (let existing of this.recordedIdentifiers) if (existing.tree.equals(identifier.tree)) return existing

        this.recordedIdentifiers.push(identifier)
        return identifier
    }

    public addColumn<T extends Column>(column: T): T
    {
        // Check if matching expression exists in table
        for (let existing of this.columns) if (existing.tree.equals(column.tree)) return existing as T

        this.columns.push(column)
        return column
    }

}

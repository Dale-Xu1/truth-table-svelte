import Table, { BinaryColumn, Column, IdentifierColumn, UnaryColumn } from "../table/Table"
import { TokenType } from "./Lexer"

export default abstract class Tree
{

    public abstract compile(table: Table): Column

    // Test if trees are equal to each other to avoid repeat columns
    public abstract equals(tree: Tree): boolean

}

export class IdentifierTree extends Tree
{

    public constructor(public readonly name: string) { super() }

    public compile(table: Table): IdentifierColumn
    {
        // Add identifier to table
        return table.addIdentifier(new IdentifierColumn(this))
    }

    public equals(tree: Tree): boolean { return tree instanceof IdentifierTree && tree.name === this.name }

}

export class UnaryTree extends Tree
{

    public constructor(public readonly operator: TokenType, private readonly expression: Tree) { super() }

    public compile(table: Table): UnaryColumn
    {
        // Compile expression
        let expression = this.expression.compile(table)
        return table.addColumn(new UnaryColumn(this, expression)) // Add unary expression to table
    }

    public equals(tree: Tree): boolean
    {
        // Types and operators must be the same
        return tree instanceof UnaryTree && tree.operator === this.operator && tree.expression.equals(this.expression)
    }

}

export class BinaryTree extends Tree
{

    public constructor(public readonly operator: TokenType, private readonly left: Tree, private readonly right: Tree) { super() }

    public compile(table: Table): BinaryColumn
    {
        // Compile left and right operands
        let left = this.left.compile(table), right = this.right.compile(table)
        return table.addColumn(new BinaryColumn(this, left, right)) // Add binary expression to table
    }
    
    public equals(tree: Tree): boolean
    {
        // Types and operators must be the same
        return tree instanceof BinaryTree && tree.operator === this.operator && tree.left.equals(this.left) && tree.right.equals(this.right)
    }

}

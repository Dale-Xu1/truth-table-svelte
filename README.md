# Truth Table Generator

## Overview
This is a web application that generates a truth table given an arbitrary boolean expression with any number of variables. Variables can be written in any order in the expression, and then later independently sorted based on user input. The parser respects precedence rules and parsing error messages are displayed in the UI. It also supports the creation of intermediary columns to show work for how it got the final column, which are often asked for when schools give these kinds of things as an assignment.

This is a revision of a program I created four years ago to do my homework in high school, but now that I'm basically learning the same thing again in college, I thought that I would get the program running again and update the codebase a bit.

## Example

Operations that are supported are: NOT(!), AND (&), OR (|), CONDITION (->), BICONDITION (<->), and XOR(^). The first text input is the expression, while the second allows the user to specify the variable order in the table via a comma-separated list.

This is the output for the expression: `!a & b | c`

a|b|c|￢a|￢a ∧ b|(￢a ∧ b) ∨ c
-|-|-|-|-|-
T|T|T|F|F|T
T|T|F|F|F|F
T|F|T|F|F|T
T|F|F|F|F|F
F|T|T|T|T|T
F|T|F|T|T|T
F|F|T|T|F|T
F|F|F|T|F|F

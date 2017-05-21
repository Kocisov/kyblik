%{
  var fi = 0;
%}

%lex
%%

[/][*][^*]*[*]+([^/*][^*]*[*]+)*[/]       return 'COMMENT'
"//".*                                    return 'COMMENT'

[^\S\n]+                                  /* ignore whitespace */
\n\s*                                     return 'NEWLINE'
'func'                                    return 'FUNCTION'
'log'                                     return 'LOG'
'isNumber'                                return 'ISNUMBER'
'debounce'                                return 'DEBOUNCE'
'random'                                  return 'RANDOM'
'input'                                   return 'INPUT'
'output'                                  return 'OUTPUT'
'callable as'                             return 'CALLABLE'
'if'                                      return 'IF'
'else'                                    return 'ELSE'

'&&'                                      return 'AND'
'*'                                       return 'STAR'
'('                                       return 'LEFT_BRACE'
')'                                       return 'RIGHT_BRACE'
'{'                                       return 'LEFT_UBRACE'
'}'                                       return 'RIGHT_UBRACE'
':'                                       return 'COLON'
','                                       return 'COMMA'
'.'                                       return 'DOT'
'='                                       return 'EQUAL'

(['](\\.|[^']|\\\')*?['])+                return 'STRING'
(["](\\.|[^"]|\\\")*?["])+                return 'STRING'

[0-9]+("."[0-9]+)?\b                      return 'NUMBER'
[_a-zA-Z]+[_a-zA-Z0-9]*\b                 return 'VARIABLE'

<<EOF>>                                   return 'EOF'

/lex

%start pg
%%

pg
	: statements EOF
		{
      return yy.createProgram($1)
    }
	;

statements
	: statements statement
		{
      $$ = $1.concat($2)
    }
	| statement
	;

statement
  : functions
  | functionCalls
  | jsBlock
  | ifElses
  | COMMENT
  | VARIABLE EQUAL contentType
    {
      $$ = yy.createVariable($1, $3)
    }
  | LOG LEFT_BRACE contentType RIGHT_BRACE
    {
      $$ = yy.log($3)
    }
  | NEWLINE
  ;

functions
  : FUNCTION VARIABLE LEFT_UBRACE functionStatements RIGHT_UBRACE
    {
      $$ = yy.createFunction({
        name: $2,
        content: $4,
        index: fi
      })
      fi++
    }
  | FUNCTION LEFT_UBRACE functionStatements RIGHT_UBRACE
    {
      $$ = yy.createFunction({
        name: ``,
        content: $3,
        index: fi
      })
      fi++
    }
  | FUNCTION VARIABLE LEFT_UBRACE functionStatements RIGHT_UBRACE LEFT_BRACE CALLABLE STAR NUMBER RIGHT_BRACE
    {
      $$ = yy.createFunction({
        name: $2,
        content: $4,
        index: fi,
        callable: $9
      })
      fi++
    }
  | ISNUMBER LEFT_BRACE contentType RIGHT_BRACE
    {
      $$ = yy.isNumber($3)
    }
  | DEBOUNCE LEFT_BRACE contentType NUMBER RIGHT_BRACE
    {
      $$ = yy.debounce($3, $4)
    }
  | RANDOM LEFT_BRACE NUMBER COMMA NUMBER RIGHT_BRACE
    {
      $$ = yy.random($3, $5)
    }
  ;

functionCalls
  : STAR NUMBER
    {
      $$ = yy.callFunction($2)
    }
  | STAR NUMBER LEFT_BRACE functionCallsInput RIGHT_BRACE
    {
      $$ = yy.callFunction($2, $4)
    }
  ;

functionCallsInput
  : functionCallsInput COMMA contentType
    {
      $$ = $1 + ', ' + $3
    }
  | contentType
  ;

functionStatements
  : functionStatements functionStatement
    {
      $$ = $1.concat($2)
    }
  | functionStatement
  ;

functionStatement
  : INPUT LEFT_BRACE functionInputs RIGHT_BRACE
    {
      $$ = $3
    }
  | OUTPUT LEFT_BRACE functionOutput RIGHT_BRACE
    {
      $$ = $3
    }
  | statement
  ;

functionInputs
  : functionInputs COMMA functionInput
    {
      $$ = $1.concat($3)
    }
  | functionInput
  ;

functionInput
  : VARIABLE COLON VARIABLE
    {
      $$ = yy.createFunctionInput($1, $3, fi)
    }
  ;

functionOutput
  : contentType
    {
      $$ = yy.createFunctionOutput($1, fi)
    }
  ;

jsBlock
  : LEFT_UBRACE STRING RIGHT_UBRACE
    {
      $$ = yy.jsBlock($2)
    }
  ;

ifElses
  : IF LEFT_BRACE ifBlocks RIGHT_BRACE LEFT_UBRACE statements RIGHT_UBRACE
    {
      $$ = yy.createIf($3, $6)
    }
  | IF LEFT_BRACE ifBlocks RIGHT_BRACE LEFT_UBRACE statements RIGHT_UBRACE ELSE LEFT_UBRACE statements RIGHT_UBRACE
    {
      $$ = yy.createIf($3, $6, $10)
    }
  ;

ifBlocks
  : ifBlocks COMMA ifBlock
    {
      $$ = $1 + ' && ' + ($3)
    }
  | ifBlock
  ;

ifBlock
  : functions
  | functionCalls
  ;

contentType
  : STRING
  | VARIABLE
  | NUMBER
  | statement
  ;

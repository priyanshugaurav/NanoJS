#pragma once
#include <string>
#include <vector>
#include <map>

enum JSTokenType {
    T_LET, T_CONST, T_VAR, T_FUNCTION, T_RETURN, T_IF, T_ELSE, T_WHILE, T_FOR,
    T_TRUE, T_FALSE, T_NULL, T_UNDEFINED, T_NEW, T_THIS, T_BREAK, T_CONTINUE,
    T_ASYNC, T_AWAIT, T_CLASS, T_EXTENDS, T_STATIC, T_TRY, T_CATCH, T_FINALLY,
    T_THROW, T_TYPEOF, T_INSTANCEOF, T_DELETE, T_IN, T_OF, T_EXPORT, T_IMPORT,
    T_IDENTIFIER, T_NUMBER, T_STRING, T_TEMPLATE, T_PLUS, T_MINUS, T_STAR,
    T_STARSTAR, T_SLASH, T_PERCENT, T_BANG, T_EQ, T_EQEQ, T_EQEQEQ, T_BANGEQ,
    T_BANGEQEQ, T_LT, T_GT, T_LTEQ, T_GTEQ, T_AMPAMP, T_PIPEPIPE, T_PLUSPLUS,
    T_MINUSMINUS, T_PLUSEQ, T_MINUSEQ, T_STAREQ, T_SLASHEQ, T_ARROW, T_SPREAD,
    T_LPAREN, T_RPAREN, T_LBRACE, T_RBRACE, T_LBRACKET, T_RBRACKET, T_COMMA,
    T_DOT, T_SEMICOLON, T_QUESTION, T_COLON, T_FROM, T_AS, T_SWITCH, T_CASE,
    T_DEFAULT, T_DO, T_BIT_AND, T_BIT_OR, T_BIT_XOR, T_BIT_NOT, T_LSHIFT,
    T_RSHIFT, T_COLON_EQ, T_SUPER, T_EOF
};

struct JSToken {
    JSTokenType type;
    std::string lexeme;
    int line;
};

class Lexer {
    std::string source;
    size_t current = 0;
    int line = 1;

    bool isAtEnd();
    char advance();
    char peek();
    char peekNext();
    bool match(char expected);
    void skipWhitespace();

public:
    Lexer(std::string src) : source(src) {}
    std::vector<JSToken> scan();
};
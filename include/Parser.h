#pragma once
#include "Lexer.h"
#include "AST.h"
#include <vector>
#include <memory>

class Parser {
    std::vector<JSToken> JSTokens;
    int cur = 0;

    bool match(JSTokenType t);
    bool match(std::vector<JSTokenType> types);
    JSToken peek();
    JSToken previous();
    JSToken advance();
    bool isAtEnd();
    JSToken consume(JSTokenType t, std::string msg);
    JSToken peekNext();

    // Recursive Descent methods
    std::unique_ptr<Expr> primary();
    std::unique_ptr<Expr> call();
    std::unique_ptr<Expr> unary();
    std::unique_ptr<Expr> exponentiation();
    std::unique_ptr<Expr> multiplication();
    std::unique_ptr<Expr> addition();
    std::unique_ptr<Expr> shift();
    std::unique_ptr<Expr> comparison();
    std::unique_ptr<Expr> equality();
    std::unique_ptr<Expr> bitwiseAnd();
    std::unique_ptr<Expr> bitwiseXor();
    std::unique_ptr<Expr> bitwiseOr();
    std::unique_ptr<Expr> logicalAnd();
    std::unique_ptr<Expr> logicalOr();
    std::unique_ptr<Expr> ternary();
    std::unique_ptr<Expr> assignment();
    std::unique_ptr<Expr> expression();
    
    std::unique_ptr<Expr> parseArrowFunction(std::vector<std::string> params, bool isAsync);
    
    std::unique_ptr<Stmt> classDeclaration();
    std::unique_ptr<Stmt> statement();
    std::unique_ptr<Stmt> declaration();

public:
    Parser(std::vector<JSToken> t) : JSTokens(t) {}
    std::vector<std::unique_ptr<Stmt>> parse();
};
#pragma once
#include "Forward.h"
#include "Lexer.h"
#include "Runtime/JSValue.h"
#include <vector>
#include <string>
#include <memory>

struct Expr {
    int line = 0;
    virtual ~Expr() = default;
};

struct Stmt {
    int line = 0;
    virtual ~Stmt() = default;
};

// Expressions
struct BinaryExpr : Expr {
    std::unique_ptr<Expr> left;
    JSToken op;
    std::unique_ptr<Expr> right;
    BinaryExpr(std::unique_ptr<Expr> l, JSToken o, std::unique_ptr<Expr> r)
        : left(std::move(l)), op(o), right(std::move(r)) {}
};

struct UnaryExpr : Expr {
    JSToken op;
    std::unique_ptr<Expr> right;
    UnaryExpr(JSToken o, std::unique_ptr<Expr> r) : op(o), right(std::move(r)) {}
};

struct PostfixExpr : Expr {
    std::unique_ptr<Expr> left;
    JSToken op;
    PostfixExpr(std::unique_ptr<Expr> l, JSToken o) : left(std::move(l)), op(o) {}
};

struct LogicalExpr : Expr {
    std::unique_ptr<Expr> left;
    JSToken op;
    std::unique_ptr<Expr> right;
    LogicalExpr(std::unique_ptr<Expr> l, JSToken o, std::unique_ptr<Expr> r)
        : left(std::move(l)), op(o), right(std::move(r)) {}
};

struct CallExpr : Expr {
    std::unique_ptr<Expr> callee;
    std::vector<std::unique_ptr<Expr>> args;
    CallExpr(std::unique_ptr<Expr> c, std::vector<std::unique_ptr<Expr>> a)
        : callee(std::move(c)), args(std::move(a)) {}
};

struct NewExpr : Expr {
    std::unique_ptr<Expr> callee;
    std::vector<std::unique_ptr<Expr>> args;
    NewExpr(std::unique_ptr<Expr> c, std::vector<std::unique_ptr<Expr>> a)
        : callee(std::move(c)), args(std::move(a)) {}
};

struct AwaitExpr : Expr {
    std::unique_ptr<Expr> argument;
    AwaitExpr(std::unique_ptr<Expr> a) : argument(std::move(a)) {}
};

struct GetExpr : Expr {
    std::unique_ptr<Expr> obj;
    JSToken name;
    GetExpr(std::unique_ptr<Expr> o, JSToken n) : obj(std::move(o)), name(n) {}
};

struct SetExpr : Expr {
    std::unique_ptr<Expr> obj;
    JSToken name;
    std::unique_ptr<Expr> value;
    SetExpr(std::unique_ptr<Expr> o, JSToken n, std::unique_ptr<Expr> v)
        : obj(std::move(o)), name(n), value(std::move(v)) {}
};

struct SetIndexExpr : Expr {
    std::unique_ptr<Expr> obj;
    std::unique_ptr<Expr> index;
    std::unique_ptr<Expr> value;
    SetIndexExpr(std::unique_ptr<Expr> o, std::unique_ptr<Expr> i, std::unique_ptr<Expr> v)
        : obj(std::move(o)), index(std::move(i)), value(std::move(v)) {}
};

struct IndexExpr : Expr {
    std::unique_ptr<Expr> obj;
    std::unique_ptr<Expr> index;
    IndexExpr(std::unique_ptr<Expr> o, std::unique_ptr<Expr> i)
        : obj(std::move(o)), index(std::move(i)) {}
};

struct AssignExpr : Expr {
    JSToken name;
    std::unique_ptr<Expr> value;
    AssignExpr(JSToken n, std::unique_ptr<Expr> v) : name(n), value(std::move(v)) {}
};

struct TernaryExpr : Expr {
    std::unique_ptr<Expr> condition;
    std::unique_ptr<Expr> thenBranch;
    std::unique_ptr<Expr> elseBranch;
    TernaryExpr(std::unique_ptr<Expr> c, std::unique_ptr<Expr> t, std::unique_ptr<Expr> e)
        : condition(std::move(c)), thenBranch(std::move(t)), elseBranch(std::move(e)) {}
};

struct ArrayLiteralExpr : Expr {
    std::vector<std::unique_ptr<Expr>> elements;
    ArrayLiteralExpr(std::vector<std::unique_ptr<Expr>> e) : elements(std::move(e)) {}
};

struct ObjectLiteralExpr : Expr {
    std::vector<std::pair<std::string, std::unique_ptr<Expr>>> properties;
    ObjectLiteralExpr(std::vector<std::pair<std::string, std::unique_ptr<Expr>>> p) 
        : properties(std::move(p)) {}
};

struct LiteralExpr : Expr {
    ValuePtr value;
    LiteralExpr(ValuePtr v) : value(v) {}
};

struct VarExpr : Expr {
    JSToken name;
    VarExpr(JSToken n) : name(n) {}
};

struct ThisExpr : Expr {};

struct FunctionExpr : Expr {
    std::vector<JSToken> params;
    std::unique_ptr<Stmt> body;
    bool isAsync;
    bool isArrow;
    FunctionExpr(std::vector<JSToken> p, std::unique_ptr<Stmt> b, bool async = false, bool arrow = false)
        : params(p), body(std::move(b)), isAsync(async), isArrow(arrow) {}
};

struct SuperExpr : Expr {};

// Statements
struct BlockStmt : Stmt {
    std::vector<std::unique_ptr<Stmt>> statements;
    bool isScoped;
    BlockStmt(std::vector<std::unique_ptr<Stmt>> s, bool scoped = true) 
        : statements(std::move(s)), isScoped(scoped) {}
};

struct VarStmt : Stmt {
    JSToken name;
    std::unique_ptr<Expr> init;
    JSTokenType type;
    VarStmt(JSToken n, std::unique_ptr<Expr> i, JSTokenType t)
        : name(n), init(std::move(i)), type(t) {}
};

struct FunStmt : Stmt {
    JSToken name;
    std::vector<JSToken> params;
    std::unique_ptr<BlockStmt> body;
    bool isAsync;
    FunStmt(JSToken n, std::vector<JSToken> p, std::unique_ptr<BlockStmt> b, bool async = false)
        : name(n), params(p), body(std::move(b)), isAsync(async) {}
};

struct ClassStmt : Stmt {
    JSToken name;
    std::unique_ptr<Expr> superclass;
    std::vector<std::unique_ptr<FunStmt>> methods;
    ClassStmt(JSToken n, std::unique_ptr<Expr> s, std::vector<std::unique_ptr<FunStmt>> m)
        : name(n), superclass(std::move(s)), methods(std::move(m)) {}
};

struct ReturnStmt : Stmt {
    std::unique_ptr<Expr> value;
    ReturnStmt(std::unique_ptr<Expr> v) : value(std::move(v)) {}
};

struct IfStmt : Stmt {
    std::unique_ptr<Expr> condition;
    std::unique_ptr<Stmt> thenBranch;
    std::unique_ptr<Stmt> elseBranch;
    IfStmt(std::unique_ptr<Expr> c, std::unique_ptr<Stmt> t, std::unique_ptr<Stmt> e)
        : condition(std::move(c)), thenBranch(std::move(t)), elseBranch(std::move(e)) {}
};

struct WhileStmt : Stmt {
    std::unique_ptr<Expr> condition;
    std::unique_ptr<Stmt> body;
    WhileStmt(std::unique_ptr<Expr> c, std::unique_ptr<Stmt> b)
        : condition(std::move(c)), body(std::move(b)) {}
};

struct DoWhileStmt : Stmt {
    std::unique_ptr<Stmt> body;
    std::unique_ptr<Expr> condition;
    DoWhileStmt(std::unique_ptr<Stmt> b, std::unique_ptr<Expr> c) 
        : body(std::move(b)), condition(std::move(c)) {}
};

struct ForStmt : Stmt {
    std::unique_ptr<Stmt> init;
    std::unique_ptr<Expr> condition;
    std::unique_ptr<Expr> increment;
    std::unique_ptr<Stmt> body;
    ForStmt(std::unique_ptr<Stmt> i, std::unique_ptr<Expr> c, std::unique_ptr<Expr> inc, std::unique_ptr<Stmt> b)
        : init(std::move(i)), condition(std::move(c)), increment(std::move(inc)), body(std::move(b)) {}
};

struct ForOfStmt : Stmt {
    JSToken varName;
    JSTokenType varType; 
    std::unique_ptr<Expr> iterable;
    std::unique_ptr<Stmt> body;
    ForOfStmt(JSToken n, JSTokenType t, std::unique_ptr<Expr> i, std::unique_ptr<Stmt> b)
        : varName(n), varType(t), iterable(std::move(i)), body(std::move(b)) {}
};

struct TryCatchStmt : Stmt {
    std::unique_ptr<BlockStmt> tryBlock;
    JSToken catchVar;
    std::unique_ptr<BlockStmt> catchBlock;
    std::unique_ptr<BlockStmt> finallyBlock;
    TryCatchStmt(std::unique_ptr<BlockStmt> t, JSToken cv, std::unique_ptr<BlockStmt> c, std::unique_ptr<BlockStmt> f)
        : tryBlock(std::move(t)), catchVar(cv), catchBlock(std::move(c)), finallyBlock(std::move(f)) {}
};

struct ThrowStmt : Stmt {
    std::unique_ptr<Expr> argument;
    ThrowStmt(std::unique_ptr<Expr> a) : argument(std::move(a)) {}
};

struct BreakStmt : Stmt {};
struct ContinueStmt : Stmt {};

struct ExpressionStmt : Stmt {
    std::unique_ptr<Expr> expr;
    ExpressionStmt(std::unique_ptr<Expr> e) : expr(std::move(e)) {}
};

struct ExportStmt : Stmt {
    std::unique_ptr<Stmt> declaration;
    ExportStmt(std::unique_ptr<Stmt> d) : declaration(std::move(d)) {}
};

struct ImportStmt : Stmt {
    std::string specifier;
    std::map<std::string, std::string> imports;
    ImportStmt(std::string s, std::map<std::string, std::string> i) 
        : specifier(s), imports(i) {}
};

struct SwitchCase {
    std::unique_ptr<Expr> value;
    std::vector<std::unique_ptr<Stmt>> statements;
};

struct SwitchStmt : Stmt {
    std::unique_ptr<Expr> expression;
    std::vector<SwitchCase> cases;
    SwitchStmt(std::unique_ptr<Expr> e, std::vector<SwitchCase> c) 
        : expression(std::move(e)), cases(std::move(c)) {}
};
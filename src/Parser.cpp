#include "../include/Parser.h"
#include "../include/Utils.h"

using namespace std;

// --- Helper Methods ---

bool Parser::match(JSTokenType t) {
    if (peek().type == t) {
        cur++;
        return true;
    }
    return false;
}

bool Parser::match(vector<JSTokenType> types) {
    for (auto t : types) {
        if (peek().type == t) {
            cur++;
            return true;
        }
    }
    return false;
}

JSToken Parser::peek() { return JSTokens[cur]; }
JSToken Parser::previous() { return JSTokens[cur - 1]; }
JSToken Parser::advance() { return JSTokens[cur++]; }
bool Parser::isAtEnd() { return peek().type == T_EOF; }

JSToken Parser::consume(JSTokenType t, string msg) {
    if (peek().type == t) return advance();
    throw runtime_error(msg + " at line " + to_string(peek().line));
}

JSToken Parser::peekNext() {
    if (cur + 1 >= JSTokens.size()) return JSTokens.back();
    return JSTokens[cur + 1];
}

// --- Expression Parsing (Lowest to Highest Precedence) ---

unique_ptr<Expr> Parser::expression() {
    return assignment();
}

unique_ptr<Expr> Parser::assignment() {
    auto expr = ternary();
    if (match(T_EQ)) {
        auto value = assignment();
        if (auto v = dynamic_cast<VarExpr*>(expr.get()))
            return make_unique<AssignExpr>(v->name, move(value));
        else if (auto g = dynamic_cast<GetExpr*>(expr.get()))
            return make_unique<SetExpr>(move(g->obj), g->name, move(value));
        else if (auto idx = dynamic_cast<IndexExpr*>(expr.get()))
            return make_unique<SetIndexExpr>(move(idx->obj), move(idx->index), move(value));
        throw runtime_error("Invalid assignment target");
    }
    return expr;
}

unique_ptr<Expr> Parser::ternary() {
    auto expr = logicalOr();
    if (match(T_QUESTION)) {
        auto thenBranch = expression();
        consume(T_COLON, "Expected ':'");
        auto elseBranch = expression();
        return make_unique<TernaryExpr>(move(expr), move(thenBranch), move(elseBranch));
    }
    return expr;
}

unique_ptr<Expr> Parser::logicalOr() {
    auto expr = logicalAnd();
    while (match(T_PIPEPIPE)) {
        JSToken op = previous();
        auto right = logicalAnd();
        expr = make_unique<LogicalExpr>(move(expr), op, move(right));
    }
    return expr;
}

unique_ptr<Expr> Parser::logicalAnd() {
    auto expr = bitwiseOr();
    while (match(T_AMPAMP)) {
        JSToken op = previous();
        auto right = bitwiseOr();
        expr = make_unique<LogicalExpr>(move(expr), op, move(right));
    }
    return expr;
}

unique_ptr<Expr> Parser::bitwiseOr() {
    auto expr = bitwiseXor();
    while (match(T_BIT_OR)) {
        JSToken op = previous();
        auto right = bitwiseXor();
        expr = make_unique<BinaryExpr>(move(expr), op, move(right));
    }
    return expr;
}

unique_ptr<Expr> Parser::bitwiseXor() {
    auto expr = bitwiseAnd();
    while (match(T_BIT_XOR)) {
        JSToken op = previous();
        auto right = bitwiseAnd();
        expr = make_unique<BinaryExpr>(move(expr), op, move(right));
    }
    return expr;
}

unique_ptr<Expr> Parser::bitwiseAnd() {
    auto expr = equality();
    while (match(T_BIT_AND)) {
        JSToken op = previous();
        auto right = equality();
        expr = make_unique<BinaryExpr>(move(expr), op, move(right));
    }
    return expr;
}

unique_ptr<Expr> Parser::equality() {
    auto expr = comparison();
    while (match({T_BANGEQ, T_EQEQ, T_EQEQEQ, T_BANGEQEQ})) {
        JSToken op = previous();
        auto right = comparison();
        expr = make_unique<BinaryExpr>(move(expr), op, move(right));
    }
    return expr;
}

unique_ptr<Expr> Parser::comparison() {
    auto expr = shift();
    while (match({T_GT, T_GTEQ, T_LT, T_LTEQ})) {
        JSToken op = previous();
        auto right = shift();
        expr = make_unique<BinaryExpr>(move(expr), op, move(right));
    }
    return expr;
}

unique_ptr<Expr> Parser::shift() {
    auto expr = addition();
    while (match({T_LSHIFT, T_RSHIFT})) {
        JSToken op = previous();
        auto right = addition();
        expr = make_unique<BinaryExpr>(move(expr), op, move(right));
    }
    return expr;
}

unique_ptr<Expr> Parser::addition() {
    auto expr = multiplication();
    while (match({T_PLUS, T_MINUS})) {
        JSToken op = previous();
        auto right = multiplication();
        expr = make_unique<BinaryExpr>(move(expr), op, move(right));
    }
    return expr;
}

unique_ptr<Expr> Parser::multiplication() {
    auto expr = exponentiation();
    while (match({T_STAR, T_SLASH, T_PERCENT})) {
        JSToken op = previous();
        auto right = exponentiation();
        auto bin = make_unique<BinaryExpr>(move(expr), op, move(right));
        bin->line = op.line;
        expr = move(bin);
    }
    return expr;
}

unique_ptr<Expr> Parser::exponentiation() {
    auto expr = unary();
    while (match({T_STARSTAR})) {
        JSToken op = previous();
        auto right = exponentiation();
        auto bin = make_unique<BinaryExpr>(move(expr), op, move(right));
        bin->line = op.line;
        expr = move(bin);
    }
    return expr;
}

unique_ptr<Expr> Parser::unary() {
    if (match({T_BANG, T_MINUS, T_PLUS, T_TYPEOF, T_BIT_NOT, T_PLUSPLUS, T_MINUSMINUS})) {
        JSToken op = previous();
        if (op.type == T_PLUSPLUS || op.type == T_MINUSMINUS) {
            auto right = unary(); 
            return make_unique<UnaryExpr>(op, move(right));
        }
        auto right = unary();
        return make_unique<UnaryExpr>(op, move(right));
    }
    if (match(T_AWAIT)) {
        auto arg = unary();
        return make_unique<AwaitExpr>(move(arg));
    }
    return call();
}

unique_ptr<Expr> Parser::call() {
    auto expr = primary();
    while (true) {
        if (match(T_LPAREN)) {
            int line = previous().line;
            vector<unique_ptr<Expr>> args;
            if (peek().type != T_RPAREN) {
                do { args.push_back(expression()); } while (match(T_COMMA));
            }
            consume(T_RPAREN, "Expected ')'");
            expr = make_unique<CallExpr>(move(expr), move(args));
            expr->line = line;
        }
        else if (match(T_DOT)) {
            int line = previous().line;
            JSToken name;
            if (peek().type == T_DELETE) { name = advance(); name.type = T_IDENTIFIER; name.lexeme = "delete"; }
            else if (peek().type == T_CATCH) { name = advance(); name.type = T_IDENTIFIER; name.lexeme = "catch"; }
            else if (peek().type == T_ASYNC) { name = advance(); name.type = T_IDENTIFIER; name.lexeme = "async"; }
            else { name = consume(T_IDENTIFIER, "Expected property name"); }

            expr = make_unique<GetExpr>(move(expr), name);
            expr->line = line;
        }
        else if (match(T_LBRACKET)) {
            auto index = expression();
            consume(T_RBRACKET, "Expected ']'");
            expr = make_unique<IndexExpr>(move(expr), move(index));
        }
        else if (match({T_PLUSPLUS, T_MINUSMINUS})) {
            JSToken op = previous();
            expr = make_unique<PostfixExpr>(move(expr), op);
            expr->line = op.line;
        }
        else {
            break;
        }
    }
    return expr;
}

unique_ptr<Expr> Parser::primary() {
    bool isAsync = false;
    if (peek().type == T_ASYNC && (peekNext().type == T_LPAREN || peekNext().type == T_IDENTIFIER)) {
        advance();
        isAsync = true;
    }

    if (match(T_SUPER)) {
        return make_unique<SuperExpr>();
    }

    if (match(T_LPAREN)) {
        // Check for Arrow Function (empty params)
        if (peek().type == T_RPAREN && peekNext().type == T_ARROW) {
            consume(T_RPAREN, "");
            consume(T_ARROW, "");
            return parseArrowFunction({}, isAsync);
        }

        auto expr = expression();

        // Check for Arrow Function (multiple params or one param with comma)
        if (match(T_COMMA)) {
            vector<string> params;
            if (auto v = dynamic_cast<VarExpr*>(expr.get()))
                params.push_back(v->name.lexeme);
            else
                throw runtime_error("Invalid arrow parameter");

            do {
                JSToken t = consume(T_IDENTIFIER, "Expected parameter name");
                params.push_back(t.lexeme);
            } while (match(T_COMMA));

            consume(T_RPAREN, "Expected ')'");
            consume(T_ARROW, "Expected '=>' after parameters");
            return parseArrowFunction(params, isAsync);
        }

        consume(T_RPAREN, "Expected ')'");

        // Check for Arrow Function (single param in parens)
        if (match(T_ARROW)) {
            vector<string> params;
            if (auto v = dynamic_cast<VarExpr*>(expr.get()))
                params.push_back(v->name.lexeme);
            else
                throw runtime_error("Invalid arrow parameter");
            return parseArrowFunction(params, isAsync);
        }

        return expr;
    }

    if (isAsync && peek().type == T_IDENTIFIER) {
        JSToken token = advance();
        if (match(T_ARROW)) {
            return parseArrowFunction({token.lexeme}, true);
        }
        throw runtime_error("Expected '=>' after async parameter");
    }

    if (match(T_NEW)) {
        JSToken name = consume(T_IDENTIFIER, "Expected class or function name after 'new'");
        auto callee = make_unique<VarExpr>(name);
        vector<unique_ptr<Expr>> args;
        if (match(T_LPAREN)) {
            if (peek().type != T_RPAREN) {
                do { args.push_back(expression()); } while (match(T_COMMA));
            }
            consume(T_RPAREN, "Expected ')' after arguments");
        }
        return make_unique<NewExpr>(move(callee), move(args));
    }

    if (match(T_NUMBER)) return make_unique<LiteralExpr>(JSValue::makeNumber(stod(previous().lexeme)));
    if (match(T_STRING)) return make_unique<LiteralExpr>(JSValue::makeString(previous().lexeme));
    if (match(T_TEMPLATE)) return make_unique<LiteralExpr>(JSValue::makeString(previous().lexeme));
    if (match(T_TRUE)) return make_unique<LiteralExpr>(JSValue::makeBool(true));
    if (match(T_FALSE)) return make_unique<LiteralExpr>(JSValue::makeBool(false));
    if (match(T_NULL)) return make_unique<LiteralExpr>(JSValue::makeNull());
    if (match(T_UNDEFINED)) return make_unique<LiteralExpr>(JSValue::makeUndefined());
    if (match(T_THIS)) return make_unique<ThisExpr>();
    
    if (match(T_IDENTIFIER)) {
        JSToken token = previous();
        if (match(T_ARROW)) {
            return parseArrowFunction({token.lexeme}, false);
        }
        auto expr = make_unique<VarExpr>(token);
        expr->line = token.line;
        return expr;
    }

    if (match(T_LBRACKET)) {
        vector<unique_ptr<Expr>> elements;
        if (peek().type != T_RBRACKET) {
            do { elements.push_back(expression()); } while (match(T_COMMA));
        }
        consume(T_RBRACKET, "Expected ']'");
        return make_unique<ArrayLiteralExpr>(move(elements));
    }
    
    if (match(T_LBRACE)) {
        vector<pair<string, unique_ptr<Expr>>> properties;
        if (peek().type != T_RBRACE) {
            do {
                JSToken key = consume(T_IDENTIFIER, "Expected property name");
                consume(T_COLON, "Expected ':'");
                auto value = expression();
                properties.push_back({key.lexeme, move(value)});
            } while (match(T_COMMA));
        }
        consume(T_RBRACE, "Expected '}'");
        return make_unique<ObjectLiteralExpr>(move(properties));
    }

    if (match(T_FUNCTION)) {
        consume(T_LPAREN, "Expected '('");
        vector<JSToken> params;
        if (peek().type != T_RPAREN) {
            do {
                params.push_back(consume(T_IDENTIFIER, "Expected parameter"));
            } while (match(T_COMMA));
        }
        consume(T_RPAREN, "Expected ')'");
        auto body = statement();
        return make_unique<FunctionExpr>(params, move(body), isAsync);
    }

    throw runtime_error("Expected expression at line " + to_string(peek().line));
}

// --- Declaration & Statement Parsing ---

unique_ptr<Expr> Parser::parseArrowFunction(vector<string> params, bool isAsync) {
    unique_ptr<Stmt> body;
    if (match(T_LBRACE)) {
        vector<unique_ptr<Stmt>> stmts;
        while (peek().type != T_RBRACE && peek().type != T_EOF) {
            stmts.push_back(declaration());
        }
        consume(T_RBRACE, "Expected '}' after arrow body");
        body = make_unique<BlockStmt>(move(stmts));
    } else {
        auto expr = expression();
        vector<unique_ptr<Stmt>> stmts;
        stmts.push_back(make_unique<ReturnStmt>(move(expr)));
        body = make_unique<BlockStmt>(move(stmts));
    }

    vector<JSToken> paramTokens;
    for (const auto& p : params) {
        paramTokens.push_back(JSToken{T_IDENTIFIER, p, 0});
    }
    return make_unique<FunctionExpr>(paramTokens, move(body), isAsync, true);
}

unique_ptr<Stmt> Parser::classDeclaration() {
    JSToken name = consume(T_IDENTIFIER, "Expected class name");
    unique_ptr<Expr> superclass = nullptr;
    if (match(T_EXTENDS)) {
        consume(T_IDENTIFIER, "Expected superclass name");
        superclass = make_unique<VarExpr>(previous());
    }

    consume(T_LBRACE, "Expected '{' before class body");
    vector<unique_ptr<FunStmt>> methods;
    while (peek().type != T_RBRACE && peek().type != T_EOF) {
        bool isAsync = match(T_ASYNC);
        JSToken methodName = consume(T_IDENTIFIER, "Expected method name");
        consume(T_LPAREN, "Expected '('");
        vector<JSToken> params;
        if (peek().type != T_RPAREN) {
            do {
                params.push_back(consume(T_IDENTIFIER, "Expected parameter"));
            } while (match(T_COMMA));
        }
        consume(T_RPAREN, "Expected ')'");
        consume(T_LBRACE, "Expected '{'");
        vector<unique_ptr<Stmt>> bodyStmts;
        while (peek().type != T_RBRACE && peek().type != T_EOF) {
            bodyStmts.push_back(declaration());
        }
        consume(T_RBRACE, "Expected '}'");
        auto body = make_unique<BlockStmt>(move(bodyStmts));
        methods.push_back(make_unique<FunStmt>(methodName, params, move(body), isAsync));
    }
    consume(T_RBRACE, "Expected '}' after class body");
    return make_unique<ClassStmt>(name, move(superclass), move(methods));
}

unique_ptr<Stmt> Parser::statement() {
    if (match(T_IF)) {
        consume(T_LPAREN, "Expected '('");
        auto condition = expression();
        consume(T_RPAREN, "Expected ')'");
        auto thenBranch = statement();
        unique_ptr<Stmt> elseBranch = nullptr;
        if (match(T_ELSE)) elseBranch = statement();
        return make_unique<IfStmt>(move(condition), move(thenBranch), move(elseBranch));
    }

    if (match(T_SWITCH)) {
        consume(T_LPAREN, "Expected '(' after switch");
        auto expr = expression();
        consume(T_RPAREN, "Expected ')' after switch value");
        consume(T_LBRACE, "Expected '{' before switch cases");

        vector<SwitchCase> cases;
        while (!isAtEnd() && peek().type != T_RBRACE) {
            SwitchCase currentCase;
            if (match(T_CASE)) {
                currentCase.value = expression();
                consume(T_COLON, "Expected ':' after case value");
            } else if (match(T_DEFAULT)) {
                currentCase.value = nullptr;
                consume(T_COLON, "Expected ':' after default");
            } else {
                throw runtime_error("Expected 'case' or 'default'");
            }

            while (!isAtEnd() && peek().type != T_CASE && peek().type != T_DEFAULT && peek().type != T_RBRACE) {
                currentCase.statements.push_back(declaration());
            }
            cases.push_back(move(currentCase));
        }
        consume(T_RBRACE, "Expected '}' after switch cases");
        return make_unique<SwitchStmt>(move(expr), move(cases));
    }

    if (match(T_DO)) {
        auto body = statement();
        consume(T_WHILE, "Expected 'while' after do-loop body");
        consume(T_LPAREN, "Expected '(' after while");
        auto condition = expression();
        consume(T_RPAREN, "Expected ')' after condition");
        consume(T_SEMICOLON, "Expected ';'");
        return make_unique<DoWhileStmt>(move(body), move(condition));
    }

    if (match(T_WHILE)) {
        consume(T_LPAREN, "Expected '('");
        auto condition = expression();
        consume(T_RPAREN, "Expected ')'");
        auto body = statement();
        return make_unique<WhileStmt>(move(condition), move(body));
    }
    
    if (match(T_FOR)) {
        consume(T_LPAREN, "Expected '('");
        if (match({T_LET, T_VAR, T_CONST})) {
            JSTokenType type = previous().type;
            JSToken name = consume(T_IDENTIFIER, "Expected variable name");

            if (match(T_OF)) {
                auto iterable = expression();
                consume(T_RPAREN, "Expected ')'");
                auto body = statement();
                return make_unique<ForOfStmt>(name, type, move(iterable), move(body));
            }

            unique_ptr<Expr> initExpr = nullptr;
            if (match(T_EQ)) initExpr = expression();
            auto init = make_unique<VarStmt>(name, move(initExpr), type);
            consume(T_SEMICOLON, "Expected ';'");
            
            unique_ptr<Expr> condition = nullptr;
            if (peek().type != T_SEMICOLON) condition = expression();
            consume(T_SEMICOLON, "Expected ';'");
            
            unique_ptr<Expr> increment = nullptr;
            if (peek().type != T_RPAREN) increment = expression();
            consume(T_RPAREN, "Expected ')'");
            
            auto body = statement();
            return make_unique<ForStmt>(move(init), move(condition), move(increment), move(body));
        }

        unique_ptr<Stmt> init = nullptr;
        if (!match(T_SEMICOLON)) {
            auto expr = expression();
            init = make_unique<ExpressionStmt>(move(expr));
            consume(T_SEMICOLON, "Expected ';'");
        }
        unique_ptr<Expr> condition = nullptr;
        if (peek().type != T_SEMICOLON) condition = expression();
        consume(T_SEMICOLON, "Expected ';'");
        unique_ptr<Expr> increment = nullptr;
        if (peek().type != T_RPAREN) increment = expression();
        consume(T_RPAREN, "Expected ')'");
        auto body = statement();
        return make_unique<ForStmt>(move(init), move(condition), move(increment), move(body));
    }

    if (match(T_TRY)) {
        consume(T_LBRACE, "Expected '{'");
        auto tryBlock = make_unique<BlockStmt>(vector<unique_ptr<Stmt>>());
        while (peek().type != T_RBRACE && peek().type != T_EOF) {
            tryBlock->statements.push_back(declaration());
        }
        consume(T_RBRACE, "Expected '}'");

        JSToken catchVar = JSToken{T_IDENTIFIER, "error", 0};
        unique_ptr<BlockStmt> catchBlock = nullptr;
        if (match(T_CATCH)) {
            consume(T_LPAREN, "Expected '('");
            catchVar = consume(T_IDENTIFIER, "Expected catch variable");
            consume(T_RPAREN, "Expected ')'");
            consume(T_LBRACE, "Expected '{'");
            catchBlock = make_unique<BlockStmt>(vector<unique_ptr<Stmt>>());
            while (peek().type != T_RBRACE && peek().type != T_EOF) {
                catchBlock->statements.push_back(declaration());
            }
            consume(T_RBRACE, "Expected '}'");
        }
        unique_ptr<BlockStmt> finallyBlock = nullptr;
        if (match(T_FINALLY)) {
            consume(T_LBRACE, "Expected '{'");
            finallyBlock = make_unique<BlockStmt>(vector<unique_ptr<Stmt>>());
            while (peek().type != T_RBRACE && peek().type != T_EOF) {
                finallyBlock->statements.push_back(declaration());
            }
            consume(T_RBRACE, "Expected '}'");
        }
        return make_unique<TryCatchStmt>(move(tryBlock), catchVar, move(catchBlock), move(finallyBlock));
    }
    if (match(T_THROW)) {
        auto arg = expression();
        consume(T_SEMICOLON, "Expected ';'");
        return make_unique<ThrowStmt>(move(arg));
    }
    if (match(T_RETURN)) {
        unique_ptr<Expr> value = nullptr;
        if (peek().type != T_SEMICOLON) value = expression();
        consume(T_SEMICOLON, "Expected ';'");
        return make_unique<ReturnStmt>(move(value));
    }
    if (match(T_BREAK)) {
        consume(T_SEMICOLON, "Expected ';'");
        return make_unique<BreakStmt>();
    }
    if (match(T_CONTINUE)) {
        consume(T_SEMICOLON, "Expected ';'");
        return make_unique<ContinueStmt>();
    }
    if (match(T_LBRACE)) {
        vector<unique_ptr<Stmt>> statements;
        while (peek().type != T_RBRACE && peek().type != T_EOF) {
            statements.push_back(declaration());
        }
        consume(T_RBRACE, "Expected '}'");
        return make_unique<BlockStmt>(move(statements));
    }
    auto expr = expression();
    consume(T_SEMICOLON, "Expected ';'");
    return make_unique<ExpressionStmt>(move(expr));
}

unique_ptr<Stmt> Parser::declaration() {
    if (match(T_CLASS)) return classDeclaration();
    if (match(T_EXPORT)) {
        auto decl = declaration();
        return make_unique<ExportStmt>(move(decl));
    }
    if (match(T_IMPORT)) {
        map<string, string> imports;
        consume(T_LBRACE, "Expected '{' after import");
        do {
            JSToken name = consume(T_IDENTIFIER, "Expected variable name to import");
            string localName = name.lexeme;
            if (match(T_AS)) {
                localName = consume(T_IDENTIFIER, "Expected alias after 'as'").lexeme;
            }
            imports[name.lexeme] = localName;
        } while (match(T_COMMA));
        consume(T_RBRACE, "Expected '}'");
        consume(T_FROM, "Expected 'from' after import list");
        string path = consume(T_STRING, "Expected module path string").lexeme;
        consume(T_SEMICOLON, "Expected ';'");
        return make_unique<ImportStmt>(path, imports);
    }
    if (match({T_LET, T_VAR, T_CONST})) {
        JSTokenType type = previous().type;
        
        // Destructuring
        if (match(T_LBRACE)) {
            vector<string> props;
            do {
                props.push_back(consume(T_IDENTIFIER, "Expected property name").lexeme);
            } while (match(T_COMMA));
            consume(T_RBRACE, "Expected '}'");
            consume(T_EQ, "Expected '='");
            auto init = expression();
            consume(T_SEMICOLON, "Expected ';'");
            
            vector<unique_ptr<Stmt>> stmts;
            string tempName = "_destruct_temp_" + to_string(rand()); 
            JSToken tempToken = {T_IDENTIFIER, tempName, 0};
            stmts.push_back(make_unique<VarStmt>(tempToken, move(init), type));
            
            for(const auto& prop : props) {
                auto tempVar = make_unique<VarExpr>(tempToken);
                auto getProp = make_unique<GetExpr>(move(tempVar), JSToken{T_IDENTIFIER, prop, 0});
                stmts.push_back(make_unique<VarStmt>(JSToken{T_IDENTIFIER, prop, 0}, move(getProp), type));
            }
            return make_unique<BlockStmt>(move(stmts), false);
        }

        JSToken name = consume(T_IDENTIFIER, "Expected variable name");
        unique_ptr<Expr> init = nullptr;
        if (match(T_EQ)) init = expression();
        if (type == T_CONST && init == nullptr)
            throw runtime_error("Missing initializer in const declaration");
        consume(T_SEMICOLON, "Expected ';'");
        return make_unique<VarStmt>(name, move(init), type);
    }

    bool isAsync = match(T_ASYNC);
    if (match(T_FUNCTION)) {
        JSToken name = consume(T_IDENTIFIER, "Expected function name");
        consume(T_LPAREN, "Expected '('");
        vector<JSToken> params;
        if (peek().type != T_RPAREN) {
            do {
                if (match(T_SPREAD)) {
                     JSToken param = consume(T_IDENTIFIER, "Expected parameter name after ...");
                     params.push_back(JSToken{T_IDENTIFIER, "..." + param.lexeme, param.line});
                } else {
                     params.push_back(consume(T_IDENTIFIER, "Expected parameter"));
                }
            } while (match(T_COMMA));
        }
        consume(T_RPAREN, "Expected ')'");
        consume(T_LBRACE, "Expected '{'");
        vector<unique_ptr<Stmt>> bodyStmts;
        while (peek().type != T_RBRACE && peek().type != T_EOF) {
            bodyStmts.push_back(declaration());
        }
        consume(T_RBRACE, "Expected '}'");
        auto body = make_unique<BlockStmt>(move(bodyStmts));
        return make_unique<FunStmt>(name, params, move(body), isAsync);
    }

    return statement();
}

vector<unique_ptr<Stmt>> Parser::parse() {
    vector<unique_ptr<Stmt>> program;
    while (peek().type != T_EOF) {
        program.push_back(declaration());
    }
    return program;
}
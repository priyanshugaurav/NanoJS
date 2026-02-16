#pragma once
#include "Forward.h"
#include "Runtime/Environment.h"
#include "Runtime/JSValue.h"
#include "Runtime/EventLoop.h"
#include "AST.h"
#include <set>
#include <map>
#include <list>

class Interpreter {
public:
    std::shared_ptr<Environment> globals;
    std::shared_ptr<Environment> environment;
    ValuePtr thisValue = nullptr;
    EventLoop eventLoop;
    std::set<int> activeTimers;
    int nextTimerId = 1;
    
    // Module Cache
    std::map<std::string, std::map<std::string, ValuePtr>> moduleCache;
    // AST storage to keep modules alive
    std::list<std::vector<std::unique_ptr<Stmt>>> moduleASTs;

    Interpreter();

    void setupPromise(ValuePtr promise);
    ValuePtr eval(Expr* e);
    void execute(Stmt* stmt);
    void executeBlock(const std::vector<std::unique_ptr<Stmt>>& stmts);
    void run(std::vector<std::unique_ptr<Stmt>>& program);
};
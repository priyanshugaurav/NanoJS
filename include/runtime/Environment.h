#pragma once
#include "../Forward.h"
#include "../Lexer.h"
#include "JSValue.h"
#include <map>
#include <string>
#include <set>

struct Environment : std::enable_shared_from_this<Environment>
{
    std::map<std::string, ValuePtr> values;
    std::map<std::string, bool> isConst;
    std::set<std::string> exportedNames;
    std::shared_ptr<Environment> outer;
    bool isFunctionScope; 

    Environment(std::shared_ptr<Environment> o = nullptr, bool funcScope = false)
        : outer(o), isFunctionScope(funcScope) {}

    void define(std::string name, ValuePtr val, bool constant = false);
    void defineVar(std::string name, ValuePtr val);
    ValuePtr get(JSToken name);
    void assign(JSToken name, ValuePtr value);
};
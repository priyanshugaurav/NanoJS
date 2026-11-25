#include "../../include/runtime/Environment.h"

using namespace std;

void Environment::define(string name, ValuePtr val, bool constant) {
    values[name] = val;
    if (constant) isConst[name] = true;
}

void Environment::defineVar(string name, ValuePtr val) {
    if (isFunctionScope || !outer) {
        values[name] = val;
        isConst[name] = false;
    } else {
        outer->defineVar(name, val);
    }
}

ValuePtr Environment::get(JSToken name) {
    if (values.count(name.lexeme)) return values[name.lexeme];
    if (outer) return outer->get(name);
    throw JSRuntimeError(name.line, "ReferenceError", name.lexeme + " is not defined");
}

void Environment::assign(JSToken name, ValuePtr value) {
    if (values.count(name.lexeme)) {
        if (isConst[name.lexeme]) {
            throw JSRuntimeError(name.line, "TypeError", "Assignment to constant variable '" + name.lexeme + "'");
        }
        values[name.lexeme] = value;
        return;
    }
    if (outer) {
        outer->assign(name, value);
        return;
    }
    throw JSRuntimeError(name.line, "ReferenceError", name.lexeme + " is not defined");
}
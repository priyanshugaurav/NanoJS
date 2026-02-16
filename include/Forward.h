#pragma once
#include <memory>
#include <vector>
#include <functional>

// Forward declarations to break circular dependencies
class JSValue;
class Interpreter;
struct Environment;
struct Stmt;
struct Expr;

// Common Typedefs
using ValuePtr = std::shared_ptr<JSValue>;
using NativeFunction = std::function<ValuePtr(std::vector<ValuePtr>&, Interpreter*)>;
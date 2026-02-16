#pragma once
#include "../Forward.h"
#include "../Utils.h"
#include <string>
#include <map>
#include <vector>
#include <variant>
#include <regex>
#include <chrono>
#include <set>

enum class JSType {
    NUMBER, STRING, BOOLEAN, OBJECT, ARRAY, FUNCTION,
    UNDEFINED, JS_NULL, PROMISE, REGEXP, DATE, JS_ERROR, SET, MAP
};

enum class PromiseState { PENDING, FULFILLED, REJECTED };

struct JSPromise {
    PromiseState state = PromiseState::PENDING;
    ValuePtr value = nullptr;
    std::vector<std::function<void(ValuePtr)>> thenCallbacks;
    std::vector<std::function<void(ValuePtr)>> catchCallbacks;
};

struct JSRegExp {
    std::regex pattern;
    std::string source;
    std::string flags;
    bool global = false;
    bool ignoreCase = false;
    bool multiline = false;
};

struct JSDate {
    std::chrono::system_clock::time_point time;
    JSDate();
    JSDate(long long ms);
};

struct JSError {
    std::string message;
    std::string type;
    JSError(std::string msg, std::string t = "Error") : message(msg), type(t) {}
};

struct JSSet { std::set<std::string> values; };
struct JSMap { std::map<std::string, ValuePtr> entries; };

struct JSFunction {
    std::string name;
    std::vector<std::string> params;
    Stmt* body = nullptr;
    std::shared_ptr<Environment> closure;
    bool isNative = false;
    bool isAsync = false;
    NativeFunction nativeFn;
    bool isArrow = false;
    ValuePtr capturedThis = nullptr;
    bool isBound = false;
    ValuePtr boundThis = nullptr;
    bool isClassConstructor = false;
};

class JSValue : public std::enable_shared_from_this<JSValue>
{
public:
    JSType type;
    std::variant<double, std::string, bool, std::vector<ValuePtr>, 
                 std::shared_ptr<JSFunction>, std::shared_ptr<JSPromise>, 
                 std::shared_ptr<JSRegExp>, std::shared_ptr<JSDate>,
                 std::shared_ptr<JSError>, std::shared_ptr<JSSet>, 
                 std::shared_ptr<JSMap>> data;

    std::map<std::string, ValuePtr> properties;
    std::shared_ptr<JSValue> prototype;

    JSValue(JSType t = JSType::UNDEFINED) : type(t) {}

    // Factory Methods
    static ValuePtr makeNumber(double n);
    static ValuePtr makeString(std::string s);
    static ValuePtr makeBool(bool b);
    static ValuePtr makeArray();
    static ValuePtr makeObject();
    static ValuePtr makeNull();
    static ValuePtr makeUndefined();
    static ValuePtr makePromise();
    static ValuePtr makeRegExp(std::string pattern, std::string flags = "");
    static ValuePtr makeDate(long long ms = -1);
    static ValuePtr makeError(std::string message, std::string type = "Error");
    static ValuePtr makeSet();
    static ValuePtr makeMap();
    static ValuePtr makeNativeFunction(std::string name, NativeFunction fn);

    // Methods
    std::string toString();
    bool toBoolean();
    double toNumber();
    ValuePtr getProp(std::string key);
    void setProp(std::string key, ValuePtr value);
    ValuePtr getIndex(size_t idx);
    void setIndex(size_t idx, ValuePtr value);
};

void setupArrayPrototype(Interpreter* interp, ValuePtr arr);
void setupSetPrototype(Interpreter* interp, ValuePtr set);
void setupMapPrototype(Interpreter* interp, ValuePtr map);
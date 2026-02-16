#include "../../include/Runtime/JSValue.h"
#include "../../include/Interpreter.h"
#include <cmath>
#include <algorithm>

using namespace std;

JSDate::JSDate() : time(chrono::system_clock::now()) {}
JSDate::JSDate(long long ms) : time(chrono::system_clock::time_point(chrono::milliseconds(ms))) {}

// --- Factory Methods ---
ValuePtr JSValue::makeNumber(double n) {
    auto v = make_shared<JSValue>(JSType::NUMBER);
    v->data = n;
    return v;
}
ValuePtr JSValue::makeString(string s) {
    auto v = make_shared<JSValue>(JSType::STRING);
    v->data = s;
    return v;
}
ValuePtr JSValue::makeBool(bool b) {
    auto v = make_shared<JSValue>(JSType::BOOLEAN);
    v->data = b;
    return v;
}
ValuePtr JSValue::makeArray() {
    auto v = make_shared<JSValue>(JSType::ARRAY);
    v->data = vector<ValuePtr>();
    return v;
}
ValuePtr JSValue::makeObject() { return make_shared<JSValue>(JSType::OBJECT); }
ValuePtr JSValue::makeNull() { return make_shared<JSValue>(JSType::JS_NULL); }
ValuePtr JSValue::makeUndefined() { return make_shared<JSValue>(JSType::UNDEFINED); }
ValuePtr JSValue::makePromise() {
    auto v = make_shared<JSValue>(JSType::PROMISE);
    v->data = make_shared<JSPromise>();
    return v;
}
ValuePtr JSValue::makeRegExp(string pattern, string flags) {
    auto v = make_shared<JSValue>(JSType::REGEXP);
    auto re = make_shared<JSRegExp>();
    regex_constants::syntax_option_type regexFlags = regex_constants::ECMAScript;
    if (flags.find('i') != string::npos) {
        regexFlags |= regex_constants::icase;
        re->ignoreCase = true;
    }
    re->pattern = regex(pattern, regexFlags);
    re->source = pattern;
    re->flags = flags;
    re->global = flags.find('g') != string::npos;
    re->multiline = flags.find('m') != string::npos;
    v->data = re;
    return v;
}
ValuePtr JSValue::makeDate(long long ms) {
    auto v = make_shared<JSValue>(JSType::DATE);
    if (ms == -1) v->data = make_shared<JSDate>();
    else v->data = make_shared<JSDate>(ms);
    return v;
}
ValuePtr JSValue::makeError(string message, string type) {
    auto v = make_shared<JSValue>(JSType::JS_ERROR);
    v->data = make_shared<JSError>(message, type);
    v->properties["message"] = makeString(message);
    return v;
}
ValuePtr JSValue::makeSet() {
    auto v = make_shared<JSValue>(JSType::SET);
    v->data = make_shared<JSSet>();
    return v;
}
ValuePtr JSValue::makeMap() {
    auto v = make_shared<JSValue>(JSType::MAP);
    v->data = make_shared<JSMap>();
    return v;
}
ValuePtr JSValue::makeNativeFunction(string name, NativeFunction fn) {
    auto jsFunc = make_shared<JSFunction>();
    jsFunc->name = name;
    jsFunc->isNative = true;
    jsFunc->nativeFn = fn;
    auto v = make_shared<JSValue>(JSType::FUNCTION);
    v->data = jsFunc;
    return v;
}

// --- Methods ---
string JSValue::toString() {
    switch (type) {
    case JSType::NUMBER: {
        double n = get<double>(data);
        if (isnan(n)) return "NaN";
        if (isinf(n)) return n > 0 ? "Infinity" : "-Infinity";
        if (floor(n) == n) return to_string((long long)n);
        string s = to_string(n);
        s.erase(s.find_last_not_of('0') + 1, string::npos);
        if (s.back() == '.') s.pop_back();
        return s;
    }
    case JSType::STRING: return get<string>(data);
    case JSType::BOOLEAN: return get<bool>(data) ? "true" : "false";
    case JSType::ARRAY: {
        auto& arr = get<vector<ValuePtr>>(data);
        string result = "[";
        for (size_t i = 0; i < arr.size(); i++) {
            if (i > 0) result += ", ";
            result += arr[i]->toString();
        }
        result += "]";
        return result;
    }
    case JSType::OBJECT: {
        string result = "{ ";
        bool first = true;
        for (auto& [key, val] : properties) {
            if (!first) result += ", ";
            result += key + ": " + val->toString();
            first = false;
        }
        result += " }";
        return result;
    }
    case JSType::FUNCTION: {
        auto fn = get<shared_ptr<JSFunction>>(data);
        return "[Function: " + fn->name + "]";
    }
    case JSType::PROMISE: return "[Promise]";
    case JSType::REGEXP: {
        auto re = get<shared_ptr<JSRegExp>>(data);
        return "/" + re->source + "/" + re->flags;
    }
    case JSType::DATE: {
        auto date = get<shared_ptr<JSDate>>(data);
        auto time_t = chrono::system_clock::to_time_t(date->time);
        string t = ctime(&time_t);
        if (!t.empty() && t.back() == '\n') t.pop_back();
        return t;
    }
    case JSType::JS_ERROR: {
        auto err = get<shared_ptr<JSError>>(data);
        return err->type + ": " + err->message;
    }
    case JSType::SET: return "[Set]";
    case JSType::MAP: return "[Map]";
    case JSType::JS_NULL: return "null";
    default: return "undefined";
    }
}

bool JSValue::toBoolean() {
    switch (type) {
    case JSType::BOOLEAN: return get<bool>(data);
    case JSType::NUMBER: {
        double n = get<double>(data);
        return n != 0.0 && !isnan(n);
    }
    case JSType::STRING: return !get<string>(data).empty();
    case JSType::JS_NULL:
    case JSType::UNDEFINED: return false;
    default: return true;
    }
}

double JSValue::toNumber() {
    switch (type) {
    case JSType::NUMBER: return get<double>(data);
    case JSType::BOOLEAN: return get<bool>(data) ? 1.0 : 0.0;
    case JSType::STRING: {
        try {
            string s = get<string>(data);
            if (s.empty()) return 0.0;
            return stod(s);
        } catch (...) { return NAN; }
    }
    case JSType::JS_NULL: return 0.0;
    default: return NAN;
    }
}

ValuePtr JSValue::getProp(string key) {
    // --- CRITICAL CHECK: LOOK UP PROPERTIES FIRST ---
    if (properties.count(key)) return properties[key];

    if (type == JSType::STRING) {
        if (key == "length") return makeNumber(get<string>(data).length());
        
        auto self = shared_from_this();

        if (key == "repeat") {
            return makeNativeFunction("repeat", [self](vector<ValuePtr> &args, Interpreter *interp) -> ValuePtr {
                if (args.empty()) return makeString("");
                int count = (int)args[0]->toNumber();
                if (count < 0) throw JSRuntimeError(0, "RangeError", "Invalid count value");
                string s = get<string>(self->data);
                string res = "";
                for (int i = 0; i < count; i++) res += s;
                return makeString(res); 
            });
        }
        if (key == "charAt") {
            return makeNativeFunction("charAt", [self](vector<ValuePtr> &args, Interpreter *interp) -> ValuePtr {
                string s = get<string>(self->data);
                int idx = args.empty() ? 0 : (int)args[0]->toNumber();
                if (idx < 0 || idx >= s.length()) return makeString("");
                return makeString(string(1, s[idx])); 
            });
        }
        if (key == "indexOf") {
            return makeNativeFunction("indexOf", [self](vector<ValuePtr> &args, Interpreter *interp) -> ValuePtr {
                string s = get<string>(self->data);
                string search = args.empty() ? "undefined" : args[0]->toString();
                size_t pos = s.find(search);
                return makeNumber((pos == string::npos) ? -1.0 : (double)pos); 
            });
        }
        if (key == "substring") {
            return makeNativeFunction("substring", [self](vector<ValuePtr> &args, Interpreter *interp) -> ValuePtr {
                string s = get<string>(self->data);
                int len = (int)s.length();
                int start = args.empty() ? 0 : max(0, (int)args[0]->toNumber());
                int end = (args.size() < 2) ? len : max(0, (int)args[1]->toNumber());
                if (start > end) swap(start, end);
                if (start > len) start = len;
                if (end > len) end = len;
                return makeString(s.substr(start, end - start)); 
            });
        }
        if (key == "slice") {
            return makeNativeFunction("slice", [self](vector<ValuePtr> &args, Interpreter *interp) -> ValuePtr {
                string s = get<string>(self->data);
                int len = (int)s.length();
                int start = args.empty() ? 0 : (int)args[0]->toNumber();
                int end = (args.size() < 2) ? len : (int)args[1]->toNumber();
                if (start < 0) start = max(0, len + start);
                else start = min(start, len);
                if (end < 0) end = max(0, len + end);
                else end = min(end, len);
                if (start >= end) return makeString("");
                return makeString(s.substr(start, end - start)); 
            });
        }
        if (key == "toUpperCase") {
            return makeNativeFunction("toUpperCase", [self](vector<ValuePtr>& args, Interpreter*) {
                string s = get<string>(self->data);
                string res = s;
                transform(res.begin(), res.end(), res.begin(), ::toupper);
                return makeString(res);
            });
        }
        if (key == "toLowerCase") {
            return makeNativeFunction("toLowerCase", [self](vector<ValuePtr>& args, Interpreter*) {
                string s = get<string>(self->data);
                string res = s;
                transform(res.begin(), res.end(), res.begin(), ::tolower);
                return makeString(res);
            });
        }
        if (key == "trim") {
            return makeNativeFunction("trim", [self](vector<ValuePtr> &args, Interpreter *interp) -> ValuePtr {
                string s = get<string>(self->data);
                const string whitespace = " \t\n\r\f\v";
                size_t start = s.find_first_not_of(whitespace);
                if (start == string::npos) return makeString("");
                size_t end = s.find_last_not_of(whitespace);
                return makeString(s.substr(start, end - start + 1)); 
            });
        }
        if (key == "includes") {
            return makeNativeFunction("includes", [self](vector<ValuePtr> &args, Interpreter *interp) -> ValuePtr {
                string s = get<string>(self->data);
                string search = args.empty() ? "undefined" : args[0]->toString();
                return makeBool(s.find(search) != string::npos); 
            });
        }
        if (key == "startsWith") {
            return makeNativeFunction("startsWith", [self](vector<ValuePtr> &args, Interpreter *interp) -> ValuePtr {
                string s = get<string>(self->data);
                string search = args.empty() ? "undefined" : args[0]->toString();
                if (search.length() > s.length()) return makeBool(false);
                return makeBool(s.substr(0, search.length()) == search); 
            });
        }
        if (key == "endsWith") {
            return makeNativeFunction("endsWith", [self](vector<ValuePtr> &args, Interpreter *interp) -> ValuePtr {
                string s = get<string>(self->data);
                string search = args.empty() ? "undefined" : args[0]->toString();
                if (search.length() > s.length()) return makeBool(false);
                return makeBool(s.substr(s.length() - search.length()) == search); 
            });
        }
        if (key == "replace") {
            return makeNativeFunction("replace", [self](vector<ValuePtr> &args, Interpreter *interp) -> ValuePtr {
                string s = get<string>(self->data);
                if (args.size() < 2) return makeString(s);
                string search = args[0]->toString();
                string replace = args[1]->toString();
                size_t pos = s.find(search);
                if (pos != string::npos) {
                    s.replace(pos, search.length(), replace);
                }
                return makeString(s); 
            });
        }
        if (key == "split") {
            return makeNativeFunction("split", [self](vector<ValuePtr> &args, Interpreter *interp) -> ValuePtr {
                string s = get<string>(self->data);
                auto arr = makeArray();
                auto &elements = get<vector<ValuePtr>>(arr->data);
                
                if (args.empty()) {
                    elements.push_back(makeString(s));
                } else {
                    string delimiter = args[0]->toString();
                    if (delimiter.empty()) {
                         for (char c : s) elements.push_back(makeString(string(1, c)));
                    } else {
                        size_t start = 0;
                        size_t end = s.find(delimiter);
                        while (end != string::npos) {
                            elements.push_back(makeString(s.substr(start, end - start)));
                            start = end + delimiter.length();
                            end = s.find(delimiter, start);
                        }
                        elements.push_back(makeString(s.substr(start)));
                    }
                }

                // --- FIX: Manually set the length property ---
                arr->setProp("length", JSValue::makeNumber(elements.size()));

                return arr; 
            });
        }
        if (key == "match") {
            return makeNativeFunction("match", [self](vector<ValuePtr> &args, Interpreter *interp) -> ValuePtr {
                string s = get<string>(self->data);
                if (args.empty() || args[0]->type != JSType::REGEXP) return JSValue::makeNull();
                
                auto re = get<shared_ptr<JSRegExp>>(args[0]->data);
                smatch m;
                
                if (re->global) {
                    auto arr = JSValue::makeArray();
                    auto& elems = get<vector<ValuePtr>>(arr->data);
                    string::const_iterator searchStart(s.cbegin());
                    while (regex_search(searchStart, s.cend(), m, re->pattern)) {
                        elems.push_back(JSValue::makeString(m[0]));
                        searchStart = m.suffix().first;
                    }
                    if (elems.empty()) return JSValue::makeNull();
                    
                    // --- FIX: Manually set the length property ---
                    arr->setProp("length", JSValue::makeNumber(elems.size()));
                    
                    return arr;
                } else {
                    if (regex_search(s, m, re->pattern)) {
                        auto arr = JSValue::makeArray();
                        auto& elems = get<vector<ValuePtr>>(arr->data);
                        elems.push_back(JSValue::makeString(m[0]));
                        
                        // --- FIX: Manually set the length property ---
                        arr->setProp("length", JSValue::makeNumber(elems.size()));
                        
                        return arr;
                    }
                    return JSValue::makeNull();
                } 
            });
        }
    }
    
    if (prototype) return prototype->getProp(key);
    return make_shared<JSValue>(JSType::UNDEFINED);
}

void JSValue::setProp(string key, ValuePtr value) {
    properties[key] = value;
}

ValuePtr JSValue::getIndex(size_t idx) {
    if (type == JSType::ARRAY) {
        auto& arr = get<vector<ValuePtr>>(data);
        if (idx < arr.size()) return arr[idx];
    }
    return makeUndefined();
}

void JSValue::setIndex(size_t idx, ValuePtr value) {
    if (type == JSType::ARRAY) {
        auto& arr = get<vector<ValuePtr>>(data);
        while (arr.size() <= idx) arr.push_back(makeUndefined());
        arr[idx] = value;
        properties["length"] = makeNumber(arr.size());
    }
}
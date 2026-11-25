#include "../include/Interpreter.h"
#include "../include/Utils.h"
#include "../include/Lexer.h"
#include "../include/Parser.h"
#include <iostream>
#include <cmath>
#include <thread>
#include <fstream>
#include <sstream>
#include <cstring>
#include <algorithm>
#include <sys/stat.h>

// --- Network Includes ---
#ifdef _WIN32
#include <winsock2.h>
#include <ws2tcpip.h>
#else
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>
#include <netdb.h>
#endif

using namespace std;

// --- Forward Declarations ---
void setupArrayPrototype(Interpreter* interp, ValuePtr arr);

// --- Helper Lambda for Native Function Execution ---
static ValuePtr executeNativeHelper(shared_ptr<JSFunction> fn, vector<ValuePtr>& args, Interpreter* interp)
{
    if (fn->isNative) {
        return fn->nativeFn(args, interp);
    }
    else {
        auto newEnv = make_shared<Environment>(fn->closure);
        for (size_t i = 0; i < fn->params.size(); i++) {
            string paramName = fn->params[i];

            // Handle Rest Parameters (e.g., "...numbers")
            if (paramName.size() > 3 && paramName.substr(0, 3) == "...") {
                string varName = paramName.substr(3); 
                auto restArr = JSValue::makeArray();
                auto& elements = get<vector<ValuePtr>>(restArr->data);
                for (size_t j = i; j < args.size(); j++) {
                    elements.push_back(args[j]);
                }
                setupArrayPrototype(interp, restArr);
                newEnv->define(varName, restArr);
                break; 
            }

            if (i < args.size()) newEnv->define(paramName, args[i]);
            else newEnv->define(paramName, JSValue::makeUndefined());
        }

        auto oldEnv = interp->environment;
        interp->environment = newEnv;
        ValuePtr result = JSValue::makeUndefined();

        try {
            if (auto block = dynamic_cast<BlockStmt*>(fn->body)) {
                interp->executeBlock(block->statements);
            }
        }
        catch (ReturnEx& ex) {
            result = ex.value;
        }

        interp->environment = oldEnv;
        return result;
    }
}

// =========================================================
//                    Interpreter Constructor
// =========================================================

Interpreter::Interpreter() {
    globals = make_shared<Environment>();
    environment = globals;
    globals->isFunctionScope = true;

    // --- Windows Networking Init ---
#ifdef _WIN32
    static bool wsaInitialized = false;
    if (!wsaInitialized) {
        WSADATA wsaData;
        if (WSAStartup(MAKEWORD(2, 2), &wsaData) == 0) wsaInitialized = true;
        else cerr << "Warning: Failed to initialize Winsock" << endl;
    }
#endif

    // --- Console API ---
    auto console = JSValue::makeObject();
    console->setProp("log", JSValue::makeNativeFunction("log", [](vector<ValuePtr>& args, Interpreter*) {
        for (size_t i = 0; i < args.size(); i++) {
            if (i > 0) cout << " ";
            cout << args[i]->toString();
        }
        cout << endl;
        return JSValue::makeUndefined();
    }));
    console->setProp("error", JSValue::makeNativeFunction("error", [](vector<ValuePtr>& args, Interpreter*) {
        cerr << "Error: ";
        for (auto& arg : args) cerr << arg->toString() << " ";
        cerr << endl;
        return JSValue::makeUndefined();
    }));
    console->setProp("warn", JSValue::makeNativeFunction("warn", [](vector<ValuePtr>& args, Interpreter*) {
        cout << "Warning: ";
        for (auto& arg : args) cout << arg->toString() << " ";
        cout << endl;
        return JSValue::makeUndefined();
    }));
    console->setProp("dir", JSValue::makeNativeFunction("dir", [](vector<ValuePtr>& args, Interpreter*) {
        if (!args.empty()) cout << args[0]->toString() << endl;
        return JSValue::makeUndefined();
    }));
    globals->define("console", console);

    // --- Timers ---
    globals->define("setTimeout", JSValue::makeNativeFunction("setTimeout",
        [](vector<ValuePtr>& args, Interpreter* interp) -> ValuePtr {
            if (args.size() < 1 || args[0]->type != JSType::FUNCTION) return JSValue::makeUndefined();
            auto callback = args[0];
            int delay = (args.size() > 1) ? (int)args[1]->toNumber() : 0;
            int id = interp->nextTimerId++;
            interp->activeTimers.insert(id);

            interp->eventLoop.schedule([callback, interp, id]() {
                if (interp->activeTimers.count(id)) {
                    interp->activeTimers.erase(id);
                    vector<ValuePtr> emptyArgs;
                    auto fn = get<shared_ptr<JSFunction>>(callback->data);
                    executeNativeHelper(fn, emptyArgs, interp);
                }
            }, delay);
            return JSValue::makeNumber(id);
        }));

    globals->define("setInterval", JSValue::makeNativeFunction("setInterval",
        [](vector<ValuePtr>& args, Interpreter* interp) -> ValuePtr {
            if (args.size() < 1 || args[0]->type != JSType::FUNCTION) return JSValue::makeUndefined();
            auto callback = args[0];
            int delay = (args.size() > 1) ? (int)args[1]->toNumber() : 0;
            if (delay < 1) delay = 1;
            int id = interp->nextTimerId++;
            interp->activeTimers.insert(id);

            auto repeater = make_shared<function<void()>>();
            *repeater = [callback, interp, id, delay, repeater]() {
                if (interp->activeTimers.count(id)) {
                    vector<ValuePtr> emptyArgs;
                    auto fn = get<shared_ptr<JSFunction>>(callback->data);
                    executeNativeHelper(fn, emptyArgs, interp);
                    if (interp->activeTimers.count(id)) {
                        interp->eventLoop.schedule(*repeater, delay);
                    }
                }
            };
            interp->eventLoop.schedule(*repeater, delay);
            return JSValue::makeNumber(id);
        }));

    globals->define("clearTimeout", JSValue::makeNativeFunction("clearTimeout", [](vector<ValuePtr>& args, Interpreter* interp) {
        if (!args.empty()) interp->activeTimers.erase((int)args[0]->toNumber());
        return JSValue::makeUndefined();
    }));
    globals->define("clearInterval", globals->get(JSToken{ T_IDENTIFIER, "clearTimeout", 0 }));

    // --- Promise API ---
    auto promiseConstructor = JSValue::makeNativeFunction("Promise",
        [](vector<ValuePtr>& args, Interpreter* interp) -> ValuePtr {
            auto promise = JSValue::makePromise();
            auto promiseData = get<shared_ptr<JSPromise>>(promise->data);
            interp->setupPromise(promise); 

            if (!args.empty() && args[0]->type == JSType::FUNCTION) {
                auto executor = args[0];
                auto resolveFn = JSValue::makeNativeFunction("resolve", [promiseData](vector<ValuePtr>& rArgs, Interpreter*) {
                    if (promiseData->state == PromiseState::PENDING) {
                        promiseData->state = PromiseState::FULFILLED;
                        promiseData->value = rArgs.empty() ? JSValue::makeUndefined() : rArgs[0];
                        for (auto& cb : promiseData->thenCallbacks) cb(promiseData->value);
                    }
                    return JSValue::makeUndefined();
                });
                auto rejectFn = JSValue::makeNativeFunction("reject", [promiseData](vector<ValuePtr>& rArgs, Interpreter*) {
                    if (promiseData->state == PromiseState::PENDING) {
                        promiseData->state = PromiseState::REJECTED;
                        promiseData->value = rArgs.empty() ? JSValue::makeUndefined() : rArgs[0];
                        for (auto& cb : promiseData->catchCallbacks) cb(promiseData->value);
                    }
                    return JSValue::makeUndefined();
                });
                vector<ValuePtr> execArgs = { resolveFn, rejectFn };
                auto fn = get<shared_ptr<JSFunction>>(executor->data);
                executeNativeHelper(fn, execArgs, interp);
            }
            return promise;
        });

    promiseConstructor->setProp("resolve", JSValue::makeNativeFunction("resolve", 
        [](vector<ValuePtr>& args, Interpreter* interp) -> ValuePtr {
            auto p = JSValue::makePromise();
            auto pData = get<shared_ptr<JSPromise>>(p->data);
            interp->setupPromise(p);
            pData->state = PromiseState::FULFILLED;
            pData->value = args.empty() ? JSValue::makeUndefined() : args[0];
            return p;
        }));

    promiseConstructor->setProp("reject", JSValue::makeNativeFunction("reject", 
        [](vector<ValuePtr>& args, Interpreter* interp) -> ValuePtr {
            auto p = JSValue::makePromise();
            auto pData = get<shared_ptr<JSPromise>>(p->data);
            interp->setupPromise(p);
            pData->state = PromiseState::REJECTED;
            pData->value = args.empty() ? JSValue::makeUndefined() : args[0];
            return p;
        }));

    promiseConstructor->setProp("all", JSValue::makeNativeFunction("all", 
        [](vector<ValuePtr>& args, Interpreter* interp) -> ValuePtr {
            auto mainPromise = JSValue::makePromise();
            auto mainPromiseData = get<shared_ptr<JSPromise>>(mainPromise->data);
            interp->setupPromise(mainPromise);

            if (args.empty() || args[0]->type != JSType::ARRAY) {
                mainPromiseData->state = PromiseState::REJECTED;
                mainPromiseData->value = JSValue::makeError("Promise.all requires an array");
                return mainPromise;
            }

            auto& inputPromises = get<vector<ValuePtr>>(args[0]->data);
            size_t total = inputPromises.size();
            
            if (total == 0) {
                mainPromiseData->state = PromiseState::FULFILLED;
                auto resArr = JSValue::makeArray();
                resArr->setProp("length", JSValue::makeNumber(0));
                mainPromiseData->value = resArr;
                return mainPromise;
            }

            struct AllContext {
                vector<ValuePtr> results;
                size_t remaining;
                bool rejected = false;
            };
            auto ctx = make_shared<AllContext>();
            ctx->results.resize(total);
            ctx->remaining = total;

            for (size_t i = 0; i < total; i++) {
                ValuePtr val = inputPromises[i];
                
                auto onResolve = JSValue::makeNativeFunction("resolve", [ctx, i, mainPromiseData, total](vector<ValuePtr>& rArgs, Interpreter*){
                    if (ctx->rejected) return JSValue::makeUndefined();
                    ctx->results[i] = rArgs.empty() ? JSValue::makeUndefined() : rArgs[0];
                    ctx->remaining--;
                    
                    if (ctx->remaining == 0) {
                        auto resArr = JSValue::makeArray();
                        auto& arrData = get<vector<ValuePtr>>(resArr->data);
                        arrData = ctx->results;
                        resArr->setProp("length", JSValue::makeNumber(total));
                        
                        mainPromiseData->state = PromiseState::FULFILLED;
                        mainPromiseData->value = resArr;
                        for(auto& cb : mainPromiseData->thenCallbacks) cb(resArr);
                    }
                    return JSValue::makeUndefined();
                });

                auto onReject = JSValue::makeNativeFunction("reject", [ctx, mainPromiseData](vector<ValuePtr>& rArgs, Interpreter*){
                    if (ctx->rejected) return JSValue::makeUndefined();
                    ctx->rejected = true;
                    
                    mainPromiseData->state = PromiseState::REJECTED;
                    mainPromiseData->value = rArgs.empty() ? JSValue::makeUndefined() : rArgs[0];
                    for(auto& cb : mainPromiseData->catchCallbacks) cb(mainPromiseData->value);
                    return JSValue::makeUndefined();
                });

                if (val->type == JSType::PROMISE) {
                    auto thenFn = val->getProp("then");
                    if (thenFn->type == JSType::FUNCTION) {
                        vector<ValuePtr> thenArgs = {onResolve, onReject};
                        auto fn = get<shared_ptr<JSFunction>>(thenFn->data);
                        executeNativeHelper(fn, thenArgs, interp);
                    }
                } else {
                    vector<ValuePtr> a = {val};
                    auto fn = get<shared_ptr<JSFunction>>(onResolve->data)->nativeFn;
                    interp->eventLoop.schedule([fn, a, interp](){ 
                        vector<ValuePtr> args = a; 
                        fn(args, interp); 
                    });
                }
            }
            return mainPromise;
        }));

    globals->define("Promise", promiseConstructor);

    // --- Fetch API ---
    globals->define("fetch", JSValue::makeNativeFunction("fetch",
        [](vector<ValuePtr>& args, Interpreter* interp) -> ValuePtr {
            auto promise = JSValue::makePromise();
            auto promiseData = get<shared_ptr<JSPromise>>(promise->data);
            interp->setupPromise(promise);

            if (args.empty()) {
                promiseData->state = PromiseState::REJECTED;
                promiseData->value = JSValue::makeError("URL required");
                return promise;
            }

            string url = args[0]->toString();
            
            thread([url, promiseData, interp]() {
                string host = ""; string path = "/"; int port = 80;
                size_t protoPos = url.find("://");
                size_t hostStart = (protoPos == string::npos) ? 0 : protoPos + 3;
                size_t pathStart = url.find('/', hostStart);
                
                string hostAndPort;
                if (pathStart == string::npos) {
                    hostAndPort = url.substr(hostStart);
                } else {
                    hostAndPort = url.substr(hostStart, pathStart - hostStart);
                    path = url.substr(pathStart);
                }

                size_t colonPos = hostAndPort.find(':');
                if (colonPos != string::npos) {
                    host = hostAndPort.substr(0, colonPos);
                    try { port = stoi(hostAndPort.substr(colonPos + 1)); } catch(...) { port = 80; }
                } else {
                    host = hostAndPort;
                }

                SOCKET_TYPE sock = socket(AF_INET, SOCK_STREAM, 0);
                struct sockaddr_in addr;
                addr.sin_family = AF_INET;
                addr.sin_port = htons(port);

                if (host == "localhost") {
                    addr.sin_addr.s_addr = inet_addr("127.0.0.1");
                } else {
                    struct hostent* he = gethostbyname(host.c_str());
                    if (!he) {
                        interp->eventLoop.schedule([promiseData]() {
                            if(promiseData->state == PromiseState::PENDING) {
                                promiseData->state = PromiseState::REJECTED;
                                promiseData->value = JSValue::makeError("Host not found");
                                for(auto& cb : promiseData->catchCallbacks) cb(promiseData->value);
                            }
                        });
                        return;
                    }
                    memcpy(&addr.sin_addr, he->h_addr_list[0], he->h_length);
                }

                if (connect(sock, (struct sockaddr*)&addr, sizeof(addr)) < 0) {
                    CLOSE_SOCKET(sock);
                    interp->eventLoop.schedule([promiseData]() {
                        if(promiseData->state == PromiseState::PENDING) {
                            promiseData->state = PromiseState::REJECTED;
                            promiseData->value = JSValue::makeError("Connection refused");
                            for(auto& cb : promiseData->catchCallbacks) cb(promiseData->value);
                        }
                    });
                    return;
                }

                string req = "GET " + path + " HTTP/1.1\r\nHost: " + host + "\r\nConnection: close\r\n\r\n";
                send(sock, req.c_str(), req.length(), 0);

                string response;
                char buffer[4096];
                int bytes;
                while ((bytes = recv(sock, buffer, 4096, 0)) > 0) {
                    response.append(buffer, bytes);
                }
                CLOSE_SOCKET(sock);

                interp->eventLoop.schedule([promiseData, response]() {
                     if(promiseData->state == PromiseState::PENDING) {
                         promiseData->state = PromiseState::FULFILLED;
                         auto resObj = JSValue::makeObject();
                         size_t bodyPos = response.find("\r\n\r\n");
                         string body = (bodyPos != string::npos) ? response.substr(bodyPos + 4) : response;
                         resObj->setProp("ok", JSValue::makeBool(true));
                         resObj->setProp("text", JSValue::makeNativeFunction("text", [body](vector<ValuePtr>&, Interpreter*){ return JSValue::makeString(body); }));
                         promiseData->value = resObj;
                         for(auto& cb : promiseData->thenCallbacks) cb(resObj);
                     }
                });
            }).detach();
            return promise;
        }));

    // --- HTTP Module ---
    auto http = JSValue::makeObject();
    
    http->setProp("createServer", JSValue::makeNativeFunction("createServer", 
        [](vector<ValuePtr>& args, Interpreter* interp) -> ValuePtr {
            if (args.empty() || args[0]->type != JSType::FUNCTION) return JSValue::makeUndefined();
            auto requestHandler = get<shared_ptr<JSFunction>>(args[0]->data);
            
            auto server = JSValue::makeObject();
            
            server->setProp("listen", JSValue::makeNativeFunction("listen", 
                [server, requestHandler](vector<ValuePtr>& args, Interpreter* interp) -> ValuePtr {
                    int port = args.empty() ? 80 : (int)args[0]->toNumber();
                    ValuePtr callback = (args.size() > 1 && args[1]->type == JSType::FUNCTION) ? args[1] : nullptr;

                    SOCKET_TYPE serverSock = socket(AF_INET, SOCK_STREAM, 0);
                    if (serverSock < 0) return JSValue::makeUndefined(); 
                    
                    int opt = 1;
                    setsockopt(serverSock, SOL_SOCKET, SO_REUSEADDR, (char*)&opt, sizeof(opt));

                    struct sockaddr_in addr;
                    addr.sin_family = AF_INET;
                    addr.sin_addr.s_addr = INADDR_ANY;
                    addr.sin_port = htons(port);
                    
                    if (::bind(serverSock, (struct sockaddr*)&addr, sizeof(addr)) < 0) {
                        CLOSE_SOCKET(serverSock);
                        return JSValue::makeUndefined();
                    }
                    
                    if (listen(serverSock, 100) < 0) {
                        CLOSE_SOCKET(serverSock);
                        return JSValue::makeUndefined();
                    }

                    if (callback) {
                        interp->eventLoop.schedule([callback, interp]() {
                            vector<ValuePtr> empty;
                            auto fn = get<shared_ptr<JSFunction>>(callback->data);
                            executeNativeHelper(fn, empty, interp);
                        });
                    }

                    // Keep-Alive for Server
                    auto keepAlive = make_shared<function<void()>>();
                    *keepAlive = [interp, keepAlive]() {
                        interp->eventLoop.schedule(*keepAlive, 1000);
                    };
                    interp->eventLoop.schedule(*keepAlive, 1000);

                    thread([serverSock, requestHandler, interp]() {
                        while (true) {
                            struct sockaddr_in clientAddr;
                            socklen_t clientLen = sizeof(clientAddr);
                            SOCKET_TYPE clientSock = accept(serverSock, (struct sockaddr*)&clientAddr, &clientLen);
                            if (clientSock < 0) continue; 
                            
                            thread([clientSock, requestHandler, interp]() {
                                char buffer[8192];
                                int bytes = recv(clientSock, buffer, 8191, 0);
                                if (bytes <= 0) { CLOSE_SOCKET(clientSock); return; }
                                buffer[bytes] = 0;
                                string rawReq(buffer);
                                
                                stringstream ss(rawReq);
                                string method, path, proto;
                                ss >> method >> path >> proto;
                                
                                interp->eventLoop.schedule([requestHandler, interp, clientSock, method, path]() {
                                    auto req = JSValue::makeObject();
                                    req->setProp("method", JSValue::makeString(method));
                                    req->setProp("url", JSValue::makeString(path));
                                    req->setProp("headers", JSValue::makeObject());
                                    
                                    auto res = JSValue::makeObject();
                                    res->setProp("_headers", JSValue::makeObject());
                                    res->setProp("statusCode", JSValue::makeNumber(200));
                                    
                                    auto socketOpen = make_shared<bool>(true);

                                    res->setProp("setHeader", JSValue::makeNativeFunction("setHeader", 
                                        [](vector<ValuePtr>& args, Interpreter* i) {
                                            if (args.size() < 2) return JSValue::makeUndefined();
                                            ValuePtr resObj = i->thisValue;
                                            resObj->getProp("_headers")->setProp(args[0]->toString(), args[1]);
                                            return JSValue::makeUndefined();
                                        }));

                                    res->setProp("end", JSValue::makeNativeFunction("end", 
                                        [clientSock, socketOpen](vector<ValuePtr>& args, Interpreter* i) -> ValuePtr {
                                            if (!*socketOpen) return JSValue::makeUndefined();
                                            
                                            ValuePtr resObj = i->thisValue;
                                            string body = args.empty() ? "" : args[0]->toString();
                                            int status = (int)resObj->getProp("statusCode")->toNumber();
                                            
                                            string response = "HTTP/1.1 " + to_string(status) + " OK\r\n";
                                            ValuePtr headers = resObj->getProp("_headers");
                                            for(auto& [k, v] : headers->properties) {
                                                response += k + ": " + v->toString() + "\r\n";
                                            }
                                            response += "Content-Length: " + to_string(body.length()) + "\r\n";
                                            response += "Connection: close\r\n\r\n";
                                            response += body;
                                            
                                            send(clientSock, response.c_str(), response.length(), 0);
                                            CLOSE_SOCKET(clientSock);
                                            *socketOpen = false;
                                            return JSValue::makeUndefined();
                                        }));

                                    vector<ValuePtr> callArgs = { req, res };
                                    executeNativeHelper(requestHandler, callArgs, interp);
                                });
                            }).detach();
                        }
                    }).detach();
                    
                    return JSValue::makeUndefined();
                }));
            
            return server;
        }));
        
    globals->define("http", http);

    // --- FS Module ---
    auto fs = JSValue::makeObject();
    fs->setProp("readFile", JSValue::makeNativeFunction("readFile", [](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
        if(args.empty()) return JSValue::makeUndefined();
        try {
            return JSValue::makeString(readFile(args[0]->toString()));
        } catch(...) { return JSValue::makeNull(); }
    }));
    fs->setProp("writeFile", JSValue::makeNativeFunction("writeFile", [](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
        if(args.size() < 2) return JSValue::makeUndefined();
        ofstream file(args[0]->toString());
        if(file.is_open()) { file << args[1]->toString(); file.close(); }
        else throw JSRuntimeError(0, "IOError", "Cannot write file");
        return JSValue::makeUndefined();
    }));
    fs->setProp("exists", JSValue::makeNativeFunction("exists", [](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
        if (args.empty()) return JSValue::makeBool(false);
        struct stat buffer;
        return JSValue::makeBool(stat(args[0]->toString().c_str(), &buffer) == 0);
    }));
    
    fs->setProp("deleteFile", JSValue::makeNativeFunction("deleteFile", [](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
        if (args.empty()) return JSValue::makeBool(false);
        return JSValue::makeBool(remove(args[0]->toString().c_str()) == 0);
    }));

    globals->define("fs", fs);

    // --- Object API ---
    auto objectObj = JSValue::makeObject();
    objectObj->setProp("keys", JSValue::makeNativeFunction("keys", [](vector<ValuePtr>& args, Interpreter* i) {
        auto arr = JSValue::makeArray();
        if(!args.empty() && (args[0]->type == JSType::OBJECT || args[0]->type == JSType::MAP)) {
             auto& elems = get<vector<ValuePtr>>(arr->data);
             for(auto& [k,v] : args[0]->properties) elems.push_back(JSValue::makeString(k));
        }
        setupArrayPrototype(i, arr);
        return arr;
    }));
    objectObj->setProp("values", JSValue::makeNativeFunction("values", [](vector<ValuePtr>& args, Interpreter* i) {
        auto arr = JSValue::makeArray();
        if(!args.empty() && (args[0]->type == JSType::OBJECT || args[0]->type == JSType::MAP)) {
             auto& elems = get<vector<ValuePtr>>(arr->data);
             for(auto& [k,v] : args[0]->properties) elems.push_back(v);
        }
        setupArrayPrototype(i, arr);
        return arr;
    }));
    objectObj->setProp("entries", JSValue::makeNativeFunction("entries", [](vector<ValuePtr>& args, Interpreter* i) {
        auto arr = JSValue::makeArray();
        if(!args.empty() && (args[0]->type == JSType::OBJECT || args[0]->type == JSType::MAP)) {
             auto& elems = get<vector<ValuePtr>>(arr->data);
             for(auto& [k,v] : args[0]->properties) {
                 auto entry = JSValue::makeArray();
                 auto& entryElems = get<vector<ValuePtr>>(entry->data);
                 entryElems.push_back(JSValue::makeString(k));
                 entryElems.push_back(v);
                 setupArrayPrototype(i, entry);
                 elems.push_back(entry);
             }
        }
        setupArrayPrototype(i, arr);
        return arr;
    }));
    objectObj->setProp("assign", JSValue::makeNativeFunction("assign", [](vector<ValuePtr>& args, Interpreter*) {
        if(args.empty()) return JSValue::makeObject();
        ValuePtr target = args[0];
        for(size_t i = 1; i < args.size(); i++) {
            ValuePtr source = args[i];
            if(source->type == JSType::OBJECT || source->type == JSType::MAP) {
                for(auto& [k,v] : source->properties) {
                    target->setProp(k, v);
                }
            }
        }
        return target;
    }));
    globals->define("Object", objectObj);

    // --- Math API ---
    auto math = JSValue::makeObject();
    math->setProp("PI", JSValue::makeNumber(3.141592653589793));
    math->setProp("E", JSValue::makeNumber(2.718281828459045));
    math->setProp("random", JSValue::makeNativeFunction("random", [](vector<ValuePtr>&, Interpreter*) {
        return JSValue::makeNumber((double)rand() / RAND_MAX);
    }));
    math->setProp("floor", JSValue::makeNativeFunction("floor", [](vector<ValuePtr>& a, Interpreter*) {
        if(a.empty()) return JSValue::makeNumber(NAN);
        return JSValue::makeNumber(floor(a[0]->toNumber()));
    }));
    math->setProp("ceil", JSValue::makeNativeFunction("ceil", [](vector<ValuePtr>& a, Interpreter*) {
        if(a.empty()) return JSValue::makeNumber(NAN);
        return JSValue::makeNumber(ceil(a[0]->toNumber()));
    }));
    math->setProp("round", JSValue::makeNativeFunction("round", [](vector<ValuePtr>& a, Interpreter*) {
        if(a.empty()) return JSValue::makeNumber(NAN);
        return JSValue::makeNumber(floor(a[0]->toNumber() + 0.5));
    }));
    math->setProp("max", JSValue::makeNativeFunction("max", [](vector<ValuePtr>& args, Interpreter*) {
        if(args.empty()) return JSValue::makeNumber(-INFINITY);
        double m = args[0]->toNumber();
        for(size_t i=1; i<args.size(); i++) m = max(m, args[i]->toNumber());
        return JSValue::makeNumber(m);
    }));
    math->setProp("min", JSValue::makeNativeFunction("min", [](vector<ValuePtr>& args, Interpreter*) {
        if(args.empty()) return JSValue::makeNumber(INFINITY);
        double m = args[0]->toNumber();
        for(size_t i=1; i<args.size(); i++) m = min(m, args[i]->toNumber());
        return JSValue::makeNumber(m);
    }));
    math->setProp("abs", JSValue::makeNativeFunction("abs", [](vector<ValuePtr>& a, Interpreter*) {
        if(a.empty()) return JSValue::makeNumber(NAN);
        return JSValue::makeNumber(abs(a[0]->toNumber()));
    }));
    math->setProp("pow", JSValue::makeNativeFunction("pow", [](vector<ValuePtr>& args, Interpreter*) {
        if(args.size() < 2) return JSValue::makeNumber(NAN);
        return JSValue::makeNumber(pow(args[0]->toNumber(), args[1]->toNumber()));
    }));
    math->setProp("sqrt", JSValue::makeNativeFunction("sqrt", [](vector<ValuePtr>& a, Interpreter*) {
        if(a.empty()) return JSValue::makeNumber(NAN);
        return JSValue::makeNumber(sqrt(a[0]->toNumber()));
    }));
    math->setProp("sin", JSValue::makeNativeFunction("sin", [](vector<ValuePtr>& a, Interpreter*) {
        if(a.empty()) return JSValue::makeNumber(NAN);
        return JSValue::makeNumber(sin(a[0]->toNumber()));
    }));
    math->setProp("cos", JSValue::makeNativeFunction("cos", [](vector<ValuePtr>& a, Interpreter*) {
        if(a.empty()) return JSValue::makeNumber(NAN);
        return JSValue::makeNumber(cos(a[0]->toNumber()));
    }));
    globals->define("Math", math);

    // --- Type Conversions & Globals ---
    globals->define("Number", JSValue::makeNativeFunction("Number", [](vector<ValuePtr>& args, Interpreter*) {
        double val = args.empty() ? 0.0 : args[0]->toNumber();
        return JSValue::makeNumber(val);
    }));
    globals->define("String", JSValue::makeNativeFunction("String", [](vector<ValuePtr>& args, Interpreter*) {
        string val = args.empty() ? "" : args[0]->toString();
        return JSValue::makeString(val);
    }));
    globals->define("Boolean", JSValue::makeNativeFunction("Boolean", [](vector<ValuePtr>& args, Interpreter*) {
        bool val = args.empty() ? false : args[0]->toBoolean();
        return JSValue::makeBool(val);
    }));
    globals->define("parseInt", JSValue::makeNativeFunction("parseInt", [](vector<ValuePtr>& args, Interpreter*) {
        if (args.empty()) return JSValue::makeNumber(NAN);
        return JSValue::makeNumber((int)args[0]->toNumber());
    }));
    globals->define("parseFloat", JSValue::makeNativeFunction("parseFloat", [](vector<ValuePtr>& args, Interpreter*) {
        if (args.empty()) return JSValue::makeNumber(NAN);
        return JSValue::makeNumber(args[0]->toNumber());
    }));
    globals->define("isNaN", JSValue::makeNativeFunction("isNaN", [](vector<ValuePtr>& args, Interpreter*) {
        if (args.empty()) return JSValue::makeBool(true);
        return JSValue::makeBool(isnan(args[0]->toNumber()));
    }));
    globals->define("isFinite", JSValue::makeNativeFunction("isFinite", [](vector<ValuePtr>& args, Interpreter*) {
        if (args.empty()) return JSValue::makeBool(false);
        double n = args[0]->toNumber();
        return JSValue::makeBool(!isnan(n) && !isinf(n));
    }));
    globals->define("Error", JSValue::makeNativeFunction("Error", [](vector<ValuePtr>& args, Interpreter*) {
        string msg = args.empty() ? "" : args[0]->toString();
        auto err = JSValue::makeError(msg);
        err->setProp("message", JSValue::makeString(msg));
        return err;
    }));

    // --- Base Classes ---
    globals->define("Infinity", JSValue::makeNumber(INFINITY));
    globals->define("NaN", JSValue::makeNumber(NAN));

    // --- Date ---
    auto dateFunc = JSValue::makeNativeFunction("Date", [](vector<ValuePtr>& args, Interpreter*) {
        long long ms = -1;
        if(!args.empty() && args[0]->type == JSType::NUMBER) ms = (long long)args[0]->toNumber();
        auto d = JSValue::makeDate(ms);
        d->setProp("getTime", JSValue::makeNativeFunction("getTime", [d](vector<ValuePtr>&, Interpreter*){
             auto dt = get<shared_ptr<JSDate>>(d->data);
             auto ms = chrono::duration_cast<chrono::milliseconds>(dt->time.time_since_epoch()).count();
             return JSValue::makeNumber(ms);
        }));
        d->setProp("toISOString", JSValue::makeNativeFunction("toISOString", [d](vector<ValuePtr>&, Interpreter*){
             auto dt = get<shared_ptr<JSDate>>(d->data);
             auto time_t = chrono::system_clock::to_time_t(dt->time);
             stringstream ss;
             ss << put_time(gmtime(&time_t), "%Y-%m-%dT%H:%M:%SZ");
             return JSValue::makeString(ss.str());
        }));
        return d;
    });
    dateFunc->setProp("now", JSValue::makeNativeFunction("now", [](vector<ValuePtr>&, Interpreter*){
        auto now = chrono::system_clock::now();
        auto ms = chrono::duration_cast<chrono::milliseconds>(now.time_since_epoch()).count();
        return JSValue::makeNumber(ms);
    }));
    globals->define("Date", dateFunc);

    // --- JSON API ---
    auto json = JSValue::makeObject();
    json->setProp("stringify", JSValue::makeNativeFunction("stringify", [](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
        if(args.empty()) return JSValue::makeUndefined();
        function<string(ValuePtr)> stringify = [&](ValuePtr v) -> string {
            switch (v->type) {
                case JSType::JS_NULL: return "null";
                case JSType::UNDEFINED: return "null";
                case JSType::BOOLEAN: return v->toBoolean() ? "true" : "false";
                case JSType::NUMBER: return v->toString();
                case JSType::STRING: {
                    string s = get<string>(v->data);
                    string res = "\"";
                    for(char c : s) {
                        if(c == '"') res += "\\\"";
                        else if(c == '\\') res += "\\\\";
                        else if(c == '\n') res += "\\n";
                        else if(c == '\r') res += "\\r";
                        else if(c == '\t') res += "\\t";
                        else res += c;
                    }
                    res += "\"";
                    return res;
                }
                case JSType::ARRAY: {
                    auto& arr = get<vector<ValuePtr>>(v->data);
                    string res = "[";
                    for(size_t i=0; i<arr.size(); i++) {
                        if(i > 0) res += ",";
                        res += stringify(arr[i]);
                    }
                    res += "]";
                    return res;
                }
                case JSType::OBJECT:
                case JSType::MAP: {
                    string res = "{";
                    bool first = true;
                    for(auto& [key, val] : v->properties) {
                        if(val->type == JSType::FUNCTION || val->type == JSType::UNDEFINED) continue;
                        if(!first) res += ",";
                        res += "\"" + key + "\":" + stringify(val);
                        first = false;
                    }
                    res += "}";
                    return res;
                }
                default: return "null";
            }
        };
        return JSValue::makeString(stringify(args[0]));
    }));
    json->setProp("parse", JSValue::makeNativeFunction("parse", [](vector<ValuePtr>& args, Interpreter* interp) -> ValuePtr {
        if(args.empty()) return JSValue::makeObject();
        string src = args[0]->toString();
        size_t pos = 0;
        function<void()> skipWhitespace = [&]() { while(pos < src.size() && isspace(src[pos])) pos++; };
        function<ValuePtr()> parseValue = [&]() -> ValuePtr {
            skipWhitespace();
            if(pos >= src.size()) return JSValue::makeUndefined();
            char c = src[pos];
            if(c == '{') {
                pos++; auto obj = JSValue::makeObject();
                while(pos < src.size()) {
                    skipWhitespace(); if(src[pos] == '}') { pos++; return obj; }
                    if(src[pos] != '"') break;
                    pos++; string key; while(pos < src.size() && src[pos] != '"') key += src[pos++]; pos++;
                    skipWhitespace(); if(src[pos] == ':') pos++;
                    ValuePtr val = parseValue(); obj->setProp(key, val);
                    skipWhitespace(); if(src[pos] == ',') pos++;
                }
                return obj;
            } else if(c == '[') {
                pos++; auto arr = JSValue::makeArray();
                auto& elems = get<vector<ValuePtr>>(arr->data);
                while(pos < src.size()) {
                    skipWhitespace(); if(src[pos] == ']') { pos++; setupArrayPrototype(interp, arr); return arr; }
                    elems.push_back(parseValue());
                    skipWhitespace(); if(src[pos] == ',') pos++;
                }
                setupArrayPrototype(interp, arr); return arr;
            } else if(c == '"') {
                pos++; string s;
                while(pos < src.size() && src[pos] != '"') { if(src[pos] == '\\') pos++; s += src[pos++]; }
                pos++; return JSValue::makeString(s);
            } else if(c == 't') { pos += 4; return JSValue::makeBool(true); }
            else if(c == 'f') { pos += 5; return JSValue::makeBool(false); }
            else if(c == 'n') { pos += 4; return JSValue::makeNull(); }
            else if(isdigit(c) || c == '-') {
                size_t start = pos; if(c == '-') pos++;
                while(pos < src.size() && (isdigit(src[pos]) || src[pos] == '.')) pos++;
                return JSValue::makeNumber(stod(src.substr(start, pos - start)));
            }
            return JSValue::makeUndefined();
        };
        return parseValue();
    }));
    globals->define("JSON", json);

    // --- RegExp Constructor ---
    globals->define("RegExp", JSValue::makeNativeFunction("RegExp", [](vector<ValuePtr>& args, Interpreter* interp) {
        string pattern = args.empty() ? "" : args[0]->toString();
        string flags = args.size() > 1 ? args[1]->toString() : "";
        auto re = JSValue::makeRegExp(pattern, flags);

        if (interp->thisValue && interp->thisValue->type == JSType::OBJECT) {
            interp->thisValue->type = JSType::REGEXP;
            interp->thisValue->data = re->data;
            re = interp->thisValue;
        }

        re->setProp("test", JSValue::makeNativeFunction("test", [re](vector<ValuePtr>& args, Interpreter*) {
            string str = args.empty() ? "" : args[0]->toString();
            auto regInfo = get<shared_ptr<JSRegExp>>(re->data);
            return JSValue::makeBool(regex_search(str, regInfo->pattern));
        }));
        re->setProp("exec", JSValue::makeNativeFunction("exec", [re](vector<ValuePtr>& args, Interpreter* i) {
            string str = args.empty() ? "" : args[0]->toString();
            auto regInfo = get<shared_ptr<JSRegExp>>(re->data);
            smatch m;
            if (regex_search(str, m, regInfo->pattern)) {
                auto arr = JSValue::makeArray();
                auto& elems = get<vector<ValuePtr>>(arr->data);
                elems.push_back(JSValue::makeString(m.str(0)));
                setupArrayPrototype(i, arr);
                return (ValuePtr)arr;
            }
            return JSValue::makeNull();
        }));
        return re;
    }));

    // --- Set Constructor ---
    globals->define("Set", JSValue::makeNativeFunction("Set", [](vector<ValuePtr>&, Interpreter* i) {
        auto set = JSValue::makeSet();
        setupSetPrototype(i, set);
        return set;
    }));

    // --- Map Constructor ---
    globals->define("Map", JSValue::makeNativeFunction("Map", [](vector<ValuePtr>&, Interpreter* i) {
        auto map = JSValue::makeMap();
        setupMapPrototype(i, map);
        return map;
    }));
}

// =========================================================
//                    Promise Logic
// =========================================================

void Interpreter::setupPromise(ValuePtr promise) {
    auto interp = this;
    auto attachHandler = make_shared<function<ValuePtr(ValuePtr, ValuePtr, ValuePtr)>>();
    *attachHandler = [interp, attachHandler](ValuePtr promise, ValuePtr onFulfilled, ValuePtr onRejected) -> ValuePtr {
        auto promiseData = get<shared_ptr<JSPromise>>(promise->data);
        auto nextPromise = JSValue::makePromise();
        interp->setupPromise(nextPromise);
        auto nextPromiseData = get<shared_ptr<JSPromise>>(nextPromise->data);

        auto handleCallback = [interp, nextPromiseData](ValuePtr handler, ValuePtr inputVal, bool isRejection) {
            if (handler && handler->type == JSType::FUNCTION) {
                try {
                    vector<ValuePtr> args = {inputVal};
                    auto fn = get<shared_ptr<JSFunction>>(handler->data);
                    ValuePtr result = executeNativeHelper(fn, args, interp);
                    nextPromiseData->state = PromiseState::FULFILLED;
                    nextPromiseData->value = result;
                    for (auto& cb : nextPromiseData->thenCallbacks) cb(result);
                } catch (ThrowEx& e) {
                    nextPromiseData->state = PromiseState::REJECTED;
                    nextPromiseData->value = e.value;
                    for (auto& cb : nextPromiseData->catchCallbacks) cb(e.value);
                } catch (exception& e) {
                    nextPromiseData->state = PromiseState::REJECTED;
                    nextPromiseData->value = JSValue::makeError(e.what());
                    for (auto& cb : nextPromiseData->catchCallbacks) cb(nextPromiseData->value);
                }
            } else {
                if (isRejection) {
                    nextPromiseData->state = PromiseState::REJECTED;
                    nextPromiseData->value = inputVal;
                    for (auto& cb : nextPromiseData->catchCallbacks) cb(inputVal);
                } else {
                    nextPromiseData->state = PromiseState::FULFILLED;
                    nextPromiseData->value = inputVal;
                    for (auto& cb : nextPromiseData->thenCallbacks) cb(inputVal);
                }
            }
        };

        if (promiseData->state != PromiseState::PENDING) {
             bool isRej = (promiseData->state == PromiseState::REJECTED);
             ValuePtr handler = isRej ? onRejected : onFulfilled;
             interp->eventLoop.schedule([=]() { handleCallback(handler, promiseData->value, isRej); });
        } else {
             promiseData->thenCallbacks.push_back([interp, handleCallback, onFulfilled](ValuePtr val) {
                 interp->eventLoop.schedule([=]() { handleCallback(onFulfilled, val, false); });
             });
             promiseData->catchCallbacks.push_back([interp, handleCallback, onRejected](ValuePtr val) {
                 interp->eventLoop.schedule([=]() { handleCallback(onRejected, val, true); });
             });
        }
        return nextPromise;
    };

    promise->setProp("then", JSValue::makeNativeFunction("then", 
        [promise, attachHandler](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
            ValuePtr onFulfilled = (!args.empty()) ? args[0] : nullptr;
            ValuePtr onRejected = (args.size() > 1) ? args[1] : nullptr;
            return (*attachHandler)(promise, onFulfilled, onRejected);
        }));

    promise->setProp("catch", JSValue::makeNativeFunction("catch", 
        [promise, attachHandler](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
            ValuePtr onRejected = (!args.empty()) ? args[0] : nullptr;
            return (*attachHandler)(promise, nullptr, onRejected);
        }));
}

// =========================================================
//                    Evaluation (Expr)
// =========================================================

ValuePtr Interpreter::eval(Expr* e) {
    if (auto l = dynamic_cast<LiteralExpr*>(e)) { return l->value; }
    if (auto v = dynamic_cast<VarExpr*>(e)) { return environment->get(v->name); }
    if (dynamic_cast<ThisExpr*>(e)) { return thisValue ? thisValue : JSValue::makeUndefined(); }
    if (auto a = dynamic_cast<AssignExpr*>(e)) {
        auto val = eval(a->value.get());
        environment->assign(a->name, val);
        return val;
    }
    if (auto u = dynamic_cast<UnaryExpr*>(e)) {
        if (u->op.type == T_PLUSPLUS || u->op.type == T_MINUSMINUS) {
             if (auto varExpr = dynamic_cast<VarExpr*>(u->right.get())) {
                 ValuePtr currentVal = environment->get(varExpr->name);
                 double val = currentVal->toNumber();
                 if (u->op.type == T_PLUSPLUS) val++; else val--;
                 ValuePtr newVal = JSValue::makeNumber(val);
                 environment->assign(varExpr->name, newVal);
                 return newVal;
             }
             throw JSRuntimeError(u->op.line, "SyntaxError", "Invalid prefix operation");
        }
        auto right = eval(u->right.get());
        if (u->op.type == T_MINUS) return JSValue::makeNumber(-right->toNumber());
        if (u->op.type == T_BANG) return JSValue::makeBool(!right->toBoolean());
        if (u->op.type == T_PLUS) return JSValue::makeNumber(right->toNumber());
        if (u->op.type == T_BIT_NOT) return JSValue::makeNumber(~(long long)right->toNumber());
        if (u->op.type == T_TYPEOF) {
            switch (right->type) {
                case JSType::NUMBER: return JSValue::makeString("number");
                case JSType::STRING: return JSValue::makeString("string");
                case JSType::BOOLEAN: return JSValue::makeString("boolean");
                case JSType::FUNCTION: return JSValue::makeString("function");
                case JSType::UNDEFINED: return JSValue::makeString("undefined");
                case JSType::JS_NULL: return JSValue::makeString("object"); 
                case JSType::OBJECT: return JSValue::makeString("object"); 
                case JSType::ARRAY: return JSValue::makeString("object"); 
                case JSType::REGEXP: return JSValue::makeString("object"); 
                case JSType::DATE: return JSValue::makeString("object"); 
                default: return JSValue::makeString("object");
            }
        }
    }
    if (auto p = dynamic_cast<PostfixExpr*>(e)) {
        if (auto varExpr = dynamic_cast<VarExpr*>(p->left.get())) {
            ValuePtr currentVal = environment->get(varExpr->name);
            double val = currentVal->toNumber();
            double original = val;
            if (p->op.type == T_PLUSPLUS) val++; else val--;
            environment->assign(varExpr->name, JSValue::makeNumber(val));
            return JSValue::makeNumber(original);
        }
        throw JSRuntimeError(p->op.line, "SyntaxError", "Invalid postfix operation");
    }
    if (auto lg = dynamic_cast<LogicalExpr*>(e)) {
        auto left = eval(lg->left.get());
        if (lg->op.type == T_AMPAMP) { if (!left->toBoolean()) return left; return eval(lg->right.get()); }
        if (lg->op.type == T_PIPEPIPE) { if (left->toBoolean()) return left; return eval(lg->right.get()); }
    }
    if (auto t = dynamic_cast<TernaryExpr*>(e)) {
        return eval(t->condition.get())->toBoolean() ? eval(t->thenBranch.get()) : eval(t->elseBranch.get());
    }
    if (auto b = dynamic_cast<BinaryExpr*>(e)) {
        auto left = eval(b->left.get());
        auto right = eval(b->right.get());
        switch (b->op.type) {
            case T_STARSTAR: return JSValue::makeNumber(pow(left->toNumber(), right->toNumber()));
            case T_PLUS: return (left->type == JSType::STRING || right->type == JSType::STRING) ? JSValue::makeString(left->toString() + right->toString()) : JSValue::makeNumber(left->toNumber() + right->toNumber());
            case T_MINUS: return JSValue::makeNumber(left->toNumber() - right->toNumber());
            case T_STAR: return JSValue::makeNumber(left->toNumber() * right->toNumber());
            case T_SLASH: return JSValue::makeNumber(left->toNumber() / right->toNumber());
            case T_PERCENT: return JSValue::makeNumber(fmod(left->toNumber(), right->toNumber()));
            case T_LT: return JSValue::makeBool(left->toNumber() < right->toNumber());
            case T_LTEQ: return JSValue::makeBool(left->toNumber() <= right->toNumber());
            case T_GT: return JSValue::makeBool(left->toNumber() > right->toNumber());
            case T_GTEQ: return JSValue::makeBool(left->toNumber() >= right->toNumber());
            case T_EQEQ: if((left->type==JSType::JS_NULL || left->type==JSType::UNDEFINED) && (right->type==JSType::JS_NULL || right->type==JSType::UNDEFINED)) return JSValue::makeBool(true); if(left->type==right->type) goto strict; return JSValue::makeBool(left->toNumber()==right->toNumber());
            case T_EQEQEQ: strict: if (left->type != right->type) return JSValue::makeBool(false); if (left->type == JSType::NUMBER) return JSValue::makeBool(left->toNumber() == right->toNumber()); if (left->type == JSType::STRING) return JSValue::makeBool(left->toString() == right->toString()); if (left->type == JSType::BOOLEAN) return JSValue::makeBool(left->toBoolean() == right->toBoolean()); return JSValue::makeBool(left->type == JSType::JS_NULL || left->type == JSType::UNDEFINED);
            case T_BANGEQ: return JSValue::makeBool(!(eval(new BinaryExpr(make_unique<LiteralExpr>(left), {T_EQEQ, "==", 0}, make_unique<LiteralExpr>(right)))->toBoolean()));
            case T_BANGEQEQ: return JSValue::makeBool(!(eval(new BinaryExpr(make_unique<LiteralExpr>(left), {T_EQEQEQ, "===", 0}, make_unique<LiteralExpr>(right)))->toBoolean()));
            
            case T_BIT_AND: return JSValue::makeNumber((int)left->toNumber() & (int)right->toNumber());
            case T_BIT_OR: return JSValue::makeNumber((int)left->toNumber() | (int)right->toNumber());
            case T_BIT_XOR: return JSValue::makeNumber((int)left->toNumber() ^ (int)right->toNumber());
            case T_LSHIFT: return JSValue::makeNumber((int)left->toNumber() << (int)right->toNumber());
            case T_RSHIFT: return JSValue::makeNumber((int)left->toNumber() >> (int)right->toNumber());
            
            default: break;
        }
    }
    if (auto c = dynamic_cast<CallExpr*>(e)) {
        ValuePtr thisBinding = JSValue::makeUndefined();
        ValuePtr calleeVal = nullptr;
        
        if (dynamic_cast<SuperExpr*>(c->callee.get())) {
             calleeVal = eval(c->callee.get());
             thisBinding = thisValue; 
        }
        else if (auto get = dynamic_cast<GetExpr *>(c->callee.get())) {
            ValuePtr obj = eval(get->obj.get());
            calleeVal = obj->getProp(get->name.lexeme);
            thisBinding = obj;
        } else { calleeVal = eval(c->callee.get()); }

        if (calleeVal->type != JSType::FUNCTION) throw JSRuntimeError(c->line, "TypeError", "Called non-function: " + calleeVal->toString());
        
        auto fn = get<shared_ptr<JSFunction>>(calleeVal->data);
        vector<ValuePtr> args;
        for (auto& arg : c->args) args.push_back(eval(arg.get()));
        ValuePtr oldThis = thisValue;
        thisValue = (fn->isArrow ? fn->capturedThis : (fn->isBound ? fn->boundThis : thisBinding));
        
        if (fn->isAsync) {
            auto promise = JSValue::makePromise();
            auto promiseData = get<shared_ptr<JSPromise>>(promise->data);
            setupPromise(promise);

            try {
                ValuePtr result = executeNativeHelper(fn, args, this);
                promiseData->state = PromiseState::FULFILLED;
                promiseData->value = result;
            } catch (ThrowEx& ex) {
                promiseData->state = PromiseState::REJECTED;
                promiseData->value = ex.value;
            } catch (exception& ex) {
                promiseData->state = PromiseState::REJECTED;
                promiseData->value = JSValue::makeError(ex.what());
            } catch (...) {
                promiseData->state = PromiseState::REJECTED;
                promiseData->value = JSValue::makeError("Unknown error in async function");
            }
            thisValue = oldThis;
            return promise;
        }

        ValuePtr result = executeNativeHelper(fn, args, this);
        thisValue = oldThis;
        return result;
    }
    if (auto n = dynamic_cast<NewExpr*>(e)) {
        ValuePtr calleeVal = eval(n->callee.get());
        if (calleeVal->type != JSType::FUNCTION) 
            throw JSRuntimeError(n->line, "TypeError", "Not a constructor");

        auto fn = get<shared_ptr<JSFunction>>(calleeVal->data);
        
        ValuePtr instance = JSValue::makeObject();
        if (calleeVal->properties.count("prototype")) {
            instance->prototype = calleeVal->properties["prototype"];
        }

        vector<ValuePtr> args;
        for (auto& arg : n->args) args.push_back(eval(arg.get()));

        ValuePtr oldThis = thisValue;
        thisValue = instance;
        ValuePtr result = executeNativeHelper(fn, args, this);
        thisValue = oldThis;

        if (result->type == JSType::OBJECT || result->type == JSType::FUNCTION || 
            result->type == JSType::ARRAY || result->type == JSType::DATE || 
            result->type == JSType::REGEXP || result->type == JSType::MAP || 
            result->type == JSType::SET || result->type == JSType::PROMISE || 
            result->type == JSType::JS_ERROR) {
            return result;
        }
        return instance;
    }
    if (auto f = dynamic_cast<FunctionExpr*>(e)) {
        auto fn = make_shared<JSFunction>();
        for (auto& p : f->params) fn->params.push_back(p.lexeme);
        fn->body = f->body.get();
        fn->closure = environment;
        fn->isAsync = f->isAsync;
        fn->isArrow = f->isArrow;
        if (fn->isArrow) fn->capturedThis = thisValue ? thisValue : JSValue::makeUndefined();
        auto val = make_shared<JSValue>(JSType::FUNCTION);
        val->data = fn;
        return val;
    }
    if (auto obj = dynamic_cast<ObjectLiteralExpr*>(e)) {
        auto val = JSValue::makeObject();
        for(auto& [k,v] : obj->properties) val->setProp(k, eval(v.get()));
        return val;
    }
    if (auto arr = dynamic_cast<ArrayLiteralExpr*>(e)) {
        auto val = JSValue::makeArray();
        auto& elems = get<vector<ValuePtr>>(val->data);
        for(auto& el : arr->elements) elems.push_back(eval(el.get()));
        setupArrayPrototype(this, val);
        return val;
    }
    if (auto aw = dynamic_cast<AwaitExpr*>(e)) {
        auto promise = eval(aw->argument.get());
        if(promise->type == JSType::PROMISE) {
            auto pData = get<shared_ptr<JSPromise>>(promise->data);
            while(pData->state == PromiseState::PENDING) {
                eventLoop.processNext();
                this_thread::sleep_for(chrono::milliseconds(1));
            }
            if(pData->state == PromiseState::REJECTED) throw ThrowEx(pData->value);
            return pData->value;
        }
        return promise;
    }
    if (auto g = dynamic_cast<GetExpr *>(e)) { return eval(g->obj.get())->getProp(g->name.lexeme); }
    if (auto s = dynamic_cast<SetExpr *>(e)) {
        ValuePtr obj = eval(s->obj.get());
        ValuePtr value = eval(s->value.get());
        obj->setProp(s->name.lexeme, value);
        return value;
    }
    if (auto s = dynamic_cast<SetIndexExpr *>(e)) {
        ValuePtr obj = eval(s->obj.get());
        ValuePtr idx = eval(s->index.get());
        ValuePtr val = eval(s->value.get());
        if(obj->type == JSType::ARRAY) obj->setIndex((size_t)idx->toNumber(), val);
        else obj->setProp(idx->toString(), val);
        return val;
    }
    if (auto idx = dynamic_cast<IndexExpr *>(e)) {
        ValuePtr obj = eval(idx->obj.get());
        ValuePtr index = eval(idx->index.get());
        if (obj->type == JSType::ARRAY) return obj->getIndex((size_t)index->toNumber());
        if (obj->type == JSType::STRING) {
            string s = get<string>(obj->data);
            size_t i = (size_t)index->toNumber();
            if(i < s.length()) return JSValue::makeString(string(1, s[i]));
        }
        return obj->getProp(index->toString());
    }
    if (dynamic_cast<SuperExpr*>(e)) { return environment->get(JSToken{T_IDENTIFIER, "super", 0}); }
    return JSValue::makeUndefined();
}

// =========================================================
//                    Execution (Stmt)
// =========================================================

void Interpreter::execute(Stmt* stmt) {
    if (auto v = dynamic_cast<VarStmt*>(stmt)) {
        ValuePtr val = v->init ? eval(v->init.get()) : JSValue::makeUndefined();
        if (v->type == T_VAR) environment->defineVar(v->name.lexeme, val);
        else environment->define(v->name.lexeme, val, v->type == T_CONST);
    }
    else if (auto e = dynamic_cast<ExpressionStmt*>(stmt)) { eval(e->expr.get()); }
    else if (auto b = dynamic_cast<BlockStmt*>(stmt)) {
        if (b->isScoped) {
            auto oldEnv = environment;
            environment = make_shared<Environment>(environment);
            executeBlock(b->statements);
            environment = oldEnv;
        } else executeBlock(b->statements);
    }
    else if (auto i = dynamic_cast<IfStmt*>(stmt)) {
        if (eval(i->condition.get())->toBoolean()) execute(i->thenBranch.get());
        else if (i->elseBranch) execute(i->elseBranch.get());
    }
    else if (auto w = dynamic_cast<WhileStmt*>(stmt)) {
        while (eval(w->condition.get())->toBoolean()) {
            try { execute(w->body.get()); }
            catch (BreakEx&) { break; }
            catch (ContinueEx&) { continue; }
        }
    }
    else if (auto dw = dynamic_cast<DoWhileStmt*>(stmt)) {
        do {
            try { execute(dw->body.get()); }
            catch (BreakEx&) { break; }
            catch (ContinueEx&) { continue; }
        } while (eval(dw->condition.get())->toBoolean());
    }
    else if (auto fo = dynamic_cast<ForOfStmt*>(stmt)) {
        ValuePtr iterable = eval(fo->iterable.get());
        auto runBody = [&](ValuePtr item) {
             auto loopEnv = make_shared<Environment>(environment);
             loopEnv->define(fo->varName.lexeme, item, fo->varType == T_CONST);
             auto old = environment; environment = loopEnv;
             try { execute(fo->body.get()); }
             catch (ContinueEx&) {}
             environment = old;
        };
        if(iterable->type == JSType::ARRAY) {
             auto& elems = get<vector<ValuePtr>>(iterable->data);
             for(auto& item : elems) { try { runBody(item); } catch(BreakEx&) { break; } }
        } else if (iterable->type == JSType::STRING) {
             string s = get<string>(iterable->data);
             for(char c : s) { try { runBody(JSValue::makeString(string(1, c))); } catch(BreakEx&) { break; } }
        }
    }
    else if (auto fs = dynamic_cast<ForStmt*>(stmt)) {
        auto forEnv = make_shared<Environment>(environment);
        auto oldEnv = environment;
        environment = forEnv;
        if (fs->init) execute(fs->init.get());
        while(true) {
            if(fs->condition && !eval(fs->condition.get())->toBoolean()) break;
            try { execute(fs->body.get()); }
            catch (BreakEx&) { break; }
            catch (ContinueEx&) {}
            if(fs->increment) eval(fs->increment.get());
        }
        environment = oldEnv;
    }
    else if (auto sw = dynamic_cast<SwitchStmt*>(stmt)) {
        ValuePtr val = eval(sw->expression.get());
        bool matched = false;
        for (auto& c : sw->cases) {
            if (!matched) {
                if (c.value == nullptr) matched = true; 
                else {
                    ValuePtr cVal = eval(c.value.get());
                    if (val->type == cVal->type) {
                        if (val->type == JSType::NUMBER && val->toNumber() == cVal->toNumber()) matched = true;
                        else if (val->type == JSType::STRING && val->toString() == cVal->toString()) matched = true;
                        else if (val->type == JSType::BOOLEAN && val->toBoolean() == cVal->toBoolean()) matched = true;
                    }
                }
            }
            if (matched) {
                try { for(auto& s : c.statements) execute(s.get()); } 
                catch (BreakEx&) { break; }
            }
        }
    }
    else if (auto r = dynamic_cast<ReturnStmt*>(stmt)) {
        ValuePtr val = r->value ? eval(r->value.get()) : JSValue::makeUndefined();
        throw ReturnEx(val);
    }
    else if (auto t = dynamic_cast<ThrowStmt*>(stmt)) { throw ThrowEx(eval(t->argument.get())); }
    else if (auto tc = dynamic_cast<TryCatchStmt*>(stmt)) {
        try { executeBlock(tc->tryBlock->statements); } 
        catch (ThrowEx& e) {
            if (tc->catchBlock) {
                auto catchEnv = make_shared<Environment>(environment);
                catchEnv->define(tc->catchVar.lexeme, e.value);
                auto old = environment; environment = catchEnv;
                executeBlock(tc->catchBlock->statements);
                environment = old;
            }
        } catch (JSRuntimeError& e) {
             if (tc->catchBlock) {
                auto catchEnv = make_shared<Environment>(environment);
                catchEnv->define(tc->catchVar.lexeme, JSValue::makeError(e.message, e.type));
                auto old = environment; environment = catchEnv;
                executeBlock(tc->catchBlock->statements);
                environment = old;
             }
        } catch (exception& e) {
             if (tc->catchBlock) {
                auto catchEnv = make_shared<Environment>(environment);
                catchEnv->define(tc->catchVar.lexeme, JSValue::makeError(e.what(), "SystemError"));
                auto old = environment; environment = catchEnv;
                executeBlock(tc->catchBlock->statements);
                environment = old;
             }
        }
        if (tc->finallyBlock) executeBlock(tc->finallyBlock->statements);
    }
    else if (dynamic_cast<BreakStmt*>(stmt)) throw BreakEx();
    else if (dynamic_cast<ContinueStmt*>(stmt)) throw ContinueEx();
    else if (auto f = dynamic_cast<FunStmt*>(stmt)) {
        auto fn = make_shared<JSFunction>();
        fn->name = f->name.lexeme;
        for (auto& p : f->params) fn->params.push_back(p.lexeme);
        fn->body = f->body.get();
        fn->closure = environment;
        fn->isAsync = f->isAsync;
        auto val = make_shared<JSValue>(JSType::FUNCTION);
        val->data = fn;
        environment->define(f->name.lexeme, val);
    }
    else if (auto c = dynamic_cast<ClassStmt*>(stmt)) {
        ValuePtr superclass = nullptr;
        if (c->superclass) { superclass = eval(c->superclass.get()); }
        
        shared_ptr<JSFunction> ctor = nullptr;
        for (auto& m : c->methods) {
            if (m->name.lexeme == "constructor") {
                ctor = make_shared<JSFunction>();
                ctor->name = c->name.lexeme;
                for (auto& p : m->params) ctor->params.push_back(p.lexeme);
                ctor->body = m->body.get();
                ctor->closure = environment;
                ctor->isClassConstructor = true;
                break;
            }
        }
        if (!ctor) {
            ctor = make_shared<JSFunction>();
            ctor->name = c->name.lexeme;
            ctor->closure = environment;
            ctor->isClassConstructor = true;
        }

        auto classVal = make_shared<JSValue>(JSType::FUNCTION);
        classVal->data = ctor;
        auto prototype = JSValue::makeObject();
        classVal->setProp("prototype", prototype);

        shared_ptr<Environment> methodEnv = environment;
        if(superclass) {
            methodEnv = make_shared<Environment>(environment);
            methodEnv->define("super", superclass);
            prototype->prototype = superclass->getProp("prototype");
        }
        ctor->closure = methodEnv;

        for (auto& m : c->methods) {
            if (m->name.lexeme == "constructor") continue;
            auto methodFn = make_shared<JSFunction>();
            methodFn->name = m->name.lexeme;
            for (auto& p : m->params) methodFn->params.push_back(p.lexeme);
            methodFn->body = m->body.get();
            methodFn->closure = environment; 
            auto methodVal = make_shared<JSValue>(JSType::FUNCTION);
            methodVal->data = methodFn;
            prototype->setProp(m->name.lexeme, methodVal);
        }
        environment->define(c->name.lexeme, classVal);
    }
    else if (auto im = dynamic_cast<ImportStmt*>(stmt)) {
        string path = im->specifier;
        if(path.rfind("./", 0) == 0) path = path.substr(2); 

        if(moduleCache.find(path) == moduleCache.end()) {
            string code = readFile(path);
            Lexer lex(code);
            Parser par(lex.scan());
            auto modAST = par.parse();
            moduleASTs.push_back(move(modAST));
            
            auto modEnv = make_shared<Environment>(globals);
            auto oldEnv = environment;
            environment = modEnv;
            for(auto& s : moduleASTs.back()) execute(s.get());
            
            map<string, ValuePtr> exports;
            for(auto& name : modEnv->exportedNames) {
                if(modEnv->values.count(name)) exports[name] = modEnv->values[name];
            }
            moduleCache[path] = exports;
            environment = oldEnv;
        }
        
        auto& exports = moduleCache[path];
        for(auto const& [remote, local] : im->imports) {
            if(exports.count(remote)) environment->define(local, exports[remote]);
            else throw JSRuntimeError(im->line, "ImportError", "Export not found");
        }
    }
    else if (auto ex = dynamic_cast<ExportStmt*>(stmt)) {
        execute(ex->declaration.get());
        if(auto v = dynamic_cast<VarStmt*>(ex->declaration.get())) environment->exportedNames.insert(v->name.lexeme);
        if(auto f = dynamic_cast<FunStmt*>(ex->declaration.get())) environment->exportedNames.insert(f->name.lexeme);
        if(auto c = dynamic_cast<ClassStmt*>(ex->declaration.get())) environment->exportedNames.insert(c->name.lexeme);
    }
}

void Interpreter::executeBlock(const vector<unique_ptr<Stmt>>& stmts) {
    for (const auto& s : stmts) {
        execute(s.get());
    }
}

void Interpreter::run(vector<unique_ptr<Stmt>>& program) {
    try {
        for (auto& s : program) {
            execute(s.get());
        }
        eventLoop.runUntilEmpty();
    }
    catch (ThrowEx& e) {
        cerr << "Uncaught Exception: " << e.value->toString() << endl;
    }
}

// =========================================================
//                    Prototype Setup
// =========================================================

void setupArrayPrototype(Interpreter* interp, ValuePtr arr) {
    arr->setProp("push", JSValue::makeNativeFunction("push", 
        [arr](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
            auto& elements = get<vector<ValuePtr>>(arr->data);
            for (auto& arg : args) elements.push_back(arg);
            arr->setProp("length", JSValue::makeNumber(elements.size()));
            return JSValue::makeNumber(elements.size());
        }));
    arr->setProp("pop", JSValue::makeNativeFunction("pop", [arr](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
        auto& elements = get<vector<ValuePtr>>(arr->data);
        if (elements.empty()) return JSValue::makeUndefined();
        auto last = elements.back();
        elements.pop_back();
        arr->setProp("length", JSValue::makeNumber(elements.size()));
        return last;
    }));
    arr->setProp("shift", JSValue::makeNativeFunction("shift", [arr](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
        auto& elements = get<vector<ValuePtr>>(arr->data);
        if (elements.empty()) return JSValue::makeUndefined();
        auto first = elements[0];
        elements.erase(elements.begin());
        arr->setProp("length", JSValue::makeNumber(elements.size()));
        return first;
    }));
    arr->setProp("unshift", JSValue::makeNativeFunction("unshift", [arr](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
        auto& elements = get<vector<ValuePtr>>(arr->data);
        for (int i = args.size() - 1; i >= 0; i--) {
            elements.insert(elements.begin(), args[i]);
        }
        arr->setProp("length", JSValue::makeNumber(elements.size()));
        return JSValue::makeNumber(elements.size());
    }));
    arr->setProp("join", JSValue::makeNativeFunction("join", [arr](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
        auto& elements = get<vector<ValuePtr>>(arr->data);
        string separator = args.empty() ? "," : args[0]->toString();
        string result;
        for (size_t i = 0; i < elements.size(); i++) {
            if (i > 0) result += separator;
            result += elements[i]->toString();
        }
        return JSValue::makeString(result);
    }));
    arr->setProp("concat", JSValue::makeNativeFunction("concat", [arr](vector<ValuePtr>& args, Interpreter* i) -> ValuePtr {
        auto newArr = JSValue::makeArray();
        auto& newElems = get<vector<ValuePtr>>(newArr->data);
        auto& currElems = get<vector<ValuePtr>>(arr->data);
        for(auto& e : currElems) newElems.push_back(e);
        for(auto& arg : args) {
             if(arg->type == JSType::ARRAY) {
                 auto& sub = get<vector<ValuePtr>>(arg->data);
                 for(auto& e : sub) newElems.push_back(e);
             } else newElems.push_back(arg);
        }
        setupArrayPrototype(i, newArr);
        return newArr;
    }));
    arr->setProp("slice", JSValue::makeNativeFunction("slice", [arr](vector<ValuePtr>& args, Interpreter* i) -> ValuePtr {
        auto newArr = JSValue::makeArray();
        auto& newElems = get<vector<ValuePtr>>(newArr->data);
        auto& currElems = get<vector<ValuePtr>>(arr->data);
        int len = currElems.size();
        int start = args.empty() ? 0 : (int)args[0]->toNumber();
        int end = (args.size() < 2) ? len : (int)args[1]->toNumber();
        if(start < 0) start = max(0, len + start);
        if(end < 0) end = max(0, len + end);
        end = min(end, len);
        for(int k=start; k<end; k++) newElems.push_back(currElems[k]);
        setupArrayPrototype(i, newArr);
        return newArr;
    }));
    arr->setProp("reverse", JSValue::makeNativeFunction("reverse", [arr](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
        auto& elements = get<vector<ValuePtr>>(arr->data);
        std::reverse(elements.begin(), elements.end());
        return arr;
    }));
    arr->setProp("fill", JSValue::makeNativeFunction("fill", [arr](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
        auto& elements = get<vector<ValuePtr>>(arr->data);
        if(args.empty()) return arr;
        ValuePtr val = args[0];
        int len = elements.size();
        int start = (args.size() < 2) ? 0 : (int)args[1]->toNumber();
        int end = (args.size() < 3) ? len : (int)args[2]->toNumber();
        if(start < 0) start = max(0, len + start);
        if(end < 0) end = max(0, len + end);
        end = min(end, len);
        for(int k=start; k<end; k++) elements[k] = val;
        return arr;
    }));
    arr->setProp("includes", JSValue::makeNativeFunction("includes", [arr](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
        auto& elements = get<vector<ValuePtr>>(arr->data);
        if(args.empty()) return JSValue::makeBool(false);
        string search = args[0]->toString();
        for(auto& e : elements) if(e->toString() == search) return JSValue::makeBool(true);
        return JSValue::makeBool(false);
    }));
    arr->setProp("indexOf", JSValue::makeNativeFunction("indexOf", [arr](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
        auto& elements = get<vector<ValuePtr>>(arr->data);
        if(args.empty()) return JSValue::makeNumber(-1);
        string search = args[0]->toString();
        for(size_t i=0; i<elements.size(); i++) if(elements[i]->toString() == search) return JSValue::makeNumber(i);
        return JSValue::makeNumber(-1);
    }));

    // Callbacks
    arr->setProp("map", JSValue::makeNativeFunction("map", [arr](vector<ValuePtr>& args, Interpreter* interp) -> ValuePtr {
        auto newArr = JSValue::makeArray();
        auto& newElems = get<vector<ValuePtr>>(newArr->data);
        auto& currElems = get<vector<ValuePtr>>(arr->data);
        if(!args.empty() && args[0]->type == JSType::FUNCTION) {
            auto fn = get<shared_ptr<JSFunction>>(args[0]->data);
            for(size_t i=0; i<currElems.size(); i++) {
                 vector<ValuePtr> callArgs = { currElems[i], JSValue::makeNumber(i), arr };
                 newElems.push_back(executeNativeHelper(fn, callArgs, interp));
            }
        }
        setupArrayPrototype(interp, newArr);
        return newArr;
    }));
    arr->setProp("filter", JSValue::makeNativeFunction("filter", [arr](vector<ValuePtr>& args, Interpreter* interp) -> ValuePtr {
        auto newArr = JSValue::makeArray();
        auto& newElems = get<vector<ValuePtr>>(newArr->data);
        auto& currElems = get<vector<ValuePtr>>(arr->data);
        if(!args.empty() && args[0]->type == JSType::FUNCTION) {
            auto fn = get<shared_ptr<JSFunction>>(args[0]->data);
            for(size_t i=0; i<currElems.size(); i++) {
                 vector<ValuePtr> callArgs = { currElems[i], JSValue::makeNumber(i), arr };
                 if(executeNativeHelper(fn, callArgs, interp)->toBoolean()) newElems.push_back(currElems[i]);
            }
        }
        setupArrayPrototype(interp, newArr);
        return newArr;
    }));
    arr->setProp("forEach", JSValue::makeNativeFunction("forEach", [arr](vector<ValuePtr>& args, Interpreter* interp) -> ValuePtr {
        auto& currElems = get<vector<ValuePtr>>(arr->data);
        if(!args.empty() && args[0]->type == JSType::FUNCTION) {
            auto fn = get<shared_ptr<JSFunction>>(args[0]->data);
            for(size_t i=0; i<currElems.size(); i++) {
                 vector<ValuePtr> callArgs = { currElems[i], JSValue::makeNumber(i), arr };
                 executeNativeHelper(fn, callArgs, interp);
            }
        }
        return JSValue::makeUndefined();
    }));
    
    // FIX 1: Correct reduce implementation - better variable names
    arr->setProp("reduce", JSValue::makeNativeFunction("reduce", [arr](vector<ValuePtr>& args, Interpreter* interp) -> ValuePtr {
        auto& arrayElements = get<vector<ValuePtr>>(arr->data);
        if (args.empty() || args[0]->type != JSType::FUNCTION) return JSValue::makeUndefined();
        
        auto callbackFunction = get<shared_ptr<JSFunction>>(args[0]->data);
        ValuePtr totalSoFar;
        size_t startIdx = 0;
        
        // Check if we got initial value as second argument
        if (args.size() > 1) {
            totalSoFar = args[1];
            startIdx = 0;  // Start from first element
        } else {
            if (arrayElements.empty()) return JSValue::makeUndefined();
            totalSoFar = arrayElements[0];
            startIdx = 1;  // Start from second element
        }

        // Loop through array starting from startIdx
        for (size_t idx = startIdx; idx < arrayElements.size(); idx++) {
             // Call function(accumulator, currentValue, currentIndex, array)
             vector<ValuePtr> callbackArgs = { totalSoFar, arrayElements[idx], JSValue::makeNumber(idx), arr };
             totalSoFar = executeNativeHelper(callbackFunction, callbackArgs, interp);
        }
        return totalSoFar;
    }));
    
    arr->setProp("find", JSValue::makeNativeFunction("find", [arr](vector<ValuePtr>& args, Interpreter* interp) -> ValuePtr {
        auto& currElems = get<vector<ValuePtr>>(arr->data);
        if(!args.empty() && args[0]->type == JSType::FUNCTION) {
            auto fn = get<shared_ptr<JSFunction>>(args[0]->data);
            for(size_t i=0; i<currElems.size(); i++) {
                 vector<ValuePtr> callArgs = { currElems[i], JSValue::makeNumber(i), arr };
                 if(executeNativeHelper(fn, callArgs, interp)->toBoolean()) return currElems[i];
            }
        }
        return JSValue::makeUndefined();
    }));
    arr->setProp("findIndex", JSValue::makeNativeFunction("findIndex", [arr](vector<ValuePtr>& args, Interpreter* interp) -> ValuePtr {
        auto& currElems = get<vector<ValuePtr>>(arr->data);
        if(!args.empty() && args[0]->type == JSType::FUNCTION) {
            auto fn = get<shared_ptr<JSFunction>>(args[0]->data);
            for(size_t i=0; i<currElems.size(); i++) {
                 vector<ValuePtr> callArgs = { currElems[i], JSValue::makeNumber(i), arr };
                 if(executeNativeHelper(fn, callArgs, interp)->toBoolean()) return JSValue::makeNumber(i);
            }
        }
        return JSValue::makeNumber(-1);
    }));
    arr->setProp("every", JSValue::makeNativeFunction("every", [arr](vector<ValuePtr>& args, Interpreter* interp) -> ValuePtr {
        auto& currElems = get<vector<ValuePtr>>(arr->data);
        if(!args.empty() && args[0]->type == JSType::FUNCTION) {
            auto fn = get<shared_ptr<JSFunction>>(args[0]->data);
            for(size_t i=0; i<currElems.size(); i++) {
                 vector<ValuePtr> callArgs = { currElems[i], JSValue::makeNumber(i), arr };
                 if(!executeNativeHelper(fn, callArgs, interp)->toBoolean()) return JSValue::makeBool(false);
            }
        }
        return JSValue::makeBool(true);
    }));
    arr->setProp("some", JSValue::makeNativeFunction("some", [arr](vector<ValuePtr>& args, Interpreter* interp) -> ValuePtr {
        auto& currElems = get<vector<ValuePtr>>(arr->data);
        if(!args.empty() && args[0]->type == JSType::FUNCTION) {
            auto fn = get<shared_ptr<JSFunction>>(args[0]->data);
            for(size_t i=0; i<currElems.size(); i++) {
                 vector<ValuePtr> callArgs = { currElems[i], JSValue::makeNumber(i), arr };
                 if(executeNativeHelper(fn, callArgs, interp)->toBoolean()) return JSValue::makeBool(true);
            }
        }
        return JSValue::makeBool(false);
    }));

    arr->setProp("length", JSValue::makeNumber(get<vector<ValuePtr>>(arr->data).size()));
}

void setupSetPrototype(Interpreter* interp, ValuePtr set) {
    auto setData = get<shared_ptr<JSSet>>(set->data);
    set->setProp("add", JSValue::makeNativeFunction("add", 
        [set, setData](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
            if(!args.empty()) {
                setData->values.insert(args[0]->toString());
                set->setProp("size", JSValue::makeNumber(setData->values.size()));
            }
            return set;
        }));
    set->setProp("has", JSValue::makeNativeFunction("has", 
        [setData](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
            if(args.empty()) return JSValue::makeBool(false);
            return JSValue::makeBool(setData->values.count(args[0]->toString()) > 0);
        }));
    set->setProp("delete", JSValue::makeNativeFunction("delete", 
        [set, setData](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
            if(args.empty()) return JSValue::makeBool(false);
            bool deleted = setData->values.erase(args[0]->toString()) > 0;
            if(deleted) set->setProp("size", JSValue::makeNumber(setData->values.size()));
            return JSValue::makeBool(deleted);
        }));
    set->setProp("clear", JSValue::makeNativeFunction("clear", 
        [set, setData](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
            setData->values.clear();
            set->setProp("size", JSValue::makeNumber(0));
            return JSValue::makeUndefined();
        }));
    set->setProp("size", JSValue::makeNumber(setData->values.size()));
}

void setupMapPrototype(Interpreter* interp, ValuePtr map) {
    auto mapData = get<shared_ptr<JSMap>>(map->data);

    map->setProp("set", JSValue::makeNativeFunction("set", 
        [map, mapData](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
             if(args.size() >= 2) {
                 mapData->entries[args[0]->toString()] = args[1];
                 map->setProp("size", JSValue::makeNumber(mapData->entries.size()));
             }
             return map;
        }));

    map->setProp("get", JSValue::makeNativeFunction("get", 
        [mapData](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
             if(args.empty()) return JSValue::makeUndefined();
             string key = args[0]->toString();
             if(mapData->entries.count(key)) return mapData->entries[key];
             return JSValue::makeUndefined();
        }));

    map->setProp("has", JSValue::makeNativeFunction("has", 
        [mapData](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
             if(args.empty()) return JSValue::makeBool(false);
             return JSValue::makeBool(mapData->entries.count(args[0]->toString()) > 0);
        }));

    map->setProp("delete", JSValue::makeNativeFunction("delete", 
        [map, mapData](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
             if(args.empty()) return JSValue::makeBool(false);
             bool deleted = mapData->entries.erase(args[0]->toString()) > 0;
             if(deleted) map->setProp("size", JSValue::makeNumber(mapData->entries.size()));
             return JSValue::makeBool(deleted);
        }));

    map->setProp("clear", JSValue::makeNativeFunction("clear", 
        [map, mapData](vector<ValuePtr>& args, Interpreter*) -> ValuePtr {
             mapData->entries.clear();
             map->setProp("size", JSValue::makeNumber(0));
             return JSValue::makeUndefined();
        }));

    map->setProp("size", JSValue::makeNumber(mapData->entries.size()));
}
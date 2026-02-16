#pragma once

#define NOMINMAX
#include "Forward.h"
#include <iostream>
#include <string>
#include <vector>
#include <stdexcept>
#include <sstream>
#include <fstream>
#include <iomanip>
#include <algorithm>

// OS-Specific Includes
#ifdef _WIN32
    #include <winsock2.h>
    #include <ws2tcpip.h>
    #include <direct.h>
    #pragma comment(lib, "ws2_32.lib")
    #define CLOSE_SOCKET closesocket
    #define SOCKET_TYPE SOCKET
    #define IS_VALIDSOCKET(s) ((s) != INVALID_SOCKET)
    #define MY_MKDIR(path) _mkdir(path)
    #define MY_RMDIR(path) _rmdir(path)
#else
    #include <sys/socket.h>
    #include <netinet/in.h>
    #include <sys/stat.h>
    #include <unistd.h>
    #include <netdb.h>
    #include <fcntl.h>
    #include <dirent.h>
    #define CLOSE_SOCKET close
    #define SOCKET_TYPE int
    #define IS_VALIDSOCKET(s) ((s) >= 0)
    #define MY_MKDIR(path) mkdir(path, 0777)
    #define MY_RMDIR(path) rmdir(path)
#endif

// Runtime Error Class
class JSRuntimeError : public std::exception
{
public:
    int line;
    std::string type;
    std::string message;

    JSRuntimeError(int line, std::string type, std::string message)
        : line(line), type(type), message(message) {}

    const char* what() const noexcept override { return message.c_str(); }
};

// Control Flow Exceptions
class ReturnEx : public std::exception {
public:
    ValuePtr value;
    ReturnEx(ValuePtr v) : value(v) {}
};

class BreakEx : public std::exception {};
class ContinueEx : public std::exception {};
class ThrowEx : public std::exception {
public:
    ValuePtr value;
    ThrowEx(ValuePtr v) : value(v) {}
};

// Helpers
std::string readFile(const std::string& filename);
void printError(const std::string& source, const JSRuntimeError& err);
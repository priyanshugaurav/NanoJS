#include "../include/Interpreter.h"
#include "../include/Parser.h"
#include "../include/Lexer.h"
#include "../include/Utils.h"

using namespace std;

int main(int argc, char* argv[]) {
    srand(time(nullptr));

    string code;
    string filename = "";

    if (argc >= 2) {
        filename = argv[1];
        if (filename.length() < 4 || filename.substr(filename.length() - 4) != ".mjs") {
            cerr << "Error: File must have .mjs extension" << endl;
            return 1;
        }
        try {
            code = readFile(filename);
            cout << "==================================================" << endl;
            cout << "   NanoJS Interpreter v1.0                        " << endl;
            cout << "   Running: " << filename << endl;
            cout << "==================================================" << endl << endl;
        } catch (exception& e) {
            cerr << e.what() << endl;
            return 1;
        }
    } else {
        cout << "Usage: ./nanojs <filename.mjs>" << endl;
        return 0;
    }

    try {
        Lexer lex(code);
        auto tokens = lex.scan();
        Parser par(tokens);
        auto program = par.parse();
        Interpreter vm;
        vm.run(program);
    } catch (JSRuntimeError& e) {
        printError(code, e);
        return 1;
    } catch (exception& e) {
        cerr << "\n[System Error] " << e.what() << endl;
        return 1;
    }

    return 0;
}
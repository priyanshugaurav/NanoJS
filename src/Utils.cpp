#include "../include/Utils.h"

using namespace std;

string readFile(const string& filename)
{
    ifstream file(filename);
    if (!file.is_open())
    {
        throw runtime_error("Error: Could not open file '" + filename + "'");
    }
    stringstream buffer;
    buffer << file.rdbuf();
    return buffer.str();
}

void printError(const string& source, const JSRuntimeError& err)
{
    cerr << "\n" << err.type << ": " << err.message << endl;
    cerr << "   at line " << err.line << ":" << endl << endl;

    stringstream ss(source);
    string lineContent;
    int currentLine = 1;

    while (getline(ss, lineContent))
    {
        if (currentLine == err.line)
        {
            cerr << "   " << currentLine << " | " << lineContent << endl;
            cerr << "   " << string(to_string(currentLine).length(), ' ') << " | ";
            cerr << "^" << endl;
            break;
        }
        currentLine++;
    }
    cerr << endl;
}
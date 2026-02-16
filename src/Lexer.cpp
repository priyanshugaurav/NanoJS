#include "../include/Lexer.h"
#include "../include/Utils.h"

using namespace std;

bool Lexer::isAtEnd() { return current >= source.length(); }
char Lexer::advance() { return source[current++]; }
char Lexer::peek() { return isAtEnd() ? '\0' : source[current]; }
char Lexer::peekNext() { return (current + 1 >= source.length()) ? '\0' : source[current + 1]; }

bool Lexer::match(char expected)
{
    if (isAtEnd() || source[current] != expected) return false;
    current++;
    return true;
}

void Lexer::skipWhitespace()
{
    while (!isAtEnd())
    {
        char c = peek();
        if (c == ' ' || c == '\r' || c == '\t') advance();
        else if (c == '\n') { line++; advance(); }
        else if (c == '/' && peekNext() == '/') {
            while (peek() != '\n' && !isAtEnd()) advance();
        }
        else if (c == '/' && peekNext() == '*') {
            advance(); advance();
            while (!isAtEnd() && !(peek() == '*' && peekNext() == '/')) {
                if (peek() == '\n') line++;
                advance();
            }
            if (!isAtEnd()) { advance(); advance(); }
        }
        else break;
    }
}

vector<JSToken> Lexer::scan()
{
    vector<JSToken> tokens;
    while (!isAtEnd())
    {
        skipWhitespace();
        if (isAtEnd()) break;
        char c = advance();

        switch (c)
        {
        case '(': tokens.push_back({T_LPAREN, "(", line}); break;
        case ')': tokens.push_back({T_RPAREN, ")", line}); break;
        case '{': tokens.push_back({T_LBRACE, "{", line}); break;
        case '}': tokens.push_back({T_RBRACE, "}", line}); break;
        case '[': tokens.push_back({T_LBRACKET, "[", line}); break;
        case ']': tokens.push_back({T_RBRACKET, "]", line}); break;
        case ',': tokens.push_back({T_COMMA, ",", line}); break;
        case ';': tokens.push_back({T_SEMICOLON, ";", line}); break;
        case '?': tokens.push_back({T_QUESTION, "?", line}); break;
        case ':': tokens.push_back({T_COLON, ":", line}); break;
        case '%': tokens.push_back({T_PERCENT, "%", line}); break;
        
        case '.': 
            if (peek() == '.' && peekNext() == '.') { advance(); advance(); tokens.push_back({T_SPREAD, "...", line}); }
            else tokens.push_back({T_DOT, ".", line}); 
            break;

        case '+':
            if (match('+')) tokens.push_back({T_PLUSPLUS, "++", line});
            else if (match('=')) tokens.push_back({T_PLUSEQ, "+=", line});
            else tokens.push_back({T_PLUS, "+", line});
            break;

        case '-':
            if (match('-')) tokens.push_back({T_MINUSMINUS, "--", line});
            else if (match('=')) tokens.push_back({T_MINUSEQ, "-=", line});
            else tokens.push_back({T_MINUS, "-", line});
            break;

        case '*':
            if (match('=')) tokens.push_back({T_STAREQ, "*=", line});
            else if (match('*')) tokens.push_back({T_STARSTAR, "**", line});
            else tokens.push_back({T_STAR, "*", line});
            break;

        case '/':
            if (match('=')) tokens.push_back({T_SLASHEQ, "/=", line});
            else tokens.push_back({T_SLASH, "/", line});
            break;

        case '!':
            if (match('=')) {
                if (match('=')) tokens.push_back({T_BANGEQEQ, "!==", line});
                else tokens.push_back({T_BANGEQ, "!=", line});
            }
            else tokens.push_back({T_BANG, "!", line});
            break;

        case '=':
            if (match('=')) {
                if (match('=')) tokens.push_back({T_EQEQEQ, "===", line});
                else tokens.push_back({T_EQEQ, "==", line});
            }
            else if (match('>')) tokens.push_back({T_ARROW, "=>", line});
            else tokens.push_back({T_EQ, "=", line});
            break;

        case '&':
            if (match('&')) tokens.push_back({T_AMPAMP, "&&", line});
            else tokens.push_back({T_BIT_AND, "&", line});
            break;

        case '|':
            if (match('|')) tokens.push_back({T_PIPEPIPE, "||", line});
            else tokens.push_back({T_BIT_OR, "|", line});
            break;

        case '^': tokens.push_back({T_BIT_XOR, "^", line}); break;
        case '~': tokens.push_back({T_BIT_NOT, "~", line}); break;

        case '<':
            if (match('<')) tokens.push_back({T_LSHIFT, "<<", line});
            else tokens.push_back({match('=') ? T_LTEQ : T_LT, match('=') ? "<=" : "<", line});
            break;

        case '>':
            if (match('>')) tokens.push_back({T_RSHIFT, ">>", line});
            else tokens.push_back({match('=') ? T_GTEQ : T_GT, match('=') ? ">=" : ">", line});
            break;

        case '"':
        case '\'':
        {
            char quote = c;
            string s;
            while (peek() != quote && !isAtEnd()) {
                if (peek() == '\\') {
                    advance();
                    if (!isAtEnd()) {
                        char escaped = advance();
                        switch (escaped) {
                            case 'n': s += '\n'; break;
                            case 't': s += '\t'; break;
                            case 'r': s += '\r'; break;
                            case '\\': s += '\\'; break;
                            case '"': s += '"'; break;
                            case '\'': s += '\''; break;
                            default: s += escaped;
                        }
                    }
                } else {
                    s += advance();
                }
            }
            if (!isAtEnd()) advance();
            tokens.push_back({T_STRING, s, line});
            break;
        }

        case '`':
        {
            string s;
            while (peek() != '`' && !isAtEnd()) {
                if (peek() == '\\') {
                    advance();
                    if (!isAtEnd()) s += advance();
                } else {
                    s += advance();
                }
            }
            if (!isAtEnd()) advance();
            tokens.push_back({T_TEMPLATE, s, line});
            break;
        }

        default:
            if (isdigit(c)) {
                string n(1, c);
                while (isdigit(peek()) || peek() == '.') n += advance();
                tokens.push_back({T_NUMBER, n, line});
            } else if (isalpha(c) || c == '_' || c == '$') {
                string id(1, c);
                while (isalnum(peek()) || peek() == '_' || peek() == '$') id += advance();
                
                map<string, JSTokenType> keywords = {
                    {"let", T_LET}, {"const", T_CONST}, {"var", T_VAR}, {"function", T_FUNCTION}, 
                    {"return", T_RETURN}, {"if", T_IF}, {"else", T_ELSE}, {"while", T_WHILE}, 
                    {"for", T_FOR}, {"true", T_TRUE}, {"false", T_FALSE}, {"null", T_NULL}, 
                    {"undefined", T_UNDEFINED}, {"new", T_NEW}, {"this", T_THIS}, {"break", T_BREAK}, 
                    {"continue", T_CONTINUE}, {"async", T_ASYNC}, {"await", T_AWAIT}, {"class", T_CLASS}, 
                    {"extends", T_EXTENDS}, {"static", T_STATIC}, {"try", T_TRY}, {"catch", T_CATCH}, 
                    {"finally", T_FINALLY}, {"throw", T_THROW}, {"typeof", T_TYPEOF}, {"instanceof", T_INSTANCEOF}, 
                    {"delete", T_DELETE}, {"in", T_IN}, {"of", T_OF}, {"export", T_EXPORT}, {"import", T_IMPORT}, 
                    {"from", T_FROM}, {"as", T_AS}, {"switch", T_SWITCH}, {"case", T_CASE}, 
                    {"default", T_DEFAULT}, {"do", T_DO}, {"super", T_SUPER} 
                };

                if (keywords.count(id)) tokens.push_back({keywords[id], id, line});
                else tokens.push_back({T_IDENTIFIER, id, line});
            }
        }
    }
    tokens.push_back({T_EOF, "", line});
    return tokens;
}
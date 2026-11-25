// NanoJS JavaScript AST & Lexer matching C++ Engine structure

export function tokenize(source) {
  const tokens = [];
  let current = 0;
  let line = 1;

  const keywords = {
    let: "T_LET",
    const: "T_CONST",
    var: "T_VAR",
    function: "T_FUNCTION",
    return: "T_RETURN",
    if: "T_IF",
    else: "T_ELSE",
    while: "T_WHILE",
    for: "T_FOR",
    true: "T_TRUE",
    false: "T_FALSE",
    null: "T_NULL",
    undefined: "T_UNDEFINED",
    new: "T_NEW",
    this: "T_THIS",
    async: "T_ASYNC",
    await: "T_AWAIT",
    class: "T_CLASS",
    extends: "T_EXTENDS",
    static: "T_STATIC",
    try: "T_TRY",
    catch: "T_CATCH",
    finally: "T_FINALLY",
    throw: "T_THROW",
    typeof: "T_TYPEOF",
    export: "T_EXPORT",
    import: "T_IMPORT",
    from: "T_FROM",
  };

  while (current < source.length) {
    let c = source[current];

    if (c === "\n") {
      line++;
      current++;
      continue;
    }

    if (/\s/.test(c)) {
      current++;
      continue;
    }

    // Line comment
    if (c === "/" && source[current + 1] === "/") {
      while (current < source.length && source[current] !== "\n") current++;
      continue;
    }

    // Block comment
    if (c === "/" && source[current + 1] === "*") {
      current += 2;
      while (current < source.length - 1 && !(source[current] === "*" && source[current + 1] === "/")) {
        if (source[current] === "\n") line++;
        current++;
      }
      current += 2;
      continue;
    }

    // Numbers
    if (/[0-9]/.test(c)) {
      let start = current;
      while (current < source.length && /[0-9.]/.test(source[current])) current++;
      tokens.push({
        type: "T_NUMBER",
        lexeme: source.slice(start, current),
        line,
        value: parseFloat(source.slice(start, current))
      });
      continue;
    }

    // Strings
    if (c === '"' || c === "'") {
      const quote = c;
      current++;
      let start = current;
      while (current < source.length && source[current] !== quote) {
        if (source[current] === "\\") current++;
        current++;
      }
      tokens.push({
        type: "T_STRING",
        lexeme: source.slice(start, current),
        line,
        value: source.slice(start, current)
      });
      current++;
      continue;
    }

    // Identifiers & Keywords
    if (/[a-zA-Z_$]/.test(c)) {
      let start = current;
      while (current < source.length && /[a-zA-Z0-9_$]/.test(source[current])) current++;
      const text = source.slice(start, current);
      const type = keywords[text] || "T_IDENTIFIER";
      tokens.push({ type, lexeme: text, line });
      continue;
    }

    // Multi-char symbols
    if (source.startsWith("===", current)) {
      tokens.push({ type: "T_EQEQEQ", lexeme: "===", line });
      current += 3;
      continue;
    }
    if (source.startsWith("!==", current)) {
      tokens.push({ type: "T_BANGEQEQ", lexeme: "!==", line });
      current += 3;
      continue;
    }
    if (source.startsWith("...", current)) {
      tokens.push({ type: "T_SPREAD", lexeme: "...", line });
      current += 3;
      continue;
    }
    if (source.startsWith("=>", current)) {
      tokens.push({ type: "T_ARROW", lexeme: "=>", line });
      current += 2;
      continue;
    }
    if (source.startsWith("==", current)) {
      tokens.push({ type: "T_EQEQ", lexeme: "==", line });
      current += 2;
      continue;
    }
    if (source.startsWith("!=", current)) {
      tokens.push({ type: "T_BANGEQ", lexeme: "!=", line });
      current += 2;
      continue;
    }
    if (source.startsWith("<=", current)) {
      tokens.push({ type: "T_LTEQ", lexeme: "<=", line });
      current += 2;
      continue;
    }
    if (source.startsWith(">=", current)) {
      tokens.push({ type: "T_GTEQ", lexeme: ">=", line });
      current += 2;
      continue;
    }
    if (source.startsWith("&&", current)) {
      tokens.push({ type: "T_AMPAMP", lexeme: "&&", line });
      current += 2;
      continue;
    }
    if (source.startsWith("||", current)) {
      tokens.push({ type: "T_PIPEPIPE", lexeme: "||", line });
      current += 2;
      continue;
    }
    if (source.startsWith("++", current)) {
      tokens.push({ type: "T_PLUSPLUS", lexeme: "++", line });
      current += 2;
      continue;
    }
    if (source.startsWith("--", current)) {
      tokens.push({ type: "T_MINUSMINUS", lexeme: "--", line });
      current += 2;
      continue;
    }

    // Single characters
    const singles = {
      "+": "T_PLUS",
      "-": "T_MINUS",
      "*": "T_STAR",
      "/": "T_SLASH",
      "%": "T_PERCENT",
      "=": "T_EQ",
      "<": "T_LT",
      ">": "T_GT",
      "!": "T_BANG",
      "(": "T_LPAREN",
      ")": "T_RPAREN",
      "{": "T_LBRACE",
      "}": "T_RBRACE",
      "[": "T_LBRACKET",
      "]": "T_RBRACKET",
      ",": "T_COMMA",
      ".": "T_DOT",
      ";": "T_SEMICOLON",
      ":": "T_COLON",
      "?": "T_QUESTION"
    };

    if (singles[c]) {
      tokens.push({ type: singles[c], lexeme: c, line });
      current++;
      continue;
    }

    // Fallback
    tokens.push({ type: "T_UNKNOWN", lexeme: c, line });
    current++;
  }

  tokens.push({ type: "T_EOF", lexeme: "", line });
  return tokens;
}

// Lightweight Recursive Descent Parser matching NanoJS AST Structure
export function parseSource(source) {
  const tokens = tokenize(source);
  let pos = 0;

  const peek = () => tokens[pos] || { type: "T_EOF" };
  const advance = () => tokens[pos++];
  const match = (...types) => {
    for (const t of types) {
      if (peek().type === t) {
        return advance();
      }
    }
    return null;
  };

  const statements = [];

  const parseStatement = () => {
    const token = peek();

    // Variable declaration
    if (match("T_LET", "T_CONST", "T_VAR")) {
      const kind = token.lexeme;
      const idToken = advance();
      let init = null;
      if (match("T_EQ")) {
        init = parseExpression();
      }
      match("T_SEMICOLON");
      return {
        type: "VarStmt",
        kind,
        name: idToken.lexeme,
        init,
        line: token.line
      };
    }

    // Function declaration
    let isAsync = false;
    if (token.type === "T_ASYNC") {
      advance();
      isAsync = true;
    }
    if (match("T_FUNCTION")) {
      const fnName = match("T_IDENTIFIER") ? tokens[pos - 1].lexeme : "anonymous";
      match("T_LPAREN");
      const params = [];
      while (peek().type !== "T_RPAREN" && peek().type !== "T_EOF") {
        if (peek().type === "T_SPREAD") advance();
        if (peek().type === "T_IDENTIFIER") params.push(advance().lexeme);
        if (peek().type === "T_COMMA") advance();
      }
      match("T_RPAREN");
      const body = parseBlock();
      return {
        type: "FunStmt",
        name: fnName,
        params,
        isAsync,
        body,
        line: token.line
      };
    }

    // Class declaration
    if (match("T_CLASS")) {
      const className = advance().lexeme;
      let superclass = null;
      if (match("T_EXTENDS")) {
        superclass = advance().lexeme;
      }
      match("T_LBRACE");
      const methods = [];
      while (peek().type !== "T_RBRACE" && peek().type !== "T_EOF") {
        if (peek().type === "T_IDENTIFIER" || peek().type === "T_ASYNC") {
          const mAsync = match("T_ASYNC") !== null;
          const mName = advance().lexeme;
          match("T_LPAREN");
          const mParams = [];
          while (peek().type !== "T_RPAREN" && peek().type !== "T_EOF") {
            if (peek().type === "T_IDENTIFIER") mParams.push(advance().lexeme);
            if (peek().type === "T_COMMA") advance();
          }
          match("T_RPAREN");
          const mBody = parseBlock();
          methods.push({ name: mName, isAsync: mAsync, params: mParams, body: mBody });
        } else {
          advance();
        }
      }
      match("T_RBRACE");
      return {
        type: "ClassStmt",
        name: className,
        superclass,
        methods,
        line: token.line
      };
    }

    // If statement
    if (match("T_IF")) {
      match("T_LPAREN");
      const condition = parseExpression();
      match("T_RPAREN");
      const thenBranch = parseBlockOrStmt();
      let elseBranch = null;
      if (match("T_ELSE")) {
        elseBranch = parseBlockOrStmt();
      }
      return { type: "IfStmt", condition, thenBranch, elseBranch };
    }

    // While statement
    if (match("T_WHILE")) {
      match("T_LPAREN");
      const condition = parseExpression();
      match("T_RPAREN");
      const body = parseBlockOrStmt();
      return { type: "WhileStmt", condition, body };
    }

    // Return statement
    if (match("T_RETURN")) {
      let value = null;
      if (peek().type !== "T_SEMICOLON" && peek().type !== "T_RBRACE") {
        value = parseExpression();
      }
      match("T_SEMICOLON");
      return { type: "ReturnStmt", value };
    }

    // Block
    if (peek().type === "T_LBRACE") {
      return parseBlock();
    }

    // Expression statement fallback
    const expr = parseExpression();
    match("T_SEMICOLON");
    return { type: "ExpressionStmt", expression: expr };
  };

  const parseBlock = () => {
    match("T_LBRACE");
    const stmts = [];
    while (peek().type !== "T_RBRACE" && peek().type !== "T_EOF") {
      stmts.push(parseStatement());
    }
    match("T_RBRACE");
    return { type: "BlockStmt", body: stmts };
  };

  const parseBlockOrStmt = () => {
    if (peek().type === "T_LBRACE") return parseBlock();
    return parseStatement();
  };

  const parseExpression = () => {
    return parseAssignment();
  };

  const parseAssignment = () => {
    let expr = parseLogicalOr();
    if (match("T_EQ")) {
      const value = parseAssignment();
      return { type: "AssignExpr", target: expr, value };
    }
    return expr;
  };

  const parseLogicalOr = () => {
    let expr = parseLogicalAnd();
    while (match("T_PIPEPIPE")) {
      const right = parseLogicalAnd();
      expr = { type: "BinaryExpr", operator: "||", left: expr, right };
    }
    return expr;
  };

  const parseLogicalAnd = () => {
    let expr = parseEquality();
    while (match("T_AMPAMP")) {
      const right = parseEquality();
      expr = { type: "BinaryExpr", operator: "&&", left: expr, right };
    }
    return expr;
  };

  const parseEquality = () => {
    let expr = parseComparison();
    while (true) {
      const opToken = match("T_EQEQEQ", "T_BANGEQEQ", "T_EQEQ", "T_BANGEQ");
      if (!opToken) break;
      const right = parseComparison();
      expr = { type: "BinaryExpr", operator: opToken.lexeme, left: expr, right };
    }
    return expr;
  };

  const parseComparison = () => {
    let expr = parseAdditive();
    while (true) {
      const opToken = match("T_LT", "T_GT", "T_LTEQ", "T_GTEQ");
      if (!opToken) break;
      const right = parseAdditive();
      expr = { type: "BinaryExpr", operator: opToken.lexeme, left: expr, right };
    }
    return expr;
  };

  const parseAdditive = () => {
    let expr = parseMultiplicative();
    while (true) {
      const opToken = match("T_PLUS", "T_MINUS");
      if (!opToken) break;
      const right = parseMultiplicative();
      expr = { type: "BinaryExpr", operator: opToken.lexeme, left: expr, right };
    }
    return expr;
  };

  const parseMultiplicative = () => {
    let expr = parseUnary();
    while (true) {
      const opToken = match("T_STAR", "T_SLASH", "T_PERCENT");
      if (!opToken) break;
      const right = parseUnary();
      expr = { type: "BinaryExpr", operator: opToken.lexeme, left: expr, right };
    }
    return expr;
  };

  const parseUnary = () => {
    const op = match("T_BANG", "T_MINUS", "T_TYPEOF", "T_AWAIT");
    if (op) {
      const right = parseUnary();
      return { type: "UnaryExpr", operator: op.lexeme, right };
    }
    return parseCallAndMember();
  };

  const parseCallAndMember = () => {
    let expr = parsePrimary();
    while (true) {
      if (match("T_LPAREN")) {
        const args = [];
        while (peek().type !== "T_RPAREN" && peek().type !== "T_EOF") {
          args.push(parseExpression());
          if (peek().type === "T_COMMA") advance();
        }
        match("T_RPAREN");
        expr = { type: "CallExpr", callee: expr, arguments: args };
      } else if (match("T_DOT")) {
        const prop = advance();
        expr = { type: "GetExpr", object: expr, property: prop.lexeme };
      } else if (match("T_LBRACKET")) {
        const indexExpr = parseExpression();
        match("T_RBRACKET");
        expr = { type: "GetExpr", object: expr, property: indexExpr, computed: true };
      } else {
        break;
      }
    }
    return expr;
  };

  const parsePrimary = () => {
    const t = peek();
    if (match("T_NUMBER")) return { type: "LiteralExpr", value: t.value, raw: t.lexeme };
    if (match("T_STRING")) return { type: "LiteralExpr", value: t.value, raw: t.lexeme };
    if (match("T_TRUE")) return { type: "LiteralExpr", value: true, raw: "true" };
    if (match("T_FALSE")) return { type: "LiteralExpr", value: false, raw: "false" };
    if (match("T_NULL")) return { type: "LiteralExpr", value: null, raw: "null" };
    if (match("T_UNDEFINED")) return { type: "LiteralExpr", value: undefined, raw: "undefined" };
    if (match("T_IDENTIFIER")) return { type: "VariableExpr", name: t.lexeme };
    if (match("T_THIS")) return { type: "ThisExpr" };

    // Parentheses or Arrow function
    if (match("T_LPAREN")) {
      const expr = parseExpression();
      match("T_RPAREN");
      return expr;
    }

    // Array literal
    if (match("T_LBRACKET")) {
      const elements = [];
      while (peek().type !== "T_RBRACKET" && peek().type !== "T_EOF") {
        elements.push(parseExpression());
        if (peek().type === "T_COMMA") advance();
      }
      match("T_RBRACKET");
      return { type: "ArrayExpr", elements };
    }

    // Object literal
    if (match("T_LBRACE")) {
      const props = [];
      while (peek().type !== "T_RBRACE" && peek().type !== "T_EOF") {
        const key = advance().lexeme;
        match("T_COLON");
        const val = parseExpression();
        props.push({ key, value: val });
        if (peek().type === "T_COMMA") advance();
      }
      match("T_RBRACE");
      return { type: "ObjectExpr", properties: props };
    }

    // Skip unknown token safely
    advance();
    return { type: "EmptyExpr" };
  };

  while (pos < tokens.length && peek().type !== "T_EOF") {
    try {
      const stmt = parseStatement();
      if (stmt) statements.push(stmt);
    } catch {
      pos++;
    }
  }

  return {
    tokens,
    ast: { type: "Program", body: statements }
  };
}

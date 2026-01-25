# Contributing to Authentication Service (ATHS)

First off, thank you for considering contributing to the R-MAN E-Commerce Authentication Service! 

## 👥 Contributors

- **Ramkumar JD** - Lead Developer
- **Training Team** - Core Contributors

## 🤝 How to Contribute

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed** and what you expected
- **Include screenshots** if relevant
- **Include your environment details** (Node.js version, OS, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description** of the suggested enhancement
- **Explain why this enhancement would be useful**
- **List any alternatives you've considered**

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding style** used throughout the project
3. **Write clear commit messages**
4. **Include tests** for new features
5. **Update documentation** as needed
6. **Ensure all tests pass** before submitting

## 💻 Development Setup

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd back-end/aths
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Copy environment variables
   ```bash
   cp .env.example .env
   ```

4. Start development server
   ```bash
   npm run dev
   ```

## 📝 Coding Standards

### JavaScript/ES6 Style Guide

- Use **ES6 modules** (import/export)
- Use **async/await** for asynchronous operations
- Use **const** for variables that won't be reassigned, **let** otherwise
- Use **arrow functions** for anonymous functions
- Use **template literals** for string interpolation
- Follow **camelCase** for variable and function names
- Follow **PascalCase** for class names
- Use **meaningful variable names**

### Code Formatting

- Use **2 spaces** for indentation
- Use **single quotes** for strings
- Add **semicolons** at the end of statements
- Keep line length under **100 characters** when possible
- Add **JSDoc comments** for functions and classes

### Example Code Style

```javascript
/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Created user object
 */
const registerUser = async (userData) => {
  const { email, password, fullName } = userData;
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);
  
  // Create user
  const user = await User.create({
    email,
    password: hashedPassword,
    fullName,
  });
  
  return user;
};
```

## 🧪 Testing

- Write unit tests for new features
- Ensure all tests pass before submitting PR
- Aim for high test coverage
- Test edge cases and error scenarios

```bash
npm test
```

## 📚 Documentation

- Update README.md for new features
- Update API documentation
- Add JSDoc comments to functions
- Update CHANGELOG.md

## 🔄 Git Workflow

### Branch Naming

- `feature/feature-name` - New features
- `bugfix/bug-description` - Bug fixes
- `hotfix/critical-fix` - Critical production fixes
- `refactor/refactor-description` - Code refactoring
- `docs/documentation-update` - Documentation changes

### Commit Messages

Follow the conventional commits specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

**Examples:**
```
feat: add email verification endpoint
fix: resolve JWT token expiration issue
docs: update API documentation for login endpoint
refactor: improve error handling in auth controller
```

## 🚀 Deployment

- Ensure all environment variables are configured
- Run tests in production-like environment
- Update version number in package.json
- Update CHANGELOG.md
- Tag releases appropriately

## 📋 Checklist Before Submitting PR

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Dependent changes merged
- [ ] CHANGELOG.md updated

## 🐛 Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - High priority
- `priority: low` - Low priority
- `wontfix` - This will not be worked on

## 📞 Questions?

Feel free to reach out to:
- **Ramkumar JD** - Lead Developer
- **Training Team**

## 🙏 Thank You!

Your contributions help make this project better for everyone. We appreciate your time and effort!

---

**Happy Coding! 🚀**

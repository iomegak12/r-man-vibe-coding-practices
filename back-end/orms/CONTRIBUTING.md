# Contributing to Order Management Service (ORMS)

First off, thank you for considering contributing to the R-MAN E-Commerce Order Management Service! 

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
- **Include your environment details** (Python version, OS, etc.)

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
   cd back-end/orms
   ```

2. Create virtual environment
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

4. Copy environment variables
   ```bash
   cp .env.example .env
   ```

5. Start development server
   ```bash
   uvicorn app.main:app --reload --port 5003
   ```

## 📝 Coding Standards

### Python Style Guide (PEP 8)

- Use **4 spaces** for indentation
- Use **snake_case** for function and variable names
- Use **PascalCase** for class names
- Keep line length under **100 characters**
- Use **type hints** for function parameters and return values
- Use **docstrings** for functions and classes (Google style)

### Code Formatting

We use the following tools:
- **black** for code formatting
- **isort** for import sorting
- **flake8** for linting
- **mypy** for type checking

### Example Code Style

```python
"""
Module description goes here
"""
from typing import Optional, List
from datetime import datetime


async def create_order(
    customer_id: str,
    items: List[dict],
    shipping_address: dict
) -> dict:
    """
    Create a new order
    
    Args:
        customer_id: Customer identifier
        items: List of order items
        shipping_address: Shipping address details
        
    Returns:
        Created order object
        
    Raises:
        HTTPException: If validation fails
    """
    order = {
        "customerId": customer_id,
        "items": items,
        "shippingAddress": shipping_address,
        "orderStatus": "Pending",
        "createdAt": datetime.utcnow()
    }
    
    return order
```

## 🧪 Testing

- Write unit tests for new features
- Ensure all tests pass before submitting PR
- Aim for high test coverage
- Test edge cases and error scenarios

```bash
pytest
pytest --cov=app  # With coverage
```

## 📚 Documentation

- Update README.md for new features
- Update API documentation (FastAPI auto-generates Swagger)
- Add docstrings to functions and classes
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
feat: add order tracking endpoint
fix: resolve order status update issue
docs: update API documentation for order creation
refactor: improve error handling in order service
```

## 🚀 Deployment

- Ensure all environment variables are configured
- Run tests in production-like environment
- Update version number in app/config/settings.py
- Update CHANGELOG.md
- Tag releases appropriately

## 📋 Checklist Before Submitting PR

- [ ] Code follows project style guidelines (PEP 8)
- [ ] Self-review completed
- [ ] Docstrings added for new functions/classes
- [ ] Type hints added
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
- **Ramkumar JD** - Lead Developer - jd.ramkumar@gmail.com
- **Training Team**

## 🙏 Thank You!

Your contributions help make this project better for everyone. We appreciate your time and effort!

---

*Happy Coding! 🚀*

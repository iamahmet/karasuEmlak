# Security Policy

## Supported Versions

We actively support security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability, please **DO NOT** open a public issue. Instead, please report it via one of the following methods:

### Preferred Method
- Email: security@karasuemlak.net
- Subject: "Security Vulnerability Report"

### Alternative Methods
- GitHub Security Advisories (if you have access)
- Private message to maintainers

## What to Include

When reporting a vulnerability, please include:

1. **Description** - A clear description of the vulnerability
2. **Steps to Reproduce** - Detailed steps to reproduce the issue
3. **Impact** - Potential impact of the vulnerability
4. **Suggested Fix** - If you have a suggested fix (optional)

## Response Time

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity (see below)

## Severity Levels

### Critical
- **Response Time**: 24 hours
- **Fix Timeline**: 7 days
- Examples: Remote code execution, SQL injection, authentication bypass

### High
- **Response Time**: 48 hours
- **Fix Timeline**: 14 days
- Examples: Privilege escalation, sensitive data exposure

### Medium
- **Response Time**: 7 days
- **Fix Timeline**: 30 days
- Examples: XSS, CSRF, information disclosure

### Low
- **Response Time**: 14 days
- **Fix Timeline**: 90 days
- Examples: Minor information leaks, best practice violations

## Security Best Practices

### For Contributors
- Never commit secrets or API keys
- Use environment variables for sensitive data
- Keep dependencies up to date
- Follow secure coding practices
- Review security advisories regularly

### For Users
- Keep your dependencies updated
- Use strong passwords
- Enable 2FA when available
- Report vulnerabilities responsibly

## Security Updates

We regularly:
- Update dependencies with security patches
- Review and update security configurations
- Conduct security audits
- Monitor security advisories

## Disclosure Policy

- Vulnerabilities will be disclosed after a fix is available
- Credit will be given to reporters (if desired)
- A security advisory will be published for critical/high severity issues

## Contact

For security-related questions or concerns:
- Email: security@karasuemlak.net
- Response time: Within 48 hours

# Security Documentation

## Overview

Luminari's Quest handles sensitive therapeutic data and user information, requiring robust security measures. This document outlines our security architecture, practices, and procedures to protect user data and maintain system integrity.

## Table of Contents

1. [Security Architecture](#security-architecture)
2. [Data Protection](#data-protection)
3. [Authentication & Authorization](#authentication--authorization)
4. [Privacy Compliance](#privacy-compliance)
5. [Secure Development Practices](#secure-development-practices)
6. [Infrastructure Security](#infrastructure-security)
7. [Incident Response](#incident-response)
8. [Security Testing](#security-testing)
9. [Compliance & Standards](#compliance--standards)
10. [Security Monitoring](#security-monitoring)

## Security Architecture

### Defense in Depth

Our security model implements multiple layers of protection:

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                     │
│  • Input validation • XSS protection • CSRF protection     │
├─────────────────────────────────────────────────────────────┤
│                   Application Layer                         │
│  • Authentication • Authorization • Session management     │
├─────────────────────────────────────────────────────────────┤
│                     API Layer                              │
│  • Rate limiting • Request validation • Error handling     │
├─────────────────────────────────────────────────────────────┤
│                   Database Layer                           │
│  • Row Level Security • Encryption • Access controls       │
├─────────────────────────────────────────────────────────────┤
│                Infrastructure Layer                        │
│  • HTTPS/TLS • Network security • Monitoring               │
└─────────────────────────────────────────────────────────────┘
```

### Security Principles

1. **Principle of Least Privilege**: Users and systems have minimum necessary access
2. **Defense in Depth**: Multiple security layers protect against failures
3. **Fail Securely**: System fails to a secure state when errors occur
4. **Security by Design**: Security considerations built into every feature
5. **Zero Trust**: Verify every request regardless of source

## Data Protection

### Data Classification

| Classification | Description | Examples | Protection Level |
|----------------|-------------|----------|------------------|
| **Public** | Non-sensitive information | Marketing content, public documentation | Basic |
| **Internal** | Business information | System logs, analytics | Standard |
| **Confidential** | Sensitive user data | Email addresses, preferences | High |
| **Restricted** | Therapeutic content | Journal entries, progress data | Maximum |

### Encryption Standards

#### Data in Transit
- **TLS 1.3**: All communications encrypted with modern TLS
- **HSTS**: HTTP Strict Transport Security enforced
- **Certificate Pinning**: Prevents man-in-the-middle attacks
- **Perfect Forward Secrecy**: Session keys cannot be compromised retroactively

#### Data at Rest
- **AES-256**: Database encryption using industry-standard algorithms
- **Key Management**: Supabase handles encryption key rotation
- **Backup Encryption**: All backups encrypted with separate keys
- **Local Storage**: Sensitive data never stored in browser local storage

### Data Minimization

- **Collection Limitation**: Only collect data necessary for therapeutic purposes
- **Purpose Limitation**: Data used only for stated therapeutic goals
- **Retention Limits**: Data automatically purged after defined periods
- **User Control**: Users can delete their data at any time

## Authentication & Authorization

### Authentication Methods

#### Primary Authentication
- **Email/Password**: Secure password requirements enforced
- **Password Hashing**: Argon2 hashing with salt (handled by Supabase)
- **Account Verification**: Email verification required for new accounts
- **Password Reset**: Secure password reset via email tokens

#### Multi-Factor Authentication (Planned)
- **TOTP**: Time-based one-time passwords
- **SMS**: SMS-based verification (with privacy considerations)
- **Hardware Keys**: FIDO2/WebAuthn support

### Authorization Model

#### Role-Based Access Control (RBAC)

```typescript
enum UserRole {
  PATIENT = 'patient',        // Standard user access
  THERAPIST = 'therapist',    // Professional access (planned)
  ADMIN = 'admin',           // System administration
  RESEARCHER = 'researcher'   // Anonymized data access (planned)
}
```

#### Permission Matrix

| Resource | Patient | Therapist | Admin | Researcher |
|----------|---------|-----------|-------|------------|
| Own journal entries | CRUD | Read | Read | None |
| Own game progress | CRUD | Read | Read | Anonymized |
| Other user data | None | Assigned only | All | Anonymized |
| System configuration | None | None | CRUD | None |

### Session Management

#### Session Security
- **Session Tokens**: Cryptographically secure random tokens
- **Session Timeout**: 1 hour inactivity timeout
- **Concurrent Sessions**: Limited to 3 active sessions per user
- **Session Invalidation**: Logout invalidates all sessions

#### JWT Token Security
```typescript
interface JWTPayload {
  sub: string;           // User ID
  email: string;         // User email
  role: UserRole;        // User role
  iat: number;          // Issued at
  exp: number;          // Expiration
  aud: string;          // Audience
  iss: string;          // Issuer
}
```

## Privacy Compliance

### HIPAA Considerations

While not a covered entity, we follow HIPAA-inspired practices:

#### Administrative Safeguards
- **Security Officer**: Designated security responsibility
- **Workforce Training**: Security awareness training
- **Access Management**: Formal access control procedures
- **Incident Response**: Documented incident response procedures

#### Physical Safeguards
- **Cloud Infrastructure**: Supabase provides physical security
- **Workstation Security**: Development environment security guidelines
- **Media Controls**: Secure handling of backup media

#### Technical Safeguards
- **Access Control**: Unique user identification and authentication
- **Audit Controls**: Comprehensive logging and monitoring
- **Integrity**: Data integrity verification mechanisms
- **Transmission Security**: End-to-end encryption for all data transmission

### GDPR Compliance

#### Data Subject Rights
- **Right to Access**: Users can export their data
- **Right to Rectification**: Users can edit their information
- **Right to Erasure**: Users can delete their accounts and data
- **Right to Portability**: Data export in machine-readable format
- **Right to Object**: Users can opt out of data processing

#### Legal Basis for Processing
- **Consent**: Explicit consent for therapeutic data processing
- **Legitimate Interest**: System functionality and security
- **Vital Interest**: Crisis intervention (if implemented)

#### Data Protection by Design
- **Privacy by Default**: Most privacy-friendly settings as default
- **Data Minimization**: Only collect necessary data
- **Purpose Limitation**: Clear purpose for all data collection
- **Storage Limitation**: Automatic data deletion after retention period

## Secure Development Practices

### Secure Coding Standards

#### Input Validation
```typescript
// Example: Secure input validation
const validateJournalEntry = (entry: unknown): JournalEntry => {
  const schema = z.object({
    content: z.string().min(1).max(10000),
    title: z.string().min(1).max(200),
    type: z.enum(['milestone', 'learning']),
    tags: z.array(z.string().max(50)).max(10)
  });
  
  return schema.parse(entry);
};
```

#### Output Encoding
- **React XSS Protection**: React's built-in XSS protection
- **Content Security Policy**: Strict CSP headers
- **Sanitization**: User content sanitized before display
- **Safe HTML**: No innerHTML usage with user content

#### SQL Injection Prevention
- **Parameterized Queries**: All database queries use parameters
- **ORM Protection**: Supabase client provides SQL injection protection
- **Input Validation**: All inputs validated before database operations
- **Least Privilege**: Database users have minimal necessary permissions

### Code Review Process

#### Security Review Checklist
- [ ] Input validation implemented
- [ ] Authentication/authorization checked
- [ ] Sensitive data handling reviewed
- [ ] Error handling doesn't leak information
- [ ] Dependencies scanned for vulnerabilities
- [ ] OWASP Top 10 considerations addressed

#### Automated Security Scanning
```bash
# Dependency vulnerability scanning
npm audit

# Static code analysis
npm run lint:security

# License compliance check
npm run license-check
```

## Infrastructure Security

### Cloud Security (Supabase)

#### Database Security
- **Row Level Security (RLS)**: Database-level access control
- **Connection Encryption**: All connections use TLS
- **Network Isolation**: Database not directly accessible from internet
- **Backup Encryption**: Automated encrypted backups

#### Authentication Infrastructure
- **OAuth 2.0**: Industry-standard authentication protocol
- **JWT Tokens**: Secure token-based authentication
- **Rate Limiting**: Protection against brute force attacks
- **Account Lockout**: Temporary lockout after failed attempts

### Application Security

#### Content Security Policy
```http
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://*.supabase.co;
  font-src 'self';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
```

#### Security Headers
```http
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

### Deployment Security

#### Environment Separation
- **Development**: Isolated development environment
- **Staging**: Production-like testing environment
- **Production**: Live environment with maximum security

#### Secrets Management
- **Environment Variables**: Sensitive data in environment variables
- **No Hardcoded Secrets**: No secrets in source code
- **Key Rotation**: Regular rotation of API keys and secrets
- **Access Logging**: All secret access logged

## Incident Response

### Incident Classification

| Severity | Description | Response Time | Examples |
|----------|-------------|---------------|----------|
| **Critical** | Data breach or system compromise | 1 hour | Unauthorized data access |
| **High** | Security vulnerability exploitation | 4 hours | Authentication bypass |
| **Medium** | Potential security issue | 24 hours | Suspicious activity |
| **Low** | Security concern | 72 hours | Configuration issue |

### Response Procedures

#### Immediate Response (0-1 hour)
1. **Assess Impact**: Determine scope and severity
2. **Contain Threat**: Isolate affected systems
3. **Notify Team**: Alert security team and stakeholders
4. **Document**: Begin incident documentation

#### Investigation (1-24 hours)
1. **Forensic Analysis**: Analyze logs and system state
2. **Root Cause**: Identify how incident occurred
3. **Impact Assessment**: Determine data/user impact
4. **Evidence Collection**: Preserve evidence for analysis

#### Recovery (24-72 hours)
1. **System Restoration**: Restore affected systems
2. **Security Patches**: Apply necessary security fixes
3. **Monitoring**: Enhanced monitoring for related threats
4. **User Communication**: Notify affected users if required

#### Post-Incident (1-2 weeks)
1. **Lessons Learned**: Document lessons and improvements
2. **Process Updates**: Update security procedures
3. **Training**: Additional security training if needed
4. **Compliance Reporting**: Report to authorities if required

### Communication Plan

#### Internal Communication
- **Security Team**: Immediate notification
- **Development Team**: Technical details and fixes
- **Management**: Business impact and decisions
- **Legal Team**: Compliance and legal implications

#### External Communication
- **Users**: Transparent communication about impact
- **Authorities**: Regulatory reporting if required
- **Partners**: Notification of potential impact
- **Public**: Public disclosure if appropriate

## Security Testing

### Automated Testing

#### Static Application Security Testing (SAST)
```bash
# ESLint security rules
npm run lint:security

# Dependency vulnerability scanning
npm audit
npm run audit:fix

# License compliance
npm run license-check
```

#### Dynamic Application Security Testing (DAST)
- **Penetration Testing**: Regular third-party security assessments
- **Vulnerability Scanning**: Automated vulnerability scans
- **Security Monitoring**: Continuous security monitoring

### Manual Testing

#### Security Test Cases
- **Authentication Testing**: Login, logout, session management
- **Authorization Testing**: Access control verification
- **Input Validation Testing**: XSS, SQL injection, CSRF
- **Session Management Testing**: Session timeout, concurrent sessions

#### Accessibility Security
- **Screen Reader Testing**: Ensure security features are accessible
- **Keyboard Navigation**: Security controls accessible via keyboard
- **High Contrast**: Security indicators visible in high contrast mode

## Compliance & Standards

### Security Frameworks

#### OWASP Top 10 (2021)
1. **Broken Access Control**: ✅ Implemented RLS and proper authorization
2. **Cryptographic Failures**: ✅ TLS 1.3 and AES-256 encryption
3. **Injection**: ✅ Parameterized queries and input validation
4. **Insecure Design**: ✅ Security by design principles
5. **Security Misconfiguration**: ✅ Secure defaults and configuration
6. **Vulnerable Components**: ✅ Regular dependency updates
7. **Authentication Failures**: ✅ Strong authentication and session management
8. **Software Integrity Failures**: ✅ Dependency verification
9. **Logging Failures**: ✅ Comprehensive security logging
10. **Server-Side Request Forgery**: ✅ Input validation and allowlists

#### NIST Cybersecurity Framework
- **Identify**: Asset inventory and risk assessment
- **Protect**: Access controls and data protection
- **Detect**: Security monitoring and incident detection
- **Respond**: Incident response procedures
- **Recover**: Recovery planning and improvements

### Regulatory Compliance

#### Healthcare Considerations
- **HIPAA Inspiration**: Following HIPAA-inspired practices
- **State Regulations**: Compliance with applicable state laws
- **International**: GDPR compliance for EU users

#### Data Protection Laws
- **CCPA**: California Consumer Privacy Act compliance
- **PIPEDA**: Personal Information Protection (Canada)
- **LGPD**: Lei Geral de Proteção de Dados (Brazil)

## Security Monitoring

### Logging and Monitoring

#### Security Events Logged
- **Authentication Events**: Login, logout, failed attempts
- **Authorization Events**: Access granted/denied
- **Data Access**: Sensitive data access and modifications
- **System Events**: Configuration changes, errors
- **Security Events**: Potential threats and incidents

#### Log Analysis
```typescript
interface SecurityEvent {
  timestamp: string;
  eventType: 'auth' | 'access' | 'data' | 'system' | 'security';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  resource: string;
  action: string;
  result: 'success' | 'failure' | 'blocked';
  riskScore: number;
}
```

### Threat Detection

#### Anomaly Detection
- **Unusual Login Patterns**: Geographic or time-based anomalies
- **Excessive Failed Attempts**: Brute force attack detection
- **Data Access Patterns**: Unusual data access behavior
- **System Resource Usage**: Potential DoS attack detection

#### Automated Response
- **Account Lockout**: Temporary lockout for suspicious activity
- **Rate Limiting**: Automatic rate limiting for abuse
- **Alert Generation**: Immediate alerts for security events
- **Incident Creation**: Automatic incident creation for threats

### Security Metrics

#### Key Performance Indicators (KPIs)
- **Mean Time to Detection (MTTD)**: Average time to detect incidents
- **Mean Time to Response (MTTR)**: Average time to respond to incidents
- **False Positive Rate**: Percentage of false security alerts
- **Security Training Completion**: Percentage of team trained

#### Security Dashboard
- **Real-time Threats**: Current security threats and status
- **Incident Trends**: Historical incident patterns
- **Compliance Status**: Current compliance posture
- **Vulnerability Status**: Open vulnerabilities and remediation

---

## Security Contacts

### Internal Contacts
- **Security Team**: security@luminarisquest.org
- **Development Team**: dev@luminarisquest.org
- **Incident Response**: incident@luminarisquest.org

### External Contacts
- **Supabase Security**: security@supabase.com
- **Netlify Security**: security@netlify.com
- **Emergency Services**: Local law enforcement if required

---

*This security documentation is reviewed quarterly and updated as needed. Last updated: December 2024*
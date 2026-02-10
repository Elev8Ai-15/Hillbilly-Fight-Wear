# SaaS Solutions Report: Markdown/HTML Security with ADA & WCAG 2.1 AA Compliance

**Prepared:** February 10, 2026  
**Classification:** Internal — Decision Support  
**Scope:** Enterprise SaaS CMS/content platforms with integrated security and accessibility

---

## 1. Executive Summary

This report evaluates five leading enterprise SaaS content management platforms against two critical mandates: (1) robust markdown and HTML security (XSS prevention, sanitization, CSP support), and (2) demonstrable ADA/WCAG 2.1 AA compliance for public-facing corporate applications.

**Key Finding:** No single vendor achieves perfection in both domains simultaneously. However, after rigorous analysis, **Contentstack** emerges as the primary recommendation for organizations requiring the strongest balance of out-of-the-box accessibility (partially conformant to WCAG 2.2 AA — exceeding the 2.1 AA baseline), industry-leading security certifications (SOC 2 Type II + ISO 27001), and headless architecture that gives teams full control over front-end sanitization and accessibility implementation.

**Secondary Recommendation:** For organizations with existing WordPress ecosystems or public-sector entities facing the April 2026 ADA Title II deadline, **WordPress VIP** offers the strongest combination of mature HTML sanitization (wp_kses framework), WCAG 2.2 AA commitment, SOC 2 Type I + FedRAMP authorization, and the broadest accessibility plugin ecosystem.

**Critical Context:** The DOJ's 2024 ADA Title II rule mandates WCAG 2.1 Level AA compliance for state/local government web content by April 24, 2026. Even private-sector entities face escalating litigation risk. All five evaluated platforms require front-end implementation effort for full compliance — no SaaS CMS delivers WCAG-compliant output by default without developer involvement.

---

## 2. Functional Requirements

The target SaaS solution must satisfy the following core business needs:

### 2.1 Content Management
- Structured content modeling (headless or hybrid CMS)
- Rich text / markdown editing with controlled HTML output
- Multi-channel content delivery via API
- Role-based access control (RBAC) and editorial workflows
- Version control and content audit trails

### 2.2 Security Requirements
- **XSS Prevention:** Server-side HTML/markdown sanitization before storage and delivery
- **Content Security Policy (CSP):** Support for configurable CSP headers on delivered content
- **Input Validation:** Schema-level enforcement of allowed HTML elements and attributes
- **Enterprise Certifications:** SOC 2 Type II, ISO 27001, or equivalent
- **Data Encryption:** At-rest (AES-256) and in-transit (TLS 1.2+)
- **Bug Bounty / Vulnerability Disclosure Program**

### 2.3 Accessibility Requirements
- **Authoring Environment:** CMS admin/editor interface must be WCAG 2.1 AA conformant for all content creators, including those using assistive technologies
- **Content Output:** Platform must not impose barriers to producing WCAG 2.1 AA-compliant front-end output
- **VPAT Documentation:** Vendor must provide current Voluntary Product Accessibility Template (VPAT) or Accessibility Conformance Report (ACR)
- **Assistive Technology Compatibility:** Support for JAWS, NVDA, VoiceOver screen readers; keyboard-only navigation
- **Ongoing Commitment:** Evidence of regular third-party audits and remediation roadmap

### 2.4 Operational Requirements
- 99.9%+ uptime SLA
- Enterprise support tiers
- Scalability for global deployment
- GDPR / CCPA compliance
- API-first architecture preferred

---

## 3. SaaS Solution Analysis

### 3.A — Contentstack

#### Overview & Functional Fit
Contentstack is an API-first headless CMS consistently ranked as a Leader in Gartner's Magic Quadrant for DXPs. It offers structured content modeling, powerful workflow engines, multi-environment support, and a composable architecture. As a headless CMS, it delivers content via RESTful and GraphQL APIs, giving full front-end control.

#### Accessibility Compliance Assessment

| Criterion | Status |
|-----------|--------|
| **Claimed Conformance** | Partially conformant with **WCAG 2.2 Level AA** |
| **VPAT/ACR** | Available on request (VPAT 2.5 INT edition, August 2025) — [PDF Link](https://assets.ctfassets.net/rvt0uslu5yqp/6ryyZoO94jPCurOLD0KmXA/e86abe8565cff92cbc43adad0d887e1b/VPAT_2.5_INT__August_2025_.pdf) |
| **Accessibility Statement** | [contentstack.com/docs/contentstack-accessibility-statement](https://www.contentstack.com/docs/contentstack-accessibility-statement) |
| **Standard Targeted** | WCAG 2.2 AA (exceeds the 2.1 baseline requirement) |
| **Audit Approach** | Inclusive research, accessibility personas, regular internal audits, user feedback loops |
| **Screen Reader Support** | NVDA, JAWS, VoiceOver explicitly mentioned |
| **Keyboard Navigation** | Confirmed as design requirement |
| **Front-End Control** | Full — headless architecture imposes zero front-end accessibility barriers; supports WCAG 2.2 AAA if implemented |
| **Recommended Tools** | Axe (Deque), WAVE (WebAIM), Lighthouse (Google) |
| **Known Limitations** | Touch-only devices not fully supported; partial conformance (not full AA) |

**Assessment:** Contentstack's targeting of WCAG **2.2** (not just 2.1) AA demonstrates forward-looking accessibility investment. The published VPAT 2.5 INT (August 2025) provides concrete compliance documentation for procurement. Its headless nature means the CMS does not inject accessibility barriers into front-end output.

#### Security Feature Analysis

| Feature | Details |
|---------|---------|
| **Certifications** | SOC 2 Type II + ISO 27001 certified |
| **HTML/Markdown Sanitization** | Server-side content validation; structured content models with schema-enforced field types prevent arbitrary HTML injection at the data layer |
| **XSS Prevention** | Content delivered via API as structured JSON — not raw HTML — drastically reducing XSS attack surface. Rich text stored as abstract syntax trees, not raw HTML |
| **CSP Support** | Front-end CSP fully controllable since content is API-delivered; no platform-imposed inline scripts |
| **Input Validation** | Schema-based content types enforce allowed field types; custom validation rules supported |
| **Encryption** | AES-256 at rest; TLS 1.2+ in transit |
| **Vulnerability Management** | Regular penetration testing; vulnerability assessment program |
| **RBAC** | Granular role-based access with custom roles |
| **Data Residency** | AWS and Azure hosting; regional data residency options |
| **Compliance** | GDPR, CCPA, with DPA and Data Transfer Risk Assessment published |

**Assessment:** Contentstack's API-first architecture is inherently more secure for HTML/markdown content delivery than traditional CMSs. Content is stored as structured data (not raw HTML), which eliminates entire classes of stored XSS vulnerabilities. The dual SOC 2 Type II + ISO 27001 certification is the gold standard for enterprise security.

#### Pros
- WCAG **2.2** AA target (ahead of regulatory baseline)
- Published VPAT 2.5 (August 2025) — procurement-ready
- SOC 2 Type II + ISO 27001 dual certification
- API-first content delivery eliminates stored XSS by design
- Full front-end accessibility control
- Gartner DXP Magic Quadrant Leader

#### Cons
- Enterprise pricing starts ~$700+/month (custom quotes)
- "Partially conformant" — not fully AA compliant yet
- Touch-device accessibility gaps
- Smaller plugin/extension ecosystem than WordPress
- Requires developer resources for front-end implementation

---

### 3.B — WordPress VIP

#### Overview & Functional Fit
WordPress VIP is the enterprise-grade managed WordPress platform powering brands like Meta, Salesforce, and Bloomberg. It provides the familiar WordPress editing experience with enterprise security, scalability, and compliance layers. Supports both traditional and headless (via REST API / GraphQL) architectures.

#### Accessibility Compliance Assessment

| Criterion | Status |
|-----------|--------|
| **Claimed Conformance** | All products meet **WCAG 2.2 AA** guidelines |
| **VPAT/ACR** | Available; referenced in ADA 2026 compliance documentation |
| **Accessibility Statement** | [wpvip.com/accessibility](https://wpvip.com/accessibility/) |
| **Standard Targeted** | WCAG 2.2 AA |
| **Audit Approach** | Automated (Axe, Storybook, Testing Library, Playwright) + Manual (VoiceOver) + Third-party experts (Level Level, Equalize Digital) |
| **Screen Reader Support** | VoiceOver explicitly tested; NVDA/JAWS via ARIA compliance |
| **Keyboard Navigation** | VIP Design System components accessible by default |
| **Design System** | Open-source [VIP Design System](https://github.com/Automattic/vip-design-system) — all components accessible by default |
| **Team Training** | All product, engineering, marketing, and design teams required to have baseline accessibility understanding |
| **Known Limitations** | Depends on theme/plugin accessibility; third-party plugins may introduce barriers |

**Assessment:** WordPress VIP makes the strongest accessibility *commitment* of all evaluated vendors, stating all products meet WCAG 2.2 AA. The VIP Design System provides accessible components by default. The combination of automated testing (Axe, Playwright), manual testing (VoiceOver), and ongoing third-party audits (Level Level, Equalize Digital) represents a mature accessibility program. The massive WordPress ecosystem also offers specialized accessibility plugins (WP Accessibility, Accessibility Checker).

#### Security Feature Analysis

| Feature | Details |
|---------|---------|
| **Certifications** | SOC 2 Type I (October 2025) + **FedRAMP Moderate** authorization — one of the only enterprise CMS platforms with both |
| **HTML Sanitization** | Industry-leading `wp_kses` framework — configurable HTML allowlisting at the PHP level. `wp_kses_post()`, `sanitize_text_field()`, `esc_html()`, `esc_attr()` provide layered sanitization |
| **XSS Prevention** | Multi-layer: Input validation → Sanitization → Output escaping. WordPress core's security team + VIP's dedicated security engineering |
| **CSP Support** | Platform-level CSP configuration available; [CSP guide published](https://wpvip.com/blog/content-security-policy-guide/) |
| **Input Validation** | WordPress core validation functions + VIP-enforced coding standards |
| **Encryption** | AES-256 at rest; TLS 1.3 in transit |
| **WAF** | Platform-level web application firewall |
| **Vulnerability Management** | Dedicated security team; automated code scanning; responsible disclosure program |
| **Code Review** | All VIP customer code undergoes automated and manual security review |
| **Infrastructure** | DDoS protection; isolated container architecture; automated patching |

**Assessment:** WordPress VIP has the most mature and battle-tested HTML sanitization framework of any evaluated platform. The `wp_kses` system has been refined over 20+ years and provides granular control over allowed HTML elements and attributes. The FedRAMP Moderate authorization (extremely difficult to achieve) validates government-grade security. The SOC 2 Type I (with Type II in progress) adds additional assurance.

#### Pros
- Strongest accessibility statement: "all products meet WCAG 2.2 AA"
- Most mature HTML sanitization framework (wp_kses — 20+ years of hardening)
- FedRAMP Moderate + SOC 2 Type I (unmatched in CMS space)
- Massive ecosystem: 60,000+ plugins, accessibility-specific tools
- VIP Design System with accessible-by-default components
- Dedicated third-party accessibility audit partnerships
- Familiar WordPress editing experience reduces training costs

#### Cons
- SOC 2 Type I (not yet Type II — in progress)
- Premium pricing: $2,000-$5,000+/month for VIP
- Theme/plugin quality varies — accessibility depends on implementation choices
- Not truly headless by default (can configure headless via API)
- WordPress core updates can introduce regressions (mitigated by VIP's managed environment)
- Legacy architectural patterns may constrain modern composable approaches

---

### 3.C — Contentful

#### Overview & Functional Fit
Contentful is a market-leading headless CMS with a mature content infrastructure platform. It offers powerful content modeling, rich text editing (Contentful Rich Text with structured AST output), localization, and extensive API ecosystem. Widely adopted by enterprise brands.

#### Accessibility Compliance Assessment

| Criterion | Status |
|-----------|--------|
| **Claimed Conformance** | **Partially conformant with WCAG 2.1 Level AA** — working toward full conformance with Level A and AA |
| **VPAT/ACR** | Initial audit (May 2020); second audit (June 2021). Evaluation report available on request via support team (not publicly posted) |
| **Accessibility Statement** | [contentful.com/help/accessibility-statement](https://www.contentful.com/help/accessibility-statement/) |
| **Standard Targeted** | WCAG 2.1 AA (with some AAA criteria applied) |
| **Audit Approach** | Self-evaluation (manual + automated) + external evaluation |
| **Screen Reader Support** | JAWS, NVDA, VoiceOver confirmed; VoiceOver+Safari noted as optimal |
| **Keyboard Navigation** | Supported |
| **Known Limitations** | Content reflow only to 250% (WCAG requires 400%); Firefox/macOS focus needs manual OS setting; touch devices not fully supported |
| **Design System** | Forma 36 design system — addressed major contrast issues in June 2020 |

**Assessment:** Contentful's accessibility posture is transparent but noticeably behind Contentstack and WordPress VIP. The VPAT is not publicly available (requires support request), the last documented audit was June 2021 (4.5+ years ago), and there are known WCAG failures (reflow at 400% not supported). The "partially conformant" status with documented gaps is a risk for procurement processes requiring clean VPATs.

#### Security Feature Analysis

| Feature | Details |
|---------|---------|
| **Certifications** | ISO 27001:2022 (certified since 2019) + SOC 2 Type II + SOC 3 (public) + TISAX |
| **HTML/Markdown Sanitization** | Rich Text stored as AST (Abstract Syntax Tree) — not raw HTML. Structured content types with field-level validation |
| **XSS Prevention** | API-delivered structured JSON content; embedded entries/assets referenced by ID, not inline HTML |
| **CSP Support** | Front-end controlled (headless architecture) |
| **Encryption** | AES-256 at rest; TLS 1.2+ in transit |
| **Bug Bounty** | Responsible Disclosure Program with PGP-encrypted communication |
| **Compliance** | GDPR, CCPA; Security Addendum available |

**Assessment:** Contentful has the most impressive security *certification* portfolio (ISO 27001 + SOC 2 Type II + SOC 3 + TISAX) of any evaluated vendor. The Rich Text AST storage model is architecturally resistant to XSS. However, raw HTML fields are available and require developer discipline to sanitize.

#### Pros
- Broadest security certification portfolio (ISO 27001 + SOC 2 Type II + SOC 3 + TISAX)
- Rich Text AST architecture is inherently XSS-resistant
- Mature platform with extensive integrations
- Strong developer experience and documentation
- Public SOC 3 report available for review

#### Cons
- Accessibility audit last documented in 2021 — significantly outdated
- VPAT not publicly available (requires support ticket)
- Known WCAG failures (reflow at 250% vs. required 400%)
- "Partially conformant" with gaps
- Enterprise pricing is premium ($33K-$81K+ annual contract)
- Touch device accessibility not supported

---

### 3.D — Sanity

#### Overview & Functional Fit
Sanity is a modern, developer-centric headless CMS (self-described "Content Operating System") with real-time collaborative editing, GROQ query language, and a highly customizable React-based Studio. Strong developer community and rapidly growing enterprise adoption.

#### Accessibility Compliance Assessment

| Criterion | Status |
|-----------|--------|
| **Claimed Conformance** | **Partially conformant with WCAG 2.1, Level A + AA** — meets 39 out of 50 Success Criteria as of August 2022 |
| **VPAT/ACR** | Published a VPAT-like report using OpenACR Editor (November 2022). Public blog post documenting methodology: [sanity.io/blog/sanity-accessibility-conformance-review](https://www.sanity.io/blog/sanity-accessibility-conformance-review) |
| **Accessibility Statement** | [sanity.io/accessibility](https://www.sanity.io/accessibility) |
| **Standard Targeted** | WCAG 2.1 A + AA |
| **Audit Methodology** | WCAG conformance audit with Eleventy WCAG Reporter → OpenACR-format VPAT |
| **Screen Reader Support** | Implied through WCAG conformance but not explicitly documented |
| **Known Limitations** | 11 of 50 Success Criteria not met as of last audit (August 2022) |

**Assessment:** Sanity is commendably transparent — they published a public blog post about their audit methodology and results. However, the conformance gap is significant: **22% of in-scope WCAG criteria failed** (11/50) as of August 2022. The audit is now 3.5+ years old with no publicly documented updates. The Sanity Studio being React-based means custom accessibility work is needed for any Studio customizations.

#### Security Feature Analysis

| Feature | Details |
|---------|---------|
| **Certifications** | SOC 2 Type II + GDPR + CCPA compliant |
| **Content Model** | Structured, schema-defined content — not raw HTML storage |
| **XSS Prevention** | Portable Text format stores rich text as structured data (not HTML). Front-end serialization gives full sanitization control |
| **Encryption** | Standard encryption at rest and in transit |
| **Uptime** | >99.9% SLA |
| **Monitoring** | 24/7/365 monitoring |
| **RBAC** | Granular permissions with custom roles (Enterprise) |

**Assessment:** Sanity's Portable Text format is architecturally the most elegant solution for XSS prevention among evaluated platforms. Rich text is stored as a structured array of blocks/marks, never as raw HTML. Front-end serialization is entirely developer-controlled, allowing strict sanitization. SOC 2 Type II (missing ISO 27001) is sufficient for most enterprise requirements.

#### Pros
- Portable Text: best-in-class structured content for XSS prevention
- Transparent accessibility audit methodology (public blog post)
- Real-time collaborative editing
- Highly customizable React-based Studio
- SOC 2 Type II certified
- Developer-friendly GROQ query language
- Generous free tier for smaller projects

#### Cons
- **22% WCAG criteria failure rate** (11/50) as of last audit
- Audit data is 3.5+ years old — no public updates
- No ISO 27001 certification
- Screen reader support not explicitly documented
- Enterprise pricing required for advanced RBAC/SSO
- Smaller enterprise customer base than Contentful/Contentstack

---

### 3.E — Hygraph (formerly GraphCMS)

#### Overview & Functional Fit
Hygraph is a GraphQL-native headless CMS with Content Federation capabilities, allowing content aggregation from multiple sources. Strong developer experience with GraphQL-first approach.

#### Accessibility Compliance Assessment

| Criterion | Status |
|-----------|--------|
| **Claimed Conformance** | No public accessibility statement found |
| **VPAT/ACR** | Not publicly available |
| **Accessibility Statement** | None found on hygraph.com |
| **Standard Targeted** | Not documented |

**Assessment:** Hygraph has **no publicly documented accessibility commitment, statement, or VPAT**. This is a disqualifying factor for any procurement requiring ADA/WCAG compliance documentation.

#### Security Feature Analysis

| Feature | Details |
|---------|---------|
| **Certifications** | SOC 2 Type II (referenced in marketing) |
| **Content Model** | Structured, GraphQL-native schema |
| **Data Residency** | EU and US regions |

**Assessment:** Hygraph has adequate security foundations but the complete absence of accessibility documentation eliminates it from serious consideration.

#### Pros
- Strong GraphQL-native architecture
- Content Federation unique capability
- SOC 2 Type II

#### Cons
- **No accessibility statement, VPAT, or WCAG conformance claim** — disqualifying
- Smaller enterprise market presence
- Limited documentation on security specifics

---

## 4. Comparative Analysis

### 4.1 Side-by-Side Comparison Matrix

| Criterion | Contentstack | WordPress VIP | Contentful | Sanity | Hygraph |
|-----------|:------------:|:-------------:|:----------:|:------:|:-------:|
| **WCAG Target** | 2.2 AA | 2.2 AA | 2.1 AA | 2.1 A+AA | None |
| **Conformance Level** | Partial | Claims Full | Partial | Partial (78%) | Unknown |
| **VPAT Available** | Yes (2025) | Yes | On Request | Public Blog | No |
| **Last Accessibility Audit** | Ongoing | Ongoing | 2021 | 2022 | N/A |
| **Third-Party Audits** | Internal + External | Yes (Level Level, Equalize Digital) | External | Self + OpenACR | N/A |
| **Screen Reader Support** | NVDA, JAWS, VoiceOver | VoiceOver + ecosystem | JAWS, NVDA, VoiceOver | Implied | Unknown |
| **ISO 27001** | Yes | No | Yes (since 2019) | No | No |
| **SOC 2** | Type II | Type I (Type II pending) | Type II | Type II | Type II |
| **FedRAMP** | No | **Yes (Moderate)** | No | No | No |
| **HTML Sanitization** | Schema-enforced AST | wp_kses framework | Rich Text AST | Portable Text | GraphQL schema |
| **XSS Architecture** | API-delivered JSON | Multi-layer (validate→sanitize→escape) | API-delivered JSON | Portable Text serialization | API-delivered JSON |
| **CSP Support** | Front-end controlled | Platform-level config | Front-end controlled | Front-end controlled | Front-end controlled |
| **Bug Bounty** | Yes | Yes | Yes (PGP) | Yes | Unknown |
| **GDPR/CCPA** | Yes | Yes | Yes | Yes | Yes |
| **Encryption (at rest)** | AES-256 | AES-256 | AES-256 | Standard | Standard |
| **Enterprise Pricing** | ~$700+/mo (custom) | $2K-$5K+/mo | $33K-$81K+/yr | Custom | Custom |
| **Headless Architecture** | Native | Configurable | Native | Native | Native |
| **Plugin Ecosystem** | Moderate | **Massive (60K+)** | Large | Growing | Moderate |

### 4.2 Weighted Scoring (Scale: 1-5, Weight: Importance)

| Criterion | Weight | Contentstack | WordPress VIP | Contentful | Sanity |
|-----------|--------|:------------:|:-------------:|:----------:|:------:|
| WCAG Conformance Level | 25% | 4 | **5** | 3 | 2.5 |
| VPAT/Documentation Quality | 15% | **4.5** | 4 | 2.5 | 3.5 |
| Security Certifications | 20% | **4.5** | 4.5 | **5** | 3.5 |
| HTML/MD Sanitization | 15% | 4 | **5** | 4 | **5** |
| Enterprise Readiness | 10% | **5** | 4.5 | **5** | 4 |
| Cost-Effectiveness | 10% | 4 | 3 | 2 | **4.5** |
| Ecosystem/Integration | 5% | 3.5 | **5** | 4.5 | 3.5 |
| **WEIGHTED TOTAL** | **100%** | **4.23** | **4.43** | **3.55** | **3.48** |

> *Note: Hygraph excluded from scoring due to disqualifying accessibility gap.*

---

## 5. Final Recommendation

### Primary Recommendation: Contentstack + Complementary Security Tooling

**For organizations building new public-facing applications with a composable/headless architecture:**

Contentstack is recommended as the primary CMS platform for the following reasons:

1. **Forward-looking accessibility:** Targeting WCAG **2.2** AA (not just 2.1), with a published VPAT 2.5 (August 2025) — the most current compliance documentation among headless CMS vendors.

2. **Dual security certification:** SOC 2 Type II + ISO 27001 provides the strongest enterprise security foundation among headless options.

3. **Architectural XSS prevention:** Structured content models with API-delivered JSON eliminate stored XSS by design. Schema-level field validation prevents arbitrary HTML injection at the data layer.

4. **Full front-end control:** Headless architecture means zero platform-imposed accessibility barriers on the delivered experience. Teams can implement strict CSP headers, DOMPurify-based HTML sanitization, and full WCAG 2.2 AAA compliance without platform limitations.

5. **Procurement-ready:** Published VPAT, documented accessibility statement, enterprise-grade compliance certifications.

**Complementary tooling recommended:**
- **DOMPurify** (front-end HTML sanitization for any user-generated content)
- **Axe/Deque** (automated accessibility testing in CI/CD)
- **Siteimprove** or **Level Access** (ongoing accessibility monitoring)

### Secondary Recommendation: WordPress VIP

**For organizations with existing WordPress ecosystems, public-sector ADA Title II requirements, or content-heavy editorial workflows:**

WordPress VIP scores highest overall in our weighted analysis and is the strongest choice when:

1. The organization already has WordPress expertise
2. Public-sector ADA Title II compliance is required (FedRAMP Moderate authorization is unmatched)
3. The most mature HTML sanitization framework (wp_kses) is needed for heavy user-generated content
4. The massive accessibility plugin ecosystem provides value
5. Traditional CMS editing experience is preferred over headless

**The choice between Contentstack and WordPress VIP ultimately depends on:**

| Factor | Choose Contentstack | Choose WordPress VIP |
|--------|:-------------------:|:--------------------:|
| Architecture preference | Headless/composable | Traditional or hybrid |
| Existing tech stack | Modern JS frameworks | WordPress ecosystem |
| Compliance environment | Private sector enterprise | Government/public sector |
| HTML sanitization needs | API-delivered (low UGC risk) | Heavy UGC processing |
| Budget | Lower entry point | Higher budget available |
| Team expertise | Developer-led teams | Content/editorial-led teams |

---

## 6. Implementation Plan

### Phase 1: Foundation (Weeks 1-4)

| Week | Activity | Responsibility |
|------|----------|---------------|
| 1 | Vendor procurement: Execute MSA/DPA with chosen vendor; obtain VPAT and SOC 2 report under NDA | Legal, IT Procurement |
| 1-2 | Environment setup: Provision enterprise instance; configure SSO, RBAC, audit logging | Platform Engineering |
| 2-3 | Content model design: Define structured content types with accessibility metadata fields (alt text, ARIA labels, lang attributes) | Content Architecture, UX |
| 3-4 | Security configuration: Implement CSP headers, configure API rate limits, set up WAF rules | Security Engineering |
| 4 | Baseline accessibility audit: Run Axe/Lighthouse against CMS admin interface; document current state | Accessibility Lead |

### Phase 2: Integration & Development (Weeks 5-10)

| Week | Activity | Responsibility |
|------|----------|---------------|
| 5-6 | Front-end scaffolding: Build accessible component library conforming to WCAG 2.1 AA; integrate with CMS API | Front-End Engineering |
| 6-7 | HTML sanitization pipeline: Implement DOMPurify (front-end) and/or server-side sanitization middleware; configure allowed element/attribute allowlists | Security Engineering |
| 7-8 | Accessibility implementation: Semantic HTML, ARIA landmarks, focus management, skip navigation, color contrast, form labels, error handling | Front-End Engineering, UX |
| 8-9 | Assistive technology testing: Manual testing with NVDA (Windows), VoiceOver (macOS/iOS), JAWS (Windows); keyboard-only navigation testing | QA, Accessibility Lead |
| 9-10 | Security testing: Penetration test (HTML injection, XSS, CSRF); CSP violation monitoring setup; dependency vulnerability scanning (Snyk/Dependabot) | Security Engineering |

### Phase 3: Validation & Launch (Weeks 11-14)

| Week | Activity | Responsibility |
|------|----------|---------------|
| 11-12 | Third-party accessibility audit: Engage Deque, Level Access, or equivalent for independent WCAG 2.1 AA conformance testing | External Vendor |
| 12 | Remediation sprint: Address findings from accessibility audit and penetration test | Engineering |
| 13 | Generate internal VPAT/ACR: Document conformance level for the delivered application | Accessibility Lead |
| 13-14 | Staged rollout: Deploy to production with monitoring; CSP report-only mode → enforcement mode | DevOps, Security |
| 14 | Launch: Go-live with accessibility statement published on site | All Teams |

### Phase 4: Ongoing Monitoring (Continuous)

| Cadence | Activity | Responsibility |
|---------|----------|---------------|
| Weekly | Automated accessibility scans (Axe CI/CD integration) | Engineering |
| Monthly | CSP violation report review; dependency vulnerability review | Security |
| Quarterly | Manual accessibility regression testing with assistive technologies | QA, Accessibility |
| Bi-annually | Third-party accessibility re-audit | External Vendor |
| Annually | Vendor VPAT/ACR review; security certification renewal verification | IT Procurement, Security |
| Ongoing | User feedback monitoring for accessibility issues; remediation SLA tracking | Product, Support |

---

## 7. Appendices

### Appendix A: Vendor Compliance Documentation Links

| Vendor | Resource | URL |
|--------|----------|-----|
| Contentstack | Accessibility Statement | https://www.contentstack.com/docs/contentstack-accessibility-statement |
| Contentstack | VPAT 2.5 INT (Aug 2025) | https://assets.ctfassets.net/rvt0uslu5yqp/6ryyZoO94jPCurOLD0KmXA/e86abe8565cff92cbc43adad0d887e1b/VPAT_2.5_INT__August_2025_.pdf |
| Contentstack | Trust & Security | https://www.contentstack.com/trust |
| Contentstack | Security Addendum | https://www.contentstack.com/legal/security-addendum |
| WordPress VIP | Accessibility | https://wpvip.com/accessibility/ |
| WordPress VIP | Security Overview | https://wpvip.com/security/ |
| WordPress VIP | Security Documentation | https://docs.wpvip.com/security/ |
| WordPress VIP | HTML Sanitization Guide | https://docs.wpvip.com/security/validating-sanitizing-and-escaping/ |
| WordPress VIP | SOC 2 Announcement | https://wpvip.com/blog/soc2-type1-attestation/ |
| WordPress VIP | CSP Guide | https://wpvip.com/blog/content-security-policy-guide/ |
| Contentful | Accessibility Statement | https://www.contentful.com/help/accessibility-statement/ |
| Contentful | Security | https://www.contentful.com/security/ |
| Contentful | SOC 3 Public Report | https://assets-www.contentful.com/fo9twyrwpveg/1ejrRnXtE8Br0yHfAPAf9e/502996abc0572e794d8ffe9e035e6a1e/2025_-_Contentful_SOC_3_Final_Report.pdf |
| Contentful | ISO 27001 Certificate | https://assets.ctfassets.net/fo9twyrwpveg/5qZOGURlEIIhB7T5hCC1tI/11fd6a6b7d88809cc08fbc74113b60fb/2025.05.27_-_Contentful_ISO_27001_Certificate_Award.pdf |
| Sanity | Accessibility Statement | https://www.sanity.io/accessibility |
| Sanity | Accessibility Conformance Review Blog | https://www.sanity.io/blog/sanity-accessibility-conformance-review |
| Sanity | Enterprise (Security Info) | https://www.sanity.io/enterprise |

### Appendix B: Regulatory Context

| Regulation | Deadline | Standard | Impact |
|-----------|----------|----------|--------|
| ADA Title II (DOJ 2024 Rule) | **April 24, 2026** (populations >50K); April 24, 2027 (<50K) | WCAG 2.1 Level AA | State/local government web content and mobile apps |
| European Accessibility Act (EAA) | **June 28, 2025** | EN 301 549 (maps to WCAG 2.1 AA) | Products and services sold in EU |
| Section 508 (Revised) | Current | WCAG 2.0 AA (with 2.1 movement) | US federal government ICT |
| ADA Title III (Case Law) | Ongoing | Courts reference WCAG 2.1/2.2 AA | Private-sector public accommodations |

### Appendix C: Recommended Complementary Tools

| Category | Tool | Purpose |
|----------|------|---------|
| HTML Sanitization | DOMPurify | Client-side HTML sanitization for user-generated content |
| HTML Sanitization | sanitize-html (npm) | Server-side Node.js HTML sanitization with allowlists |
| Accessibility Testing | Axe-core (Deque) | Automated WCAG testing in CI/CD pipelines |
| Accessibility Testing | Pa11y | Command-line accessibility testing |
| Accessibility Monitoring | Siteimprove | Enterprise accessibility analytics and monitoring |
| Accessibility Monitoring | Level Access (AMP) | Continuous accessibility management platform |
| Security Monitoring | Snyk | Dependency vulnerability scanning |
| Security Monitoring | Report URI | CSP violation monitoring and reporting |
| Screen Readers | NVDA / JAWS / VoiceOver | Manual assistive technology testing |

### Appendix D: Key Definitions

- **VPAT (Voluntary Product Accessibility Template):** ITI-maintained template documenting ICT product accessibility conformance against WCAG, Section 508, and EN 301 549.
- **ACR (Accessibility Conformance Report):** The completed VPAT document specific to a product version.
- **WCAG 2.1 AA:** W3C standard with 50 success criteria across 4 principles (Perceivable, Operable, Understandable, Robust). Level AA is the standard referenced by ADA Title II and most legislation.
- **CSP (Content Security Policy):** HTTP response header that controls which resources browsers are allowed to load, mitigating XSS and data injection attacks.
- **AST (Abstract Syntax Tree):** Structured data representation of rich text content, as opposed to raw HTML strings. Used by Contentful and similar headless CMSs.
- **Portable Text:** Sanity's structured rich text format that stores content as an array of typed blocks, enabling safe serialization.

---

*Report prepared based on publicly available vendor documentation, accessibility statements, security pages, and VPAT/ACR documents as of February 2026. Vendor claims should be independently verified during procurement. This report does not constitute legal advice regarding ADA, Section 508, or EAA compliance obligations.*

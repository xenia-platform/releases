# Security policy

## Reporting a vulnerability

Report it privately, not in an issue: on this repository's **Security** tab, choose **Report a vulnerability** ([GitHub's private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability)). Only the maintainers see it.

Say what you found and how to reproduce it: the xenia version (`xenia --version`), the config or the part of it that matters, and the requests that show it. A proof of concept helps; a fix is not expected.

## What happens next

- We acknowledge the report within 3 working days, and say what we make of it within 10.
- A confirmed vulnerability gets a fix in a new release, an advisory on this repository with a CVE where one applies, and credit to you unless you prefer otherwise.
- We ask that you keep it private until the release is out, or for 90 days, whichever comes first.

## Supported versions

Fixes go into the newest minor version (`0.X`). Until 1.0, upgrading to it is the way to get them: earlier minors are not patched.

## Scope

Xenia itself, as published here and as `ofkindness/xenia` on Docker Hub: the server, its HTTP/1.1, HTTP/2 and TLS handling, the proxy and cache, the admin interface, and the config compiler. Vulnerabilities in a bundled library (see THIRD_PARTY_LICENSES) are in scope when xenia's use of it is affected; we then update the library in a new release.

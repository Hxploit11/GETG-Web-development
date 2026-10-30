# GETG GitHub Pages DNS setup

The confirmed primary domain is `getgusa.com`; `www.getgusa.com` redirects to it through GitHub Pages. The user confirmed this domain on October 30, 2026. HTTPS enforcement is enabled and the HTTPS site responds successfully.

## Where to edit DNS

As checked on October 30, 2026, `getgusa.com` uses `dns1.registrar-servers.com` and `dns2.registrar-servers.com`. Manage its records in Namecheap: Domain List → Manage → Advanced DNS.

## Website records

Use TTL **Automatic** in Namecheap, or the DNS provider's default TTL.

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | hxploit11.github.io |

These records apply to `getgusa.com`. Replace conflicting website records for `@` or `www` only when needed. The CNAME value contains no protocol, slash, or repository name. Leave unrelated records intact.

No IPv6 records are required. If IPv6 is desired, add all four AAAA records at `@`: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, and `2606:50c0:8003::153`. Remove any obsolete conflicting AAAA records.

## Preserve email

Keep existing MX, SPF, DKIM, DMARC, and other mail/service records. The website's public contact address remains `team@getg.com`; moving website hosting to `getgusa.com` does not change that mailbox or its domain. Website hosting does not create a mailbox.

## Finish HTTPS

HTTPS is enabled. View the confirmed domain and certificate state in [repository Pages settings](https://github.com/Hxploit11/GETG-Web-development/settings/pages). Future domain changes may require new DNS validation and certificate provisioning.

Check both English and Spanish pages and video playback at `https://getgusa.com`. The request form currently prepares an email draft addressed to `tom@sterlingbrandcleaners.com`; visitors must send it from their email application. The displayed contact email is `team@getg.com`.

References: [GitHub custom-domain setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [Namecheap host records](https://www.namecheap.com/support/knowledgebase/article.aspx/434/2237/how-do-i-set-up-host-records-for-a-domain/), [Namecheap nameservers](https://www.namecheap.com/support/knowledgebase/article.aspx/767/10/how-to-change-dns-for-a-domain/).

# GETG GitHub Pages DNS setup

The intended primary domain is `getg.com`; `www.getg.com` redirects to it through GitHub Pages.

## Where to edit DNS

As checked on October 30, 2026, the domain uses `a.dns.hostway.net` and `b.dns.hostway.net`. These nameservers make Hostway the active DNS provider, even if the domain registration is at Namecheap.

Apply the website records below at Hostway while these nameservers remain active. To manage DNS at Namecheap instead, first copy the complete existing DNS zone, including email records, into Namecheap's DNS service, then switch to Namecheap BasicDNS. Merely editing Namecheap Advanced DNS while Hostway nameservers remain active does not update the live domain.

## Website records

Use TTL **Automatic** in Namecheap, or the DNS provider's default TTL.

| Type | Host | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | hxploit11.github.io |

Replace the existing website A record (`66.113.184.143`) and any conflicting website records for `@` or `www`. The CNAME value contains no protocol, slash, or repository name. Leave unrelated records intact.

No IPv6 records are required. If IPv6 is desired, add all four AAAA records at `@`: `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, and `2606:50c0:8003::153`. Remove any obsolete conflicting AAAA records.

## Preserve email

Keep the existing MX, SPF, DKIM, DMARC, and other mail/service records. On the check date the public MX records were:

| Host | Priority | Mail server |
| --- | --- | --- |
| @ | 10 | getg.com.1.arsmtp.com |
| @ | 20 | getg.com.2.arsmtp.com |

These MX records are not a complete DNS-zone backup. Obtain the full zone from the current DNS provider before changing nameservers. Website hosting does not create a `team@getg.com` mailbox.

## Finish HTTPS

After DNS propagates, open [repository Pages settings](https://github.com/Hxploit11/GETG-Web-development/settings/pages), confirm the custom domain passes its DNS check, and enable **Enforce HTTPS** once available. GitHub documents that DNS propagation and HTTPS availability may each take up to 24 hours.

Check both English and Spanish pages and video playback at `https://getg.com`. The request form currently prepares an email draft addressed to `tom@sterlingbrandcleaners.com`; visitors must send it from their email application. The displayed contact email is `team@getg.com`.

References: [GitHub custom-domain setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site), [Namecheap host records](https://www.namecheap.com/support/knowledgebase/article.aspx/434/2237/how-do-i-set-up-host-records-for-a-domain/), [Namecheap nameservers](https://www.namecheap.com/support/knowledgebase/article.aspx/767/10/how-to-change-dns-for-a-domain/).

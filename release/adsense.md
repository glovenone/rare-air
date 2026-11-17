# AdSense preparation

Updated November 15, 2026, Asia/Shanghai.

## Review status

The owner requested AdSense preparation and review while keeping advertising disabled for visitors. The existing publisher account was originally accessed using the maintainer's glove identity. Its public publisher ID is `pub-3710260158761283`.

On November 15 the owner approved consolidating daily operations under the preferred happycoin identity, including the linked AdMob administrator permission shown by Google. The new administrator invitation was accepted and both happycoin and glove now appear as active administrators. The preferred identity was used to sign in and verify access to the same publisher's website list. The exact account routing and local evidence are maintained in the main checkout's ignored `release/private/preferred-account.md`.

Added `krillionunlimited.top`, deployed its ownership-verification meta tag on all nine public HTML pages, and published the account-authorized `/ads.txt` entry. AdSense confirmed site ownership and accepted the review request. The console displays **Getting ready** and **Review requested**. Approval remains pending.

The public `/ads.txt` response was verified in Chrome. A subsequent November 15 console check confirms its crawl status is now **Authorized**. The website itself remains in the requested-review state.

The console confirms both Auto ads and automatic optimization are disabled for this site. The live homepage contains zero ad-delivery scripts and zero ad units. The site uses the static verification method provided by Google. Advertising activation requires the owner's later instruction.

Cloudflare deployment `7c1fd38e-87a8-42e4-b48d-0d37b03747bc` contains the verification records. The source account identifier is maintained in `src/site-config.js`. The site build generates the verification tags and `public/ads.txt`. The mobile build strips these website records. Site and mobile builds, type checking, all 22 existing tests, repeated-build idempotency and mobile-package exclusion checks passed. The site regression checks verify the account tag, ads.txt content and absence of ad-delivery markup.

## Reserved manual ad unit

Created one responsive display unit in the same AdSense account.

- Name `RARE Air - Guide footer - Responsive`
- Slot ID `4161699649`
- Proposed placement at the end of a guide, after its main content
- Deployment state reserved in this release record

The slot name and proposed placement were selected during implementation. Its generated code is stored here for later activation. This Markdown file belongs to the repository's release records, outside the website's public assets.

```html
<script async
  src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3710260158761283"
  crossorigin="anonymous"></script>
<!-- RARE Air - Guide footer - Responsive -->
<ins class="adsbygoogle"
  style="display:block"
  data-ad-client="ca-pub-3710260158761283"
  data-ad-slot="4161699649"
  data-ad-format="auto"
  data-full-width-responsive="true"></ins>
<script>
  (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

When activation is requested, implement the unit through the website build with the applicable advertising consent controls, update the privacy policy, and verify its placement and loading behavior on desktop and mobile. The current website remains in verification-only mode.

## References and local receipts

- [Google's meta-tag verification method](https://support.google.com/adsense/answer/13996652)
- [Google's site-review status definitions](https://support.google.com/adsense/answer/12170222?hl=en)
- [Live ads.txt](https://krillionunlimited.top/ads.txt)
- Local console screenshots are stored in the ignored `release/private/adsense-20261115/` folder of the maintainer's main checkout.

## 2026-11-17T15:29:36+08:00 additional Google administrator

The owner confirmed administrator access for the requested additional Google identity. The RARE Air GA4 property and shared AdSense publisher show administrator access, with AdSense displaying active status. The shared publisher grant includes its associated sites and the linked AdMob access described by Google. Recipient details and verification screenshots are retained in ignored `release/private/google-access-20261117/`.

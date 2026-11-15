# AdSense preparation

Updated November 15, 2026, Asia/Shanghai.

## Review status

The owner requested AdSense preparation and review while keeping advertising disabled for visitors. The existing AdSense account in the happycoin Chrome profile belongs to `glovenone@gmail.com`. Its public publisher ID is `pub-3710260158761283`.

Added `krillionunlimited.top`, deployed its ownership-verification meta tag on all nine public HTML pages, and published the account-authorized `/ads.txt` entry. AdSense confirmed site ownership and accepted the review request. The console displays **Getting ready** and **Review requested**. Approval remains pending.

The public `/ads.txt` response was verified in Chrome. AdSense's separate ads.txt crawl status still displays **Not found** at the latest check and awaits Google's next crawl.

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

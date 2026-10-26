# Notebook Work Library

Notebook Work Library is a student resource website with class-wise subject pages, study materials, question banks, and exam papers.

- **Live website:** [dpsnwl.rf.gd](https://dpsnwl.rf.gd)
- **Website entry point:** [`index.html`](index.html)

## Developer handoff

This repository contains a mostly static website built with HTML, CSS, and JavaScript. There is no root-level package manifest or build configuration. Most pages are individual HTML files, and class-specific resources and assets are kept in the relevant class folders.

### Repository layout

- `index.html` — landing page and links to the class sections
- `1st/`–`12th/` — class pages and, where present, class-specific resources, images, scripts, manifests, and service workers
- `assets/` — shared site assets
- `images/` — images used by the landing page
- `Readme_images/` — screenshots used in this guide

Class folder contents are not uniform. Before adding or linking a page, check the relevant folder and follow its existing naming and asset-path conventions. Some filenames contain spaces; encode spaces as `%20` in Markdown links when needed.

### Preview locally

From the repository root, start a local web server:

```powershell
py -m http.server 8000
```

Open <http://localhost:8000> in your browser. Stop the server with `Ctrl+C`. Using localhost is preferable to opening HTML files directly because service workers and other browser features require an HTTP(S) origin.

### Change and test pages

1. Identify the page and any class-specific assets or scripts it uses.
2. Keep links relative to the page that contains them.
3. Preview each changed page locally on both desktop and a narrow/mobile viewport.
4. Test affected navigation, document downloads, and forms.
5. When changing a service worker or cached assets, verify the update in a clean browser session; an existing service worker may continue to serve cached files.

There is currently no automated build or test command configured at the repository root, so browser checks are the main validation step.

## Page structure

### Google Analytics and Google Tag Manager

The landing page loads Google Analytics and Google Tag Manager in its `<head>`. These scripts do not add visible page content; the configured analytics and tag-manager setup is used for site measurement.

Add the scripts near the start of the `<head>` in pages that need the same tracking. Avoid adding duplicate tracking snippets to a page. The IDs below belong to this site's current configuration; confirm they are still correct before changing them.

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-1Z8ES7LDYL"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-1Z8ES7LDYL');
</script>

<!-- Google Tag Manager -->
<script>
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','GTM-597CBPND');
</script>
<!-- End Google Tag Manager -->
```

The companion `<noscript>` block belongs immediately after the opening `<body>` tag, not in the `<head>`:

```html
<!-- Google Tag Manager (noscript) -->
<noscript>
  <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-597CBPND"
    height="0" width="0" style="display:none;visibility:hidden"></iframe>
</noscript>
<!-- End Google Tag Manager (noscript) -->
```

### Main content and section placement

The main page content is nested inside `#wrapper`, `#main`, and `.inner`. The banner is the first section. Add further sections—such as class links, feedback, or recruitment—after the banner and before the closing tags for `.inner` and `#main`.

The example below shows the banner content from the landing page:

```html
<!-- Wrapper -->
<div id="wrapper">
  <!-- Main -->
  <div id="main">
    <div class="inner">
      <!-- Header -->
      <header id="header"></header>

      <!-- Banner -->
      <section id="banner">
        <div class="content">
          <header>
            <h1>Welcome to Notebook Work Library</h1>
            <h2>by Mohd Hifzaan Khan</h2>
            <p>
              This website was originally designed for Class 10th students in the
              2025-26 academic session. It is currently being updated to serve
              Class 11th students and the new Class 10th cohort. The platform
              provides comprehensive question banks, school-conducted papers,
              and previous year questions aligned with CBSE curriculum standards.
              The website will be continuously updated with the latest CBSE
              question banks and examination papers as they are released. The
              current notebook materials are from the 2025-26 session; however,
              updates with the latest resources will be implemented promptly.
              We encourage you to visit regularly for the most recent educational
              materials and updates.
            </p>
          </header>

          <ul class="actions">
            <li>
              <a href="https://workhaul.my.canva.site/mhk" class="button big">
                Go to my old Website
              </a>
            </li>
          </ul>
        </div>

        <span class="image object">
          <img src="images/1.jpg" alt="" />
        </span>
      </section>

      <!-- Add other sections here, before .inner and #main are closed. -->
    </div>
  </div>
</div>
```

The banner appears like this:

![Screenshot of the landing page banner](Readme_images/image.png)

### “Choose Your Class” section

This section gives visitors class links using a heading and a set of cards. Add it after the banner, inside `.inner`, alongside the other page sections.

```html
<section>
  <header class="major">
    <h2>Choose Your Class!</h2>
  </header>

  <div class="container">
    <div class="box">
      <span></span>
      <div class="content">
        <h3><a href="12th/12th Home.html">Class 12th</a></h3>
        <p>Practice problems, step-by-step solutions, and past-paper drills to strengthen concepts.</p>
        <a href="12th/12th Home.html" style="box-shadow: none;">Read More</a>
      </div>
    </div>

    <div class="box">
      <span></span>
      <div class="content">
        <h3><a href="11th/11th Home.html">Class 11th</a></h3>
        <p>Practice problems, step-by-step solutions, and past-paper drills to strengthen concepts.</p>
        <a href="11th/11th Home.html" style="box-shadow: none;">Read More</a>
      </div>
    </div>

    <div class="box">
      <span></span>
      <div class="content">
        <h3><a href="10th/10thHome.html">Class 10th</a></h3>
        <p>Clear explanations, experiment summaries, and topic question banks for exam prep.</p>
        <a href="10th/10thHome.html" style="border: none; box-shadow: none;">Read More</a>
      </div>
    </div>

    <div class="box">
      <span></span>
      <div class="content">
        <h3><a href="9th/9thHome.html">Class 9th</a></h3>
        <p>Clear explanations, experiment summaries, and topic question banks for exam prep.</p>
        <a href="9th/9thHome.html" style="border: none; box-shadow: none;">Read More</a>
      </div>
    </div>
  </div>
</section>
```

The section heading uses `<header class="major">`. The `.container` holds the cards, and each `.box` is one class card. To add another class, duplicate a `.box` and update its title, description, and both links.

![Screenshot of the “Choose Your Class” section](Readme_images/image-1.png)

## Integrations and deployment notes

- The landing page contains analytics/tag-manager setup and a feedback form that submits to an external form service. Confirm these integrations are still intended and available before changing their configuration.
- The landing page also has a recruitment form posting to `/recruitment`. This repository does not include an obvious server application, so confirm that the production host handles this route before relying on the form.
- The landing page references a root-level web app manifest and service worker, but those files are not currently present in the repository root. Check whether they are supplied by the production host or need to be restored; class folders also contain their own PWA files.
- The live site is hosted separately from the source files. Confirm the current hosting account, deployment method, domain/DNS ownership, and any server-side routes with the site owner before publishing or changing production settings.

## Credits

The site uses the Editorial template by [HTML5 UP](https://html5up.net/editorial), licensed under [CC BY 3.0](https://html5up.net/license). Preserve the required attribution when modifying or redistributing the template-based design.

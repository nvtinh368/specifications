# Unblocked Emulator Specification

The Unblocked Emulator Specification defines a generic protocol to write Emulators plugins for automated browsers like Chrome and Firefox to render them undetectable by end-websites, and to allow a range of "user profiles" to be employed.

## Why is this needed?

There are amazing tools available like [Puppeteer](https://developers.google.com/web/tools/puppeteer/) and [Playwright](http://playwright.dev) to control automated web browsers. These tools allow for coding interactions with websites. However... as they're currently built, they can be detected by websites.

Headless Chrome is initialized with different services and features than headed Chrome (not to mention differences with Chromium vs Chrome). These differences can be detected along the spectrum of a web browser session - from TLS, to Http and the DOM. To find a detailed analysis of these differences, check out [Double Agent](https://github.com/unblocked-web/double-agent).

To scrape website data, scrapers also need to be able to rotate user attributes like User Agent, IP Address, Language, Geolocation, and even lower level attributes like the WebGL settings and Canvas output.

This Emulator Specification is a series of "hooks" that allow for reliably controlling these settings.

NOTE: Many settings are available within the regular Devtools Specification, but the browser must be appropriately "paused" at each step or the settings will be injected in time.

## Types of Emulators

This project defines two types of emulators - Browser and Human emulators.

### Emulator Lifecycle

Emulators are usually created with a unique instance per Scraping session. They define all the attributes that should be emulated.

### BrowserEmulator

A [BrowserEmulator](./IBrowserEmulator.ts) emulates the UserAgent, Geolocation, Timezone, Viewport, Proxy, and DNS for a Browser Window. The emulator will initiate all of the Chrome Devtools Protocol apis as well as mask any invalid methods and properties of the browsing session (Http, DOM, Network Stack, etc).

Browser Emulators must provide a mechanism (`selectBrowserMeta`) to choose a supported UserAgent and Browser "engine" (underlying Chrome process) that are supported.

### HumanEmulator

A [HumanEmulator](./IHumanEmulator.ts) controls how a Mouse and Keyboard should interact with a webpage in a manner that cannot be predicted and detected by a website.

## Hooks into a Browser

To reach the goal of emulating a human using a regular browser, the following "hooks" must be provided by an implementor:

### Browser

Browser level hooks are called at a Browser level.

#### onNewBrowser(browser, launchArgs)

Called anytime a new Browser will be launched. The hooking method (eg, [BrowserEmulator](./IBrowserEmulator.ts)) can manipulate the `browser.engine.launchArguments` to control Chrome launch arguments. A list can be found [here](https://peter.sh/experiments/chromium-command-line-switches/).

- browser: [`IBrowser`](./browser/IBrowser.ts) - a Browser instance. Do not manipulate beyond `launchArguments` unless you really know what you're doing.
- launchArgs: [`IBrowserLaunchArgs`](./browser/IBrowserLaunchArgs.ts) - arguments provided by a user or set in the environment that an emulator should use to appropriately set the `launchArguments`

NOTE: a new browser might be reused by an implementor, so you should not assume this method will be called one-to-one with your scraper sessions.

#### onNewBrowserContext(context)

Called anytime a new [BrowserContext](./browser/IBrowserContext.ts) has been created. A BrowserContext is the equivalent to a Chrome Incognito Window. This "hook" `Promise` will be resolved before any [Pages](./browser/IPage.ts) are created in the BrowserContext. This a mechanism to isolate the User Storage and Cookies for a scraping session.

- context: [`IBrowserContext`](./browser/IBrowserContext.ts) - a BrowserContext instance that has just been opened.

#### onDevtoolsPanelAttached(devtoolsSession)

Called anytime a new Devtools Window is opened for any Devtools Window in the Browser.

A [DevtoolsSession](./browser/IDevtoolsSession.ts) object has control to send and received any [Devtools Protocol APIs and Events](https://chromedevtools.github.io/devtools-protocol) supported by the given Browser.

- devtoolsSession: [`IDevtoolsSession`](./browser/IDevtoolsSession.ts) - a DevtoolsSession instance connected to the Devtools Panel.

NOTE: this only happens when a browser is launched into a Headed mode.

### BrowserContext

These hooks are called on an individual [BrowserContext](./browser/IBrowserContext.ts).

#### onNewPage(page)

Called anytime a new [Page](./browser/IPage.ts) will be opened. The hooking Method can perform Devtools API calls using `page.devtoolsSession`.

An implementor is expected to pause the Page and allow all [Devtools API](https://chromedevtools.github.io/devtools-protocol) calls and [Page scripts](https://chromedevtools.github.io/devtools-protocol/tot/Page/#method-addScriptToEvaluateOnNewDocument) to be registered before the Page will render. This is likely done by instructing Chrome to pause all new pages in the debugger by default. The debugger will be [resumed](https://chromedevtools.github.io/devtools-protocol/tot/Runtime/#method-runIfWaitingForDebugger) ONLY after all initialization API calls are sent.

- page: [IPage](./browser/IPage.ts) - the created page paused waiting for the debugger. NOTE: you should not expect to get responses to Devtools APIs before the debugger has resumed.

#### onNewWorker(worker)

Called anytime a new Service, Shared or Web [Worker](./browser/IWorker.ts) will be created. The hooking method can perform Devtools API calls using `worker.devtoolsSession`.

The Worker will be paused until hook methods are completed.

- worker: [IWorker](./browser/IWorker.ts) - the created worker.

#### onDevtoolsPanelAttached(devtoolsSession)

Called anytime a new Devtools Window is opened for a Page in this BrowserContext.

- devtoolsSession: [IDevtoolsSession](./browser/IDevtoolsSession.ts) - the connected DevtoolsSession instance.

NOTE: this only happens when a browser is launched into a Headed mode.

#### onDevtoolsPanelDetached(devtoolsSession)

Called anytime a new Devtools Window is closed for a Page in this BrowserContext.

- devtoolsSession: [IDevtoolsSession](./browser/IDevtoolsSession.ts) - the disconnected DevtoolsSession instance.

### Interact

Interaction hooks allow an emulator to control a series of interaction steps.

#### playInteractions(interactions, runFn, helper)

This hook allows a caller to manipulate the directed interaction commands to add an appearance of user interaction.

For instance, a scraper might provide instructions:

```js
[
  [
    { command: 'scroll', mousePosition: [0, 1050] },
    { command: 'click', mousePosition: [150, 150] },
  ],
];
```

An interaction hook could add timeouts and appear more human by breaking a scroll into smaller chunks.

```js
runFn({ command: 'scroll', mousePosition: [0, 500] });
runFn({ command: 'move', mousePosition: [0, 500] });
wait(100);
runFn({ command: 'scroll', mousePosition: [0, 1050] });
runFn({ command: 'move', mousePosition: [0, 1050] });
wait(100);
runFn({ command: 'click', mousePosition: [150, 150], delayMillis: 25 });
```

- interactions: [`IInteractionGroup[]`](./interact/IInteractions.ts). A group of steps that are used to control the browser. Steps are things like Click on an Element, Move the Mouse to Coordinates, etc.
- runFn: `function(interaction: IInteractionStep)`. A provided function that will perform the final interaction with the webpage.
- helper: [`IInteractionsHelper`](./interact/IInteractionsHelper.ts). A series of utility functions to calculate points and DOM Node locations.

#### beforeEachInteractionStep(step, isMouseCommand)

A callback run before each interaction step.

- interactionStep: [`IInteractionStep`](./interact/IInteractions.ts). The step being performed - things like Click on an Element, Move the Mouse to Coordinates, etc.
- isMouseCommand: `boolean`. Is this a mouse interaction step?

#### afterInteractionGroups()

A callback run after all interaction groups from a single `playInteractions` have completed.

#### adjustStartingMousePoint(point, helper)

A callback allowing an implementor to adjust the initial mouse position that will be visible to the webpage.

- point: [`IPoint`](./browser/IPoint.ts). The x,y coordinates to adjust.
- helper: [`IInteractionsHelper`](./interact/IInteractionsHelper.ts). A series of utility functions to calculate points and DOM Node locations.

### Network

Network hooks allow an emulator to control settings and configurations along the TCP -> TLS -> HTTP/2 stack.

#### onDnsConfiguration(settings)

Change the DNS over TLS configuration for a session. This will be called once during setup of a [`BrowserContext`](./browser/IBrowserContext.ts).

Chrome browsers will use the DNS over TLS configuration of your DNS host if it's supported (eg, CloudFlare, Google DNS, Quad9, etc). This setting can help mimic that usage.

Hook methods can manipulate the settings object to control the way the network stack will look up DNS requests.

- settings: [`IDnsSettings`](./net/IDnsSettings.ts). DNS Settings that can be configured.
  - dnsOverTlsConnection `tls.ConnectionOptions`. TLS settings used to connect to the desired DNS Over TLS provider. Usually just a `host` and `port`.
  - useUpstreamProxy `boolean`. Whether to dial DNS requests over the upstreamProxy (if configured). This setting determines if DNS is resolved from the host machine location or the remote location of the proxy endpoint.

#### onTcpConfiguration(settings)

Change TCP settings for all Sockets created to serve webpage requests. This configuration will be called once during setup of a [`BrowserContext`](./browser/IBrowserContext.ts).

Different Operating Systems exhibit unique TCP characteristics that can be used to identify when a browser says it's running on Windows 8, but shows TCP indicators that indicate it's actually running on Linux.

- settings: [`ITcpSettings`](./net/ITcpSettings.ts). TCP Settings that can be configured.
  - tcpWindowSize `number`. Set the "WindowSize" used in TCP (max number of bytes that can be sent before an ACK must be received). NOTE: some operating systems use sliding windows. So this will just be a starting point.
  - tcpTtl `number`. Set the "TTL" of TCP packets.

#### onTlsConfiguration(settings)

Change TLS settings for all secure Sockets created to serve webpage requests. This configuration will be called once per [`BrowserContext`](./browser/IBrowserContext.ts).

Different Browsers (and sometimes versions) will present specific order and values for TLS ClientHello Ciphers, Extensions, Padding and other attributes. Because these values do not change for a specific version of a Browser, they're an easy way to pickup when a request says it's Chrome 97, but is actually coming from Node.js.

- settings: [`ITlsSettings`](./net/ITlsSettings.ts). TLS Settings that can be configured.
  - tlsClientHelloId `string`. A ClientHelloId that will be mimicked. This currently maps to [uTLS](https://github.com/refraction-networking/utls) values.
  - socketsPerOrigin `number`. The number of sockets to allocate before re-use for each Origin. This should mimic the source Browser settings.

#### onHttpAgentInitialized(agent)

Callback hook called after the network stack has been initialized. This configuration will be called once per [`BrowserContext`](./browser/IBrowserContext.ts).

This function can be useful to do any post setup lookup (eg, to determine the public IP allocated by a proxy URL).

- agent: [`IHttpSocketAgent`](./net/IHttpSocketAgent.ts). The agent that has been initialized. This object will expose a method to initialize a new Socket (ie, to dial an IP lookup service).

#### onHttp2SessionConnect(request, settings)

Callback to manipulate the HTTP2 settings used to initialize a conversation.

Browsers and versions send specific HTTP2 settings that remain true across all operating systems and clean installations.

- request: [`IHttpResourceLoadDetails`](./net/IHttpResourceLoadDetails.ts). The request being made.
- settings: [`IHttp2ConnectSettings`](./net/IHttp2ConnectSettings.ts). Settings that can be adjusted.
  - localWindowSize `number`. The HTTP2 initial window size to use.
  - settings `http2.Settings`. A node.js http2 module Settings object. It can be manipulated to change the settings sent to create an HTTP connection.

#### beforeHttpRequest(request)

Callback before each HTTP request. This hook provides the opportunity to manipulate or bypass each request before it's sent on to the destination URL.

Browsers and versions send specific HTTP header values and order that are consistent by Resource Type, Origin, Cookie status, and more. An emulator should ensure headers are correct before a request is sent.

- request: [`IHttpResourceLoadDetails`](./net/IHttpResourceLoadDetails.ts). The request being made. Details listed below are relevant to headers.
  - url: `URL`. The full destination URL.
  - isServerHttp2: `boolean`. Is this an HTTP2 request (the headers are different for HTTP/1 and 2).
  - method: `string`. The http method.
  - requestHeaders: `IncomingHeaders`. The headers that should be manipulated.
  - resourceType: [`IResourceType`](./net/IResourceType.ts). The type of resource being requested.
  - originType: [`OriginType`](./net/OriginType.ts). The type of origin (`none`,`same-origin`,`same-site`,`cross-site`).

#### beforeHttpResponse(resource)

Callback before sending an HTTP response to the Browser. This can be used to track cookies on response, or implement a caching layer (ie, by tracking cache headers and sending on http request, then intercepting 304 response and sending a 200 + body).

- resource: [`IHttpResourceLoadDetails`](./net/IHttpResourceLoadDetails.ts). The HTTP request with a response available.

#### websiteHasFirstPartyInteraction(url)

Callback after a Domain has had a First-Party User Interaction.

Some Browsers have implemented rules that Cookies cannot be set for a Domain until a user has explicitly loaded that site (it can also impact things like referer headers). This was put in place to avoid the technique to redirect a user through an ad tracking network as a way to set tracking cookies. To properly simulate cookies and headers, this method will help identify when a browser considers a Domain to have received first party interaction.

- url: `URL`. The page that has been interacted with.

## Project Structure

- `/hooks` The hooks available to an emulator or "hook" provider.
- `/browser` The Browser, Page, BrowserContext, Frame and more that will be passed into the different "hooks".
- `/net` Network interfaces passed into the "hooks".
- `/interact` Interaction interface passed into the "hooks".

## Shrink Me Over Time

This set of interfaces was initially extracted from the SecretAgent project (https://github.com/unblocked-web/secret-agent). As such, it has too broad a spec. It should be whittled down over time.

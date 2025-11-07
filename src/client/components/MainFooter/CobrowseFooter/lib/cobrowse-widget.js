/*
 * The CobrowseWidget code is kept as much as is.
 * It was developed separately and is used without modification on amsterdam.nl.
 * Addition:
 * The loading of the cobrowseIO script is delayed until the user needs it (on clicking the schermdelen footer button).
 * The localStorage is used to persist the cobrowse session to allow navigating between pages.
 */

const translations = {
  nl: {
    request_share: 'Verzoek om deze pagina te delen',
    consent_message: 'Wij willen tijdelijk met u meekijken op deze pagina.',
    session_ended: 'Het schermdelen is gestopt',
    session_ended_message:
      'Wilde u het schermdelen niet stoppen? Druk op de knop voor een nieuwe verbindingscode. Geef deze code aan de medewerker, met wie u belt.',
    help_by_sharing: 'Hulp via schermdelen',
    help_message:
      'Bel 14 020 en druk op ‘Ontvang verbindingscode’. Deze code krijgt u te zien op uw scherm en geeft u aan onze medewerker. Hij ziet alleen wat u laat zien en helpt u veilig verder.',
    stop_sharing: 'Stop schermdelen',
    close: 'Sluiten',
    allow: 'Toestaan',
    reject: 'Afwijzen',
    your_code: 'Uw verbindingscode is:',
    generate_code: 'Ontvang uw verbindingscode',
  },
};

export class CobrowseWidget {
  constructor(licenseKey, language = 'nl') {
    this.licenseKey = licenseKey;
    this.language = language;
    this.translations = translations;
    // If this localStorage value is present, we assume that a recent cobrowse session was initiated
    // and not ended. Therefore we allow cobrowse to be loaded immediately
    const hasCobrowseWidgetSession =
      localStorage.getItem('_cobrowse_widget_session') ?? null;

    if (hasCobrowseWidgetSession) {
      this.init();
    }
    this.initializeWidget();
  }

  async loadCobrowseSDK() {
    if (window.CobrowseIO) return window.CobrowseIO;
    try {
      const script = document.createElement('script');
      script.src = 'https://js.cobrowse.io/CobrowseIO.js';
      script.async = true;
      script.crossOrigin = 'anonymous';

      return new Promise((resolve, reject) => {
        script.onload = () => resolve(window.CobrowseIO);
        script.onerror = () => reject(new Error('Failed to load Cobrowse SDK'));
        document.head.appendChild(script);
      });
    } catch (error) {
      console.error('Error loading Cobrowse SDK:', error);
    }
  }
  async init() {
    const CobrowseIO = await this.loadCobrowseSDK();
    CobrowseIO.license = this.licenseKey;
    if (!CobrowseIO.redactedViews) {
      CobrowseIO.redactedViews = ['.cobrowse-redacted'];
    }
    this.CobrowseIO = CobrowseIO;
    this.originalTitle = document.title;

    // Ensure Cobrowse is loaded before starting
    CobrowseIO.client().then(async () => {
      await this.CobrowseIO.start();
      // If the cobrowse session is not active, remove the widget session
      if (!this.CobrowseIO.currentSession) {
        localStorage.removeItem('_cobrowse_widget_session');
      }
      this.setupSessionControls();
    });

    // Modal to accept the connection to the agent
    CobrowseIO.confirmSession = async () =>
      this.showConsentDialog(
        this.translations[this.language].request_share,
        this.translations[this.language].consent_message
      );

    CobrowseIO.on('session.updated', (session) => {
      if (session.isActive?.()) {
        localStorage.setItem(
          '_cobrowse_widget_session',
          JSON.stringify({
            id: session.id?.(),
            state: session.state?.(),
          })
        );
      }
    });

    // After screen share is done, remove the frame and button
    CobrowseIO.on('session.ended', () => {
      localStorage.removeItem('_cobrowse_widget_session');
      this.hideModal(this.sessionCodeContainer);
      this.sessionCodeContainer = null;
      this.removeCobrowseFrame();
      this.displaySessionCodeModal('', true);
    });
  }

  initializeWidget() {
    document
      .getElementById('startCobrowseButton')
      ?.addEventListener('click', () => {
        this.startSession();
      });
    document.addEventListener('keydown', (e) => {
      if (e.shiftKey && e.code === 'Digit6') {
        this.startSession();
      }
    });
  }

  setupSessionControls() {
    this.createSharingBanner();
    this.CobrowseIO.showSessionControls = this.showSessionControls.bind(this);
    this.CobrowseIO.hideSessionControls = this.hideSessionControls.bind(this);
  }

  createStopButton() {
    const button = document.createElement('div');
    button.className =
      '__cbio_ignored cobrowse-wrapper stop-cobrowse-button cobrowse-button';
    button.textContent = this.translations[this.language].stop_sharing;
    button.addEventListener('click', () => {
      if (this.CobrowseIO.currentSession) {
        this.endSession();
      }
    });
    return button;
  }

  createCobrowseFrame() {
    if (document.getElementById('cobrowse-frame')) return;

    const frame = document.createElement('div');
    frame.id = 'cobrowse-frame';
    document.body.appendChild(frame);
  }

  removeCobrowseFrame() {
    const frame = document.getElementById('cobrowse-frame');
    if (frame) {
      frame.remove();
    }
  }

  showSessionControls() {
    this.createCobrowseFrame();
    document.title = '🔴 ' + this.originalTitle;
    document.body.style.paddingTop = `48px`;
    this.sharingBanner.style.display = 'block';
  }

  hideSessionControls() {
    this.sharingBanner.style.display = 'none';
    document.body.style.paddingTop = '0';
    document.title = this.originalTitle;
    this.removeCobrowseFrame();
  }

  createSharingBanner() {
    this.sharingBanner = document.createElement('div');
    this.sharingBanner.className = 'cobrowse-sharing-banner';
    this.sharingBanner.style.display = 'none'; // Hide sharing banner by default
    const stopButton = this.createStopButton();
    this.sharingBanner.appendChild(stopButton);
    document.body.insertBefore(this.sharingBanner, document.body.firstChild);
  }

  async startSession() {
    if (!this.sessionCodeContainer) {
      this.init();
      this.displaySessionCodeModal('');
    }
  }

  displaySessionCodeModal(code, stopped = null) {
    this.sessionCodeContainer = document.createElement('div');
    this.sessionCodeContainer.classList.add('cobrowse-wrapper');
    const title = stopped
      ? this.translations[this.language].session_ended
      : this.translations[this.language].help_by_sharing;

    const description = stopped
      ? this.translations[this.language].session_ended_message
      : this.translations[this.language].help_message;
    // eslint-disable-next-line no-magic-numbers
    code = code.slice(0, 3) + '-' + code.slice(3);

    this.sessionCodeContainer.innerHTML = this.sessionCodeContent(
      title,
      description,
      code,
      stopped
    );

    this.sessionCodeContainer
      .querySelector('#closeButton')
      .addEventListener('click', () => {
        this.hideModal(this.sessionCodeContainer);
        this.sessionCodeContainer = null;
      });

    this.sessionCodeContainer
      .querySelector('#generateButton')
      .addEventListener('click', async () => {
        const frame = document.getElementById('cobrowse-frame');
        if (!frame) {
          let code = await this.createSessionCode();
          // eslint-disable-next-line no-magic-numbers
          code = code.slice(0, 3) + '-' + code.slice(3);
          document.getElementById('sessionCode').innerHTML = code;
          document.getElementById('codeContainer').style.display = 'block';
        } else {
          console.log('There is an active session already.');
        }
      });

    document.body.appendChild(this.sessionCodeContainer);
  }
  async createSessionCode() {
    return this.CobrowseIO.createSessionCode();
  }

  sessionCodeContent(title, text, code, stopped = null) {
    const generateButtonClass =
      stopped === true ? 'secondary-button' : 'blue-button';
    const closeButtonClass =
      stopped === true ? 'blue-button' : 'secondary-button';
    const buttons = `
      <button class="${generateButtonClass} cobrowse-button" id="generateButton">${
        this.translations[this.language].generate_code
      }</button>
      <div id="codeContainer">
          <div class="modal-body">${
            this.translations[this.language].your_code
          }</div>
          <div id="sessionCode">${code}</div>
      </div>
      <div>
          <button id="closeButton" class="${closeButtonClass} cobrowse-button">${
            this.translations[this.language].close
          }</button>
      </div>`;
    return this.createModal(title, text, buttons);
  }

  showConsentDialog(title, description) {
    this.hideModal(this.sessionCodeContainer);
    this.sessionCodeContainer = null;
    const container = document.createElement('div');
    container.classList.add('cobrowse-wrapper');
    return new Promise((resolve) => {
      container.innerHTML = this.consentContent(title, description);
      container
        .querySelector('.cobrowse-allow')
        .addEventListener('click', () => {
          resolve(true);
          this.hideModal(container);
        });
      container
        .querySelector('.cobrowse-deny')
        .addEventListener('click', () => {
          resolve(false);
          this.hideModal(container);
        });
      document.body.appendChild(container);
    });
  }

  consentContent(title, description) {
    const buttons = `
        <div>
            <button class="cobrowse-allow blue-button cobrowse-button">${
              this.translations[this.language].allow
            }</button>
            <button class="cobrowse-deny tertiary-button cobrowse-button" style="padding:10px;">${
              this.translations[this.language].reject
            }</button>
        </div>`;
    return this.createModal(title, description, buttons);
  }

  createModal(title, description, buttons) {
    return `
      <div class="modal-background">
          <div class="modal-content">
          <div class="modal-body-container"> 
              <div class="modal-heading"><b>${title}</b></div>
                  <div class="modal-body">${description}</div>
                  ${buttons}
              </div>
          </div>
      </div>`;
  }

  async endSession() {
    if (this.CobrowseIO.currentSession) {
      await this.CobrowseIO.currentSession.end();
    }
  }

  hideModal(container) {
    if (container?.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

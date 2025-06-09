export default {
  common: {
    back: 'Back',
    submit: 'Submit',
    reset: 'Reset',
  },
  index: {
    congratulations: 'Congratulations!',
    subtitle: "You're just a few steps away from setting up your digital signage.",
    instructions:
      'To complete the setup, choose whether to configure the device as a standalone unit or manage it centrally via <span class="brand-font">DOTYKER CMS</span>.',
    standalone: 'Standalone',
    managed: 'Managed',
    docs: 'Documentation',
    pwaWarn:
      '<span class="brand-font">DOTYKER</span> is currently running in your browser. To access all features, please install the Electron desktop application.',
  },
  standaloneWizard: {
    interactive: {
      label: 'Interactive Modes',
      multiApp: 'Multi App',
      singleApp: 'Single App',
      publicBrowser: {
        name: 'Public Browser',
        defaultUrlLabel: 'Home Page URL',
        defaultUrlHint: 'Default website shown on start and home button',
        whitelistLabel: 'Whitelisted URL addresses',
        whitelistHint: 'Restrict URL addresses that can be visited',
        whitelistUrlPlaceholder: 'https://example.com',
      },
    },
    nonInteractive: {
      label: 'Noninteractive Modes',
      staticApp: 'Static App',
      webPlaylist: 'Web Playlist',
      mediaPlaylist: 'Media Playlist',
    },
    colorTheme: 'Color Theme',
    name: 'Device name',
    nameDescription: 'Device name shown in administration',
  },
}
